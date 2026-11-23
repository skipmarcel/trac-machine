import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero, { HeroPhoto } from './components/Hero.jsx';
import WorkSections from './components/WorkSections.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import useMediaQuery from './hooks/useMediaQuery.js';
import { MOTION, MOBILE_QUERY } from './config.js';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Same stops as the .hero-photo mask in global.css (position down the band → how far it has faded to the page colour).
const FADE = [[.55, 0], [.62, .03], [.69, .12], [.76, .28], [.83, .5], [.9, .74], [.96, .92], [1, 1]];
const fadeAt = (p) => {
  if (p <= FADE[0][0]) return 0;
  for (let i = 1; i < FADE.length; i++) {
    const [p1, v1] = FADE[i];
    if (p <= p1) { const [p0, v0] = FADE[i - 1]; return v0 + (v1 - v0) * (p - p0) / (p1 - p0); }
  }
  return 1;
};

export default function App() {
  const rootRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const workRef = useRef(null);
  const [overHero, setOverHero] = useState(true);

  // Header text/background follow the photo fade: --hdr-t is how faded the band is behind the
  // header's midline (0 = over the photo → white text, 1 = past it → ink on solid bar).
  // Layout effect so the first paint already has white text (no black flash).
  useLayoutEffect(() => {
    const on = () => {
      const root = rootRef.current, band = root && root.querySelector('.hero-photo'), hdr = root && root.querySelector('header');
      if (!band || !hdr) return;
      const t = fadeAt((scrollY + hdr.offsetHeight / 2) / band.offsetHeight);
      // Text flips over a short range where the bar's backdrop (photo fade + the bar's own tint) passes mid-tone,
      // so it never sits grey-on-grey for long.
      const lit = 1 - (1 - t) * (1 - 0.9 * t), k = Math.min(1, Math.max(0, (lit - 0.35) / 0.2));
      root.style.setProperty('--hdr-h', hdr.offsetHeight + 'px');   // the case view's sticky bar sits under the header
      root.style.setProperty('--hdr-t', t.toFixed(3));
      root.style.setProperty('--hdr-ink', (k * k * (3 - 2 * k)).toFixed(3));
      setOverHero(t < 1);
    };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);

  useEffect(() => setMenuOpen(false), [isMobile]);

  // Motion scripts (src/lib) attach to the root once, then re-scan when content changes.
  // Layout effect: reveal targets must be hidden before the first paint, or they flash visible.
  useLayoutEffect(() => {
    const root = rootRef.current;
    window.TMREVEAL = MOTION['data-ix-reveal'];
    window.TM.init(root);
    window.TMX.init(root);
  }, []);
  // Re-scan after the layout changes (breakpoint) or Selected work swaps between the list and a case.
  const rescan = useRef(0);
  const refreshMotion = () => {
    clearTimeout(rescan.current);
    rescan.current = setTimeout(() => { window.TM.init(rootRef.current); window.TMX.update(rootRef.current); }, 0);
  };
  useEffect(() => { refreshMotion(); return () => clearTimeout(rescan.current); }, [isMobile]);

  // Scroll el to just under the sticky header (extra = more room above it).
  const scrollToEl = (el, extra = 0, instant = false) => {
    if (!el) return;
    const hdr = rootRef.current.querySelector('header');
    const off = hdr && getComputedStyle(hdr).position === 'sticky' ? hdr.getBoundingClientRect().height : 0;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - off - extra), behavior: instant || reduceMotion() ? 'auto' : 'smooth' });
  };
  const scrollToId = (id) => scrollToEl(rootRef.current.querySelector('#' + id));

  // Smooth-scroll in-page anchors with the sticky-header offset.
  const onRootClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1); if (!id || !rootRef.current.querySelector('#' + id)) return;
    e.preventDefault();
    // From a case, slide back to the list first, then land on the link's target.
    const go = () => (workRef.current && workRef.current.inCase() ? workRef.current.back({ to: id }) : scrollToId(id));
    if (menuOpen) { setMenuOpen(false); setTimeout(go, 30); } else go();
  };

  return (
    <div ref={rootRef} className="site" onClick={onRootClick} {...MOTION}
      data-acc="#e0561f" data-ink="#141413" data-bg="#ededea" data-surf="#e2e2de">
      <HeroPhoto />
      <Header isMobile={isMobile} menuOpen={menuOpen} setMenuOpen={setMenuOpen} overHero={overHero} />
      <Hero isMobile={isMobile} />
      <WorkSections ref={workRef} scrollTo={scrollToEl} onSwap={refreshMotion} />
      <About />
      <Contact />
    </div>
  );
}
