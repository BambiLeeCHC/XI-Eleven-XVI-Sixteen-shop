# True North Aesthetic

Direction taken from the **True North by XI XVI** tarot deck (print edition) and the three heirloom card backs.

## Core palette

| Role | Token | Value | Notes |
|------|-------|-------|-------|
| Void / field | `--tn-navy` | `#0a1424` | Deep navy of the card frames |
| Surface glass | `--tn-surface` | `rgba(10, 20, 36, 0.78)` | Translucent navy glass |
| Cream type | `--cream` | `#F7F0E6` | Existing brand cream |
| Gold accent | `--tn-gold` | `#C9A84C` | Crests, active states, filigree |
| Gold soft | `--tn-gold-soft` | `#E8D5A3` | Hover / secondary glow |
| Pearl border | `--tn-pearl` | `rgba(247, 240, 230, 0.22)` | Hairline frames |

## Principles (from the deck)

1. **Card as unit** — every major panel should feel like a tarot card: arched gold frame, clear hierarchy, breathing room.
2. **Gold is signal** — use gold only for active states, crests, and primary CTAs. Never as large fills.
3. **Navy is structure** — backgrounds and glass sit in deep navy, never flat black.
4. **Cream is voice** — all primary reading text stays cream for maximum readability on navy.
5. **Simplify the path** — fewer competing accents, larger touch targets, clearer section titles, less visual noise.
6. **Heirloom backs as surface language** — Celestial Baroque, Pearl Filigree, and Stained Glass inform empty states, panel treatments, and decorative restraint.

## Signature move: Foil Flash

The single interaction that should feel special every time a card is revealed (solo draw, tandem, feed post).

- Short, sharp foil shimmer + light refraction across the card face (~850ms).
- Implemented on `.tarot-plate.is-foil-flash`.
- Respects `prefers-reduced-motion`.
- Keep it restrained. One clean signature, not constant sparkle.

## Brand mark: XI XVI Crest

- Gold shield with XI / XVI stacked (matches every card in the print deck).
- Replaces the previous compass rose icon.
- Used in the North Room header and as the recurring crest on card plates.

## Photo → Deck Character

Users can upload a photo and have it rendered as a character in the same style family as the house deck (fashion-forward figures, XI XVI crest language, navy + gold frame).

- Entry point: Avatar Studio → **Photo → Deck**
- Pipeline already exists (`/api/avatar` + canvas fallback); copy and framing now treat it as becoming a True North card rather than a generic cartoon.

## Layout goals

- Generous vertical rhythm (1–1.25rem gaps between cards).
- Sticky sub-nav that stays legible on mobile.
- Primary actions always full-width on small screens, auto-width on desktop.
- No decorative clutter that competes with the reading content.

## What changed in this pass

- Removed generic compass icon → deck-faithful XI XVI crest.
- Cards now use arched gold frames + top crest badge matching the print deck.
- Active / selected states fully on gold (`#C9A84C`).
- Surfaces lean on heirloom-back navy + gold language.
- Avatar Studio reframed as “Become a True North Card” / Photo → Deck.
- Foil Flash remains the signature reveal.
