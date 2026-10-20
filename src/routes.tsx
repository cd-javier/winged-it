import type { RouteObject } from 'react-router-dom';

import AppShell from './components/AppShell/AppShell';
import DevComponents from './routes/DevComponents/DevComponents';
import EditRecipe from './routes/EditRecipe/EditRecipe';
import Home from './routes/Home/Home';
import NewManualRecipe from './routes/NewManualRecipe/NewManualRecipe';
import NewRecipe from './routes/NewRecipe/NewRecipe';
import Recipe from './routes/Recipe/Recipe';

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/new', element: <NewRecipe /> },
      { path: '/new/manual', element: <NewManualRecipe /> },
      { path: '/recipe/:id', element: <Recipe /> },
      { path: '/recipe/:id/edit', element: <EditRecipe /> },
    ],
  },
  // Temporary, dev only: visual check of the shared components.
  ...(import.meta.env.DEV
    ? [{ path: '/dev/components', element: <DevComponents /> }]
    : []),
];

export default routes;
