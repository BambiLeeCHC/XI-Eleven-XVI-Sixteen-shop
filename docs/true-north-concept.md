# True North

**Product Concept, Brand Direction & Integration**  
*Version 0.2*

## 1. Overview & Positioning

True North is the community and insight layer of xixvi.shop. It provides a social platform for community connectivity and accessible self-reflection. Core capabilities include user profiles, daily readings that can be shared, and tandem readings with friends, partners, or family. Focus categories are career, love, and money (with a general option).

The product deliberately shifts away from traditional divinatory or esoteric framing toward an enlightenment / higher-self orientation. The experience should feel calm, elevated, modern, and personally empowering rather than ritualistic or opaque.

True North sits alongside the storefront. Chart, almanac, long-read, and journal surfaces under `/chart` and related routes already form part of this layer. The atmosphere component (`TrueNorthAtmosphere`) and existing sky/glyph systems provide the current visual foundation.

## 2. Aesthetic Direction

### Tone
Enlightenment and higher-self awareness. Quiet confidence, clarity, and orientation.

### Avoid
Heavy divinity, ornate mystical symbolism, ritualistic imagery, dense celestial clutter, or anything that feels inaccessible or archaic.

### Visual Language
- Clean geometric forms and restrained luminous accents.
- Palette anchors: soft metallic silver / graphite, cool cyan highlights, muted indigo, cream and pistachio accents on dark fields (consistent with existing True North atmosphere).
- Contemporary, highly legible typography.
- Minimal compositions that emphasize clarity, orientation, and quiet confidence.
- Motion that is subtle, deterministic where possible, and respectful of `prefers-reduced-motion`.

### Overall Impression
Modern, approachable, and grounded in personal insight. The user should feel oriented rather than instructed by an external authority.

## 3. Reimagined Zodiac Symbols

Traditional glyphs are treated as a starting point only. They are redesigned as simplified, modern marks that retain symbolic essence while becoming immediately readable and suitable for profiles, cards, notifications, and tandem share graphics.

### Design Principles
- Reduce each sign to essential geometry or a single refined gesture.
- Maintain a consistent visual family (line weight, corner treatment, optical balance).
- Ensure legibility at small sizes (16–24 px).
- Allow lightweight category emphasis (career / love / money) via secondary accent without altering the core mark.
- Prefer monoline or soft-dimensional execution that works on both light and dark surfaces.

### Conceptual Directions

| Sign         | Concept Description |
|--------------|---------------------|
| **Aries**       | Forward-pointing chevron or ascending arc with clean apex — initiative and direction. |
| **Taurus**      | Stable horizontal base with soft upward curve — steadiness and embodied presence. |
| **Gemini**      | Two parallel verticals joined by a light bridge — duality and communication. |
| **Cancer**      | Soft open crescent or protective spiral — emotional containment and intuition. |
| **Leo**         | Radiating central point with restrained rays — presence and creative expression. |
| **Virgo**       | Precise vertical with refined loop — discernment and practical refinement. |
| **Libra**       | Balanced horizontal beam with subtle fulcrum — equilibrium and relational harmony. |
| **Scorpio**     | Focused upward arrow or controlled vertical curve — intensity and transformation. |
| **Sagittarius** | Open diagonal trajectory referencing a horizon — expansion and higher aim. |
| **Capricorn**   | Structured ascending steps or progressive form — grounded ambition. |
| **Aquarius**    | Flowing parallel waves or interconnected nodes — collective insight and exchange. |
| **Pisces**      | Two soft opposing curves that meet or dissolve — empathy and fluid connection. |

### Implementation Status
- Existing illustrated glyphs live in `src/components/journal/SkyGlyphs.tsx` (traditional line-art treatment used across chart and journal surfaces).
- A parallel modern set for True North contexts is introduced in `src/components/journal/TrueNorthGlyphs.tsx`. This set follows the geometric, higher-self direction above and is intended for progressive adoption in True North UI (profiles, daily cards, tandem views, and selected chart surfaces).

## 4. Core Features

### User Profiles
- Primary visual identifier: reimagined zodiac mark.
- Optional current-focus tag: career / love / money / general.
- Support for sharing a concise “today’s orientation” or daily reading excerpt.

### Daily Readings
- Clean card format.
- Relevant zodiac (or category) mark, short insight text, and share controls.
- Designed for both private reflection and light social sharing.

### Tandem Readings
- Side-by-side or gently overlapping mark treatment that signals connection between participants (friends, partners, family).
- Shared context remains elegant and non-intrusive.

### Category Focuses
- Lightweight secondary indicators (color accent, subtle variant, or label).
- Must not overwhelm the primary symbol system.

### Existing Surfaces to Leverage
- `/chart` (ChartHomePage)
- `/chart/almanac` (AlmanacTNPage)
- `/chart/long-read` (DeepReadingPage)
- `/chart/numbers`
- Journal and long-read flows
- `TrueNorthAtmosphere` for the distinct True North mood
- Natal chart and tarot reading APIs already present in `api/`

## 5. Integration Notes

### Visual System
- `TrueNorthAtmosphere` already establishes the dark-field, pistachio/lilac/cream atmosphere for True North destinations.
- Prefer the new `TrueNorthGlyphs` component for any new True North–specific UI that benefits from the more geometric, accessible marks.
- Retain `SkyGlyphs` for continuity in existing natal-chart and journal contexts until a deliberate migration is planned.

### Technical Touchpoints
- Components: `src/components/journal/TrueNorthAtmosphere.tsx`, `src/components/journal/SkyGlyphs.tsx`, new `TrueNorthGlyphs.tsx`.
- Pages under `src/pages/chart/`.
- APIs: `api/tarot-reading.ts`, `api/deep-tarot-reading.ts`, `api/chart.ts`, `api/_lib/natalChart.ts`.
- Auth and profile surfaces already exist; True North profile enhancements can extend the current `/profile` route or introduce a dedicated True North profile section.

### Recommended Next Engineering Steps
1. Adopt `TrueNorthGlyphs` in selected True North cards and profile identifiers.
2. Define a small set of category accent tokens (career / love / money).
3. Prototype a daily-reading card and a tandem-share layout that reuse the new marks.
4. Document any data-model additions required for shared readings and focus tags (Supabase).
5. Align motion and reduced-motion behavior with the existing atmosphere patterns.

## 6. Version History

- **0.1** — Initial product and brand direction; conceptual reimagining of the twelve signs.
- **0.2** — Expanded feature description, aesthetic system, integration mapping to existing codebase, and introduction of the parallel modern glyph component.

---

*This document is the living source of truth for True North product and brand direction within xixvi.shop.*
