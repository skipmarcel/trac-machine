import { useEffect, useRef, useState } from 'react';
import LogoDraw from './pt/LogoDraw.jsx';

// Psychic Tiger case study: three 1200 x 1200 panels, drawn at fixed size and
// scaled to the column width so every screen sees the identical layout.
const SITE = 'https://www.psychictiger.com';
const A = '/assets/pt/';

const BG = '#f3efe7', INK = '#2b2b2b', MUTED = '#555', META = '#8a8378', ACCENT = '#f26b3a';
const serif = "'Newsreader', serif", mono = "'Space Mono', monospace";
const FONTS = 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Space+Mono:wght@400;700&family=Saira:wght@600;700&family=Archivo:wght@400;600&display=swap';

const kicker = { display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' };
const rule = { height: 1, background: ACCENT };
const label = { fontFamily: mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: META };
const top = { position: 'absolute', left: 80, right: 80, top: 80, display: 'flex', flexDirection: 'column', gap: 26 };

// The live site has no URL for the open mobile menu, so the middle phone shows About.
const PHONES = [
  { n: 1, t: 'Home', path: '/', offset: 0 },
  { n: 2, t: 'About', path: '/about', offset: 60 },
  { n: 3, t: 'Services', path: '/services', offset: 0 },
];
const SWATCHES = ['#201e1d', '#605d5d', '#f3f2f2', '#ffffff'];
const SHOTS = [
  { src: A + 'jordan-36.jpg', alt: 'Jordan Burns planking on rail tracks', pos: '72% center' },
  { src: A + 'jordan-39.jpg', alt: 'Jordan Burns deadlifting', pos: '45% center' },
  { src: A + 'jordan-117.jpg', alt: 'Portrait of Jordan Burns', pos: '62% 30%' },
];

function Panel({ scale, label: name, children }) {
  return (
    <section aria-label={name} style={{ width: '100%', height: 1200 * scale, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height: 1200, transform: `scale(${scale})`, transformOrigin: '0 0', background: BG, color: INK }}>
        {children}
      </div>
    </section>
  );
}

function Phone({ width, height, pad, radius, innerRadius, island, src, title, frameW, frameH, frameScale, style }) {
  return (
    <div style={{ width, height, boxSizing: 'border-box', padding: pad, borderRadius: radius, background: '#151515', boxShadow: '0 34px 80px rgba(60,45,25,.26), inset 0 0 0 2px #3a3a3a', ...style }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: innerRadius, overflow: 'hidden', background: '#fff' }}>
        <iframe src={src} title={title} loading="lazy"
          style={{ position: 'absolute', left: 0, top: 0, width: frameW, height: frameH, border: 0, transform: `scale(${frameScale})`, transformOrigin: '0 0' }} />
        <div style={{ position: 'absolute', left: '50%', top: island.top, width: island.w, height: island.h, marginLeft: -island.w / 2, borderRadius: 20, background: '#000', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

export default function PTCaseStudy() {
  const wrap = useRef(null);
  const [w, setW] = useState(1200);
  const [run, setRun] = useState(0);   // bump to remount + replay the logo draw

  useEffect(() => {
    if (!document.querySelector('link[data-pt-fonts]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = FONTS; l.setAttribute('data-pt-fonts', '');
      document.head.appendChild(l);
    }
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(wrap.current);
    const loop = setInterval(() => setRun((r) => r + 1), 8000);
    return () => { ro.disconnect(); clearInterval(loop); };
  }, []);

  const scale = Math.min(1, w / 1200);

  return (
    <div ref={wrap} style={{ width: '100%', maxWidth: 1200, margin: '0 auto', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <Panel scale={scale} label="01 Website">
        <div style={top}>
          <div style={kicker}><span>01 — Website</span><span>Case study</span></div>
          <div style={rule} />
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 84, lineHeight: .98, letterSpacing: '-.02em' }}>Psychic Tiger</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 56, alignItems: 'start' }}>
            <p style={{ margin: 0, fontFamily: serif, fontSize: 22, lineHeight: 1.5, color: MUTED, textWrap: 'pretty' }}>A website for Psychic Tiger, Jordan Burns’s personal training practice in Portland. A line-drawn logo of twin tiger heads and the wordmark draws itself from the centre outward over a crossfading photo hero, and Jordan’s own words carry over unedited from the old WordPress site.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: mono, fontSize: 13, lineHeight: 1.6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ color: META }}>Role</span><span>Brand designer, web designer and website builder</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ color: META }}>Tools</span><span>SVG · React · Vite · Vercel · Google Maps</span></div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 80, top: 540, width: 836, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 80px rgba(60,45,25,.22), 0 0 0 1px rgba(0,0,0,.08)' }}>
          <div style={{ height: 34, background: '#e8e4dc', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: '#d9d3c8' }} />)}
          </div>
          <div style={{ position: 'relative', width: 836, height: 522, overflow: 'hidden' }}>
            <iframe src={SITE + '/'} title="Psychic Tiger, desktop view" loading="lazy"
              style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, border: 0, transform: 'scale(.5806)', transformOrigin: '0 0' }} />
          </div>
        </div>
        <Phone width={297} height={619} pad={11} radius={50} innerRadius={40} island={{ top: 9, w: 86, h: 25 }}
          src={SITE + '/'} title="Psychic Tiger, iPhone view" frameW={393} frameH={852} frameScale={.7023}
          style={{ position: 'absolute', left: 836, top: 470, boxShadow: '0 34px 80px rgba(60,45,25,.3), inset 0 0 0 2px #3a3a3a' }} />
      </Panel>

      <Panel scale={scale} label="02 Mobile">
        <div style={top}>
          <div style={kicker}><span>02 — On the phone</span><span>Mobile</span></div>
          <div style={rule} />
          <p style={{ margin: 0, fontFamily: serif, fontSize: 22, lineHeight: 1.5, color: MUTED, maxWidth: '44ch' }}>On phones the nav folds into a round menu button, a thin chevron points past the hero, and each service stacks photo over price list.</p>
        </div>
        <div style={{ position: 'absolute', left: 60, right: 60, top: 290, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {PHONES.map(p => (
            <div key={p.n} style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: p.offset }}>
              <Phone width={336} height={700} pad={12} radius={56} innerRadius={45} island={{ top: 10, w: 98, h: 28 }}
                src={SITE + p.path} title={p.t} frameW={393} frameH={860} frameScale={.7939} />
              <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 8 }}>{String(p.n).padStart(2, '0')} {p.t}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel scale={scale} label="03 Identity and motion">
        <div style={top}>
          <div style={kicker}><span>03 — Identity + motion</span><span>SVG line draw</span></div>
          <div style={rule} />
        </div>
        <div style={{ position: 'absolute', left: 80, top: 190, width: 560, height: 560, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src={A + 'jordan-117.jpg'} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% 30%', opacity: .35, filter: 'grayscale(1)' }} />
          <div style={{ position: 'relative', width: 480 }}>
            <LogoDraw key={run} width={480} part="twin" color="#ffffff" stroke={1.2} />
          </div>
          <div style={{ position: 'absolute', left: 24, bottom: 20, fontFamily: mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#d0d0d0' }}>Animated mark · draws centre out</div>
        </div>
        <div style={{ position: 'absolute', left: 680, top: 190, width: 440, height: 560, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={label}>Wordmark</div>
            <LogoDraw width={440} part="letters" color="#201e1d" stroke={1} animate={false} />
            <LogoDraw width={200} part="tiger" color="#201e1d" stroke={1} animate={false} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={label}>Type</div>
            <div style={{ fontFamily: "'Saira', sans-serif", fontWeight: 700, fontSize: 46, lineHeight: 1, textTransform: 'uppercase' }}>Saira</div>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: 22 }}>Archivo</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={label}>Color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
              {SWATCHES.map(c => (
                <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 72, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
                  <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 80, right: 80, top: 800, bottom: 80, display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 40, alignItems: 'stretch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
            {SHOTS.map(p => (
              <div key={p.src} style={{ position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(60,45,25,.18)' }}>
                <img src={p.src} alt={p.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos, display: 'block' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 16 }}>
            <div style={label}>Photography</div>
            <p style={{ margin: 0, fontFamily: serif, fontSize: 20, lineHeight: 1.5, color: MUTED, textWrap: 'pretty' }}>The hero cycles through seven photos from Jordan’s shoots, crossfading every six seconds behind the white line logo.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
