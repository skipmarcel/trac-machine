(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const EZ = 'cubic-bezier(.2,.7,.1,1)';
  const GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#+*';
  let R = null, last = {}, mx = -999, my = -999, rx = -999, ry = -999, lx = -999, ly = -999, onPage = false;
  const cfg = k => (R && R.dataset[k]) || '';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function textNode(el) { for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return n; return null; }
  function scramble(node, final, dur) {
    if (!node) return;
    const tok = (node.__tok || 0) + 1; node.__tok = tok;
    if (RM) { node.nodeValue = final; return; }
    const t0 = performance.now(), len = final.length, from = node.nodeValue;
    (function f() {
      if (node.__tok !== tok) return;
      const p = Math.min(1, (performance.now() - t0) / (dur || 700));
      let out = '';
      for (let i = 0; i < len; i++) { const ch = final[i]; out += (ch === ' ' || i < p * len) ? ch : GL[(Math.random() * GL.length) | 0]; }
      node.nodeValue = out;
      if (p < 1) requestAnimationFrame(f); else node.nodeValue = final;
    })();
  }
  function toast(msg) {
    const t = R.querySelector('[data-toast]'); if (!t) return;
    t.textContent = msg; t.getAnimations().forEach(a => a.cancel());
    t.animate([{ opacity: 0, transform: 'translate(-50%,12px)' }, { opacity: 1, transform: 'translate(-50%,0)', offset: .12 }, { opacity: 1, transform: 'translate(-50%,0)', offset: .85 }, { opacity: 0, transform: 'translate(-50%,6px)' }], { duration: 2400, easing: EZ, fill: 'both' });
  }

  /* buttons */
  function applyT(b) { b.style.transform = 'translate(' + (b.__x || 0) + 'px,' + ((b.__y || 0) + (b.__ly || 0)) + 'px) scale(' + (b.__s || 1) + ')'; }
  function btnEnter(b) {
    const m = cfg('ixBtn');
    b.style.transition = 'box-shadow .5s ' + EZ + ',transform .35s ' + EZ + ',color .3s,border-color .3s,background-color .3s';
    if (m === 'Fill sweep') b.style.boxShadow = 'inset ' + (b.offsetWidth + 2) + 'px 0 0 0 ' + (b.dataset.btn === '2' ? cfg('ink') : cfg('acc'));
    if (m === 'Lift') { b.__ly = -3; b.style.boxShadow = '0 12px 24px -12px rgba(0,0,0,.45)'; applyT(b); }
    if (m === 'Arrow nudge') { const i = b.querySelector('[data-ico]'); if (i) { i.style.transition = 'transform .35s ' + EZ; i.style.transform = 'translateX(5px)'; } }
  }
  function btnLeave(b) {
    const m = cfg('ixBtn');
    b.style.boxShadow = m === 'Fill sweep' ? 'inset 0 0 0 0 ' + (b.dataset.btn === '2' ? cfg('ink') : cfg('acc')) : '';
    b.__x = b.__y = b.__ly = 0; b.__s = 1; applyT(b);
    const i = b.querySelector('[data-ico]'); if (i) i.style.transform = '';
  }

  /* nav */
  function navBase(el) {
    ['backgroundImage', 'backgroundSize', 'backgroundRepeat', 'backgroundPosition', 'boxShadow', 'opacity', 'backgroundColor', 'borderRadius', 'fontWeight'].forEach(p => el.style[p] = '');
    if (el.__c !== undefined) { el.style.color = el.__c; el.__c = undefined; }
    el.style.transition = 'background-size .45s ' + EZ + ',opacity .3s,color .3s,box-shadow .3s,background-color .3s';
    if (cfg('ixNav') === 'Underline grow') {
      Object.assign(el.style, { backgroundImage: 'linear-gradient(currentColor,currentColor)', backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%', backgroundSize: (el.__active ? '100%' : '0%') + ' 1px' });
    }
    if (cfg('ixActive') === '1' && el.__active) el.style.fontWeight = '600';
  }
  function navEnter(el) {
    const m = cfg('ixNav');
    if (m === 'Underline grow') el.style.backgroundSize = '100% 1px';
    if (m === 'Color') { el.__c = el.style.color; el.style.color = cfg('acc'); }
    if (m === 'Pill highlight') { el.style.backgroundColor = cfg('surf'); el.style.boxShadow = '0 0 0 7px ' + cfg('surf'); el.style.borderRadius = '999px'; }
    if (m === 'Dim others') { const h = el.closest('header'); if (h) h.querySelectorAll('[data-nav]').forEach(o => { if (o !== el) o.style.opacity = '.32'; }); }
  }
  function navLeave(el) {
    const h = el.closest('header');
    (h ? h.querySelectorAll('[data-nav]') : [el]).forEach(navBase);
  }
  let spy;
  function setupSpy() {
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      R.querySelectorAll('[data-nav]').forEach(n => { n.__active = n.getAttribute('href') === '#' + e.target.id; navBase(n); });
    }), { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'work', 'about', 'contact'].forEach(id => { const s = R.querySelector('#' + id); if (s) spy.observe(s); });
  }

  /* cards + images */
  function slotOf(el) { return el.querySelector('image-slot, img'); }
  function cardEnter(c) {
    const m = cfg('ixCard');
    c.style.transition = 'transform .45s ' + EZ + ',color .3s';
    if (m === 'Lift') c.style.transform = 'translateY(-6px)';
    if (m === 'Image zoom') { const s = slotOf(c); if (s) { s.style.transition = 'transform 1.1s ' + EZ; s.style.transform = 'scale(1.06)'; } }
  }
  function cardMove(c, e) {
    const m = cfg('ixCard'), r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    if (m === 'Tilt 3D') { c.style.transition = 'transform .15s linear,color .3s'; c.style.transform = 'perspective(900px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg) translateY(-2px)'; }
    if (m === 'Spotlight') c.style.backgroundImage = 'radial-gradient(280px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, color-mix(in oklch, ' + cfg('acc') + ' 16%, transparent), transparent 70%)';
  }
  function cardLeave(c) { c.style.transition = 'transform .6s ' + EZ + ',color .3s'; c.style.transform = ''; c.style.backgroundImage = ''; const s = slotOf(c); if (s) s.style.transform = ''; }
  function imgSkip(el) { return el.closest('[data-card]') || (el.closest('[data-demo]') && cfg('ixDemo') === 'Browser + scroll'); }
  function imgEnter(el) {
    if (imgSkip(el)) return; const s = slotOf(el); if (!s) return; const m = cfg('ixImg');
    s.style.transition = 'transform 1.2s ' + EZ + ', filter 1s ease';
    if (m === 'Zoom') s.style.transform = 'scale(1.05)';
    if (m === 'Pan with cursor') s.style.transform = 'scale(1.1)';
  }
  function imgMove(el, e) {
    if (imgSkip(el) || cfg('ixImg') !== 'Pan with cursor') return; const s = slotOf(el); if (!s) return;
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    s.style.transition = 'transform .8s ' + EZ + ', filter 1s ease'; s.style.transform = 'scale(1.1) translate(' + (-px * 5).toFixed(2) + '%,' + (-py * 5).toFixed(2) + '%)';
  }
  function imgLeave(el) { if (el.closest('[data-card]')) return; const s = slotOf(el); if (s && !(el.closest('[data-demo]') && cfg('ixDemo') === 'Browser + scroll')) { s.style.transition = 'transform 1s ' + EZ + ', filter 1s ease'; s.style.transform = ''; } }

  /* product demo */
  function demoEnter(d) {
    if (cfg('ixDemo') !== 'Browser + scroll') return;
    const s = d.querySelector('image-slot'), v = d.querySelector('[data-demo-view]'); if (!s || !v) return;
    const dist = Math.max(0, s.offsetHeight - (v.offsetHeight - 36));
    s.style.transition = 'transform ' + Math.max(2.5, dist / 260).toFixed(1) + 's cubic-bezier(.45,0,.2,1)'; s.style.transform = 'translateY(' + (-dist) + 'px)';
  }
  function demoLeave(d) { const s = d.querySelector('image-slot'); if (s && cfg('ixDemo') === 'Browser + scroll') { s.style.transition = 'transform 1.4s ' + EZ; s.style.transform = ''; } }
  let spotAnims = [];
  function setupSpots() {
    spotAnims.forEach(a => a.cancel()); spotAnims = [];
    if (RM || cfg('ixDemo') !== 'Hotspots') return;
    R.querySelectorAll('[data-spot]').forEach((s, i) => spotAnims.push(s.animate([{ boxShadow: '0 0 0 0 rgba(255,255,255,.55)' }, { boxShadow: '0 0 0 14px rgba(255,255,255,0)' }], { duration: 2200, delay: i * 500, iterations: Infinity })));
  }

  /* headings */
  let hio;
  const headSel = '[data-head],[data-scramble]';
  function headPrep(el) {
    const m = cfg('ixHead'); el.__hd = 0;
    el.getAnimations().forEach(a => a.cancel());
    if (!el.__orig) el.__orig = { fw: el.style.fontWeight, ls: el.style.letterSpacing };
    el.style.clipPath = ''; el.style.transform = ''; el.style.fontWeight = el.__orig.fw; el.style.letterSpacing = el.__orig.ls;
    if (RM || m === 'None' || (el.hasAttribute('data-scramble') && m !== 'Scramble')) return false;
    if (el.hasAttribute('data-head') && m === 'Line rise') { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'translateY(.35em)'; }
    if (el.hasAttribute('data-head') && m === 'Weight morph') { el.__fw = getComputedStyle(el).fontWeight; el.__ls = getComputedStyle(el).letterSpacing; el.animate([{ fontWeight: 700, letterSpacing: '.02em' }], { duration: 1, fill: 'forwards' }); }
    return true;
  }
  function headPlay(el) {
    const m = cfg('ixHead');
    if (m === 'Line rise' && el.hasAttribute('data-head')) {
      const a = el.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(.35em)' }, { clipPath: 'inset(0 0 -10% 0)', transform: 'none' }], { duration: 1000, easing: EZ, fill: 'forwards' });
      a.onfinish = () => { el.style.clipPath = ''; el.style.transform = ''; a.cancel(); };
    }
    if (m === 'Weight morph' && el.hasAttribute('data-head')) {
      el.getAnimations().forEach(x => x.cancel());
      const a = el.animate([{ fontWeight: 700, letterSpacing: '.02em' }, { fontWeight: el.__fw, letterSpacing: el.__ls }], { duration: 1400, easing: EZ });
    }
    if (m === 'Scramble') { const n = textNode(el); if (n) { const f = n.__final || n.nodeValue; n.__final = f; scramble(n, f, 650 + f.length * 12); } }
  }
  function setupHeads() {
    if (hio) hio.disconnect();
    hio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { hio.unobserve(e.target); headPlay(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    R.querySelectorAll(headSel).forEach(el => { el.__hp = 1; if (headPrep(el)) hio.observe(el); });
  }

  /* background */
  let bgAnims = [];
  function setupBg(replay) {
    bgAnims.forEach(a => a.cancel()); bgAnims = [];
    const m = cfg('ixBg'), light = R.querySelector('[data-light]');
    if (light) light.style.opacity = m === 'Cursor light' && FINE ? 1 : 0;
    if (RM) return;
    if (m === 'Grid draw-in' && replay) {
      const g = R.querySelector('[data-gridlines]');
      if (g) [...g.children].forEach((l, i) => bgAnims.push(l.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1800, delay: 150 + i * 110, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'backwards' })));
    }
    if (m === 'Drift') bgAnims.push(R.animate([{ backgroundPosition: '0px 0px' }, { backgroundPosition: '44px 88px' }], { duration: 14000, iterations: Infinity }));
  }

  /* cursor */
  function setupCursor() {
    const m = FINE ? cfg('ixCursor') : 'System', q = k => R.querySelector('[data-cur="' + k + '"]');
    const show = { dot: m === 'Dot' || m === 'Ring + label', ring: m === 'Ring + label', h: m === 'Crosshair', v: m === 'Crosshair', xy: m === 'Crosshair' };
    for (const k in show) { const e = q(k); if (e) e.style.opacity = show[k] && onPage ? 1 : 0; }
    R.style.cursor = (m === 'Dot' || m === 'Ring + label') ? 'none' : '';
  }
  function cursorHover(t) {
    const m = cfg('ixCursor'); if (!FINE) return;
    const ring = R.querySelector('[data-cur="ring"]'), lab = R.querySelector('[data-cur="label"]'), dot = R.querySelector('[data-cur="dot"]');
    const img = t && t.closest && t.closest('[data-img],[data-demo]'), link = t && t.closest && t.closest('a,button');
    if (m === 'Ring + label' && ring) {
      const sz = img ? 84 : link ? 54 : 36;
      Object.assign(ring.style, { width: sz + 'px', height: sz + 'px', margin: (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px', background: img ? cfg('ink') : 'transparent', borderColor: img ? cfg('ink') : cfg('ink') });
      if (lab) { lab.textContent = img ? 'View' : ''; lab.style.color = cfg('bg'); }
      if (dot) dot.style.opacity = img ? 0 : 1;
    }
    if (m === 'Dot' && dot) { dot.style.transition = 'width .25s,height .25s,margin .25s'; const sz = link || img ? 22 : 8; Object.assign(dot.style, { width: sz + 'px', height: sz + 'px', margin: (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px' }); }
  }
  function loop() {
    rx += (mx - rx) * .2; ry += (my - ry) * .2; lx += (mx - lx) * .07; ly += (my - ly) * .07;
    const busy = R && (cfg('ixCursor') !== 'System' || cfg('ixBg') === 'Cursor light');
    if (busy) {
      const q = k => R.querySelector('[data-cur="' + k + '"]');
      const dot = q('dot'), ring = q('ring'), h = q('h'), v = q('v'), xy = q('xy'), light = R.querySelector('[data-light]');
      if (dot) dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      if (ring) ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      if (h) h.style.transform = 'translate3d(0,' + my + 'px,0)';
      if (v) v.style.transform = 'translate3d(' + mx + 'px,0,0)';
      if (xy && cfg('ixCursor') === 'Crosshair') {
        const g = Math.min(40, Math.max(16, innerWidth * .03)), col = clamp(Math.ceil((mx - g) / ((innerWidth - 2 * g) / 6)), 1, 6);
        xy.style.transform = 'translate3d(' + (mx + 14) + 'px,' + (my + 14) + 'px,0)';
        xy.textContent = 'X ' + String(Math.round(mx)).padStart(4, '0') + '  Y ' + String(Math.round(my + scrollY)).padStart(4, '0') + '  COL ' + col + '/6';
      }
      if (light) light.style.transform = 'translate3d(' + lx + 'px,' + ly + 'px,0)';
    }
    requestAnimationFrame(loop);
  }

  /* scroll-linked: sections + demo tilt */
  function onScroll() {
    if (!R || RM) return;
    const vh = innerHeight, sm = cfg('ixSec');
    R.querySelectorAll('[data-sec]').forEach(s => {
      const p = clamp((vh - s.getBoundingClientRect().top) / (vh * .5), 0, 1);
      if (p >= 1 || (sm !== 'Scale in' && sm !== 'Layered slide')) { s.style.transform = ''; s.style.opacity = ''; }
      else if (sm === 'Scale in') { s.style.transformOrigin = '50% 0'; s.style.transform = 'scale(' + (.94 + .06 * p).toFixed(4) + ')'; s.style.opacity = (.3 + .7 * p).toFixed(3); }
      else if (sm === 'Layered slide') { s.style.transform = 'translate3d(0,' + ((1 - p) * 90).toFixed(1) + 'px,0)'; s.style.opacity = ''; }
      else { s.style.transform = ''; s.style.opacity = ''; }
    });
    R.querySelectorAll('[data-demo]').forEach(d => {
      if (cfg('ixDemo') === 'Tilt in') {
        const p = clamp((vh - d.getBoundingClientRect().top) / (vh * .8), 0, 1);
        d.style.transformOrigin = '50% 100%'; d.style.transform = 'perspective(1400px) rotateX(' + ((1 - p) * 22).toFixed(2) + 'deg) scale(' + (.9 + .1 * p).toFixed(4) + ')';
      } else d.style.transform = '';
    });
  }

  function bind() {
    R.addEventListener('mouseover', e => {
      const t = e.target, rel = e.relatedTarget, inn = el => el && !el.contains(rel);
      const b = t.closest('[data-btn]'); if (inn(b)) btnEnter(b);
      const n = t.closest('[data-nav]'); if (inn(n)) navEnter(n);
      const c = t.closest('[data-card]'); if (inn(c)) cardEnter(c);
      const i = t.closest('[data-img]'); if (inn(i)) imgEnter(i);
      const d = t.closest('[data-demo]'); if (inn(d)) demoEnter(d);
      const lg = t.closest('[data-logo]'); if (inn(lg) && cfg('ixLogo') === '1') { const tn = textNode(lg); if (tn) { tn.__orig = tn.__orig || tn.nodeValue; scramble(tn, 'Tyler Russell Adams Concept Machine', 600); } }
      const cc = t.closest('[data-c]'); if (inn(cc) && cfg('ixCtwin') === '1') R.querySelectorAll('[data-c]').forEach(x => { x.style.transition = 'color .35s, transform .5s ' + EZ; x.style.color = cfg('acc'); });
      cursorHover(t);
    });
    R.addEventListener('mouseout', e => {
      const t = e.target, rel = e.relatedTarget, out = el => el && !el.contains(rel);
      const b = t.closest('[data-btn]'); if (out(b)) btnLeave(b);
      const n = t.closest('[data-nav]'); if (out(n)) navLeave(n);
      const c = t.closest('[data-card]'); if (out(c)) cardLeave(c);
      const i = t.closest('[data-img]'); if (out(i)) imgLeave(i);
      const d = t.closest('[data-demo]'); if (out(d)) demoLeave(d);
      const lg = t.closest('[data-logo]'); if (out(lg)) { const tn = textNode(lg); if (tn && tn.__orig) scramble(tn, tn.__orig, 450); }
      const cc = t.closest('[data-c]'); if (out(cc)) R.querySelectorAll('[data-c]').forEach(x => x.style.color = '');
    });
    R.addEventListener('mousemove', e => {
      const b = e.target.closest('[data-btn]');
      if (b && cfg('ixBtn') === 'Magnetic') { const r = b.getBoundingClientRect(); b.__x = (e.clientX - r.left - r.width / 2) * .28; b.__y = (e.clientY - r.top - r.height / 2) * .4; applyT(b); }
      const c = e.target.closest('[data-card]'); if (c) cardMove(c, e);
      const i = e.target.closest('[data-img]'); if (i) imgMove(i, e);
    });
    R.addEventListener('pointerdown', e => { const b = e.target.closest('[data-btn]'); if (b && cfg('ixPress') === '1') { b.__s = .95; b.style.transition = 'transform .12s'; applyT(b); } });
    const up = e => { const b = e.target.closest && e.target.closest('[data-btn]'); if (b) { b.__s = 1; b.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1),box-shadow .5s ' + EZ; applyT(b); } };
    R.addEventListener('pointerup', up); R.addEventListener('pointercancel', up);
    R.addEventListener('click', e => {
      const a = e.target.closest('a[href^="mailto:"]');
      if (a && cfg('ixCopy') === '1') {
        e.preventDefault(); const addr = a.getAttribute('href').slice(7);
        try { navigator.clipboard && navigator.clipboard.writeText(addr).catch(() => { }); } catch (_) { }
        toast('Copied ' + addr);
      }
    });
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (!onPage) { onPage = true; rx = lx = mx; ry = ly = my; setupCursor(); } }, { passive: true });
    document.addEventListener('mouseleave', () => { onPage = false; setupCursor(); });
    addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
    requestAnimationFrame(loop);
  }

  function snapshot() { const o = {}; for (const k in R.dataset) o[k] = R.dataset[k]; return o; }
  function update(root, first) {
    R = root || R; if (!R) return;
    const s = snapshot(), ch = k => first || last[k] !== s[k];
    window.TMPX = { Off: 0, Subtle: 1, Deep: 2 }[s.ixPx] ?? 1; window.TMPXH = s.ixPx === 'Deep' ? 1 : 0;
    window.TM && TM.pxRun && TM.pxRun();
    if (!first && ch('ixReveal')) { window.TMREVEAL = s.ixReveal; window.TM && TM.reset(R); }
    if (ch('ixBtn')) R.querySelectorAll('[data-btn]').forEach(b => { b.style.boxShadow = ''; b.__x = b.__y = b.__ly = 0; b.__s = 1; b.style.transform = ''; });
    R.querySelectorAll('[data-nav]').forEach(navBase);
    if (first || ch('ixHead')) setupHeads(); else R.querySelectorAll(headSel).forEach(el => { if (!el.__hp) { el.__hp = 1; if (headPrep(el)) hio.observe(el); } });
    setupSpy();
    if (first || ch('ixBg')) setupBg(true);
    if (first || ch('ixDemo')) setupSpots();
    setupCursor(); onScroll();
    last = s;
  }
  function init(root) {
    if (!root || root.__tmx) return; root.__tmx = 1; R = root;
    window.TMREVEAL = root.dataset.ixReveal || 'up';
    bind(); setupSpy(); update(root, true);
  }
  window.TMX = { init, update, toast };
})();
