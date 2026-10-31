# JARVIS Proguard Rules for Release builds
# Optimized for 32-bit MediaTek devices and Room/Kotlinx Serialization

-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Room Database
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Google GenAI SDK
-keep class com.google.ai.client.generativeai.** { *; }

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Jetpack Compose
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
