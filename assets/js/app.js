(() => {
  const config = window.AXIS_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const header = $('[data-header]');
  if (header) { const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 18); setHeader(); addEventListener('scroll', setHeader, { passive: true }); }
  const reveal = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
    reveal.forEach(el => observer.observe(el));
  } else reveal.forEach(el => el.classList.add('is-visible'));

  const form = $('#audit-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key => { const input = form.elements[key]; if (input) input.value = params.get(key) || ''; });
  form.elements.page_url.value = location.href;

  $$('.package-select').forEach(button => button.addEventListener('click', () => {
    form.elements.package_interest.value = button.dataset.package || 'Free diagnosis';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const business = form.elements.business;
    setTimeout(() => business?.focus(), 450);
  }));

  const status = $('.form-status', form);
  const button = $('button[type="submit"]', form);
  const initialButton = button.innerHTML;
  const setStatus = (message, type = '') => { status.textContent = message; status.className = `form-status ${type}`.trim(); };
  const normalizeWebsite = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault(); setStatus('');
    if (!form.reportValidity()) return;
    if (form.elements.company_website.value) return;
    const endpoint = config.formEndpoint || '';
    if (!endpoint.startsWith('https://script.google.com/')) { setStatus('Form setup is incomplete. Add the Apps Script URL before launch.', 'error'); return; }
    button.disabled = true; button.innerHTML = '<span>Submitting…</span>';
    const payload = new URLSearchParams(new FormData(form));
    payload.set('website', normalizeWebsite(form.elements.website.value));
    payload.set('source', 'Axis landing page V2');
    payload.set('lead_state', 'new');
    payload.set('next_action', 'Run website diagnosis');
    payload.set('submitted_at', new Date().toISOString());
    payload.set('user_agent', navigator.userAgent);
    try {
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: payload });
      setStatus('Request received. Redirecting…', 'success');
      sessionStorage.setItem('axisAuditSubmitted', 'true');
      sessionStorage.setItem('axisPackageInterest', payload.get('package_interest') || 'Free diagnosis');
      location.assign(config.thankYouPage || 'thank-you.html');
    } catch (error) {
      console.error(error); setStatus('The request could not be submitted. Check your connection and try again.', 'error'); button.disabled = false; button.innerHTML = initialButton;
    }
  });
})();