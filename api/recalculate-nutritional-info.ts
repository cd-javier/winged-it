import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError, GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { Ingredient, NutritionalInfo, NutritionPrevious } from '../src/types/recipe';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are calculating approximate nutritional information for a recipe, given its ingredients, servings, and steps.

You will receive a list of ingredients (each with item, quantity, and unit), the number of servings, and the recipe steps.

Calculate nutritional values per single serving, not for the whole dish. Divide total nutrition by the servings count.

Use the ingredients and quantities as the primary basis for calculation. If a quantity is 0 (meaning unspecified, e.g. "salt to taste"), ignore that ingredient's contribution rather than guessing an amount.

Use the steps only to catch cooking effects that meaningfully change nutrition — mainly oil absorption from frying, or significant calorie concentration from methods like deep-frying. Do not attempt to model precise physical changes like water loss from reduction or roasting. If the method has no meaningful effect on nutrition (e.g. mixing, boiling, steaming), ignore it.

Make reasonable estimates where quantities are vague, but do not fabricate false precision — round to sensible values.

Write each nutritional value as a number only, with no units: calories in kcal, protein/carbs/fat/fiber in grams.

Return only the structured output. No extra commentary.`;

// Used when the request has `previous`: only the effect of the differences is estimated.
const SYSTEM_INSTRUCTION_DELTA = `You are updating approximate nutritional information for a recipe that has been edited.

You will receive the previous recipe (ingredients, servings, and steps), its previous nutritional values, and the new recipe in the same format.

The previous nutritional values are per serving for the previous recipe. Work out only the nutritional effect of what changed between the previous recipe and the new recipe: ingredients added, removed, or with a different quantity or unit, steps that meaningfully change nutrition (mainly oil absorption from frying), and a different number of servings. Keep the contribution of unchanged ingredients and steps the same as in the previous values. Do not re-estimate them.

If the number of servings changed, adjust the per-serving values accordingly.

Ingredients with a quantity of 0 are seasoning to taste and are ignored.

Make reasonable estimates where quantities are vague, but do not fabricate false precision. Round to sensible values.

Return the full new per-serving values for the new recipe. Write each nutritional value as a number only, with no units: calories in kcal, protein/carbs/fat/fiber in grams.

Return only the structured output. No extra commentary.`;

const RESPONSE_SCHEMA = {
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
};

function formatRecipe(ingredients: Ingredient[], servings: number, steps: string[]): string {
  const ingredientsBlock = ingredients
    .map(({ item, quantity, unit }) =>
      `- ${quantity} ${unit} ${item}`.replace(/\s+/g, ' ').trim(),
    )
    .join('\n');

  const stepsBlock = steps.map((step, index) => `${index + 1}. ${step}`).join('\n');

  return `Servings: ${servings}\n\nIngredients:\n${ingredientsBlock}\n\nSteps:\n${stepsBlock}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNutritionPrevious(value: unknown): value is NutritionPrevious {
  if (typeof value !== 'object' || value === null) return false;
  const { ingredients, steps, servings, nutritionalInfo } = value as Record<string, unknown>;
  if (!Array.isArray(ingredients) || ingredients.length === 0) return false;
  const ingredientsValid = ingredients.every((ingredient) => {
    if (typeof ingredient !== 'object' || ingredient === null) return false;
    const { item, quantity, unit } = ingredient as Record<string, unknown>;
    return typeof item === 'string' && isFiniteNumber(quantity) && typeof unit === 'string';
  });
  if (!ingredientsValid) return false;
  if (!Array.isArray(steps) || !steps.every((step) => typeof step === 'string')) return false;
  if (!isFiniteNumber(servings) || servings <= 0) return false;
  if (typeof nutritionalInfo !== 'object' || nutritionalInfo === null) return false;
  const info = nutritionalInfo as Record<string, unknown>;
  return ['calories', 'protein', 'carbs', 'fat', 'fiber'].every((key) => isFiniteNumber(info[key]));
}

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

  const { previous } = req.body;
  if (previous !== undefined && !isNutritionPrevious(previous)) {
    return res.status(400).json({ error: 'Invalid "previous" field' });
  }

  const newRecipe = formatRecipe(ingredients as Ingredient[], servings, steps as string[]);
  const contents = previous
    ? `Previous recipe\n${formatRecipe(previous.ingredients, previous.servings, previous.steps)}\n\nPrevious nutritional values per serving: calories ${previous.nutritionalInfo.calories} kcal, protein ${previous.nutritionalInfo.protein} g, carbs ${previous.nutritionalInfo.carbs} g, fat ${previous.nutritionalInfo.fat} g, fiber ${previous.nutritionalInfo.fiber} g\n\nNew recipe\n${newRecipe}`
    : newRecipe;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: previous ? SYSTEM_INSTRUCTION_DELTA : SYSTEM_INSTRUCTION,
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
    if (error instanceof ApiError && error.status === 429) {
      return res.status(429).json({ error: 'Rate limited' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to recalculate nutritional info' });
  }
}
