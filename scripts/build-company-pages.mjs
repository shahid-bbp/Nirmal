import { readFile, writeFile, readdir } from 'node:fs/promises';
import { withNavigation } from './site-navigation.mjs';

const root = new URL('../dist/', import.meta.url);
const contact = await readFile(new URL('contact.html', root), 'utf8');
const header = contact.match(/  <div class="quality-strip"[\s\S]*?<\/header>/)[0];
const footer = contact.match(/  <footer class="site-footer contact-footer">[\s\S]*?<\/footer>/)[0];
const icons = `<svg class="page-symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6"/></symbol>
<symbol id="icon-leaf" viewBox="0 0 24 24"><path d="M5 20C-1 8 10 3 21 3c0 11-5 21-16 17Zm0 0L17 7M10 15l-1-5m5 1 4 1"/></symbol>
<symbol id="icon-home" viewBox="0 0 24 24"><path d="m2 11 10-8 10 8M5 9v12h14V9M10 21v-7h4v7"/></symbol>
<symbol id="icon-trust" viewBox="0 0 24 24"><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM7 12l3 3 7-7"/></symbol>
<symbol id="icon-growth" viewBox="0 0 24 24"><path d="M3 3v18h18M6 16l5-6 4 3 6-8M16 5h5v5"/></symbol>
<symbol id="icon-people" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v3"/></symbol>
<symbol id="icon-hands" viewBox="0 0 24 24"><path d="m2 9 4-4 5 1 3-1 8 5-4 8-4 3-7-4-5-8Zm4-4 5 5 3-3m-3 3 6 6M7 17l3-3m0 5 3-3m0 5 3-3"/></symbol>
<symbol id="icon-grain" viewBox="0 0 24 24"><path d="M6 22 17 2M9 17C0 17 2 9 2 9s9-1 7 8Zm3-6C3 11 5 3 5 3s9 0 7 8Zm-1 3c2-8 11-6 11-6s0 9-11 6Z"/></symbol>
<symbol id="icon-mill" viewBox="0 0 24 24"><path d="M3 21V9l6 4V9l6 4V3h4v18ZM7 17h1m4 0h1m4 0h1"/></symbol>
<symbol id="icon-chat" viewBox="0 0 24 24"><path d="M21 11a9 9 0 0 1-9 9H3l1-5a9 9 0 1 1 17-4ZM7 10h10m-10 4h6"/></symbol>
</defs></svg>`;
const pages = [
  ['about','About Us — Rooted in Kerala','Discover Keerthi Nirmal: our values, leadership, quality and purpose. Delivering the goodness of Kerala rice since 1998.'],
  ['corporate-strategy','Corporate Strategy — Growing Responsibly','Explore Keerthi Nirmal’s infrastructure, production, technology, distribution and commitment to communities and the environment.'],
  ['faq','FAQ — A Little Clarity in Every Grain','Find answers to common questions about rice, milling, brown and white rice, everyday meals and storage.']
];
for (const [page,title,description] of pages) {
  const content = (await readFile(new URL(`../content/${page}-main.html`, import.meta.url), 'utf8')).replaceAll('<br>', ' <br>');
  const tabs = `<nav class="company-tabs page-container" aria-label="About pages">${pages.map(([name])=>`<a href="${name}.html"${name===page?' aria-current="page"':''}>${name==='about'?'About us':name==='faq'?'FAQ':'Corporate strategy'}<span aria-hidden="true">↗</span></a>`).join('')}</nav>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f8f7ef"><meta name="description" content="${description}"><title>${title} | Keerthi Nirmal</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="preload" as="image" href="assets/company/${page==='corporate-strategy'?'corporate-strategy':page}-hero.webp"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="site-pages.css"><link rel="stylesheet" href="company.css"><script src="story.js" defer></script><script src="site-pages.js" defer></script><script src="company.js" defer></script></head>
<body class="editorial-page company-page ${page}-page" id="top"><a class="skip-link" href="#content">Skip to content</a>${icons}${header}${tabs}<main id="content">${content}</main>${footer}<div class="page-controls" hidden><button class="page-motion-toggle" type="button" aria-label="Pause animation" aria-pressed="false">Ⅱ</button><a href="#top" aria-label="Back to top">↑</a></div></body></html>\n`;
  await writeFile(new URL(`${page}.html`, root), withNavigation(html,page));
}
// Update existing static pages as well, without changing their page content.
for (const file of await readdir(root)) {
  if (!file.endsWith('.html')) continue;
  const url = new URL(file,root);
  const html = await readFile(url,'utf8');
  await writeFile(url,withNavigation(html,file.replace('.html','')));
}
console.log('Built About, Corporate Strategy and FAQ; synchronized site navigation.');
