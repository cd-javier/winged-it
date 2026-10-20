import { useState } from 'react';
import { useParams } from 'react-router-dom';

import RecipeForm from '../../components/Form/RecipeForm/RecipeForm';
import RecipeNotFound from '../../components/RecipeNotFound/RecipeNotFound';
import { useGoBack } from '../../hooks/useGoBack';
import { useRecipe } from '../../hooks/useRecipe';
import { valuesFromRecipe } from '../../lib/recipeForm';
import { editRecipe } from '../../lib/recipes';
import type { Recipe } from '../../types/recipe';

interface EditFormProps {
  recipe: Recipe;
}

function EditForm({ recipe }: EditFormProps) {
  // Back to the recipe page, which loads the saved recipe again when it mounts.
  const goBack = useGoBack(`/recipe/${recipe.id}`);
  // Built once: the form compares against these values to know whether anything changed.
  const [initialValues] = useState(() => valuesFromRecipe(recipe));

  return (
    <RecipeForm
      heading="Edit recipe"
      initialValues={initialValues}
      onSubmit={async (data) => {
        await editRecipe(recipe.id, { ...data, id: recipe.id });
        return goBack;
      }}
      onCancel={goBack}
    />
  );
}

export default function EditRecipe() {
  const { id = '' } = useParams();
  const state = useRecipe(id);

  if (state.status === 'loading') return null;
  if (state.status === 'notFound') return <RecipeNotFound />;

  // Keyed by id so the form starts fresh for each recipe.
  return <EditForm key={state.recipe.id} recipe={state.recipe} />;
}
