export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'tsp'
  | 'tbsp'
  | 'pinch'
  | 'clove'
  | 'slice'
  | 'sprig'
  | 'whole';

export interface Ingredient {
  item: string;
  quantity: number;
  unit: IngredientUnit;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/** The recipe and nutrition values a recalculation starts from. Sent to the API so only the differences are re-estimated. */
export interface NutritionPrevious {
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  nutritionalInfo: NutritionalInfo;
}

export type QuestionCategory =
  | 'quantity'
  | 'timing'
  | 'technique'
  | 'ingredient'
  | 'servings';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface GenerateQuestionsResult {
  usable: boolean;
  reason: string;
  questions: Question[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  summary: {
    prepTime: number;
    cookTime: number;
    /** Missing on recipes entered manually without a calculation. */
    nutritionalInfo?: NutritionalInfo;
  };
  ingredients: Ingredient[];
  steps: string[];
  image?: string;
}
