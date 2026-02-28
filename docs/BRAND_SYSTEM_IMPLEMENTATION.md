# Brand System Implementation (MotusDAO v1)

This repository was migrated to the unified MotusDAO brand system defined in:

- `03-manual-identidad-marca-v1.md`
- `04-design-system-operativo.md`
- `06-brand-guardian-prompt.md`

## What changed

- Added shared brand tokens in `app/globals.css`:
  - color, semantic, and neutral tokens
  - gradient, glass, spacing, radius, shadow, and motion tokens
- Refactored Tailwind config to align with operational design system:
  - brand palette
  - approved font families
  - radius/blur/shadow extensions
- Updated global typography and font loading in `app/layout.tsx` using approved fonts:
  - Inter (body)
  - Jura (headings)
  - JetBrains Mono (code)
  - Orbitron (display-ready)
- Introduced reusable UI classes for consistency:
  - `ui-card`, `ui-surface`, `ui-btn`, `ui-btn-primary`, `ui-btn-ghost`, `ui-input`, `ui-nav-item`, `ui-badge`
- Updated shell/navigation and key screens to use tokens/components (no one-off legacy palette)
- Added reduced-motion support to honor accessibility requirements

## How to use tokens/components

- Prefer semantic classes (`ui-card`, `ui-btn-primary`) over hardcoded styles.
- If a new variant is needed, add it in `app/globals.css` under `@layer components`.
- Use design tokens (e.g. `var(--brand-purple)`, `var(--text-secondary)`) instead of inline hex values.
- Keep body text at 16px minimum and touch targets at 44px minimum.

## Guardrails (Brand Guardian aligned)

1. **Color**
   - Primary gradient is `--grad-brand` (`#9333EA → #EC4899`).
   - Do not introduce orange/coral accents.
   - Dark-mode-first backgrounds for app surfaces.

2. **Typography**
   - Only approved families: Inter, Jura, JetBrains Mono, Orbitron.
   - No Playfair Display / Share Tech Mono.

3. **Components**
   - Cards/surfaces use glass treatment and unified radius scale.
   - Primary CTAs use gradient style (`ui-btn-primary`).
   - Inputs use `ui-input` to maintain contrast/focus behavior.

4. **Accessibility**
   - Keep visible focus states.
   - Ensure AA contrast on text and controls.
   - Respect `prefers-reduced-motion`.

5. **Copy/UX fit**
   - Execution-first wording.
   - Clear action labels (verb + noun).
   - Avoid hype/savior language and unverifiable claims.
