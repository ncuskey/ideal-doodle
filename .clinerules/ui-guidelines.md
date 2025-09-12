# UI Guidelines

**Repo:** ideal-doodle
**File location:** `.clinerules/ui-guidelines.md`
**Purpose:** Make UI work fast, consistent, accessible, and verifiable. These rules are read by Cline and by humans. Treat them as **non‑negotiable defaults** unless a task explicitly proposes and justifies a deviation.

---

## 0) Scope & Definition of Done

**Applies to:** Next.js app/router pages, React components, Tailwind styles, shadcn/ui primitives, small scripts supporting the UI.

**Done =**

* Implements requested UX with semantic HTML, keyboard support, and visible focus.
* Uses tokens and shadcn primitives; passes lint/type check.
* Mobile-first responsive, dark/light OK, no console errors.
* Screenshot(s) included for changed routes; basic smoke test added/updated.
* Diff-based changes only; no breaking refactors unrelated to the task.

---

## 1) Tech Baseline

* **Runtime:** Next.js (app router), React, TypeScript `strict`.
* **Styling:** Tailwind with CSS-variable tokens (see `app/globals.css`).
* **Components:** shadcn/ui primitives; extend with local wrappers under `components/ui/*`.
* **State:** Local via hooks; global via **Zustand** when needed.
* **Forms:** `react-hook-form` + `zod` (schema beside component or in `/lib/validation/*`).
* **Icons:** `lucide-react`.
* **Animation:** CSS keyframes by default; `framer-motion` only for complex interactions.

---

## 2) Design Tokens & Theming

* Tokens are defined as HSL CSS variables in `:root` / `.dark` (see `app/globals.css`).
* Tailwind uses `hsl(var(--...))` color bindings in `tailwind.config.ts`.
* **Only change look-and-feel by editing tokens** (e.g., `--primary`, `--radius`). Don’t hard-code hex values in components.
* When introducing a new semantic color (e.g., `info`), wire it through variables first, then `tailwind.config.ts`.

**Do**

* Use `bg-card`, `text-muted-foreground`, etc.
* Keep border radii via `var(--radius)`.

**Don’t**

* Don’t add inline styles for colors/sizing except trivial one-offs.
* Don’t bypass tokens for convenience.

---

## 3) Component Conventions

* **Functional, typed components**; props interfaces exported when reused.
* **File names:** `PascalCase.tsx` for React components; colocate one small helper file if needed.
* **Utilities:** Use `cn()` (from `lib/utils.ts`) to merge Tailwind classes.
* **Variants:** If a component has visual variants, use `class-variance-authority (cva)`.
* **Composition first:** Prefer composing shadcn primitives over adding new dependencies.
* **Accessibility:**

  * Provide label/aria attributes for inputs and interactive controls.
  * Maintain keyboard order; space/enter/esc behave as expected.
  * Control focus on modals/menus; restore focus when closing.

---

## 4) Pages, Layouts & Routing

* Use the **App Router** with colocated `page.tsx`, `loading.tsx`, and `error.tsx` as needed.
* Keep marketing components in `components/marketing/*`; UI primitives under `components/ui/*`.
* Layout containers (`app/(site)/layout.tsx`) own page chrome (nav, footer, theme class).

---

## 5) Data & State

* Local component state for view-level concerns.
* Lift to **Zustand** only when shared across unrelated branches of the tree or persisted.
* No global fetch in client components; use server actions/`fetch` in server components when possible.

---

## 6) Forms & Validation

* Use `react-hook-form` + `zodResolver`.
* Show error text under fields; disable submit while pending.
* Announce form errors to screen readers (e.g., `aria-live="polite"`).

---

## 7) Motion & Micro‑Interactions

* Prefer subtle CSS keyframes for enters (`animate-fade-in-up`).
* Respect `prefers-reduced-motion`: reduce/disable heavy motion.
* Keep durations 150–400ms; avoid bouncey easing for core UI.

---

## 8) Responsiveness & Layout

* **Mobile-first**; ensure primary actions are reachable with thumb.
* Use Tailwind breakpoints (`sm`, `md`, `lg`) and container utilities (`container`, `container-tight`).
* Grids for content groups; avoid deeply nested flex chains.

---

## 9) Testing & QA

* **Lint/Types:** `npm run lint` & `tsc --noEmit` clean.
* **E2E:** Add/maintain a minimal Playwright **smoke test** for any new route (loads, main heading visible, key interactive works).
* **Accessibility pass:**

  * No obvious contrast failures with tokens.
  * Tab order sane; focus ring visible.
  * No role conflicts or missing labels for form inputs/buttons.
* **Browser QA checklist:**

  * No console errors/warnings.
  * Light/Dark mode fine.
  * iPhone 13 / Pixel 6 viewport sanity check.

---

## 10) Performance

* Prefer server components for static/SSR content.
* Lazy-load heavy client components.
* Use `next/image` for images; specify width/height; avoid layout shift.
* Avoid re-render loops; memoize expensive child components sparingly.

---

## 11) Files, Imports & Naming

* Import aliases via `'`' (see below for file content) for local libs/components.
* Co-locate small component assets (SVGs, test, styles) near the component.
* **Naming:** `SectionHeader`, `FeatureCard`, `PricingTable`, `SiteNav`, `SiteFooter`.

---

## 12) Git & Commits

* Use **Conventional Commits**.

  * `feat(ui): add FeatureCard with cva variants`
  * `fix(a11y): ensure focus trap in Dialog`
  * `chore(tokens): adjust primary hue and ring`
* When UI changes are visible: include **before/after screenshots** in the PR description.

---

## 13) Cline Workflow Rules (Important)

1. **Plan first.** Summarize current UI, tokens, and components. Propose a sectioned plan (hero, features, testimonials, etc.).
2. **Diff edits only.** Use targeted `replace_in_file`/`create_file`; avoid unrelated refactors.
3. **Respect tokens.** If something needs a new color/space, propose a new token, do not inline hex/pixels.
4. **Run & verify.** After edits, `npm run dev`; open the route in a browser; confirm no console errors and responsive behavior.
5. **A11y guardrails.** Ensure keyboard/focus and labels. If not feasible, flag with a TODO and rationale.
6. **Minimal deps.** Use existing stack first; adding a library requires a justification comment in the PR.
7. **Output summary.** List changed files, screenshots to capture, and follow-up tickets if scope grew.

---

## 14) Pull Request Checklist

* [ ] All tasks implemented per plan; no console errors.
* [ ] Lint/TypeScript clean.
* [ ] Light/Dark OK; mobile OK.
* [ ] Tokens respected; no ad-hoc colors/sizes.
* [ ] Basic Playwright smoke test added/updated.
* [ ] Screenshots added (before/after).
* [ ] Clear notes on any deviations or future work.

---

## 15) Allowed/Preferred Packages

* `tailwindcss`, `tailwind-merge`, `class-variance-authority`
* `lucide-react`
* `react-hook-form`, `zod`
* `zustand`
* `framer-motion` (only when justified)

**Avoid unless approved:** component libraries that duplicate shadcn/ui, heavy CSS-in-JS, animation libraries overlapping framer-motion.

---

## 16) Examples

**Using tokens correctly**

```tsx
<button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 shadow-soft">
  Click me
</button>
```

**Variant with cva**

```ts
import { cva } from "class-variance-authority"
export const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
  {
    variants: {
      intent: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-500 text-black",
      },
    },
    defaultVariants: { intent: "default" },
  }
)
```

---

## 17) Notes & Future

* If we introduce typography/spacing scales, add them to tokens & Tailwind theme.
* Consider a small design‑token README explaining each variable’s purpose.
* Centralize complex patterns (e.g., pricing tables, testimonial cards) under `components/marketing/*` for reuse.
