## Brief overview
- Project-specific UI philosophy for "Lore" surfaces; complements `.clinerules/ui-guidelines.md` without overriding it.
- Applies to marketing/home flows and generator UX: hero, features, how-it-works, map/output areas.
- Enforce tokens, shadcn/ui primitives, accessibility, and mobile-first responsiveness as non-negotiable defaults.

## Identity & theming
- Visual identity: warm parchment base, ink accents (indigo/purple), subtle paper grain as optional overlay.
- Mood: “old atlas meets clean app”—fantasy motifs are decorative, never obstruct usability.
- Background texture (if used): keep low-contrast, non-parallax, respects dark mode; toggle via a utility class to avoid inline styles.

## Layout & spacing
- Containers:
  - Default: `container` (max-w-7xl/1280px).
  - Tight reading columns: `.container-tight` (max-w-3xl) for prose-heavy sections.
- Section order (stacked with generous spacing lg→xl): hero → features → how-it-works → output.
- Cards:
  - Rounded: driven by `var(--radius)`; target rounded-2xl.
  - Visuals: thin `border-border`, soft hover shadow; avoid heavy elevation.
- Responsive:
  - Mobile-first; primary actions reachable with thumb.
  - Grids for feature cards; avoid deep flex nesting.

## Typography
- Headings: elegant serif (preferred: Lora or Ibarra Real Nova).
- Body: modern sans (preferred: Inter).
- Scale (responsive targets):
  - h1: 48–56
  - h2: 32–40
  - h3: 20–24
- Tracking: tighten slightly on display sizes only; avoid negative letter-spacing on body text.
- Implementation notes:
  - Load fonts with `next/font` for FOIT avoidance.
  - Map to Tailwind utilities (e.g., `text-5xl md:text-6xl` for h1).

## Color tokens
- Use CSS-variable tokens only (HSL): Background/Foreground, Card, Border, Input, Ring.
- Primary: royal purple/indigo (~ `--primary: 259 90% 60%`); Secondary: parchment tint.
- Never hard-code hex in components—use semantic classes (`bg-card`, `text-muted-foreground`, etc.).
- Radius: `--radius` controls all rounding; do not set border-radius ad hoc in components.
- Example:
  - Button: `className="bg-primary text-primary-foreground hover:bg-primary/90 ring-1 ring-ring"`

## Components blueprint
- Base: compose shadcn/ui primitives. Custom marketing components live under `components/marketing/*`.
- Required building blocks:
  - SectionHeader: eyebrow/title/subtitle; props for align and density; semantic h-levels.
  - FeatureCard: icon/title/copy; hover shadow; supports grid layouts.
  - MapPanel: image/canvas slot with label chip; includes caption area; uses `next/image`.
  - PromptConsole: seed/model/select + “Generate” button; use `react-hook-form` + `zod`; aria-live for errors.
  - LoreOutputTabs: tabs for Overview • Places • Factions • Hooks; proper roles/keyboard handling.
- Patterns:
  - Favor composition; avoid new deps unless justified.
  - Use `cva` for visual variants (e.g., compact vs spacious).
  - Icons via `lucide-react`.

## Motion
- Subtle entrances: `animate-fade-in-up` with durations ≤500ms.
- Respect `prefers-reduced-motion`: reduce/disable animations accordingly.
- Exclude heavy effects: no parallax or large background videos.

## Accessibility
- Headings follow order; page has a single h1.
- Tabs/dialogs/menus use correct roles; restore focus on close.
- Keyboard support: Enter/Space/Esc behave as expected; visible focus states.
- Color contrast: meet WCAG AA in both light and dark themes.

## Content & microcopy
- Tone: plain, confident.
- Leads: one sentence (“Generate rich lore for your fantasy world.”).
- Buttons: action-first labels (“Generate World”, “Refine Factions”).
- Avoid jargon in primary calls-to-action.

## QA Definition of Done
- Mobile-first; dark/light mode OK; no console errors.
- Lint/TypeScript clean; tokens respected; no inline hex.
- E2E: Playwright smoke test for each route (loads, main heading visible, key control works).
- Artifacts: screenshots of hero + map panel + tabs in both themes included.

## Implementation notes
- Token discipline: if a new semantic color is needed (e.g., info), add a token then wire it in `tailwind.config.ts` before using.
- Fonts via `next/font`; avoid FOUT/FOIT; include fallbacks.
- Images: `next/image` with width/height to prevent layout shift.
- Server components for static/SSR content; lazy-load heavy client-only UI.
- Example snippet (tokens-only usage):
  - `<button className="bg-primary text-primary-foreground rounded-2xl px-5 py-2.5 shadow-sm ring-1 ring-ring hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Generate World</button>`
