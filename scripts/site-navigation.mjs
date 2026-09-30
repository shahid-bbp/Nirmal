// Keep navigation in the HTML so every destination also works without JavaScript.
export function withNavigation(html, page) {
  const link = (file, label) => `<a href="${file === 'index' ? '/' : file}"${page === file ? ' aria-current="page"' : ''}>${label}</a>`;
  const submenu = `<div class="nav-about${['about','corporate-strategy','faq'].includes(page) ? ' nav-about-active' : ''}">${link('about','About us')}<details class="about-dropdown"><summary aria-label="About submenu"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></summary><div class="about-submenu">${link('corporate-strategy','Corporate strategy')}${link('faq','FAQ')}</div></details></div>`;
  const nav = (mobile = false) => `<nav class="${mobile ? 'mobile-nav' : 'desktop-nav'}"${mobile ? ' id="mobile-nav"' : ''} aria-label="${mobile ? 'Mobile' : 'Main'} navigation">${link('index','Home')}${submenu}${link('our-story','Our story')}${link('process',mobile ? 'Our process' : 'Process')}${link('products','Products')}${link('blog','Blogs')}${link('contact','Contact us')}</nav>`;
  const header = `<header class="site-header" id="site-header">
    <a class="brand" href="/" aria-label="Keerthi Nirmal home"><img src="assets/our-story/logo.webp" width="158" height="74" alt="Keerthi Nirmal"></a>
    ${nav()}
    <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu"><span></span><span></span></button>
    ${nav(true)}
    <div class="header-progress" aria-hidden="true"><span></span></div>
  </header>`;
  const updated = html.replace(/<header class="site-header"[^>]*>[\s\S]*?<\/header>/, header)
    .replace(/href="([a-z0-9-]+)\.html([^"]*)"/gi, (_, route, suffix) => `href="${route === 'index' ? '/' : route}${suffix}"`)
    .replace(/href="([^"]*)""+/g, 'href="$1"')
    .replace(/href="([^"]*)"/g, (_, href) => `href="${href.replace(/##+/g, '#').replace(/\?\?+/g, '?')}"`)
    .replaceAll('href="index#faq"', 'href="faq"')
    .replaceAll('href="index"', 'href="/"');
  return updated.includes('href="header.css"')
    ? updated
    : updated.replace('</head>', '  <link rel="stylesheet" href="header.css">\n</head>');
}
