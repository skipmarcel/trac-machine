// Project index. Hovering a row shows a circular image preview that follows the
// cursor (driven by data-follow-* attributes in src/lib/tm-motion.js).
export default function Work({ projects, onOpen }) {
  return (
    <section id="work" className="work" data-sec="" data-follow-zone="">
      <div className="work__head">
        <h2 className="h2" data-head="">Selected work</h2>
        <span className="mono" data-scramble="">({String(projects.length).padStart(2, '0')})</span>
      </div>

      {projects.map((p, i) => (
        <a key={p.n} href="#case" className="row" data-preview={p.n}
          onClick={(e) => { e.preventDefault(); onOpen(i); }}>
          <span className="row__n">{p.n}</span>
          <span className="row__title">{p.title}</span>
          <span className="row__meta"><span>{p.disc}</span><span>{p.year}</span><span data-ico="">→</span></span>
        </a>
      ))}

      <div className="follow" data-follow="right" aria-hidden="true">
        <div className="follow__mask">
          {projects.map((p) => (
            <div key={p.n} className="follow__item" data-preview-img={p.n}>
              {p.preview
                ? <div className="follow__pin" data-pv="img"><img data-pv-src={p.preview} alt="" /></div>
                : p.hero.src && <img data-pv="hero" src={p.hero.src} alt="" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
