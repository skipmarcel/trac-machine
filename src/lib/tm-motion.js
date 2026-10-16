(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.2,.7,.1,1)';
  const FROM = {
    up: { opacity: 0, transform: 'translateY(32px)' },
    rise: { transform: 'translateY(110%)' },
    clip: { clipPath: 'inset(0 0 100% 0)' },
    wipe: { clipPath: 'inset(0 100% 0 0)' },
    fade: { opacity: 0 },
    scale: { opacity: 0, transform: 'scale(1.06)' },
    blocks: { clipPath: 'inset(0 0 0 0)' },
    blur: { opacity: 0, filter: 'blur(14px)' }
  };
  function to(f) { const t = {}; for (const p in f) t[p] = p === 'opacity' ? 1 : p === 'clipPath' ? 'inset(0 0 0 0)' : 'none'; return t; }
  const key = el => { const k = el.dataset.reveal; return k === 'up' ? (window.TMREVEAL || 'up') : k; };
  function play(el) {
    const k = key(el); if (k === 'none') return; const f = FROM[k] || FROM.up, t = to(f);
    const a = el.animate([f, t], { duration: +(el.dataset.dur || 1100), delay: +(el.dataset.delay || 0), easing: E, fill: 'forwards' });
    a.onfinish = () => { for (const p in t) el.style[p] = el.__orig && el.__orig[p] ? el.__orig[p] : t[p]; a.cancel(); };
  }
  let io;
  function reveals(root) {
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); (e.target.__tmEls || []).forEach(play); e.target.__tmEls = null; } }), { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    root.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.__tm) return; el.__tm = 1;
      const k = key(el); if (k === 'none') return;
      const target = (k === 'rise' || k === 'clip' || (k === 'wipe' && el.dataset.reveal !== 'up')) && el.parentElement ? el.parentElement : el;
      el.__from = FROM[k] || FROM.up; el.__orig = el.__orig || {}; for (const p in el.__from) if (!(p in el.__orig)) el.__orig[p] = el.style[p];
      Object.assign(el.style, el.__from);
      (target.__tmEls = target.__tmEls || []).push(el); io.observe(target);
    });
  }
  function reset(root) {
    if (reduce || !io) return;
    root.querySelectorAll('[data-reveal]').forEach(el => {
      el.__tm = 0; el.getAnimations().forEach(a => a.cancel());
      if (el.__from) for (const p in el.__from) el.style[p] = el.__orig && el.__orig[p] !== undefined ? el.__orig[p] : '';
      [el, el.parentElement].forEach(t => { if (t) { t.__tmEls = null; io.unobserve(t); } });
    });
    reveals(root);
  }
  let px = [];
  function parallax(root) {
    root.querySelectorAll('[data-parallax]').forEach(el => { if (!el.__px) { el.__px = 1; px.push(el); } });
    if (window.__tmPx) return; window.__tmPx = 1;
    let tick = false;
    const run = () => { tick = false; const vh = innerHeight; px.forEach(el => { const r = el.parentElement.getBoundingClientRect(); const c = r.top + r.height / 2 - vh / 2; const m = el.dataset.pxgroup === 'hero' ? (window.TMPXH || 0) : (window.TMPX ?? 1); el.style.transform = m ? 'translate3d(0,' + (c * -(+el.dataset.parallax) * m).toFixed(1) + 'px,0)' : ''; }); };
    window.TM.pxRun = run;
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true }); run();
  }
  function marquee(root) {
    root.querySelectorAll('[data-marquee]').forEach(el => {
      if (el.__mq) return; el.__mq = 1;
      const dir = el.dataset.dir === 'right' ? ['-50%', '0%'] : ['0%', '-50%'];
      el.animate([{ transform: 'translateX(' + dir[0] + ')' }, { transform: 'translateX(' + dir[1] + ')' }], { duration: (+el.dataset.marquee || 30) * 1000, iterations: Infinity });
    });
  }
  function follow(root) {
    root.querySelectorAll('[data-follow-zone]').forEach(z => {
      if (z.__fz || !matchMedia('(hover:hover)').matches) return; z.__fz = 1;
      const F = () => z.querySelector('[data-follow]');
      let x = 0, y = 0, cx = 0, cy = 0, on = false, cur = null;
      const loop = () => { const f = F(); if (f) { cx += (x - cx) * .14; cy += (y - cy) * .14; f.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) ' + (f.dataset.follow === 'right' ? 'translate(28px,-50%)' : 'translate(-50%,-50%)'); } requestAnimationFrame(loop); }; loop();
      const hide = () => { on = false; cur = null; const f = F(); if (f) f.style.opacity = 0; };
      z.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') { if (on) hide(); return; } // touch/pen never fire a leave, so never show
        x = e.clientX; y = e.clientY; if (!on) { cx = x; cy = y; }
        const f = F(); if (!f) return;
        const r = e.target.closest && e.target.closest('[data-preview]');
        if (!r) { if (on) hide(); return; }
        if (cur !== r.dataset.preview) { on = true; cur = r.dataset.preview; f.style.opacity = 1; f.querySelectorAll('[data-preview-img]').forEach(i => {
          i.style.opacity = i.dataset.previewImg === cur ? 1 : 0;
          const pin = i.querySelector('[data-pv="img"]'), own = i.querySelector('[data-pv="own"]'), hero = i.querySelector('[data-pv="hero"]');
          if (pin) { pin.style.opacity = 1; const im = pin.querySelector('img[data-pv-src]'); if (im && !im.getAttribute('src') && !/\{\{/.test(im.dataset.pvSrc)) im.src = im.dataset.pvSrc; }
          const ownF = !pin && own && (own.hasAttribute('data-filled') || !!own.getAttribute('src'));
          if (own) own.style.opacity = ownF ? 1 : 0;
          if (hero) hero.style.opacity = !pin && !ownF && (hero.hasAttribute('data-filled') || !!hero.getAttribute('src')) ? 1 : 0;
        }); }
      });
      z.addEventListener('pointerleave', hide);
      z.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') hide(); });
    });
  }
  function init(root) {
    root = root || document;
    if (!reduce) { reveals(root); parallax(root); marquee(root); }
    follow(root);
  }
  window.TM = { init, reduce, play, reset };
})();
