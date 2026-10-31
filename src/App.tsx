import React, { useState } from 'react';
import {
  Smartphone,
  FileCode,
  Download,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { BuildGuideModal } from './components/BuildGuideModal';
import { downloadAndroidProjectZip } from './utils/zipDownloader';

export default function App() {
  const [activeView, setActiveView] = useState<'simulator' | 'source' | 'guide'>('simulator');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadAndroidProjectZip((p) => setZipProgress(p));
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#03060f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Futuristic Command Header */}
      <header className="sticky top-0 z-40 bg-[#070b18]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Assistant Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative w-9 h-9 rounded-full bg-[#050811] border-2 border-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-cyan-400 flex items-center justify-center font-black text-black text-xs">
                J
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-white">
                  JARVIS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-cyan-500/40">
                  NATIVE ANDROID AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>MediaTek 6GB RAM • Android 16 (API 36) • armeabi-v7a / arm64</span>
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex items-center bg-[#0a1128] border border-cyan-500/25 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveView('simulator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'simulator'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Device Simulator</span>
            </button>

            <button
              onClick={() => setActiveView('source')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'source'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Source Code (35 Files)</span>
            </button>

            <button
              onClick={() => setActiveView('guide')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeView === 'guide'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Build & Install Guide</span>
            </button>
          </div>

          {/* Download 1-Click Android ZIP Project */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? `Packaging ZIP (${zipProgress}%)...` : 'Download Android Studio (.ZIP)'}</span>
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeView === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Native Android 16 Phone Simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator />
            </div>

            {/* Right Column: Interactive Diagnostic HUD & Features Overview */}
            <div className="lg:col-span-7 space-y-5">
              {/* Architecture Blueprint Card */}
              <div className="bg-[#070b18] border border-cyan-500/25 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-white tracking-wider">
                      PROJECT JARVIS • NATIVE ANDROID ARCHITECTURE
                    </h2>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Compilable Native Kotlin
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="bg-[#0a1128] p-3 rounded-xl border border-cyan-500/15">
                    <span className="text-[10px] text-cyan-400 font-bold block">UI ENGINE</span>
                    <span className="text-white font-semibold">Jetpack Compose</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Material 3 • Declarative</p>
                  </div>
                  <div className="bg-[#0a1128] p-3 rounded-xl border border-cyan-500/15">
                    <span className="text-[10px] text-cyan-400 font-bold block">FLOATING BUBBLE</span>
                    <span className="text-white font-semibold">WindowManager</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">TYPE_APPLICATION_OVERLAY</p>
                  </div>
                  <div className="bg-[#0a1128] p-3 rounded-xl border border-cyan-500/15">
                    <span className="text-[10px] text-cyan-400 font-bold block">MEMORY SYSTEM</span>
                    <span className="text-white font-semibold">Room Database</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">SQLite • Zero Telemetry</p>
                  </div>
                  <div className="bg-[#0a1128] p-3 rounded-xl border border-cyan-500/15">
                    <span className="text-[10px] text-cyan-400 font-bold block">VOICE ENGINE</span>
                    <span className="text-white font-semibold">SpeechRecognizer</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hindi (hi-IN) & English</p>
                  </div>
                </div>

                {/* Detailed Features List */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Floating Assistant Bubble:</strong>
                      <span className="text-slate-300"> Draggable across third-party apps, snaps smoothly to screen borders, opens compact HUD on tap, and persistent foreground notification allows instant hide or restore.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Bilingual AI Voice Core:</strong>
                      <span className="text-slate-300"> Speaks and transcribes in both Hindi and English. SpeechRecognition captures voice audio with animated RMS dB pulse; TextToSpeech responds with calibrated rate and pitch.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Room Local Memory Vault:</strong>
                      <span className="text-slate-300"> Stores user-approved preferences and instructions. Injected automatically into Gemini's context window for personalized assistance. Individual and bulk deletion supported.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Android 16 & MediaTek Optimization:</strong>
                      <span className="text-slate-300"> Strictly configured for <code className="text-cyan-300 font-mono">armeabi-v7a</code> and <code className="text-cyan-300 font-mono">arm64-v8a</code> architectures. No heavy x86 dependencies; minimal CPU/RAM footprint on 6GB devices.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & How to Test Banner */}
              <div className="bg-[#0a1128] border border-cyan-500/20 rounded-2xl p-5 text-xs space-y-3">
                <h3 className="font-bold text-cyan-400 tracking-wider flex items-center space-x-1.5">
                  <Zap className="w-4 h-4" />
                  <span>HOW TO INTERACT WITH THE SIMULATOR NOW</span>
                </h3>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li><strong>Voice Speak:</strong> Tap the microphone button in the phone simulator to speak in Hindi or English.</li>
                  <li><strong>Drag Bubble:</strong> Drag the circular JARVIS bubble on the phone screen and release to watch it snap to the closest edge.</li>
                  <li><strong>Android Shade:</strong> Click the top Status Bar (clock / battery) to pull down the Android 16 notification drawer and control the foreground service.</li>
                  <li><strong>Home Screen:</strong> Tap the "Home" pill or bottom gesture bar to test the bubble hovering over other phone apps.</li>
                </ul>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveView('source')}
                    className="px-3.5 py-1.5 bg-[#0f1e40] border border-cyan-500/40 text-cyan-300 rounded-lg font-semibold hover:bg-[#142652] transition-colors"
                  >
                    View All Kotlin Files →
                  </button>
                  <button
                    onClick={() => setActiveView('guide')}
                    className="px-3.5 py-1.5 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded-lg font-semibold hover:bg-cyan-900 transition-colors"
                  >
                    Installation Steps for Phone →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'source' && <CodeExplorer />}

        {activeView === 'guide' && <BuildGuideModal onDownloadZip={handleDownloadZip} />}
      </main>

      {/* Clean Bottom Footer */}
      <footer className="mt-auto border-t border-cyan-500/15 bg-[#04060c] py-4 px-6 text-center text-xs text-slate-500">
        <p>
          PROJECT JARVIS • Native Android 16 (API 36) • Jetpack Compose • Room Database • WindowManager Floating Bubble • Gemini AI Core
        </p>
      </footer>
    </div>
  );
}
