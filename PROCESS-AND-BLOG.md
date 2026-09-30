# Process and Blog pages

The two pages follow the site's ivory, mint and forest-green theme, using the supplied screenshots' content and original Keerthi Nirmal imagery.

## Preview

Run `npm run dev`, then open:

- `http://localhost:4173/process.html`
- `http://localhost:4173/blog.html`

Both pages are ready to serve directly from `dist/`. There are no dependencies to install.

## Process

- Six selectable stages with a moving rice grain, previous/next controls and a user-started play/pause walkthrough.
- Arrow keys, Home and End operate the stage tabs. Direct links such as `process.html#stage-quality` select the relevant stage.
- The complete original process diagram opens in a keyboard-accessible modal; Escape closes it and restores focus.
- Technical expertise, laboratory control, milling, parboiling, environmental systems, certifications and FAQ content are retained.
- Parboiling steps and FAQs use native disclosures. All six journey stages remain readable without JavaScript.
- The walkthrough stops when it leaves the viewport. Motion controls and the system's reduced-motion preference disable automatic animation.

## Blog

- The original 75 article records include titles, dates, categories, excerpts and optimized local thumbnails.
- Search covers titles, categories and excerpts across the entire catalog. Category, sort, search and saved-only filters combine, with 12 results per page.
- Search and filter state is reflected in the URL, including browser back/forward navigation.
- Bookmarks persist in this browser using local storage. They are not tied to an account; if storage is unavailable, bookmarks work for the current visit.
- Article links open the corresponding full article in the official Keerthi Nirmal journal. This project contains the listing, not local copies of full articles.
- With JavaScript disabled, all 75 articles remain available as regular links.
- Newsletter forms prepare email subscription requests. They do not claim an email was sent or a subscription was stored; a mailing service can be connected later.

## Editing

- Process content: `content/process-main.html`.
- Blog records: `dist/data/articles.json`.
- Static page assembly: `scripts/build-editorial-pages.mjs`; it also reuses the navigation/footer markup in `dist/contact.html`.
- Page styles and behavior: `dist/process.css`, `dist/process.js`, `dist/blog.css`, `dist/blog.js`.
- Shared styles and behavior: `dist/site-pages.css`, `dist/site-pages.js`.
- Source attribution: `dist/assets/process/sources.json` and `dist/assets/blog/sources.json`.

After editing process content, article records or the page template, run `npm run build:pages` to regenerate both HTML files. CSS/JS edits apply directly without rebuilding. The checked-in HTML is already generated, so this command is optional for deployment.

## Verification

`npm run check` checks syntax for all site scripts. Browser checks cover widths from 320 to 1920 pixels, search across the catalog, every category, sorting, pagination, URL state, bookmarks, stage navigation, playback, modal focus, mobile menus, newsletters, reduced motion and no-JavaScript content. The local verification script and results are in `.preview/verify-editorial.mjs` and `.preview/editorial-check-results.json`.

Deploy the contents of `dist/` to any static host. All displayed imagery and fonts are bundled locally.
