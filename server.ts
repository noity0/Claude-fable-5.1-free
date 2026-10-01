import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client according to instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import {
  CLAUDE_FABLE_BASE_SYSTEM_INSTRUCTION,
  getModelSystemInstruction,
} from './src/constants/prompt';

// Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    model: 'claude-fable-5-1',
    family: 'Mythos-class Tier',
    engine: 'gemini-3.8-flash',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Chat completion streaming endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    model = 'claude-fable-5-1',
    memoryContext = '',
    customSystemPrompt = '',
    style = 'normal',
    enableSearch = false,
  } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check the AI Studio Secrets panel.',
    });
    return;
  }

  // Set SSE headers for real-time streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    let fullSystemInstruction = getModelSystemInstruction(model);

    if (style === 'concise') {
      fullSystemInstruction += `\nUser Tone Preference: Be exceptionally concise. Skip preamble and filler. Answer directly in the fewest words necessary.`;
    } else if (style === 'explanatory') {
      fullSystemInstruction += `\nUser Tone Preference: Provide clear, educational explanations with helpful analogies and step-by-step clarity.`;
    } else if (style === 'formal') {
      fullSystemInstruction += `\nUser Tone Preference: Maintain a polished, professional, executive register.`;
    }

    if (memoryContext && memoryContext.trim()) {
      fullSystemInstruction += `\n\n<user_memory_filesystem>\n${memoryContext}\n</user_memory_filesystem>\nSilently apply these memories where directly relevant. Do not cite the memory system explicitly.`;
    }

    if (customSystemPrompt && customSystemPrompt.trim()) {
      fullSystemInstruction += `\n\n<additional_instructions>\n${customSystemPrompt}\n</additional_instructions>`;
    }

    // Convert client messages to Gemini contents format
    // Filter and map turns
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'No messages provided' })}\n\n`);
      res.end();
      return;
    }

    // Tools configuration
    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const config: any = {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
      topP: 0.95,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    // Helper to stream content with gemini-2.5-flash (ultra-fast & reliable) with fallbacks
    const streamModel = async (modelName: string) => {
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
    };

    try {
      await streamModel('gemini-2.5-flash');
    } catch (primaryErr: any) {
      console.warn('gemini-2.5-flash error, trying gemini-3.1-flash-lite fallback:', primaryErr?.message);
      try {
        await streamModel('gemini-3.1-flash-lite');
      } catch (secondaryErr: any) {
        console.warn('gemini-3.1-flash-lite error, trying gemini-3.8-flash fallback:', secondaryErr?.message);
        await streamModel('gemini-3.8-flash');
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    let msg = error?.message || 'An error occurred while generating response with Claude Fable 5.1 engine.';
    try {
      if (typeof msg === 'string' && (msg.startsWith('{') || msg.includes('{"error"'))) {
        const parsed = JSON.parse(msg);
        if (parsed.error?.message) {
          msg = parsed.error.message;
        }
      }
    } catch {
      // keep msg as is
    }
    res.write(
      `data: ${JSON.stringify({
        error: msg,
      })}\n\n`
    );
    res.end();
  }
});

// Memory extraction endpoint to simulate Claude's durable memory pass
app.post('/api/memory/extract', async (req: Request, res: Response) => {
  const { messages, currentMemories } = req.body;
  if (!process.env.GEMINI_API_KEY || !messages || messages.length === 0) {
    res.json({ newFacts: [] });
    return;
  }

  try {
    const prompt = `
You are the memory subsystem for Claude Fable 5.1.
Review the following recent conversation exchange and determine if there are any durable user facts that should be filed to the memory filesystem.

Remember the rules:
- Durable facts only (user's name, role, enduring preferences, stable projects).
- NEVER file: passwords, payment details, protected attributes (race, health conditions/diagnoses), or transient day-to-day bugs.
- Existing memories:
${JSON.stringify(currentMemories, null, 2)}

Recent exchange:
${messages.slice(-4).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

If durable facts should be updated or added, respond with a JSON array of objects:
[
  {
    "path": "/profile.md" | "/preferences.md" | "/topics/...",
    "action": "append" | "replace",
    "content": "- [stated] user stated fact..."
  }
]
If nothing meets the bar for durable memory, respond with [].
Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ updates: parsed });
  } catch (err) {
    console.error('Memory extract error:', err);
    res.json({ updates: [] });
  }
});

// Serve frontend in dev or prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Claude Fable 5.1 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
