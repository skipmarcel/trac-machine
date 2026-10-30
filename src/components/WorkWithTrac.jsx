import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Header from './Header.jsx';
import Contact from './Contact.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { plans, CUSTOM_MIN, CUSTOM_MAX, FEE_PCT, FEE_FIXED, withFee } from '../data/plans.js';
import { EMAIL, MOTION, MOBILE_QUERY } from '../config.js';

const usd = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const FEE_TEXT = `${+(FEE_PCT * 100).toFixed(1)}% + ${Math.round(FEE_FIXED * 100)}¢`;

const STATUS = {
  success: 'Payment received. Thank you! Stripe is emailing you a receipt.',
  cancelled: 'Checkout was cancelled. Nothing was charged.',
};

// Payments page (/work-with-trac/). Each button asks api/checkout.js for a Stripe Checkout URL and goes there.
export default function WorkWithTrac() {
  const rootRef = useRef(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(null);       // plan id or 'custom' while checkout is starting
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [freq, setFreq] = useState('once');
  const [note, setNote] = useState('');
  const entered = Math.round(Number(amount) * 100) / 100;
  const quote = entered >= CUSTOM_MIN && entered <= CUSTOM_MAX ? withFee(entered) : null;   // shown under the amount; the server works it out again
  const status = STATUS[new URLSearchParams(location.search).get('status')];

  useEffect(() => setMenuOpen(false), [isMobile]);
  // Coming back from Stripe with the browser's back button restores the page as it was; re-enable the buttons.
  useEffect(() => {
    const on = (e) => { if (e.persisted) setBusy(null); };
    addEventListener('pageshow', on);
    return () => removeEventListener('pageshow', on);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    window.TMREVEAL = MOTION['data-ix-reveal'];
    window.TM.init(root);
    window.TMX.init(root);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => { window.TM.init(rootRef.current); window.TMX.update(rootRef.current); }, 0);
    return () => clearTimeout(t);
  }, [isMobile]);

  const checkout = async (key, body) => {
    setBusy(key); setError('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.url) throw new Error(data.error || 'Could not start checkout. Please try again.');
      location.assign(data.url);
    } catch (e) {
      setError(e.message); setBusy(null);
    }
  };

  const onCustom = (e) => {
    e.preventDefault();
    checkout('custom', { amount: Number(amount), interval: freq, note });
  };

  return (
    <div ref={rootRef} className="site" {...MOTION}
      data-acc="#e0561f" data-ink="#141413" data-bg="#ededea" data-surf="#e2e2de">
      <Header isMobile={isMobile} menuOpen={menuOpen} setMenuOpen={setMenuOpen} overHero={false} home={false} />
      <main id="top" className="section wwt">
        <div className="wwt__head">
          <span className="wwt__label">Payments</span>
          <h1 className="wwt__title" data-head="">Work With TRAC</h1>
          <p className="wwt__lede">Book a project, start a monthly retainer, or pay an invoice.</p>
        </div>

        {status && <p className="wwt__status" role="status">{status}</p>}

        <div className="wwt__plans">
          {plans.map((p, i) => (
            <article key={p.id} className="plan" data-reveal="up" data-delay={i * 80}>
              <h2 className="plan__name">{p.name}</h2>
              <div className="plan__price">{p.price} <span>{p.per}</span></div>
              <p className="plan__blurb">{p.blurb}</p>
              <button className="btn btn--primary" data-btn="1" disabled={!!busy} onClick={() => checkout(p.id, { plan: p.id })}>
                {busy === p.id ? 'Opening checkout…' : p.cta}
              </button>
            </article>
          ))}

          <form className="plan plan--custom" data-reveal="up" data-delay={plans.length * 80} onSubmit={onCustom}>
            <h2 className="plan__name">Custom amount</h2>
            <p className="plan__blurb">Paying an invoice or a quote? Enter the amount.</p>
            <label className="field">
              <span className="field__label">Amount (USD)</span>
              <span className="money">
                <input type="number" inputMode="decimal" required min={CUSTOM_MIN} max={CUSTOM_MAX} step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </span>
            </label>
            <fieldset className="field">
              <legend className="field__label">How often</legend>
              <div className="freq">
                {[['once', 'One time'], ['month', 'Monthly']].map(([v, label]) => (
                  <label key={v}>
                    <input type="radio" name="freq" value={v} checked={freq === v} onChange={() => setFreq(v)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {quote && (
              <dl className="fee" aria-live="polite">
                <div><dt>Amount</dt><dd>{usd(quote.amount)}</dd></div>
                <div><dt>Card processing fee</dt><dd>{usd(quote.fee)}</dd></div>
                <div className="fee__total"><dt>Total{freq === 'month' ? ' per month' : ''}</dt><dd>{usd(quote.total)}</dd></div>
              </dl>
            )}
            <p className="fee__note">A card processing fee ({FEE_TEXT}, Stripe's rate) is added so the full amount reaches Trac Machine.</p>
            <label className="field">
              <span className="field__label">What it's for (optional)</span>
              <input type="text" maxLength={200} placeholder="Invoice number or project" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <button type="submit" className="btn btn--primary" data-btn="1" disabled={!!busy}>
              {busy === 'custom' ? 'Opening checkout…' : (freq === 'month' ? 'Start monthly payment' : 'Pay') + (quote ? ' ' + usd(quote.total) : '') + ' →'}
            </button>
          </form>
        </div>

        {error && <p className="wwt__error" role="alert">{error}</p>}

        <p className="wwt__fine">
          Payments are processed securely by Stripe. Card details never touch this site. To change or cancel a monthly
          plan, email <a href={`mailto:${EMAIL}`} className="inline-link">{EMAIL}</a>.
        </p>
      </main>
      <Contact />
    </div>
  );
}
