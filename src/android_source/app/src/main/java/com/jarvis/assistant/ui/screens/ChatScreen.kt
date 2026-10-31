package com.jarvis.assistant.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.assistant.data.voice.VoiceState
import com.jarvis.assistant.ui.components.JarvisCoreAnimation
import com.jarvis.assistant.ui.theme.*
import com.jarvis.assistant.viewmodel.AssistantViewModel
import com.jarvis.assistant.viewmodel.ChatMessage

/**
 * Premium Futuristic JARVIS Chat Screen.
 * Displays the animated circular AI core, voice waveform indicator,
 * context-aware chat conversation list, and voice control bar.
 */
@Composable
fun ChatScreen(viewModel: AssistantViewModel) {
    val messages by viewModel.messages.collectAsState()
    val isGenerating by viewModel.isGenerating.collectAsState()
    val voiceState by viewModel.voiceManager.voiceState.collectAsState()
    val isSpeaking by viewModel.ttsManager.isSpeaking.collectAsState()
    val rmsDb by viewModel.voiceManager.rmsDb.collectAsState()

    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(JarvisDeepBlack)
            .padding(horizontal = 16.dp)
    ) {
        // Top JARVIS Core Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp, bottom = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                JarvisCoreAnimation(
                    size = 130.dp,
                    isActive = true,
                    isSpeaking = isSpeaking,
                    rmsDb = rmsDb
                )

                Spacer(modifier = Modifier.height(6.dp))

                val statusText = when {
                    voiceState is VoiceState.Listening -> "LISTENING (Speak in Hindi or English)..."
                    voiceState is VoiceState.Processing -> "SYNTHESIZING NEURAL PATTERNS..."
                    isSpeaking -> "VOCALIZING RESPONSE..."
                    isGenerating -> "COMPUTING WITH GEMINI CORE..."
                    else -> "JARVIS ONLINE • AWAITING COMMAND"
                }

                Text(
                    text = statusText,
                    color = if (voiceState is VoiceState.Listening) JarvisCyanElectric else JarvisCyanPrimary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.2.sp
                )
            }
        }

        // Chat Message History
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                ChatBubble(msg)
            }

            if (isGenerating) {
                item {
                    ThinkingIndicator()
                }
            }
        }

        // Voice Speaking Stop Strip (shows when JARVIS is actively speaking)
        AnimatedVisibility(
            visible = isSpeaking,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(JarvisBlueGlow.copy(alpha = 0.2f))
                    .border(1.dp, JarvisCyanPrimary.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "JARVIS is speaking...",
                    color = JarvisCyanPrimary,
                    fontSize = 12.sp
                )
                IconButton(
                    onClick = { viewModel.stopSpeaking() },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Stop,
                        contentDescription = "Stop speech",
                        tint = JarvisCyanPrimary
                    )
                }
            }
        }

        // Input & Voice Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Voice Mic Toggle Button
            val isListening = voiceState is VoiceState.Listening
            IconButton(
                onClick = {
                    if (isListening) {
                        viewModel.stopListening()
                    } else {
                        viewModel.startListening()
                    }
                },
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(
                        if (isListening) JarvisCyanPrimary else JarvisSurfaceCard
                    )
                    .border(1.dp, JarvisBorder, CircleShape)
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Voice Input",
                    tint = if (isListening) JarvisDeepBlack else JarvisCyanPrimary
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Text Input Field
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = {
                    Text("Ask JARVIS in English or हिन्दी...", color = JarvisTextDim, fontSize = 13.sp)
                },
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp)),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = JarvisDeepNavy,
                    unfocusedContainerColor = JarvisDeepNavy,
                    focusedBorderColor = JarvisCyanPrimary,
                    unfocusedBorderColor = JarvisBorder,
                    focusedTextColor = JarvisTextPrimary,
                    unfocusedTextColor = JarvisTextPrimary
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.width(8.dp))

            // Send Button
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        viewModel.sendMessage(inputText)
                        inputText = ""
                    }
                },
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(listOf(JarvisBlueGlow, JarvisCyanPrimary))
                    )
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = JarvisDeepBlack
                )
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    val isUser = message.isUser
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isUser) 16.dp else 2.dp,
                        bottomEnd = if (isUser) 2.dp else 16.dp
                    )
                )
                .background(
                    if (isUser) {
                        Brush.linearGradient(listOf(JarvisBlueGlow, Color(0xFF0C387A)))
                    } else {
                        Brush.linearGradient(listOf(JarvisSurfaceCard, JarvisDeepNavy))
                    }
                )
                .border(
                    width = 1.dp,
                    color = if (isUser) JarvisCyanPrimary.copy(alpha = 0.3f) else JarvisBorder,
                    shape = RoundedCornerShape(16.dp)
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Column {
                if (!isUser) {
                    Text(
                        text = "JARVIS",
                        color = JarvisCyanPrimary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                }

                Text(
                    text = message.text,
                    color = JarvisTextPrimary,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )

                if (message.actionExecuted != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "⚡ ${message.actionExecuted}",
                        color = JarvisSuccess,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun ThinkingIndicator() {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(JarvisDeepNavy)
            .border(1.dp, JarvisBorder, RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(16.dp),
            color = JarvisCyanPrimary,
            strokeWidth = 2.dp
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "JARVIS is computing...",
            color = JarvisCyanPrimary,
            fontSize = 12.sp
        )
    }
}
