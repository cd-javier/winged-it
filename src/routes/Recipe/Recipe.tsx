import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import Button from '../../components/Button/Button';
import Dialog from '../../components/Dialog/Dialog';
import ErrorDialog from '../../components/ErrorDialog/ErrorDialog';
import IconButton from '../../components/IconButton/IconButton';
import {
  ChevronLeftIcon,
  DownloadIcon,
  KebabIcon,
  PencilIcon,
  TrashIcon,
} from '../../components/Icons/Icons';
import IngredientList from '../../components/IngredientList/IngredientList';
import MenuItem from '../../components/MenuItem/MenuItem';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import NutritionTable from '../../components/NutritionTable/NutritionTable';
import RecipeHero from '../../components/RecipeHero/RecipeHero';
import RecipeInfoCard from '../../components/RecipeInfoCard/RecipeInfoCard';
import RecipeSection from '../../components/RecipeSection/RecipeSection';
import StepList from '../../components/StepList/StepList';
import { useRecipe } from '../../hooks/useRecipe';
import { ApiError } from '../../lib/api';
import { deleteRecipe } from '../../lib/recipes';
import { scaleIngredient } from '../../lib/scaleIngredient';
import type { Recipe as RecipeData } from '../../types/recipe';
import styles from './Recipe.module.css';

type Modal = 'menu' | 'confirmDelete' | 'deleteError';

interface RecipeViewProps {
  recipe: RecipeData;
}

function RecipeView({ recipe }: RecipeViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [servings, setServings] = useState(recipe.servings);
  const [modal, setModal] = useState<Modal | null>(null);

  // Scaled for display only: the recipe object is never changed or saved.
  const ingredients = useMemo(
    () => recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, recipe.servings, servings)),
    [recipe.ingredients, recipe.servings, servings],
  );

  // 'default' means this is the first entry in the app's history, so there is nowhere to go back to.
  const goBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const closeModal = () => setModal(null);
  // Dialog's native close event also fires after we close it ourselves, a moment after the next modal may already be open. Only clear the modal if it is still this one.
  const closeIfOpen = (name: Modal) => () => setModal((current) => (current === name ? null : current));

  const confirmDelete = async () => {
    setModal(null);
    try {
      await deleteRecipe(recipe.id);
      navigate('/', { replace: true });
    } catch {
      setModal('deleteError');
    }
  };

  return (
    <article className={styles.recipe}>
      <RecipeHero
        image={recipe.image}
        start={
          <IconButton
            icon={<ChevronLeftIcon />}
            label="back"
            variant="overlay"
            size="compact"
            onClick={goBack}
          />
        }
        end={
          <IconButton
            icon={<KebabIcon />}
            label="recipe options"
            variant="overlay"
            size="compact"
            aria-haspopup="dialog"
            onClick={() => setModal('menu')}
          />
        }
      />

      <header className={styles.header}>
        <h1 className={styles.title}>{recipe.title}</h1>
        <p className={styles.description}>{recipe.description}</p>
      </header>

      <RecipeInfoCard
        prepTime={recipe.summary.prepTime}
        cookTime={recipe.summary.cookTime}
        servings={servings}
        onServingsChange={setServings}
      />

      <RecipeSection title="Ingredients">
        <IngredientList ingredients={ingredients} />
      </RecipeSection>
      <RecipeSection title="Steps">
        <StepList steps={recipe.steps} />
      </RecipeSection>
      <RecipeSection title="Nutritional Info">
        <NutritionTable nutritionalInfo={recipe.summary.nutritionalInfo} />
      </RecipeSection>

      <Dialog open={modal === 'menu'} onClose={closeIfOpen('menu')} label="Recipe options">
        {/* Edit and Export PDF are built in the next task, so for now they only close the sheet. */}
        <MenuItem icon={<PencilIcon />} title="Edit" onClick={closeModal} />
        <MenuItem icon={<DownloadIcon />} title="Export PDF" onClick={closeModal} />
        <MenuItem
          icon={<TrashIcon />}
          title="Delete"
          onClick={() => setModal('confirmDelete')}
        />
      </Dialog>

      <MessageDialog
        open={modal === 'confirmDelete'}
        onClose={closeIfOpen('confirmDelete')}
        variant="error"
        icon={<TrashIcon />}
        title="Are you sure?"
        actions={
          <>
            <Button variant="outline" onClick={closeModal}>
              cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              delete
            </Button>
          </>
        }
      >
        <p>If you delete this recipe it will be lost forever.</p>
      </MessageDialog>

      <ErrorDialog
        open={modal === 'deleteError'}
        message={new ApiError('generic').message}
        onRetry={confirmDelete}
        onClose={closeIfOpen('deleteError')}
      />
    </article>
  );
}

export default function Recipe() {
  const { id = '' } = useParams();
  const state = useRecipe(id);

  if (state.status === 'loading') return null;

  if (state.status === 'notFound') {
    return (
      <section className={styles.notFound}>
        <p>Recipe not found</p>
        <Link to="/">Back to home</Link>
      </section>
    );
  }

  // Keyed by id so the servings and modal state start fresh for each recipe.
  return <RecipeView key={state.recipe.id} recipe={state.recipe} />;
}
