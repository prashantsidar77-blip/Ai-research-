package com.jarvis.assistant.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = JarvisCyanPrimary,
    onPrimary = JarvisDeepBlack,
    secondary = JarvisBlueGlow,
    onSecondary = JarvisTextPrimary,
    background = JarvisDeepBlack,
    onBackground = JarvisTextPrimary,
    surface = JarvisDeepNavy,
    onSurface = JarvisTextPrimary,
    surfaceVariant = JarvisSurfaceCard,
    onSurfaceVariant = JarvisTextSecondary
)

@Composable
fun JarvisTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
