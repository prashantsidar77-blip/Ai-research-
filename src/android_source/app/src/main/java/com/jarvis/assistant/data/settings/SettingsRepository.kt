package com.jarvis.assistant.data.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "jarvis_settings")

/**
 * SettingsRepository using Android Jetpack DataStore.
 * Manages user preferences, language (Hindi/English), AI Model, TTS speed, and overlay state.
 */
class SettingsRepository(private val context: Context) {

    companion object {
        val KEY_LANGUAGE = stringPreferencesKey("key_language") // "en-IN", "hi-IN", "bilingual"
        val KEY_AI_MODEL = stringPreferencesKey("key_ai_model") // "gemini-2.5-flash", "gemini-flash-latest"
        val KEY_SPEECH_SPEED = floatPreferencesKey("key_speech_speed")
        val KEY_SPEECH_PITCH = floatPreferencesKey("key_speech_pitch")
        val KEY_BUBBLE_ENABLED = booleanPreferencesKey("key_bubble_enabled")
        val KEY_BUBBLE_X = intPreferencesKey("key_bubble_x")
        val KEY_BUBBLE_Y = intPreferencesKey("key_bubble_y")
        val KEY_ACCESSIBILITY_ENABLED = booleanPreferencesKey("key_accessibility_enabled")
        val KEY_THEME_ACCENT = stringPreferencesKey("key_theme_accent")
    }

    val languageFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_LANGUAGE] ?: "en-IN"
    }

    val modelFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_AI_MODEL] ?: "gemini-2.5-flash"
    }

    val speechSpeedFlow: Flow<Float> = context.dataStore.data.map { prefs ->
        prefs[KEY_SPEECH_SPEED] ?: 1.0f
    }

    val speechPitchFlow: Flow<Float> = context.dataStore.data.map { prefs ->
        prefs[KEY_SPEECH_PITCH] ?: 1.0f
    }

    val bubbleEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_BUBBLE_ENABLED] ?: true
    }

    val bubblePositionFlow: Flow<Pair<Int, Int>> = context.dataStore.data.map { prefs ->
        Pair(prefs[KEY_BUBBLE_X] ?: 50, prefs[KEY_BUBBLE_Y] ?: 350)
    }

    val accessibilityEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_ACCESSIBILITY_ENABLED] ?: false
    }

    suspend fun setLanguage(lang: String) {
        context.dataStore.edit { it[KEY_LANGUAGE] = lang }
    }

    suspend fun setModel(model: String) {
        context.dataStore.edit { it[KEY_AI_MODEL] = model }
    }

    suspend fun setSpeechSpeed(speed: Float) {
        context.dataStore.edit { it[KEY_SPEECH_SPEED] = speed }
    }

    suspend fun setSpeechPitch(pitch: Float) {
        context.dataStore.edit { it[KEY_SPEECH_PITCH] = pitch }
    }

    suspend fun setBubbleEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_BUBBLE_ENABLED] = enabled }
    }

    suspend fun saveBubblePosition(x: Int, y: Int) {
        context.dataStore.edit {
            it[KEY_BUBBLE_X] = x
            it[KEY_BUBBLE_Y] = y
        }
    }

    suspend fun setAccessibilityEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_ACCESSIBILITY_ENABLED] = enabled }
    }
}
