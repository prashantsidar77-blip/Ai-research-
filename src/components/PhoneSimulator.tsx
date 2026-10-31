import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Trash2,
  Plus,
  Settings,
  Battery,
  BatteryCharging,
  Wifi,
  Sparkles,
  Smartphone,
  ChevronDown,
  Layers,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  MessageSquare,
  Brain,
  Zap,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ArcReactor } from './ArcReactor';

export interface MemoryItem {
  id: string;
  category: 'PREFERENCE' | 'NOTE' | 'INSTRUCTION' | 'SUMMARY';
  content: string;
  timestamp: number;
}

export interface ChatMsg {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  action?: string;
  timestamp: string;
}

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    category: 'PREFERENCE',
    content: 'User prefers concise, action-oriented answers with bilingual English and Hindi capability.',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'm2',
    category: 'INSTRUCTION',
    content: 'Host device is MediaTek Octa-Core with 6GB RAM running Android 16 (API 36). Keep background memory lightweight.',
    timestamp: Date.now() - 7200000,
  },
];

export const PhoneSimulator: React.FC = () => {
  // Navigation & Screen State
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'actions' | 'settings'>('chat');
  const [isInApp, setIsInApp] = useState<boolean>(true); // true = inside JARVIS app; false = on Android home screen
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

  // Overlay Floating Bubble State (WindowManager TYPE_APPLICATION_OVERLAY)
  const [hasOverlayPermission, setHasOverlayPermission] = useState<boolean>(true);
  const [isServiceRunning, setIsServiceRunning] = useState<boolean>(true);
  const [isBubbleVisible, setIsBubbleVisible] = useState<boolean>(true);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number }>({ x: 280, y: 220 });
  const [isDraggingBubble, setIsDraggingBubble] = useState<boolean>(false);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMiniHudOpen, setIsMiniHudOpen] = useState<boolean>(false);

  // Assistant Configuration
  const [language, setLanguage] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [aiModel, setAiModel] = useState<string>('gemini-2.5-flash');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  // Chat & AI State
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: 'JARVIS online. Android 16 core initialized on MediaTek processor. Floating bubble and Room Memory Vault active. How may I assist you today, Sir?',
      timestamp: '10:42 AM',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Voice & TTS State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [rmsLevel, setRmsLevel] = useState<number>(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Memory Vault State
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_room_memories');
      return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
    } catch {
      return DEFAULT_MEMORIES;
    }
  });
  const [showAddMemoryModal, setShowAddMemoryModal] = useState<boolean>(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState<'PREFERENCE' | 'NOTE' | 'INSTRUCTION' | 'SUMMARY'>('PREFERENCE');
  const [newMemoryContent, setNewMemoryContent] = useState<string>('');

  // Device Telemetry State
  const [batteryLevel, setBatteryLevel] = useState<number>(84);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('10:42 AM');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Sync memories to localStorage (Room database simulation)
  useEffect(() => {
    localStorage.setItem('jarvis_room_memories', JSON.stringify(memories));
  }, [memories]);

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Native battery check if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }
  }, []);

  // Text-To-Speech Function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean out action tags before speaking
    const clean = text.replace(/\[ACTION:[^\]]+\]/g, '').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = speechSpeed;
    utterance.lang = language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice Input (Web Speech Recognition)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setRmsLevel(0);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition not supported in this browser. You can type directly.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        // Simulate RMS audio pulse
        setRmsLevel(0.4);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        if (event.results[0].isFinal) {
          setIsListening(false);
          setRmsLevel(0);
          handleSendMessage(transcript);
        } else {
          setRmsLevel(0.2 + Math.random() * 0.6);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setRmsLevel(0);
        if (e.error !== 'no-speech') {
          setSpeechError(`Voice error: ${e.error}`);
          setTimeout(() => setSpeechError(null), 3500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setRmsLevel(0);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSpeechError(`Microphone error: ${err.message}`);
      setIsListening(false);
      setRmsLevel(0);
    }
  };

  // Chat Submission & Gemini Backend Call
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isGenerating) return;

    const userMessage: ChatMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          language,
          memory: memories,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.fallback || 'JARVIS systems operational.';

      // Parse and execute Android actions if triggered
      let executedActionName: string | undefined;
      if (replyText.includes('[ACTION:OPEN_APP')) {
        const match = replyText.match(/app="([^"]+)"/);
        const appName = match ? match[1] : 'Requested App';
        executedActionName = `Launched intent: ${appName}`;
        triggerActionFeedback(`Opening ${appName}...`);
      } else if (replyText.includes('[ACTION:SET_ALARM')) {
        const match = replyText.match(/time="([^"]+)"/);
        const time = match ? match[1] : 'Morning';
        executedActionName = `Alarm set for ${time}`;
        triggerActionFeedback(`Alarm set: ${time}`);
      } else if (replyText.includes('[ACTION:CHECK_BATTERY]')) {
        executedActionName = `Battery check: ${batteryLevel}%`;
      } else if (replyText.includes('[ACTION:SAVE_MEMORY')) {
        const matchText = replyText.match(/text="([^"]+)"/);
        const matchCat = replyText.match(/category="([^"]+)"/);
        if (matchText) {
          const content = matchText[1];
          const cat = (matchCat ? matchCat[1] : 'NOTE') as any;
          setMemories((prev) => [
            { id: Date.now().toString(), category: cat, content, timestamp: Date.now() },
            ...prev,
          ]);
          executedActionName = `Saved to Room Memory Vault`;
        }
      }

      const jarvisReply: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: replyText.replace(/\[ACTION:[^\]]+\]/g, '').trim(),
        action: executedActionName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, jarvisReply]);
      speakText(jarvisReply.text);
    } catch (err) {
      const fallbackMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: 'Neural uplink offline. Local MediaTek hardware diagnostics show core services and floating bubble operating normally.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerActionFeedback = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 3000);
  };

  // Floating Bubble Dragging & Snapping Math
  const phoneContainerRef = useRef<HTMLDivElement | null>(null);

  const handleBubbleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBubble(true);
    setDragStartOffset({
      x: e.clientX - bubblePos.x,
      y: e.clientY - bubblePos.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingBubble || !phoneContainerRef.current) return;
      const rect = phoneContainerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left - 28;
      const rawY = e.clientY - rect.top - 28;

      const clampedX = Math.max(10, Math.min(rect.width - 66, rawX));
      const clampedY = Math.max(50, Math.min(rect.height - 110, rawY));

      setBubblePos({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      if (!isDraggingBubble || !phoneContainerRef.current) return;
      setIsDraggingBubble(false);

      // Snap to closest edge (left or right)
      const rect = phoneContainerRef.current.getBoundingClientRect();
      const snapLeft = bubblePos.x < rect.width / 2;
      setBubblePos((prev) => ({
        x: snapLeft ? 16 : rect.width - 72,
        y: prev.y,
      }));
    };

    if (isDraggingBubble) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBubble, bubblePos]);

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-md mx-auto">
      {/* Action Popover Alert (mimicking Android HUD Toasts) */}
      {actionAlert && (
        <div className="fixed top-16 z-50 px-4 py-2 bg-cyan-950 border border-cyan-400 text-cyan-200 text-xs rounded-full shadow-2xl flex items-center space-x-2 animate-bounce">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Android 16 Smartphone Shell Frame */}
      <div
        ref={phoneContainerRef}
        className="relative w-[360px] h-[720px] bg-[#050811] rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-cyan-500/20 select-none overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 240, 255, 0.15), 0 0 20px rgba(7, 91, 206, 0.2)',
        }}
      >
        {/* Physical Camera Punchhole & Earpiece */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-blue-950 rounded-full" />
          </div>
        </div>

        {/* Android 16 Status Bar (Click to toggle Notification Shade) */}
        <div
          onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
          className="relative z-30 flex items-center justify-between px-4 pt-1.5 pb-1 text-[11px] text-slate-300 cursor-pointer hover:bg-white/5 rounded-t-3xl transition-colors"
          title="Click to pull down Android Notification Shade"
        >
          <span className="font-semibold">{currentTime}</span>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-bold tracking-wider px-1 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-500/40 rounded">
              5G
            </span>
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">{batteryLevel}%</span>
              {isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-cyan-400 opacity-60" />
          </div>
        </div>

        {/* Android Notification Shade Pull-down */}
        {notificationDrawerOpen && (
          <div className="absolute inset-x-3 top-10 bottom-12 z-50 bg-[#070b18]/95 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-top duration-200">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs text-cyan-400">
                <span className="font-semibold tracking-wider flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ANDROID NOTIFICATIONS</span>
                </span>
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* JARVIS Persistent Foreground Service Notification */}
              {isServiceRunning ? (
                <div className="mt-3 bg-[#0a1128] border border-cyan-500/40 rounded-xl p-3 shadow-lg">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
                      J
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">JARVIS AI Core</span>
                        <span className="text-[10px] text-cyan-400">Foreground Service</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {isBubbleVisible
                          ? 'JARVIS is active • Floating bubble running over apps'
                          : 'Assistant active • Bubble minimized to background'}
                      </p>

                      {/* Foreground Service Action Buttons */}
                      <div className="flex items-center space-x-2 mt-2.5 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setIsBubbleVisible(!isBubbleVisible);
                            triggerActionFeedback(isBubbleVisible ? 'Bubble hidden' : 'Bubble restored');
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900 transition-colors"
                        >
                          {isBubbleVisible ? 'Hide Bubble' : 'Show Bubble'}
                        </button>
                        <button
                          onClick={() => {
                            setIsInApp(true);
                            setNotificationDrawerOpen(false);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Open Panel
                        </button>
                        <button
                          onClick={() => {
                            setIsServiceRunning(false);
                            setIsBubbleVisible(false);
                            triggerActionFeedback('Assistant Service Stopped');
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded bg-rose-950 text-rose-300 border border-rose-500/40 hover:bg-rose-900 transition-colors"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-slate-900/60 rounded-xl text-center">
                  <p className="text-xs text-slate-400">JARVIS Assistant Service is stopped.</p>
                  <button
                    onClick={() => {
                      setIsServiceRunning(true);
                      setIsBubbleVisible(true);
                      triggerActionFeedback('Service restarted');
                    }}
                    className="mt-2 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded"
                  >
                    Start Assistant Service
                  </button>
                </div>
              )}
            </div>

            <div className="text-center pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400">MediaTek Octa-Core • Android 16 (API 36)</span>
            </div>
          </div>
        )}

        {/* Main Display Area */}
        <div className="relative flex-1 rounded-[32px] overflow-hidden bg-gradient-to-b from-[#050811] via-[#080d1e] to-[#04060c] flex flex-col">
          {isInApp ? (
            /* --- INSIDE JARVIS APP --- */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* App Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/15 bg-[#070b18]/70">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center">
                    <span className="text-[10px] font-black text-cyan-300">J</span>
                  </div>
                  <div>
                    <h1 className="text-xs font-black tracking-widest text-white">JARVIS</h1>
                    <p className="text-[9px] text-cyan-400 tracking-wider font-mono">CORE v2.5 • ONLINE</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsInApp(false)}
                    className="px-2 py-0.5 text-[9px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex items-center space-x-1"
                    title="Switch to simulated Android Home screen to test floating overlay"
                  >
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>Home</span>
                  </button>
                </div>
              </div>

              {/* Sub-Screen Tabs Content */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col">
                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Animated Arc Reactor Core Header */}
                    <div className="flex flex-col items-center justify-center py-2">
                      <ArcReactor
                        size={110}
                        isActive={true}
                        isSpeaking={isSpeaking}
                        isListening={isListening}
                        rmsLevel={rmsLevel}
                        onClick={toggleListening}
                      />
                      <div className="mt-1 text-center">
                        <span className="text-[9px] font-bold tracking-widest text-cyan-400 font-mono">
                          {isListening
                            ? '● LISTENING (HI/EN)...'
                            : isSpeaking
                            ? '● VOCALIZING...'
                            : isGenerating
                            ? '● GEMINI THINKING...'
                            : 'JARVIS ARC REACTOR • STANDING BY'}
                        </span>
                      </div>
                    </div>

                    {/* Chat Bubble Scroll Area */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 my-1 max-h-[290px] pr-1">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow ${
                              m.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-700 to-cyan-600 text-white rounded-br-none border border-cyan-400/30'
                                : 'bg-[#0e172e] text-slate-100 rounded-bl-none border border-cyan-500/20'
                            }`}
                          >
                            {m.sender === 'jarvis' && (
                              <div className="text-[9px] font-bold text-cyan-400 tracking-wider mb-0.5">
                                JARVIS
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{m.text}</p>
                            {m.action && (
                              <div className="mt-1 pt-1 border-t border-cyan-500/30 text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                                <span>⚡</span>
                                <span>{m.action}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
                        </div>
                      ))}

                      {isGenerating && (
                        <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-[#0e172e] px-3 py-2 rounded-xl w-fit border border-cyan-500/20">
                          <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[11px]">Computing neural response...</span>
                        </div>
                      )}
                    </div>

                    {/* Speech Stop Bar if JARVIS is speaking */}
                    {isSpeaking && (
                      <div className="flex items-center justify-between px-3 py-1.5 mb-1 bg-cyan-950/80 border border-cyan-400/40 rounded-lg">
                        <div className="flex items-center space-x-1.5 text-[11px] text-cyan-300">
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span>Speaking aloud...</span>
                        </div>
                        <button
                          onClick={stopSpeaking}
                          className="px-2 py-0.5 text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40 rounded hover:bg-rose-900"
                        >
                          Stop
                        </button>
                      </div>
                    )}

                    {speechError && (
                      <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded mb-1 text-center">
                        {speechError}
                      </div>
                    )}

                    {/* Input & Voice Controls */}
                    <div className="flex items-center space-x-1.5 pt-1">
                      <button
                        onClick={toggleListening}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-900'
                        }`}
                        title="Voice Input (Hindi / English)"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                        placeholder={language.startsWith('hi') ? 'JARVIS se Hindi me puchein...' : 'Command JARVIS in English / Hindi...'}
                        className="flex-1 bg-[#0a1128] border border-cyan-500/30 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 placeholder-slate-500"
                      />

                      <button
                        onClick={() => handleSendMessage(inputText)}
                        disabled={!inputText.trim() || isGenerating}
                        className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-black flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'memory' && (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                      <div>
                        <h2 className="text-xs font-bold text-cyan-400 tracking-wider">ROOM MEMORY VAULT</h2>
                        <p className="text-[10px] text-slate-400">{memories.length} persistent entries stored</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            if (confirm('Clear all local Room memories?')) setMemories([]);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="Clear all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowAddMemoryModal(true)}
                          className="px-2 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-bold rounded flex items-center space-x-1 hover:bg-cyan-900"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {memories.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-xs">
                          No memory recorded. Add custom preferences or notes for JARVIS.
                        </div>
                      ) : (
                        memories.map((m) => (
                          <div
                            key={m.id}
                            className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-2.5 flex items-start justify-between group"
                          >
                            <div className="flex-1 pr-2">
                              <span className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-500/30">
                                {m.category}
                              </span>
                              <p className="text-xs text-slate-200 mt-1.5 leading-snug">{m.content}</p>
                            </div>
                            <button
                              onClick={() => setMemories((prev) => prev.filter((item) => item.id !== m.id))}
                              className="text-slate-600 hover:text-rose-400 opacity-60 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="pb-1 border-b border-cyan-500/20">
                      <h2 className="text-xs font-bold text-cyan-400 tracking-wider">ANDROID ACTIONS & INTENTS</h2>
                      <p className="text-[10px] text-slate-400">Safe hardware telemetry and app dispatch</p>
                    </div>

                    {/* Battery Card */}
                    <div className="bg-[#0a1128] border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold">BATTERY MANAGER</span>
                        <div className="text-sm font-bold text-white flex items-center space-x-1.5 mt-0.5">
                          {isCharging ? (
                            <BatteryCharging className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Battery className="w-4 h-4 text-cyan-400" />
                          )}
                          <span>{batteryLevel}%</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            ({isCharging ? 'Charging' : 'Discharging'})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => triggerActionFeedback(`Battery: ${batteryLevel}%`)}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-cyan-950 border border-cyan-500/50 text-cyan-300 rounded hover:bg-cyan-900"
                      >
                        Query
                      </button>
                    </div>

                    {/* Quick App Intents */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => {
                          triggerActionFeedback('Intent: Opening Camera...');
                          window.open('https://camera.google.com', '_blank');
                        }}
                        className="bg-[#0a1128] border border-cyan-500/20 hover:border-cyan-400 p-2.5 rounded-xl text-left flex flex-col space-y-1 transition-colors"
                      >
                        <span className="text-cyan-400 font-bold">📸 Camera</span>
                        <span className="text-[9px] text-slate-400">Intent: ACTION_IMAGE_CAPTURE</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerActionFeedback('Intent: YouTube Music / Video');
                          window.open('https://youtube.com', '_blank');
                        }}
                        className="bg-[#0a1128] border border-cyan-500/20 hover:border-cyan-400 p-2.5 rounded-xl text-left flex flex-col space-y-1 transition-colors"
                      >
                        <span className="text-cyan-400 font-bold">▶️ YouTube</span>
                        <span className="text-[9px] text-slate-400">Package: com.google.youtube</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerActionFeedback('Alarm scheduled for 7:00 AM');
                          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                          audio.play().catch(() => {});
                        }}
                        className="bg-[#0a1128] border border-cyan-500/20 hover:border-cyan-400 p-2.5 rounded-xl text-left flex flex-col space-y-1 transition-colors"
                      >
                        <span className="text-cyan-400 font-bold">⏰ Set Alarm</span>
                        <span className="text-[9px] text-slate-400">Intent: ACTION_SET_ALARM</span>
                      </button>

                      <button
                        onClick={() => {
                          triggerActionFeedback('Opening System Settings...');
                          setActiveTab('settings');
                        }}
                        className="bg-[#0a1128] border border-cyan-500/20 hover:border-cyan-400 p-2.5 rounded-xl text-left flex flex-col space-y-1 transition-colors"
                      >
                        <span className="text-cyan-400 font-bold">⚙️ Settings</span>
                        <span className="text-[9px] text-slate-400">Intent: ACTION_SETTINGS</span>
                      </button>
                    </div>

                    <div className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-3">
                      <span className="text-[10px] text-cyan-400 font-bold">SAFETY PROTOCOL</span>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                        Every action requires user confirmation or explicit voice trigger. Financial transactions, OTPs, and password screens are strictly walled off.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="flex-1 flex flex-col space-y-3 text-xs">
                    <div className="pb-1 border-b border-cyan-500/20">
                      <h2 className="text-xs font-bold text-cyan-400 tracking-wider">SYSTEM & DEVICE PREFERENCES</h2>
                      <p className="text-[10px] text-slate-400">MediaTek 6GB Android 16 calibration</p>
                    </div>

                    {/* Language Preference */}
                    <div className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-2.5">
                      <span className="text-[10px] text-cyan-400 font-bold">VOICE & CONVERSATION LANGUAGE</span>
                      <div className="flex space-x-2 mt-1.5">
                        <button
                          onClick={() => setLanguage('en-IN')}
                          className={`flex-1 py-1 text-center rounded text-[11px] font-semibold border ${
                            language === 'en-IN'
                              ? 'bg-blue-600 border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          English (India)
                        </button>
                        <button
                          onClick={() => setLanguage('hi-IN')}
                          className={`flex-1 py-1 text-center rounded text-[11px] font-semibold border ${
                            language === 'hi-IN'
                              ? 'bg-blue-600 border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          हिन्दी (Hindi)
                        </button>
                      </div>
                    </div>

                    {/* Overlay Permission Control */}
                    <div className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold">DRAW OVER OTHER APPS</span>
                        <p className="text-[9px] text-slate-400">SYSTEM_ALERT_WINDOW</p>
                      </div>
                      <button
                        onClick={() => {
                          setHasOverlayPermission(!hasOverlayPermission);
                          setIsBubbleVisible(!hasOverlayPermission);
                          triggerActionFeedback(
                            !hasOverlayPermission ? 'Overlay Granted' : 'Overlay Revoked'
                          );
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          hasOverlayPermission
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                            : 'bg-rose-950 border-rose-400 text-rose-300'
                        }`}
                      >
                        {hasOverlayPermission ? 'Granted' : 'Revoked'}
                      </button>
                    </div>

                    {/* Speech Velocity */}
                    <div className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-cyan-400 font-bold">TTS SPEED</span>
                        <span className="text-[10px] text-white font-mono">{speechSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.5"
                        step="0.25"
                        value={speechSpeed}
                        onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                        className="w-full mt-1.5 accent-cyan-400"
                      />
                    </div>

                    {/* Device Diagnostic */}
                    <div className="bg-[#0a1128] border border-cyan-500/20 rounded-xl p-2.5 text-[10px] space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Host Hardware:</span>
                        <span className="text-white">MediaTek Octa-Core (32-bit & 64-bit ABI)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RAM Allocation:</span>
                        <span className="text-white">6 GB LPDDR4X (Low-mem optimized)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Android Version:</span>
                        <span className="text-white">Android 16 (API 36)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Material 3 Bottom Navigation Bar */}
              <div className="flex items-center justify-around py-2 border-t border-cyan-500/20 bg-[#070b18]">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex flex-col items-center space-y-0.5 text-[9px] font-medium ${
                    activeTab === 'chat' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => setActiveTab('memory')}
                  className={`flex flex-col items-center space-y-0.5 text-[9px] font-medium ${
                    activeTab === 'memory' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Memory</span>
                </button>

                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex flex-col items-center space-y-0.5 text-[9px] font-medium ${
                    activeTab === 'actions' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Actions</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex flex-col items-center space-y-0.5 text-[9px] font-medium ${
                    activeTab === 'settings' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- SIMULATED ANDROID HOME SCREEN --- */
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-black relative">
              {/* Home Screen Widgets */}
              <div className="pt-8 text-center">
                <div className="text-3xl font-light text-white tracking-tight">{currentTime}</div>
                <div className="text-xs text-cyan-300 tracking-wide mt-1">Friday, October 30</div>
              </div>

              {/* Grid of other phone apps */}
              <div className="grid grid-cols-4 gap-4 px-2 my-auto">
                <div
                  onClick={() => {
                    setIsInApp(true);
                    setActiveTab('chat');
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                    <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center font-black text-cyan-400 text-sm">
                      J
                    </div>
                  </div>
                  <span className="text-[10px] text-white mt-1 font-medium">JARVIS</span>
                </div>

                <div
                  onClick={() => window.open('https://google.com', '_blank')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
                    <span className="text-lg">🌐</span>
                  </div>
                  <span className="text-[10px] text-white mt-1">Chrome</span>
                </div>

                <div
                  onClick={() => window.open('https://youtube.com', '_blank')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-600 p-2 shadow-lg flex items-center justify-center text-white">
                    <span className="text-sm font-bold">▶</span>
                  </div>
                  <span className="text-[10px] text-white mt-1">YouTube</span>
                </div>

                <div
                  onClick={() => {
                    setIsInApp(true);
                    setActiveTab('settings');
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-700 p-2 shadow-lg flex items-center justify-center text-white">
                    <Settings className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className="text-[10px] text-white mt-1">Settings</span>
                </div>
              </div>

              <div className="text-center pb-2">
                <p className="text-[10px] text-cyan-300/80">
                  ⚡ Floating bubble is active above all apps. Drag it or tap to invoke JARVIS!
                </p>
              </div>
            </div>
          )}

          {/* FLOATING ASSISTANT BUBBLE (TYPE_APPLICATION_OVERLAY) */}
          {hasOverlayPermission && isServiceRunning && isBubbleVisible && (
            <div
              onMouseDown={handleBubbleMouseDown}
              onClick={() => setIsMiniHudOpen(!isMiniHudOpen)}
              style={{
                transform: `translate(${bubblePos.x}px, ${bubblePos.y}px)`,
                transition: isDraggingBubble ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              className="absolute top-0 left-0 z-50 cursor-grab active:cursor-grabbing group"
              title="Draggable JARVIS Floating Bubble (WindowManager overlay)"
            >
              <div className="relative w-14 h-14 rounded-full bg-[#050811] border-2 border-cyan-400 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)] group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center">
                  <span className="font-black text-white text-xs tracking-wider">J</span>
                </div>
                {/* Rotating holographic ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
          )}

          {/* COMPACT FLOATING ASSISTANT MINI-HUD (Opens over ANY screen on bubble tap) */}
          {isMiniHudOpen && (
            <div
              className="absolute top-20 inset-x-4 z-50 bg-[#070b18]/95 backdrop-blur-xl border-2 border-cyan-400 rounded-3xl p-3 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col space-y-2.5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/30">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] font-black tracking-wider text-cyan-300">JARVIS FLOATING HUD</span>
                </div>
                <button
                  onClick={() => setIsMiniHudOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-200 leading-snug">
                "Ready for voice or command, Sir. What would you like to run?"
              </p>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setIsMiniHudOpen(false);
                    setIsInApp(true);
                    setActiveTab('chat');
                    toggleListening();
                  }}
                  className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-black font-bold text-[10px] rounded-xl flex items-center justify-center space-x-1 shadow"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Listen (Hindi/Eng)</span>
                </button>
                <button
                  onClick={() => {
                    setIsMiniHudOpen(false);
                    setIsInApp(true);
                    setActiveTab('chat');
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 text-slate-200 font-semibold text-[10px] rounded-xl hover:bg-slate-700"
                >
                  Full App
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Android 16 Gesture Navigation Bar */}
        <div className="h-6 flex items-center justify-center">
          <div
            onClick={() => setIsInApp(false)}
            className="w-24 h-1 bg-slate-600 hover:bg-cyan-400 rounded-full cursor-pointer transition-colors"
            title="Android Home Gesture"
          />
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1128] border border-cyan-400/50 rounded-2xl p-5 w-full max-w-sm text-xs shadow-2xl">
            <h3 className="font-bold text-cyan-400 text-sm mb-3">Add to Room Memory Vault</h3>

            <label className="text-slate-400 text-[10px] font-semibold block mb-1">CATEGORY</label>
            <select
              value={newMemoryCategory}
              onChange={(e) => setNewMemoryCategory(e.target.value as any)}
              className="w-full bg-[#050811] border border-cyan-500/30 text-white rounded-lg p-2 mb-3 focus:outline-none focus:border-cyan-400"
            >
              <option value="PREFERENCE">PREFERENCE (User Habit/Style)</option>
              <option value="NOTE">NOTE (Important detail)</option>
              <option value="INSTRUCTION">INSTRUCTION (System Rule)</option>
              <option value="SUMMARY">SUMMARY (Context)</option>
            </select>

            <label className="text-slate-400 text-[10px] font-semibold block mb-1">MEMORY CONTENT</label>
            <textarea
              value={newMemoryContent}
              onChange={(e) => setNewMemoryContent(e.target.value)}
              placeholder="e.g. Remember to answer my device queries in Hindi..."
              rows={3}
              className="w-full bg-[#050811] border border-cyan-500/30 text-white rounded-lg p-2 mb-4 focus:outline-none focus:border-cyan-400 text-xs"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newMemoryContent.trim()) {
                    setMemories((prev) => [
                      {
                        id: Date.now().toString(),
                        category: newMemoryCategory,
                        content: newMemoryContent.trim(),
                        timestamp: Date.now(),
                      },
                      ...prev,
                    ]);
                    setNewMemoryContent('');
                    setShowAddMemoryModal(false);
                  }
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-black font-bold rounded-lg hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
