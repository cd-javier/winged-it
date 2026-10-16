import { useEffect, useState } from 'react';

import { getAllRecipes } from '../lib/recipes';
import type { Recipe } from '../types/recipe';

/** Recipes newest first. `loading` is true until the first read finishes. */
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stops a stale read from updating state after unmount (StrictMode mounts twice in dev).
    let ignore = false;

    getAllRecipes().then((all) => {
      if (ignore) return;
      // Storage is oldest first, so reverse a copy to show the newest recipe on top.
      setRecipes([...all].reverse());
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  return { recipes, loading };
}
