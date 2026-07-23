(() => {
  const config = window.AXIS_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const header = $('[data-header]');
  if (header) {
    const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 18);
    setHeader();
    addEventListener('scroll', setHeader, { passive: true });
  }

  const reveal = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    reveal.forEach(el => observer.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('is-visible'));
  }

  const form = $('#audit-form');
  if (!form) return;

  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key => {
    const input = form.elements[key];
    if (input) input.value = params.get(key) || '';
  });
  form.elements.page_url.value = location.href;

  const status = $('.form-status', form);
  const button = $('button[type="submit"]', form);
  const initialButton = button.innerHTML;

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus('');

    if (!form.reportValidity()) return;
    if (form.elements.company_website.value) return;

    const endpoint = config.formEndpoint || '';
    if (!endpoint.startsWith('https://script.google.com/')) {
      setStatus('Form setup is incomplete. Add your Google Apps Script URL in assets/js/config.js before launch.', 'error');
      return;
    }

    button.disabled = true;
    button.innerHTML = '<span>Submitting…</span>';

    const payload = new URLSearchParams(new FormData(form));
    payload.set('submitted_at', new Date().toISOString());
    payload.set('user_agent', navigator.userAgent);

    try {
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', body: payload });
      setStatus('Request received. Redirecting…', 'success');
      sessionStorage.setItem('axisAuditSubmitted', 'true');
      location.assign(config.thankYouPage || 'thank-you.html');
    } catch (error) {
      console.error(error);
      setStatus('The request could not be submitted. Check your connection and try again.', 'error');
      button.disabled = false;
      button.innerHTML = initialButton;
    }
  });
})();