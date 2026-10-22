(function () {
  'use strict';
  const ORDER_KEY = 'doceMigalhaPedidos';
  const PRODUCT_KEY = 'doceMigalhaCardapio';
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
  const escapeText = value => String(value ?? '');
  const sampleOrders = [
    { id:'DM-4821931', nome:'Mariana Costa', email:'mariana@example.com', telefone:'(31) 98888-1234', bolo:'Trufa de chocolate', tamanho:'20 cm — serve 14 pessoas', data:datePlus(4), horario:'14:00', observacoes:'Decoração em tons de rosa; escrever “Parabéns, Luísa!”.', total:290, status:'Novo', criadoEm:new Date().toISOString() },
    { id:'DM-4821902', nome:'Rafael Almeida', email:'rafael@example.com', telefone:'(31) 97777-4321', bolo:'Red velvet', tamanho:'25 cm — serve 24 pessoas', data:datePlus(6), horario:'16:00', observacoes:'Sem castanhas, por favor.', total:380, status:'Confirmado', criadoEm:new Date(Date.now()-86400000).toISOString() },
    { id:'DM-4821844', nome:'Camila Souza', email:'camila@example.com', telefone:'(31) 96666-7777', bolo:'Baunilha clássica', tamanho:'15 cm — serve 8 pessoas', data:datePlus(3), horario:'10:00', observacoes:'Bolo para aniversário infantil.', total:190, status:'Em análise', criadoEm:new Date(Date.now()-2*86400000).toISOString() },
    { id:'DM-4821701', nome:'Pedro Martins', email:'pedro@example.com', telefone:'(31) 95555-0000', bolo:'Personalizado', tamanho:'Dois andares — 30+ pessoas', data:datePlus(14), horario:'12:00', observacoes:'Tema botânico, folhas e flores comestíveis.', total:580, status:'Concluído', criadoEm:new Date(Date.now()-4*86400000).toISOString() },
    { id:'DM-4821668', nome:'Juliana Ferreira', email:'juliana@example.com', telefone:'(31) 94444-3333', bolo:'Limão com mirtilo', tamanho:'20 cm — serve 14 pessoas', data:datePlus(2), horario:'18:00', observacoes:'', total:280, status:'Cancelado', criadoEm:new Date(Date.now()-5*86400000).toISOString() }
  ];
  function datePlus(days) { const d = new Date(); d.setDate(d.getDate() + days); const tz = d.getTimezoneOffset()*60000; return new Date(d.getTime()-tz).toISOString().slice(0,10); }
  const defaultProducts = [
    { id:'p1', nome:'Baunilha clássica', descricao:'Massa de baunilha, creme e geleia de framboesa.', preco:190, emoji:'🍰' },
    { id:'p2', nome:'Trufa de chocolate', descricao:'Massa de cacau e ganache cremosa.', preco:220, emoji:'🍫' },
    { id:'p3', nome:'Red velvet', descricao:'Massa aveludada com cream cheese.', preco:230, emoji:'🍒' },
    { id:'p4', nome:'Limão com mirtilo', descricao:'Massa cítrica e creme leve.', preco:210, emoji:'🍋' },
    { id:'p5', nome:'Personalizado', descricao:'Projeto sob medida para sua comemoração.', preco:290, emoji:'🎨' }
  ];
  const $ = id => document.getElementById(id);
  function read(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; } catch (_) { return fallback; } }
  function saveOrders(orders) { localStorage.setItem(ORDER_KEY, JSON.stringify(orders)); }
  function saveProducts(products) { localStorage.setItem(PRODUCT_KEY, JSON.stringify(products)); }
  function getOrders() { return read(ORDER_KEY, []); }
  function getProducts() { return read(PRODUCT_KEY, defaultProducts); }
  function fmtDate(date) { if (!date) return '—'; const parsed = new Date(date + 'T12:00:00'); return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('pt-BR'); }
  function statusClass(status) { return 'status-' + status.replaceAll(' ', '-'); }
  function createCellText(text, className) { const el = document.createElement('span'); el.textContent = escapeText(text); if (className) el.className = className; return el; }
  function render() {
    const all = getOrders();
    const search = $('search').value.trim().toLocaleLowerCase('pt-BR');
    const status = $('status-filter').value;
    const filtered = all.filter(order => {
      const matches = [order.nome, order.email, order.id, order.bolo].some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(search));
      return matches && (!status || order.status === status);
    });
    $('stat-total').textContent = all.length;
    $('stat-new').textContent = all.filter(o => o.status === 'Novo').length;
    $('stat-confirmed').textContent = all.filter(o => o.status === 'Confirmado').length;
    $('stat-value').textContent = money(all.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + Number(o.total || 0), 0));
    const tbody = $('orders-body'); tbody.replaceChildren();
    filtered.forEach(order => {
      const tr = document.createElement('tr');
      const customer = document.createElement('td');
      customer.append(createCellText(order.id, 'subtext'), createCellText(order.nome, 'customer-name'), createCellText(order.email, 'subtext'));
      const cake = document.createElement('td'); cake.append(createCellText(order.bolo), createCellText(order.tamanho, 'subtext'));
      const pickup = document.createElement('td'); pickup.append(createCellText(fmtDate(order.data)), createCellText('às ' + (order.horario || '—'), 'subtext'));
      const amount = document.createElement('td'); amount.textContent = money(order.total);
      const statusCell = document.createElement('td'); const badge = createCellText(order.status, 'status ' + statusClass(order.status)); statusCell.append(badge);
      const actions = document.createElement('td'); const actionWrap = document.createElement('div'); actionWrap.className = 'row-actions';
      const details = document.createElement('button'); details.className = 'small-btn'; details.textContent = 'Detalhes'; details.addEventListener('click', () => showDetails(order.id));
      const statusButton = document.createElement('button'); statusButton.className = 'small-btn'; statusButton.textContent = 'Alterar status'; statusButton.addEventListener('click', () => changeStatus(order.id));
      actionWrap.append(details, statusButton); actions.append(actionWrap);
      tr.append(customer, cake, pickup, amount, statusCell, actions); tbody.append(tr);
    });
    $('empty-state').hidden = filtered.length > 0;
    $('result-count').textContent = `${filtered.length} de ${all.length} pedido(s)`;
    renderProducts();
  }
  function showDetails(id) {
    const order = getOrders().find(item => item.id === id); if (!order) return;
    const fields = [['Código',order.id],['Cliente',order.nome],['E-mail',order.email],['Telefone',order.telefone || 'Não informado'],['Bolo',order.bolo],['Tamanho',order.tamanho],['Data de retirada',fmtDate(order.data)],['Horário',order.horario],['Valor estimado',money(order.total)],['Status',order.status],['Observações',order.observacoes || 'Nenhuma'],['Criado em',order.criadoEm ? new Date(order.criadoEm).toLocaleString('pt-BR') : '—']];
    const dl = document.createElement('dl'); dl.className = 'details-list';
    fields.forEach(([label,value]) => { const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=escapeText(value);dl.append(dt,dd); });
    $('details-content').replaceChildren(dl); $('details-dialog').showModal();
  }
  function changeStatus(id) {
    const orders = getOrders(); const order = orders.find(item => item.id === id); if (!order) return;
    const statuses = ['Novo','Em análise','Confirmado','Concluído','Cancelado'];
    const current = statuses.indexOf(order.status);
    const choice = prompt('Digite o novo status:\\n' + statuses.join(' / '), statuses[(current + 1) % statuses.length]);
    if (choice === null) return;
    const normalized = statuses.find(s => s.toLocaleLowerCase('pt-BR') === choice.trim().toLocaleLowerCase('pt-BR'));
    if (!normalized) { alert('Status inválido. Use: ' + statuses.join(', ')); return; }
    order.status = normalized; saveOrders(orders); render();
  }
  function renderProducts() {
    const grid = $('products-grid'); grid.replaceChildren();
    getProducts().forEach(product => {
      const card = document.createElement('article'); card.className='product-card';
      const emoji = createCellText(product.emoji || '🎂','product-emoji');
      const info = document.createElement('div'); info.className='product-info';
      const name = document.createElement('h3'); name.textContent=product.nome;
      const description = document.createElement('p'); description.textContent=product.descricao || 'Sem descrição.';
      const price = createCellText('A partir de ' + money(product.preco),'product-price');
      const controls = document.createElement('div'); controls.className='product-controls';
      const edit = document.createElement('button'); edit.className='small-btn'; edit.textContent='Editar'; edit.addEventListener('click',()=>editProduct(product.id));
      const remove = document.createElement('button'); remove.className='small-btn'; remove.textContent='Excluir'; remove.addEventListener('click',()=>deleteProduct(product.id));
      controls.append(edit,remove); info.append(name,description,price,controls); card.append(emoji,info); grid.append(card);
    });
  }
  function editProduct(id) {
    const products=getProducts(), product=products.find(p=>p.id===id); if(!product)return;
    const name=prompt('Nome do item:',product.nome); if(name===null)return;
    const price=prompt('Preço inicial em reais:',String(product.preco).replace('.',',')); if(price===null)return;
    const parsed=Number(price.trim().replace(',','.'));
    if(!name.trim()||!Number.isFinite(parsed)||parsed<=0){alert('Informe nome e preço válido.');return;}
    product.nome=name.trim(); product.preco=parsed; saveProducts(products); renderProducts();
  }
  function deleteProduct(id) {
    const product=getProducts().find(p=>p.id===id); if(!product)return;
    if(!confirm(`Excluir "${product.nome}" do cardápio demonstrativo?`))return;
    saveProducts(getProducts().filter(p=>p.id!==id)); renderProducts();
  }
  $('search').addEventListener('input',render); $('status-filter').addEventListener('change',render);
  $('seed-btn').addEventListener('click',()=>{
    const current=getOrders();
    if(current.length && !confirm('Substituir os pedidos locais atuais pelos exemplos?'))return;
    saveOrders(sampleOrders.map(o=>({...o}))); render();
  });
  $('clear-btn').addEventListener('click',()=>{
    if(!confirm('Apagar todos os pedidos salvos neste navegador? Esta ação não pode ser desfeita.'))return;
    localStorage.removeItem(ORDER_KEY); render();
  });
  $('export-btn').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({exportadoEm:new Date().toISOString(),pedidos:getOrders()},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url;a.download='pedidos-doce-migalha.json';a.click();URL.revokeObjectURL(url);
  });
  $('product-form').addEventListener('submit',event=>{
    event.preventDefault(); const nome=$('product-name').value.trim(); const preco=Number($('product-price').value); const descricao=$('product-description').value.trim();
    if(!nome||!Number.isFinite(preco)||preco<=0)return;
    const products=getProducts(); products.push({id:'p'+Date.now(),nome,preco,descricao,emoji:'🎂'});saveProducts(products);event.target.reset();renderProducts();
  });
  $('close-dialog').addEventListener('click',()=>$('details-dialog').close());
  $('dialog-close-bottom').addEventListener('click',()=>$('details-dialog').close());
  $('details-dialog').addEventListener('click',event=>{if(event.target===$('details-dialog'))$('details-dialog').close();});
  if (!localStorage.getItem(ORDER_KEY)) saveOrders(sampleOrders.map(o=>({...o})));
  if (!localStorage.getItem(PRODUCT_KEY)) saveProducts(defaultProducts);
  render();
})();
