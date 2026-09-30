# About, Corporate Strategy and FAQ

Run `npm run dev` and open `/about.html`, `/corporate-strategy.html` or `/faq.html`. The complete static pages are already in `dist/` and need no build step to preview or deploy.

## Content and layout

- About includes the company introduction, six values, four animated statistics, company overview, certifications, leadership, purpose, and intrinsic/extrinsic quality factors.
- Corporate Strategy includes infrastructure, production capacity, technology, warehousing/distribution, all three CSR areas, and partnership opportunities. Its desktop section index follows the reader's current section.
- FAQ includes the four original questions, expandable answers, and the contact CTA. The first answer opens initially. Links such as `/faq.html#rice-storage` open the matching answer.
- All pages use the existing local fonts, ivory/mint palette, shared footer, and optimized local images. Asset origins are recorded in `dist/assets/company/sources.json`.

Copy is in `content/about-main.html`, `content/corporate-strategy-main.html`, and `content/faq-main.html`. Run `npm run build:company` after editing those files. `npm run build:pages` rebuilds Process and Blog too. Both builders preserve the shared About navigation through `scripts/site-navigation.mjs`.

The About link remains a direct link to the overview. Its separate chevron opens Corporate Strategy and FAQ, on every page. Desktop supports pointer hover and keyboard/touch activation; mobile uses an expandable submenu. Escape closes a submenu before the main mobile menu and restores focus. Navigation and native FAQ disclosures remain usable without JavaScript.

## Motion

`dist/company.css` provides hero entrances, image reveals, hover effects, grain movement, and decorative animations. `dist/company.js` animates statistics once when visible, animates FAQ height changes, handles direct FAQ links, and follows the strategy sections. `site-pages.js` supplies scroll reveals, reading progress, the animation pause control, and newsletter email drafts.

The pause preference persists between these pages, Process, and Blog. System reduced-motion preferences stop the animations and expose all content immediately. FAQ answers remain at their natural height after animation, resize, or repeated clicks. No scrolling is intercepted.

## Editorial notes

The supplied About and Corporate Strategy content lists different delivery fleets (180 and 345 respectively). Those supplied figures remain in their respective pages; they have not been silently reconciled.

FAQ wording corrects the claim that brown rice retains its inedible husk and avoids the source site's prescriptive diet claims. Brown rice retains the bran and germ; see [Health Canada whole-grain guidance](https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations/eat-variety/eat-whole-grains.html). The original hidden answer suggested keeping cooked rice in the fridge for a week or longer. The replacement follows [Food Standards Agency rice guidance](https://www.food.gov.uk/safety-hygiene/home-food-fact-checker#rice): cool promptly, refrigerate, use within 24 hours, and reheat once. That guidance is also linked within the answer.

The newsletter retains the existing email-draft workflow. It does not claim a server subscription has occurred.

## Verification

`npm run check` checks every site script and page builder. Browser checks and screenshots are saved locally under `.preview/company-*`. Verification covers responsive widths from 320 to 1920 pixels, image loading, page navigation, keyboard menus, FAQ expansion and rapid toggles, direct FAQ links, animation pause persistence, reduced motion, and operation without JavaScript.
