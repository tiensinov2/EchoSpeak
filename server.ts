import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Chat endpoint with structured A1-A2 conversation and pedagogical feedback
app.post('/api/chat', async (req, res) => {
  try {
    const {
      topic,
      history = [],
      userMessage,
      voiceName = 'Kore',
      pace = 'normal',
    } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const systemInstruction = `
You are Emma, a warm, patient, and encouraging AI English Speaking Coach specifically trained for Vietnamese adult & young adult learners at the CEFR A1 - A2 beginner level.
Current Practice Topic: "${topic || 'Daily Conversation'}".

Your mission:
1. Conduct a natural, continuous spoken English conversation at strict CEFR A1 - A2 level:
   - Use clear, short sentences (maximum 8-14 words per sentence).
   - Use the 1500 most common English words.
   - Keep questions simple (open-ended or gentle choices) so the user can easily answer.
   - Ask only ONE follow-up question per turn to avoid overwhelming the learner.
2. Provide immediate pedagogical error correction (Sửa lỗi trực tiếp song ngữ):
   - Analyze the learner's spoken input: "${userMessage}".
   - Detect grammar slips, awkward phrasing, or vocabulary mistakes (common for Vietnamese learners, e.g., missing 's/es', missing past tense, preposition errors, missing 'to be', pronouncing plural 's').
   - Provide a more natural/accurate A1-A2 version ("betterVersion").
   - Explain the correction in friendly, simple Vietnamese ("explanationVi") with clear rules or examples.
   - Add pronunciation tips for words in the sentence that Vietnamese speakers often mispronounce (e.g., ending sounds, silent letters, word stress with simple IPA).
   - Give genuine, encouraging praise in Vietnamese ("praiseVi").
3. Provide instant Vietnamese translation of your English reply ("aiReplyVi") so the learner can check comprehension.
4. Extract 1-3 useful vocabulary words or chunks from the exchange ("keyVocab") suitable for A1-A2.
5. Provide 3 easy, natural suggested reply templates ("suggestedReplies") that the user could say next.

Maintain a polite, cheerful, supportive coaching persona.
`;

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || '' }],
    }));

    const promptText = `
User spoke: "${userMessage}"
Generate your response and evaluation according to the required schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiReplyEn: {
              type: Type.STRING,
              description: 'Your short, natural A1-A2 spoken English response and 1 simple follow-up question.',
            },
            aiReplyVi: {
              type: Type.STRING,
              description: 'Accurate, natural Vietnamese translation of your English response.',
            },
            feedback: {
              type: Type.OBJECT,
              properties: {
                isCorrect: {
                  type: Type.BOOLEAN,
                  description: 'True if user sentence has no significant grammar or vocabulary errors.',
                },
                betterVersion: {
                  type: Type.STRING,
                  description: 'A more natural, grammatically correct way to say what the user meant (A1-A2).',
                },
                explanationVi: {
                  type: Type.STRING,
                  description: 'Friendly, easy-to-understand explanation in Vietnamese about why and how to fix.',
                },
                pronunciationTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '1-2 practical pronunciation reminders or IPA notes for tricky words in their sentence.',
                },
                praiseVi: {
                  type: Type.STRING,
                  description: 'Warm encouragement in Vietnamese praising their effort or progress.',
                },
                fluencyScore: {
                  type: Type.INTEGER,
                  description: 'Estimated score between 60 and 100 for this turn.',
                },
              },
              required: ['isCorrect', 'betterVersion', 'explanationVi', 'pronunciationTips', 'praiseVi', 'fluencyScore'],
            },
            keyVocab: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  type: { type: Type.STRING },
                  meaningVi: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['word', 'type', 'meaningVi', 'ipa', 'example'],
              },
              description: '1 to 3 key vocabulary words or collocations from this turn.',
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 sample answers the learner can say next (simple A1-A2 phrases).',
            },
          },
          required: ['aiReplyEn', 'aiReplyVi', 'feedback', 'keyVocab', 'suggestedReplies'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Empty response from model');
    }

    const parsedData = JSON.parse(textOutput);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to process conversation',
      details: error.message || String(error),
    });
  }
});

// High-quality TTS endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', pace = 'normal' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const paceInstruction =
      pace === 'slow'
        ? 'Speak very slowly, distinctly, and articulately for a beginner ESL student.'
        : 'Speak at a calm, natural, friendly conversational pace for an English learner.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: `Kind, patient English tutor. ${paceInstruction}`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: ['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'].includes(voiceName)
                ? voiceName
                : 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio generated by TTS model' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    // Don't crash client, client will gracefully fallback to Web Speech API
    return res.status(500).json({
      error: 'TTS generation failed',
      details: error.message || String(error),
    });
  }
});

// Audio transcription endpoint for recorded audio (gemini-3.5-transcribe)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: 'Transcribe this English learner speaking clearly. Output only the transcribed English text, without commentary.',
          },
        ],
      },
    });

    const transcript = response.text?.trim() || '';
    return res.json({ transcript });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    return res.status(500).json({
      error: 'Audio transcription failed',
      details: error.message || String(error),
    });
  }
});

// Session summary & comprehensive evaluation endpoint
app.post('/api/session-summary', async (req, res) => {
  try {
    const { topic, exchanges = [], durationSeconds = 0 } = req.body;

    const summaryPrompt = `
Analyze this English conversation practice session between a Vietnamese learner (A1-A2) and AI coach Emma.
Topic: "${topic}"
Duration: ${durationSeconds} seconds
Exchanges:
${JSON.stringify(exchanges, null, 2)}

Provide a motivating, detailed learning report in JSON:
1. Overall score (0-100)
2. Grammar score (0-100)
3. Pronunciation & Vocabulary score (0-100)
4. Overall feedback in Vietnamese (encouraging, highlights strengths and 2 areas to practice next)
5. Top 3 grammar/expression mistakes to remember with corrections and Vietnamese explanations
6. Key vocabulary learned in this session with Vietnamese meanings
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            grammarScore: { type: Type.INTEGER },
            vocabScore: { type: Type.INTEGER },
            overallFeedbackVi: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mistake: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  explanationVi: { type: Type.STRING },
                },
                required: ['mistake', 'correction', 'explanationVi'],
              },
            },
            keyWordsLearned: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  meaningVi: { type: Type.STRING },
                },
                required: ['word', 'ipa', 'meaningVi'],
              },
            },
          },
          required: [
            'overallScore',
            'grammarScore',
            'vocabScore',
            'overallFeedbackVi',
            'strengths',
            'improvements',
            'keyWordsLearned',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/session-summary:', error);
    return res.status(500).json({ error: 'Failed to generate session summary' });
  }
});

// Vite middleware in dev or static files in production
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
