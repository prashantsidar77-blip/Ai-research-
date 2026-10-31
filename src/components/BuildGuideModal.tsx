import React from 'react';
import {
  Smartphone,
  Cpu,
  Terminal,
  Download,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

export const BuildGuideModal: React.FC<{ onDownloadZip: () => void }> = ({ onDownloadZip }) => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Device Architecture Card */}
      <div className="bg-[#0a1128] border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-3 text-cyan-400 mb-3">
          <Cpu className="w-6 h-6" />
          <h3 className="text-base font-bold tracking-wide text-white">
            COMPATIBILITY SPECIFICATIONS: YOUR ANDROID 16 PHONE
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#050811] p-3 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px] font-bold">PROCESSOR & ABI</span>
            <span className="text-cyan-300 font-bold text-sm">MediaTek • 32/64-bit</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports <code className="text-cyan-400">armeabi-v7a</code> and <code className="text-cyan-400">arm64-v8a</code>. Proguard strips all bulky x86 symbols to conserve flash storage.
            </p>
          </div>

          <div className="bg-[#050811] p-3 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px] font-bold">RAM & PERFORMANCE</span>
            <span className="text-emerald-300 font-bold text-sm">6.0 GB LPDDR4X</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Lightweight Jetpack Compose animations and non-blocking Coroutine StateFlow ensure smooth 60/120 FPS.
            </p>
          </div>

          <div className="bg-[#050811] p-3 rounded-xl border border-cyan-500/20">
            <span className="text-slate-400 block text-[10px] font-bold">OPERATING SYSTEM</span>
            <span className="text-blue-300 font-bold text-sm">Android 16 (API 36)</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Complies with latest Android 14/15/16 Foreground Service restrictions with <code className="text-cyan-400">specialUse</code> declaration.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Step Installation Paths */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-cyan-400 tracking-wider">
          CHOOSE YOUR BUILD & INSTALLATION METHOD
        </h4>

        {/* Method 1: Android Studio */}
        <div className="bg-[#0a1128] border border-cyan-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400 flex items-center justify-center text-[10px]">1</span>
              <span>METHOD 1: ANDROID STUDIO (OFFICIAL RECOMMENDED)</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
              Easiest & Fastest
            </span>
          </div>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 pl-2">
            <li>
              Click <strong className="text-cyan-400">"Download Android Studio (.ZIP)"</strong> to get the complete project archive.
            </li>
            <li>Extract the zip folder anywhere on your computer.</li>
            <li>Open Android Studio and click <strong>Open Project</strong> → select the extracted folder.</li>
            <li>
              Connect your MediaTek phone via USB cable and enable <strong>USB Debugging</strong> in <em>Settings → Developer Options</em>.
            </li>
            <li>
              Click the green <strong>Run 'app' (Shift+F10)</strong> button. Android Studio will automatically compile the APK and install it directly onto your phone!
            </li>
          </ol>
        </div>

        {/* Method 2: Command Line Gradle */}
        <div className="bg-[#0a1128] border border-cyan-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-400 border border-blue-400 flex items-center justify-center text-[10px]">2</span>
              <span>METHOD 2: COMMAND LINE OR TERMUX ON YOUR PHONE</span>
            </span>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
              Terminal
            </span>
          </div>

          <p className="text-xs text-slate-300">
            You can compile directly via terminal or on your phone using Termux:
          </p>

          <div className="bg-[#04060d] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
            <p className="text-slate-500"># 1. Build the debug APK for armeabi-v7a / arm64-v8a</p>
            <p>./gradlew assembleDebug</p>
            <p className="text-slate-500 mt-2"># 2. Install APK directly via ADB onto your connected phone</p>
            <p>adb install -r app/build/outputs/apk/debug/app-debug.apk</p>
          </div>
        </div>

        {/* Method 3: GitHub Actions Automated Cloud Build */}
        <div className="bg-[#0a1128] border border-cyan-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 border border-purple-400 flex items-center justify-center text-[10px]">3</span>
              <span>METHOD 3: GITHUB ACTIONS (ZERO LOCAL SETUP)</span>
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
              Cloud CI/CD
            </span>
          </div>

          <p className="text-xs text-slate-300">
            The project includes a ready-to-use <code className="text-cyan-400">.github/workflows/build-apk.yml</code> file:
          </p>

          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-2">
            <li>Push this repository to your GitHub account.</li>
            <li>GitHub will trigger the automated Ubuntu runner and compile the APK.</li>
            <li>Go to the <strong>Actions</strong> tab, click the latest workflow run, and download the <code className="text-cyan-400">JARVIS-Assistant-debug-apk</code> artifact directly to your phone!</li>
          </ol>
        </div>
      </div>

      {/* Android 16 Permissions Checklist */}
      <div className="bg-[#070b18] border border-amber-500/30 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>IMPORTANT PERMISSIONS ON YOUR PHONE (ANDROID 16)</span>
        </h4>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Overlay Permission:</strong> Go to <em>Settings → Apps → Special app access → Display over other apps → Allow JARVIS</em>.
          </li>
          <li>
            <strong>Microphone:</strong> Grant <em>Record Audio</em> when prompted so bilingual Hindi/English voice recognition works.
          </li>
          <li>
            <strong>Notification Permission:</strong> Grant notifications so the Foreground Service can keep the floating bubble active across apps without being killed by MediaTek battery optimization.
          </li>
        </ul>
      </div>

      {/* Big Download Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onDownloadZip}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black font-extrabold text-sm rounded-xl flex items-center space-x-2 shadow-2xl hover:scale-105 transition-transform"
        >
          <Download className="w-4 h-4" />
          <span>Download Complete Android Project (.ZIP)</span>
        </button>
      </div>
    </div>
  );
};
