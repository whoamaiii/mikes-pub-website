# Motion lab prototype

Throwaway design prototype for the hero shader and hover micro-interactions proposed in
[`docs/proposals/hero-motion-issue.md`](../../docs/proposals/hero-motion-issue.md). Q reviewed it on
23 September 2026.

It is **not production code**. The Astro site never imports it, it adds no dependency, and nothing
in it is approved scope until the linked issue is accepted. It reuses the images and fonts that are
already tracked in the repository, so it contains no new binary assets. The quiz-night photo is
`demo-cleared` only; see [`docs/assets/home-assets.md`](../../docs/assets/home-assets.md).

## Run it

WebGL cannot read the photo over `file://`, so serve the repository root over HTTP:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8765/prototypes/motion-lab/>.

## What it shows

- **Hero shader:** plain WebGL1 with no libraries, about 4 KB of script gzipped.
  - Lantern flicker in 5-second windows (WCAG 2.2.2); after each window the render loop stops completely.
  - Warm glow around the lamps and lit windows.
  - Sign glint triggered by events: page load, scrolling back to the hero, returning to the tab, and the pointer or a tap on the sign. It has a 3-second cooldown.
  - Cursor lantern and pointer parallax, on mouse devices only.
- **Lab panel:** a toggle for each effect, a replay button for the glint, a reduced-motion simulation, a plain-photo comparison and a live frame-rate readout.
- **Hover samples:** CSS-only states for the gallery, buttons, visit actions, Program rows and the category filter.

## Known prototype limits

- It uses the desktop photo on every screen size. Production must use the responsive mobile and desktop hero images and their focal points.
- The canvas crop differs slightly from the plain `<img>` because of the parallax headroom. Production must match the crops exactly.
- Frame rates were measured only on an Apple M5. A real mid-range Android phone is still required.
