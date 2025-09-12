# UI Redesign Workflow
1. Read project conventions in `.clinerules/`.
2. Explore design tokens, existing layout, and UI primitives:
   - `search_files` for brand colors, typography, components
   - `read_file` tailwind config, global.css, layout.tsx
3. Propose IA + wireframe for the page as a markdown plan (sections, component list).
4. Implement with **diff edits**:
   - New components under `components/marketing/*`
   - Use shadcn/ui primitives; extract variants where repeated
5. Verify:
   - `execute_command`: `npm i` (if needed), `npm run dev`
   - Open `http://localhost:3000/` in browser; check console a11y warnings
6. Add minimal Playwright smoke test for the route.
7. Output a summary with changed files and follow-ups.

## Discovery Summary (tokens, primitives, layout)
- Design tokens (from app/globals.css):
  - Brand scale: --brand-50 … --brand-900
  - Semantic: --ink (text), --muted, --bg (page), --card (surface), --border, --ring (focus), --danger, --success
- Tailwind setup:
  - tailwind.config.js: basic content globs, no theme.extend, no plugins; Tailwind v4 present via dependencies
- Existing primitives/components:
  - UI primitives: Button (primary/secondary/danger), ToastProvider/useToast, Skeleton, Spinner, Confirm
  - Layout helpers: ParallaxHero, ScrollReveal, NavBar, SectionCard, Stat, ScrollProgress
  - App shell: app/layout.tsx provides container, heading, NavBar, Toast, skip link
- Notes re: shadcn/ui:
  - No shadcn/ui or cva currently installed. We will build marketing components with Tailwind + existing ui/Button and keep them accessible; if variants repeat, extract minimal local variant helpers, with an option to introduce cva later.

## IA and Wireframe (Home)
- Hero section
  - Large headline, subhead, primary/secondary CTA buttons
  - Background gradient using brand tokens; mobile-first centered content
- Metrics strip
  - Keep existing Stat grid driven by rendered counts
- Feature grid
  - 2–3 columns of icon + title + copy highlighting “Heraldry & Maps”, “Hooks & Events”, “Canonical Lore”, “Procedural World”
- Navigation cards
  - Keep/augment existing SectionCard grid (States, Provinces, Burgs, Markers)
- Testimonials
  - Simple quote cards with author and role
- Pricing
  - Two cards (Community / GM Pro) with CTA
- Final CTA
  - Reinforce primary action with a short line and single button

## Components to implement (src/components/marketing/*)
- Hero.tsx
- Features.tsx
- Testimonials.tsx
- Pricing.tsx
- Cta.tsx

## Wiring
- app/page.tsx: import new marketing components
