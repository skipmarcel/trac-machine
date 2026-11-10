import { useEffect, useState } from 'react';
import { LOGO_PARTS, LOGO_VB } from './logoPaths.js';

/**
 * Line-drawn Psychic Tiger logo.
 * part: 'twin' (tiger | letters | mirrored tiger, draws from centre outward),
 *       'letters' (letters only), 'tiger', or 'all' (draws left to right).
 * animate=false renders it fully drawn.
 */
export default function LogoDraw({
  width = 640, color = '#fff', stroke = 2, fill = false, animate = true,
  duration = 4.5, delay = 0.3, part = 'all', style,
}) {
  const [T, setT] = useState(animate ? 0 : 999);

  useEffect(() => {
    if (!animate) return;
    let raf, t0;
    const tick = (now) => {
      if (t0 == null) t0 = now;
      const t = (now - t0) / 1000 - delay;
      setT(t);
      if (t < duration + 1.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, delay, duration]);

  const ease = (x) => -(Math.cos(Math.PI * Math.min(1, Math.max(0, x))) - 1) / 2;
  const tiger = LOGO_PARTS.filter(([, x]) => x < 180);
  const letters = LOGO_PARTS.filter(([, x]) => x >= 180);
  const sweep = duration * 0.72;
  const len = duration - sweep;

  const path = (key, d, start, sw) => {
    const p = ease((T - start) / len);
    const f = fill ? ease((T - start - len * 0.75) / (len * 0.65)) : 0;
    return (
      <path key={key} d={d} pathLength="1" fill={color} fillOpacity={f} stroke={color}
        strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ opacity: p > 0 ? 1 : 0 }} />
    );
  };
  const svgStyle = { display: 'block', width, maxWidth: '100%', height: 'auto', overflow: 'visible', ...style };

  if (part === 'twin') {
    const TW = 172, G = 26, K = 112 / 47;
    const LW = (565.52 - 189) * K, RX = TW + G + LW + G, W = RX + TW;
    const sw = (stroke * W) / width;
    const start = (dispX) => (Math.abs(dispX - W / 2) / (W / 2)) * sweep;
    return (
      <svg viewBox={'0 0 ' + W + ' ' + LOGO_VB.h} style={svgStyle} role="img" aria-label="Psychic Tiger">
        <g transform={'translate(' + TW + ' 0) scale(-1 1)'}>
          {tiger.map(([id, x, d]) => path('l' + id, d, start(TW - x), sw))}
        </g>
        <g transform={'translate(' + (TW + G) + ' 0) scale(' + K + ') translate(-189 -53)'}>
          {letters.map(([id, x, d]) => path('m' + id, d, start(TW + G + (x - 189) * K), sw / K))}
        </g>
        <g transform={'translate(' + RX + ' 0)'}>
          {tiger.map(([id, x, d]) => path('r' + id, d, start(RX + x), sw))}
        </g>
      </svg>
    );
  }

  const minX = part === 'letters' ? 186 : 0;
  const maxX = part === 'tiger' ? 180 : LOGO_VB.w;
  const minY = part === 'letters' ? 53 : 0;
  const vbH = part === 'letters' ? 47 : LOGO_VB.h;
  const vbW = maxX - minX;
  const sw = (stroke * vbW) / width;
  const start = (x) => (x / LOGO_VB.w) * sweep;
  return (
    <svg viewBox={minX + ' ' + minY + ' ' + vbW + ' ' + vbH} style={svgStyle} role="img" aria-label="Psychic Tiger">
      {part !== 'letters' && tiger.map(([id, x, d]) => path(id, d, start(x), sw))}
      {part !== 'tiger' && letters.map(([id, x, d]) => path(id, d, start(x), sw))}
    </svg>
  );
}
