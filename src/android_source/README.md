# PROJECT JARVIS — ADVANCED ANDROID AI ASSISTANT

A production-grade, privacy-conscious native Android AI assistant crafted in **Kotlin** and **Jetpack Compose**, targeting **Android 16** with full compatibility for **MediaTek 6GB RAM** devices (`armeabi-v7a` 32-bit & `arm64-v8a`).

---

## 🚀 Key Architectural Features

1. **Floating Assistant Bubble**:
   - Uses Android `WindowManager` with `TYPE_APPLICATION_OVERLAY`.
   - Smooth gesture physics, edge-snapping, draggable across third-party apps.
   - Restorable via Android Persistent Notification (`Show Bubble`, `Hide Bubble`, `Stop Assistant`).

2. **Bilingual AI Voice Core**:
   - Integrated with Gemini models (`gemini-2.5-flash`).
   - Native `SpeechRecognizer` for Hindi (`hi-IN`) and English (`en-IN`).
   - Native `TextToSpeech` engine with speed & pitch calibration.

3. **Room Database Memory Vault**:
   - Local SQLite database managed via Android Jetpack Room (`MemoryDao`, `MemoryEntity`).
   - Records user-approved preferences, instructions, and notes with zero cloud telemetry.

4. **Safe Android System Intents**:
   - Battery & Charging status via `BatteryManager`.
   - App launcher intents for Camera, YouTube, Browser, WhatsApp.
   - Alarm scheduling via `AlarmClock.ACTION_SET_ALARM`.

---

## 🛠️ How to Build & Install on Your Phone

### Option A: Using Android Studio (Recommended)
1. Download the project ZIP using the **"Download Android Studio Project (.ZIP)"** button in the studio companion.
2. Unzip into a directory, e.g. `~/AndroidProjects/JARVIS`.
3. Open **Android Studio Hedgehog / Ladybug or newer**.
4. Select **Open** and choose the unzipped folder.
5. Connect your MediaTek Android 16 phone via USB (with **USB Debugging** enabled in Developer Options).
6. Press the green **Run (Shift + F10)** button. Android Studio will compile and launch JARVIS immediately!

### Option B: Command Line (Gradle)
```bash
# Build the debug APK for 32-bit/64-bit ARM
./gradlew assembleDebug

# Install directly to connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Option C: GitHub Actions Cloud Build
1. Push this folder to a GitHub repository.
2. The included `.github/workflows/build-apk.yml` will automatically build the APK on GitHub's cloud runners.
3. Download `app-debug.apk` directly from the GitHub Actions Artifacts tab and install it onto your phone!

---

## 🔒 Permission Requirements on Android 16
- `SYSTEM_ALERT_WINDOW`: Settings > Apps > Special app access > Display over other apps > JARVIS.
- `RECORD_AUDIO`: Prompted on first voice mic activation.
- `POST_NOTIFICATIONS`: Prompted on launch to keep the foreground service running reliably.
