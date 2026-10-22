(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- pricing ---------- */
  var SIZE_PRICE = { '6': 38, '8': 52, '10': 68, 'tiered': 96 };
  var FLAVOUR_EXTRA = { vanilla: 0, chocolate: 6, 'red-velvet': 8, lemon: 4, custom: 20 };

  /* ---------- reservation form ---------- */
  var form = document.getElementById('reservation-form');
  if (!form) return;

  var confirmation = document.getElementById('confirmation');
  var summary = document.getElementById('summary');
  var confirmEmail = document.getElementById('confirmation-email');
  var estimateEl = document.getElementById('estimate-amount');
  var cakeSel = document.getElementById('cake');
  var sizeSel = document.getElementById('size');
  var dateInput = document.getElementById('date');
  var newBtn = document.getElementById('new-reservation');

  /* enforce 48h minimum on the date picker */
  function isoLocalDate(d) {
    var tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  }
  var minDate = new Date(Date.now() + 48 * 3600 * 1000);
  dateInput.min = isoLocalDate(minDate);

  /* live estimate */
  function updateEstimate() {
    var base = SIZE_PRICE[sizeSel.value];
    var extra = FLAVOUR_EXTRA[cakeSel.value];
    if (base == null) { estimateEl.textContent = '—'; return; }
    estimateEl.textContent = '$' + (base + (extra || 0));
  }
  cakeSel.addEventListener('change', updateEstimate);
  sizeSel.addEventListener('change', updateEstimate);

  /* validation helpers */
  function fieldOf(input) { return input.closest('.field'); }
  function setError(input, on) { fieldOf(input).classList.toggle('invalid', !!on); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function validate() {
    var ok = true;
    var name = document.getElementById('name');
    var email = document.getElementById('email');

    if (!name.value.trim()) { setError(name, true); ok = false; } else setError(name, false);
    if (!validEmail(email.value.trim())) { setError(email, true); ok = false; } else setError(email, false);
    if (!cakeSel.value) { setError(cakeSel, true); ok = false; } else setError(cakeSel, false);
    if (!sizeSel.value) { setError(sizeSel, true); ok = false; } else setError(sizeSel, false);

    var d = new Date(dateInput.value + 'T00:00:00');
    var min = new Date(isoLocalDate(minDate) + 'T00:00:00');
    if (!dateInput.value || isNaN(d) || d < min) { setError(dateInput, true); ok = false; }
    else setError(dateInput, false);

    return ok;
  }

  [document.getElementById('name'), document.getElementById('email'), cakeSel, sizeSel, dateInput]
    .forEach(function (el) {
      el.addEventListener('input', function () { setError(el, false); });
      el.addEventListener('change', function () { setError(el, false); });
    });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      var firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var base = SIZE_PRICE[sizeSel.value] || 0;
    var extra = FLAVOUR_EXTRA[cakeSel.value] || 0;
    var total = base + extra;
    var code = 'SC-' + Math.random().toString(36).slice(2, 6).toUpperCase()
             + '-' + Date.now().toString().slice(-3);

    var cakeLabel = cakeSel.options[cakeSel.selectedIndex].text;
    var sizeLabel = sizeSel.options[sizeSel.selectedIndex].text;
    var dateLabel = new Date(dateInput.value + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    var timeLabel = document.getElementById('time').value;

    summary.innerHTML =
      '<dl>' +
        '<dt>Booking code</dt><dd>' + code + '</dd>' +
        '<dt>Cake</dt><dd>' + cakeLabel + '</dd>' +
        '<dt>Size</dt><dd>' + sizeLabel + '</dd>' +
        '<dt>Pick-up</dt><dd>' + dateLabel + ' · ' + timeLabel + '</dd>' +
        '<dt>Estimated total</dt><dd>$' + total + '</dd>' +
      '</dl>';

    confirmEmail.textContent = document.getElementById('email').value.trim();
    form.style.display = 'none';
    confirmation.classList.add('show');
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  newBtn.addEventListener('click', function () {
    form.reset();
    updateEstimate();
    form.style.display = '';
    confirmation.classList.remove('show');
    document.getElementById('name').focus();
  });
})();
