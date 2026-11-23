# Selected work → Work Sections (build spec)

Prototype: `docs/work-sections-prototype.dc.html`. It's a Claude Design file that only runs in the design canvas, so read it as a reference for markup, styles and behaviour. Live version: the "Work Sections" page in the Trac Machine design project.

## Goal

Replace the flat "Selected work" list and the separate case section with **five sections**, each listing its cases as rows that open and close. "View case" slides the list away to the left and slides the full case in from the right. A clear "← Selected work" control brings the list back.

## Sections and cases

Add a `section` field to every entry in `src/data/projects.jsx` (`'web' | 'apps' | 'print' | 'brand' | 'campaign'`). The CLEAResult entry in `featured` moves into `projects` as a Campaign case, so the special "Featured" row and the `heroOnly` styling in the case picker go away. Keep its hero video, intro and deck embed.

| Section | Blurb | Cases (in this order) |
|---|---|---|
| Web | Sites designed and built end to end. | Forrester Karr Woodworking, Mountain View Heritage, Psychic Tiger |
| Apps | Product and interface design. | 2 new cases (TBD, placeholders for now) |
| Print | Books, labels and printed goods. | Toro Bravo Cookbook, Joyful Noise Table Wine, Elixer Race Team |
| Brand | Identities, marks and type. | Seaworthy Jewelry, West Of The Rain, The Athletic Community |
| Campaign | One look across motion, print and social. | CLEAResult, West Coast Fitness Challenge |

Define the sections themselves (id, name, blurb, order) in `projects.jsx` too, e.g. `export const sections = [...]`.

## Layout (list view)

- Keep the grey `#work` band, the "Selected work" `h2` and the rule under it.
- Each section is a row: the section name on the left (`flex: 1 1 200px`), its case rows on the right (`flex: 999 1 460px`). On mobile the name stacks above the rows.
- Section name: 550 weight, 88% stretch, `clamp(28px, 3.2vw, 48px)`, line-height .92, letter-spacing −.045em. The blurb sits under it at 15px in `--body`.
- **No numbers anywhere**: no section counts and no case codes (W01 etc.). Drop `n` from the UI. It can stay in the data as a key.
- Case row (`<button aria-expanded aria-controls>`), a 3-column grid: thumbnail · title + discipline · round arrow.
  - Columns: `150px minmax(0,1fr) 36px` desktop, `96px minmax(0,1fr) 36px` at ≤720px.
  - Thumbnail: 3:2, radius 6px, `object-fit: cover` (uses `hero.src`, or `preview` if set).
  - Title: `clamp(18px, 1.8vw, 26px)`, 500 weight. The discipline sits below it in mono 13px `--muted`.
  - Arrow: 36px circle, 1px border, `↓`. When open it fills ink with a light glyph and rotates 180° (so it reads ↑) over .45s.
  - Hover keeps the existing slide-right: `padding-left: 12px` with a `.4s cubic-bezier(.2,.7,.1,1)` transition.
- Expanded panel (directly under its row): animate `grid-template-rows: 0fr → 1fr` over .55s. The inner wrapper fades in and moves up from −12px. Set `visibility: hidden` once closed so its links leave the tab order.
  - Contents: a large image (16:10, or the hero video for CLEAResult) beside the headline, a short description and a **View case →** button. They wrap to stacked on mobile.
  - Several rows can be open at once.

## Case view (slide)

- Wrap the list and the case in one track: `display: grid; overflow-x: clip` (**clip, not hidden**, or the sticky bar breaks). Both panes sit in `grid-area: 1 / 1`.
- View case: the list moves to `translateX(-104%)` and fades out, and the case comes in from `translateX(104%)`. Use 650ms `cubic-bezier(.65,0,.35,1)`. Once the slide ends, collapse the hidden pane (`height: 0; overflow: hidden; visibility: hidden; aria-hidden`) so the page height fits the pane in view.
- On open: scroll to the top of the track (smooth) and focus the back button.
- Sticky bar at the top of the case (`position: sticky; top: <header height>`; frosted `rgba(237,237,234,.92)` + blur, bottom rule):
  - Left: a **"← Selected work"** pill, 44px tall, ink fill, turning accent on hover.
  - Middle: a breadcrumb `Section / Case title` in mono 13px.
  - Right: ← → 44px circle buttons that step to the previous/next case **in section order** (across sections, wrapping around). Stepping scrolls back to the top of the case.
- Case body: the **existing case layouts** from `CaseStudy.jsx`, including the FK/PT custom panels and the MVH live-site hero. The prototype's simplified case body is only a stand-in.
- Footer of the case: a "← Back to Selected work" button on the left, and a "Next case / <title> →" card on the right.
- This replaces the old number-button case picker (above and below the case).

## Going back

Triggers: either back button, **Esc**, a header nav link, and the **browser back button** (not in the prototype; add it, see below).

- **All rows close** when you return: reset the open state to `{}`.
- Skip the close animation on that return (snap) so scrolling lands on the right row, then turn transitions back on after the slide.
- Scroll to the row of the case you were viewing and focus its button. When going back from a nav link, scroll to that section.

### Browser back

Push a history entry when a case opens (`?case=<slug>` or `#case-<slug>`) and listen for `popstate` to run "go back". Opening the URL directly should load straight into that case. Phone users will expect swipe-back to work.

## Header nav

The prototype puts Web · Apps · Print · Brand · Campaign in the nav. On the real site, decide with Tyler whether these go next to Work / About / Contact / Work With TRAC / Resume, or only on desktop. Each link scrolls to its section and returns to the list first if a case is open.

## Motion and accessibility

- Keep the existing `data-reveal`, `data-head`, `data-sec` and `data-parallax` attributes on the case content, and re-run `TM.init` / `TMX.update` after a case swaps in (as `App.jsx` does now).
- The follow-cursor preview circle in `Work.jsx` isn't needed any more, because rows have thumbnails.
- `prefers-reduced-motion`: no slide or fold animation, so swaps happen instantly.
- Rows are real `<button>`s with `aria-expanded` and `aria-controls`. The panels have `role="region"`. Hidden panes get `aria-hidden="true"`.
- Mobile breakpoint stays at 720px. Check both layouts.

## Files likely touched

- `src/data/projects.jsx`: `section` per case, `sections` list, CLEAResult moved into `projects`, a short `summary` per case for the expanded row.
- `src/components/Work.jsx`: rebuilt as the sectioned list (or a new `WorkSections.jsx`).
- `src/components/CaseStudy.jsx`: the picker is removed, and it's rendered inside the case pane with the sticky bar and footer.
- `src/App.jsx`: view state (`list` / `case`), current case, history and Esc handling.
- `src/components/Header.jsx`: section links (pending the decision above).
- `src/styles/global.css`: new styles using the existing tokens only (no new colours; see CLAUDE.md).

## Open items for Tyler

1. **Expanded-row copy:** the prototype uses short excerpts from each case, and some are new wording. Tyler should approve the `summary` text (CLAUDE.md: keep his wording verbatim).
2. **The two new Apps cases:** content and images needed.
3. **Existing bug:** the per-case CSS in `global.css` uses `.case--06` (Seaworthy) and `.case--03` (Toro), but those cases are now 07 and 04, so their layout tweaks don't apply. If `n` changes again with this rework, key those classes to a stable slug instead (e.g. `case--seaworthy`).

## Done when

- [ ] All five sections show the right cases, with no numbers anywhere
- [ ] Rows open and close with the rotating arrow, and the hover slide still works
- [ ] View case slides right, the sticky "← Selected work" stays visible while scrolling, and ← → step through cases
- [ ] Back (button, Esc, nav link, browser back) slides home with every row closed, and lands on the case just viewed
- [ ] Existing case layouts and motion still work inside the case pane
- [ ] Desktop and ≤720px both checked; reduced motion respected
