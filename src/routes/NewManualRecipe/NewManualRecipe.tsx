import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RecipeForm from '../../components/Form/RecipeForm/RecipeForm';
import { useGoBack } from '../../hooks/useGoBack';
import { emptyFormValues } from '../../lib/recipeForm';
import { addRecipe } from '../../lib/recipes';

export default function NewManualRecipe() {
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  // Built once: the form compares against these values to know whether anything changed.
  const [initialValues] = useState(emptyFormValues);

  return (
    <RecipeForm
      heading="Add recipe manually"
      initialValues={initialValues}
      onSubmit={async (data) => {
        const saved = await addRecipe(data);
        return () => navigate(`/recipe/${saved.id}`, { replace: true });
      }}
      onCancel={goBack}
    />
  );
}
