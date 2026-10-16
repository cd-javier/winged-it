import { useState } from 'react';

import Button from '../../components/Button/Button';
import Dialog from '../../components/Dialog/Dialog';
import FirstRecipe from '../../components/FirstRecipe/FirstRecipe';
import IconButton from '../../components/IconButton/IconButton';
import { PencilIcon, PlusIcon, WandIcon } from '../../components/Icons/Icons';
import IngredientList from '../../components/IngredientList/IngredientList';
import Loader from '../../components/Loader/Loader';
import Logo from '../../components/Logo/Logo';
import MenuItem from '../../components/MenuItem/MenuItem';
import NutritionTable from '../../components/NutritionTable/NutritionTable';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeSection from '../../components/RecipeSection/RecipeSection';
import StepList from '../../components/StepList/StepList';
import * as Icons from '../../components/Icons/Icons';
import type { Ingredient, NutritionalInfo } from '../../types/recipe';
import styles from './DevComponents.module.css';

// Temporary page to check the shared components by eye. Delete when real screens exist.

const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="152" height="152"><rect width="152" height="152" fill="#C9A66B"/><circle cx="76" cy="76" r="50" fill="#3b2f1c"/><circle cx="76" cy="76" r="22" fill="#f4d35e"/></svg>'
)}`;

const LONG_TITLE = 'Crispy Rice Bowl with Pickled Red Onion, Roasted Pepper Sauce and Crushed Peanuts';
const LONG_DESCRIPTION =
  'A rich crispy rice bowl topped with quick pickled red onion, a smoky roasted pepper and garlic sauce, crushed peanuts, fresh spring onion and a soft fried egg, finished with a drizzle of chilli oil for extra warmth';

const INGREDIENTS: Ingredient[] = [
  { item: 'basmati rice', quantity: 60, unit: 'g' },
  { item: 'red onion', quantity: 1, unit: 'whole' },
  { item: 'garlic', quantity: 2, unit: 'clove' },
  { item: 'salt', quantity: 0, unit: 'pinch' },
];

const STEPS = [
  'Slice the onion thinly and toss with rice vinegar and a pinch of salt. Set aside to pickle',
  'Heat oil in a pan and press the cooked rice into an even layer. Fry undisturbed until crisp on the bottom, then flip carefully in sections and fry the other side until golden and crunchy all over, adding a little more oil if the pan looks dry',
  ...Array.from({ length: 9 }, (_, i) => `Extra step ${i + 3}`),
];

const NUTRITION: NutritionalInfo = { calories: 240, protein: 16, carbs: 58, fat: 20, fiber: 4 };

function DialogDemo() {
  const [open, setOpen] = useState<'bottom' | 'center' | null>(null);
  const close = () => setOpen(null);

  return (
    <div className={styles.row}>
      <Button variant="outline" onClick={() => setOpen('bottom')}>
        bottom dialog
      </Button>
      <Button variant="outline" onClick={() => setOpen('center')}>
        center dialog
      </Button>
      <Dialog open={open === 'bottom'} onClose={close} placement="bottom" label="Menu demo">
        <MenuItem
          icon={<WandIcon />}
          title="Wing it"
          description="Type what you did and let us do the rest"
          onClick={close}
        />
        <MenuItem
          icon={<PencilIcon />}
          title="Enter manually"
          description="Create the recipe entering every detail manually"
          onClick={close}
        />
      </Dialog>
      <Dialog open={open === 'center'} onClose={close} placement="center" label="Centre demo">
        <p>Unstyled centre dialog</p>
      </Dialog>
    </div>
  );
}

function Showcase() {
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Button variant="primary">continue</Button>
        <Button variant="outline">continue</Button>
        <Button variant="secondary">continue</Button>
        <Button variant="destructive">continue</Button>
        <Button variant="primary" disabled>
          disabled
        </Button>
        <Button variant="outline" fullWidth>
          full width
        </Button>
      </div>
      <div className={styles.row}>
        <IconButton icon={<PlusIcon />} label="add recipe" />
        <IconButton icon={<PlusIcon />} label="add recipe" disabled />
        <Logo className={styles.logo} />
        <Loader className={styles.loader} />
      </div>
      <DialogDemo />
      <FirstRecipe onClick={() => undefined} />
      <RecipeCard
        title="Crispy Rice Bowl with Pickled Onion"
        description="A rich crispy rice bowl topped with pickled onion, a roasted pepper sauce, and crushed peanuts, finished with a soft egg."
        prepTime={15}
        cookTime={20}
        image={PHOTO}
        to="/recipe/1"
      />
      <RecipeCard
        title="Crispy Rice Bowl with Pickled Onion"
        description="A rich crispy rice bowl topped with pickled onion, a roasted pepper sauce, and crushed peanuts, finished with a soft egg."
        prepTime={15}
        cookTime={20}
        to="/recipe/1"
      />
      <RecipeCard
        title={LONG_TITLE}
        description={LONG_DESCRIPTION}
        prepTime={125}
        cookTime={180}
        image={PHOTO}
        to="/recipe/1"
      />
      <RecipeSection title="Ingredients">
        <IngredientList ingredients={INGREDIENTS} />
      </RecipeSection>
      <RecipeSection title="Steps">
        <StepList steps={STEPS} />
      </RecipeSection>
      <RecipeSection title="Nutritional Info">
        <NutritionTable nutritionalInfo={NUTRITION} />
      </RecipeSection>
      <RecipeSection title="Icons">
        <div className={styles.icons}>
          {Object.entries(Icons)
            .filter(([name]) => name.endsWith('Icon'))
            .map(([name, Icon]) => (
              <span key={name} title={name} className={styles.icon}>
                <Icon />
              </span>
            ))}
        </div>
      </RecipeSection>
    </div>
  );
}

export default function DevComponents() {
  return (
    <div className={styles.page}>
      <div className={styles.column} data-width="320">
        <h1>320px</h1>
        <Showcase />
      </div>
      <div className={styles.column} data-width="360">
        <h1>360px</h1>
        <Showcase />
      </div>
      <div className={styles.column} data-width="375">
        <h1>375px</h1>
        <Showcase />
      </div>
      <div className={styles.column} data-width="402">
        <h1>402px</h1>
        <Showcase />
      </div>
    </div>
  );
}
