import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError, GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { GenerateQuestionsResult } from '../src/types/recipe';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are helping a home cook document a recipe they made from memory, without a written recipe.
You will receive a free-text, informal account of what they cooked.
First, decide if this account describes an actual cooking process at all: does it name a dish or ingredients being combined/cooked, with at least some sequence of action? Reject only if it's fundamentally not a recipe attempt (e.g. empty, gibberish, unrelated content, or so minimal there's no cooking process to reconstruct at all, like a single ingredient name with no action).
Do NOT reject just because detail is missing or vague. That's what the clarifying questions are for.
If usable is false: set "reason" to a short, specific, user-facing explanation of what's missing (e.g. "This doesn't describe any cooking steps yet, just an ingredient list."). Return an empty questions array.

If usable is true: write up to 4 questions that would most improve a recipe reconstructed from this account. Categories: quantity, timing, technique, ingredient, servings.

Choose them by impact. Ask yourself: if a reader had to guess this, how much would a wrong guess change the finished dish or stop them repeating it?
- High impact: the amount of a main ingredient when none is given; amounts of cooking fat, liquid or bulky ingredients when missing or only vague ("a splash", "a big handful"); vague amounts of what defines the flavour ("some", "a bit"); how long the longest or most important stage ran ("for a while", "until done"), or how long the first stage ran if the cook gave no cue (e.g. frying an onion); a missing doneness cue for the key stage; how many people it served, if there is no hint.
- Low impact, do not ask: heat level for ordinary frying, simmering or roasting; standard pack sizes (a tin, a stock cube, a pot of yoghurt); how something was cut or prepared when it doesn't change the result; garnishes and sides; anything the cook already estimated ("maybe a teaspoon"); anything a competent cook would do by default.

Spread the questions: at most one per ingredient, at most two per category, covering different stages of the dish rather than clustering on one ingredient. Order them in the order of the cooking process.

Wording: one question asks one thing, under 15 words. Quote the cook's own words where it helps. Make it easy to answer from memory by asking for a rough amount with a familiar anchor (e.g. "Roughly how much oil did you fry the onion in?"). No "X or Y" compound questions, no jargon. Each question must be answerable without the answers to other questions.
Do not ask whether they would change anything. That question is added separately.

If fewer than 4 high-impact gaps exist, return fewer. Never pad with low-impact questions.
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
            enum: ['quantity', 'timing', 'technique', 'ingredient', 'servings'],
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
    if (error instanceof ApiError && error.status === 429) {
      return res.status(429).json({ error: 'Rate limited' });
    }
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
}
