// Site-wide links and the motion settings read by src/lib/tm-interact.js.
export const EMAIL = 'skipmarcel@gmail.com';
export const RESUME = '/assets/tyler-adams-resume.pdf';
export const LINKEDIN = 'https://www.linkedin.com/in/tyler-adams-coding-sailor/';
export const INSTAGRAM = 'https://www.instagram.com/tracmachine/';
export const MOBILE_QUERY = '(max-width: 720px)';

// Hero "T.R.A.C" effect above the title: 'scramble' (letters scramble into the full name)
// or 'grow' (each word grows out of its initial, left to right). Add ?trac=grow or ?trac=scramble
// to the page URL to preview the other one without changing this.
export const TRAC_EFFECT = 'grow';

// Rendered as data-ix-* attributes on the root element. tm-interact.js reads them.
export const MOTION = {
  'data-ix-btn': 'Classic',          // Classic | Fill sweep | Lift | Magnetic | Arrow nudge
  'data-ix-press': '1',              // squash buttons on press
  'data-ix-nav': 'Color',            // Color | Underline grow | Pill highlight | Dim others
  'data-ix-active': '1',             // highlight nav link for the section in view
  'data-ix-card': 'Lift',
  'data-ix-img': 'None',             // None | Zoom | Pan with cursor
  'data-ix-reveal': 'up',            // up | blur | wipe | scale | none
  'data-ix-head': 'Line rise',       // Line rise | Weight morph | Scramble | None
  'data-ix-sec': 'Scale in',         // Scale in | Layered slide | None
  'data-ix-px': 'Subtle',            // Off | Subtle | Deep (parallax)
  'data-ix-cursor': 'System',
  'data-ix-bg': 'Grid draw-in',
  'data-ix-demo': 'Hotspots',        // pulses the case-study hotspots
  'data-ix-copy': '0',               // 1 = clicking an email copies it instead of opening mail
  'data-ix-ctwin': '1',              // hovering either C in the hero turns both orange
};
