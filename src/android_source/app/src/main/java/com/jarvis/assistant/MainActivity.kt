package com.jarvis.assistant

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.jarvis.assistant.ui.screens.ActionsScreen
import com.jarvis.assistant.ui.screens.ChatScreen
import com.jarvis.assistant.ui.screens.MemoryScreen
import com.jarvis.assistant.ui.screens.SettingsScreen
import com.jarvis.assistant.ui.theme.*
import com.jarvis.assistant.viewmodel.AssistantViewModel

enum class JarvisScreen(val title: String, val icon: ImageVector) {
    CHAT("JARVIS Core", Icons.Default.ChatBubble),
    MEMORY("Memory Vault", Icons.Default.Psychology),
    ACTIONS("Actions", Icons.Default.FlashOn),
    SETTINGS("System", Icons.Default.Tune)
}

/**
 * MainActivity:
 * The primary Jetpack Compose entry point for JARVIS.
 * Handles Android 13+ Notification permissions, Audio Recording permissions,
 * and Overlay WindowManager permission requests.
 */
class MainActivity : ComponentActivity() {

    private val viewModel: AssistantViewModel by viewModels()

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        viewModel.refreshPermissions()
    }

    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        viewModel.refreshPermissions()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Check required runtime permissions on launch
        requestRequiredPermissions()

        setContent {
            JarvisTheme {
                var currentScreen by remember { mutableStateOf(JarvisScreen.CHAT) }

                Scaffold(
                    bottomBar = {
                        NavigationBar(
                            containerColor = JarvisDeepNavy,
                            contentColor = JarvisCyanPrimary
                        ) {
                            JarvisScreen.values().forEach { screen ->
                                NavigationBarItem(
                                    selected = currentScreen == screen,
                                    onClick = { currentScreen = screen },
                                    icon = {
                                        Icon(
                                            imageVector = screen.icon,
                                            contentDescription = screen.title
                                        )
                                    },
                                    label = {
                                        Text(screen.title, fontSize = 10.sp)
                                    },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = JarvisCyanPrimary,
                                        selectedTextColor = JarvisCyanPrimary,
                                        unselectedIconColor = JarvisTextDim,
                                        unselectedTextColor = JarvisTextDim,
                                        indicatorColor = JarvisSurfaceCard
                                    )
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (currentScreen) {
                            JarvisScreen.CHAT -> ChatScreen(viewModel)
                            JarvisScreen.MEMORY -> MemoryScreen(viewModel)
                            JarvisScreen.ACTIONS -> ActionsScreen(viewModel)
                            JarvisScreen.SETTINGS -> SettingsScreen(viewModel)
                        }
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshPermissions()
    }

    private fun requestRequiredPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissionsToRequest.toTypedArray())
        }

        // Overlay permission check
        if (!Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
        }
    }
}
