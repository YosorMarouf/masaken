# Asset manifest

## Generated illustrative images

Generated with the built-in ImageGen tool. Each is a replaceable supporting visual and not a depiction of completed project buildings or the project site.

- `assets/hero-land.jpg` — wide late-afternoon aerial of undeveloped western Saudi desert terrain, no parcel boundaries, buildings, roads, text, or logos. Used as the temporary hero video's poster/fallback.
- `assets/residential-family.jpg` — candid Saudi family moment near a window in a warm contemporary home, no logos or text. Illustrative residential opportunity image.
- `assets/commercial-street.jpg` — understated low-rise Saudi commercial streetscape with stone, shade, and palm planting, no brands, signage, or text. Illustrative commercial opportunity image.
- `assets/material-detail.jpg` — close view of warm limestone and a geometric screen casting soft shadows. Illustrative architectural material image; it is not from the project.
- `assets/final-landscape.jpg` — wide twilight desert landscape used for the final CTA; illustrative, not the project site.

## Supplied project material

- `assets/project-aerial-reference.jpg` — aerial reference rendered from `جميع القطع.pdf`, including the source's marked project areas.
- `assets/official-masterplan-reference.jpg` — plan page rendered from `مخطط.pdf`. Displayed as a non-interactive reference; cadastral polygon matching is pending verification.
- `assets/developer-logo.jpg` — crop of the official developer logo from the supplied project brochure.
- `assets/developer-logo-transparent.png` — same logo crop with the surrounding background made transparent for the redesigned developer identity block.
- `assets/hero-temporary.mp4` — temporary video supplied by the user on 2026-11-10. It uses muted autoplay, loop, inline playback, and the generated land image as poster/fallback; reduced-motion settings suppress playback.

## Source data

`data/parcels.js` contains the 47 rows transcribed from the brochure table. Each record retains the source row and official parcel number as separate fields. Area, per-square-meter valuation, and estimated total are validated against the brochure totals.
