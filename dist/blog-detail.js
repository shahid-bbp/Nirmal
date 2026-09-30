(() => {
  'use strict';
  const data = document.getElementById('blog-article-data');
  const body = document.getElementById('detail-body');
  const relatedGrid = document.getElementById('detail-related-grid');
  if (!data || !body || !relatedGrid) return;

  const articles = JSON.parse(data.textContent);
  const requestedId = new URLSearchParams(location.search).get('id') || String(articles[0]?.id || '');
  const article = articles.find(item => String(item.id) === requestedId);
  const title = document.querySelector('[data-detail-title]');
  const category = document.querySelector('[data-detail-category]');
  const date = document.querySelector('[data-detail-date]');
  const image = document.querySelector('[data-detail-image]');
  const description = document.querySelector('[data-detail-description]');
  const source = document.querySelector('[data-detail-source]');

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function addSection(heading, text) {
    const section = element('section', 'detail-copy-section');
    section.append(element('h2', '', heading), element('p', '', text));
    body.append(section);
  }

  function renderFeaturedStory() {
    addSection('Naturally aromatic for biryani', 'Kaima Jeerakasala is prized for its delicate fragrance and short, fine grains. Its aroma complements the spices in a Malabar-style biryani without overpowering them.');
    addSection('A good match for layered flavours', 'When cooked carefully, the grains take on the aroma of spices, herbs and ghee while keeping their own character. That balance helps each spoonful feel fragrant and full of flavour.');
    addSection('Keep the grains light and separate', 'Rinse gently, soak briefly, then cook until the grains are just tender. For a layered biryani, finish them with the masala over low heat so they stay distinct rather than turning soft.');
    addSection('A versatile rice for special meals', 'Beyond biryani, Kaima Jeerakasala works well in ghee rice and other festive dishes where aroma and a soft texture are welcome.');

    const cooking = element('section', 'detail-copy-section');
    cooking.append(element('h2', '', 'How to cook Kaima rice for biryani'));
    const steps = document.createElement('ol');
    [
      'Rinse the rice gently until the water is mostly clear.',
      'Soak for about 20 minutes, then drain well.',
      'Bring a pot of salted water and whole spices to a boil.',
      'Add the rice and cook until nearly tender, with a little firmness in the centre.',
      'Drain promptly, then layer with the biryani masala and herbs.',
      'Cover and finish over low heat until the flavours come together.'
    ].forEach(step => steps.append(element('li', '', step)));
    cooking.append(steps);
    body.append(cooking);

    const faq = element('section', 'detail-copy-section detail-faq');
    faq.append(element('h2', '', 'Frequently asked questions'));
    [
      ['Are Kaima rice and Jeerakasala rice the same?', 'The names are commonly used for the aromatic short-grain rice associated with Kerala biryani.'],
      ['Can I use it instead of basmati?', 'Yes. Kaima gives biryani a shorter grain and a softer, more masala-infused finish.'],
      ['How can I help the grains stay separate?', 'Avoid overcooking. Drain when nearly tender and let the rice finish steaming with the masala.']
    ].forEach(([question, answer]) => {
      const item = element('div', 'detail-faq-item');
      item.append(element('h3', '', question), element('p', '', answer));
      faq.append(item);
    });
    body.append(faq);
  }

  function renderRelated() {
    const related = articles.filter(item => item.id !== article.id && item.category === article.category)
      .concat(articles.filter(item => item.id !== article.id && item.category !== article.category))
      .slice(0, 3);
    related.forEach(item => {
      const card = element('article', 'detail-related-card');
      const link = element('a', 'detail-related-image');
      link.href = `blog-detail.html?id=${encodeURIComponent(item.id)}`;
      const thumbnail = document.createElement('img');
      thumbnail.src = item.image;
      thumbnail.alt = item.title;
      thumbnail.loading = 'lazy';
      link.append(thumbnail);
      const copy = element('div', 'detail-related-copy');
      copy.append(element('span', 'detail-related-category', item.category));
      const heading = element('h3');
      const titleLink = element('a', '', item.title);
      titleLink.href = link.href;
      heading.append(titleLink);
      copy.append(heading);
      card.append(link, copy);
      relatedGrid.append(card);
    });
  }

  if (!article) {
    document.title = 'Article not found | Keerthi Nirmal';
    title.textContent = 'Article not found';
    description.textContent = 'This story could not be found.';
    image.hidden = true;
    body.replaceChildren(element('p', '', 'This article may have moved. Browse the journal to find another story.'));
    source.hidden = true;
    return;
  }

  const formattedDate = new Date(`${article.date}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  document.title = `${article.title} | Keerthi Nirmal`;
  document.querySelector('meta[name="description"]').content = article.description;
  title.textContent = article.title;
  category.textContent = article.category;
  date.dateTime = article.date;
  date.textContent = formattedDate;
  image.src = article.image;
  image.alt = article.title;
  description.textContent = article.description;
  source.href = article.externalUrl;
  body.replaceChildren();

  if (String(article.id) === '14622') renderFeaturedStory();
  else body.append(element('p', '', article.description));

  renderRelated();
})();