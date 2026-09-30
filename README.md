# Keerthi Nirmal — The grain story

A responsive, scroll-driven rice brand website inspired by the supplied reference: warm ivory, oversized mint typography, a lime quality strip, and one grain that travels from the introduction through sourcing and processing into a rice pack.

## Preview

With Node.js 18 or later:

```sh
npm run dev
```

Open **http://localhost:4173**. There are no dependencies to install and no build step. `npm start` runs the same local server. Set `PORT` to change the port.

Alternatively, serve `dist/` with any static HTTP server:

```sh
python -m http.server 4173 --directory dist
```

## Files

- `dist/index.html` — homepage, story chapters, products, FAQs, and footer.
- `dist/about.html`, `dist/corporate-strategy.html`, and `dist/faq.html` — responsive company pages, animated statistics and FAQ disclosures, and a shared About submenu. See [ABOUT-PAGES.md](ABOUT-PAGES.md).
- `dist/products.html`, `dist/products.css`, and `dist/products.js` — 111 products, mascot hover/tap previews, category filters, search, scroll pagination, and product details. See [PRODUCTS.md](PRODUCTS.md).
- `dist/our-story.html` — the dedicated 1998–2025 illustrated legacy page; all “Our story” navigation links lead here.
- `dist/our-story.css` and `dist/our-story.js` — responsive road, changing delivery trucks, video playback, motion controls, and year navigation.
- `dist/contact.html`, `dist/contact.css`, and `dist/contact.js` — animated Contact Us page, enquiry topics, validated email drafts, location, partnership CTA, and newsletter requests. See [CONTACT.md](CONTACT.md).
- `dist/styles.css` — colors, typography, responsive layouts, sticky scenes, and reduced-motion presentation.
- `dist/story.js` — grain travel, pack sealing, chapter progress, content reveals, and mobile navigation.
- `dist/assets/` — locally bundled imagery and fonts. Font licenses are included.
- `scripts/serve.mjs` — dependency-free local preview server.
- `dist/process.html` and `dist/blog.html` — animated processing journey and searchable article catalog with category filters, pagination and saved stories. See [PROCESS-AND-BLOG.md](PROCESS-AND-BLOG.md).

## Scroll animation

For the new **Our Story** page, open **http://localhost:4173/our-story.html**. See [OUR-STORY.md](OUR-STORY.md) for its animation, image/GIF assets, and verification details. The homepage grain animation below is separate.

The page uses native scrolling, CSS sticky stages, and a foreground grain with three transparent PNG images prepared from `dist/assets/matta.png`. The closed husk (`matta-origin.png`) appears in the introduction and field scene, the opened husk (`matta-process.png`) in processing, and the peeled grain (`matta-promise.png`) in the packing scene. The original path, rotations, sizes, and pack-sealing timing are preserved. Scroll updates run through `requestAnimationFrame`; transforms and opacity drive the animation. There is no animation library or scroll hijacking.

The grain travels between elements marked `data-stop`. Their actual positions are measured with `getBoundingClientRect()`, so the image aligns with the processing diagram and the pack opening across viewport sizes. Layout measurements are refreshed on resize, layout changes, and font loading.

To tune the journey:

1. Change a target's CSS position and width to adjust where the grain lands and how large it appears.
2. Change `data-progress` (0–1) to choose the arrival point within a section's sticky interval.
3. Change `data-rotation` to adjust its final angle.
4. Change `.story-scene` heights to control chapter duration; mobile has shorter intervals.
5. Adjust the sealing interval in `renderGrain()` in `dist/story.js` if the final pack transition needs different timing.
6. Set `data-grain` on a target to `origin`, `process`, or `promise` to select its artwork. The three images inside `#journey-grain` crossfade with scroll position, so reverse scrolling and direct chapter links stay in sync. Matching static images support reduced motion and JavaScript-free viewing. Image preparation used built-in imagegen; the final prompts and asset paths are saved in [content/matta-images.json](content/matta-images.json).

The last two targets sit inside `.pack-stage`. Keep the open and closed pack images the same dimensions and composition. Recalibrate `.pack-mouth` if approved replacement photography places the opening elsewhere.

Scrolling backwards reverses the journey and reopens the pack. Reduced-motion preferences show static grains, a closed pack, and unpinned chapters. The preference can be changed while the page is open. Core text, images, links, and native FAQ disclosures remain available without JavaScript.

## Customize

- **Colors:** CSS variables at the top of `dist/styles.css`.
- **Logo:** `.brand` markup in each HTML file.
- **Text and links:** the corresponding HTML page.
- **Product imagery:** files in `dist/assets/`; update filenames in the HTML if needed.
- **Footer and navigation:** shared design, repeated explicitly in each static HTML file.
- **Fonts:** `dist/assets/fonts.css` and its local font files.

All displayed assets are local. External links lead to the brand's existing website and journal. This is a presentation website; buying enquiries use the existing brand site.

## Assets

The original grain, field, harvest, mill, meal, and open/closed pack assets were supplied with this project. The generated pack is concept artwork; replace both pack states with approved artwork before a brand launch. Scene images are illustrative. Short Grain Matta and Jaya product images were bundled from the URLs already present in the original site; confirm usage rights before public launch.

Barlow and DM Sans are bundled with their SIL Open Font Licenses.

## Verification and deployment

```sh
npm run check
```

This checks all site scripts for syntax errors. Browser verification covered responsive widths, measured target alignment, reversible scrolling, pack sealing, keyboard-operated FAQs, mobile navigation, reduced motion, loaded images, and horizontal overflow. Page-specific verification is documented in the linked page guides.

Deploy the contents of **`dist/`** to a static host. No environment variables, backend, installation, or build command are required. The local preview server is for development; use your static host for production.
