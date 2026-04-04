import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './app/Home';
import Login from './app/(auth)/Login';
import Register from './app/(auth)/Register';
import Dashboard from './app/(dashboard)/Dashboard';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
