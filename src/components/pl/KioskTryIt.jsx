import { useEffect, useRef, useState } from 'react';
import './kiosk.css';

// PurpleLine kiosk click-through: a working copy of the client check-in from Kiosk Prototype v3.
// device="ipad" draws the real 11" iPad layout (1180 x 820, grouped steps);
// device="phone" reflows it into one question per screen (390 x 844) so it is usable on a phone.
// Nothing is saved or sent anywhere; the "camera" shows a sample card.

const DEVICES = { ipad: { w: 1180, h: 820 }, phone: { w: 390, h: 844 } };

const ARTISTS = ['Inés Rosa', 'Teo Grande', 'Marisol Vega', 'Not sure yet'];
const HEALTH = [
  'Diabetes',
  'Bleeding disorder or use of blood thinners',
  'Skin conditions (eczema, psoriasis, etc.)',
  'Allergies to medications, latex, or topical products',
  'Heart or immune system condition',
  'Pregnant or breastfeeding',
  'Taking medication that may affect healing',
  'None of the above',
];
const NONE = HEALTH.length - 1;
const TERMS = [
  'I am legally eligible to receive a tattoo and have provided accurate personal and medical information.',
  'I understand that tattooing involves risks, including pain, bleeding, swelling, infection, allergic reactions and scarring.',
  'I understand that tattoos are permanent and that removal may be difficult, expensive or incomplete.',
  'I have disclosed any medical conditions, allergies or medications that may affect healing.',
  'I have received information about aftercare and agree to follow the instructions provided.',
  'I am choosing to receive this tattoo voluntarily.',
];

// iPad: six grouped steps. Phone: one question per screen.
const GROUPED = [
  { label: 'About you', title: "Let's start with you", sub: 'Use your legal name, the way it appears on your ID.', blocks: ['name', 'dob', 'contact'] },
  { label: 'Tattoo & health', title: 'Your tattoo and your health', sub: 'This helps your artist plan a safe session.', blocks: ['tattoo', 'health'] },
  { label: 'Agreement', title: "Here's what you're agreeing to", sub: 'Take a minute to read it through.', blocks: ['agreement'] },
  { label: 'Photo ID', title: 'Snap a photo of your ID', sub: 'Place your ID on the black shelf at the top left of the kiosk, then tap Take photo.', blocks: ['id'] },
  { label: 'Sign', title: 'Sign your release', sub: 'Print your name, then sign with your finger.', blocks: ['sign'] },
  { label: 'Review', title: 'Look good?', sub: 'Check everything over, then send it to the shop.', blocks: ['review'] },
];
const SINGLE = [
  { title: "First things first, what's your name?", sub: 'Your legal name, the way it appears on your ID.', blocks: ['name'] },
  { title: "When's your birthday?", sub: 'You need to be 18 or older to get tattooed.', blocks: ['dob'] },
  { title: 'How can we reach you?', sub: "We'll only contact you about your appointment.", blocks: ['contact'] },
  { title: 'Tell us about your tattoo', sub: 'Not sure about something? Your artist can help.', blocks: ['tattoo'] },
  { title: 'Anything we should know health-wise?', sub: 'Check any that apply. Your answers stay private.', blocks: ['health'] },
  { title: "Here's what you're agreeing to", sub: 'Take a minute to read it through.', blocks: ['agreement'] },
  { title: 'Now a quick photo of your ID', sub: 'Place your ID on the shelf at the top left of the kiosk, then tap Take photo.', blocks: ['id'] },
  { title: 'Time to sign', sub: 'Print your name, then sign with your finger.', blocks: ['sign'] },
  { title: 'Look good?', sub: 'Check everything over, then send it to the shop.', blocks: ['review'] },
];

const EMPTY = { first: '', last: '', dob: '', phone: '', email: '', address: '', artist: '', placement: '', description: '' };
const fresh = () => ({ phase: 'welcome', i: 0, f: { ...EMPTY }, health: {}, notes: '', ack: false, idPhoto: false, sig: null, sigName: '', confirm: false });

// ---- small helpers ----
const Arrow = ({ s = 24 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
const Back = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
);
const Tick = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const Camera = ({ s = 40 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);

function formatDob(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
}
function dobCheck(dob) {
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return dob.length === 10 ? "That date doesn't look right." : '';
  const dt = new Date(+m[3], +m[1] - 1, +m[2]);
  if (dt.getMonth() !== +m[1] - 1 || +m[3] < 1900) return "That date doesn't look right.";
  const now = new Date();
  let age = now.getFullYear() - dt.getFullYear();
  if (now < new Date(now.getFullYear(), dt.getMonth(), dt.getDate())) age--;
  return age < 18 ? 'Sorry, you need to be 18 or older to sign a release.' : '';
}

function IdCard({ name }) {
  return (
    <div className="plk-idcard" aria-hidden="true">
      <div className="plk-idcard__top">SAMPLE ID</div>
      <div className="plk-idcard__body">
        <div className="plk-idcard__photo" />
        <div className="plk-idcard__text">
          <strong>{name || 'RIVERA, ALEX'}</strong>
          <span>DOB 04/12/1994</span>
          <span>EXP 08/14/2030</span>
          <div className="plk-idcard__bar" />
        </div>
      </div>
    </div>
  );
}

function Signature({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.width = el.offsetWidth * 2;
    el.height = el.offsetHeight * 2;
    const x = el.getContext('2d');
    x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#1d1b1f';
    if (value) { const img = new Image(); img.onload = () => x.drawImage(img, 0, 0, el.width, el.height); img.src = value; }
    let drawing = false;
    // getBoundingClientRect includes the scale transform, so this maps screen → canvas pixels correctly.
    const pt = (e) => { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * el.width, (e.clientY - r.top) / r.height * el.height]; };
    const down = (e) => { drawing = true; el.setPointerCapture(e.pointerId); const [a, b] = pt(e); x.beginPath(); x.moveTo(a, b); x.lineTo(a + .1, b); x.stroke(); };
    const move = (e) => { if (!drawing) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); };
    const up = () => { if (!drawing) return; drawing = false; onChange(el.toDataURL('image/png')); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} aria-label="Signature pad: sign with your finger or mouse" />;
}

export default function KioskTryIt({ device = 'ipad', shop = 'Rose City' }) {
  const size = DEVICES[device] || DEVICES.ipad;
  const phone = device === 'phone';
  const steps = phone ? SINGLE : GROUPED;

  const viewRef = useRef(null);
  const bodyRef = useRef(null);
  const [scale, setScale] = useState(phone ? 0.9 : 0.6);
  const [s, setS] = useState(fresh);
  const [camera, setCamera] = useState(false);
  const [flash, setFlash] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timers = useRef([]);

  // Scale the fixed-size screen to the frame width
  useEffect(() => {
    const el = viewRef.current;
    const fit = () => el.clientWidth && setScale(el.clientWidth / size.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.w]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  // Done screen countdown, then clear for the next client
  useEffect(() => {
    if (s.phase !== 'done') return undefined;
    if (countdown <= 0) { setS(fresh()); return undefined; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [s.phase, countdown]);

  const set = (patch) => setS((st) => ({ ...st, ...patch }));
  const setField = (k, fmt) => (e) => { const v = fmt ? fmt(e.target.value) : e.target.value; setS((st) => ({ ...st, f: { ...st.f, [k]: v } })); };
  const go = (i) => { set({ phase: 'flow', i, confirm: false }); if (bodyRef.current) bodyRef.current.scrollTop = 0; };
  const reset = () => { timers.current.forEach(clearTimeout); setCamera(false); setCountdown(0); setS(fresh()); };

  const f = s.f;
  const step = steps[s.i] || steps[0];
  const has = (b) => s.phase === 'flow' && step.blocks.includes(b);
  const fullName = [f.first.trim(), f.last.trim()].filter(Boolean).join(' ');
  const dobErr = dobCheck(f.dob);
  const conditions = HEALTH.filter((_, k) => k !== NONE && s.health[k]);
  const last = s.i === steps.length - 1;

  // Only the parts that matter for a real release block Next; the rest is optional in the demo.
  const blocking = {
    dob: dobErr.startsWith('Sorry') ? dobErr : '',
    agreement: !s.ack ? 'Check the box to agree before moving on.' : '',
    id: !s.idPhoto ? 'Take a photo of your ID to continue.' : '',
    sign: !s.sig ? 'Sign in the box to continue.' : '',
  };
  const missing = step.blocks.map((b) => blocking[b]).find(Boolean) || '';

  const toggleHealth = (k) => setS((st) => {
    const h = { ...st.health, [k]: !st.health[k] };
    if (k === NONE && h[k]) HEALTH.forEach((_, j) => { if (j !== NONE) h[j] = false; });
    if (k !== NONE && h[k]) h[NONE] = false;
    return { ...st, health: h };
  });

  const shoot = () => {
    setFlash(Date.now());
    later(() => { set({ idPhoto: true }); setCamera(false); }, 320);
  };
  const submit = () => {
    set({ phase: 'sending' });
    later(() => { set({ phase: 'done' }); setCountdown(15); }, 1500);
  };
  const next = () => { if (missing) return; if (last) submit(); else go(s.i + 1); };
  const back = () => (s.i === 0 ? set({ phase: 'welcome' }) : go(s.i - 1));
  const editTo = (b) => () => go(steps.findIndex((st) => st.blocks.includes(b)));

  const input = (id, label, key, extra = {}) => (
    <div className={'plk-field' + (extra.wide ? ' plk-wide' : '')}>
      <label htmlFor={`${device}-${id}`}>{label}</label>
      <input id={`${device}-${id}`} className="plk-input" autoComplete="off" value={f[key]}
        onChange={setField(key, extra.fmt)} placeholder={extra.placeholder} inputMode={extra.mode} />
      {extra.error && <div className="plk-error" role="alert">{extra.error}</div>}
    </div>
  );

  return (
    <div className={`plk plk--${device}`}>
      <div className={`plk-device plk-device--${device}`}>
        <div ref={viewRef} className="plk-viewport">
          {phone && <div className="plk-island" />}
          <div className="plk-screen" style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}>

            <div className="plk-bar">
              <div className="plk-shop">{shop}</div>
              {s.phase === 'flow' && <button type="button" className="plk-btn plk-btn--ghost" onClick={() => set({ confirm: true })}>Start over</button>}
            </div>

            {s.phase === 'welcome' && (
              <div className="plk-welcome">
                <div className="plk-welcome__main">
                  <div className="plk-kicker">Client check-in</div>
                  <h2 className="plk-title">Hi! Welcome to {shop}.</h2>
                  <p className="plk-sub">Let&apos;s get your release signed before your session. It takes about three minutes. Have your photo ID handy.</p>
                  {phone && <StepList />}
                  <button type="button" className="plk-btn plk-start" onClick={() => go(0)}>Start new release <Arrow s={phone ? 24 : 40} /></button>
                </div>
                {!phone && <StepList />}
              </div>
            )}

            {s.phase === 'flow' && (
              <>
                {phone ? (
                  <div className="plk-progress"><span style={{ width: `${((s.i + 1) / steps.length) * 100}%` }} /></div>
                ) : (
                  <div className="plk-steps">
                    {steps.map((st, k) => (
                      <div key={st.label} className={k <= s.i ? 'is-on' : ''}><i />0{k + 1} {st.label}</div>
                    ))}
                  </div>
                )}

                <div ref={bodyRef} className="plk-body">
                  <div className="plk-head">
                    <div className="plk-kicker">Step {s.i + 1} of {steps.length}</div>
                    <h2 className="plk-title">{step.title}</h2>
                    <p className="plk-sub">{step.sub}</p>
                  </div>

                  {(has('name') || has('dob') || has('contact')) && (
                    <div className="plk-grid">
                      {has('name') && <>{input('first', 'Legal first name', 'first')}{input('last', 'Legal last name', 'last')}</>}
                      {has('dob') && input('dob', 'Date of birth (must be 18+)', 'dob', { fmt: formatDob, placeholder: 'MM/DD/YYYY', mode: 'numeric', error: dobErr })}
                      {has('dob') && !phone && <div />}
                      {has('contact') && <>
                        {input('phone', 'Mobile phone', 'phone', { fmt: formatPhone, placeholder: '(555) 555-5555', mode: 'tel' })}
                        {input('email', 'Email (optional)', 'email', { mode: 'email' })}
                        {input('address', 'Home address', 'address', { placeholder: 'Street, city, state, ZIP', wide: true })}
                      </>}
                    </div>
                  )}

                  {has('tattoo') && (
                    <div className="plk-group">
                      <h3>Your tattoo</h3>
                      <div className="plk-grid">
                        <div className="plk-field">
                          <label htmlFor={`${device}-artist`}>Who&apos;s your artist?</label>
                          <select id={`${device}-artist`} className="plk-input" value={f.artist} onChange={setField('artist')}>
                            <option value="">Pick your artist</option>
                            {ARTISTS.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        {input('placement', 'Where on your body?', 'placement', { placeholder: 'e.g. Left forearm' })}
                        {input('description', 'What are you getting? (optional)', 'description', { placeholder: 'A few words is plenty', wide: true })}
                      </div>
                    </div>
                  )}

                  {has('health') && (
                    <div className="plk-group">
                      <h3>Medical history and health</h3>
                      <div className="plk-choices">
                        {HEALTH.map((h, k) => (
                          <button key={h} type="button" className="plk-choice" aria-pressed={!!s.health[k]} onClick={() => toggleHealth(k)}>
                            <span className="plk-dot">{s.health[k] && <Tick s={phone ? 16 : 20} />}</span>{h}
                          </button>
                        ))}
                      </div>
                      {conditions.length > 0 && (
                        <div className="plk-field">
                          <label htmlFor={`${device}-notes`}>Anything your artist should know?</label>
                          <textarea id={`${device}-notes`} className="plk-input" rows={3} value={s.notes} onChange={(e) => set({ notes: e.target.value })} />
                        </div>
                      )}
                    </div>
                  )}

                  {has('agreement') && (
                    <>
                      <ol className="plk-terms">
                        {TERMS.map((t, k) => <li key={t}><b>0{k + 1}</b><span>{t}</span></li>)}
                      </ol>
                      <button type="button" className="plk-choice plk-agree" aria-pressed={s.ack} onClick={() => set({ ack: !s.ack })}>
                        <span className="plk-dot">{s.ack && <Tick s={phone ? 18 : 24} />}</span>
                        I have read and understand this document and voluntarily consent to the tattoo procedure.
                      </button>
                    </>
                  )}

                  {has('id') && (
                    <div className="plk-idwrap">
                      {s.idPhoto ? (
                        <>
                          <IdCard name={fullName && `${f.last}, ${f.first}`.toUpperCase()} />
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="plk-gotit"><span><Tick s={phone ? 14 : 16} /></span>Got it</span>
                            <button type="button" className="plk-link" onClick={() => setCamera(true)}>Retake</button>
                          </div>
                          <p className="plk-sub">Don&apos;t forget to take your ID off the shelf.</p>
                        </>
                      ) : (
                        <button type="button" className="plk-idslot" onClick={() => setCamera(true)}>
                          <Camera s={phone ? 34 : 46} />Take photo of your ID
                        </button>
                      )}
                    </div>
                  )}

                  {has('sign') && (
                    <>
                      <div className="plk-field" style={{ maxWidth: phone ? 'none' : 560 }}>
                        <label htmlFor={`${device}-signame`}>Printed name</label>
                        <input id={`${device}-signame`} className="plk-input" autoComplete="off" placeholder={fullName || 'Your full legal name'}
                          value={s.sigName} onChange={(e) => set({ sigName: e.target.value })} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span className="plk-sub">Sign with your finger in the box</span>
                          {s.sig && <button type="button" className="plk-link" onClick={() => set({ sig: null, sigKey: Date.now() })}>Clear</button>}
                        </div>
                        <div className="plk-sig">
                          <div className="plk-sig__line" />
                          <div className="plk-sig__x">×</div>
                          {!s.sig && <div className="plk-sig__hint">Sign here</div>}
                          <Signature key={s.sigKey || 'sig'} value={s.sig} onChange={(sig) => set({ sig })} />
                        </div>
                      </div>
                    </>
                  )}

                  {has('review') && (
                    <div className="plk-review">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <Section title="About you" onEdit={editTo('name')} rows={[
                          ['Name', fullName || 'Not provided'], ['Date of birth', f.dob || 'Not provided'],
                          ['Phone', f.phone || 'Not provided'], ['Address', f.address || 'Not provided'],
                        ]} />
                        <Section title="Tattoo and health" onEdit={editTo('tattoo')} rows={[
                          ['Artist', f.artist || 'Not provided'], ['Placement', f.placement || 'Not provided'],
                          ['Health', conditions.length ? conditions.join('; ') : s.health[NONE] ? 'None of the above' : 'Not answered'],
                        ]} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                          <div className="plk-rowhead"><h4>Photo ID</h4><button type="button" className="plk-link" onClick={editTo('id')}>Edit</button></div>
                          <div style={{ width: phone ? 160 : 200, marginTop: 10 }}><IdCard name={fullName && `${f.last}, ${f.first}`.toUpperCase()} /></div>
                        </div>
                        <div>
                          <div className="plk-rowhead"><h4>Signature</h4><button type="button" className="plk-link" onClick={editTo('sign')}>Edit</button></div>
                          <div style={{ height: phone ? 80 : 96, marginTop: 10, borderRadius: 14, background: '#f8f6fb', overflow: 'hidden' }}>
                            {s.sig && <img src={s.sig} alt="Your signature" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'left center' }} />}
                          </div>
                          <p className="plk-sub" style={{ marginTop: 6 }}>{s.sigName || fullName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="plk-foot">
                  <button type="button" className="plk-btn plk-btn--ghost" onClick={back}><Back /> Back</button>
                  <div className="plk-hint" aria-live="polite">{missing}</div>
                  <button type="button" className="plk-btn plk-next" disabled={!!missing} onClick={next} title={missing || undefined}>
                    {last ? 'Send my release' : 'Next'} <Arrow />
                  </button>
                </div>
              </>
            )}

            {s.phase === 'sending' && (
              <div className="plk-center">
                <h2 className="plk-title">Sending your release…</h2>
                <div className="plk-loader"><span /></div>
                <p className="plk-sub">Hang on a sec. Please stay on this screen.</p>
              </div>
            )}

            {s.phase === 'done' && (
              <div className="plk-done">
                <div className="plk-check"><Tick s={phone ? 40 : 54} /></div>
                <h2 className="plk-title">You&apos;re all set{f.first.trim() ? `, ${f.first.trim()}` : ''}!</h2>
                <p className="plk-sub">{shop} has your signed release. Hand the tablet back to the front desk and get comfy.</p>
                <div className="plk-done__foot">
                  <span style={{ marginRight: 'auto' }}>Clearing in {countdown}s</span>
                  <button type="button" className="plk-btn" onClick={reset}>Done</button>
                </div>
              </div>
            )}

            {camera && (
              <div className="plk-camera">
                <div className="plk-view">
                  <div className="plk-view__frame"><IdCard name={fullName && `${f.last}, ${f.first}`.toUpperCase()} /></div>
                  <div className="plk-view__live">Live view of the ID shelf</div>
                  {flash > 0 && <div key={flash} className="plk-flash" />}
                </div>
                <div className="plk-campanel">
                  <div className="plk-kicker">↖ ID shelf, top left of the kiosk</div>
                  <h3 className="plk-title">Place your ID on the shelf</h3>
                  <p className="plk-sub">Face up, with your photo showing. Check the preview, then tap Take photo.</p>
                  <button type="button" className="plk-btn" onClick={shoot}>Take photo <Camera s={phone ? 26 : 34} /></button>
                  <button type="button" className="plk-btn plk-btn--ghost" onClick={() => setCamera(false)}>Cancel</button>
                </div>
              </div>
            )}

            {s.confirm && (
              <div className="plk-dialog-back">
                <div className="plk-dialog" role="dialog" aria-modal="true" aria-label="Start over?">
                  <h3 className="plk-title">Start over?</h3>
                  <p className="plk-sub">Everything you&apos;ve entered, including your ID photo and signature, will be erased from this tablet.</p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button type="button" className="plk-btn plk-btn--ghost" onClick={() => set({ confirm: false })}>Keep going</button>
                    <button type="button" className="plk-btn" onClick={reset}>Erase and start over</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepList() {
  return (
    <div className="plk-welcome__list">
      {['A few details about you', 'Your tattoo and health', 'A quick photo of your ID', 'Sign and send'].map((t, k) => (
        <div key={t}><b>0{k + 1}</b>{t}</div>
      ))}
    </div>
  );
}

function Section({ title, onEdit, rows }) {
  return (
    <div>
      <div className="plk-rowhead"><h4>{title}</h4><button type="button" className="plk-link" onClick={onEdit}>Edit</button></div>
      <dl className="plk-rows" style={{ margin: 0 }}>
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </div>
  );
}
