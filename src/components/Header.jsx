import { RESUME } from '../config.js';

const LINKS = [['#work', 'Work'], ['#about', 'About'], ['#contact', 'Contact']];
const WWT = '/work-with-trac/';

// overHero: header is over the photo (.is-clear, no bottom rule). Text/background colour fade with --hdr-t (set in App.jsx).
// home: on the portfolio page the section links are in-page anchors; elsewhere they point back to /.
export default function Header({ isMobile, menuOpen, setMenuOpen, overHero, home = true }) {
  const base = home ? '' : '/';
  if (isMobile) {
    return (
      <header className={'header' + (menuOpen ? ' is-open' : overHero ? ' is-clear' : '')}>
        <div className="header__bar">
          <a href={base + '#top'} className="header__brand">TRAC MACHINE</a>
          <button className="menu-btn" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
            <span className="burger" aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            {LINKS.map(([href, label]) => <a key={href} href={base + href}>{label} <span>→</span></a>)}
            <a href={WWT}>Work With TRAC <span>→</span></a>
            <a href={RESUME} target="_blank" rel="noopener noreferrer" className="accent" onClick={() => setMenuOpen(false)}>Resume <span>→</span></a>
          </nav>
        )}
      </header>
    );
  }
  return (
    <header className={'header' + (overHero ? ' is-clear' : '')}>
      <div className="header__grid">
        <a href={base + '#top'} className="header__brand">TRAC MACHINE</a>
        <nav className="header__links">
          {LINKS.map(([href, label]) => <a key={href} href={base + href} data-nav="">{label}</a>)}
          <a href={WWT} data-nav="">Work With TRAC</a>
          <a href={RESUME} target="_blank" rel="noopener noreferrer" data-nav="" className="accent">Resume →</a>
        </nav>
      </div>
    </header>
  );
}
