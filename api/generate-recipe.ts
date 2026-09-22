import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { Recipe, QuestionAnswer } from '../src/types/recipe';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are turning a home cook's informal account of a dish, plus their answers to clarifying questions, into a structured recipe card.

You will receive the original free-text account and a list of question/answer pairs. Some answers may be empty — the user chose to skip that question. Treat empty answers as missing information, not as meaningful content.

One question asks "Do you wish you'd done anything differently?" If the user answered it with a real suggestion (e.g. more of an ingredient, a different technique, a different time), apply that change directly into the relevant ingredient quantity or step — this recipe should reflect the improved version, not the exact original attempt. If they mention it, don't just note it, actually adjust the ingredient or step it refers to. If they left it blank or said nothing meaningful, make no changes.

Reconstruct the recipe using the original text as the primary source and the other answers to fill gaps. Do not invent quantities, times, or techniques that were never stated anywhere and were not answered — leave those fields null or write "not specified" rather than guessing a specific number.

Write a short description of the dish, around 25 words (max 35). It should read like an enticing but plain summary of what the dish is, e.g. "A rich crispy rice bowl topped with pickled onion, a roasted pepper sauce, and crushed peanuts." This will be shown in full on the recipe page and truncated on a card, so make the opening words count on their own.

Write ingredients as a clean list. Each ingredient has:
- "item": always singular (e.g. "onion", not "onions").
- "quantity": always a number. If the amount is genuinely unspecified (e.g. "salt to taste"), use 0.
- "unit": one of "g", "kg", "ml", "l", "tsp", "tbsp", "pinch of", "clove of", "slice of", "sprig of", or blank if the ingredient is a whole countable item (e.g. onion, egg, bell pepper) rather than a measured quantity.

Write steps as a clear, ordered sequence a person could actually follow, in plain instructional language.

Estimate servings as a number.

Produce a summary: prepTime and cookTime as numbers in minutes. Also include approximate nutritional info per single serving (not for the whole dish): calories, protein, carbs, fat, fiber. Write each nutritional value as a string including its unit — calories in "kcal" (e.g. "420 kcal"), protein/carbs/fat/fiber in grams (e.g. "18g"). Base all of this on the ingredients and quantities given. If a quantity is missing or vague, make a reasonable estimate but do not fabricate false precision — round to sensible values. If servings can't be inferred, estimate a plausible default and state it.

Give the recipe a short, plain title based on the dish.

Return only the structured output. No extra commentary.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    summary: {
      type: Type.OBJECT,
      properties: {
        prepTime: { type: Type.NUMBER },
        cookTime: { type: Type.NUMBER },
        nutritionalInfo: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            carbs: { type: Type.STRING },
            fat: { type: Type.STRING },
            fiber: { type: Type.STRING },
          },
          required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
          propertyOrdering: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
        },
      },
      required: ['prepTime', 'cookTime', 'nutritionalInfo'],
      propertyOrdering: ['prepTime', 'cookTime', 'nutritionalInfo'],
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
        },
        required: ['item', 'quantity', 'unit'],
        propertyOrdering: ['item', 'quantity', 'unit'],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'title',
    'description',
    'servings',
    'summary',
    'ingredients',
    'steps',
  ],
  propertyOrdering: [
    'title',
    'description',
    'servings',
    'summary',
    'ingredients',
    'steps',
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, answers } = req.body ?? {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing "text" field' });
  }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing "answers" field' });
  }

  const qaBlock = (answers as QuestionAnswer[])
    .map(
      ({ question, answer }) =>
        `Q: ${question}\nA: ${answer?.trim() ? answer : '(skipped)'}`,
    )
    .join('\n\n');

  const contents = `Original account:\n${text}\n\nClarifying questions and answers:\n${qaBlock}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
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

    const result: Omit<Recipe, 'id'> = JSON.parse(outputText);
    return res.status(200).json(result);
  } catch (error) {
    console.error('generate-recipe failed', error);
    return res.status(500).json({ error: 'Failed to generate recipe' });
  }
}
