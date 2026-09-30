(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = matchMedia('(max-width: 900px)');
  document.documentElement.classList.add('navigation-ready');
  const dropdowns = [...document.querySelectorAll('.about-dropdown')];
  dropdowns.forEach(dropdown => {
    // Native details supplies keyboard/touch toggling; desktop pointers also open on hover.
    const group = dropdown.closest('.nav-about');
    group.addEventListener('pointerenter', event => {
      if (!mobileLayout.matches && event.pointerType === 'mouse') dropdown.open = true;
    });
    group.addEventListener('pointerleave', event => {
      if (!mobileLayout.matches && event.pointerType === 'mouse' && !group.contains(document.activeElement)) dropdown.open = false;
    });
    group.addEventListener('focusout', () => {
      requestAnimationFrame(() => { if (!group.contains(document.activeElement)) dropdown.open = false; });
    });
  });

  function setMenu(open, restoreFocus = false) {
    if (!header || !menuButton || !mobileNav) return;
    header.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.inert = !open;
    if (!open) dropdowns.forEach(dropdown => { dropdown.open = false; });
    if (restoreFocus) menuButton.focus();
  }
  setMenu(false);
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const dropdown = dropdowns.find(item => item.open);
      if (dropdown) {
        dropdown.open = false;
        dropdown.querySelector('summary').focus();
        event.preventDefault();
        return;
      }
    }
    if (event.key === 'Escape' && header?.classList.contains('open')) setMenu(false, true);
    if (event.key !== 'Tab' || !header?.classList.contains('open')) return;
    const links = [...mobileNav.querySelectorAll('a, summary')].filter(item => item.getClientRects().length);
    if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault(); links.at(-1).focus();
    } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
      event.preventDefault(); menuButton.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    dropdowns.forEach(dropdown => { if (!dropdown.closest('.nav-about').contains(event.target)) dropdown.open = false; });
    if (header?.classList.contains('open') && !header.contains(event.target)) setMenu(false);
  });
  mobileLayout.addEventListener('change', () => setMenu(false));

  // Content stays readable when JavaScript is unavailable.
  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -25px 0px', threshold: 0.05 });
    document.body.classList.add('reveal-ready');
    revealItems.forEach(item => observer.observe(item));
  }

  const story = document.querySelector('.grain-story');
  const grain = document.getElementById('journey-grain');
  const grainImages = [...document.querySelectorAll('#journey-grain [data-grain-image]')];
  const layer = document.querySelector('.grain-layer');
  const packClosed = document.getElementById('closed-pack');
  const packOpen = document.querySelector('.pack-open');
  const progress = document.querySelector('.header-progress span');
  const tracker = document.querySelector('.chapter-tracker');
  const chapterNumber = document.querySelector('.chapter-current');
  const chapterName = document.querySelector('.chapter-name');
  const scenes = [...document.querySelectorAll('.story-scene')];
  const anchors = [...document.querySelectorAll('[data-stop]')];
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  let stops = [], sceneMetrics = [], chapterMetrics = [];
  let storyEnd = 1, viewportHeight = innerHeight, frame = 0;
  let needsMeasure = true, activeChapter = '';
  let grainImagesReady = grainImages.length > 0 && grainImages.every(image => image.complete && image.naturalWidth > 0);

  // Layout reads happen on resize or font loading, never in the scroll listener.
  function measure() {
    needsMeasure = false;
    if (!story) return;
    const scroll = window.scrollY;
    viewportHeight = innerHeight;
    sceneMetrics = scenes.map(scene => {
      const stage = scene.querySelector('.scene-stage');
      return { scene, stage, top: scene.getBoundingClientRect().top + scroll,
        height: scene.offsetHeight, stageHeight: stage.offsetHeight };
    });
    stops = anchors.map(anchor => {
      const rect = anchor.getBoundingClientRect();
      const metric = sceneMetrics.find(item => item.scene.contains(anchor));
      let at = 0, y = rect.top + scroll + rect.height / 2;
      if (metric) {
        const hold = Math.max(1, metric.height - metric.stageHeight);
        at = metric.top + hold * Number(anchor.dataset.progress || 0);
        // Anchor position inside the sticky stage stays constant while pinned.
        y = rect.top - metric.stage.getBoundingClientRect().top + rect.height / 2;
      }
      return { id: anchor.dataset.stop, at, x: rect.left + rect.width / 2,
        y, size: rect.width, rotation: Number(anchor.dataset.rotation || 0), image: anchor.dataset.grain || 'origin' };
    });
    stops.sort((a, b) => a.at - b.at);
    chapterMetrics = chapters.map(chapter => ({ top: chapter.getBoundingClientRect().top + scroll,
      number: chapter.dataset.chapter, name: chapter.dataset.chapterName }));
    storyEnd = story.getBoundingClientRect().bottom + scroll;
  }

  function renderGrain(scroll) {
    if (!grain || !grainImagesReady || stops.length < 2 || reducedMotion.matches) return;
    const last = stops.at(-1);
    let start = stops[0], end = stops[1];
    for (let i = 0; i < stops.length - 1; i++) {
      start = stops[i]; end = stops[i + 1];
      if (scroll <= end.at) break;
    }
    const amount = clamp((scroll - start.at) / Math.max(1, end.at - start.at));
    const t = ease(amount);
    // Keep the original travel path; only the artwork changes between chapters.
    const arc = start.id === 'entry' ? 0 : Math.sin(Math.PI * amount) * Math.min(70, innerWidth * .045);
    const x = mix(start.x, end.x, t) + arc;
    const y = mix(start.y, end.y, t);
    const size = mix(start.size, end.size, t);
    const rotation = mix(start.rotation, end.rotation, t);
    const imageHeight = 300 * 1273 / 1236;
    grain.style.transform = `translate3d(${x - 150}px,${y - imageHeight / 2}px,0) rotate(${rotation}deg) scale(${size / 300})`;
    // Scroll-based opacity makes the image change reversible, including fast jumps.
    const imageBlend = start.image === end.image ? 0 : ease(clamp((amount - .45) / .25));
    grainImages.forEach(image => {
      const stage = image.dataset.grainImage;
      image.style.opacity = String(stage === start.image ? 1 - imageBlend : stage === end.image ? imageBlend : 0);
    });
    const fallStart = mix(start.at, last.at, .9);
    const falling = end.id === 'mouth' ? clamp((scroll - fallStart) / Math.max(1, last.at - fallStart)) : 0;
    grain.style.opacity = String(scroll > last.at ? 0 : 1 - falling);
    layer.style.visibility = scroll > last.at + 10 || scroll >= storyEnd ? 'hidden' : 'visible';
    const pack = sceneMetrics.at(-1);
    if (pack) {
      const hold = Math.max(1, pack.height - pack.stageHeight);
      const seal = ease(clamp((scroll - last.at) / (hold * .22)));
      packClosed.style.opacity = String(seal);
      packOpen.style.opacity = String(1 - seal);
    }
  }
  function update() {
    frame = 0;
    if (needsMeasure) measure();
    const scroll = window.scrollY;
    header?.classList.toggle('scrolled', scroll > 30);
    if (!story) return;
    if (!reducedMotion.matches) renderGrain(scroll);
    if (progress) progress.style.transform = `scaleX(${clamp(scroll / (storyEnd - viewportHeight))})`;
    sceneMetrics.forEach(({ scene, top, height, stageHeight }) => {
      scene.style.setProperty('--scene-progress', clamp((scroll - top) / Math.max(1, height - stageHeight)));
    });
    const current = chapterMetrics.findLast(chapter => scroll + viewportHeight * .42 >= chapter.top) || chapterMetrics[0];
    if (current && current.number !== activeChapter) {
      activeChapter = current.number;
      chapterNumber.textContent = current.number;
      chapterName.textContent = current.name;
    }
    tracker?.classList.toggle('is-hidden', scroll > storyEnd - viewportHeight * .6);
    tracker?.style.setProperty('--chapter-progress', clamp(scroll / (storyEnd - viewportHeight)));
  }
  function requestUpdate(remeasure = false) {
    if (remeasure) needsMeasure = true;
    if (!frame) frame = requestAnimationFrame(update);
  }
  function setMotion() {
    document.body.classList.toggle('motion-ready', Boolean(story) && grainImagesReady && !reducedMotion.matches);
    if (layer && !grainImagesReady) layer.style.visibility = 'hidden';
    if (reducedMotion.matches) {
      revealItems.forEach(item => item.classList.add('is-visible'));
      if (layer) layer.style.visibility = 'hidden';
      if (packClosed) packClosed.style.opacity = '1';
      if (packOpen) packOpen.style.opacity = '0';
    }
    requestUpdate(true);
  }
  addEventListener('scroll', () => requestUpdate(), { passive: true });
  addEventListener('resize', () => requestUpdate(true), { passive: true });
  addEventListener('pageshow', () => requestUpdate(true));
  reducedMotion.addEventListener('change', setMotion);
  document.fonts?.ready.then(() => requestUpdate(true));
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => requestUpdate(true));
    resize.observe(document.body);
    scenes.forEach(scene => resize.observe(scene));
  }
  setMotion();
  // Keep the static chapter images visible until every animation frame is decoded.
  if (grainImages.length && !grainImagesReady) {
    Promise.all(grainImages.map(image => image.decode().catch(() => {}))).then(() => {
      grainImagesReady = grainImages.every(image => image.complete && image.naturalWidth > 0);
      setMotion();
    });
  }
})();
