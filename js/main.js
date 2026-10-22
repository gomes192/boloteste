(function () {
  'use strict';
  const STORAGE_KEY = 'doceMigalhaPedidos';
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', event => {
      if (event.target.tagName === 'A') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('in'));

  const SIZE_PRICE = { '6': 190, '8': 260, '10': 340, tiered: 480 };
  const FLAVOUR_EXTRA = { vanilla: 0, chocolate: 30, 'red-velvet': 40, lemon: 20, custom: 100 };
  const CAKE_LABELS = { vanilla: 'Baunilha clássica', chocolate: 'Trufa de chocolate', 'red-velvet': 'Red velvet', lemon: 'Limão com mirtilo', custom: 'Personalizado' };
  const form = document.getElementById('reservation-form');
  if (!form) return;
  const confirmation = document.getElementById('confirmation');
  const summary = document.getElementById('summary');
  const confirmEmail = document.getElementById('confirmation-email');
  const estimateEl = document.getElementById('estimate-amount');
  const cakeSel = document.getElementById('cake');
  const sizeSel = document.getElementById('size');
  const dateInput = document.getElementById('date');
  const timeSel = document.getElementById('time');
  const newBtn = document.getElementById('new-reservation');
  const localISODate = date => {
    const tz = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tz).toISOString().slice(0, 10);
  };
  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  dateInput.min = localISODate(minDate);

  function totalPrice() {
    if (!SIZE_PRICE[sizeSel.value] || !cakeSel.value) return null;
    return SIZE_PRICE[sizeSel.value] + (FLAVOUR_EXTRA[cakeSel.value] || 0);
  }
  function updateEstimate() {
    const total = totalPrice();
    estimateEl.textContent = total === null ? '—' : money(total);
  }
  cakeSel.addEventListener('change', updateEstimate);
  sizeSel.addEventListener('change', updateEstimate);

  function fieldOf(input) { return input.closest('.field'); }
  function setError(input, on) { fieldOf(input).classList.toggle('invalid', Boolean(on)); }
  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function validate() {
    let ok = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    [[name, !name.value.trim()], [email, !validEmail(email.value.trim())],
      [cakeSel, !cakeSel.value], [sizeSel, !sizeSel.value]].forEach(([input, invalid]) => {
        setError(input, invalid); if (invalid) ok = false;
      });
    const chosenDate = new Date(dateInput.value + 'T00:00:00');
    const minDay = new Date(localISODate(minDate) + 'T00:00:00');
    const invalidDate = !dateInput.value || Number.isNaN(chosenDate.getTime()) || chosenDate < minDay;
    setError(dateInput, invalidDate);
    if (invalidDate) ok = false;
    return ok;
  }
  [document.getElementById('name'), document.getElementById('email'), cakeSel, sizeSel, dateInput]
    .forEach(el => {
      el.addEventListener('input', () => setError(el, false));
      el.addEventListener('change', () => setError(el, false));
    });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) {
      const firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    const total = totalPrice();
    const data = {
      id: 'DM-' + Date.now().toString().slice(-7),
      nome: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: document.getElementById('phone').value.trim(),
      bolo: CAKE_LABELS[cakeSel.value],
      tamanho: sizeSel.options[sizeSel.selectedIndex].text,
      data: dateInput.value,
      horario: timeSel.value,
      observacoes: document.getElementById('notes').value.trim(),
      total,
      status: 'Novo',
      criadoEm: new Date().toISOString()
    };
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) {}
    orders.unshift(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    summary.replaceChildren();
    const dl = document.createElement('dl');
    const rows = [
      ['Código do pedido', data.id], ['Bolo', data.bolo], ['Tamanho', data.tamanho],
      ['Retirada', new Date(data.data + 'T12:00:00').toLocaleDateString('pt-BR') + ' às ' + data.horario],
      ['Valor estimado', money(data.total)]
    ];
    rows.forEach(([label, value]) => {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      dl.append(dt, dd);
    });
    summary.append(dl);
    confirmEmail.textContent = data.email;
    form.style.display = 'none';
    confirmation.classList.add('show');
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  newBtn.addEventListener('click', () => {
    form.reset(); updateEstimate(); form.style.display = '';
    confirmation.classList.remove('show'); document.getElementById('name').focus();
  });
})();
