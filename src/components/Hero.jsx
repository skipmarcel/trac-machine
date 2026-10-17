import { useEffect, useLayoutEffect, useRef } from 'react';
import { RESUME } from '../config.js';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// "T.R.A.C" ⇄ "Tyler Russell Adams' Concept Machine" scramble loop above the title.
function useTracMorph(ref) {
  useEffect(() => {
    const A = 'T.R.A.C', B = "Tyler Russell Adams' Concept Machine", GL = '!<>-_/[]{}=+*^?#ABCDEFGHJKLMNPRSTVWXYZ';
    let dead = false, timer, raf;
    const set = (s) => {
      const el = ref.current; if (!el) return;
      if (s === B) el.innerHTML = "Tyler Russell Adams' Concept <span class=\"accent\">Machine</span>";
      else el.textContent = s;
    };
    if (reduceMotion()) { set(B); return; }
    const morph = (from, to, dur, done) => {
      const t0 = performance.now(), L = Math.max(from.length, to.length);
      const f = () => {
        if (dead) return;
        const p = Math.min(1, (performance.now() - t0) / dur);
        const len = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.6));
        let out = '';
        for (let i = 0; i < len; i++) {
          const settle = (i / L) * 0.7 + 0.3, ch = to[i] || '';
          out += p >= settle ? ch : ch === ' ' ? ' ' : GL[(Math.random() * GL.length) | 0];
        }
        set(p < 1 ? out : to);
        if (p < 1) raf = requestAnimationFrame(f); else done();
      };
      f();
    };
    const cycle = () => { timer = setTimeout(() => morph(A, B, 1300, () => { timer = setTimeout(() => morph(B, A, 900, cycle), 3800); }), 2200); };
    cycle();
    return () => { dead = true; clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [ref]);
}

const Letters = ({ text, cRef }) => [...text].map((ch, i) =>
  ch === 'C'
    ? <span key={i} data-l="" data-c="" ref={cRef}>{ch}</span>
    : <span key={i} data-l="">{ch}</span>
);

// Full-bleed BSA photo behind the header + title. Rendered by App before <Header/>.
export function HeroPhoto() {
  const ref = useRef(null);
  // Layout effects (here and for the title) start the animations before the first paint, so nothing flashes in its end state.
  useLayoutEffect(() => {
    if (reduceMotion() || !ref.current) return;
    ref.current.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }],
      { duration: 1800, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
  }, []);
  return (
    <div className="hero-photo" aria-hidden="true">
      <div ref={ref} className="hero-photo__img" />
      <div className="hero-photo__shade" />
    </div>
  );
}

export default function Hero({ isMobile }) {
  const tracRef = useRef(null), h1Ref = useRef(null);
  const c1Ref = useRef(null), c2Ref = useRef(null);

  useTracMorph(tracRef);

  // Indent "MACHINE" so its C sits directly under the C of "TRAC".
  useLayoutEffect(() => {
    const align = () => {
      const a = c1Ref.current, b = c2Ref.current; if (!a || !b) return;
      const line = b.parentElement; line.style.paddingLeft = '0px';
      line.style.paddingLeft = Math.max(0, a.getBoundingClientRect().left - b.getBoundingClientRect().left) + 'px';
    };
    align(); document.fonts && document.fonts.ready.then(align);
    addEventListener('resize', align);
    return () => removeEventListener('resize', align);
  }, [isMobile]);

  // Slow blur-in of the whole title; settles slightly transparent (.82) over the photo.
  const play = () => {
    if (reduceMotion() || !h1Ref.current) return;
    h1Ref.current.querySelectorAll('[data-l]').forEach((l) => l.animate(
      [{ opacity: 0, filter: 'blur(28px)' }, { opacity: 0.55, filter: 'blur(10px)', offset: 0.1 }, { opacity: 0.82, filter: 'blur(0)' }],
      { duration: 4800, easing: 'cubic-bezier(.33,0,.2,1)', fill: 'both' }
    ));
  };
  useLayoutEffect(play, []);

  // Gooey rounding filter on the title (blur + alpha threshold softens the corners).
  const rnd = 2 * (isMobile ? 0.55 : 1), k = 3 + 18 / rnd;
  const matrix = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${k.toFixed(2)} ${(-k * 0.48 + 0.02).toFixed(2)}`;

  return (
    <section id="top" className="hero">
      <div className="hero__stage">
        <div className="hero__trac"><span ref={tracRef} aria-label="Tyler Russell Adams' Concept Machine">T.R.A.C</span></div>
        <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="tm-round" colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={rnd} />
            <feColorMatrix values={matrix} />
          </filter>
        </svg>
        <h1 ref={h1Ref} className="hero__title" onClick={play} aria-label="Trac Machine">
          <div className="hero__line" data-parallax="-0.05" data-pxgroup="hero"><Letters text="TRAC" cRef={c1Ref} /></div>
          <div className="hero__line hero__line--2" data-parallax="0.04" data-pxgroup="hero"><Letters text="MACHINE" cRef={c2Ref} /></div>
        </h1>
      </div>

      <div className="intro">
        <div className="intro__lead">
          <p className="intro__lede" data-reveal="up" data-delay="700">Graphic, Web, &amp; Print design by Tyler Russell Adams</p>
          <div className="disciplines" data-reveal="up" data-delay="900">
            <span>Disciplines</span><span>Branding · Typography</span><span>Print · Packaging</span><span>Illustration · Web</span>
          </div>
        </div>
        <div className="intro__col" data-reveal="up" data-delay="800">
          <p className="intro__body">An independent, one-person studio working across branding, typography, print, illustration and the web. Each project starts as a concept and is built out by hand.</p>
          <div className="btn-row">
            <a href="#work" className="btn btn--primary" data-btn="1">View work <span data-ico="">→</span></a>
            <a href={RESUME} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" data-btn="2">Resume</a>
          </div>
        </div>
      </div>
    </section>
  );
}
