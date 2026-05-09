// ============================================================
//  DEPORTES NEON — Dashboard Cliente (conectado a API)
// ============================================================

(function authGuard() {
  if (!Auth.isLoggedIn()) { window.location.href = 'index.html'; return; }
  const u = Auth.getUser();
  if (u?.rol === 'admin') { window.location.href = 'dashboard.html'; }
})();

const ui = {
  calendarYear: new Date().getFullYear(), calendarMonth: new Date().getMonth(),
  editandoPerfil: false,
  productos: [], carrito: { items: [], subtotal: 0, impuestos: 0, total: 0 },
  favoritos: [], pedidos: [], tickets: [], eventos: [], dashboard: null,
};

document.addEventListener('DOMContentLoaded', async () => {
  const user = Auth.getUser();
  setText('user-display-name', user?.nombre || 'Usuario');
  await Promise.allSettled([loadDashboard(), loadProductos()]);
  updateBadgesFromCache(); initAvatarModal();
});

function navigate(pageId, linkEl, event) {
  event?.preventDefault();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (linkEl) linkEl.classList.add('active');
  else { const n = document.querySelector(`[data-page="${pageId}"]`); if (n) n.classList.add('active'); }
  if (pageId === 'inicio')    loadDashboard();
  if (pageId === 'tienda')    loadProductos();
  if (pageId === 'favoritos') loadFavoritos();
  if (pageId === 'carrito')   loadCarrito();
  if (pageId === 'pedidos')   loadPedidos();
  if (pageId === 'tickets')   loadTickets();
  if (pageId === 'calendario') loadEventos();
  if (pageId === 'perfil')    loadPerfil();
}

// ── Dashboard ──────────────────────────────────────────────
async function loadDashboard() {
  try {
    const data = await API.Dashboard.cliente(); ui.dashboard = data;
    const m = data.metricas;
    setText('stat-carrito', m.items_carrito || 0); setText('stat-favs', m.total_favoritos || 0);
    setText('stat-pedidos', m.total_pedidos || 0); setText('stat-gastado', '$' + parseFloat(m.total_gastado || 0).toFixed(2));
    setText('stat-tickets', m.tickets_abiertos || 0);
    const fg = document.getElementById('featured-grid');
    if (fg) fg.innerHTML = data.destacados.map(p => `
      <div class="featured-card" onclick="navigate('tienda',document.querySelector('[data-page=tienda]'))">
        <div class="featured-img">${p.img_url ? `<img src="${p.img_url}" alt="${p.nombre}" onerror="this.style.display='none'">` : '📦'}</div>
        <div class="featured-body"><p class="featured-name">${p.nombre}</p><span class="featured-price">$${parseFloat(p.precio).toFixed(2)}</span><span class="featured-rating">★ ${p.rating}</span></div>
      </div>`).join('');
    const it = document.getElementById('inicio-tickets');
    if (it) it.innerHTML = data.tickets_abiertos.length === 0
      ? '<div class="empty-tickets"><i class="fa-regular fa-ticket-simple"></i><p>No tienes tickets abiertos</p></div>'
      : data.tickets_abiertos.map(t => ticketCardHtml(t)).join('');
    const cartQty = parseInt(m.items_carrito || 0);
    setText('cart-bar-count', cartQty);
    const cartBar = document.getElementById('cart-bar');
    if (cartBar) cartBar.style.display = cartQty > 0 ? 'flex' : 'none';
    updateBadgesFromCache();
  } catch (err) { console.error('loadDashboard:', err); }
}

// ── Tienda ─────────────────────────────────────────────────
async function loadProductos(filtros = {}) {
  const grid = document.getElementById('products-grid'); if (!grid) return;
  grid.innerHTML = '<p style="color:var(--text-muted);padding:20px"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>';
  try {
    const data = await API.Productos.listar(filtros);
    ui.productos = data.data || [];
    renderProductos(ui.productos);
  } catch (err) { grid.innerHTML = `<p style="color:#ff4060;padding:20px">Error: ${err.message}</p>`; }
}

function renderProductos(lista) {
  const grid = document.getElementById('products-grid'); if (!grid) return;
  if (!lista || lista.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);padding:20px">No se encontraron productos</p>'; return; }
  grid.innerHTML = lista.map(p => buildProductCard(p)).join('');
}

function buildProductCard(p) {
  const inFav    = ui.favoritos.some(f => f.id === p.id);
  const cartItem = ui.carrito.items?.find(i => i.producto_id === p.id);
  const stars    = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const tipoTag  = p.tipo === 'alquiler' ? `<span class="product-tag tag-alquiler">Alquiler</span>` : `<span class="product-tag tag-compra">Compra</span>`;
  const estadoTag = p.estado === 'en-uso' ? `<span class="product-tag tag-en-uso">En uso</span>` : p.estado === 'desuso' ? `<span class="product-tag tag-desuso">Desuso</span>` : '';
  return `<div class="product-card">
    <div class="product-img-wrap">
      ${p.img_url ? `<img src="${p.img_url}" alt="${p.nombre}" onerror="this.style.display='none'">` : '📦'}
      ${p.featured ? '<span class="tag-featured">DEST.</span>' : ''}
    </div>
    <div class="product-body">
      <div class="product-tags">${tipoTag}${estadoTag}</div>
      <p class="product-name">${p.nombre}</p><p class="product-cat">${p.categoria}</p>
      <p class="product-desc">${p.descripcion || ''}</p>
      ${p.tipo === 'alquiler' && p.fecha_inicio ? `<p class="ticket-meta" style="margin-bottom:4px"><i class="fa-regular fa-calendar" style="color:var(--yellow)"></i> ${p.fecha_inicio}${p.fecha_fin ? ' → ' + p.fecha_fin : ''}</p>` : ''}
      <div class="product-price-row"><span class="product-price">$${parseFloat(p.precio).toFixed(2)}</span><span class="product-rating">${stars}</span></div>
      <p class="product-stock">Stock: <strong>${p.stock}</strong> uds.</p>
      <div class="product-actions">
        <button class="btn-agregar ${cartItem?'in-cart':''}" id="btn-cart-${p.id}" onclick="toggleCarrito(${p.id})">
          <i class="fa-solid fa-cart-plus"></i> ${cartItem ? `En carrito (${cartItem.cantidad})` : (p.tipo === 'alquiler' ? 'Alquilar' : 'Agregar')}
        </button>
        <button class="btn-icon fav ${inFav?'fav-active':''}" id="btn-fav-${p.id}" onclick="toggleFavorito(${p.id})" title="Favorito">
          <i class="fa-${inFav?'solid':'regular'} fa-heart"></i>
        </button>
      </div>
    </div>
  </div>`;
}

function filterProductos() {
  loadProductos({
    q: document.getElementById('search-input')?.value || '',
    categoria: document.getElementById('cat-filter')?.value || '',
    sort: document.getElementById('sort-filter')?.value || 'nombre',
    tipo: document.getElementById('tipo-filter')?.value || '',
    estado: document.getElementById('estado-filter')?.value || '',
    fecha_desde: document.getElementById('fecha-desde')?.value || '',
    fecha_hasta: document.getElementById('fecha-hasta')?.value || '',
  });
}
function resetFiltros() {
  ['search-input','cat-filter','sort-filter','tipo-filter','estado-filter','fecha-desde','fecha-hasta']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  loadProductos();
}

// ── Carrito ────────────────────────────────────────────────
async function loadCarrito() {
  const wrap = document.getElementById('carrito-wrap'); const empty = document.getElementById('empty-cart');
  try {
    const data = await API.Carrito.obtener(); ui.carrito = data;
    if (!data.items || data.items.length === 0) {
      if (wrap) wrap.style.display = 'none'; if (empty) empty.style.display = 'block'; return;
    }
    if (empty) empty.style.display = 'none'; if (wrap) wrap.style.display = 'grid';
    const cl = document.getElementById('cart-col-left'); const cr = document.getElementById('cart-col-right');
    if (cl) cl.innerHTML = `
      <p class="cart-items-count">${data.items.reduce((s,i) => s + i.cantidad, 0)} producto(s) en tu carrito</p>
      ${data.items.map(item => `<div class="cart-item-v2">
        <div class="cart-item-img">${item.img_url ? `<img src="${item.img_url}" alt="${item.nombre}" onerror="this.style.display='none'">` : '📦'}</div>
        <div class="cart-item-info" style="flex:1"><p class="cart-item-name">${item.nombre}</p><p class="cart-item-cat">${item.categoria}</p></div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="cambiarCantidad(${item.producto_id},${item.cantidad-1})">−</button>
          <span class="qty-val">${item.cantidad}</span>
          <button class="qty-btn" onclick="cambiarCantidad(${item.producto_id},${item.cantidad+1})">+</button>
          <span class="cart-max-label">Máx ${item.stock}</span>
        </div>
        <div style="text-align:right;min-width:80px">
          <p class="cart-item-subtotal">$${parseFloat(item.subtotal).toFixed(2)}</p>
          <p class="cart-unit-price">$${parseFloat(item.precio).toFixed(2)} c/u</p>
        </div>
        <button class="btn-icon del" onclick="quitarDelCarrito(${item.producto_id})" style="margin-left:4px"><i class="fa-solid fa-trash"></i></button>
      </div>`).join('')}`;
    if (cr) cr.innerHTML = `<div class="cart-summary-v2">
      <p class="cart-summary-title">Resumen del Pedido</p>
      ${data.items.map(i => `<div class="summary-row"><span class="lbl">${i.nombre} ×${i.cantidad}</span><span class="val">$${parseFloat(i.subtotal).toFixed(2)}</span></div>`).join('')}
      <div class="summary-row" style="margin-top:8px"><span class="lbl">Subtotal</span><span class="val">$${parseFloat(data.subtotal).toFixed(2)}</span></div>
      <div class="summary-row"><span class="lbl">Envío</span><span class="val free">GRATIS</span></div>
      <div class="summary-row"><span class="lbl">Impuestos (19%)</span><span class="val">$${parseFloat(data.impuestos).toFixed(2)}</span></div>
      <div class="summary-total"><span class="lbl">Total</span><span class="val">$${parseFloat(data.total).toFixed(2)}</span></div>
      <button class="btn-checkout" onclick="checkout()"><i class="fa-solid fa-credit-card"></i> Proceder al Pago</button>
      <button class="btn-seguir" onclick="navigate('tienda',document.querySelector('[data-page=tienda]'))">← Seguir Comprando</button>
      <button class="btn-sm btn-danger" style="width:100%;margin-top:8px;justify-content:center" onclick="vaciarCarrito()"><i class="fa-solid fa-trash"></i> Vaciar Carrito</button>
    </div>`;
    updateBadgesFromCache();
  } catch (err) { showNeonAlert('Error al cargar el carrito', 'error'); }
}

async function toggleCarrito(productoId) {
  const inCart = ui.carrito.items?.some(i => i.producto_id === productoId);
  const p = ui.productos.find(x => x.id === productoId);
  try {
    if (inCart) { await API.Carrito.quitar(productoId); showNeonAlert(`"${p?.nombre}" removido del carrito`, 'info'); }
    else { await API.Carrito.agregar(productoId, 1); showNeonAlert(`"${p?.nombre}" añadido al carrito`, 'success'); }
    await loadCarrito(); renderProductos(ui.productos); loadDashboard();
  } catch (err) { showNeonAlert(err.message, 'error'); }
}

async function cambiarCantidad(id, qty) {
  if (qty < 1) { await quitarDelCarrito(id); return; }
  try { await API.Carrito.actualizar(id, qty); await loadCarrito(); } catch (err) { showNeonAlert(err.message, 'error'); }
}
async function quitarDelCarrito(id) {
  try { await API.Carrito.quitar(id); showNeonAlert('Producto removido', 'info'); await loadCarrito(); loadDashboard(); }
  catch (err) { showNeonAlert(err.message, 'error'); }
}
async function vaciarCarrito() {
  if (!confirm('¿Vaciar el carrito?')) return;
  try { await API.Carrito.vaciar(); showNeonAlert('Carrito vaciado', 'info'); await loadCarrito(); loadDashboard(); }
  catch (err) { showNeonAlert(err.message, 'error'); }
}
async function checkout() {
  const user = Auth.getUser();
  try {
    const result = await API.Pedidos.checkout(user?.direccion || '');
    showNeonAlert(`¡${result.message} Total: $${parseFloat(result.pedido.total).toFixed(2)}`, 'success');
    await Promise.all([loadCarrito(), loadPedidos(), loadDashboard()]);
    navigate('pedidos', document.querySelector('[data-page=pedidos]'));
  } catch (err) { showNeonAlert(err.message, 'error'); }
}

// ── Favoritos ──────────────────────────────────────────────
async function loadFavoritos() {
  const grid = document.getElementById('favorites-grid'); const empty = document.getElementById('empty-fav'); const bar = document.getElementById('favs-total-bar');
  try {
    const data = await API.Favoritos.obtener(); ui.favoritos = data.items || [];
    if (ui.favoritos.length === 0) { if (grid) grid.innerHTML = ''; if (empty) empty.style.display = 'block'; if (bar) bar.style.display = 'none'; return; }
    if (empty) empty.style.display = 'none';
    if (bar) { bar.style.display = 'flex'; setText('favs-count', ui.favoritos.length); setText('favs-valor', '$' + parseFloat(data.total_valor || 0).toFixed(2)); }
    if (grid) grid.innerHTML = ui.favoritos.map(p => buildProductCard(p)).join('');
  } catch (err) { if (grid) grid.innerHTML = `<p style="color:#ff4060;padding:20px">Error: ${err.message}</p>`; }
}

async function toggleFavorito(id) {
  const inFav = ui.favoritos.some(f => f.id === id); const p = ui.productos.find(x => x.id === id);
  try {
    if (inFav) { await API.Favoritos.quitar(id); ui.favoritos = ui.favoritos.filter(f => f.id !== id); showNeonAlert(`"${p?.nombre}" removido de favoritos`, 'info'); }
    else { await API.Favoritos.agregar(id); if (p) ui.favoritos.push(p); showNeonAlert(`"${p?.nombre}" añadido a favoritos`, 'success'); }
    const btn = document.getElementById('btn-fav-' + id);
    if (btn) { const nf = ui.favoritos.some(f => f.id === id); btn.className = `btn-icon fav ${nf?'fav-active':''}`; btn.innerHTML = `<i class="fa-${nf?'solid':'regular'} fa-heart"></i>`; }
    updateBadgesFromCache();
  } catch (err) { showNeonAlert(err.message, 'error'); }
}

// ── Pedidos ────────────────────────────────────────────────
async function loadPedidos() {
  const list = document.getElementById('orders-list'); if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);padding:20px"><i class="fa-solid fa-spinner fa-spin"></i> Cargando pedidos...</p>';
  try {
    ui.pedidos = await API.Pedidos.listar();
    if (!ui.pedidos || ui.pedidos.length === 0) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-clipboard-list" style="font-size:3rem;color:var(--yellow);margin-bottom:16px;"></i><p>No tienes pedidos aún</p><button class="btn-sm btn-cyan" style="margin-top:20px" onclick="navigate('tienda',document.querySelector('[data-page=tienda]'))">Ir a la Tienda</button></div>`;
      return;
    }
    list.innerHTML = ui.pedidos.map(o => buildOrderCard(o, false)).join('');
  } catch (err) { list.innerHTML = `<p style="color:#ff4060;padding:20px">Error: ${err.message}</p>`; }
}

function buildOrderCard(o, isAdmin) {
  const lineas = (o.lineas || []).map(l => `<div class="order-line-item"><div><p class="order-line-name">${l.nombre}</p><p class="order-line-qty">Cantidad: ${l.cantidad}</p></div><span class="order-line-price">$${parseFloat(l.subtotal||l.precio*l.cantidad).toFixed(2)}</span></div>`).join('');
  const sel = isAdmin ? `<select class="order-status-select" onchange="cambiarEstadoPedido(${o.id},this.value)"><option value="pending" ${o.estado==='pending'?'selected':''}>Pendiente</option><option value="transit" ${o.estado==='transit'?'selected':''}>En Camino</option><option value="delivered" ${o.estado==='delivered'?'selected':''}>Entregado</option><option value="cancelled" ${o.estado==='cancelled'?'selected':''}>Cancelado</option></select>` : `<span class="order-status status-${o.estado}">${estadoLabel(o.estado)}</span>`;
  return `<div class="order-card-v2"><div class="order-header-v2"><span class="order-id-v2">${o.codigo}</span><span class="order-status status-${o.estado}">${estadoLabel(o.estado)}</span><div style="flex:1"></div>${sel}</div><p class="order-date-v2">Creado: ${formatDate(o.created_at)}</p><div class="order-items-section" style="margin-top:14px"><p class="order-items-label">Artículos</p>${lineas}</div>${o.direccion_envio?`<div class="order-detail-row"><p class="order-detail-lbl"><i class="fa-solid fa-location-dot"></i> Dirección</p><p class="order-detail-val">${o.direccion_envio}</p></div>`:''} ${o.numero_seguimiento?`<div class="order-detail-row"><p class="order-detail-lbl"><i class="fa-solid fa-truck"></i> Seguimiento</p><p class="order-detail-val">${o.numero_seguimiento}</p></div>`:''}<div class="order-total-v2"><span>Total</span><span class="amt">$${parseFloat(o.total).toFixed(2)}</span></div></div>`;
}
function estadoLabel(e) { return {pending:'Pendiente',transit:'En Camino',delivered:'Entregado',cancelled:'Cancelado'}[e]||e; }

// ── Tickets ────────────────────────────────────────────────
async function loadTickets() {
  const list = document.getElementById('tickets-list'); if (!list) return;
  try {
    ui.tickets = await API.Tickets.listar();
    list.innerHTML = ui.tickets.length === 0
      ? '<div class="empty-tickets"><i class="fa-regular fa-ticket-simple"></i><p>No tienes tickets de soporte</p></div>'
      : ui.tickets.map(t => ticketCardHtml(t)).join('');
    updateBadgesFromCache();
  } catch (err) { list.innerHTML = `<p style="color:#ff4060;padding:20px">Error: ${err.message}</p>`; }
}
function ticketCardHtml(t) {
  const lbl = {pending:'Pendiente',open:'Abierto',closed:'Resuelto'};
  return `<div class="ticket-card status-${t.estado}"><div style="flex:1;min-width:200px"><span class="ticket-id">${t.codigo}</span><p class="ticket-asunto">${t.asunto}</p><p class="ticket-desc">${t.descripcion||''}</p><p class="ticket-meta">${formatDate(t.created_at)}</p></div><span class="ticket-badge ${t.estado}"><i class="fa-solid fa-circle" style="font-size:6px"></i> ${lbl[t.estado]||t.estado}</span></div>`;
}
function abrirNuevoTicket() { openModal('modal-nuevo-ticket'); }
async function crearTicket() {
  const asunto = document.getElementById('tk-asunto')?.value.trim(); const desc = document.getElementById('tk-desc')?.value.trim();
  if (!asunto || !desc) { showNeonAlert('Completa todos los campos', 'error'); return; }
  try {
    const t = await API.Tickets.crear(asunto, desc, 'media');
    showNeonAlert(`Ticket ${t.codigo} creado`, 'success');
    document.getElementById('tk-asunto').value = ''; document.getElementById('tk-desc').value = '';
    closeModal('modal-nuevo-ticket'); await loadTickets(); loadDashboard();
  } catch (err) { showNeonAlert(err.message, 'error'); }
}

// ── Calendario ─────────────────────────────────────────────
async function loadEventos() {
  try { ui.eventos = await API.Eventos.listar(ui.calendarYear, ui.calendarMonth + 1); } catch (err) { ui.eventos = []; }
  renderCalendar();
}
function renderCalendar() {
  const main = document.getElementById('calendar-main-wrap'); if (!main) return;
  const y = ui.calendarYear, m = ui.calendarMonth;
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']; const today = new Date();
  const firstDay = new Date(y,m,1).getDay(); const daysInMonth = new Date(y,m+1,0).getDate(); const daysInPrev = new Date(y,m,0).getDate();
  const eventDays = ui.eventos.map(ev => new Date(ev.fecha_hora).getDate());
  const headers = dayNames.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  let cells = '';
  for (let i = firstDay-1; i >= 0; i--) cells += `<div class="cal-day other-month">${daysInPrev-i}</div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const it = d===today.getDate()&&m===today.getMonth()&&y===today.getFullYear();
    const he = eventDays.includes(d);
    cells += `<div class="cal-day${it?' today':''}${he?' has-event':''}" onclick="abrirEventoDia(${y},${m+1},${d})">${d}</div>`;
  }
  const rem = 42 - firstDay - daysInMonth; for (let d=1;d<=rem;d++) cells += `<div class="cal-day other-month">${d}</div>`;
  main.innerHTML = `<div class="cal-header"><button class="cal-nav-btn" onclick="changeMonth(-1)">‹</button><span class="cal-title" style="color:var(--magenta)">${monthNames[m]} ${y}</span><button class="cal-nav-btn" onclick="changeMonth(1)">›</button></div><div class="cal-grid">${headers}${cells}</div>`;
  renderEventPanel();
}
function changeMonth(delta) {
  ui.calendarMonth += delta;
  if (ui.calendarMonth > 11) { ui.calendarMonth = 0; ui.calendarYear++; }
  if (ui.calendarMonth < 0)  { ui.calendarMonth = 11; ui.calendarYear--; }
  loadEventos();
}
function renderEventPanel() {
  const panel = document.getElementById('eventos-list'); if (!panel) return;
  if (!ui.eventos || ui.eventos.length === 0) { panel.innerHTML = '<div class="no-events"><i class="fa-regular fa-calendar-xmark"></i><p>No hay eventos próximos</p></div>'; return; }
  panel.innerHTML = ui.eventos.map(ev => { const d = new Date(ev.fecha_hora); return `<div class="event-item tipo-${ev.tipo.toLowerCase()}"><p class="event-title">${ev.titulo}</p><p class="event-meta">${d.toLocaleDateString('es-CO',{day:'2-digit',month:'short'})}, ${d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</p>${ev.descripcion?`<p class="event-meta">${ev.descripcion}</p>`:''}<span class="event-type-badge">${ev.tipo}</span></div>`; }).join('');
}
function abrirEventoDia(y,m,d) { const fi = document.getElementById('ev-fecha'); if (fi) fi.value = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T10:00`; openModal('modal-nuevo-evento'); }
async function crearEvento() {
  const titulo = document.getElementById('ev-titulo')?.value.trim(); const desc = document.getElementById('ev-desc')?.value.trim();
  const fecha = document.getElementById('ev-fecha')?.value; const tipo = document.getElementById('ev-tipo')?.value||'Evento';
  if (!titulo||!fecha) { showNeonAlert('Título y fecha son obligatorios','error'); return; }
  try {
    await API.Eventos.crear(titulo, desc, fecha, tipo);
    document.getElementById('ev-titulo').value=''; document.getElementById('ev-desc').value=''; document.getElementById('ev-fecha').value='';
    closeModal('modal-nuevo-evento'); showNeonAlert(`Evento "${titulo}" creado`,'success'); await loadEventos();
  } catch (err) { showNeonAlert(err.message, 'error'); }
}

// ── Perfil ─────────────────────────────────────────────────
async function loadPerfil() {
  const card = document.getElementById('perfil-card'); if (!card) return;
  try { const user = await API.Auth.me(); renderPerfilCard(user); } catch { renderPerfilCard(Auth.getUser()||{}); }
}
function renderPerfilCard(user) {
  window._perfilData = user;
  const card = document.getElementById('perfil-card'); if (!card) return;
  const editing = ui.editandoPerfil;
  const fields = ['nombre','email','telefono','direccion'];
  const icons  = {nombre:'fa-solid fa-user',email:'fa-regular fa-envelope',telefono:'fa-solid fa-phone',direccion:'fa-solid fa-location-dot'};
  const labels = {nombre:'Nombre completo',email:'Email',telefono:'Teléfono',direccion:'Dirección'};
  card.innerHTML = `
    <div class="profile-header-v2">
      <div class="profile-avatar avatar-wrap" onclick="openModal('modal-avatar')" style="cursor:pointer;position:relative">
        ${user.avatar_url ? `<img class="avatar-img" src="${user.avatar_url}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,245,255,0.4);">` : `<i class="fa-solid fa-user" style="font-size:2rem;color:var(--cyan);width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(0,245,255,0.15),rgba(255,0,200,0.15));border:2px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;"></i>`}
        <button class="avatar-edit-btn" onclick="openModal('modal-avatar')"><i class="fa-solid fa-camera"></i></button>
      </div>
      <div><p class="profile-name-v2">${user.nombre||''}</p><span class="profile-role-badge role-client">Cliente</span></div>
      <button class="btn-edit-profile" onclick="ui.editandoPerfil=!ui.editandoPerfil;renderPerfilCard(window._perfilData)">${editing?'Cancelar':"<i class='fa-solid fa-pen'></i> Editar Perfil"}</button>
    </div>
    ${fields.map(f => `<div class="profile-field ${editing?'editing':''}"><i class="${icons[f]}"></i><div class="profile-field-inner"><p class="profile-field-label">${labels[f]}</p>${editing?`<input id="pf-${f}" value="${user[f]||''}" class="modal-input" style="padding:0;background:none;border:none;font-size:0.9rem">`:`<p class="profile-field-val">${user[f]||'—'}</p>`}</div></div>`).join('')}
    ${editing ? `<div class="profile-edit-actions"><button class="btn-save-profile" onclick="guardarPerfil()"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button><button class="btn-cancel-edit" onclick="ui.editandoPerfil=false;renderPerfilCard(window._perfilData)">Cancelar</button></div>` : `<div class="profile-bottom-v2"><div class="profile-bottom-item"><p class="lbl">Favoritos guardados</p><p class="val">${ui.favoritos.length}</p></div><div class="profile-bottom-item"><p class="lbl">Pedidos realizados</p><p class="val">${ui.pedidos.length}</p></div><div class="profile-bottom-item"><p class="lbl">Rol de usuario</p><p class="val role-val">Cliente</p></div></div>`}`;
}
async function guardarPerfil() {
  try {
    const updated = await API.Auth.updatePerfil({ nombre: document.getElementById('pf-nombre')?.value, telefono: document.getElementById('pf-telefono')?.value, direccion: document.getElementById('pf-direccion')?.value });
    ui.editandoPerfil = false; renderPerfilCard(updated); showNeonAlert('Perfil actualizado','success');
  } catch (err) { showNeonAlert(err.message,'error'); }
}

// ── Avatar ─────────────────────────────────────────────────
function initAvatarModal() {
  document.querySelectorAll('.avatar-tab').forEach(tab => { tab.addEventListener('click', () => { document.querySelectorAll('.avatar-tab').forEach(t=>t.classList.remove('active')); document.querySelectorAll('.avatar-tab-content').forEach(c=>c.classList.remove('active')); tab.classList.add('active'); const tgt=document.getElementById('tab-'+tab.dataset.tab); if(tgt)tgt.classList.add('active'); }); });
  const dz=document.getElementById('avatar-drop-zone'); const fi=document.getElementById('avatar-file-input');
  if(dz){dz.addEventListener('click',()=>fi&&fi.click());dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='var(--cyan)';});dz.addEventListener('dragleave',()=>{dz.style.borderColor='';});dz.addEventListener('drop',e=>{e.preventDefault();dz.style.borderColor='';if(e.dataTransfer.files[0])processAvatarFile(e.dataTransfer.files[0]);});}
  if(fi)fi.addEventListener('change',e=>{if(e.target.files[0])processAvatarFile(e.target.files[0]);});
}
function processAvatarFile(file){if(!file.type.startsWith('image/')){showNeonAlert('Solo imágenes','error');return;}const r=new FileReader();r.onload=e=>{showAvatarPreview(e.target.result);window._pendingAvatar=e.target.result;};r.readAsDataURL(file);}
function previewAvatarUrl(){const url=document.getElementById('avatar-url-input')?.value.trim();if(!url){showNeonAlert('URL inválida','error');return;}showAvatarPreview(url);window._pendingAvatar=url;}
function showAvatarPreview(src){const w=document.getElementById('avatar-preview-wrap');if(!w)return;w.innerHTML=`<img src="${src}" alt="Vista previa">`;w.style.display='flex';}
async function guardarAvatar(){
  if(!window._pendingAvatar){showNeonAlert('Selecciona una imagen','error');return;}
  try{const updated=await API.Auth.updatePerfil({avatar_url:window._pendingAvatar});window._pendingAvatar=null;closeModal('modal-avatar');showNeonAlert('Avatar actualizado','success');if(window._perfilData){window._perfilData.avatar_url=updated.avatar_url;renderPerfilCard(window._perfilData);}}
  catch(err){showNeonAlert(err.message,'error');}
}

// ── Helpers globales ───────────────────────────────────────
function updateBadgesFromCache(){
  const cq=ui.carrito.items?.reduce((s,i)=>s+i.cantidad,0)||0;const fq=ui.favoritos.length;const tq=ui.tickets.filter(t=>t.estado!=='closed').length;
  const bc=document.getElementById('badge-cart');const bf=document.getElementById('badge-fav');const bt=document.getElementById('badge-tickets');
  if(bc){bc.textContent=cq;bc.style.display=cq?'':'none';}if(bf){bf.textContent=fq;bf.style.display=fq?'':'none';}if(bt){bt.textContent=tq;bt.style.display=tq?'':'none';}
}
function formatDate(iso){if(!iso)return'';return new Date(iso).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});}
function setText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function openModal(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}
function closeModalOutside(e,id){if(e.target.id===id)closeModal(id);}
function showNeonAlert(msg,type='info'){const icons={success:'✓',error:'✕',info:'ℹ'};const el=document.getElementById('neonAlert');if(!el)return;el.className=`neon-alert ${type}`;el.innerHTML=`<span>${icons[type]||'•'}</span> ${msg}`;el.style.display='flex';el.offsetHeight;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{el.style.display='none';},400);},3500);}
