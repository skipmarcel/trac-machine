import { useEffect, useRef, useState } from 'react';
import KioskTryIt from './pl/KioskTryIt.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { MOBILE_QUERY } from '../config.js';

// PurpleLine (Purple Line Consent) case study. Same system as the FK and PT cases:
// fixed-size panels drawn at 1200 wide and scaled to the column, so every screen sees the
// same layout. The last section, "Try it", is NOT scaled: it is a live, working kiosk
// (iPad layout on desktop, phone layout on mobile) so visitors can click through a check-in.
const SITE = 'https://www.purplelineco.com';
const A = '/assets/pl/';

const BG = '#f3efe7', INK = '#2b2b2b', MUTED = '#555', META = '#8a8378', ACCENT = '#5a2ca0';
const serif = "'Newsreader', serif", mono = "'Space Mono', monospace";
const FONTS = 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Space+Mono:wght@400;700&display=swap';

const kicker = { display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' };
const rule = { height: 1, background: ACCENT };
const label = { fontFamily: mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: META };
const top = { position: 'absolute', left: 80, right: 80, top: 80, display: 'flex', flexDirection: 'column', gap: 26 };
const body = { margin: 0, fontFamily: serif, fontSize: 22, lineHeight: 1.5, color: MUTED, textWrap: 'pretty' };
const shadow = '0 30px 70px rgba(45,28,80,.22), 0 0 0 1px rgba(0,0,0,.06)';

const FLOW = [
  { src: 'pl-ipad-details.webp', t: 'Their details', d: 'Legal name, birthday and contact info. Under 18 is stopped right here.' },
  { src: 'pl-ipad-health.webp', t: 'Tattoo + health', d: 'Artist, placement and the shop’s own health checklist.' },
  { src: 'pl-ipad-camera.webp', t: 'ID on the shelf', d: 'The ID Scan Shelf beside the iPad takes the photo. No phones.' },
  { src: 'pl-ipad-sign.webp', t: 'Sign', d: 'Printed name plus a finger signature, checked against the ID name.' },
  { src: 'pl-ipad-review.webp', t: 'Review', d: 'One screen to check everything, with Edit links back to each step.' },
  { src: 'pl-ipad-done.webp', t: 'Done', d: 'The release syncs, even later if the Wi-Fi is down, and the kiosk clears itself.' },
];
const PHONES = [
  { src: 'pl-phone-welcome.webp', t: 'Welcome', offset: 0 },
  { src: 'pl-phone-health.webp', t: 'Health', offset: 56 },
  { src: 'pl-phone-camera.webp', t: 'ID photo', offset: 0 },
  { src: 'pl-phone-done.webp', t: 'All set', offset: 56 },
];
const SWATCHES = ['#5a2ca0', '#3d1b72', '#f3effa', '#1d1b1f'];

function Panel({ scale, label: name, height = 1200, children }) {
  return (
    <section aria-label={name} style={{ width: '100%', height: height * scale, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height, transform: `scale(${scale})`, transformOrigin: '0 0', background: BG, color: INK }}>
        {children}
      </div>
    </section>
  );
}

// iPad bezel around a screenshot (1180 x 820 screens)
function IPad({ src, alt, width, style }) {
  return (
    <div style={{ width, padding: width * .022, borderRadius: width * .034, background: '#1f1d22', boxShadow: shadow, ...style }}>
      <img src={A + src} alt={alt} loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '1180 / 820', borderRadius: width * .016, objectFit: 'cover' }} />
    </div>
  );
}

// Phone bezel around a 390 x 844 screenshot (or a live iframe when frame is set)
function Phone({ src, alt, width, frame, style }) {
  const inner = width - 22;
  return (
    <div style={{ width, padding: 11, borderRadius: width * .16, background: '#151515', boxShadow: '0 34px 80px rgba(45,28,80,.26), inset 0 0 0 2px #3a3a3a', ...style }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '390 / 844', borderRadius: width * .125, overflow: 'hidden', background: '#fff' }}>
        {frame ? (
          <iframe src={frame} title={alt} loading="lazy"
            style={{ position: 'absolute', left: 0, top: 0, width: 393, height: 852, border: 0, transform: `scale(${inner / 393})`, transformOrigin: '0 0' }} />
        ) : (
          <img src={A + src} alt={alt} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {frame && <div style={{ position: 'absolute', left: '50%', top: 9, width: 86, height: 25, marginLeft: -43, borderRadius: 20, background: '#000', pointerEvents: 'none' }} />}
      </div>
    </div>
  );
}

function Browser({ width, height, children, style }) {
  return (
    <div style={{ width, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: shadow, ...style }}>
      <div style={{ height: 34, background: '#e8e4dc', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: '#d9d3c8' }} />)}
      </div>
      <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

export default function PLCaseStudy() {
  const wrap = useRef(null);
  const [w, setW] = useState(1200);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [device, setDevice] = useState(isMobile ? 'phone' : 'ipad');

  useEffect(() => {
    if (!document.querySelector('link[data-pt-fonts], link[data-fk-fonts], link[data-pl-fonts]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = FONTS; l.setAttribute('data-pl-fonts', '');
      document.head.appendChild(l);
    }
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => setDevice(isMobile ? 'phone' : 'ipad'), [isMobile]);

  const scale = Math.min(1, w / 1200);
  const tryPad = isMobile ? 20 : Math.round(80 * scale);

  return (
    <div ref={wrap} style={{ width: '100%', maxWidth: 1200, margin: '0 auto', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <Panel scale={scale} label="01 Product">
        <div style={top}>
          <div style={kicker}><span>01 — Product</span><span>Case study · In development</span></div>
          <div style={rule} />
          <h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 84, lineHeight: .98, letterSpacing: '-.02em' }}>PurpleLine</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 56, alignItems: 'start' }}>
            <p style={body}>A digital consent and release form for tattoo shops, running on a dedicated iPad at the front desk. Clients fill in their details, answer the shop’s health checklist, photograph their ID on a shelf built into the kiosk and sign with a finger. It never touches the client’s phone, and it keeps working when the shop Wi-Fi drops.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: mono, fontSize: 13, lineHeight: 1.6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ color: META }}>Role</span><span>Founder, product designer and front-end developer</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ color: META }}>Tools</span><span>Claude Design · Claude Code · React · Next.js · Vercel</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ color: META }}>Status</span><a href={SITE} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>Early access at purplelineco.com ↗</a></div>
            </div>
          </div>
        </div>
        <IPad src="pl-ipad-welcome.webp" alt="PurpleLine kiosk welcome screen: Hi! Welcome to Rose City, with a Start new release button and the four steps" width={860}
          style={{ position: 'absolute', left: 80, top: 520 }} />
        <Phone src="pl-phone-welcome.webp" alt="The same welcome screen on a phone" width={250}
          style={{ position: 'absolute', left: 880, top: 600 }} />
      </Panel>

      <Panel scale={scale} label="02 The check-in" height={1020}>
        <div style={top}>
          <div style={kicker}><span>02 — The check-in</span><span>iPad · 1180 × 820</span></div>
          <div style={rule} />
          <p style={{ ...body, maxWidth: '46ch' }}>About three minutes, start to finish. Big type and big targets for clients who have never seen the screen, and nothing a shop has to explain.</p>
        </div>
        <div style={{ position: 'absolute', left: 80, right: 80, top: 300, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '40px 28px' }}>
          {FLOW.map((s, k) => (
            <div key={s.src} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <IPad src={s.src} alt={`Kiosk step: ${s.t}`} width={328} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase' }}>{String(k + 1).padStart(2, '0')} {s.t}</span>
                <span style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.45, color: MUTED }}>{s.d}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel scale={scale} label="03 Phone-sized" height={1060}>
        <div style={top}>
          <div style={kicker}><span>03 — Same flow, phone-sized</span><span>390 × 844</span></div>
          <div style={rule} />
          <p style={{ ...body, maxWidth: '48ch' }}>The kiosk is built for an iPad, but the same screens reflow to one question at a time, so the flow holds up at any size.</p>
        </div>
        <div style={{ position: 'absolute', left: 80, right: 80, top: 290, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {PHONES.map((p, k) => (
            <div key={p.src} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: p.offset }}>
              <Phone src={p.src} alt={`Phone layout: ${p.t}`} width={236} />
              <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 8 }}>{String(k + 1).padStart(2, '0')} {p.t}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel scale={scale} label="04 Shop Admin" height={1000}>
        <div style={top}>
          <div style={kicker}><span>04 — Shop Admin</span><span>For the owner</span></div>
          <div style={rule} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 56, alignItems: 'end' }}>
            <p style={body}>Shop owners edit their own release: shop name, artists, the health checklist, consent wording and kiosk settings, with a live preview of the kiosk beside every change. Edits stay a draft until they publish, and changing the consent wording creates a new form version so every signed release keeps the exact text the client agreed to.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={label}>Colour</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
                {SWATCHES.map(c => (
                  <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 56, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
                    <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase' }}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: META }}>Stencil purple, after the purple stencil line every tattoo follows</div>
            </div>
          </div>
        </div>
        <Browser width={1040} height={477} style={{ position: 'absolute', left: 80, top: 440 }}>
          <img src={A + 'pl-shop-admin.webp'} alt="PurpleLine Shop Admin: editing the artist list with a live kiosk preview" loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }} />
        </Browser>
      </Panel>

      <Panel scale={scale} label="05 Launch page" height={1080}>
        <div style={top}>
          <div style={kicker}><span>05 — Launch page</span><span>purplelineco.com · live</span></div>
          <div style={rule} />
          <p style={{ ...body, maxWidth: '50ch' }}>The coming-soon page collects early-access sign-ups from shops while the app is built. Its hero is an animated run-through of a full check-in, including the ID going onto the shelf.</p>
        </div>
        <Browser width={836} height={522} style={{ position: 'absolute', left: 80, top: 330 }}>
          <iframe src={SITE + '/'} title="purplelineco.com, desktop view" loading="lazy"
            style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, border: 0, transform: 'scale(.5806)', transformOrigin: '0 0' }} />
        </Browser>
        <Phone frame={SITE + '/'} alt="purplelineco.com, phone view" width={290}
          style={{ position: 'absolute', left: 840, top: 300 }} />
        <a href={SITE} target="_blank" rel="noopener noreferrer"
          style={{ position: 'absolute', left: 80, top: 930, fontFamily: mono, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none' }}>
          Visit purplelineco.com ↗
        </a>
      </Panel>

      {/* Not scaled: a working kiosk visitors can click through */}
      <section aria-label="06 Try it" style={{ width: '100%', boxSizing: 'border-box', padding: `${Math.max(40, tryPad)}px ${tryPad}px ${Math.max(48, tryPad)}px`, display: 'flex', flexDirection: 'column', gap: 24, color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ ...kicker, fontSize: isMobile ? 12 : 14 }}><span>06 — Try it</span><span>Interactive</span></div>
          <div style={rule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <p style={{ ...body, fontSize: isMobile ? 18 : 22, maxWidth: '44ch' }}>Check yourself in at Rose City, a sample shop. Type, tap, take the ID photo and sign. Nothing is saved or sent.</p>
            <div role="group" aria-label="Device" style={{ display: 'inline-flex', border: `1px solid ${ACCENT}`, borderRadius: 999, overflow: 'hidden' }}>
              {[['ipad', 'iPad'], ['phone', 'Phone']].map(([id, name]) => (
                <button key={id} type="button" aria-pressed={device === id} onClick={() => setDevice(id)}
                  style={{ border: 0, padding: '10px 20px', minHeight: 44, cursor: 'pointer', fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase',
                    background: device === id ? ACCENT : 'transparent', color: device === id ? '#fff' : ACCENT }}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: device === 'phone' ? 400 : 1040, margin: '0 auto' }}>
          <KioskTryIt key={device} device={device} shop="Rose City" />
        </div>
        <div style={{ ...label, textAlign: 'center' }}>Sample shop and sample ID · works with mouse, trackpad or finger</div>
      </section>
    </div>
  );
}
