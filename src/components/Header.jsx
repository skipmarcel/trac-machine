import { RESUME } from '../config.js';

const LINKS = [['#work', 'Work'], ['#about', 'About'], ['#contact', 'Contact']];

// overHero: header is over the photo → light frosted bar (.is-clear). Solid once scrolled past.
export default function Header({ isMobile, menuOpen, setMenuOpen, overHero }) {
  if (isMobile) {
    return (
      <header className={'header' + (overHero && !menuOpen ? ' is-clear' : '')}>
        <div className="header__bar">
          <a href="#top" className="header__brand">Trac Machine</a>
          <button className="menu-btn" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            {LINKS.map(([href, label]) => <a key={href} href={href}>{label} <span>→</span></a>)}
            <a href={RESUME} target="_blank" rel="noopener noreferrer" className="accent" onClick={() => setMenuOpen(false)}>Resume <span>→</span></a>
          </nav>
        )}
      </header>
    );
  }
  return (
    <header className={'header' + (overHero ? ' is-clear' : '')}>
      <div className="header__grid">
        <a href="#top" className="header__brand">Trac Machine</a>
        <span className="header__tag">Graphic, Web, &amp; Print design</span>
        <nav className="header__links">
          {LINKS.map(([href, label]) => <a key={href} href={href} data-nav="">{label}</a>)}
          <a href={RESUME} target="_blank" rel="noopener noreferrer" data-nav="" className="accent">Resume →</a>
        </nav>
      </div>
    </header>
  );
}
