import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Shell from './pages/Shell';
import Welcome from './pages/Welcome';
import Detail from './pages/Detail';
import { BootScreen, DetailSkeleton, RouteError } from './components/Fallbacks';
import './styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={<BootScreen />}><Shell /></Suspense>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Suspense><Welcome /></Suspense> },
      {
        path: 'pokemon/:id',
        element: <Suspense fallback={<DetailSkeleton />}><Detail /></Suspense>,
        errorElement: <RouteError />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
