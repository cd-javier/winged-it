import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { Ingredient, NutritionalInfo } from '../src/types/recipe';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are calculating approximate nutritional information for a recipe, given its ingredients, servings, and steps.

You will receive a list of ingredients (each with item, quantity, and unit), the number of servings, and the recipe steps.

Calculate nutritional values per single serving, not for the whole dish. Divide total nutrition by the servings count.

Use the ingredients and quantities as the primary basis for calculation. If a quantity is 0 (meaning unspecified, e.g. "salt to taste"), ignore that ingredient's contribution rather than guessing an amount.

Use the steps only to catch cooking effects that meaningfully change nutrition — mainly oil absorption from frying, or significant calorie concentration from methods like deep-frying. Do not attempt to model precise physical changes like water loss from reduction or roasting. If the method has no meaningful effect on nutrition (e.g. mixing, boiling, steaming), ignore it.

Make reasonable estimates where quantities are vague, but do not fabricate false precision — round to sensible values.

Write each nutritional value as a string including its unit: calories in "kcal" (e.g. "420 kcal"), protein/carbs/fat/fiber in grams (e.g. "18g").

Return only the structured output. No extra commentary.`;

const RESPONSE_SCHEMA = {
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
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients, servings, steps } = req.body ?? {};
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Missing "ingredients" field' });
  }
  if (typeof servings !== 'number' || servings <= 0) {
    return res.status(400).json({ error: 'Missing "servings" field' });
  }
  if (!Array.isArray(steps)) {
    return res.status(400).json({ error: 'Missing "steps" field' });
  }

  const ingredientsBlock = (ingredients as Ingredient[])
    .map(({ item, quantity, unit }) =>
      `- ${quantity} ${unit} ${item}`.replace(/\s+/g, ' ').trim(),
    )
    .join('\n');

  const stepsBlock = (steps as string[])
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n');

  const contents = `Servings: ${servings}\n\nIngredients:\n${ingredientsBlock}\n\nSteps:\n${stepsBlock}`;

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

    const result = JSON.parse(outputText) as NutritionalInfo;
    return res.status(200).json(result);
  } catch (error) {
    console.error('recalculate-nutritional-info failed', error);
    return res
      .status(500)
      .json({ error: 'Failed to recalculate nutritional info' });
  }
}
