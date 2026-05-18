---
name: new-section
description: Scaffold a new Strapi section component with full frontend support (schema, types, React component, wiring)
---

Create a new section component called "$ARGUMENTS" for this website scaffold. If the name alone doesn't make the purpose obvious, ask what fields/content this section should display before generating code.

## Files to create/modify (in order)

All sections follow the same patterns. Read the reference files below to match conventions exactly.

### 1. Strapi component schema

Create `apps/cms/src/components/sections/<kebab-name>.json`.

Every section MUST include these shared base attributes after the section-specific ones:

```json
"showInHeader": { "type": "boolean", "default": true },
"navLabel": { "type": "string" },
"anchorId": { "type": "string" },
"alignment": { "type": "enumeration", "enum": ["left", "center", "right"], "default": "left" },
"maxWidth": { "type": "enumeration", "enum": ["sm", "md", "lg", "full"], "default": "lg" },
"spacing": { "type": "enumeration", "enum": ["compact", "normal", "large"], "default": "normal" }
```

If the section has repeatable sub-items (like FAQ has faq-item), create a separate component file for the sub-item at `apps/cms/src/components/sections/<name>-item.json`.

Use `shared.link` component for any action/button fields (it already exists).

Reference exemplars:
- Simple section: @apps/cms/src/components/sections/cta.json
- Section with sub-items: @apps/cms/src/components/sections/faq.json and @apps/cms/src/components/sections/faq-item.json
- Section with media: @apps/cms/src/components/sections/gallery.json

### 2. Register in page dynamic zone

Add `"sections.<kebab-name>"` to the `components` array in `apps/cms/src/api/page/content-types/page/schema.json`.

### 3. TypeScript types in contracts

In `packages/contracts/src/site.ts`:
- Add a new interface extending `SectionBase` with `__component: "sections.<kebab-name>"`
- Add it to the `Section` union type

If you created sub-item types, add interfaces for those too.

### 4. Zod validation schema in contracts

In `packages/contracts/src/sections.ts`:
- Add a new schema using `sectionBaseSchema.extend({...})`
- Add it to the `sectionSchema` discriminated union array

### 5. Populate map

In `apps/web/lib/strapi.ts`, add an entry inside `pageSectionsPopulate.sections.on`:

```js
"sections.<kebab-name>": {
  populate: { /* nested relations/components/media here, or "*" if flat */ }
}
```

### 6. Normalization (if section has nested data)

If the section has sub-item arrays, relations, media fields, or action links, add a handler in the `normalizeSection` function in `apps/web/lib/strapi.ts`.

MUST use the existing helpers:
- `unwrapEntry` / `unwrapMany` for Strapi's wrapped response shapes
- `unwrapRelation` for relation fields
- `normalizeActionLink` for shared.link components
- `toAbsoluteMediaUrl` for media URLs

Reference: look at how `sections.faq`, `sections.gallery`, and `sections.hero` are handled in `normalizeSection`.

### 7. CSS styles

Add styles to `apps/web/app/globals.css`. This is REQUIRED — components without CSS render as unstyled plain text.

Read `apps/web/app/globals.css` before writing styles. Follow the established patterns:
- Use CSS custom properties for all colors (`--color-surface`, `--color-border`, `--color-muted`, `--color-primary`, `--color-text`), spacing (`--space-gap`), radii (`--radius-medium`, `--radius-large`), and shadows (`--shadow-card`, `--shadow-elevated`).
- Card-style elements: white background (`var(--color-surface)`), subtle border, `var(--radius-medium)` border-radius, `var(--shadow-card)` shadow, hover lift with `var(--shadow-elevated)`.
- Grid layouts: use `display: grid` with `gap: var(--space-gap)`, `margin-top: 1.4rem`.
- Body text color: `var(--color-muted)`. Headings use default `var(--color-text)`.
- Add responsive overrides at the `@media (max-width: 960px)` and `@media (max-width: 680px)` breakpoints (collapse grid columns, etc.).

Insert new section styles BEFORE `.unknown-section` in the file.

Study these existing exemplars in globals.css before writing:
- `.feature-grid` / `.feature-card` — grid of styled cards with hover
- `.faq-list` / `.faq-item` — vertical list of bordered items
- `.gallery-grid` / `.gallery-item` — image grid with aspect ratio and hover zoom
- `.cta-shell` — gradient background, rounded, elevated card

Design intent: each section should look polished, visually distinct, and production-ready. Items should be contained in cards or visually grouped — never rendered as bare unstyled text. Use proper spacing between all sub-elements (quote vs. attribution, icon vs. text, etc.).

### 8. React component

Create `apps/web/components/sections/<PascalName>Section.tsx`.

Pattern to follow:
- Import section type from `@scaffold/contracts`
- Import `sectionClassName` and `sectionContainerClassName` from `@/lib/presentation`
- Props: `{ section: <Type>, anchorId: string }`
- Use `<section id={anchorId} className={sectionClassName(section)}>` as outer element
- Use `<div className={sectionContainerClassName(section)}>` as container
- Only show the navLabel kicker when `section.navLabel` is set (never hardcode fallback text)
- Never hardcode any user-facing text; all content comes from Strapi fields
- Use the CSS class names defined in step 7 — every element that needs styling must have a class

Reference: @apps/web/components/sections/CtaSection.tsx

### 9. Wire into SectionRenderer

Add a case in `apps/web/components/SectionRenderer.tsx` for `"sections.<kebab-name>"`.

Reference: @apps/web/components/SectionRenderer.tsx

## Rules

- All user-facing text must come from Strapi fields. No hardcoded content or fallback strings.
- CMS is plain JS (CommonJS). Do not add TypeScript to `apps/cms`.
- Always use `unwrap*` helpers when accessing Strapi data. Bypassing them causes silent breakage.
- Run `pnpm typecheck` after all changes to verify.
