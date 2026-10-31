## Rules

- **R9** — **Style through the design system** — Components take colour, type, radius, spacing, elevation and sizing (control sizes, touch targets via `theme.tokens.density`) from the theme (palette paths, `theme.tokens`, `fontFamily: "fontFamilyMono"`), never raw hex/rgb values, font-family stacks or hard-coded control sizes; add a missing value as a token in `designSystem/` (dark and light, desktop and touch) and reference it, and when a theme default doesn't fit a platform, change the token or density in `designSystem/` rather than overriding individual components
