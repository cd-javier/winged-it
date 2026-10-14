import type { RouteObject } from 'react-router-dom';

import AppShell from './components/AppShell/AppShell';
import Home from './routes/Home/Home';
import Recipe from './routes/Recipe/Recipe';

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/recipe/:id', element: <Recipe /> },
    ],
  },
];

export default routes;
