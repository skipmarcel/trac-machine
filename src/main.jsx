import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './lib/tm-motion.js';
import './lib/tm-interact.js';
import App from './App.jsx';

// StrictMode is intentionally off: the hero glass effect and motion scripts attach DOM listeners once.
// Wait (max 1.5s) for the web fonts so the first frame isn't drawn in the fallback font and then swapped.
const fonts = Promise.all(['400 16px Nunito', '600 16px Nunito', '400 14px "Spline Sans Mono"'].map((f) => document.fonts.load(f)));
Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).catch(() => {})
  .then(() => createRoot(document.getElementById('root')).render(<App />));
