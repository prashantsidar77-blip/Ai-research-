package com.jarvis.assistant.data.ai

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.jarvis.assistant.data.db.MemoryEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext

/**
 * Repository for Gemini AI interaction.
 * Uses official Google GenAI Android SDK with support for Hindi/English bilingual dialogue,
 * system instructions, and memory injection.
 */
class GeminiRepository(private val apiKeyProvider: () -> String) {

    private fun getModel(modelName: String = "gemini-2.5-flash", memories: List<MemoryEntity> = emptyList()): GenerativeModel {
        val memoryContext = if (memories.isNotEmpty()) {
            "\n\n[USER MEMORY VAULT]:\n" + memories.joinToString("\n") { "- [${it.category}]: ${it.content}" }
        } else ""

        val systemInstruction = """
            You are JARVIS, an advanced, ultra-responsive native Android AI assistant.
            You possess deep knowledge of Android system tools, intents, and real-time utilities.
            You seamlessly speak and comprehend Hindi (hi-IN) and English (en-IN).
            Always match the user's chosen language or conversational code-switching (Hinglish).
            Keep spoken replies punchy, elegant, and action-oriented.
            When the user requests an Android device action (such as opening an app, setting an alarm, or toggling settings), output standard command tags:
            - [ACTION:OPEN_APP app="..."]
            - [ACTION:SET_ALARM time="..."]
            - [ACTION:SET_REMINDER text="..." time="..."]
            - [ACTION:SAVE_MEMORY text="..." category="..."]
            - [ACTION:OPEN_SETTINGS section="..."]
            $memoryContext
        """.trimIndent()

        return GenerativeModel(
            modelName = modelName,
            apiKey = apiKeyProvider(),
            systemInstruction = content { text(systemInstruction) }
        )
    }

    suspend fun generateResponse(
        prompt: String,
        history: List<Pair<String, String>>,
        memories: List<MemoryEntity>,
        modelName: String = "gemini-2.5-flash"
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val key = apiKeyProvider()
            if (key.isBlank()) {
                return@withContext Result.success(
                    "JARVIS Standby: API key is not configured. Local device systems, bubble overlay, and memory manager remain fully functional."
                )
            }
            val generativeModel = getModel(modelName, memories)
            val chat = generativeModel.startChat(
                history = history.map { (role, msg) ->
                    content(role) { text(msg) }
                }
            )
            val response = chat.sendMessage(prompt)
            Result.success(response.text ?: "I am ready for your command, Sir.")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun streamResponse(
        prompt: String,
        history: List<Pair<String, String>>,
        memories: List<MemoryEntity>,
        modelName: String = "gemini-2.5-flash"
    ): Flow<String> = flow {
        val key = apiKeyProvider()
        if (key.isBlank()) {
            emit("JARVIS: API key required for neural uplink. Operating on local offline core.")
            return@flow
        }
        val generativeModel = getModel(modelName, memories)
        val chat = generativeModel.startChat(
            history = history.map { (role, msg) ->
                content(role) { text(msg) }
            }
        )
        chat.sendMessageStream(prompt).collect { chunk ->
            chunk.text?.let { emit(it) }
        }
    }
}
