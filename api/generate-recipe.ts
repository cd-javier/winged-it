import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError, GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { Recipe, QuestionAnswer } from '../src/types/recipe';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are turning a home cook's informal account of a dish, plus their answers to clarifying questions, into a structured recipe card. Use British English spelling (yoghurt, chilli, aubergine).

Input: the original free-text account and question/answer pairs. Answers marked "(skipped)" are missing information, not content.

Sources: the original account comes first; the answers fill gaps. Keep every number the user stated exactly (quantities, times, tin sizes). Where a quantity or time is missing, estimate a realistic one, since a recipe needs them. Do not add ingredients or techniques that were never mentioned.

Improvements: if the user says anywhere, in the account or in the answer to "Do you wish you'd done anything differently?", that they would change something, apply it to the relevant ingredient or step. The recipe is the improved version. Make a modest, round adjustment, and let it override the original number it refers to. If nothing is said, change nothing.

Title: short, plain name of the dish.

Description: one factual sentence of 15 to 25 words saying what the dish is and what it is served with. Do not start with "This" or repeat the title; open with the defining ingredients or style (e.g. "Spiced chickpeas and wilted spinach in a tomato sauce, served with toasted bread and yoghurt."). No promotional adjectives (hearty, delicious, satisfying, comforting). The opening words must stand alone because cards truncate it.

Ingredients, in order of first use:
- "item": lowercase, as on a shopping list, no quantity. Singular when the unit is whole, clove, slice or sprig; otherwise the natural form ("chopped tomatoes", "chickpeas", "spinach", "olive oil"). Keep a short state if the user gave one ("tinned chickpeas, drained"). If the same ingredient is used in separate parts of the dish, list each separately and add its role to the item, e.g. "butter, for the filling" and "butter, for the crumble topping".
- "quantity": required number. If unspecified (e.g. salt to taste), use 0 with unit "pinch".
- "unit": one of "g", "kg", "ml", "l", "tsp", "tbsp", "pinch", "clove", "slice", "sprig", "whole". Use "whole" for countable items (onion, egg, lemon).

Steps: ordered, imperative, plain language, ingredient names only, without quantities or state words (write "the chickpeas", not "the tinned chickpeas, drained"). Include serving as the last step if the user described it. Write oven temperatures in °C and say "fan" when the cook did (e.g. "200°C fan"). If an oven is used, the first step is to preheat it.

Servings: a whole number inferred from the quantities; use 2 if it can't be inferred.

Summary: prepTime is minutes before cooking starts; cookTime is total minutes of cooking and waiting in the steps. Round both times to the nearest 5 minutes. Both must be consistent with the steps. Nutrition is per single serving, calculated from the final ingredient list: calories in kcal, protein/carbs/fat/fiber in grams, numbers only, rounded to sensible values.

Return only the structured output. No commentary.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: {
            type: Type.STRING,
            enum: [
              'g',
              'kg',
              'ml',
              'l',
              'tsp',
              'tbsp',
              'pinch',
              'clove',
              'slice',
              'sprig',
              'whole',
            ],
          },
        },
        required: ['item', 'quantity', 'unit'],
        propertyOrdering: ['item', 'quantity', 'unit'],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        prepTime: { type: Type.NUMBER },
        cookTime: { type: Type.NUMBER },
        nutritionalInfo: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
          },
          required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
          propertyOrdering: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
        },
      },
      required: ['prepTime', 'cookTime', 'nutritionalInfo'],
      propertyOrdering: ['prepTime', 'cookTime', 'nutritionalInfo'],
    },
    description: { type: Type.STRING },
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
    'servings',
    'ingredients',
    'steps',
    'summary',
    'description',
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
    if (error instanceof ApiError && error.status === 429) {
      return res.status(429).json({ error: 'Rate limited' });
    }
    return res.status(500).json({ error: 'Failed to generate recipe' });
  }
}
