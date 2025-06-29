import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importe les styles globaux (incluant Tailwind)
import App from './App'; // Importe le composant principal de l'application
import { BrowserRouter } from 'react-router-dom';

// Crée la racine de l'application React pour React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rend le composant App dans le DOM
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
