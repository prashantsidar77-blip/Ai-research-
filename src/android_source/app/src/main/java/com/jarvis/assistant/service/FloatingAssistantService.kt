package com.jarvis.assistant.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.jarvis.assistant.JarvisApplication
import com.jarvis.assistant.MainActivity
import com.jarvis.assistant.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Foreground Service for JARVIS Floating Overlay.
 * Complies with Android 14+ and Android 16 Foreground Service restrictions.
 * Uses specialUse FGS type with explicit user-requested assistant subtype.
 */
class FloatingAssistantService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var bubbleManager: FloatingBubbleManager? = null
    private var isUserExplicitlyStopped = false

    companion object {
        const val ACTION_SHOW_BUBBLE = "com.jarvis.assistant.ACTION_SHOW_BUBBLE"
        const val ACTION_HIDE_BUBBLE = "com.jarvis.assistant.ACTION_HIDE_BUBBLE"
        const val ACTION_STOP_SERVICE = "com.jarvis.assistant.ACTION_STOP_SERVICE"

        fun start(context: Context) {
            val intent = Intent(context, FloatingAssistantService::class.java).apply {
                action = ACTION_SHOW_BUBBLE
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, FloatingAssistantService::class.java).apply {
                action = ACTION_STOP_SERVICE
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        bubbleManager = FloatingBubbleManager(
            context = this,
            onBubbleClick = {
                // Open MainActivity or expand HUD
                val openIntent = Intent(this, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    putExtra("FROM_BUBBLE", true)
                }
                startActivity(openIntent)
            },
            onBubbleClose = {
                hideBubble()
            }
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_SHOW_BUBBLE

        when (action) {
            ACTION_SHOW_BUBBLE -> {
                isUserExplicitlyStopped = false
                startForegroundWithNotification(isBubbleVisible = true)
                showBubble()
            }
            ACTION_HIDE_BUBBLE -> {
                hideBubble()
                startForegroundWithNotification(isBubbleVisible = false)
            }
            ACTION_STOP_SERVICE -> {
                isUserExplicitlyStopped = true
                hideBubble()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
                return START_NOT_STICKY
            }
        }

        return if (isUserExplicitlyStopped) START_NOT_STICKY else START_STICKY
    }

    private fun startForegroundWithNotification(isBubbleVisible: Boolean) {
        val notification = buildPersistentNotification(isBubbleVisible)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val fgsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            } else {
                0
            }
            startForeground(JarvisApplication.NOTIFICATION_ID, notification, fgsType)
        } else {
            startForeground(JarvisApplication.NOTIFICATION_ID, notification)
        }
    }

    private fun buildPersistentNotification(isBubbleVisible: Boolean): Notification {
        val appIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val appPendingIntent = PendingIntent.getActivity(
            this, 0, appIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val toggleBubbleIntent = Intent(this, FloatingAssistantService::class.java).apply {
            action = if (isBubbleVisible) ACTION_HIDE_BUBBLE else ACTION_SHOW_BUBBLE
        }
        val togglePendingIntent = PendingIntent.getService(
            this, 1, toggleBubbleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, FloatingAssistantService::class.java).apply {
            action = ACTION_STOP_SERVICE
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val toggleActionTitle = if (isBubbleVisible) {
            getString(R.string.action_hide_bubble)
        } else {
            getString(R.string.action_show_bubble)
        }

        val statusText = if (isBubbleVisible) {
            getString(R.string.status_running)
        } else {
            getString(R.string.status_bubble_hidden)
        }

        return NotificationCompat.Builder(this, JarvisApplication.CHANNEL_ID)
            .setContentTitle("JARVIS AI Core")
            .setContentText(statusText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(appPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(0, toggleActionTitle, togglePendingIntent)
            .addAction(0, getString(R.string.action_stop_service), stopPendingIntent)
            .build()
    }

    private fun showBubble() {
        serviceScope.launch {
            val settingsRepo = JarvisApplication.instance.settingsRepository
            val (x, y) = settingsRepo.bubblePositionFlow.first()
            bubbleManager?.showBubble(startX = x, startY = y)
        }
    }

    private fun hideBubble() {
        bubbleManager?.hideBubble()
    }

    override fun onDestroy() {
        hideBubble()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
