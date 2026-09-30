(() => {
  'use strict';
  const journey = document.querySelector('.legacy-journey');
  if (!journey) return;
  const road = journey.querySelector('.journey-road');
  const svg = road.querySelector('svg');
  const paths = [...svg.querySelectorAll('path')];
  const truck = road.querySelector('.journey-truck');
  const trucks = [...truck.querySelectorAll('img')];
  const markers = [...road.querySelectorAll('.road-marker')];
  const chapters = [...document.querySelectorAll('.legacy-chapter, .legacy-finale')];
  const nav = document.querySelector('.journey-nav');
  const yearLinks = [...nav.querySelectorAll('a')];
  const controls = document.querySelector('.legacy-controls');
  const motionButton = controls.querySelector('.motion-toggle');
  const motionLabel = motionButton.querySelector('.motion-label');
  const motionIcon = motionButton.querySelector('.motion-icon');
  const progressBar = document.querySelector('.header-progress span');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('.animated-scene video')];
  const visibleVideos = new Set();
  let paused = false;
  try { paused = sessionStorage.getItem('legacy-motion-paused') === 'true'; } catch { /* Storage can be disabled. */ }
  let frame = 0, needsMeasure = true, start = 0, height = 1, viewport = innerHeight;
  let points = [], chapterPositions = [], activeYear = '', activeEra = -1;
  let truckHeight = 108, pageHeight = 1, truckPosition = null;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const motionOff = () => paused || reducedMotion.matches;

  // Sample the actual road after layout. All movement then uses these cached points.
  function measure() {
    needsMeasure = false;
    start = journey.getBoundingClientRect().top + scrollY;
    height = road.clientHeight;
    viewport = innerHeight;
    pageHeight = document.documentElement.scrollHeight - viewport;
    truckHeight = truck.offsetHeight;
    const width = road.clientWidth;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const d = `M ${width * .61} 0 C ${width * .89} ${height * .22}, ${width * .2} ${height * .28}, ${width * .35} ${height * .5} S ${width * .61} ${height * .77}, ${width * .47} ${height}`;
    paths.forEach(path => path.setAttribute('d', d));
    const length = paths[0].getTotalLength();
    points = Array.from({ length: 501 }, (_, i) => {
      const p = paths[0].getPointAtLength(length * i / 500);
      return { x: p.x, y: p.y };
    });
    chapterPositions = chapters.map(chapter => ({
      year: chapter.dataset.year,
      top: chapter.getBoundingClientRect().top + scrollY,
    }));
    markers.forEach((marker, i) => {
      const y = chapterPositions[i].top - start + 62;
      const point = pointAtY(y);
      marker.style.left = `${point.x + (width < 100 ? 16 : width < 150 ? 29 : 38)}px`;
      marker.style.top = `${y}px`;
    });
  }

  function pointAtY(y) {
    let low = 0, high = points.length - 1;
    while (high - low > 1) {
      const mid = (low + high) >> 1;
      if (points[mid].y < y) low = mid;
      else high = mid;
    }
    const a = points[low], b = points[high];
    const t = clamp((y - a.y) / Math.max(.001, b.y - a.y));
    return { x: a.x + (b.x - a.x) * t, y, angle: -Math.atan2(b.x - a.x, b.y - a.y) * 180 / Math.PI };
  }

  function update() {
    frame = 0;
    if (needsMeasure) measure();
    const focus = scrollY + viewport * .54;
    const current = chapterPositions.findLast(chapter => focus >= chapter.top) || chapterPositions[0];
    if (current.year !== activeYear) {
      activeYear = current.year;
      yearLinks.forEach(link => {
        if (link.hash === `#year-${activeYear}`) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
      markers.forEach(marker => marker.classList.toggle('is-passed', Number(marker.dataset.year) <= Number(activeYear)));
    }
    const visible = scrollY + viewport > start + 80 && scrollY < chapterPositions.at(-1).top + 450;
    nav.classList.toggle('is-visible', visible);
    nav.inert = !visible;
    if (!motionOff() || !truck.dataset.placed) {
      const targetY = motionOff() && truckPosition !== null ? truckPosition * height : focus - start;
      const y = clamp(targetY, truckHeight * .6, height - truckHeight * .65);
      truckPosition = y / height;
      const point = pointAtY(y);
      truck.style.left = '0';
      truck.style.top = '0';
      truck.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) rotate(${point.angle}deg)`;
      truck.dataset.placed = 'true';
      const era = Number(activeYear) >= 2020 ? 2 : Number(activeYear) >= 2010 ? 1 : 0;
      if (era !== activeEra) {
        activeEra = era;
        trucks.forEach((image, i) => image.classList.toggle('is-current', i === era));
      }
    }
    progressBar.style.transform = `scaleX(${clamp(scrollY / Math.max(1, pageHeight))})`;
  }

  function requestUpdate(remeasure = false) {
    if (remeasure) {
      needsMeasure = true;
      delete truck.dataset.placed;
    }
    if (!frame) frame = requestAnimationFrame(update);
  }

  function syncVideo(video) {
    if (motionOff() || document.hidden || !visibleVideos.has(video)) {
      video.pause();
      return;
    }
    if (!video.hasAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
    const promise = video.play();
    promise?.catch(() => { /* The still illustration remains when autoplay is unavailable. */ });
  }

  videos.forEach(video => {
    video.muted = true;
    video.addEventListener('playing', () => video.parentElement.classList.add('is-playing'));
    video.addEventListener('error', () => video.parentElement.classList.remove('is-playing'));
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visibleVideos.add(target);
        else visibleVideos.delete(target);
        syncVideo(target);
      });
    }, { rootMargin: '100px 0px', threshold: 0 });
    videos.forEach(video => observer.observe(video));
  }

  function syncMotion() {
    document.body.classList.toggle('legacy-motion-paused', motionOff());
    motionButton.setAttribute('aria-pressed', String(motionOff()));
    const label = reducedMotion.matches ? 'Reduced motion enabled' : paused ? 'Resume animation' : 'Pause animation';
    motionLabel.textContent = label;
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.disabled = reducedMotion.matches;
    motionIcon.textContent = motionOff() ? '▷' : 'Ⅱ';
    videos.forEach(syncVideo);
    requestUpdate();
  }

  motionButton.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('legacy-motion-paused', String(paused)); } catch { /* Optional preference. */ }
    syncMotion();
  });
  controls.hidden = false;
  addEventListener('scroll', () => requestUpdate(), { passive: true });
  addEventListener('resize', () => requestUpdate(true), { passive: true });
  addEventListener('pageshow', () => { requestUpdate(true); videos.forEach(syncVideo); });
  document.addEventListener('visibilitychange', () => videos.forEach(syncVideo));
  reducedMotion.addEventListener('change', syncMotion);
  document.fonts?.ready.then(() => requestUpdate(true));
  if ('ResizeObserver' in window) new ResizeObserver(() => requestUpdate(true)).observe(journey);
  syncMotion();
})();
