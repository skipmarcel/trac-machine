# Trac Machine — portfolio site (React + Vite)

The portfolio of Tyler Russell Adams: graphic, web and print design. It's a single page with a hero, a list of selected work, case studies, an About section and a contact card. Rebuilt from the HTML design prototype (v2): a full-bleed BSA motorcycle photo behind a frosted nav, a slow blur-in hero title, the Mist (light gray) theme, a gray "Selected work" band, an asymmetric case layout and a card contact footer.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve the build locally
```

`dist/` can be deployed as static files to Netlify, Vercel, GitHub Pages or Cloudflare Pages. No server is needed.

## Structure

```
index.html                 fonts (Nunito, Spline Sans Mono), meta, favicon
public/assets/             images, videos, resume PDF (served at /assets/...)
src/
  main.jsx                 entry: global CSS + motion scripts + <App/>
  App.jsx                  page shell, case state, smooth anchor scrolling
  config.js                email / resume / social links, motion settings
  data/projects.jsx        ALL case-study content (edit copy here)
  components/
    Header.jsx             desktop grid nav + mobile menu (≤720px); frosted while over the photo
    Hero.jsx               HeroPhoto (BSA photo band) + TRAC/MACHINE blur-in title + intro
    Work.jsx               "Selected work" rows + cursor-follow preview
    CaseStudy.jsx          case switcher, hero media + hotspots, copy, detail images (+ optional label / second tall box)
    About.jsx              portrait + bio
    Contact.jsx            dark contact card
  hooks/useMediaQuery.js
  lib/
    tm-motion.js           scroll reveals, parallax, cursor-follow preview
    tm-interact.js         heading reveals, section scale-in, hotspot pulse, nav states
  styles/global.css        design tokens (CSS variables) + all component styles
```

## Common edits

- **Case copy, headlines, links, images:** `src/data/projects.jsx`. Each project is one object. Inline links use the `<L href>` helper.
- **Add a case:** add an object to `projects`, put its images in `public/assets/case/`. The work list, case-number buttons and count update automatically.
- **Hotspots:** `spots({ 1: 'Label' }, { 1: { x: '20%', y: '40%' } })` on a project overrides the default labels and positions. Cases 04 and 07 still use the default placeholder labels.
- **Colours, spacing, radius:** CSS variables at the top of `global.css`. A gray "Mist" theme is noted there.
- **Email / resume / socials:** `src/config.js`.
- **Hero photo framing:** `.hero-photo__img` in `global.css`: `background-size` (zoom) and `background-position` (`right -34vw top 14%`; a more negative right value pushes the bike further right). The photo fade is `.hero-photo__fade`.
- **Hero title:** colour `--hero-ink`, size `--hero-scale`, blur-in timing and final opacity (.82) in `play()` in `Hero.jsx`.
- **Nav over the photo:** `.header` in `global.css` mixes white → ink text and clear → solid background by `--hdr-t`, which `App.jsx` sets on scroll from the photo's fade curve (`FADE`, same stops as the `.hero-photo` mask).
- **Case 08 second tall image:** set `d3b: { src: C + 'tm-case08-4.webp' }` in `projects.jsx` and drop the file in `public/assets/case/`.
- **Motion:** switch effects with the `MOTION` values in `src/config.js` (options listed inline).

## How the motion works

`tm-motion.js` and `tm-interact.js` are framework-free scripts that attach to `window.TM` / `window.TMX`. `App.jsx` initialises them on the root element and re-scans after the case changes. They work through data attributes:

- `data-reveal="up|clip"` + `data-delay` → fade/clip in on scroll
- `data-head` → heading "line rise"
- `data-parallax="0.08"` → parallax depth
- `data-sec` → section scale-in on scroll
- `data-follow-zone`, `data-preview`, `data-preview-img` → cursor-follow preview circle in Work
- `data-spot` → pulsing hotspots
- `data-btn`, `data-nav` → press feedback and nav hover/active states

All of it respects `prefers-reduced-motion`. React StrictMode is left off on purpose, because these scripts attach DOM listeners once.

## Responsive

The breakpoint is 720px (`MOBILE_QUERY` in config, plus `@media (max-width: 720px)` in CSS). Below it:
- the nav becomes a Menu button with a full-width link list (44px+ tap targets)
- work rows stack (meta moves under the title)
- case images go full width
- the hero rounding filter is softened

## Design tokens

| Token | Value |
|---|---|
| bg / ink | #ededea / #141413 |
| muted / body text | #5d5c58 / #3b3a37 |
| surface / soft rule | #e2e2de / rgba(20,20,19,.22) |
| hero title | #d9d6cf at 82% opacity |
| accent | #e0561f |
| fonts | Nunito (UI), Spline Sans Mono (labels, meta) |
| radius | 8px (contact card 12px) |
| spacing | 8 / 17 / 34px, section padding 60px (48px mobile) |
| hero title type | 550 weight, 88% stretch, −0.055em tracking, `clamp(88px,21.5vw,420px) × .85` |
