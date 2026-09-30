(() => {
  if (!document.body.classList.contains('editorial-page')) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.querySelector('.page-controls');
  const toggle = controls.querySelector('button');
  const reveals = [...document.querySelectorAll('.page-reveal')];
  let paused = false;
  try { paused = sessionStorage.getItem('editorial-motion-paused') === 'true'; } catch { /* Optional preference. */ }
  const motionOff = () => paused || reducedMotion.matches;
  if ('IntersectionObserver' in window && !motionOff()) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .03 });
    document.body.classList.add('page-effects-ready');
    reveals.forEach(element => observer.observe(element));
  }
  function syncMotion() {
    const off = motionOff();
    document.body.classList.toggle('editorial-motion-paused', off);
    toggle.disabled = reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(off));
    const label = reducedMotion.matches ? 'Reduced motion enabled' : paused ? 'Resume animation' : 'Pause animation';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.textContent = off ? '▷' : 'Ⅱ';
    if (off) reveals.forEach(element => element.classList.add('is-visible'));
    dispatchEvent(new CustomEvent('page:motion-change', { detail: { paused: off } }));
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('editorial-motion-paused', String(paused)); } catch { /* Optional preference. */ }
    syncMotion();
  });
  reducedMotion.addEventListener('change', syncMotion);
  controls.hidden = false;
  syncMotion();

  const progress = document.querySelector('.header-progress span');
  let frame = 0;
  const updateProgress = () => {
    frame = 0;
    progress.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
  };
  const requestProgress = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
  addEventListener('scroll', requestProgress, { passive: true });
  addEventListener('resize', requestProgress, { passive: true });
  addEventListener('pageshow', requestProgress);
  requestProgress();

  document.querySelectorAll('.newsletter-form').forEach(form => {
    const response = form.querySelector('.newsletter-result');
    form.querySelector('button').disabled = false;
    form.elements.email.addEventListener('input', () => { response.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const body = `Hello Keerthi Nirmal,\n\nPlease sign me up for updates on new products, stories, recipes and offers.\n\nEmail: ${form.elements.email.value.trim()}\n\nThank you!`;
      response.querySelector('a').href = `mailto:care@keerthinirmal.com?subject=Newsletter%20subscription%20request&body=${encodeURIComponent(body)}`;
      response.hidden = false;
    });
  });
})();
