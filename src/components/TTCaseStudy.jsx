import { useEffect, useRef, useState } from 'react';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { MOBILE_QUERY } from '../config.js';

// TuneIn case study, written for engineers. Panels 01-03 use the same system as the
// FK, PT and PL cases (drawn at 1200 wide and scaled to the column). The API, decisions
// and then/now sections are NOT scaled: they hold code and dense text, so they reflow
// like normal page content and stay readable on phones.
const PLAY = 'https://name-that-tune-2.vercel.app';
const REPO = 'https://github.com/skipmarcel/name-that-tune-2';
const ORIGINAL = 'https://github.com/skipmarcel/name-that-tune';
const A = '/assets/tt/';

// TuneIn's own palette (from the app's CSS tokens)
const BG = '#0d0b0a', SURF = '#1a1714', SURF2 = '#26201c', LINE = '#3a322c';
const INK = '#f5efe8', MUTED = '#b0a598', ACCENT = '#ff7a4d', GREEN = '#4cc38a';
const display = "'Quicksand', sans-serif", mono = "var(--mono), ui-monospace, monospace", sans = 'var(--sans)';
const FONTS = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&display=swap';

const kicker = { display: 'flex', justifyContent: 'space-between', gap: 16, fontFamily: mono, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED };
const rule = { height: 1, background: ACCENT };
const top = { position: 'absolute', left: 80, right: 80, top: 80, display: 'flex', flexDirection: 'column', gap: 26 };
const body = { margin: 0, fontFamily: sans, fontSize: 22, lineHeight: 1.5, color: MUTED, textWrap: 'pretty' };
const shadow = '0 30px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)';
const ext = { target: '_blank', rel: 'noopener noreferrer' };

const ROUND = [
  { src: 'tt-phone-round.webp', t: 'Listen', d: 'A clip plays through a hidden Spotify embed driven by custom controls, so the title never shows.', offset: 0 },
  { src: 'tt-phone-guess.webp', t: 'Guess', d: 'Artist and title are judged separately. A right answer locks in; a wrong one shakes and stays editable.', offset: 56 },
  { src: 'tt-phone-reveal.webp', t: 'Reveal', d: 'Cover art, album and a Spotify link. The dots track every round: green for points, red for a miss.', offset: 0 },
  { src: 'tt-phone-missed.webp', t: 'Give up', d: 'Reveal answer ends the round early and keeps any points already earned.', offset: 56 },
];

const STACK = [
  ['Front end', 'React 19 · TypeScript · Vite'],
  ['Back end', 'Vercel serverless functions · Upstash Redis'],
  ['Music', 'Spotify Web API (PKCE) · Spotify iFrame API'],
  ['Quality', 'Vitest + Testing Library (214 tests) · Oxlint · GitHub Actions CI'],
];

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/games', note: 'Start a game. The server picks the 10 tracks, not the browser.',
    req: '{ "playlistId": "7zoWexD4L0dD31O2H0RG08" }',
    res: '200 { "ticket": "eyJ2IjoxLCJpZCI6….kQ3f…",\n      "trackIds": ["3RkQ3U…", … 10 IDs] }',
  },
  {
    method: 'GET', path: '/api/leaderboard?playlist=<id>', note: 'Top 10 for one playlist.',
    res: '200 { "entries": [{ "name": "Tyler", "score": 26,\n      "maxScore": 30, "correct": 9, "createdAt": … }] }',
  },
  {
    method: 'POST', path: '/api/leaderboard', note: 'Submit a finished game. Only the accepted guesses are sent; the server works out the score.',
    req: '{ "ticket": "eyJ2Ijox…", "name": "Tyler",\n  "rounds": [{ "artist": "Commodores", "title": "Nightshift" },\n             { "artist": null, "title": null }, …] }',
    res: '201 { "rank": 1, "entry": { … }, "entries": [ … ] }',
  },
];

const CHECKS = [
  ['Signed tickets', 'A ticket is base64url(JSON) plus an HMAC-SHA256 signature, compared with timingSafeEqual. The browser can read its track IDs (it needs them to play the songs) but can’t change them.'],
  ['Server-side scoring', 'Every submitted guess is re-checked against the real artist and title with the same TypeScript matching module the game uses, and the server stores the score it computed.'],
  ['Replay and speed limits', 'Tickets are single-use and expire after 3 hours. The ticket is claimed in Redis only after every other check passes, so a rejected submission doesn’t burn it. A game faster than 2 seconds a song is rejected.'],
  ['Abuse limits', 'Per-IP rate limits (60 games and 10 submissions per 10 minutes), a 16 KB body cap, and names that are Unicode-normalized with invisible characters stripped.'],
  ['One handler, two runtimes', 'The handlers are written against web-standard Request and Response, so the same code runs as Vercel functions in production and inside the Vite dev server through a small plugin, with an in-memory store locally.'],
  ['Fails soft', 'If the API is down the game still plays, just unranked. The next ticket is fetched on the home screen, so Start can begin audio inside the click, which browsers require.'],
];

const DECISIONS = [
  ['No secret anywhere', 'The 2023 original shipped the Spotify client secret in the front-end bundle. Now the playlist sync uses Authorization Code with PKCE (public client ID only) and playback uses Spotify’s embed, which needs no token. The only server secret is the ticket-signing key.'],
  ['Playlists synced ahead of time', 'Spotify only returns a playlist’s tracks to its owner, so a Node script signs the owner in once, follows pagination, drops local files, episodes and duplicates, and commits JSON. Players need no Spotify account, and starting a game costs zero Spotify calls.'],
  ['Forgiving answer matching', 'Guesses are normalized (case, accents, punctuation, “feat.”, “– 2011 Remaster”, a leading “The”) and up to two typos are forgiven, with swapped letters counting as one. Numbers and roman numerals must still match, so “Dance II” isn’t “Dance I”. The rules are tested against every title in every playlist.'],
  ['Hidden player', 'Spotify’s embed displays the song title, so it lives off-screen, hidden from screen readers, and the game drives it through the iFrame API with its own play, pause and progress UI.'],
  ['CSS to one canvas', 'The animated spirograph started as ~200 animated CSS elements: 28–52 compositor layers and up to ~800 MB of GPU memory on phones, which made the player flicker. Redrawing it on a single canvas capped at 2× density keeps the same look in one small layer.'],
  ['Logic separate from UI', 'Scoring, track picking, matching and the game-state reducer are pure TypeScript with unit tests. React components only render and take input. An end-to-end test runs the app against the real API in-process.'],
];

const THEN_NOW = [
  ['Client secret in the front-end bundle', 'No secret needed (PKCE sync, embed player)'],
  ['Spotify embed displayed the answer', 'Player hidden; answer revealed after the guess'],
  ['Exact-match guessing', 'Normalized, typo-tolerant matching'],
  ['Game never ended', 'Round-based reducer with an end screen'],
  ['Only the first 100 tracks loaded', 'Paginated playlist sync'],
  ['No working tests', '214 unit, component and end-to-end tests in CI'],
];

function Panel({ scale, label: name, height = 1200, children }) {
  return (
    <section aria-label={name} style={{ width: '100%', height: height * scale, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1200, height, transform: `scale(${scale})`, transformOrigin: '0 0', background: BG, color: INK }}>
        {children}
      </div>
    </section>
  );
}

// Phone bezel around a 390-wide screenshot. position lets a tall capture show its bottom.
function Phone({ src, alt, width, position = 'top', style }) {
  return (
    <div style={{ width, padding: 11, borderRadius: width * .16, background: '#050505', boxShadow: `0 34px 80px rgba(0,0,0,.6), inset 0 0 0 2px ${LINE}`, ...style }}>
      <img src={A + src} alt={alt} loading="lazy"
        style={{ display: 'block', width: '100%', aspectRatio: '390 / 844', borderRadius: width * .125, objectFit: 'cover', objectPosition: position }} />
    </div>
  );
}

function Browser({ width, src, alt, style }) {
  return (
    <div style={{ width, borderRadius: 12, overflow: 'hidden', background: SURF, boxShadow: shadow, ...style }}>
      <div style={{ height: 34, background: SURF2, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: LINE }} />)}
        <span style={{ marginLeft: 14, fontFamily: mono, fontSize: 12, color: MUTED }}>name-that-tune-2.vercel.app</span>
      </div>
      <img src={A + src} alt={alt} loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '1440 / 900', objectFit: 'cover' }} />
    </div>
  );
}

// Architecture diagram boxes (1200-wide coordinates)
const BOX_W = 300, BOX_H = 112;
const BOXES = [
  { id: 'spotify', x: 80, y: 330, t: 'Spotify Web API', d: 'Owner’s playlists' },
  { id: 'sync', x: 450, y: 330, t: 'npm run sync-playlist', d: 'Node script · PKCE sign-in', accent: true },
  { id: 'json', x: 820, y: 330, t: 'playlists/*.json', d: 'Committed track lists' },
  { id: 'embed', x: 80, y: 620, t: 'Hidden Spotify embed', d: 'iFrame API · off-screen' },
  { id: 'app', x: 450, y: 620, t: 'React app', d: 'Browser · game logic', accent: true },
  { id: 'api', x: 820, y: 620, t: 'Vercel functions', d: '/api/games · /api/leaderboard', accent: true },
  { id: 'redis', x: 820, y: 880, t: 'Upstash Redis', d: 'Top scores · used tickets' },
];
const arrowLabel = { fontFamily: 'Spline Sans Mono, monospace', fontSize: 13, fill: MUTED, letterSpacing: '.02em' };

function Diagram() {
  const L = (x1, y1, x2, y2, both) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ACCENT} strokeWidth="2" markerEnd="url(#tt-arrow)" markerStart={both ? 'url(#tt-arrow-start)' : undefined} />
  );
  return (
    <div style={{ position: 'absolute', left: 0, top: 50, width: 1200, height: 1060 }}>
      <div style={{ position: 'absolute', left: 80, top: 292, fontFamily: mono, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED }}>Ahead of time · playlist owner</div>
      <div style={{ position: 'absolute', left: 80, top: 582, fontFamily: mono, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED }}>At play time · anyone</div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 540, height: 1, borderTop: `1px dashed ${LINE}` }} />
      <svg width="1200" height="1060" viewBox="0 0 1200 1060" style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
        <defs>
          <marker id="tt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={ACCENT} /></marker>
          <marker id="tt-arrow-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M10 0 L0 5 L10 10 z" fill={ACCENT} /></marker>
        </defs>
        {/* sync -> spotify */}{L(450, 386, 384, 386)}
        <text x="415" y="372" textAnchor="middle" style={arrowLabel}>GET</text>
        {/* sync -> json */}{L(750, 386, 816, 386)}
        <text x="785" y="372" textAnchor="middle" style={arrowLabel}>writes</text>
        {/* json -> app (bundled) */}{L(900, 442, 640, 616)}
        <text x="700" y="510" style={arrowLabel}>bundled at build</text>
        {/* json -> api */}{L(1040, 442, 1040, 616)}
        <text x="1052" y="535" style={arrowLabel}>read by API</text>
        {/* app -> embed */}{L(450, 676, 384, 676)}
        <text x="415" y="662" textAnchor="middle" style={arrowLabel}>play</text>
        {/* app <-> api */}{L(752, 660, 816, 660)}{L(816, 694, 752, 694)}
        <text x="784" y="650" textAnchor="middle" style={arrowLabel}>guesses</text>
        <text x="784" y="720" textAnchor="middle" style={arrowLabel}>score</text>
        {/* api <-> redis */}{L(970, 734, 970, 876, true)}
      </svg>
      {BOXES.map(b => (
        <div key={b.id} style={{ position: 'absolute', left: b.x, top: b.y, width: BOX_W, height: BOX_H, boxSizing: 'border-box', padding: '22px 24px', borderRadius: 14,
          background: SURF, border: `1px solid ${b.accent ? ACCENT : LINE}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 16, color: INK }}>{b.t}</span>
          <span style={{ fontFamily: sans, fontSize: 16, color: MUTED }}>{b.d}</span>
        </div>
      ))}
    </div>
  );
}

// Overview copy and stack list. Drawn inside the scaled panel on desktop; as normal,
// readable text (mobile) on phones.
function OverviewText({ mobile }) {
  return (
    <>
      <div style={{ ...kicker, fontSize: mobile ? 12 : 14 }}><span>01 — Overview</span><span>Web app · Live</span></div>
      <div style={rule} />
      <h1 style={{ margin: 0, fontFamily: display, fontWeight: 700, fontSize: mobile ? 52 : 92, lineHeight: .98, letterSpacing: '-.02em', color: INK }}>TuneIn</h1>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'minmax(0,1.35fr) minmax(0,1fr)', gap: mobile ? 28 : 56, alignItems: 'start' }}>
        <p style={{ ...body, fontSize: mobile ? 17 : 22 }}>A “name that tune” game built on Spotify. You hear a clip from a playlist and name the artist (2 points) and the song (1 point), with forgiving answer matching. After 10 songs the best scores go on a shared leaderboard that never trusts a score sent from the browser. It’s a ground-up rebuild, in React and TypeScript, of a vanilla-JS project I built in coding school in 2023.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 14 : 16, fontFamily: mono, fontSize: mobile ? 12 : 13, lineHeight: 1.6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {STACK.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ color: MUTED }}>{k}</span><span>{v}</span></div>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: mobile ? '4px 22px' : 22 }}>
            <a href={PLAY} {...ext} style={{ color: ACCENT, padding: mobile ? '10px 0' : 0 }}>Play it ↗</a>
            <a href={REPO} {...ext} style={{ color: ACCENT, padding: mobile ? '10px 0' : 0 }}>Source on GitHub ↗</a>
          </div>
        </div>
      </div>
    </>
  );
}

function Code({ children, small }) {
  return (
    <pre style={{ margin: 0, padding: small ? '12px 14px' : '14px 18px', background: '#050505', border: `1px solid ${LINE}`, borderRadius: 10, overflowX: 'auto',
      fontFamily: mono, fontSize: small ? 12 : 13, lineHeight: 1.6, color: INK, whiteSpace: 'pre' }}>{children}</pre>
  );
}

export default function TTCaseStudy() {
  const wrap = useRef(null);
  const [w, setW] = useState(1200);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  useEffect(() => {
    if (!document.querySelector('link[data-tt-fonts]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = FONTS; l.setAttribute('data-tt-fonts', '');
      document.head.appendChild(l);
    }
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1, w / 1200);
  const pad = isMobile ? 20 : Math.max(32, Math.round(80 * scale));
  const flowSection = { width: '100%', boxSizing: 'border-box', padding: `${Math.max(40, pad)}px ${pad}px`, display: 'flex', flexDirection: 'column', gap: 24, color: INK };
  const flowKicker = { ...kicker, fontSize: isMobile ? 12 : 14 };
  const flowBody = { ...body, fontSize: isMobile ? 17 : 20, maxWidth: '62ch' };
  const h3 = { margin: 0, fontFamily: display, fontWeight: 700, fontSize: isMobile ? 18 : 20, color: INK };
  const small = { margin: 0, fontFamily: sans, fontSize: isMobile ? 15 : 16, lineHeight: 1.55, color: MUTED, textWrap: 'pretty' };
  const btn = (primary) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 22px', borderRadius: 999, textDecoration: 'none',
    fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase',
    background: primary ? ACCENT : 'transparent', color: primary ? '#1d0f08' : ACCENT, border: `1px solid ${ACCENT}` });

  return (
    <div ref={wrap} className="tt-case" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* On phones the overview text is unscaled flow content and only the screens below are scaled */}
      {isMobile ? (
        <section aria-label="01 Overview" style={{ ...flowSection, paddingBottom: 8 }}>
          <OverviewText mobile />
        </section>
      ) : null}
      <Panel scale={scale} label={isMobile ? 'TuneIn home screen' : '01 Overview'} height={isMobile ? 690 : 1210}>
        {!isMobile && <div style={top}><OverviewText /></div>}
        <Browser width={880} src="tt-desktop-home.webp" alt="TuneIn home screen on desktop: the title, how to score, a list of playlists and a Start button over a neon spirograph" style={{ position: 'absolute', left: 80, top: isMobile ? 40 : 560 }} />
        <Phone src="tt-phone-home.webp" alt="TuneIn home screen on a phone" width={260} style={{ position: 'absolute', left: 860, top: isMobile ? 90 : 610 }} />
      </Panel>

      <Panel scale={scale} label="02 A round" height={1030}>
        <div style={top}>
          <div style={kicker}><span>02 — A round</span><span>Phone · 390 × 844</span></div>
          <div style={rule} />
          <p style={{ ...body, maxWidth: '50ch' }}>Ten songs a game. One column that works from 320px up, 16px inputs so iOS doesn’t zoom, focus that moves to whichever box still needs an answer, and results announced to screen readers.</p>
        </div>
        <div style={{ position: 'absolute', left: 80, right: 80, top: 300, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {ROUND.map((p, k) => (
            <div key={p.src} style={{ width: 236, display: 'flex', flexDirection: 'column', gap: 16, marginTop: p.offset }}>
              <Phone src={p.src} alt={`Round screen: ${p.t}`} width={236} />
              <span style={{ fontFamily: mono, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 6 }}>{String(k + 1).padStart(2, '0')} {p.t}</span>
              <span style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.45, color: MUTED, paddingLeft: 6 }}>{p.d}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel scale={scale} label="03 How it works" height={1100}>
        <div style={top}>
          <div style={kicker}><span>03 — How it works</span><span>Architecture</span></div>
          <div style={rule} />
          <p style={{ ...body, maxWidth: '56ch' }}>Spotify only shares a playlist’s tracks with its owner, so the track lists are synced ahead of time and bundled. At play time nobody needs a Spotify account: audio comes through the embed, and the API only deals in tickets and scores.</p>
        </div>
        <Diagram />
      </Panel>

      {/* Not scaled from here on: code and dense text that must stay readable on phones */}
      <section aria-label="04 The leaderboard API" style={flowSection}>
        <div style={flowKicker}><span>04 — The leaderboard API</span><span>3 endpoints</span></div>
        <div style={rule} />
        <p style={flowBody}>The goal: the only way onto the board is to actually name the songs. So the server chooses the tracks, signs the list, and scores the game itself.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 280px', gap: isMobile ? 28 : 48, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
            {ENDPOINTS.map(e => (
              <div key={e.method + e.path} style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: e.method === 'GET' ? '#16301f' : '#3a1f14', color: e.method === 'GET' ? GREEN : ACCENT }}>{e.method}</span>
                  <code style={{ fontFamily: mono, fontSize: isMobile ? 14 : 16, color: INK, overflowWrap: 'anywhere' }}>{e.path}</code>
                </div>
                <p style={small}>{e.note}</p>
                {e.req && <Code small={isMobile}>{e.req}</Code>}
                <Code small={isMobile}>{e.res}</Code>
              </div>
            ))}
          </div>
          <figure style={{ margin: isMobile ? '0 auto' : 0, display: 'flex', flexDirection: 'column', gap: 14, width: isMobile ? 240 : 280 }}>
            <Phone src="tt-phone-results.webp" alt="Results screen: 26 of 30, each song with its points, and #1 on the 80s Hits leaderboard" width={isMobile ? 240 : 280} position="bottom" />
            <figcaption style={{ ...small, fontSize: 14 }}>The results screen after a submitted game. The rank comes back from the POST.</figcaption>
          </figure>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0,1fr))', gap: isMobile ? 22 : 32, marginTop: 12 }}>
          {CHECKS.map(([t, d]) => (
            <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
              <h3 style={h3}>{t}</h3>
              <p style={small}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="05 Engineering decisions" style={flowSection}>
        <div style={flowKicker}><span>05 — Engineering decisions</span><span>Trade-offs</span></div>
        <div style={rule} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0,1fr))', gap: isMobile ? 14 : 20 }}>
          {DECISIONS.map(([t, d]) => (
            <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: isMobile ? 20 : 26, background: SURF, border: `1px solid ${LINE}`, borderRadius: 14 }}>
              <h3 style={h3}>{t}</h3>
              <p style={small}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="06 Then and now" style={{ ...flowSection, paddingBottom: Math.max(56, pad) }}>
        <div style={flowKicker}><span>06 — 2023 → now</span><span>What changed</span></div>
        <div style={rule} />
        <p style={flowBody}>The <a href={ORIGINAL} {...ext} style={{ color: ACCENT }}>original</a> was a group project from coding school. Rebuilding it was a chance to fix what it shipped with.</p>
        <div role="table" aria-label="Original versus TuneIn" style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${LINE}`, borderRadius: 14, overflow: 'hidden' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: SURF2, fontFamily: mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: MUTED }}>
            <span role="columnheader" style={{ padding: '12px 16px' }}>Original (2023)</span>
            <span role="columnheader" style={{ padding: '12px 16px' }}>TuneIn</span>
          </div>
          {THEN_NOW.map(([a, b]) => (
            <div role="row" key={a} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${LINE}`, fontFamily: sans, fontSize: isMobile ? 14 : 16, lineHeight: 1.45 }}>
              <span role="cell" style={{ padding: '12px 16px', color: MUTED }}>{a}</span>
              <span role="cell" style={{ padding: '12px 16px', color: INK, background: SURF }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
          <a href={PLAY} {...ext} style={btn(true)}>Play TuneIn ↗</a>
          <a href={REPO} {...ext} style={btn(false)}>Read the code ↗</a>
        </div>
      </section>
    </div>
  );
}
