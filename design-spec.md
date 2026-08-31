# Design spec — swipe-deck chrome (SessionChrome)

Extracted 2026-08-31 from `Screenshot 2026-08-28 at 4.08.27 PM.png` by pixel
measurement (bezel-to-bezel screen interior = 518px ↔ 390pt, scale 1.328px/pt).
Font sizes derived by comparing measured glyph-band heights against the app's
own rendered bands (band ≈ 0.78 × fontSize for our fonts).

| Element | Mock (measured) | Was | Now |
|---|---|---|---|
| Wordmark | band 26.4pt → ~33pt font | 26pt | 33pt |
| "Session N of N" | band 15.8pt → ~20pt, near-black | 15pt `body` #6B6A68 | 20pt `ink` |
| Progress track | 12.8pt tall, `#DDD3C6` | 9pt `#E8DFCB` (surfaceTinted) | 13pt `#DDD3C6` |
| Progress fill | `#7B8570` (avg over 414px) | `sage` #8BA087 | `#7B8570` |
| "Reclaimed Time" | band 13.6pt → ~18pt, near-black | 13pt `muted` #9A9894 | 18pt `ink` |
| Pager dots | 11.3pt Ø, ~11pt gap | 8pt Ø, 7pt gap | 11pt Ø, 11pt gap |
| Inactive dot | `#C8BFAF` | `hairline` #CFC9BA | keep `hairline` (Δ negligible) |
| Active dot | `#855A42` (1px sample, shading-contaminated) (verify) | `clayDeep` #A8664C | keep `clayDeep` (verify) |
| Chevrons | glyph 24.8pt → Ionicons size ~40 | size 26 | size 40 |
| Gap wordmark→session | 31.6pt | ~18.5pt | marginTop 7→16 (then re-measure) |
| Gap session→bar | 13.5pt | ~13.5pt | keep |
| Gap bar→reclaimed | 12pt | ~10pt | marginTop 7→10 |
| Gap reclaimed→pager | 23pt | ~19.5pt | marginTop 12→16 |

Notes:
- Mock text samples to pure black; we keep the `ink` token (#2D2C2A) for
  palette consistency — flagged, not a silent substitution.
- Dot count (4 vs 5) and fill % are data-driven, not spec.
- Mock page bg samples `#F5EEE3` vs our `#F1EADC` — page/card/rail colors are
  the approved palette, out of scope for this chrome pass.
- Card-side values (stage card, StageFooter) were matched in commit `cc948e7`.
