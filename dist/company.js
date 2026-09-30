(() => {
  'use strict';
  if (!document.body.classList.contains('company-page')) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = () => reducedMotion.matches || document.body.classList.contains('editorial-motion-paused');
  const counters = [...document.querySelectorAll('[data-count]')];
  const counterFrames = new Map();
  const format = value => value.toLocaleString('en-IN');
  function finishCounter(element) {
    cancelAnimationFrame(counterFrames.get(element));
    counterFrames.delete(element);
    element.textContent = format(Number(element.dataset.count));
  }
  // Final values ship in HTML. Animate only on first entry into the viewport.
  if ('IntersectionObserver' in window && !motionOff()) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const element = entry.target;
      if (motionOff()) return;
      const target = Number(element.dataset.count);
      const start = performance.now();
      const render = now => {
        if (motionOff()) { finishCounter(element); return; }
        const progress = Math.min(1, (now - start) / 1250);
        element.textContent = format(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) counterFrames.set(element, requestAnimationFrame(render));
        else finishCounter(element);
      };
      counterFrames.set(element, requestAnimationFrame(render));
    }), { threshold: .6 });
    counters.forEach(element => observer.observe(element));
  }

  const disclosures = [...document.querySelectorAll('.company-faq')];
  const disclosureAnimations = new Map();
  const wantedStates = new Map();
  function settleDisclosure(details) {
    const wanted = wantedStates.get(details);
    const animation = disclosureAnimations.get(details);
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
    }
    if (wanted !== undefined) details.open = wanted;
    details.style.height = '';
    details.style.overflow = '';
    disclosureAnimations.delete(details);
    wantedStates.delete(details);
  }
  function setDisclosure(details, open) {
    const startHeight = details.getBoundingClientRect().height;
    settleDisclosure(details);
    if (motionOff() || !details.animate) { details.open = open; return; }
    wantedStates.set(details, open);
    // Measure the natural height, then animate the wrapper. No fixed max-height.
    details.open = true;
    const endHeight = open ? details.getBoundingClientRect().height : details.querySelector('summary').getBoundingClientRect().height + parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
    details.style.height = `${startHeight}px`;
    details.style.overflow = 'hidden';
    const animation = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: 310, easing: 'cubic-bezier(.2,.7,.2,1)' });
    disclosureAnimations.set(details, animation);
    animation.onfinish = () => settleDisclosure(details);
  }
  disclosures.forEach(details => {
    details.querySelector('summary').addEventListener('click', event => {
      event.preventDefault();
      const open = !(wantedStates.get(details) ?? details.open);
      if (open) disclosures.filter(other => other !== details && (wantedStates.get(other) ?? other.open)).forEach(other => setDisclosure(other,false));
      setDisclosure(details,open);
    });
  });
  function revealHash() {
    const details = disclosures.find(item => `#${item.id}` === location.hash);
    if (!details) return;
    disclosures.forEach(item => { settleDisclosure(item); item.open = item === details; });
  }
  revealHash();
  addEventListener('hashchange',revealHash);
  // Settle to natural height if the viewport or font metrics change mid-transition.
  addEventListener('resize', () => disclosures.forEach(settleDisclosure), { passive: true });
  const settleMotion = () => {
    if (!motionOff()) return;
    counters.forEach(finishCounter);
    disclosures.forEach(settleDisclosure);
  };
  addEventListener('page:motion-change', settleMotion);
  reducedMotion.addEventListener('change', settleMotion);

  const sectionLinks = [...document.querySelectorAll('.strategy-index nav a')];
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    sectionLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  }
})();
