package com.jarvis.assistant.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.jarvis.assistant.ui.theme.JarvisBlueGlow
import com.jarvis.assistant.ui.theme.JarvisCyanElectric
import com.jarvis.assistant.ui.theme.JarvisCyanPrimary

/**
 * High-performance animated JARVIS Arc Reactor Core.
 * Optimized for MediaTek 32-bit GPU/CPU with low memory overhead.
 */
@Composable
fun JarvisCoreAnimation(
    modifier: Modifier = Modifier,
    size: Dp = 160.dp,
    isActive: Boolean = true,
    isSpeaking: Boolean = false,
    rmsDb: Float = 0f,
    onClick: (() -> Unit)? = null
) {
    val infiniteTransition = rememberInfiniteTransition(label = "jarvis_core")

    val outerRotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "outer_rot"
    )

    val innerRotation by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 5000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "inner_rot"
    )

    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = if (isSpeaking) 400 else 1800,
                easing = FastOutSlowInEasing
            ),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Box(
        modifier = modifier
            .size(size)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(this.size.width / 2, this.size.height / 2)
            val maxRadius = (this.size.minDimension / 2) * 0.9f

            // Dynamic voice multiplier
            val voiceBoost = if (rmsDb > 0) (rmsDb / 10f).coerceIn(0f, 0.4f) else 0f
            val dynamicScale = pulseScale + voiceBoost

            // Outer Glow Field
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        JarvisCyanPrimary.copy(alpha = if (isActive) 0.35f else 0.15f),
                        JarvisBlueGlow.copy(alpha = 0.1f),
                        Color.Transparent
                    ),
                    center = center,
                    radius = maxRadius * dynamicScale
                ),
                radius = maxRadius * dynamicScale,
                center = center
            )

            // Outer Dashed Rotating Ring
            rotate(outerRotation, pivot = center) {
                drawCircle(
                    color = JarvisCyanElectric.copy(alpha = 0.6f),
                    radius = maxRadius * 0.88f,
                    center = center,
                    style = Stroke(
                        width = 3.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(25f, 15f, 10f, 15f), 0f),
                        cap = StrokeCap.Round
                    )
                )
            }

            // Inner Reverse Rotating Arc Ring
            rotate(innerRotation, pivot = center) {
                drawCircle(
                    color = JarvisCyanPrimary,
                    radius = maxRadius * 0.65f,
                    center = center,
                    style = Stroke(
                        width = 4.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(40f, 25f), 0f),
                        cap = StrokeCap.Square
                    )
                )
            }

            // Inner Core Arc Reactor
            drawCircle(
                color = JarvisBlueGlow.copy(alpha = 0.8f),
                radius = maxRadius * 0.38f * dynamicScale,
                center = center
            )

            drawCircle(
                color = JarvisCyanPrimary,
                radius = maxRadius * 0.22f * dynamicScale,
                center = center
            )

            // Center Pure White Light
            drawCircle(
                color = Color.White,
                radius = maxRadius * 0.10f * dynamicScale,
                center = center
            )
        }
    }
}
