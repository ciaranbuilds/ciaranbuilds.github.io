/* Hazelwood Solutions — site script
   Loaded from our own origin only (CSP: script-src 'self').
   Never uses innerHTML / eval — all text is written with textContent. */
(function () {
  'use strict';

  // ── Clickjacking defence ───────────────────────────────
  // GitHub Pages can't send X-Frame-Options / frame-ancestors headers,
  // so refuse to be shown inside another site's frame.
  if (window.top !== window.self) {
    try { window.top.location.replace(window.self.location.href); }
    catch (e) { document.documentElement.style.display = 'none'; }
    return;
  }

  // Lets CSS know JS is running (so reveal animations never hide content for no-JS visitors)
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {

    // ── Footer year ──────────────────────────────────────
    var year = document.getElementById('year');
    if (year) { year.textContent = String(new Date().getFullYear()); }

    // ── Mobile nav ───────────────────────────────────────
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // ── Scroll reveal ────────────────────────────────────
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // ── Contact form (progressive enhancement) ───────────
    // Without JS the form still posts normally to Formspree.
    var form = document.getElementById('contact-form');
    if (!form || !window.fetch || !window.FormData) { return; }

    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');
    var ENDPOINT_PATTERN = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/;
    var MIN_FILL_MS = 3000; // humans take longer than 3s to fill a form
    var loadedAt = Date.now();
    var sending = false;

    function setStatus(kind, text) {
      status.className = 'form-status ' + (kind ? 'is-' + kind : '');
      status.textContent = text;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) { return; }

      if (!ENDPOINT_PATTERN.test(form.action)) {
        setStatus('error', 'The contact form isn’t set up yet. Please email us instead.');
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Bot checks: honeypot filled, or form submitted implausibly fast.
      var honeypot = form.querySelector('[name="_gotcha"]');
      if ((honeypot && honeypot.value) || (Date.now() - loadedAt) < MIN_FILL_MS) {
        form.reset();
        setStatus('success', 'Thanks — your message has been sent.');
        return;
      }

      sending = true;
      button.disabled = true;
      setStatus('', 'Sending…');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin'
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          setStatus('success', 'Thanks — your message has been sent. We’ll get back to you within one working day.');
        } else {
          setStatus('error', 'Sorry, something went wrong sending your message. Please try again, or email us directly.');
        }
      }).catch(function () {
        setStatus('error', 'We couldn’t reach the server. Please check your connection, or email us directly.');
      }).then(function () {
        sending = false;
        button.disabled = false;
      });
    });
  });
})();
