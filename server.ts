import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// System prompt for JARVIS
const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), a cutting-edge native Android AI assistant.
Your characteristics:
1. Highly capable, crisp, courteous, confident, and proactive.
2. Bilingual: Flawless in both English and Hindi (and Hinglish if user speaks in Hinglish). Respond in the language the user speaks to you in.
3. System Awareness: You run as an Android foreground service with a floating WindowManager overlay bubble, Room memory, and safe intent actions.
4. When asked to perform device actions (e.g., set alarm, open YouTube, check battery, take note, create reminder), confirm clearly and output an action tag if applicable:
   [ACTION:OPEN_APP app="..."]
   [ACTION:SET_ALARM time="..."]
   [ACTION:SET_REMINDER text="..." time="..."]
   [ACTION:SAVE_MEMORY text="..." category="..."]
   [ACTION:CHECK_BATTERY]
   [ACTION:OPEN_SETTINGS section="..."]
5. Device Context: MediaTek Octa-Core, 6GB RAM, Android 16 (armeabi-v7a / arm64-v8a compatible).
6. Keep responses conversational, concise for speech output, with sharp futuristic intelligence.`;

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, language = 'en-IN', memory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Build context with stored memories
    let systemInstruction = JARVIS_SYSTEM_PROMPT;
    if (Array.isArray(memory) && memory.length > 0) {
      systemInstruction += `\n\nUser Approved Memory Context:\n${memory.map((m: any) => `- [${m.category || 'General'}]: ${m.content}`).join('\n')}`;
    }

    if (language.startsWith('hi')) {
      systemInstruction += '\nUser preference: Hindi language prioritized.';
    }

    if (!aiClient) {
      // Fallback response if GEMINI_API_KEY is not configured yet
      const defaultReplies: Record<string, string> = {
        hi: `नमस्ते! मैं जार्विस (JARVIS) हूँ। आपका पर्सनल एंड्रॉइड असिस्टेंट सक्रिय है। बैकग्राउंड सर्विस और फ्लोटिंग बबल काम कर रहे हैं। आप मुझसे कोई भी प्रश्न पूछ सकते हैं या कोई टास्क दे सकते हैं।`,
        en: `Greetings. I am JARVIS, your personal Android AI assistant. Running on Android 16 with overlay bubble and native services ready. How may I assist you today, Sir?`
      };
      const reply = language.startsWith('hi') ? defaultReplies.hi : defaultReplies.en;
      res.json({ reply, source: 'offline-core' });
      return;
    }

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "JARVIS online. Standing by.";
    res.json({ reply: replyText, source: 'gemini-2.5-flash' });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({
      error: 'Failed to process AI response',
      details: err.message,
      fallback: 'JARVIS: Apologies, temporary neural link disruption. Local diagnostics show all device services operational.'
    });
  }
});

// System diagnostic API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    assistant: 'JARVIS',
    version: '2.5.0-android16',
    geminiConfigured: !!apiKey,
    targetAbi: 'armeabi-v7a / arm64-v8a',
    targetOs: 'Android 16 (API 36)'
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`JARVIS Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
