import { readFile, writeFile } from 'node:fs/promises';
import { withNavigation } from './site-navigation.mjs';

// Static page assembly only: all page content and article cards ship as readable HTML.
const contact = await readFile(new URL('../dist/contact.html', import.meta.url), 'utf8');
const root = new URL('../dist/', import.meta.url);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const articles = JSON.parse(await readFile(new URL('data/articles.json', root), 'utf8'));
for (const article of articles) {
  article.externalUrl = article.url;
  article.url = `blog-detail.html?id=${article.id}`;
}
const header = active => withNavigation(contact.match(/  <div class="quality-strip"[\s\S]*?<\/header>/)[0],active)
  .replaceAll(' aria-current="page"','')
  .replaceAll('href="index.html#process"', 'href="process.html"')
  .replaceAll('href="https://keerthiagro.com/Blog"', 'href="blog.html"')
  .replaceAll('href="process.html"', `href="process.html"${active==='process'?' aria-current="page"':''}`)
  .replaceAll('href="blog.html"', `href="blog.html"${active==='blog'?' aria-current="page"':''}`)
  .replaceAll('>Journal</a>', '>Blogs</a>');
const footer = contact.match(/  <footer class="site-footer contact-footer">[\s\S]*?<\/footer>/)[0]
  .replaceAll('href="https://keerthiagro.com/Blog"','href="blog.html"');
const icons = `<svg class="page-symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6"/></symbol>
<symbol id="icon-leaf" viewBox="0 0 24 24"><path d="M5 20C-1 8 10 3 21 3c0 11-5 21-16 17Zm0 0L17 7M10 15l-1-5m5 1 4 1"/></symbol>
<symbol id="icon-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></symbol>
<symbol id="icon-bookmark" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"/></symbol>
<symbol id="icon-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
<symbol id="icon-droplet" viewBox="0 0 24 24"><path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/></symbol>
<symbol id="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></symbol>
<symbol id="icon-steam" viewBox="0 0 24 24"><path d="M5 20h14M6 16c-6-6 6-7 0-13m6 13c-6-6 6-7 0-13m6 13c-6-6 6-7 0-13"/></symbol>
<symbol id="icon-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></symbol>
</defs></svg>`;
const shell = (page,title,description,content) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f8f7ef"><meta name="description" content="${escape(description)}"><title>${escape(title)} | Keerthi Nirmal</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="site-pages.css"><link rel="stylesheet" href="${page}.css"><script src="story.js" defer></script><script src="site-pages.js" defer></script><script src="${page}.js" defer></script></head>
<body class="editorial-page ${page}-page" id="top"><a class="skip-link" href="#content">Skip to content</a>${icons}${header(page)}<main id="content">${content}</main>${footer}<div class="page-controls" hidden><button class="page-motion-toggle" type="button" aria-label="Pause animation" aria-pressed="false">Ⅱ</button><a href="#top" aria-label="Back to top">↑</a></div></body></html>\n`;
const detailShell = (title,description,content) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f8f7ef"><meta name="description" content="${escape(description)}"><title>${escape(title)} | Keerthi Nirmal</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="site-pages.css"><link rel="stylesheet" href="blog-detail.css"><script src="story.js" defer></script><script src="site-pages.js" defer></script><script src="blog-detail.js" defer></script></head>
<body class="editorial-page blog-detail-page" id="top"><a class="skip-link" href="#content">Skip to content</a>${icons}${header('blog')}<main id="content">${content}</main>${footer}<div class="page-controls"><a href="#top" aria-label="Back to top">↑</a></div></body></html>\n`;
const arrow = '<svg aria-hidden="true"><use href="#icon-arrow"/></svg>';
const bookmark = '<svg aria-hidden="true"><use href="#icon-bookmark"/></svg>';
const card = a => `<article class="article-card" data-id="${a.id}" data-category="${escape(a.category)}" data-date="${a.date}"><a class="article-cover" href="${a.url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${a.image}" alt="" width="640" height="337" loading="lazy"></a><button class="save-article" type="button" data-save="${a.id}" aria-label="Save story: ${escape(a.title)}" aria-pressed="false" hidden>${bookmark}</button><div class="article-copy"><div class="article-meta"><span>${escape(a.category)}</span><time datetime="${a.date}">${new Date(a.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}</time></div><h3><a href="${a.url}" target="_blank" rel="noopener noreferrer">${escape(a.title)}</a></h3><p>${escape(a.description)}</p><a class="article-read" href="${a.url}" target="_blank" rel="noopener noreferrer">Read story <span aria-hidden="true">↗</span><span class="visually-hidden">: ${escape(a.title)} (opens in a new tab)</span></a></div></article>`;
const categories = ['Matta Rice','Coconut Oil','Jaggery','Salt','Rice Knowledge','Kaima Rice','Rice Brand','Biryani Rice','Jaya Rice','Nature','Sugar'];
const featured = articles[0];
const blog = `
<section class="journal-hero page-container">
  <div class="journal-intro"><nav class="page-breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span aria-current="page">Blogs</span></nav><p class="page-eyebrow"><span aria-hidden="true">✳</span> THE KEERTHI NIRMAL JOURNAL</p><h1>Stories from<br><em>the fields.</em></h1><p class="journal-lead">Thoughtful reads on rice, nutrition, healthy living, Kerala traditions and sustainable farming.</p><a class="page-text-link" href="#articles">Find your next good read ${arrow}</a><div class="journal-edition"><span>FOOD. FIELDS. FAMILIAR THINGS.</span><span>EST. 1998</span></div></div>
  <article class="journal-feature"><div class="feature-topline"><span class="feature-dot" aria-hidden="true"></span> FRESH FROM THE JOURNAL <span>01 / 75</span></div><a href="${featured.url}" target="_blank" rel="noopener noreferrer" class="feature-image"><img src="${featured.image}" width="1200" height="631" alt="Keerthi Nirmal Kaima rice with a traditional Kerala meal" fetchpriority="high"><span class="feature-open" aria-hidden="true">↗</span></a><div class="feature-meta"><span>${escape(featured.category)}</span><time datetime="${featured.date}">25 September 2026</time></div><h2><a href="${featured.url}" target="_blank" rel="noopener noreferrer">${escape(featured.title)}</a></h2><span class="feature-corner" aria-hidden="true">✳</span></article>
</section>
<section class="journal-library page-container" id="articles" aria-labelledby="articles-title">
  <div class="library-heading"><div><p class="page-eyebrow">A LITTLE KNOWLEDGE. EVERYDAY GOODNESS.</p><h2 id="articles-title">Latest <span>articles.</span></h2></div><p>From our fields to your kitchen.<br>There's always a little more to discover.</p></div>
  <div class="journal-toolbar" data-blog-controls hidden><form class="article-search" role="search"><label class="visually-hidden" for="article-search">Search articles</label><svg aria-hidden="true"><use href="#icon-search"/></svg><input id="article-search" type="search" name="q" placeholder="What would you like to read about?" autocomplete="off" maxlength="120"><button class="clear-search" type="button" aria-label="Clear search" hidden>×</button><button class="search-submit" type="submit">Search ${arrow}</button></form><div class="journal-sort"><label for="article-sort">Sort by</label><select id="article-sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></div><button class="saved-filter" type="button" aria-pressed="false">${bookmark}<span>Saved</span><span class="saved-count">0</span></button></div>
  <div class="library-layout"><aside class="journal-categories" aria-label="Article categories" data-blog-controls hidden><h3>Explore by category</h3><div class="category-listing"><button type="button" data-category="all" aria-pressed="true"><span>All stories</span><small>${articles.length}</small></button>${categories.map(c=>`<button type="button" data-category="${escape(c)}" aria-pressed="false"><span>${escape(c)}</span><small>${articles.filter(a=>a.category===c).length}</small></button>`).join('')}</div><div class="journal-side-note"><svg aria-hidden="true"><use href="#icon-leaf"/></svg><p>Goodness goes<br>beyond the grain.</p><a href="process.html">See our process ↗</a></div></aside>
  <div class="article-results"><div class="results-topline"><p id="article-status" role="status" aria-live="polite">75 stories to explore</p><span class="results-decoration" aria-hidden="true">✳</span></div><div class="article-grid" id="article-grid">${articles.map(card).join('\n')}</div><div class="article-empty" hidden><svg aria-hidden="true"><use href="#icon-search"/></svg><h3>No stories found.</h3><p>Try another search or explore a different category.</p><button class="page-button reset-filters" type="button">Show all stories ${arrow}</button></div><nav class="article-pagination" aria-label="Article pages" hidden></nav><noscript><p class="journal-noscript">All 75 articles are listed above. Each story opens in the official Keerthi Nirmal journal.</p></noscript></div></div>
</section>
<section class="journal-subscribe page-container page-reveal"><span class="subscribe-star" aria-hidden="true">✳</span><div><p class="page-eyebrow">KEEP A LITTLE GOODNESS CLOSE</p><h2>Fresh stories.<br><span>Familiar goodness.</span></h2><p>Get updates on new products, stories, recipes, offers and more.</p></div><form class="newsletter-form"><label for="journal-email">A little reading, delivered to your inbox.</label><div class="newsletter-inline"><input id="journal-email" name="email" type="email" autocomplete="email" placeholder="Your email address" required maxlength="180"><button type="submit" disabled>Subscribe ${arrow}</button></div><p class="newsletter-hint">Prepare a subscription request in your email app.</p><p class="newsletter-result" role="status" hidden>Your request is ready. <a href="mailto:care@keerthinirmal.com">Open email draft ↗</a></p><noscript><a href="mailto:care@keerthinirmal.com?subject=Newsletter%20subscription">Email us to subscribe ↗</a></noscript></form></section><p class="bookmark-status visually-hidden" role="status" aria-live="polite"></p>`;
await writeFile(new URL('blog.html',root),withNavigation(shell('blog','Blogs — Stories From the Fields','Explore the Keerthi Nirmal journal: rice, nutrition, cooking, Kerala traditions and sustainable farming. Search, filter and save your favourite stories.',blog.replaceAll('<br>',' <br>')),'blog'));

const featuredDate = new Date(featured.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const detailContent = `<article class="article-detail page-container" aria-labelledby="detail-title">
  <a class="detail-back" href="blog.html">← Back to articles</a>
  <header class="detail-heading"><span class="detail-category" data-detail-category>${escape(featured.category)}</span><h1 id="detail-title" data-detail-title>${escape(featured.title)}</h1><time data-detail-date datetime="${featured.date}">${featuredDate}</time></header>
  <figure class="detail-image"><img data-detail-image src="${featured.image}" width="1200" height="631" alt="${escape(featured.title)}" fetchpriority="high"></figure>
  <p class="detail-intro" data-detail-description>${escape(featured.description)}</p>
  <div class="detail-body" id="detail-body"><p>${escape(featured.description)}</p></div>
  <a class="detail-source" data-detail-source href="${featured.externalUrl}" target="_blank" rel="noopener noreferrer">Read the full story <span aria-hidden="true">↗</span></a>
  <section class="detail-related" aria-labelledby="related-title"><div class="detail-related-heading"><p class="page-eyebrow">A LITTLE MORE TO DISCOVER</p><h2 id="related-title">Related articles</h2></div><div class="detail-related-grid" id="detail-related-grid"></div></section>
</article>
<script type="application/json" id="blog-article-data">${JSON.stringify(articles).replaceAll('<','\\u003c')}</script>`;
await writeFile(new URL('blog-detail.html',root),withNavigation(detailShell(featured.title,featured.description,detailContent),'blog'));

const process = await readFile(new URL('../content/process-main.html',import.meta.url),'utf8');
await writeFile(new URL('process.html',root),withNavigation(shell('process','Our Process — From Field to Plate','Follow the Keerthi Nirmal rice processing journey, from paddy sourcing and milling to parboiling, quality control and responsible production.',process),'process'));
console.log(`Built process.html and blog.html with ${articles.length} articles.`);
