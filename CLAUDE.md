# CLAUDE.md

Personal portfolio for Tyler Russell Adams (Trac Machine). React 18 + Vite, plain CSS, no UI libraries.

- Content lives in `src/data/projects.jsx`. When the user asks to change case copy, keep their wording verbatim.
- Styles live in `src/styles/global.css` with CSS variables at the top. Use the existing tokens; don't add new colours.
- Animations come from `src/lib/tm-motion.js` / `tm-interact.js`, driven by `data-*` attributes (see README). Keep those attributes when editing markup.
- The hero photo band (`HeroPhoto` in Hero.jsx) is absolutely positioned at the top of `.site`, behind the sticky header. Hero text sits over it.
- Mobile breakpoint: 720px. Check both layouts after layout changes.
- Assets go in `public/assets/` and are referenced as `/assets/...`.
- Don't enable React StrictMode (it would double-attach the motion listeners).
