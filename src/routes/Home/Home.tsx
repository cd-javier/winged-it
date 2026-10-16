import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Dialog from '../../components/Dialog/Dialog';
import FirstRecipe from '../../components/FirstRecipe/FirstRecipe';
import IconButton from '../../components/IconButton/IconButton';
import { PencilIcon, PlusIcon, WandIcon } from '../../components/Icons/Icons';
import Logo from '../../components/Logo/Logo';
import MenuItem from '../../components/MenuItem/MenuItem';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import { useRecipes } from '../../hooks/useRecipes';
import type { Recipe } from '../../types/recipe';
import styles from './Home.module.css';

function matchesQuery(recipe: Recipe, query: string) {
  return (
    recipe.title.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query) ||
    recipe.ingredients.some(({ item }) => item.toLowerCase().includes(query))
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { recipes, loading } = useRecipes();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  // useId links the visually hidden label to the input.
  const searchId = useId();

  const normalisedQuery = query.trim().toLowerCase();
  const visible = normalisedQuery
    ? recipes.filter((recipe) => matchesQuery(recipe, normalisedQuery))
    : recipes;

  const openMenu = () => setMenuOpen(true);

  let content = null;
  if (!loading) {
    if (recipes.length === 0) {
      content = <FirstRecipe onClick={openMenu} />;
    } else if (visible.length === 0) {
      content = <p className={styles.noResults}>No recipes match your search</p>;
    } else {
      content = (
        <ul className={styles.list} role="list">
          {visible.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard
                title={recipe.title}
                description={recipe.description}
                prepTime={recipe.summary.prepTime}
                cookTime={recipe.summary.cookTime}
                image={recipe.image}
                to={`/recipe/${recipe.id}`}
              />
            </li>
          ))}
        </ul>
      );
    }
  }

  return (
    <section className={styles.home}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>
          <Logo className={styles.logo} />
          winged it
        </h1>
        <div className={styles.search}>
          <label htmlFor={searchId} className={styles.visuallyHidden}>
            Search recipes
          </label>
          <input
            id={searchId}
            type="search"
            className={styles.input}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <div className={styles.content}>{content}</div>

      <div className={styles.fab}>
        <IconButton icon={<PlusIcon />} label="new recipe" onClick={openMenu} />
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} label="New recipe">
        <MenuItem
          icon={<WandIcon />}
          title="Wing it"
          description="Type what you did and let us do the rest"
          onClick={() => navigate('/new')}
        />
        <MenuItem
          icon={<PencilIcon />}
          title="Enter manually"
          description="Create the recipe entering every detail manually"
          onClick={() => {}}
        />
      </Dialog>
    </section>
  );
}
