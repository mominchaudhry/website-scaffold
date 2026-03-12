# Content Model

## Site Config (single type)
- `siteMode`: `SPA` or `MULTI_PAGE`
- `defaultTheme`: relation to Theme
- `homepage`: relation to Page
- `seoDefaultTitle`, `seoDefaultDescription`

## Theme (collection type)
- `name`, `slug`
- `colors`, `typography`, `spacing`, `radius`, `shadow` (components)

## Page (collection type)
- `title`, `slug`
- `showInHeader`, `headerLabel`, `isHome`
- `seoTitle`, `seoDescription`
- `sections` (dynamic zone)

## Section Components
- `sections.hero`
- `sections.feature-grid`
- `sections.rich-text`
- `sections.cta`
- `sections.faq`
- `sections.gallery`

Each section includes:
- content fields
- presentation fields (`alignment`, `maxWidth`, `spacing`)
- nav fields (`showInHeader`, `navLabel`, `anchorId`)

## Header Generation
- `MULTI_PAGE`: header links are derived from published pages with `showInHeader=true`.
- `SPA`: header links are derived from home page sections with `showInHeader=true`.
