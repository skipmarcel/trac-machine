import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './lib/tm-motion.js';
import './lib/tm-interact.js';
import App from './App.jsx';

// StrictMode is intentionally off: the hero glass effect and motion scripts attach DOM listeners once.
createRoot(document.getElementById('root')).render(<App />);
