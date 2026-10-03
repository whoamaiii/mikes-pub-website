# Design review, 23 September 2026

**Status:** review findings and proposals; not approved scope. The structural fixes below belong in
a separate design-refinement issue, which lands before the motion work in
[`hero-motion-issue.md`](hero-motion-issue.md). Q said on 23 September that they liked all of the
findings.

**Method:** the production build was reviewed at 1440 px and 390 px (Home and Program), plus a read
of tokens, components and `docs/design-system.md`. Opening hours, facts and rights were not
re-verified; see `docs/content-sources.md` and `docs/assets/home-assets.md`.

**Reading:** a "keep the brand, improve it" redesign of a local pub website. The audience is locals
checking on their phones, and the style is gold on black, taken from the pub's physical sign. It
should be calm and editorial, with little motion.

## What already works (keep it)

- **The real photos.** The exterior shot and the three interior shots do more than any design
  flourish would.
- **The blackletter wordmark and the gold-on-black palette.** They are the actual colours of the
  sign, so the palette is justified rather than decorative.
- **Consistency.** Every page is dark, there's one accent colour and all corners are square.
- **Solid basics.** Focus states, reduced motion and working without JavaScript are all in place.

A full overhaul isn't worth it. The gains are in hierarchy and composition.

## Findings, most important first

1. **The most important button is the weakest one.** The hero's "Se puben" is an outlined button.
   The only solid gold button on Home is the map's "Prøv igjen", a fallback action. That's
   backwards. "Se puben" also just scrolls to the gallery. _Open decision 1._

2. **Pair each activity with a photo.** "Inne på Mike’s" is three rows of text next to empty space,
   while the gallery above has the photos. Combining the two sections makes the activities concrete,
   removes the repeated "Se på Facebook" captions and cuts one section. _Open decision 2._

3. **Put the location section side by side on desktop.** It's capped at 56 rem
   (`src/styles/home.css`), so the address and map stack with about 35% of the width empty at
   1440 px. Address and directions should sit on the left with the map on the right from 64 rem up.
   While the map loads or if it fails, the currently unused `VenueMap` diagram could sit behind the
   iframe, so visitors never see an empty black box. "Prøv igjen" should become a secondary button.
   _Note:_ the map controls changed on 3 October 2026 (WHO-19 map privacy notice); the layout finding
   still applies.

4. **Tighten the Program list.**
   - The date column is so narrow that dates wrap onto three lines ("Torsdag 5. / februar 2026, /
     kl. 19.00"), and titles start at about 43% of the width. A date block (big day number with the
     month underneath) would fix that and anchor the page.
   - Every row says "Tidligere" even though the group is already headed "Tidligere arrangementer".
     Cancelled and postponed rows keep their status labels because those carry meaning.
   - Past events run oldest first. Past events should run newest first and upcoming events soonest
     first, with the sort done in the content boundary (`src/data/program.ts`), not in components.
   - "Viser hele programoversikten." floats on the far right, out of line with the filter bar. It
     should sit under the filter.
   - Musikk and Stand-up currently have no entries. Their empty state is deliberate and tested, so it
     stays.

5. **Hero overlap.** The wordmark sits over the "Velkommen til Mike’s Pub" board in the photo. At
   1440 px there are three "Mike’s Pub" marks in view: the header, the real sign and the hero. The
   address line above the headline sits on bright window light and must reach WCAG AA contrast.
   _Open decision 4._

6. **Too many repeated links.** On Home, Facebook appears about six times and Veibeskrivelse three
   times.
   - The activity section's separate Facebook action duplicates the visit strip and can go.
   - Each gallery photo's Facebook link must stay, because `docs/assets/home-assets.md` requires the
     source URL on each `demo-cleared` image. It can become a quiet source credit instead of a
     call-to-action.
   - Veibeskrivelse in the visit strip, the location section and the footer is expected and stays.

7. **Uneven spacing and dividers.** Divider lines stop at 958 px in the location section but run full
   width elsewhere. The gap between the gallery and the activities is roughly twice the other section
   gaps. One section-spacing step and full-container dividers would fix both.

8. **Heading font (optional).** Source Sans 3 is fine but generic. Barlow Condensed is already
   licensed and self-hosted in the repository and would give a pub-poster feel next to the
   blackletter. It adds about 62 KB of font download (one weight) and reverses a recent documented
   choice. _Open decision 3._

**Not a design fix:** opening hours come first in "Før du drar" and still read "Publiseres snart".
That needs confirmed facts, not a layout change.

## Constraints found while scoping the fixes

- **Photos vs activities.** The current photos show a full pub quiz, the room with football on the
  big screen, and an evening watching a singer on the big screen. The activities are music on stage,
  football on screen, and dart and shuffleboard. Only some pairings are truthful.
  - Football ↔ interior photo is truthful.
  - The quiz photo has no matching activity. A "Pubquiz" row needs owner confirmation that the
    monthly quiz still runs (sources stop at March 2026).
  - There is no photo of a stage, dart or shuffleboard.
- **Photo rights.** All three gallery photos are `demo-cleared` only. They can't go into a public
  launch until the owner confirms the selection and rights scope.
- **Budgets.** CSS was 44.6 of 48 KiB and Home HTML 20.8 of 24 KiB on 23 September, so the fixes
  must stay lean.
- **Affected tests.** `tests/e2e/home.spec.ts` (section headings, hero action, map controls),
  `tests/e2e/program.spec.ts` and `tests/unit/program-content.test.ts` (row labels and order), the
  design-system fixtures (`tests/fixtures/design-system.ts`) and the Facebook link checks in the unit
  and e2e suites.

## Open decisions for the design-refinement issue

1. **Hero button target.** Options:
   - "Se programmet" to `/program/` (recommended): it matches the tagline and doesn't repeat an action
     from the visit strip right below.
   - "Ring 918 55 855": the most useful action while hours are unpublished, but it duplicates the strip.
   - Keep "Se puben" and only make it filled.
2. **Activities and photos.** Options:
   - Pair where true (recommended): football with the interior photo, and a Pubquiz row with the quiz
     photo once the owner confirms it. The screen-night photo opens the section, and music and dart
     stay text-only until the owner supplies photos.
   - Keep the gallery and activities separate, and restyle only.
3. **Heading font.** Options:
   - Try Barlow Condensed behind one token change and pick from 375 px and 1440 px screenshots
     (recommended).
   - Keep Source Sans 3.
4. **Hero wordmark.** Options:
   - Keep the approved size and fix contrast only (recommended).
   - Shrink it so the real sign carries the brand.
