(() => {
  'use strict';
  const catalog = document.querySelector('.catalog-section');
  if (!catalog) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reducedMotion.matches || document.body.classList.contains('editorial-motion-paused');
  const batchSize = 12;
  const cards = [...document.querySelectorAll('.product-card')];
  const groups = [...document.querySelectorAll('.catalog-group')];
  const links = [...document.querySelectorAll('[data-filter]')];
  const categoryIds = groups.map(group => group.dataset.group);
  const search = document.querySelector('#product-search');
  const searchForm = document.querySelector('.product-search');
  const clearSearch = document.querySelector('.search-clear');
  const status = document.querySelector('#catalog-status');
  const pagination = document.querySelector('.catalog-pagination');
  const sentinel = document.querySelector('.catalog-sentinel');
  const moreButton = document.querySelector('.load-more-products');
  const autoLoad = document.querySelector('#auto-load');
  const empty = document.querySelector('.catalog-empty');
  const normalise = value => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const records = cards.map(card => ({
    card, id: card.dataset.product, category: card.dataset.category,
    title: card.querySelector('h3').textContent,
    description: card.querySelector('.product-description').textContent,
    search: normalise(`${card.querySelector('h3').textContent} ${card.querySelector('.product-description').textContent} ${card.querySelector('.product-card-top').textContent}`)
  }));
  let state = { category: 'all', q: '', limit: batchSize };
  let matches = [];
  let searchTimer = 0;
  let observer;
  const aliases = { 'rice-section':'rice', 'oils-section':'oils', 'breakfast-section':'breakfast', 'kitchen-essentials-section':'essentials', 'pulses-section':'pulses', 'pickles-section':'pickles', 'snacks-section':'snacks', 'spices-section':'spices' };
  function hashCategory() {
    const hash = location.hash.slice(1);
    return aliases[hash] || (categoryIds.includes(hash) ? hash : null);
  }
  function readLocation() {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || hashCategory() || 'all';
    const count = Number(params.get('shown'));
    state = {
      category: categoryIds.includes(category) ? category : 'all',
      q: (params.get('q') || '').slice(0,120),
      limit: Number.isSafeInteger(count) && count > batchSize ? Math.min(count,cards.length) : batchSize
    };
    search.value = state.q;
  }
  function writeLocation(method = 'replaceState', resetHash = false) {
    const url = new URL(location.href);
    state.category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category',state.category);
    state.q ? url.searchParams.set('q',state.q) : url.searchParams.delete('q');
    state.limit > batchSize ? url.searchParams.set('shown',String(state.limit)) : url.searchParams.delete('shown');
    if (resetHash) url.hash = 'catalog';
    if (url.href !== location.href) history[method](null,'',url);
  }
  function scrollToCollection() {
    catalog.scrollIntoView({behavior:motionOff() ? 'instant' : 'smooth',block:'start'});
  }
  function preparePreview(button) {
    button.disabled = false;
    // Load the alternate before interaction when a pack is close to the viewport.
    const alternate = button.querySelector('.pack-character');
    if (alternate) alternate.loading = 'eager';
  }
  const previewObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    preparePreview(entry.target);
    previewObserver.unobserve(entry.target);
  }),{rootMargin:'250px'}) : null;
  document.querySelectorAll('[data-preview]').forEach(button => {
    button.disabled = false;
    if (previewObserver) previewObserver.observe(button);
    else preparePreview(button);
  });
  document.querySelectorAll('[data-catalog-control],[data-details]').forEach(element => { element.hidden = false; });
  const showcaseNote = document.querySelector('.showcase-note span');
  const coarsePointer = matchMedia('(hover: none)');
  const updateHint = () => { showcaseNote.textContent = coarsePointer.matches ? 'Tap a pack for a little hello.' : 'Hover for a little hello.'; };
  coarsePointer.addEventListener('change',updateHint);
  updateHint();

  function render(animate = false) {
    const terms = normalise(state.q).split(' ').filter(Boolean);
    matches = records.filter(record => (state.category === 'all' || record.category === state.category) && terms.every(term => record.search.includes(term)));
    state.limit = Math.max(batchSize, Math.min(state.limit, matches.length || batchSize));
    const visible = new Set(matches.slice(0,state.limit).map(record=>record.card));
    let arrivals = 0;
    cards.forEach(card => {
      const wasHidden = card.hidden;
      card.hidden = !visible.has(card);
      card.classList.remove('is-entering');
      if (wasHidden && !card.hidden && animate && !motionOff()) {
        card.style.setProperty('--arrival-delay',`${Math.min(arrivals++,5)*35}ms`);
        card.classList.add('is-entering');
      }
    });
    groups.forEach(group => {
      const categoryMatches = matches.filter(record=>record.category===group.dataset.group);
      group.hidden = !categoryMatches.some(record=>visible.has(record.card));
      group.querySelector('.group-count').textContent = `${categoryMatches.length} product${categoryMatches.length===1?'':'s'}`;
    });
    links.forEach(link => {
      if (link.dataset.filter === state.category) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    });
    const shown = Math.min(state.limit,matches.length);
    const categoryLabel = state.category === 'all' ? 'all categories' : document.querySelector(`#${state.category}-title`).textContent;
    const productLabel = matches.length === 1 ? 'product' : 'products';
    status.textContent = `${shown} of ${matches.length} ${productLabel} · ${state.q ? `“${state.q}” in ` : ''}${categoryLabel}`;
    clearSearch.hidden = !state.q;
    empty.hidden = matches.length !== 0;
    pagination.hidden = matches.length === 0;
    pagination.querySelector('.pagination-count').textContent = `You’ve explored ${shown} of ${matches.length} ${productLabel}`;
    pagination.querySelector('.pagination-track span').style.transform = `scaleX(${shown / Math.max(1,matches.length)})`;
    moreButton.hidden = shown >= matches.length;
    moreButton.firstChild.textContent = `Load ${Math.min(batchSize,matches.length-shown)} more products `;
    pagination.querySelector('.catalog-end').hidden = shown < matches.length;
    observer?.disconnect();
    if (observer && !moreButton.hidden && autoLoad.checked) observer.observe(sentinel);
    dispatchEvent(new Event('resize'));
  }
  function filter(category, q, method = 'pushState') {
    clearTimeout(searchTimer);
    state = { category, q:q.trim(), limit:batchSize };
    search.value = state.q;
    render(true);
    writeLocation(method,true);
  }
  links.forEach(link => link.addEventListener('click',event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    filter(link.dataset.filter,search.value);
    scrollToCollection();
  }));
  searchForm.addEventListener('submit',event => { event.preventDefault(); filter(state.category,search.value); });
  search.addEventListener('input',() => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(()=>filter(state.category,search.value,'replaceState'),220);
  });
  clearSearch.addEventListener('click',()=>{filter(state.category,'');search.focus();});
  document.querySelector('#reset-products').addEventListener('click',()=>{filter('all','');search.focus({preventScroll:true});scrollToCollection();});
  function loadMore(manual = false) {
    if (state.limit >= matches.length) return;
    const firstNew = matches[state.limit];
    state.limit += batchSize;
    render(true);
    writeLocation();
    if (manual && firstNew) {
      firstNew.card.querySelector('[data-details]').focus({preventScroll:true});
      firstNew.card.scrollIntoView({behavior:motionOff()?'instant':'smooth',block:'start'});
    }
  }
  moreButton.addEventListener('click',()=>loadMore(true));
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries=>{
      if (entries.some(entry=>entry.isIntersecting) && autoLoad.checked && !dialog.open) loadMore();
    },{rootMargin:'180px',threshold:0});
  } else {
    autoLoad.checked = false;
    autoLoad.closest('label').hidden = true;
  }
  autoLoad.addEventListener('change',()=>{observer?.disconnect();if(autoLoad.checked&&!moreButton.hidden)observer?.observe(sentinel);});

  const dialog = document.querySelector('.product-dialog');
  let openedProduct = '';
  let modalEntry = false;
  let previousFocus;
  let previousOverflow = '';
  function closeDialog() {
    if (!dialog.open) return;
    dialog.close();
    document.body.style.overflow = previousOverflow;
    openedProduct = '';
    if (previousFocus?.isConnected && previousFocus.getClientRects().length && !previousFocus.closest('[hidden]')) previousFocus.focus({preventScroll:true});
    else search.focus({preventScroll:true});
  }
  function openProduct(id, write = false) {
    const record = records.find(item=>item.id===id);
    if (!record) return;
    if (openedProduct === id && dialog.open) return;
    if (!dialog.open) {
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
    }
    const clone = record.card.querySelector('.pack-stage').cloneNode(true);
    clone.classList.remove('is-previewing');
    clone.setAttribute('aria-pressed','false');
    clone.querySelectorAll('img').forEach(img=>{img.loading='eager';});
    preparePreview(clone);
    dialog.querySelector('.dialog-pack').replaceChildren(clone);
    dialog.style.setProperty('--pack-tint',record.card.style.getPropertyValue('--pack-tint'));
    dialog.querySelector('.dialog-category').textContent = `THE COLLECTION / ${document.querySelector(`#${record.category}-title`).textContent.toUpperCase()}`;
    dialog.querySelector('#dialog-product-title').textContent = record.title;
    dialog.querySelector('.dialog-description').textContent = record.description;
    dialog.querySelector('.dialog-enquire').href = record.card.querySelector('.product-enquiry').href;
    openedProduct = id;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
    if (write) {
      const url = new URL(location.href);
      url.searchParams.set('product',id);
      history.pushState(null,'',url);
      modalEntry = true;
    }
  }
  function dismissProduct() {
    closeDialog();
    if (modalEntry) {
      modalEntry = false;
      history.back();
    } else {
      const url = new URL(location.href);
      url.searchParams.delete('product');
      history.replaceState(null,'',url);
    }
  }
  dialog.querySelector('.dialog-close').addEventListener('click',dismissProduct);
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismissProduct();});
  dialog.addEventListener('click',event=>{
    if (event.target !== dialog) return;
    const rect=dialog.getBoundingClientRect();
    if (event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dismissProduct();
  });
  document.addEventListener('click',event=>{
    const preview=event.target.closest('[data-preview]');
    if(preview){const active=preview.classList.toggle('is-previewing');preview.setAttribute('aria-pressed',String(active));preparePreview(preview);}
    const details=event.target.closest('[data-details]');
    if(details)openProduct(details.dataset.details,true);
  });
  function syncLocation() {
    clearTimeout(searchTimer);
    readLocation();
    render();
    const id=new URLSearchParams(location.search).get('product');
    if(records.some(record=>record.id===id))openProduct(id);
    else closeDialog();
  }
  addEventListener('popstate',()=>{modalEntry=false;syncLocation();});
  addEventListener('hashchange',()=>{if(hashCategory()){filter(hashCategory(),state.q,'replaceState');scrollToCollection();}});
  syncLocation();
  writeLocation();
  if(hashCategory())requestAnimationFrame(()=>document.querySelector(`#${state.category}`)?.scrollIntoView({behavior:'instant',block:'start'}));
})();
