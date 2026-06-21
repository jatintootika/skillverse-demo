import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
// Note: It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

export const askTutor = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `
You are an expert, friendly AI Tutor for SkillGenz (an EdTech platform).
Your goal is to help students learn, NOT to just give them the final answers.
If they ask a direct question like "What is the output of this code?", explain the concepts and ask them what they think happens next.
Keep your responses concise, encouraging, and easy to understand.
Current context (if any): ${context || 'None provided'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in AI Tutor:', error);
    res.status(500).json({ error: 'Failed to communicate with AI Tutor', details: error.message });
  }
};
