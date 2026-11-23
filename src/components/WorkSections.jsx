import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import CaseStudy from './CaseStudy.jsx';
import { sections, projects } from '../data/projects.jsx';

// Selected work: cases grouped into sections, as rows that open and close. "View case" slides the list out to the
// left and the full case in from the right; "← Selected work", Esc, a nav link or the browser back button slide back.
// A case gets its own history entry (?case=slug), so a shared link opens straight into it.

const SLIDE = 650;   // keep in step with .track__pane in global.css
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = () => (reduceMotion() ? 0 : SLIDE);

const LIVE = sections.filter((s) => projects.some((p) => p.section === s.id));   // empty sections (Apps, for now) stay hidden
const ORDER = LIVE.flatMap((s) => projects.filter((p) => p.section === s.id));   // reading order, for ← → in the case view
const indexOf = (slug) => ORDER.findIndex((p) => p.slug === slug);
const sectionName = (id) => sections.find((s) => s.id === id).name;
const thumbOf = (p) => p.thumb || p.hero.src;
const rowHeadline = (p) => p.headline || (p.intro && p.intro.heading) || p.title;
const caseInUrl = () => new URLSearchParams(location.search).get('case');
const caseUrl = (slug) => location.pathname + '?case=' + encodeURIComponent(slug);

function Row({ p, open, onToggle, onView }) {
  const id = p.slug, thumb = thumbOf(p), reel = p.heroOnly && p.hero.video;
  return (
    <div className={'wrow' + (open ? ' is-open' : '')}>
      <button type="button" id={'row-' + id} className="wrow__btn" aria-expanded={open} aria-controls={'panel-' + id} onClick={onToggle}>
        <span className="wrow__thumb">{thumb && <img src={thumb} alt="" loading="lazy" />}</span>
        <span className="wrow__txt">
          <span className="wrow__title">{p.title}</span>
          <span className="wrow__disc">{p.disc}</span>
        </span>
        <span className="wrow__ico" aria-hidden="true">↓</span>
      </button>
      <div id={'panel-' + id} role="region" aria-labelledby={'row-' + id} className="wrow__panel">
        <div className="wrow__clip">
          <div className="wrow__inner">
            <div className="wrow__media" style={p.rowAspect ? { aspectRatio: p.rowAspect, background: 'transparent' } : undefined}>
              {/* the reel only loads once its row is opened */}
              {reel ? (open && <video src={p.hero.video} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture />)
                : thumb && <img src={thumb} alt="" loading="lazy" />}
            </div>
            <div className="wrow__body">
              <h4 className="wrow__head">{rowHeadline(p)}</h4>
              {p.summary && <p className="wrow__text">{p.summary}</p>}
              <button type="button" className="wrow__view" onClick={onView}>View case <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// scrollTo(el): scrolls el to just under the sticky header. onSwap: re-runs the motion scripts after the view changes.
const WorkSections = forwardRef(function WorkSections({ scrollTo, onSwap }, ref) {
  const start = indexOf(caseInUrl());
  const [open, setOpen] = useState({});
  const [view, setView] = useState(start >= 0 ? 'case' : 'list');
  const [cur, setCur] = useState(Math.max(start, 0));
  const [settled, setSettled] = useState(true);   // false while the panes slide; both stay visible until it ends
  const [snap, setSnap] = useState(false);        // folds rows away without animating (on the way back)
  const track = useRef(null), backBtn = useRef(null), timer = useRef(0);
  const pushed = useRef(false);    // whether the case on screen has its own history entry to go back through
  const pending = useRef(null);    // where to land once the browser's back step comes through
  const focusNext = useRef(null);  // what gets focus once the slide has finished
  const live = useRef({ view, cur });
  live.current = { view, cur };

  const go = (nextView, nextCur, then) => {
    clearTimeout(timer.current);
    setView(nextView);
    if (nextCur != null) setCur(nextCur);
    setSettled(false);
    requestAnimationFrame(() => { then && then(); });
    timer.current = setTimeout(() => setSettled(true), wait());
  };

  const openCase = (i, push = true) => {
    if (push) { history.pushState({ case: ORDER[i].slug }, '', caseUrl(ORDER[i].slug)); pushed.current = true; }
    focusNext.current = () => backBtn.current;
    go('case', i, () => scrollTo(track.current));
  };

  const step = (d) => {
    const i = (live.current.cur + d + ORDER.length) % ORDER.length;
    history.replaceState({ case: ORDER[i].slug }, '', caseUrl(ORDER[i].slug));
    setCur(i);
    requestAnimationFrame(() => scrollTo(track.current));
  };

  // Every row folds away again. snap skips the fold so the scroll lands on the right row; transitions return after the slide.
  const back = ({ to } = {}) => {
    const from = ORDER[live.current.cur].slug;
    setOpen({});
    setSnap(true);
    focusNext.current = to ? null : () => document.getElementById('row-' + from);
    go('list', null, () => {
      setTimeout(() => setSnap(false), wait());
      const target = document.getElementById(to || 'row-' + from);
      if (!target) return;
      // A target below the track (About, Contact) only settles once the case pane has collapsed, so scroll after the slide.
      if (track.current.contains(target)) scrollTo(target, to ? 0 : 16);
      else setTimeout(() => scrollTo(target), wait());
    });
  };

  // From the page's own controls: step back through the case's history entry when there is one, so the browser's
  // back button stays in sync; otherwise (the page was opened on a case link) just tidy the URL.
  const requestBack = (opts = {}) => {
    if (live.current.view !== 'case') return;
    if (pushed.current) { pending.current = opts; history.back(); return; }
    history.replaceState(null, '', location.pathname + location.hash);
    back(opts);
  };

  useImperativeHandle(ref, () => ({ inCase: () => live.current.view === 'case', back: requestBack }));

  useEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';   // the page does its own scrolling on back / forward
    const onPop = () => {
      const i = indexOf(caseInUrl());
      if (i >= 0) {   // forward into a case, or back from one case entry to another
        pushed.current = true;
        if (live.current.view !== 'case' || live.current.cur !== i) openCase(i, false);
      } else if (live.current.view === 'case') {
        pushed.current = false;
        const opts = pending.current || {};
        pending.current = null;
        back(opts);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') requestBack(); };
    addEventListener('popstate', onPop);
    addEventListener('keydown', onKey);
    return () => { history.scrollRestoration = prev; removeEventListener('popstate', onPop); removeEventListener('keydown', onKey); clearTimeout(timer.current); };
  }, []);   // handlers read live.current, so they never go stale

  // Opened on a case link: start at the case.
  useLayoutEffect(() => { if (start >= 0) requestAnimationFrame(() => scrollTo(track.current, 0, true)); }, []);

  useEffect(() => { onSwap && onSwap(); }, [view, cur, settled]);

  // Focus moves once the slide has rendered and finished (immediately with reduced motion).
  useEffect(() => {
    if (!settled || !focusNext.current) return;
    const el = focusNext.current();
    focusNext.current = null;
    if (el) el.focus({ preventScroll: true });
  }, [settled]);

  const inCase = view === 'case';
  const k = ORDER[cur], prev = ORDER[(cur - 1 + ORDER.length) % ORDER.length], next = ORDER[(cur + 1) % ORDER.length];
  const pane = (shown, offset) => {
    const gone = !shown && settled;   // after the slide the hidden pane collapses, so the page height fits the one in view
    return {
      'aria-hidden': !shown,
      style: { transform: shown ? 'none' : `translateX(${offset})`, opacity: shown ? 1 : 0, ...(gone && { height: 0, overflow: 'hidden', visibility: 'hidden' }) },
    };
  };

  return (
    <div id="work-track" ref={track} className="track">
      <div className="track__pane" {...pane(!inCase, '-104%')}>
        {/* data-sec stays on an inner element: the motion script sets its own transform on it */}
        <section id="work" className={'work' + (snap ? ' is-snap' : '')} data-sec="">
          <div className="work__head">
            <h2 className="h2" data-head="">Selected work</h2>
          </div>
          {LIVE.map((s) => (
            <div key={s.id} id={s.id} className="wsec">
              <div className="wsec__name">
                <h3>{s.name}</h3>
                <p>{s.blurb}</p>
              </div>
              <div className="wsec__rows">
                {projects.filter((p) => p.section === s.id).map((p) => (
                  <Row key={p.slug} p={p} open={!!open[p.slug]}
                    onToggle={() => setOpen((o) => ({ ...o, [p.slug]: !o[p.slug] }))}
                    onView={() => openCase(indexOf(p.slug))} />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="track__pane" {...pane(inCase, '104%')}>
        <article className="section case" aria-label={k.title}>
          <div className="case__bar">
            <button type="button" ref={backBtn} className="case__back" onClick={() => requestBack()}>
              <span aria-hidden="true">←</span> Selected work
            </button>
            <span className="case__crumb">{sectionName(k.section)} / <span>{k.title}</span></span>
            <span className="case__steps">
              <button type="button" className="case__step" aria-label={'Previous case: ' + prev.title} onClick={() => step(-1)}>←</button>
              <button type="button" className="case__step" aria-label={'Next case: ' + next.title} onClick={() => step(1)}>→</button>
            </span>
          </div>

          {/* only mounted while it's showing, so a hidden case doesn't load its videos and live sites */}
          {(inCase || !settled) && <div data-sec=""><CaseStudy key={k.slug} p={k} /></div>}

          <div className="case__foot">
            <button type="button" className="case__backlink" onClick={() => requestBack()}><span aria-hidden="true">←</span> Back to Selected work</button>
            <button type="button" className="case__next" onClick={() => step(1)}>
              <span className="case__next-txt"><span>Next case</span><span>{next.title}</span></span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
});

export default WorkSections;
