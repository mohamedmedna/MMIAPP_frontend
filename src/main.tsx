import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './Styles/index.css';
import './Styles/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Élément #root introuvable dans le DOM.");
}
