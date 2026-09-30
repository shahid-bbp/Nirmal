(() => {
  'use strict';
  if (!document.body.classList.contains('contact-page')) return;
  const form = document.getElementById('enquiry-form');
  const fields = [...form.querySelectorAll('.contact-field input, .contact-field textarea')];
  const topics = [...form.querySelectorAll('input[name="topic"]')];
  const subject = form.elements.subject;
  const message = form.elements.message;
  const result = document.getElementById('enquiry-result');
  const draftLink = document.getElementById('enquiry-draft');
  let lastAutoSubject = '';
  const subjects = {
    Products: 'Product enquiry',
    Partnerships: 'Dealership or distribution partnership',
    Distribution: 'Distribution enquiry',
    Exports: 'Export enquiry',
    'General enquiry': 'General enquiry',
    Careers: 'Career enquiry',
  };
  const selectedTopic = () => topics.find(input => input.checked)?.value || 'General enquiry';
  const recipient = () => selectedTopic() === 'Careers' ? 'hr@nirmalrice.com' : 'care@keerthinirmal.com';
  const mailto = (to, title, body) => `mailto:${to}?subject=${encodeURIComponent(title.replace(/[\r\n]/g, ' '))}&body=${encodeURIComponent(body)}`;

  function validationMessage(field) {
    const value = field.value.trim();
    if (field.required && !value) return { name: 'Please tell us your name.', email: 'Please enter your email address.', subject: 'Please add a subject.', message: 'Please write a short message.' }[field.name];
    if (field.type === 'email' && field.validity.typeMismatch) return 'Please enter a valid email address.';
    if (field.name === 'phone' && value && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) return 'Please enter a valid phone number, including the country code.';
    if (field.name === 'message' && value.length < 10) return 'Please write at least 10 characters.';
    return '';
  }

  function validate(field) {
    const error = validationMessage(field);
    const errorElement = document.getElementById(`${field.name}-error`);
    field.setAttribute('aria-invalid', String(Boolean(error)));
    errorElement.textContent = error;
    return !error;
  }

  function changeTopic({ focus = false } = {}) {
    const topic = selectedTopic();
    if (!subject.value.trim() || subject.value === lastAutoSubject || focus) {
      subject.value = subjects[topic];
      lastAutoSubject = subject.value;
      if (subject.hasAttribute('aria-invalid')) validate(subject);
    }
    result.hidden = true;
    form.action = `mailto:${recipient()}`;
  }
  topics.forEach(input => input.addEventListener('change', () => changeTopic()));
  document.querySelectorAll('[data-enquiry-topic]').forEach(link => link.addEventListener('click', () => {
    const input = topics.find(item => item.value === link.dataset.enquiryTopic);
    if (!input) return;
    input.checked = true;
    changeTopic();
    // Focus without overriding the native anchor's scroll behaviour.
    requestAnimationFrame(() => form.elements.name.focus({ preventScroll: true }));
  }));
  fields.forEach(field => {
    field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validate(field); });
    field.addEventListener('input', () => {
      result.hidden = true;
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });
  message.addEventListener('input', () => {
    document.getElementById('message-count').textContent = `${message.value.length.toLocaleString('en-IN')} / 2,000`;
  });
  form.noValidate = true;
  form.querySelector('button[type="submit"]').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      fields.find(field => field.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    const body = `Hello Keerthi Nirmal,\n\n${values.message.trim()}\n\nName: ${values.name.trim()}\nEmail: ${values.email.trim()}\nPhone: ${values.phone.trim() || 'Not provided'}\nEnquiry: ${values.topic}`;
    draftLink.href = mailto(recipient(), values.subject.trim(), body);
    document.getElementById('draft-recipient').textContent = recipient();
    result.hidden = false;
  });

  document.querySelectorAll('.newsletter-form').forEach(newsletter => {
    const email = newsletter.elements.email;
    const response = newsletter.querySelector('.newsletter-result');
    newsletter.querySelector('button').disabled = false;
    email.addEventListener('input', () => { response.hidden = true; });
    newsletter.addEventListener('submit', event => {
      event.preventDefault();
      if (!newsletter.reportValidity()) return;
      const body = `Hello Keerthi Nirmal,\n\nPlease sign me up for updates on new products, stories, recipes and offers.\n\nEmail: ${email.value.trim()}\n\nThank you!`;
      response.querySelector('a').href = mailto('care@keerthinirmal.com', 'Newsletter subscription request', body);
      response.hidden = false;
    });
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const controls = document.querySelector('.contact-controls');
  const motionButton = controls.querySelector('button');
  const hero = document.querySelector('.connect-hero');
  const visual = document.querySelector('.connect-visual');
  const landscape = document.querySelector('.contact-landscape');
  const progress = document.querySelector('.header-progress span');
  const reveals = [...document.querySelectorAll('.quick-contact, .message-heading, .contact-details, .contact-location, .partner-section, .contact-newsletter')];
  let paused = false, frame = 0, pageHeight = 1, heroEnd = 1, needsMeasure = true;
  try { paused = sessionStorage.getItem('contact-motion-paused') === 'true'; } catch { /* Optional preference. */ }
  const motionOff = () => paused || reducedMotion.matches;

  if ('IntersectionObserver' in window && !motionOff()) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: .06 });
    reveals.forEach(element => { element.classList.add('contact-reveal'); observer.observe(element); });
    document.body.classList.add('contact-motion-ready');
  }

  function update() {
    frame = 0;
    if (needsMeasure) {
      needsMeasure = false;
      pageHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      heroEnd = hero.getBoundingClientRect().bottom + scrollY;
    }
    progress.style.transform = `scaleX(${Math.min(1, scrollY / pageHeight)})`;
    if (!motionOff() && scrollY <= heroEnd) landscape.style.setProperty('--landscape-y', `${Math.min(22, scrollY * .045)}px`);
  }
  function requestUpdate(measure = false) {
    if (measure) needsMeasure = true;
    if (!frame) frame = requestAnimationFrame(update);
  }
  visual.addEventListener('pointermove', event => {
    if (motionOff() || !finePointer.matches) return;
    const rect = visual.getBoundingClientRect();
    landscape.style.setProperty('--photo-tilt', `${((event.clientX - rect.left) / rect.width - .5) * 2}deg`);
  });
  visual.addEventListener('pointerleave', () => landscape.style.setProperty('--photo-tilt', '0deg'));
  function syncMotion() {
    const off = motionOff();
    document.body.classList.toggle('contact-motion-paused', off);
    motionButton.setAttribute('aria-pressed', String(off));
    motionButton.disabled = reducedMotion.matches;
    const label = reducedMotion.matches ? 'Reduced motion enabled' : paused ? 'Resume animation' : 'Pause animation';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.querySelector('span').textContent = off ? '▷' : 'Ⅱ';
    if (off) {
      reveals.forEach(element => element.classList.add('is-visible'));
      landscape.style.setProperty('--photo-tilt', '0deg');
    }
  }
  controls.hidden = false;
  motionButton.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('contact-motion-paused', String(paused)); } catch { /* Optional preference. */ }
    syncMotion();
  });
  reducedMotion.addEventListener('change', syncMotion);
  addEventListener('scroll', () => requestUpdate(), { passive: true });
  addEventListener('resize', () => requestUpdate(true), { passive: true });
  addEventListener('pageshow', () => requestUpdate(true));
  document.fonts?.ready.then(() => requestUpdate(true));
  if ('ResizeObserver' in window) new ResizeObserver(() => requestUpdate(true)).observe(document.body);
  syncMotion();
  requestUpdate(true);
})();
