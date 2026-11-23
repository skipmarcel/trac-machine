// All portfolio content lives here. Each entry drives one row in "Selected work"
// and one case study. Images/videos live in /public/assets.
import FKCaseStudy from '../components/FKCaseStudy.jsx';
import PTCaseStudy from '../components/PTCaseStudy.jsx';
import PLCaseStudy from '../components/PLCaseStudy.jsx';
import TTCaseStudy from '../components/TTCaseStudy.jsx';

const A = '/assets/';
const C = '/assets/case/';

const L = ({ href, children }) => (
  <a className="inline-link" href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

// Hotspot defaults; each project can override labels and positions.
const DEFAULT_SPOTS = [
  { n: '1', x: '12%', y: '18%', label: 'Custom font creation' },
  { n: '2', x: '62%', y: '20%', label: 'Colour + type system' },
  { n: '3', x: '44%', y: '66%', label: 'Applied to print + web' },
];
const spots = (labels = {}, pos = {}) =>
  DEFAULT_SPOTS.map((s) => ({ ...s, ...(pos[s.n] || {}), label: labels[s.n] || s.label }));

/*
  hero:  { src, video, fit: 'cover'|'contain', bg, aspect (e.g. '3 / 2'; omit for fixed-height hero), parallax }
  d2:    wide detail image (4:3, left)    { src, video, fit, bg, caption }
  d3:    tall detail image (3:4, right)   { src, video, caption, label (gray text above the box) }
  d3b:   optional second 3:4 box beside d3 (d3 + d3b share the right column). Empty src shows a placeholder.
  hero.site: live website as the hero, a non-interactive window { src, title }. Keep hero.src for the row thumbnail.
  feature: optional full-width image between the notes and the text { src, alt, aspect }
  phones: replaces d3 with staggered, overlapping iPhones showing screenshots [{ src, alt }] (1170 x 2532 phone captures)
  pattern: optional extra image { src, alt, aspect, caption }: under the headline on desktop, under d2 on mobile
  art:   optional transparent graphic (e.g. SVG logo) under the Approach paragraph { src, alt }
  slug: stable id, used in the case URL (?case=slug) and the per-case CSS class (.case--slug)
  section: 'web' | 'apps' | 'print' | 'brand' | 'campaign' (see sections above); n is only a React key
  summary: short text in the open row (row headline is headline, else intro.heading, else title)
  thumb: row thumbnail and open-row image (defaults to hero.src)
  rowAspect: shape of the open-row image, e.g. '1200 / 834', so a screen design isn't cropped (defaults to 16:10)
  intro / embed / heroOnly: heading above the hero, an interactive HTML frame below it, and stopping after those
*/
// Selected work sections, in page order. A section with no cases is hidden.
export const sections = [
  { id: 'web', name: 'Web', blurb: 'Sites designed and built end to end.' },
  { id: 'apps', name: 'Apps', blurb: 'Product and interface design.' },
  { id: 'print', name: 'Print', blurb: 'Books, labels and printed goods.' },
  { id: 'brand', name: 'Brand', blurb: 'Identities, marks and type.' },
  { id: 'campaign', name: 'Campaign', blurb: 'One look across motion, print and social.' },
];

// Cases in the order they appear: by section, then as listed here.
export const projects = [
  {
    n: '01', title: 'Forrester Karr Woodworking', disc: 'Web design', year: '2026',
    slug: 'forrester-karr', section: 'web',
    summary: 'A showcase site for Forrester Karr, a woodworker focused on fine cabinetry. An animated FK mark opens the site, eight commissions sit in a numbered gallery, and all text and photos are managed in Sanity so Forrester can update his work himself.',   // open row in Selected work
    hero: { src: '/assets/fk/fk-hero-beams.jpg' },
    spots: [],
    custom: FKCaseStudy,
  },
  {
    n: '02', title: 'Mountain View Heritage', disc: 'Web design', year: '2026',
    slug: 'mountain-view-heritage', section: 'web',
    summary: 'Mountain View Heritage is a small, family-run farm in Oregon City, OR focused on nose-to-tail practices and whole-hog butchery. We’re working together to create a logo, online presence, and a look that suits the feel of their business.',   // open row in Selected work
    headline: 'Whole hog, whole brand.',
    context: (
      <><L href="https://www.mountainviewheritage.com/">Mountain View Heritage</L> is a small, family-run farm in Oregon City, OR focused on nose-to-tail practices and whole-hog butchery. They focus primarily on providing educational workshops around how to raise and process heritage breed pigs. This is an ongoing project for me. We’re working together to create a logo, online presence, and a look that suits the feel of their business.</>
    ),
    approach: 'Approach: the home page opens on four crossfading clips from the farm kitchen, with the hand-drawn logo I made for them set beside the headline. The class calendar updates daily from PCC’s schedule, and a small shop and event-payment page sell hats, stickers and private events. The site is built in React.',
    hero: {
      src: C + 'mvh-kitchen-crew.jpg',   // row thumbnail; the case itself opens on the live site
      site: { src: 'https://www.mountainviewheritage.com/', title: 'Mountain View Heritage home page' },
    },
    feature: { src: C + 'mvh-kitchen-crew.jpg', alt: 'The Mountain View Heritage crew in leather aprons behind a charcuterie board, with the hand-drawn logo', aspect: '924 / 578' },
    d2: { video: A + 'mountain-view-heritage.mp4', fit: 'contain', bg: 'var(--ink)', caption: 'Logo design captured with Procreate time lapse' },
    phones: [
      { src: C + 'mvh-phone-1.jpg', alt: 'Events page on an iPhone' },
      { src: C + 'mvh-phone-2.jpg', alt: 'Private event payment page on an iPhone' },
      { src: C + 'mvh-phone-3.jpg', alt: 'Home page on an iPhone' },
    ],
    spots: spots({ 1: 'Hand-drawn logo', 2: 'Crossfading hero video', 3: 'Complete brand identity' }),
  },
  {
    n: '03', title: 'Psychic Tiger', disc: 'Web design', year: '2026',
    slug: 'psychic-tiger', section: 'web',
    summary: 'A website for Psychic Tiger, Jordan Burns’s personal training practice in Portland. A line-drawn logo of twin tiger heads and the wordmark draws itself from the centre outward over a crossfading photo hero.',   // open row in Selected work
    hero: { src: '/assets/pt/jordan-117.jpg' },
    spots: [],
    custom: PTCaseStudy,
  },
  {
    n: 'PL', title: 'PurpleLine', disc: 'Product design', year: '2026',
    slug: 'purpleline', section: 'apps',
    summary: 'A digital consent and release form for tattoo shops, running on a dedicated iPad at the front desk. It never touches the client’s phone and keeps working when the Wi-Fi drops. The case ends with a working kiosk you can click through.',   // open row in Selected work
    hero: { src: '/assets/pl/pl-thumb.jpg' },
    rowAspect: '1200 / 834',   // show the whole screen in the open row, not a 16:10 crop
    spots: [],
    custom: PLCaseStudy,
  },
  {
    n: 'TT', title: 'TuneIn', disc: 'Full-stack web app', year: '2026',
    slug: 'tunein', section: 'apps',
    summary: 'A “name that tune” game built on Spotify in React and TypeScript, with forgiving answer matching and a shared leaderboard that scores every game on the server. The case covers the screens, the architecture and the API.',   // open row in Selected work
    hero: { src: '/assets/tt/tt-thumb.jpg' },
    rowAspect: '1440 / 900',   // the whole desktop screen in the open row
    spots: [],
    custom: TTCaseStudy,
  },
  {
    n: '04', title: 'Toro Bravo Cookbook', disc: 'Print', year: '2013',
    slug: 'toro-bravo', section: 'print',
    summary: "I designed the book's look and feel, including the original logo, the outside and inside covers, and aspects of the page design.",   // open row in Selected work
    thumb: C + 'tm-case02-2.webp',   // row thumbnail
    headline: <>TORO BRAVO:<br />STORIES. RECIPES.<br />NO BULL.</>,   // explicit line breaks, one phrase per line
    context: (
      <>I met John Gorham around 2006, a year before he opened Toro Bravo in Portland, Oregon. He became a regular tattoo client and friend, and the bull I tattooed on his left arm became the restaurant's logo and personality for 13 years, until Covid closed it in 2020. I introduced John to my then partner, food writer Liz Crain, and together they wrote the <L href="https://store.mcsweeneys.net/products/toro-bravo-stories-recipes-no-bull?taxon_id=59">Toro Bravo Cookbook</L>, published by <L href="https://store.mcsweeneys.net/">McSweeney's</L> in 2013. I designed the book's look and feel, including the original logo, the outside and inside covers, and aspects of the page design. Between recipe testing at John's house and tattooing everyone involved, it felt more like a big party than a job.</>
    ),
    approach: "Approach: to capture the long, epic story of John's culinary journey, leading up to and through the life of the late, great Toro Bravo, we wrapped it all up in a hardcover book!",
    hero: { video: A + 'toro-cookbook.mp4', parallax: true },
    d2: { src: C + 'tm-case02-2.webp', caption: 'Cover art and layout design' },
    d3: { src: C + 'tm-case02-3.webp', caption: 'Toro Bravo owner, John Gorham' },
    art: { src: C + 'tm-case02-logo.png', alt: 'Toro Bravo logo, est. 2007' },
    pattern: { src: C + 'tm-case02-pattern.jpg', alt: 'Repeating bull-head pattern in dark red on red', aspect: '1400 / 1340', caption: 'Inside cover Illustrations' },
    spots: spots({ 1: 'Toro Bravo logo design', 2: 'Color and layout design', 3: 'Illustration throughout the book' }),
  },
  {
    n: '05', title: 'Joyful Noise Table Wine', disc: 'Packaging', year: '2025',
    slug: 'joyful-noise', section: 'print',
    summary: 'Approach: the label began as a hand-painted watercolor, echoing the bold lines and limited palette of late 20th-century American traditional tattoo flash.',   // open row in Selected work
    headline: 'From skin to table wine.',
    context: (
      <><L href="https://www.joyfulnoisewine.com/">Joyful Noise Wine</L> is the creation of Calli and Deven Morganstern. Born in McMinnville, Oregon the wines are meant to be shared and bring a small piece of this amazing place to the tables of friends and family all over the world. They were looking for an old world tattoo design. Deven, who is a tattoo client of mine, asked me to design the label for their newest table wine coming out in the fall of 2025.</>
    ),
    approach: 'Approach: the label began as a hand-painted watercolor, echoing the bold lines and limited palette of late 20th-century American traditional tattoo flash.',
    hero: { src: C + 'tm-case03-hero.webp', aspect: '1200 / 960' },
    d2: { src: C + 'tm-case03-2.webp' },
    d3: { video: A + 'joyful-noise-wine.mp4' },
    spots: spots({ 2: 'Hand painted original' }),
  },
  {
    n: '09', title: 'Elixer Race Team', disc: 'Print', year: '2024',
    slug: 'elixer', section: 'print',
    summary: 'The logo and supporting artwork were printed on t-shirts, beer koozies and hats.',   // open row in Selected work
    headline: 'A first-in-class crew deserves a first-in-class look.',
    context: (
      <>I seasonally crew on a 1981 Cal 9.2 racing sailboat called Elixer. The 9.2 refers to meters but in feet she’s roughly 30. One year our crew placed 1st in our class and we decided to re-brand a little bit.</>
    ),
    approach: "Approach: drawing on classic yacht-racing graphics and a little tattoo flash, the new mark celebrates the win without losing the boat's 1981 spirit. The logo and supporting artwork were printed on t-shirts, beer koozies and hats.",
    hero: { src: C + 'tm-case07-hero.jpg', aspect: '1200 / 937' },
    d2: { src: A + 'elixir-front.png', fit: 'contain', bg: '#141413' },
    d3: { src: C + 'tm-case07-3.jpg' },
    spots: spots(),
  },
  {
    n: '07', title: 'Seaworthy Jewelry', disc: 'Branding', year: '2026',
    slug: 'seaworthy', section: 'brand',
    summary: 'Approach: a redesign of the Seaworthy logo, refining the mark while keeping its maritime heritage, then carrying the new identity through type and colour decisions from a business card to a website.',   // open row in Selected work
    headline: <>Seaworthy<br />brand identity reboot</>,   // explicit line break, one phrase per line
    context: (
      <><L href="https://www.seaworthypdx.com/">Seaworthy</L> started in January of 2010 as a side project. An opportunity to escape a corporate job that had their designer, Marisa Howard, drowning in boredom. Seaworthy has grown from a hobby to a full-blown jewelry production facility, employing skilled artisans and honoring a history of US manufactured jewelry.</>
    ),
    approach: 'Approach: a redesign of the Seaworthy logo, refining the mark while keeping its maritime heritage, then carrying the new identity through type and colour decisions from a business card to a website.',
    hero: { src: C + 'd1-case-hero.png', aspect: '3 / 2' },
    d2: { src: C + 'd1-case-2.webp' },
    d3: { src: C + 'd1-case-3.webp' },
    pattern: { src: C + 'tm-case01-invite.jpg', alt: 'Seaworthy open studio party invitation', aspect: '4 / 3' },
    art: { src: C + 'tm-case01-fish.svg', alt: 'Seaworthy fish logo' },
    spots: spots({ 1: 'Font creation', 2: 'Logo design' }, { 2: { x: '17.5%', y: '79%' } }),
  },
  {
    n: '08', title: 'West Of The Rain', disc: 'Digital', year: '2022',
    slug: 'west-of-the-rain', section: 'brand',
    summary: 'The figure eight knot became his business logo, and launched a whole new look and feel.',   // open row in Selected work
    headline: 'A knot that ties it all together.',
    context: (
      <>In 2022 my good friend Ian Edwards started his own hat making business called <L href="https://www.instagram.com/westoftherain/">West Of The Rain</L>. I took his idea a little further and incorporated a tattoo that I gave him years ago on the top of his hand. The figure eight knot became his business logo, and launched a whole new look and feel.</>
    ),
    approach: "Approach: I redrew the figure eight knot from Ian's tattoo as a clean, scalable mark that works stamped inside a hatband as well as on a website or business card, then paired it with type that feels as handcrafted as his hats.",
    hero: { src: C + 'tm-case06-hero.webp', fit: 'contain', bg: '#141414' },
    d2: { src: A + 'west-of-the-rain-anne.png', fit: 'contain', bg: '#141414' },
    d3: { src: C + 'tm-case06-3.webp' },
    spots: spots({ 3: 'Logo design' }, { 3: { x: 'calc(50% + clamp(320px,62vw,820px) * 0.18)', y: '70%' } }),
  },
  {
    n: '06', title: 'The Athletic Community', disc: 'Apparel', year: '2025',
    slug: 'athletic', section: 'brand',
    summary: 'Approach: The Athletic was looking for a tattoo design related line of socks that remained simple enough to embroider.',   // open row in Selected work
    headline: 'The best athletic socks in the game should have the best design in the game.',
    context: (
      <>A very regular tattoo client of mine is the owner of an apparel company here in Portland Oregon called <L href="https://www.theathleticcommunity.com/">The Athletic</L>. I had the pleasure of designing a tattoo inspired line of socks for them in 2025. This was a very fun project and I’d love to work with them again.</>
    ),
    approach: 'Approach: The Athletic was looking for a tattoo design related line of socks that remained simple enough to embroider. Having that parameter made for a very fun project.',
    hero: { src: C + 'tm-case04-hero.webp', parallax: true },
    d2: { src: C + 'tm-case04-2.webp' },
    d3: { src: C + 'tm-case04-3.webp' },
    spots: spots(),
  },
  {
    n: 'CR', title: 'CLEAResult', disc: 'Motion graphics',
    slug: 'clearesult', section: 'campaign',
    summary: 'Tech used: Adobe Media Encoder, Adobe Illustrator, Adobe Photoshop, Claude Design and Claude Code.',   // open row in Selected work
    thumb: C + 'cr-thumb.jpg',   // still frame from the reel, for the row thumbnail
    heroOnly: true,   // the case is just the hero media and the deck (no notes bar, text or detail images)
    hero: { video: A + 'cr-data-story_1.mp4', aspect: '16 / 9' },
    embed: {
      src: A + 'embeds/clearesult-design-system-tyler-adams.html', title: 'CLEAResult design system click-through deck',
      heading: 'CLEAResult Design Template Approach',
      text: 'Building a reusable template and brand design system lets non-designers create digital and print media quickly while keeping company colors, layouts, and typography locked and consistent.',
    },
    intro: { heading: 'Motion Graphics and video work using the CLEAResult logo and public data', text: 'Tech used: Adobe Media Encoder, Adobe Illustrator, Adobe Photoshop, Claude Design and Claude Code.' },
    spots: [],
  },
  {
    n: '10', title: 'West Coast Fitness Challenge', disc: 'Multimedia', year: '2024',
    slug: 'west-coast-fitness', section: 'campaign',
    summary: 'Approach: I designed one visual system across every format, including the logo, posters, video titles and social templates, so the event looked the same everywhere it appeared.',   // open row in Selected work
    headline: 'Built to move people.',
    context: (
      <>In 2024, the organisers of West Coast Fitness Challenge asked me to create the look of the event, from the logo to the content that would promote it across print, video and social.</>
    ),
    approach: 'Approach: I designed one visual system across every format, including the logo, posters, video titles and social templates, so the event looked the same everywhere it appeared.',
    hero: { src: C + 'tm-case08-hero.webp', aspect: '1200 / 720' },
    d2: { src: C + 'tm-case08-2.webp' },
    d3: { src: C + 'tm-case08-3.webp' },
    d3b: { src: C + 'tm-case08-4.jpg' },
    spots: spots({ 1: 'Print and social key art', 2: 'Mobile landing page', 3: 'Logo and brand mark' }),
  },
];

