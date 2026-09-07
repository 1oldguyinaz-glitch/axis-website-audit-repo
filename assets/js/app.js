(() => {
  const config = window.AXIS_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const header = $('[data-header]');
  if (header) { const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 18); setHeader(); addEventListener('scroll', setHeader, { passive: true }); }

  const proofSection = $('#proof');
  if (proofSection && !$('#concepts')) {
    proofSection.insertAdjacentHTML('afterend', `
      <section class="section concept-section" id="concepts">
        <div class="container">
          <div class="section-heading centered reveal">
            <p class="eyebrow">CONCEPT REDESIGNS</p>
            <h2>Don’t imagine the difference. See the direction.</h2>
            <p>These are Axis concept redesigns showing how we simplify customer paths, strengthen trust, and make the next action obvious across desktop and mobile.</p>
          </div>
          <div class="concept-grid">
            <article class="concept-card reveal"><div class="concept-labels"><span>Before: common friction</span><span>After: desktop concept</span></div><div class="concept-stage"><div class="before-panel"><strong>Too much work for the visitor.</strong><p>We simplify the decision path before adding visual polish.</p><ul><li>Weak hierarchy</li><li>Unclear main action</li><li>Trust buried too late</li><li>Desktop-first flow</li></ul></div><div class="after-shot"><img src="design-reference/desktop-concept.png" alt="Axis desktop website redesign concept" loading="lazy"></div></div><footer><strong>Desktop redesign direction</strong><p>Clear offer, stronger hierarchy, visible proof, one dominant next step.</p></footer></article>
            <article class="concept-card reveal"><div class="concept-labels"><span>Before: generic presentation</span><span>After: human-centered concept</span></div><div class="concept-stage"><div class="before-panel"><strong>A site should feel like the business.</strong><p>Real personality should build trust without distracting from the sale.</p><ul><li>Generic presentation</li><li>Weak emotional connection</li><li>Proof disconnected from offer</li><li>No recognizable voice</li></ul></div><div class="after-shot"><img src="design-reference/family-desktop-concept.png" alt="Axis human-centered desktop concept" loading="lazy"></div></div><footer><strong>Human-centered redesign</strong><p>Story and credibility supporting the conversion path instead of competing with it.</p></footer></article>
            <article class="concept-card reveal"><div class="concept-labels"><span>Before: desktop squeezed onto phone</span><span>After: mobile concept</span></div><div class="concept-stage"><div class="before-panel"><strong>Mobile is its own journey.</strong><p>Phone users need faster decisions, larger actions, and less visual noise.</p><ul><li>Cramped navigation</li><li>CTA too far down</li><li>Small tap targets</li><li>Slow path to contact</li></ul></div><div class="after-shot"><img src="design-reference/mobile-concept.png" alt="Axis mobile redesign concept" loading="lazy"></div></div><footer><strong>Mobile redesign direction</strong><p>Simple, thumb-friendly, and built around the fastest useful next action.</p></footer></article>
            <article class="concept-card reveal"><div class="concept-labels"><span>Before: trust added later</span><span>After: mobile trust concept</span></div><div class="concept-stage"><div class="before-panel"><strong>Trust belongs in the decision path.</strong><p>Proof should appear exactly when a customer needs a reason to continue.</p><ul><li>Proof separated from CTA</li><li>Generic credibility</li><li>No human context</li><li>Story without direction</li></ul></div><div class="after-shot"><img src="design-reference/family-mobile-concept.png" alt="Axis mobile trust concept" loading="lazy"></div></div><footer><strong>Mobile trust direction</strong><p>Human proof integrated into a clean customer path.</p></footer></article>
          </div>
          <p class="concept-disclaimer">Concept work illustrates redesign direction and UX thinking. It is not presented as a claim of measured client performance.</p>
        </div>
      </section>`);
  }

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
    setTimeout(() => form.elements.business?.focus(), 450);
  }));
  const status = $('.form-status', form);
  const button = $('button[type="submit"]', form);
  const initialButton = button.innerHTML;
  const setStatus = (message, type = '') => { status.textContent = message; status.className = `form-status ${type}`.trim(); };
  const normalizeWebsite = value => { const raw = String(value || '').trim(); if (!raw) return ''; return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`; };
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