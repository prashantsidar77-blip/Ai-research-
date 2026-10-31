package com.jarvis.assistant.viewmodel

import android.app.Application
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.jarvis.assistant.JarvisApplication
import com.jarvis.assistant.data.actions.AndroidActionManager
import com.jarvis.assistant.data.actions.DeviceStatus
import com.jarvis.assistant.data.ai.GeminiRepository
import com.jarvis.assistant.data.db.MemoryEntity
import com.jarvis.assistant.data.voice.TextToSpeechManager
import com.jarvis.assistant.data.voice.VoiceManager
import com.jarvis.assistant.data.voice.VoiceState
import com.jarvis.assistant.service.FloatingAssistantService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val actionExecuted: String? = null
)

class AssistantViewModel(application: Application) : AndroidViewModel(application) {

    private val context: Context get() = getApplication()
    private val app = application as JarvisApplication
    private val memoryDao = app.database.memoryDao()
    private val settingsRepo = app.settingsRepository

    // Services & Repositories
    val actionManager = AndroidActionManager(context)
    val voiceManager = VoiceManager(context)
    val ttsManager = TextToSpeechManager(context)
    private val geminiRepo = GeminiRepository {
        // Safe key provider: reads from BuildConfig or user-configured secret
        ""
    }

    // Chat State
    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                text = "JARVIS systems initialized. Running on Android 16 with overlay bubble and Room memory ready. How may I serve you today, Sir?",
                isUser = false
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    // Permissions State
    private val _hasOverlayPermission = MutableStateFlow(false)
    val hasOverlayPermission: StateFlow<Boolean> = _hasOverlayPermission.asStateFlow()

    private val _hasMicPermission = MutableStateFlow(false)
    val hasMicPermission: StateFlow<Boolean> = _hasMicPermission.asStateFlow()

    private val _hasNotificationPermission = MutableStateFlow(false)
    val hasNotificationPermission: StateFlow<Boolean> = _hasNotificationPermission.asStateFlow()

    private val _isServiceActive = MutableStateFlow(false)
    val isServiceActive: StateFlow<Boolean> = _isServiceActive.asStateFlow()

    // Room Memory Flow
    val memories: StateFlow<List<MemoryEntity>> = memoryDao.getAllMemories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Settings Flows
    val currentLanguage: StateFlow<String> = settingsRepo.languageFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "en-IN")

    val currentModel: StateFlow<String> = settingsRepo.modelFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "gemini-2.5-flash")

    val speechSpeed: StateFlow<Float> = settingsRepo.speechSpeedFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1.0f)

    // Device Status
    private val _deviceStatus = MutableStateFlow(actionManager.getDeviceStatus())
    val deviceStatus: StateFlow<DeviceStatus> = _deviceStatus.asStateFlow()

    init {
        refreshPermissions()
        observeVoice()
    }

    fun refreshPermissions() {
        _hasOverlayPermission.value = Settings.canDrawOverlays(context)
        _hasMicPermission.value = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        _hasNotificationPermission.value = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }

        _deviceStatus.value = actionManager.getDeviceStatus()
    }

    private fun observeVoice() {
        viewModelScope.launch {
            voiceManager.voiceState.collect { state ->
                when (state) {
                    is VoiceState.Success -> {
                        sendMessage(state.recognizedText)
                    }
                    else -> {}
                }
            }
        }
    }

    fun sendMessage(userText: String) {
        val trimmed = userText.trim()
        if (trimmed.isEmpty()) return

        val userMsg = ChatMessage(text = trimmed, isUser = true)
        _messages.value = _messages.value + userMsg

        _isGenerating.value = true

        viewModelScope.launch {
            val language = currentLanguage.value
            val history = _messages.value.map {
                (if (it.isUser) "user" else "model") to it.text
            }
            val memoryList = memories.value

            val result = geminiRepo.generateResponse(
                prompt = trimmed,
                history = history,
                memories = memoryList,
                modelName = currentModel.value
            )

            _isGenerating.value = false

            val reply = result.getOrElse { error ->
                "Neural response failure: ${error.message ?: "Unknown error"}. Local services operational."
            }

            // Check if response contains system action
            val actionTag = parseAndExecuteAction(reply)
            val cleanReply = stripActionTags(reply)

            val botMsg = ChatMessage(
                text = cleanReply,
                isUser = false,
                actionExecuted = actionTag
            )
            _messages.value = _messages.value + botMsg

            // Speak response via TextToSpeech
            ttsManager.speak(cleanReply, language)
        }
    }

    private fun parseAndExecuteAction(text: String): String? {
        val openAppRegex = Regex("\\[ACTION:OPEN_APP app=\"(.*?)\"\\]")
        val alarmRegex = Regex("\\[ACTION:SET_ALARM time=\"(.*?)\"\\]")
        val memoryRegex = Regex("\\[ACTION:SAVE_MEMORY text=\"(.*?)\" category=\"(.*?)\"\\]")

        openAppRegex.find(text)?.let {
            val app = it.groupValues[1]
            actionManager.openApp(app)
            return "Launched app: $app"
        }

        alarmRegex.find(text)?.let {
            val time = it.groupValues[1]
            return "Alarm scheduled for $time"
        }

        memoryRegex.find(text)?.let {
            val content = it.groupValues[1]
            val category = it.groupValues[2]
            saveMemory(category, content)
            return "Saved to Memory Vault ($category)"
        }

        return null
    }

    private fun stripActionTags(text: String): String {
        return text.replace(Regex("\\[ACTION:.*?\\]"), "").trim()
    }

    fun startListening() {
        val lang = currentLanguage.value
        voiceManager.startListening(lang)
    }

    fun stopListening() {
        voiceManager.stopListening()
    }

    fun stopSpeaking() {
        ttsManager.stop()
    }

    fun clearChat() {
        _messages.value = emptyList()
        ttsManager.stop()
    }

    // Memory Operations
    fun saveMemory(category: String, content: String) {
        viewModelScope.launch {
            memoryDao.insertMemory(
                MemoryEntity(category = category, content = content)
            )
        }
    }

    fun deleteMemory(memory: MemoryEntity) {
        viewModelScope.launch {
            memoryDao.deleteMemory(memory)
        }
    }

    fun clearAllMemories() {
        viewModelScope.launch {
            memoryDao.clearAllMemories()
        }
    }

    // Service & Bubble Control
    fun startFloatingService() {
        if (!Settings.canDrawOverlays(context)) {
            requestOverlayPermission()
            return
        }
        FloatingAssistantService.start(context)
        _isServiceActive.value = true
    }

    fun stopFloatingService() {
        FloatingAssistantService.stop(context)
        _isServiceActive.value = false
    }

    fun hideBubble() {
        val intent = Intent(context, FloatingAssistantService::class.java).apply {
            action = FloatingAssistantService.ACTION_HIDE_BUBBLE
        }
        context.startService(intent)
    }

    fun restoreBubble() {
        val intent = Intent(context, FloatingAssistantService::class.java).apply {
            action = FloatingAssistantService.ACTION_SHOW_BUBBLE
        }
        context.startService(intent)
    }

    fun requestOverlayPermission() {
        actionManager.openOverlaySettings()
    }

    // Settings Updates
    fun setLanguage(lang: String) {
        viewModelScope.launch { settingsRepo.setLanguage(lang) }
    }

    fun setModel(model: String) {
        viewModelScope.launch { settingsRepo.setModel(model) }
    }

    fun setSpeed(speed: Float) {
        viewModelScope.launch {
            settingsRepo.setSpeechSpeed(speed)
            ttsManager.setSpeed(speed)
        }
    }

    override fun onCleared() {
        ttsManager.shutdown()
        voiceManager.stopListening()
        super.onCleared()
    }
}
