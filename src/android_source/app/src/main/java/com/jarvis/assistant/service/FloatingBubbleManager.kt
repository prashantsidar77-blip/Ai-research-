package com.jarvis.assistant.service

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.compose.ui.platform.ComposeView
import com.jarvis.assistant.MainActivity
import com.jarvis.assistant.R
import kotlin.math.abs

/**
 * FloatingBubbleManager:
 * Manages the native Android floating overlay bubble using WindowManager and TYPE_APPLICATION_OVERLAY.
 * Supports smooth dragging, edge snapping, long press vs tap detection,
 * and expandable mini-overlay HUD.
 */
class FloatingBubbleManager(
    private val context: Context,
    private val onBubbleClick: () -> Unit,
    private val onBubbleClose: () -> Unit
) {

    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private var bubbleView: View? = null
    private var params: WindowManager.LayoutParams? = null

    private var initialX = 0
    private var initialY = 0
    private var touchStartX = 0f
    private var touchStartY = 0f
    private var isDragging = false
    private var isBubbleAttached = false

    @SuppressLint("ClickableViewAccessibility")
    fun showBubble(startX: Int = 30, startY: Int = 350) {
        if (isBubbleAttached) return

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS or
                    WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = startX
            y = startY
        }

        // Create bubble root layout
        val rootLayout = FrameLayout(context).apply {
            val sizeDp = 64
            val density = context.resources.displayMetrics.density
            val sizePx = (sizeDp * density).toInt()

            layoutParams = FrameLayout.LayoutParams(sizePx, sizePx)

            // Compose view or stylized native view for circular ARC REACTOR
            val composeView = ComposeView(context).apply {
                setContent {
                    JarvisBubbleContent(onClick = onBubbleClick)
                }
            }
            addView(composeView)
        }

        // Attach touch listener for dragging and edge-snapping
        rootLayout.setOnTouchListener { view, event ->
            val p = params ?: return@setOnTouchListener false
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = p.x
                    initialY = p.y
                    touchStartX = event.rawX
                    touchStartY = event.rawY
                    isDragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = (event.rawX - touchStartX).toInt()
                    val deltaY = (event.rawY - touchStartY).toInt()

                    if (abs(deltaX) > 10 || abs(deltaY) > 10) {
                        isDragging = true
                        p.x = initialX + deltaX
                        p.y = initialY + deltaY
                        try {
                            windowManager.updateViewLayout(view, p)
                        } catch (_: Exception) {}
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!isDragging) {
                        // User performed a tap: open assistant
                        onBubbleClick()
                    } else {
                        // Drag ended: snap bubble to closest screen edge
                        snapToEdge(p, view)
                    }
                    isDragging = false
                    true
                }
                else -> false
            }
        }

        try {
            windowManager.addView(rootLayout, params)
            bubbleView = rootLayout
            isBubbleAttached = true
        } catch (e: Exception) {
            e.printStackTrace()
            isBubbleAttached = false
        }
    }

    private fun snapToEdge(p: WindowManager.LayoutParams, view: View) {
        val screenWidth = context.resources.displayMetrics.widthWidth()
        val targetX = if (p.x < screenWidth / 2) 20 else (screenWidth - view.width - 20)

        val animator = ValueAnimator.ofInt(p.x, targetX).apply {
            duration = 200
            interpolator = DecelerateInterpolator()
            addUpdateListener { animation ->
                p.x = animation.animatedValue as Int
                try {
                    windowManager.updateViewLayout(view, p)
                } catch (_: Exception) {}
            }
        }
        animator.start()
    }

    fun hideBubble() {
        if (!isBubbleAttached || bubbleView == null) return
        try {
            windowManager.removeView(bubbleView)
        } catch (_: Exception) {}
        bubbleView = null
        isBubbleAttached = false
    }

    fun isAttached(): Boolean = isBubbleAttached

    private fun Context.resourcesWidth(): Int {
        return resources.displayMetrics.widthPixels
    }
}
