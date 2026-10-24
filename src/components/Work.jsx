// Project index. Hovering a row shows a circular image preview that follows the
// cursor (driven by data-follow-* attributes in src/lib/tm-motion.js).
// Featured items sit above the numbered list in accent orange; onOpen takes the index into [...featured, ...projects].
// A featured item's `brand` word is bolded inside its title.
const withBrand = (title, brand) => {
  const i = brand ? title.indexOf(brand) : -1;
  return i < 0 ? title : <>{title.slice(0, i)}<strong>{brand}</strong>{title.slice(i + brand.length)}</>;
};

export default function Work({ featured = [], projects, onOpen }) {
  return (
    <section id="work" className="work" data-sec="" data-follow-zone="">
      <div className="work__head">
        <h2 className="h2" data-head="">Selected work</h2>
      </div>

      {featured.length > 0 && (
        <div className="work__featured">
          {featured.map((p, i) => (
            <a key={p.n} href="#case" className="row row--featured"
              onClick={(e) => { e.preventDefault(); onOpen(i); }}>
              <span className="row__lead" aria-hidden="true">→</span>
              <span className="row__title">{withBrand(p.label || p.title, p.brand)}</span>
              <span className="row__meta"><span data-ico="">→</span></span>
            </a>
          ))}
        </div>
      )}

      {projects.map((p, i) => (
        <a key={p.n} href="#case" className="row" data-preview={p.n}
          onClick={(e) => { e.preventDefault(); onOpen(featured.length + i); }}>
          <span className="row__n">{p.n}</span>
          <span className="row__title">{p.title}</span>
          <span className="row__meta"><span>{p.disc}</span><span data-ico="">→</span></span>
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
