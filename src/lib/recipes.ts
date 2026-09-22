import localforage from 'localforage';
import type { Recipe } from '../types/recipe';

const RECIPES_KEY = 'recipes';

let cache: Recipe[] | null = null;

async function loadCache(): Promise<Recipe[]> {
  if (!cache) {
    cache = (await localforage.getItem<Recipe[]>(RECIPES_KEY)) ?? [];
  }
  return cache;
}

async function saveCache(recipes: Recipe[]): Promise<void> {
  cache = recipes;
  await localforage.setItem(RECIPES_KEY, recipes);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  return loadCache();
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const recipes = await getAllRecipes();
  return recipes.find((recipe) => recipe.id === id);
}

export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const recipes = await loadCache();
  const newRecipe: Recipe = { ...recipe, id: crypto.randomUUID() };
  await saveCache([...recipes, newRecipe]);
  return newRecipe;
}

export async function editRecipe(id: string, recipe: Recipe): Promise<void> {
  const recipes = await loadCache();
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error(`Recipe with id ${id} not found`);
  }
  const updated = [...recipes];
  updated[index] = recipe;
  await saveCache(updated);
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await loadCache();
  const index = recipes.findIndex((r) => r.id === id);
  if (index !== -1) {
    await saveCache(recipes.filter((_, i) => i !== index));
  }
}
