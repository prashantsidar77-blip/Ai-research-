package com.jarvis.assistant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jarvis.assistant.ui.theme.*
import com.jarvis.assistant.viewmodel.AssistantViewModel

data class QuickActionItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)

/**
 * Android Actions & Safe Intents Screen.
 * Demonstrates real native Android intent dispatching and device status readout.
 */
@Composable
fun ActionsScreen(viewModel: AssistantViewModel) {
    val deviceStatus by viewModel.deviceStatus.collectAsState()
    val isServiceActive by viewModel.isServiceActive.collectAsState()
    val hasOverlay by viewModel.hasOverlayPermission.collectAsState()

    val actionManager = viewModel.actionManager

    val actionItems = listOf(
        QuickActionItem("Camera", "Open Android Camera", Icons.Default.CameraAlt) {
            actionManager.openApp("com.android.camera")
        },
        QuickActionItem("Chrome Browser", "Open Web Browser", Icons.Default.Language) {
            actionManager.openWebsite("https://google.com")
        },
        QuickActionItem("YouTube", "Open YouTube App", Icons.Default.SmartDisplay) {
            actionManager.openApp("com.google.android.youtube")
        },
        QuickActionItem("Set Alarm", "7:00 AM Wake Up", Icons.Default.Alarm) {
            actionManager.setAlarm(7, 0, "JARVIS Morning Alarm")
        },
        QuickActionItem("System Settings", "Device Configuration", Icons.Default.Settings) {
            actionManager.openSettings()
        },
        QuickActionItem("Overlay Settings", "Manage Draw Over Apps", Icons.Default.Layers) {
            viewModel.requestOverlayPermission()
        }
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(JarvisDeepBlack)
            .padding(16.dp)
    ) {
        Text(
            text = "SYSTEM ACTIONS & TELEMETRY",
            color = JarvisCyanPrimary,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Text(
            text = "Safe native Android intents with zero security compromise",
            color = JarvisTextSecondary,
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Device Telemetry Status Card
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(JarvisDeepNavy)
                .border(1.dp, JarvisBorder, RoundedCornerShape(14.dp))
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "DEVICE TELEMETRY",
                    color = JarvisCyanElectric,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${deviceStatus.currentTime} • ${deviceStatus.currentDate}",
                    color = JarvisTextPrimary,
                    fontSize = 13.sp
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = if (deviceStatus.isCharging) Icons.Default.BatteryChargingFull else Icons.Default.BatteryFull,
                    contentDescription = "Battery",
                    tint = JarvisSuccess,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "${deviceStatus.batteryPercentage}%",
                    color = JarvisTextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Overlay & Floating Bubble Quick Toggle Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(JarvisSurfaceCard)
                .border(1.dp, JarvisBorder, RoundedCornerShape(14.dp))
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "FLOATING BUBBLE OVERLAY",
                            color = JarvisCyanPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (hasOverlay) "Permission Granted" else "Requires Overlay Permission",
                            color = if (hasOverlay) JarvisSuccess else JarvisWarning,
                            fontSize = 11.sp
                        )
                    }

                    Switch(
                        checked = isServiceActive,
                        onCheckedChange = { enable ->
                            if (enable) viewModel.startFloatingService()
                            else viewModel.stopFloatingService()
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = JarvisCyanPrimary,
                            checkedTrackColor = JarvisBlueGlow
                        )
                    )
                }

                if (isServiceActive) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = { viewModel.hideBubble() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Hide Bubble", fontSize = 11.sp, color = JarvisTextPrimary)
                        }
                        OutlinedButton(
                            onClick = { viewModel.restoreBubble() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Restore Bubble", fontSize = 11.sp, color = JarvisCyanPrimary)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Actions Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(actionItems) { item ->
                ActionCard(item)
            }
        }
    }
}

@Composable
fun ActionCard(item: QuickActionItem) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(JarvisDeepNavy)
            .border(1.dp, JarvisBorder, RoundedCornerShape(12.dp))
            .clickable { item.onClick() }
            .padding(14.dp)
    ) {
        Column {
            Icon(
                imageVector = item.icon,
                contentDescription = item.title,
                tint = JarvisCyanPrimary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = item.title,
                color = JarvisTextPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = item.subtitle,
                color = JarvisTextSecondary,
                fontSize = 11.sp
            )
        }
    }
}
