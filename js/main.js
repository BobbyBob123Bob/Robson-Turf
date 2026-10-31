(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  const header = $('.site-header');
  const nav = $('#main-nav');
  const toggle = $('.nav-toggle');
  const mobileBar = $('.mobile-bar');
  const hero = $('.hero');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
    if (mobileBar && hero) {
      mobileBar.classList.toggle('show', window.scrollY > hero.offsetHeight * 0.6);
    }
    if (hero && window.scrollY < hero.offsetHeight * 0.5) {
      $$('#main-nav a.active').forEach((a) => a.classList.remove('active'));
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('a[href^="#"]', nav);
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.variety-card, .service-card, .finder, .calc, .timeline li, .faq details, .steps li');
  if ('IntersectionObserver' in window) {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Turf finder ---------- */
  const VARIETIES = {
    buffalo: {
      name: 'Buffalo',
      why: {
        shade: 'It holds up in part shade far better than couch or kikuyu, and stays soft underfoot.',
        soft: 'Its broad, soft leaf is great for barefoot backyards, and it needs less mowing than the others.'
      }
    },
    couch: {
      name: 'Couch',
      why: { neat: 'For a fine, manicured lawn in full sun, couch gives that tight, striped finish and bounces back from heavy use.' }
    },
    kikuyu: {
      name: 'Kikuyu',
      why: { budget: 'For covering a big sunny area affordably, kikuyu establishes fast and recovers quickly from wear. Just keep the mower handy.' }
    }
  };

  const finderForm = $('#finder-form');
  const finderResult = $('#finder-result');
  if (finderForm) {
    finderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(finderForm);
      const sun = data.get('sun');
      const wear = data.get('wear');
      const priority = data.get('priority');
      if (!sun || !wear || !priority) {
        finderResult.hidden = false;
        finderResult.innerHTML = '<p>Please answer all three questions.</p>';
        return;
      }

      let pick, reason;
      if (sun === 'part') {
        pick = 'buffalo'; reason = VARIETIES.buffalo.why.shade;
      } else if (priority === 'neat') {
        pick = 'couch'; reason = VARIETIES.couch.why.neat;
      } else if (priority === 'budget') {
        pick = 'kikuyu'; reason = VARIETIES.kikuyu.why.budget;
      } else {
        pick = 'buffalo'; reason = VARIETIES.buffalo.why.soft;
      }
      if (wear === 'heavy' && pick === 'buffalo') {
        reason += ' It also handles kids and dogs well.';
      }

      $$('.variety-card').forEach((c) => c.classList.toggle('highlight', c.id === pick));
      finderResult.hidden = false;
      finderResult.innerHTML =
        '<span>We’d suggest</span><strong>' + VARIETIES[pick].name + '</strong>' +
        '<p>' + reason + '</p>' +
        '<a href="#' + pick + '">See ' + VARIETIES[pick].name + ' details</a> &nbsp;·&nbsp; ' +
        '<a href="#quote" data-variety="' + VARIETIES[pick].name + '">Quote for ' + VARIETIES[pick].name + '</a>';
    });

    finderResult.addEventListener('click', (e) => {
      const v = e.target.closest('[data-variety]');
      if (v) $('#q-variety').value = v.dataset.variety;
    });
  }

  /* ---------- Turf calculator ---------- */
  const SHAPES = {
    rect: {
      label: 'Rectangle',
      icon: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      fields: [['length', 'Length (m)'], ['width', 'Width (m)']],
      area: (v) => v.length * v.width
    },
    circle: {
      label: 'Circle',
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      fields: [['diameter', 'Diameter (m)']],
      area: (v) => Math.PI * Math.pow(v.diameter / 2, 2)
    },
    triangle: {
      label: 'Triangle',
      icon: '<svg viewBox="0 0 24 24"><path d="M4 19h16L12 5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      fields: [['base', 'Base (m)'], ['height', 'Height (m)']],
      area: (v) => 0.5 * v.base * v.height
    }
  };

  const areasEl = $('#calc-areas');
  const wasteEl = $('#calc-waste');
  const areaOut = $('#calc-area');
  const orderOut = $('#calc-order');
  let areaCount = 0;

  const fmt = (n) => n.toLocaleString('en-AU', { maximumFractionDigits: 1 });

  function recalc() {
    let total = 0;
    $$('.calc-area', areasEl).forEach((row) => {
      const shape = SHAPES[row.dataset.shape];
      const vals = {};
      let ok = true;
      shape.fields.forEach(([key]) => {
        const n = parseFloat($('[data-key="' + key + '"]', row).value);
        if (!(n > 0)) ok = false;
        vals[key] = n;
      });
      const a = ok ? shape.area(vals) : 0;
      $('.sub', row).textContent = ok ? fmt(a) + ' m²' : '–';
      total += a;
    });
    const order = total > 0 ? Math.ceil(total * (1 + parseFloat(wasteEl.value))) : 0;
    areaOut.textContent = fmt(total) + ' m²';
    orderOut.textContent = order.toLocaleString('en-AU') + ' m²';
    return order;
  }

  function addArea(type) {
    const shape = SHAPES[type];
    areaCount += 1;
    const row = document.createElement('div');
    row.className = 'calc-area';
    row.dataset.shape = type;
    const inputs = shape.fields.map(([key, label]) => {
      const id = 'calc-' + areaCount + '-' + key;
      return '<label for="' + id + '">' + label +
        '<input id="' + id + '" data-key="' + key + '" type="number" min="0" step="0.1" inputmode="decimal" placeholder="0"></label>';
    }).join('');
    row.innerHTML =
      '<div class="shape">' + shape.icon + shape.label + '</div>' +
      '<div class="dims">' + inputs + '</div>' +
      '<div class="sub" aria-live="polite">–</div>' +
      '<button type="button" class="remove" aria-label="Remove ' + shape.label.toLowerCase() + '">×</button>';
    areasEl.appendChild(row);
    return row;
  }

  if (areasEl) {
    addArea('rect');
    areasEl.addEventListener('input', recalc);
    wasteEl.addEventListener('change', recalc);
    areasEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('remove')) return;
      e.target.closest('.calc-area').remove();
      if (!areasEl.children.length) addArea('rect');
      recalc();
    });
    $$('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
      const row = addArea(btn.dataset.add);
      $('input', row).focus();
      recalc();
    }));
    $('#calc-quote').addEventListener('click', () => {
      const order = recalc();
      if (order > 0) $('#q-area').value = order;
    });
  }

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach((tabs) => {
    const buttons = $$('[role="tab"]', tabs);
    const select = (btn) => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        $('#' + b.getAttribute('aria-controls')).hidden = !on;
      });
    };
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn));
      btn.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = buttons[(i + 1) % buttons.length];
        if (e.key === 'ArrowLeft') next = buttons[(i - 1 + buttons.length) % buttons.length];
        if (next) { e.preventDefault(); select(next); next.focus(); }
      });
    });
  });

  /* ---------- Quote form (opens the visitor's email app) ---------- */
  const form = $('#quote-form');
  const errorEl = $('#form-error');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = [];
      ['q-name', 'q-phone', 'q-suburb'].forEach((id) => {
        const el = $('#' + id);
        const bad = !el.value.trim();
        el.setAttribute('aria-invalid', String(bad));
        if (bad) missing.push($('label[for="' + id + '"]').textContent.trim());
      });
      const email = $('#q-email');
      const badEmail = email.value && !email.checkValidity();
      email.setAttribute('aria-invalid', String(badEmail));

      if (missing.length || badEmail) {
        errorEl.hidden = false;
        errorEl.textContent = missing.length
          ? 'Please fill in: ' + missing.join(', ') + '.'
          : 'Please check your email address.';
        (form.querySelector('[aria-invalid="true"]') || form).focus();
        return;
      }
      errorEl.hidden = true;

      const d = new FormData(form);
      const lines = [
        'Name: ' + d.get('name'),
        'Phone: ' + d.get('phone'),
        d.get('email') ? 'Email: ' + d.get('email') : null,
        'Suburb: ' + d.get('suburb'),
        'Variety: ' + d.get('variety'),
        d.get('area') ? 'Area: ' + d.get('area') + ' m²' : null,
        'Service: ' + d.get('service'),
        d.get('date') ? 'Preferred date: ' + d.get('date') : null,
        d.get('notes') ? '\nNotes:\n' + d.get('notes') : null
      ].filter(Boolean);

      const subject = 'Turf quote request – ' + d.get('suburb');
      window.location.href = 'mailto:info@robsonturf.com.au' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
