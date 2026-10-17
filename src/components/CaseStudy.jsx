function Fill({ src, video, fit = 'cover' }) {
  return (
    <>
      {src && <img src={src} alt="" loading="lazy" style={{ objectFit: fit }} />}
      {video && <video src={video} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture className="media__video" />}
    </>
  );
}

const Caption = ({ text }) => (text ? <div className="caption">{text}</div> : null);

// Hotspot labels open to the right. If the open label would run past the image's right edge
// (small phones), slide the whole pill left just enough to fit; slide it back on close.
const SPOT_PAD = 8;
function fitSpot(e) {
  const s = e.currentTarget, box = s.parentElement.getBoundingClientRect(), r = s.getBoundingClientRect();
  const open = s.querySelector('.spot__n').offsetWidth + s.querySelector('.spot__label').scrollWidth;   // full open width
  const over = r.left + open - (box.right - SPOT_PAD);
  s.style.transform = over > 0 ? `translateX(${-Math.min(over, r.left - box.left - SPOT_PAD)}px)` : '';
}
const unfitSpot = (e) => { e.currentTarget.style.transform = ''; };

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
        <span data-scramble="">Case {p.n}</span><span>{p.title}</span><span>{p.year}</span><span className="accent">{p.disc}</span>
      </div>
      <div className="case__nav">
        <button className="case__arrow" aria-label="Previous case" onClick={() => setIndex((index + n - 1) % n)}>←</button>
        {projects.map((k, i) => (
          <button key={k.n} aria-label={k.title} className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)}>{k.n}</button>
        ))}
        <button className="case__arrow" aria-label="Next case" onClick={() => setIndex((index + 1) % n)}>→</button>
      </div>

      {/* key remounts the case so reveal animations replay on every switch */}
      <div key={p.n} className={'case__grid case--' + p.n}>
        <div className="media case__hero" data-reveal="clip" data-img="" data-demo="" style={heroBox}>
          <div data-parallax={p.hero.parallax ? '0.08' : '0'}
            style={{ position: 'absolute', inset: p.hero.parallax ? '-8% 0' : '0', background: p.hero.bg || 'transparent' }}>
            <Fill src={p.hero.src} video={p.hero.video} fit={p.hero.fit} />
          </div>
          {p.spots.map((h) => (
            <div key={h.n} className="spot" data-spot="" tabIndex={0} style={{ left: h.x, top: h.y }}
              onMouseEnter={fitSpot} onFocus={fitSpot} onMouseLeave={unfitSpot} onBlur={unfitSpot}>
              <span className="spot__n">{h.n}</span><span className="spot__label">{h.label}</span>
            </div>
          ))}
        </div>

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
      </div>
    </section>
  );
}
