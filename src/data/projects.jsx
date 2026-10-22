// All portfolio content lives here. Each entry drives one row in "Selected work"
// and one case study. Images/videos live in /public/assets.
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
  d2:    wide detail image (4:3, left)    { src, fit, bg, caption }
  d3:    tall detail image (3:4, right)   { src, video, caption, label (gray text above the box) }
  d3b:   optional second 3:4 box beside d3 (d3 + d3b share the right column). Empty src shows a placeholder.
  pattern: optional extra image { src, alt, aspect, caption }: under the headline on desktop, under d2 on mobile
  art:   optional transparent graphic (e.g. SVG logo) under the Approach paragraph { src, alt }
  preview: image in the cursor-follow circle when hovering the row (defaults to hero.src)
*/
export const projects = [
  {
    n: '01', title: 'Seaworthy Jewelry', disc: 'Branding', year: '2026',
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
    n: '02', title: 'Toro Bravo Cookbook', disc: 'Print', year: '2013',
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
    preview: A + 'toro-cover-logo.png',
    spots: spots({ 1: 'Toro Bravo logo design', 2: 'Color and layout design', 3: 'Illustration throughout the book' }),
  },
  {
    n: '03', title: 'Joyful Noise Table Wine', disc: 'Packaging', year: '2025',
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
    n: '04', title: 'The Athletic Community', disc: 'Apparel', year: '2025',
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
    n: '05', title: 'Mountain View Heritage', disc: 'Illustration', year: '2025',
    headline: 'Whole hog, whole brand.',
    context: (
      <><L href="https://www.mountainviewheritage.com/">Mountain View Heritage</L> is a small, family-run farm in Oregon City, OR focused on nose-to-tail practices and whole-hog butchery. They focus primarily on providing educational workshops around how to raise and process heritage breed pigs. This is an ongoing project for me. We’re working together to create a logo, online presence, and a look that suits the feel of their business.</>
    ),
    approach: 'Approach: drawing from old butcher-shop charts and farmhouse signage, the logo and visual system aim to feel handmade, educational and unmistakably Oregon.',
    hero: { src: C + 'tm-case05-hero.jpg', aspect: '2400 / 1447' },
    d2: { src: C + 'tm-case05-2.webp' },
    d3: { video: A + 'mountain-view-heritage.mp4', label: 'Logo design captured with Procreate time lapse' },
    spots: spots({ 3: 'Hand painted original' }),
  },
  {
    n: '06', title: 'West Of The Rain', disc: 'Digital', year: '2022',
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
    n: '07', title: 'Elixer Race Team', disc: 'Print', year: '2024',
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
    n: '08', title: 'West Coast Fitness Challenge', disc: 'Multimedia', year: '2024',
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
