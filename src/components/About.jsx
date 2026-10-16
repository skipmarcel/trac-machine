import { RESUME } from '../config.js';

export default function About() {
  return (
    <section id="about" className="section" data-sec="">
      <div className="about">
        <span className="label" data-scramble="">About</span>
        <figure className="about__fig" data-reveal="up">
          <img src="/assets/tyler.jpg" alt="Tyler Russell Adams" />
          <figcaption>Tyler Russell Adams</figcaption>
        </figure>
        <div className="about__text">
          <p className="about__lede" data-reveal="up">I'm Tyler, a designer and tattoo artist. I design identities, printed matter, illustration and websites, from first sketch to final file.</p>
          <p className="about__body" data-reveal="up" data-delay="100">For 14 years I owned and ran a tattoo shop, where my role changed every day: people manager, head of HR, brand designer, web designer, accountant and head of marketing, to name a few. I recently sold the business and am bringing that range into design and technology, building on years in the Adobe Creative Suite, web design and a recent focus on coding. I do my best work where visual art meets technical execution, and I’m looking forward to being part of a team again, at a company I’m proud to work for.</p>
          <a href={RESUME} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" data-btn="2" style={{ alignSelf: 'flex-start' }}>Download resume <span data-ico="">→</span></a>
        </div>
      </div>
    </section>
  );
}
