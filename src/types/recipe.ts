export interface Ingredient {
  item: string;
  quantity: number;
  unit: string;
}

export interface NutritionalInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

export type QuestionCategory = 'quantity' | 'timing' | 'technique' | 'ingredient';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  summary: {
    prepTime: number;
    cookTime: number;
    nutritionalInfo: NutritionalInfo;
  };
  ingredients: Ingredient[];
  steps: string[];
}
