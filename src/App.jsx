import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero, { HeroPhoto } from './components/Hero.jsx';
import Work from './components/Work.jsx';
import CaseStudy from './components/CaseStudy.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import useMediaQuery from './hooks/useMediaQuery.js';
import { projects } from './data/projects.jsx';
import { MOTION, MOBILE_QUERY } from './config.js';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const rootRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const [caseIdx, setCaseIdx] = useState(0);
  const [overHero, setOverHero] = useState(true);

  // Header goes from frosted-clear to solid once the photo band scrolls away.
  useEffect(() => {
    const on = () => setOverHero(scrollY < innerHeight - 70);
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  useEffect(() => setMenuOpen(false), [isMobile]);

  // Motion scripts (src/lib) attach to the root once, then re-scan when content changes.
  useEffect(() => {
    const root = rootRef.current;
    window.TMREVEAL = MOTION['data-ix-reveal'];
    window.TM.init(root);
    window.TMX.init(root);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => { window.TM.init(rootRef.current); window.TMX.update(rootRef.current); }, 0);
    return () => clearTimeout(t);
  }, [caseIdx, isMobile]);

  const scrollToId = (id) => {
    const root = rootRef.current, sec = root.querySelector('#' + id); if (!sec) return;
    const hdr = root.querySelector('header');
    const off = hdr && getComputedStyle(hdr).position === 'sticky' ? hdr.getBoundingClientRect().height : 0;
    window.scrollTo({ top: sec.getBoundingClientRect().top + scrollY - off, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };

  // Smooth-scroll in-page anchors with the sticky-header offset.
  const onRootClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1); if (!id || !rootRef.current.querySelector('#' + id)) return;
    e.preventDefault();
    if (menuOpen) { setMenuOpen(false); setTimeout(() => scrollToId(id), 30); } else scrollToId(id);
  };

  const openCase = (i) => { setCaseIdx(i); scrollToId('case'); };

  return (
    <div ref={rootRef} className="site" onClick={onRootClick} {...MOTION}
      data-acc="#e0561f" data-ink="#141413" data-bg="#ededea" data-surf="#e2e2de">
      <HeroPhoto />
      <Header isMobile={isMobile} menuOpen={menuOpen} setMenuOpen={setMenuOpen} overHero={overHero} />
      <Hero isMobile={isMobile} />
      <Work projects={projects} onOpen={openCase} />
      <CaseStudy projects={projects} index={caseIdx} setIndex={setCaseIdx} />
      <About />
      <Contact />
    </div>
  );
}
