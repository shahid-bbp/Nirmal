# Products page

Run `npm run dev` and visit **http://localhost:4173/products.html**. The finished page is static and ready to serve from `dist/`.

## Catalog

The catalog contains 111 products in eight categories, using the supplied reference and original [Keerthi Nirmal product catalog](https://keerthiagro.com/product):

| Category | Products |
| --- | ---: |
| Rice | 22 |
| Cooking Oils | 11 |
| Breakfast Products | 9 |
| Kitchen Essentials | 13 |
| Pulses | 12 |
| Pickles | 11 |
| Snacks | 20 |
| Spices | 13 |

`dist/data/products.json` holds product names, descriptions, categories, normal images and character images. The 239 local WebP assets total approximately 6 MB; they are lazy-loaded, with alternate views prepared near the viewport. Original asset URLs are recorded in `dist/assets/products/sources.json`. The Kranthi Rice hover artwork is the exact original corresponding to the user's orange-pack example.

## Interaction

- Hover over a product card to reveal its original character artwork, with a gentle lift and crossfade. The hero packs support the same effect. Tap the pack on touch screens, or use Enter/Space on the pack button, to toggle and retain the character view.
- Filter by category and search product names/descriptions. Search works across all matching products, including unloaded batches. An empty result has a reset action.
- The first 12 matching products appear initially. Scrolling near the end reveals the next batch. Turn off **Load on scroll** to use **Load more products** manually. A progress indicator and count show how much remains. Manual loading focuses the first newly revealed product; automatic loading leaves focus alone.
- **View details** opens a native modal dialog with product artwork, description and an email enquiry link. Escape and the close button dismiss it and restore focus. Product enquiries prepare an email; they do not submit an order.
- Category, search and loaded-count state are reflected in the URL. Browser back restores filters. Examples: `/products.html?category=rice&shown=22`, `/products.html?q=Kranthi`, `/products.html?product=kranthi-rice`.
- Existing `/products.html#rice` and `#essentials` links still work, as do original `#rice-section`-style category anchors when JavaScript is enabled.
- Without JavaScript, all 111 products remain readable, category links jump to their sections, and email enquiry links work.
- The shared animation control and system reduced-motion preference suppress animation while keeping product previews usable.

## Editing and building

Edit product content in `dist/data/products.json`. The page shell, hero, cards and modal are assembled by `scripts/build-products-page.mjs`.

```sh
npm run build:products
npm run check
```

`npm run build:pages` also rebuilds Products along with the other generated pages. Navigation and the About submenu are retained through the shared navigation helper.

## Verification

56 browser checks passed across 320–1920px widths. They cover the complete catalog, normal/hover asset decoding, category filters, multiword search, empty/reset states, automatic and manual pagination, URL/history behavior, desktop hover, real touch events, keyboard previews, modal opening/closing and focus restoration, reduced motion, paused animations, existing navigation and the no-JavaScript fallback. Browser checks and screenshots are saved in `.preview/products-*`; the verification script is `.preview/verify-products.mjs`.
