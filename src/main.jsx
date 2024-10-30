import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage.jsx';
import './index.css';
import Charities from './pages/CharitiesPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ServicePage from './pages/ServicePage.jsx';
import ViewInfo from './components/ViewInfo.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Homepage /> },
  { path: '/charities', element: <Charities /> },
  { path: '/contact', element: <ContactPage /> }, // Adjusted path to be more RESTful
  { path: '/about', element: <AboutPage /> }, // Adjusted path to be more RESTful
  { path: '/service', element: <ServicePage /> }, // Adjusted path to be more RESTful
  { path: '/signup', element: <SignupForm /> }, // Fixed the missing comma
  { path: '/ViewInfo', element: <ViewInfo /> },
  { path: '/campaign', element: <ProtectedRoute element={<CampaignManager />} />,},
]);

crsignup.jsxeateRoot(document.getElementById('index')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);