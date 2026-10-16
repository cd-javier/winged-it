import type { RouteObject } from 'react-router-dom';

import AppShell from './components/AppShell/AppShell';
import DevComponents from './routes/DevComponents/DevComponents';
import Home from './routes/Home/Home';
import NewRecipe from './routes/NewRecipe/NewRecipe';
import Recipe from './routes/Recipe/Recipe';

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/new', element: <NewRecipe /> },
      { path: '/recipe/:id', element: <Recipe /> },
    ],
  },
  // Temporary, dev only: visual check of the shared components.
  ...(import.meta.env.DEV
    ? [{ path: '/dev/components', element: <DevComponents /> }]
    : []),
];

export default routes;
