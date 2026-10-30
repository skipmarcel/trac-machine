import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './lib/tm-motion.js';
import './lib/tm-interact.js';
import WorkWithTrac from './components/WorkWithTrac.jsx';

// Entry for /work-with-trac/. Same font wait as main.jsx; StrictMode stays off for the motion scripts.
const fonts = Promise.all(['400 16px Nunito', '600 16px Nunito', '400 14px "Spline Sans Mono"'].map((f) => document.fonts.load(f)));
Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).catch(() => {})
  .then(() => createRoot(document.getElementById('root')).render(<WorkWithTrac />));
