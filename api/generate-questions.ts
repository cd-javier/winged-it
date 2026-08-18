import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are helping a home cook document a recipe they made from memory, without a written recipe.
You will receive a free-text, informal account of what they cooked.
First, decide if this account describes an actual cooking process at all: does it name a dish or ingredients being combined/cooked, with at least some sequence of action? Reject only if it's fundamentally not a recipe attempt (e.g. empty, gibberish, unrelated content, or so minimal there's no cooking process to reconstruct at all — like a single ingredient name with no action).
Do NOT reject just because detail is missing or vague — that's what the clarifying questions are for. Only reject if there's no usable recipe skeleton to ask questions about.
If usable is false: set "reason" to a short, specific, user-facing explanation of what's missing (e.g. "This doesn't describe any cooking steps yet, just an ingredient list."). Return an empty questions array.
If usable is true: identify up to 4 points in their account that are vague or missing, limited to these categories:
- quantity: an ingredient amount is unclear or missing
- timing: a cooking time, oven temperature, or duration is missing or vague
- technique: a cooking method or action is ambiguous
- ingredient: an ingredient is named ambiguously or a substitution/identity is unclear
For each issue, write ONE short, specific question referencing what they actually wrote. Don't ask generic questions or questions about things already stated clearly. If fewer than 4 real issues exist, return fewer — don't invent filler.
Each question must be answerable using only the original text — do not depend on answers to other questions.
Return only the structured output. No extra commentary.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    usable: { type: Type.BOOLEAN },
    reason: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ['quantity', 'timing', 'technique', 'ingredient'],
          },
          question: { type: Type.STRING },
        },
        required: ['id', 'category', 'question'],
        propertyOrdering: ['id', 'category', 'question'],
      },
      maxItems: 4,
    },
  },
  required: ['usable', 'reason', 'questions'],
  propertyOrdering: ['usable', 'reason', 'questions'],
};

interface GenerateQuestionsResult {
  usable: boolean;
  reason: string;
  questions: Array<{
    id: string;
    category: 'quantity' | 'timing' | 'technique' | 'ingredient';
    question: string;
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body ?? {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing "text" field' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 65536,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const outputText = response.text;
    if (!outputText) {
      return res.status(502).json({ error: 'Empty response from model' });
    }

    const result = JSON.parse(outputText) as GenerateQuestionsResult;
    return res.status(200).json(result);
  } catch (error) {
    console.error('generate-questions failed', error);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
}
