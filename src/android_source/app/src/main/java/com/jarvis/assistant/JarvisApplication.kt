package com.jarvis.assistant

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.jarvis.assistant.data.db.MemoryDatabase
import com.jarvis.assistant.data.settings.SettingsRepository

/**
 * JARVIS Application class.
 * Initializes the Room Memory database, notification channels,
 * and DataStore preferences on app startup.
 */
class JarvisApplication : Application() {

    lateinit var database: MemoryDatabase
        private set

    lateinit var settingsRepository: SettingsRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize Room local database
        database = MemoryDatabase.getDatabase(this)

        // Initialize DataStore settings
        settingsRepository = SettingsRepository(this)

        // Create foreground service notification channel
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_description)
                setShowBadge(false)
                enableVibration(false)
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "jarvis_assistant_foreground_channel"
        const val NOTIFICATION_ID = 1001

        lateinit var instance: JarvisApplication
            private set
    }
}
