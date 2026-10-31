package com.jarvis.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.assistant.ui.theme.*
import com.jarvis.assistant.viewmodel.AssistantViewModel

/**
 * JARVIS Settings & Device Diagnostics Screen.
 * Configures AI models, Hindi/English language locales, TTS speed,
 * permission audits, and 32-bit MediaTek hardware compatibility info.
 */
@Composable
fun SettingsScreen(viewModel: AssistantViewModel) {
    val language by viewModel.currentLanguage.collectAsState()
    val model by viewModel.currentModel.collectAsState()
    val speed by viewModel.speechSpeed.collectAsState()

    val hasOverlay by viewModel.hasOverlayPermission.collectAsState()
    val hasMic by viewModel.hasMicPermission.collectAsState()
    val hasNotification by viewModel.hasNotificationPermission.collectAsState()

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(JarvisDeepBlack)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Text(
            text = "SYSTEM SETTINGS & PRIVACY",
            color = JarvisCyanPrimary,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Text(
            text = "Hardware diagnostics and runtime configuration",
            color = JarvisTextSecondary,
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Language Selection Section
        SettingsCard(title = "LANGUAGE PREFERENCE") {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = language == "en-IN",
                    onClick = { viewModel.setLanguage("en-IN") },
                    label = { Text("English (India)") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = JarvisBlueGlow,
                        selectedLabelColor = JarvisTextPrimary
                    )
                )
                FilterChip(
                    selected = language == "hi-IN",
                    onClick = { viewModel.setLanguage("hi-IN") },
                    label = { Text("हिन्दी (Hindi)") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = JarvisBlueGlow,
                        selectedLabelColor = JarvisTextPrimary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // AI Engine Selection
        SettingsCard(title = "AI NEURAL CORE") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("gemini-2.5-flash", "gemini-flash-latest").forEach { m ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = model == m,
                            onClick = { viewModel.setModel(m) },
                            colors = RadioButtonDefaults.colors(selectedColor = JarvisCyanPrimary)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (m == "gemini-2.5-flash") "Gemini 2.5 Flash (Recommended)" else "Gemini Flash Latest",
                            color = JarvisTextPrimary,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Speech Velocity Control
        SettingsCard(title = "VOICE SYNTHESIS SPEED (${speed}x)") {
            Slider(
                value = speed,
                onValueChange = { viewModel.setSpeed(it) },
                valueRange = 0.75f..1.5f,
                steps = 3,
                colors = SliderDefaults.colors(
                    thumbColor = JarvisCyanPrimary,
                    activeTrackColor = JarvisBlueGlow
                )
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Device & ABI Diagnostics (User's specific device profile)
        SettingsCard(title = "DEVICE & ABI SPECIFICATIONS") {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                DiagnosticRow("Host Processor", "MediaTek Octa-Core")
                DiagnosticRow("RAM Capacity", "6.0 GB LPDDR4X")
                DiagnosticRow("Target OS", "Android 16 (API 36)")
                DiagnosticRow("Reported ABI", "armeabi-v7a (32-bit compatible)")
                DiagnosticRow("ARM64 Native", "Supported (Dual-ABI build)")
                DiagnosticRow("Local DB Engine", "Room 2.6.1 (SQLite)")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Permissions Audit
        SettingsCard(title = "ANDROID PERMISSIONS AUDIT") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PermissionStatusRow("Overlay Window (SYSTEM_ALERT_WINDOW)", hasOverlay) {
                    viewModel.requestOverlayPermission()
                }
                PermissionStatusRow("Voice Microphone (RECORD_AUDIO)", hasMic)
                PermissionStatusRow("Foreground Notifications (POST_NOTIFICATIONS)", hasNotification)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Privacy & Security Notice
        SettingsCard(title = "PRIVACY ASSURANCE") {
            Text(
                text = "• Zero hidden audio recording: Mic activates only on explicit button tap or wake trigger.\n• Accessibility service never reads banking, passwords, or payment OTPs.\n• Local memories stored securely on-device via encrypted Room database.\n• No external telemetry or trackers.",
                color = JarvisTextSecondary,
                fontSize = 11.sp,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
fun SettingsCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(JarvisDeepNavy)
            .border(1.dp, JarvisBorder, RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Text(
            text = title,
            color = JarvisCyanElectric,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(10.dp))
        content()
    }
}

@Composable
fun DiagnosticRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = JarvisTextSecondary, fontSize = 12.sp)
        Text(text = value, color = JarvisTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun PermissionStatusRow(name: String, granted: Boolean, onAction: (() -> Unit)? = null) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = name, color = JarvisTextPrimary, fontSize = 12.sp)
            Text(
                text = if (granted) "Active" else "Permission Denied / Required",
                color = if (granted) JarvisSuccess else JarvisWarning,
                fontSize = 10.sp
            )
        }
        if (!granted && onAction != null) {
            TextButton(onClick = onAction) {
                Text("Grant", color = JarvisCyanPrimary, fontSize = 11.sp)
            }
        }
    }
}
