# CLAUDE.md

Context for an AI picking up this project on another machine. It summarizes how the app was built so far, the decisions behind it, and what the user wants next.

## What this is

**Bitesize** — a learning app meant to teach in small chunks and feel easier and friendlier than studying. The long-term idea (discussed, not built yet): short swipeable "bites" of 3–5 cards, light retrieval practice (guess-then-reveal, this-or-that), spaced repetition hidden from the user, and possibly AI-generated bites from pasted notes. No learning features exist yet — so far the work has been the shell UI and the World Map.

The folder is `~/kaaveh project` (with a space); the npm package name is `kaaveh-project`. "Kaaveh" is the user's placeholder account name.

## Commands

```bash
npm install
npm run dev     # Vite dev server on http://localhost:5174 (strictPort; 5173 is taken by another project)
npm run build
npm run lint    # oxlint (not ESLint)
```

`.claude/launch.json` has a `dev` config for the preview tool on port 5174.

## Stack and style

- React 19 + Vite 8, plain CSS (no Tailwind, no UI or animation libraries). Keep it that way unless asked.
- Code style: **single quotes, no semicolons**, 2-space indent, named `function` components, one component per file with a co-located `.css` file, BEM-ish class names (`top-bar__section`). If you run Prettier, pass `--single-quote --no-semi`.
- Colors and motion tokens are CSS variables in `src/index.css` (`--bar`, `--page-bg`, `--indigo`, `--sunset-orange`, `--crimson`, `--ease-out`, `--ease-in-out`). Reuse them rather than adding parallel values.
- Animations: only `transform`/`opacity` (and `clip-path`), strong custom curves (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`), hover motion gated behind `@media (hover: hover) and (pointer: fine)`, and a `prefers-reduced-motion` variant for everything.
- Git is **not initialized** yet: `git` fails until the user runs `sudo xcodebuild -license accept` on that Mac.

## App structure

- `src/App.jsx` — holds `activeSection` (`null` = home, or `'world-map' | 'surfing' | 'gauntlet'`). It sets `data-section` on `<html>`, which swaps the theme. It renders `<WorldMap />` for the world map; the other sections are still placeholder cards. The current user `{ firstName: 'Kaaveh', lastName: 'DaGoat' }` is hard-coded here.
- `src/sections.js` — the three section tabs (id, label, color).
- `src/components/TopBar.jsx` — "Welcome To Bitesize!" title (clicking it goes home), the section tabs, and the profile menu.
  - Tabs are **folder tabs**: rounded tops, flat bottoms sitting on the bar's bottom edge, small curved "feet", and they overlap, with each tab in front of the one to its left. Order and colors: World Map (indigo), Surfing (sunset orange), Gauntlet of Knowledge (crimson). The active tab pops up taller; hovering lifts a tab slightly.
- `src/components/ProfileMenu.jsx` — duck avatar (`DuckAvatar.jsx`, an inline SVG) plus the name (first name bold, last name smaller underneath). Clicking opens a dropdown in the bar's color, with white text the size of the last name: Profile, Settings, Privacy, Help. The options don't navigate anywhere yet.
- `src/lib/sectionTransition.js`
  - `transitionFrom(el, update)` — switching sections uses the View Transitions API: the new screen grows out of the clicked tab in a `clip-path` circle over 550ms. Reduced motion gets a crossfade; unsupported browsers switch instantly.
  - `wiggleTab(el)` — the clicked tab grows and wiggles a little (WAAPI, pivoting on its bottom edge).
- **Themes:** home is a pastel blue gradient page with a muted dusty-blue bar (`#6f8db3`). In each section, the bar takes the tab's color and the page is a lighter, matte (flat) version of it.

## World Map (`src/world/`)

A large procedurally laid-out fantasy world that you can drag, flick (with a glide), two-finger scroll, pinch-zoom (ctrl+wheel, plus Safari `gesture*` events), zoom with +/− buttons or keys, and pan with the arrow keys. Zoom goes from "whole world fits" up to 1× (the maximum, because drawings blur beyond that).

- `projection.js` — the camera looks down at **65°** (`CAMERA_ANGLE_DEG`). Ground y is foreshortened by `sin(65°)`, and heights show at `cos(65°)`. `project(x, y, z)` maps ground coordinates to screen coordinates. Ground size is 7200×5200.
- `generateWorld.js` — seeded (it produces the same world every load). It contains:
  - `BIOMES`: colors, 3-band cliff rock colors, cliff height, beach width, scatter weights and density
  - `LANDMASSES`: about 30 hand-placed, named islands with zones, landmarks, rivers and lakes, plus about 60 random islets and sea stacks
  - sea features, ships, whales and whirlpools
  - `CLIFF_SCALE`, which sets all cliff heights at once

  `finishIsland()` turns each island into screen-space draw data: shallow water, foam line, extruded cliff bands, cracks, the top surface with a lit rim, rivers, lakes, waterfall faces, decorations split into back-to-front rows, a bounding box, and the label position. Islands are sorted back to front.
- `shapes.js` — jagged coastlines (`createLandShape`: broad waves plus bumps for peninsulas and bays, fine waves, and per-point noise), `extrusionPath` (cliff walls; only camera-facing walls are drawn), `polygonPath`, `smoothPath` (rivers), and `shade()`.
- `Decoration.jsx` — every flat pastel drawing, in the duck's style: trees, pines, palms, jagged mountains, crags, cacti, dunes, crystals, mushrooms, a castle, huts, a lighthouse, a volcano, pyramids, an obelisk, a stepped temple, a Greek temple, a pagoda, bamboo, a giant tree, a stone circle, a windmill, igloos, ruins, treasure, a sea arch and a shipwreck. Each is drawn with its base at (0,0).
- `Sprites.jsx` — animated HTML overlays that use CSS `transform`/`opacity` only: clouds, waves, ships, whales, volcano smoke, lighthouse glow, waterfalls (moving stripes plus foam), whirlpools, balloons, bird flocks, and the splash ring.
- `WorldMap.jsx` — the ocean SVG is drawn first, then each island as **its own absolutely positioned layer** (so it can animate without repainting the whole world), then labels and sprites.
  - **Intro (plays every time the map opens):** it starts fully zoomed out on an empty ocean. Islands then surface in a random order over about 2.6s. Each island's shallows appear first, a foam ring splashes out, and the island rises from below the water, overshoots, dips, and bobs once. After that its trees and buildings sprout row by row, and then its name, waterfalls, smoke and glow fade in.
  - The timing constants are at the top of the file; the keyframes are in `WorldMap.css`.
- `usePanZoom.js` — all pan and zoom input. It moves the world with a transform directly, with no React re-render per frame.

## Where things stand / what the user wants next

- **Latest feedback, not yet addressed:** the user doesn't like the "two-dimensional vibe" of the map, and said some animation choices are poor. They said they'll give more specific input. **Ask which animations feel off before changing them.** Ideas already proposed to them for a more 3D feel:
  1. real terrain elevation with slope shading (the island tops are currently flat)
  2. soft shadows cast on the water
  3. depth cues: a stronger tilt, and smaller, hazier faraway islands
- The user earlier asked for a style that mixes the current look with Kurzgesagt's, but **not too similar** to theirs. They want no bird's-eye view, jagged and realistic shapes rather than smooth ones, and a world that keeps expanding with more islands and landmasses.
- Not built yet: pages for Surfing, Gauntlet of Knowledge, and Profile/Settings/Privacy/Help; clickable islands; touchscreen pinch; the learning cards themselves; browser back-button support between sections.

## Working with this user

- They iterate visually in small steps ("a little bigger", "move it down a tiny bit"). Make exactly the tweak asked for, verify it in the browser preview, and report briefly.
- **When the user's message is just praise with "nice" (e.g. "nice", "nice job"), reply with only "Nice" — nothing else.** If "nice" comes with an actual request, do the request.
- Explain things in plain language; they're newer to coding. Offer a next step, but don't pile on options.
- Preview gotcha: the in-app browser pane is often hidden. While it's hidden, view transitions are skipped, and screenshots can lag a frame. Verify through DOM or animation state, and use the app's own input paths (dispatch `wheel` events) rather than setting transforms by hand, because `usePanZoom` overwrites manual transforms.
