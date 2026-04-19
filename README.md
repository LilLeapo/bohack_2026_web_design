# Bohack 2026

Editorial landing page for **Bohack 2026** — a 48-hour collegiate hackathon.

Built with **Vite + React 18**. Design tokens and components are driven by the
`pencil-new.pen` design system and the reference HTML/CSS prototype.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

## Project structure

```
index.html                 # Vite entry HTML
vite.config.js
src/
  main.jsx                 # React root
  App.jsx                  # Page composition
  styles/
    globals.css            # Design tokens + all section styles
  hooks/
    useCursor.js           # Custom cursor + spotlight + hover enlarge
    useParticles.js        # Hero particle network canvas
    useParallax.js         # Scroll-driven parallax on [data-parallax]
    useReveal.js           # IntersectionObserver reveal-on-scroll
    useScramble.js         # Text scramble animation
    useMagnet.js           # Magnetic buttons/links
  sections/
    Nav.jsx
    Hero.jsx
    Ticker.jsx
    About.jsx
    Countdown.jsx
    Tracks.jsx
    Schedule.jsx
    Prizes.jsx
    Sponsors.jsx
    FAQ.jsx
    Footer.jsx
```

## Design system

See `pencil-new.pen` for the source of truth on colors, type, and component
specs. Tokens are mirrored as CSS custom properties in
`src/styles/globals.css`.

## Legacy files

The original standalone prototype (`Bohack.html`, `app.jsx`, `styles.css`,
`interactions.js`) is kept at the repo root for reference but is no longer used
by the app. Feel free to delete them once you're satisfied with the new setup.
