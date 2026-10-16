import { useEffect, useState } from 'react';

import { getRecipeById } from '../lib/recipes';
import type { Recipe } from '../types/recipe';

export type RecipeState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'found'; recipe: Recipe };

interface Loaded {
  id: string;
  recipe: Recipe | undefined;
}

export function useRecipe(id: string): RecipeState {
  // The result is stored with the id it belongs to, so a new id reads as loading straight away instead of flashing the previous result.
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    // Stops a stale read from updating state after unmount or an id change (StrictMode mounts twice in dev).
    let ignore = false;

    getRecipeById(id)
      .catch(() => undefined)
      .then((recipe) => {
        if (!ignore) setLoaded({ id, recipe });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (!loaded || loaded.id !== id) return { status: 'loading' };
  if (!loaded.recipe) return { status: 'notFound' };
  return { status: 'found', recipe: loaded.recipe };
}
