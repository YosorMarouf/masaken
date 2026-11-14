# مساكن الريان — website prototype

Responsive Arabic RTL website for the Masaken Al Rayan land subdivision project. The implementation is a dependency-free static frontend (`index.html`, `css/styles.css`, `css/overrides.css`, `css/redesign.css`, `css/polish.css`, `css/motion.css`, `css/readability.css`, `js/script.js`) so it can be previewed from a local web server or integrated into a future application. The creative direction is “الأرض التي ترسم مستقبلها”: an editorial journey from the source plan, through the project context and a compact land explorer, to inquiry. Motion uses lightweight CSS and IntersectionObserver reveals, with reduced-motion support. Readable Arabic type sizes and an isolated soft-chevron icon system complement the visual language. The hero's copy, layout, contrast, and project facts are refined around the existing temporary video, which remains unchanged.

## Run locally

Open `index.html` in a browser or serve this directory with any static HTTP server. Google Fonts are loaded remotely; the site falls back to system sans-serif fonts when offline.

## Current verified content

- Project in Makkah; residential and commercial subdivision.
- Total area: 34,720.65 m²; 47 parcels.
- 15 commercial parcels and 32 residential / commercial-back parcels.
- Approved estimated total valuation: SAR 77,096,318.90 (not a current sales price).
- Source-table row 03 / official parcel 618: commercial, 620 m², SAR 3,170/m², estimated value SAR 1,965,400.
- The 47-row schedule is available from the explorer drawer, with search, type and numeric filters, sorting, and parcel selection. A chosen parcel carries into the inquiry form.
- The opportunities section uses one image window with a residential / commercial toggle and a corresponding explorer filter.
- A fixed journey indicator tracks scroll progress and names the current chapter.
- Explorer filters show their live result count and can be reset together; a source dialog explains which supplied PDFs support the page's data and where verification is still pending.
- A short FAQ clarifies parcel identifiers, estimated values, map matching, and inquiry behavior.

Source PDFs provided from Downloads were reviewed: `جميع القطع.pdf` supplied the aerial reference; `مشروع مخطط الريان -شركة مجموعة الراجحي إخوان .pdf` supplied the overview, developer logo, contact details, and valuation table; `مخطط.pdf` supplied the masterplan reference. Extracted/optimized image assets are in `assets/`. No parcel availability, coordinates, travel times, licenses, or legal eligibility have been inferred. Parcel boundaries appear only in the original non-interactive source images; no digital polygon mapping has been created.

## Assets

`assets/hero-land.jpg` — generated illustrative desert landscape poster/fallback for the temporary user-supplied hero video; it is not the project site.

`assets/residential-family.jpg` — generated illustrative Saudi family lifestyle scene; not an existing project building.

`assets/commercial-street.jpg` — generated illustrative commercial streetscape; not an existing project building.


`assets/final-landscape.jpg` — generated dusk desert scene for the final CTA, not the project site.

`assets/official-masterplan-reference.jpg` — a raster reference extracted from the supplied plan; it is displayed as a source image and not used as an interactive map.

`assets/developer-logo-transparent.png` — logo crop from the supplied brochure, used in the developer block.

`assets/hero-with-ending-optimized.mp4` — optimized hero video. The generated illustrative land image remains the poster and fallback.

The three illustrative images were generated with the built-in ImageGen workflow. They and the extracted source references were converted to optimized JPEGs for delivery. Images can be replaced at these paths.

## Pending integrations

1. Confirm the 47-row records against the developer's official schedule before publication. Row index and official parcel numbers are stored separately, and aggregates reconcile with the supplied schedule.
2. Map polygons only after an authoritative digital geometry source and parcel-to-polygon matching are confirmed.
3. Add exact project coordinates if supplied and approved for publication.
4. Confirm brochure phone/email against current intended contact details; displayed as provisional brochure information.
5. Connect the contact form to a real backend or email provider; it currently performs client-side validation only and does not send data.
6. Replace the user-provided temporary hero video with final approved footage when available.

## Data integrity

The complete parcel schedule is in `data/parcels.js`. The aggregate verified area and estimated valuation reconcile to the source schedule. The official map is displayed as an unaltered non-interactive reference until mapping can be validated.
