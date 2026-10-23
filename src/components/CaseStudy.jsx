function Fill({ src, video, fit = 'cover' }) {
  return (
    <>
      {src && <img src={src} alt="" loading="lazy" style={{ objectFit: fit }} />}
      {video && <video src={video} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture className="media__video" />}
    </>
  );
}

const Caption = ({ text }) => (text ? <div className="caption">{text}</div> : null);

// Claude Design decks (<deck-stage>) hide a small black control pill until hover. For embeds, restyle it from
// here (same-origin frame) so it's always visible, larger and high-contrast, and survives re-exporting the deck.
const DECK_CONTROLS_CSS = `
  .overlay { opacity: 1 !important; pointer-events: auto !important; filter: none !important;
    transform: translate(-50%, 0) !important; bottom: 18px; gap: 6px; padding: 6px;
    background: #fff; color: #111; font-size: 16px; box-shadow: 0 4px 18px rgba(0,0,0,.35); }
  .btn { height: 44px; min-width: 44px; color: #111; }
  .btn:hover { background: rgba(0,0,0,.08); color: #111; }
  .btn svg { width: 22px; height: 22px; }
  .count, .count * { color: #111 !important; opacity: 1 !important; }
  .count { padding: 0 6px; font-weight: 600; }
  .count .sep { margin: 0 4px; color: rgba(0,0,0,.4) !important; }
  .divider { background: rgba(0,0,0,.15) !important; }
  .btn.reset { font-size: 14px; color: #111; padding: 0 12px 0 14px; gap: 8px; }
  .btn.reset .kbd { min-width: 22px; height: 22px; font-size: 12px; color: #111; background: rgba(0,0,0,.08); }
`;
function styleDeckControls(e) {
  const doc = e.currentTarget.contentDocument; if (!doc) return;
  let tries = 0;
  const t = setInterval(() => {   // the deck unpacks itself after load, so wait for it
    const sh = doc.querySelector('deck-stage') && doc.querySelector('deck-stage').shadowRoot;
    if (sh) {
      if (!sh.querySelector('style[data-tm-controls]')) {
        const s = doc.createElement('style'); s.setAttribute('data-tm-controls', ''); s.textContent = DECK_CONTROLS_CSS; sh.appendChild(s);
      }
      clearInterval(t);
    } else if (++tries > 150) clearInterval(t);
  }, 100);
}

// Rendered twice (under the headline on desktop, under d2 on mobile); CSS shows one per layout.
const Pattern = ({ item, where }) => (
  <div className={'media case__pattern case__pattern--' + where} data-reveal="clip" data-img="" style={{ aspectRatio: item.aspect }}>
    <img src={item.src} alt={item.alt || ''} loading="lazy" /><Caption text={item.caption} />
  </div>
);

function TallBox({ item, delay }) {
  if (!item.src && !item.video) {
    return <div className="media case__d3 media--empty">Add image in projects.jsx</div>;
  }
  return (
    <div className="media case__d3" data-reveal="clip" data-delay={delay} data-img="">
      <Fill src={item.src} video={item.video} /><Caption text={item.caption} />
    </div>
  );
}

export default function CaseStudy({ projects, index, setIndex }) {
  const p = projects[index], n = projects.length;
  const heroBox = p.hero.aspect ? { aspectRatio: p.hero.aspect } : { height: 'clamp(320px,62vw,820px)' };

  return (
    <section id="case" className="section" data-sec="">
      <div className="case__hdr">
        <span data-scramble="">{p.heroOnly ? 'Featured' : 'Case ' + p.n}</span><span className="case__title">{p.title}</span>{p.disc && <span className="accent">{p.disc}</span>}
      </div>
      <div className="case__nav">
        <button className="case__arrow" aria-label="Previous case" onClick={() => setIndex((index + n - 1) % n)}>←</button>
        {projects.map((k, i) => (
          <button key={k.n} aria-label={k.title} className={(i === index ? 'is-active' : '') + (k.heroOnly ? ' is-featured' : '')} onClick={() => setIndex(i)}>{k.n}</button>
        ))}
        <button className="case__arrow" aria-label="Next case" onClick={() => setIndex((index + 1) % n)}>→</button>
      </div>

      {/* key remounts the case so reveal animations replay on every switch */}
      <div key={p.n} className={'case__grid case--' + p.n}>
        {p.intro && (
          <div className="case__intro" data-reveal="up">
            <h3>{p.intro.heading}</h3>
            {p.intro.text && <p>{p.intro.text}</p>}
          </div>
        )}
        <div className={'media case__hero' + (p.spots.length ? ' case__hero--notes' : '')} data-reveal="clip" data-img="" data-demo="" style={heroBox}>
          <div data-parallax={p.hero.parallax ? '0.08' : '0'}
            style={{ position: 'absolute', inset: p.hero.parallax ? '-8% 0' : '0', background: p.hero.bg || 'transparent' }}>
            <Fill src={p.hero.src} video={p.hero.video} fit={p.hero.fit} />
          </div>
        </div>

        {p.embed && p.embed.heading && (
          <div className="case__intro case__intro--embed" data-reveal="up">
            <h3>{p.embed.heading}</h3>
            {p.embed.text && <p>{p.embed.text}</p>}
          </div>
        )}
        {p.embed && (
          <div className="case__embed" data-reveal="up" data-delay="200">
            <iframe src={p.embed.src} title={p.embed.title} loading="lazy" allowFullScreen onLoad={styleDeckControls} />
          </div>
        )}

        {/* heroOnly cases (e.g. the CleaResult reel) stop here: no notes, text or detail images */}
        {!p.heroOnly && <>
        {/* design notes bar attached under the hero (was numbered hotspots over the image) */}
        {p.spots.length > 0 && (
          <div className="case__notes" data-reveal="up" data-delay="150">
            {p.spots.map((h) => (
              <div key={h.n} className="note"><span className="note__n" data-spot="">{h.n}</span><span>{h.label}</span></div>
            ))}
          </div>
        )}

        <div className="case__text">
          <div className="case__lead">
            <h3 className="h3" data-head="">{p.headline}</h3>
            {p.pattern && <Pattern item={p.pattern} where="desk" />}
          </div>
          <div className="case__copy" data-reveal="up" data-delay="120">
            <p>{p.context}</p>
            <p>{p.approach}</p>
            {p.art && <img className="case__art" src={p.art.src} alt={p.art.alt || ''} loading="lazy" />}
          </div>
        </div>

        <div className="media case__d2" data-reveal="clip" data-img="" style={{ background: p.d2.bg || 'transparent' }}>
          <Fill src={p.d2.src} fit={p.d2.fit} /><Caption text={p.d2.caption} />
        </div>
        {p.pattern && <Pattern item={p.pattern} where="mob" />}

        {/* label sits outside the clip-revealed box so the reveal can't hide it */}
        <div className={'case__d3col' + (p.d3b ? ' case__d3col--split' : '')}>
          {p.d3.label && <div className="case__label">{p.d3.label}</div>}
          <TallBox item={p.d3} delay="150" />
          {p.d3b && <TallBox item={p.d3b} delay="220" />}
        </div>
        </>}
      </div>
    </section>
  );
}
