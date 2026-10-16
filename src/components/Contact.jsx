import { EMAIL, RESUME, LINKEDIN, INSTAGRAM } from '../config.js';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

export default function Contact() {
  return (
    <footer id="contact" className="contact">
      <div className="contact__card">
        <div className="contact__head">
          <span className="contact__label">Contact</span>
          <h2 className="contact__title" data-head="">Let's talk.</h2>
        </div>
        <div className="contact__links">
          <a href={`mailto:${EMAIL}`} className="contact__email">{EMAIL}</a>
          <div className="btn-row">
            <a href={RESUME} {...ext} className="chip chip--accent" data-btn="1">Resume →</a>
            <a href={LINKEDIN} {...ext} className="chip" data-btn="1">LinkedIn</a>
            <a href={INSTAGRAM} {...ext} className="chip" data-btn="1">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
