// ============================================================
// DEPORTES NEON — Dashboard Admin v3
// ============================================================

const state = {
  productos: [
    { id:1, nombre:'Balón de Baloncesto',         cat:'Baloncesto',    desc:'Balón de baloncesto de cuero sintético, tamaño oficial para competición',      precio:69.99,  stock:28, rating:4.7, img:'https://images.unsplash.com/photo-1546519638405-a9ac1bc38b83?w=400&q=80', featured:false, tipo:'compra',   estado:'activo',  fechaInicio:'2026-01-01', fechaFin:'' },
    { id:2, nombre:'Balón de Fútbol Profesional',  cat:'Fútbol',       desc:'Balón oficial de competición, cosido a mano con tecnología termosellada',      precio:89.99,  stock:45, rating:4.8, img:'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80', featured:true,  tipo:'compra',   estado:'activo',  fechaInicio:'2026-01-01', fechaFin:'' },
    { id:3, nombre:'Casco de Ciclismo',            cat:'Ciclismo',     desc:'Casco aerodinámico con ventilación optimizada y sistema de ajuste rápido',     precio:129.99, stock:22, rating:4.8, img:'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=400&q=80', featured:true,  tipo:'alquiler', estado:'en-uso',  fechaInicio:'2026-03-01', fechaFin:'2026-06-30' },
    { id:4, nombre:'Gafas de Natación',            cat:'Natación',     desc:'Gafas profesionales con lentes antivaho y protección UV',                     precio:34.99,  stock:38, rating:4.4, img:'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&q=80', featured:false, tipo:'compra',   estado:'activo',  fechaInicio:'2026-01-01', fechaFin:'' },
    { id:5, nombre:'Tapete de Yoga Premium',       cat:'Yoga y Fitness',desc:'Tapete antideslizante de 6mm con material ecológico y correa de transporte', precio:49.99,  stock:52, rating:4.5, img:'https://images.unsplash.com/photo-1601925228591-d2dbcb27e0ea?w=400&q=80', featured:false, tipo:'alquiler', estado:'desuso',  fechaInicio:'2025-10-01', fechaFin:'2026-01-31' },
    { id:6, nombre:'Zapatillas Running Pro',       cat:'Calzado',      desc:'Zapatillas ligeras con suela amortiguada y tecnología de retorno de energía', precio:159.99, stock:18, rating:4.9, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', featured:true,  tipo:'compra',   estado:'activo',  fechaInicio:'2026-01-01', fechaFin:'' },
    { id:7, nombre:'Raqueta de Tenis',             cat:'Tenis',        desc:'Raqueta de grafito con cordaje de alta tensión y mango ergonómico',            precio:249.99, stock:15, rating:4.6, img:'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80', featured:true,  tipo:'alquiler', estado:'en-uso',  fechaInicio:'2026-02-15', fechaFin:'2026-08-15' },
    { id:8, nombre:'Set de Mancuernas Ajustables', cat:'Gimnasio',     desc:'Set completo de mancuernas de 2 a 24 kg con sistema de ajuste rápido',        precio:189.99, stock:12, rating:4.3, img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', featured:false, tipo:'compra',   estado:'activo',  fechaInicio:'2026-01-01', fechaFin:'' },
  ],
  carrito: [], favoritos: [], nextId: 9,
  pedidos: [
    {
      id:'#DN-0041', fecha:'10 Abr 2026', actualizado:'11 Abr 2026, 09:20', cliente:'carlos@email.com',
      lineas:[{nombre:'Balón de Fútbol Profesional',qty:1,precio:89.99},{nombre:'Gafas de Natación',qty:2,precio:34.99}],
      total:159.97, estado:'delivered', estadoLabel:'Entregado',
      direccion:'Calle Principal 123, Bogotá, Colombia', seguimiento:'SPT-2026-DN0041'
    },
    {
      id:'#DN-0038', fecha:'02 Abr 2026', actualizado:'04 Abr 2026, 14:10', cliente:'carlos@email.com',
      lineas:[{nombre:'Tapete de Yoga Premium',qty:1,precio:49.99}],
      total:49.99, estado:'transit', estadoLabel:'En Camino',
      direccion:'Avenida Siempre Viva 742, Medellín', seguimiento:'SPT-2026-DN0038'
    },
  ],
  tickets: [
    { id:'#TK-0012', usuario:'Carlos López',   asunto:'Error en pedido #DN-0038', desc:'El pedido llegó incompleto, falta un artículo.', fecha:'15 Abr 2026', estado:'pending', estadoLabel:'Pendiente' },
    { id:'#TK-0010', usuario:'María González', asunto:'Producto defectuoso',       desc:'El casco tiene un defecto en el cierre.',       fecha:'10 Abr 2026', estado:'open',    estadoLabel:'Abierto'   },
    { id:'#TK-0009', usuario:'Carlos López',   asunto:'Consulta sobre garantía',   desc:'¿Cuánto tiempo cubre la garantía?',             fecha:'03 Abr 2026', estado:'closed',  estadoLabel:'Resuelto'  },
  ],
  eventos: [],
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  avatarUrl: '',
  perfil: { nombre:'Admin User', email:'admin@deportesneon.com', telefono:'+34 123 456 789', direccion:'Calle Admin 123, Madrid, España' },
  editandoPerfil: false,
};

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard(); renderProductos(); renderCalendar(); updateBadges(); initAvatarModal();
});

// ── Navegación ─────────────────────────────────────────────
function navigate(pageId, linkEl) {
  event && event.preventDefault();
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const page=document.getElementById('page-'+pageId); if(page) page.classList.add('active');
  if(linkEl) linkEl.classList.add('active');
  else{const n=document.querySelector(`[data-page="${pageId}"]`);if(n)n.classList.add('active');}
  if(pageId==='favoritos') renderFavoritos();
  if(pageId==='carrito')   renderCarrito();
  if(pageId==='perfil')    renderPerfil();
  if(pageId==='dashboard') renderDashboard();
  if(pageId==='tickets')   renderTickets();
  if(pageId==='pedidos')   renderPedidos();
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard(){
  const ct=state.carrito.reduce((s,i)=>s+i.qty,0);
  const cs=state.carrito.reduce((s,i)=>{const p=state.productos.find(x=>x.id===i.productoId);return s+(p?p.precio*i.qty:0);},0);
  const op=state.tickets.filter(t=>t.estado!=='closed').length;
  setText('stat-total',state.productos.length); setText('stat-carrito',ct);
  setText('stat-pedidos',state.pedidos.length); setText('stat-favs',state.favoritos.length);
  setText('stat-tickets',op); setText('cart-bar-count',ct); setText('cart-bar-total','$'+cs.toFixed(2));

  const fg=document.getElementById('featured-grid');
  if(fg) fg.innerHTML=state.productos.filter(p=>p.featured).slice(0,3).map(p=>`
    <div class="featured-card" onclick="navigate('productos',document.querySelector('[data-page=productos]'))">
      <div class="featured-img">${p.img?`<img src="${p.img}" alt="${p.nombre}" onerror="this.style.display='none'">`:' 📦'}</div>
      <div class="featured-body"><p class="featured-name">${p.nombre}</p><span class="featured-price">$${p.precio.toFixed(2)}</span><span class="featured-rating">★ ${p.rating}</span></div>
    </div>`).join('');

  const trl=document.getElementById('top-rated-list');
  if(trl) trl.innerHTML=[...state.productos].sort((a,b)=>b.rating-a.rating).slice(0,3).map(p=>`
    <div class="top-item">
      <div class="top-thumb">${p.img?`<img src="${p.img}" alt="${p.nombre}" onerror="this.style.display='none'">`:' 📦'}</div>
      <div><p class="top-name">${p.nombre}</p><p class="top-meta"><span style="color:var(--yellow)">★ ${p.rating}</span></p><p class="top-price">$${p.precio.toFixed(2)}</p></div>
    </div>`).join('');

  const low=state.productos.filter(p=>p.stock<=15);
  const lsl=document.getElementById('low-stock-list');
  if(lsl) lsl.innerHTML=low.length===0
    ?'<p style="color:var(--text-muted);font-size:0.85rem">Sin alertas de stock bajo</p>'
    :low.map(p=>`<div class="low-stock-item"><div><p class="low-stock-name">${p.nombre}</p><p class="low-stock-cat">${p.cat}</p></div><span class="stock-badge">${p.stock} unidades</span></div>`).join('');

  renderTicketsDashboard();
}

// ── Tickets ────────────────────────────────────────────────
function renderTicketsDashboard(){
  const w=document.getElementById('dashboard-tickets'); if(!w) return;
  const rec=state.tickets.slice(0,3);
  w.innerHTML=rec.length===0
    ?'<div class="empty-tickets"><i class="fa-regular fa-ticket-simple"></i><p>No hay tickets activos</p></div>'
    :rec.map(t=>ticketCardHtml(t,true)).join('');
}
function renderTickets(){
  const l=document.getElementById('tickets-list'); if(!l) return;
  l.innerHTML=state.tickets.length===0
    ?'<div class="empty-tickets"><i class="fa-regular fa-ticket-simple"></i><p>No hay tickets</p></div>'
    :state.tickets.map(t=>ticketCardHtml(t,true)).join('');
}
function ticketCardHtml(t,isAdmin){
  const acciones=isAdmin&&t.estado!=='closed'
    ?`<button class="btn-sm btn-green" style="font-size:0.75rem;padding:4px 10px;margin-top:8px" onclick="resolverTicket('${t.id}')"><i class="fa-solid fa-check"></i> Resolver</button>`:'' ;
  return `<div class="ticket-card status-${t.estado}">
    <div style="flex:1;min-width:200px">
      <span class="ticket-id">${t.id}</span>${isAdmin&&t.usuario?` <span style="color:var(--text-muted);font-size:0.78rem">· ${t.usuario}</span>`:''}
      <p class="ticket-asunto">${t.asunto}</p><p class="ticket-desc">${t.desc}</p>
      <p class="ticket-meta">${t.fecha}</p>${acciones}
    </div>
    <span class="ticket-badge ${t.estado}"><i class="fa-solid fa-circle" style="font-size:6px"></i> ${t.estadoLabel}</span>
  </div>`;
}
function resolverTicket(id){
  const t=state.tickets.find(x=>x.id===id); if(!t) return;
  t.estado='closed';t.estadoLabel='Resuelto';
  renderTickets(); renderDashboard(); updateBadges();
  showNeonAlert(`Ticket ${id} resuelto`,'success');
}

// ── Productos ──────────────────────────────────────────────
function renderProductos(lista){
  const g=document.getElementById('products-grid'); if(!g) return;
  const items=lista||state.productos;
  g.innerHTML=items.length===0?'<p style="color:var(--text-muted);padding:20px">No se encontraron productos</p>':items.map(p=>buildProductCard(p)).join('');
}
function buildProductCard(p){
  const inCart=state.carrito.some(i=>i.productoId===p.id); const inFav=state.favoritos.includes(p.id);
  const tipoTag=p.tipo==='alquiler'?`<span class="product-tag tag-alquiler">Alquiler</span>`:`<span class="product-tag tag-compra">Compra</span>`;
  const estadoTag=p.estado==='en-uso'?`<span class="product-tag tag-en-uso">En uso</span>`:p.estado==='desuso'?`<span class="product-tag tag-desuso">Desuso</span>`:'';
  return `<div class="product-card" id="pcard-${p.id}">
    <div class="product-img-wrap">
      ${p.img?`<img src="${p.img}" alt="${p.nombre}" onerror="this.style.display='none'">`:' 📦'}
      ${p.featured?'<span class="tag-featured">DESTACADO</span>':''}
    </div>
    <div class="product-body">
      <div class="product-tags">${tipoTag}${estadoTag}</div>
      <p class="product-name">${p.nombre}</p><p class="product-cat">${p.cat}</p>
      <p class="product-desc">${p.desc}</p>
      ${p.tipo==='alquiler'&&p.fechaInicio?`<p class="ticket-meta" style="margin-bottom:4px"><i class="fa-regular fa-calendar" style="color:var(--yellow)"></i> ${p.fechaInicio}${p.fechaFin?' → '+p.fechaFin:''}</p>`:''}
      <div class="product-price-row"><span class="product-price">$${p.precio.toFixed(2)}</span><span class="product-rating">★ ${p.rating}</span></div>
      <p class="product-stock">Stock: <strong>${p.stock} unidades</strong></p>
      <div class="product-actions">
        <button class="btn-agregar ${inCart?'in-cart':''}" onclick="toggleCart(${p.id})" id="btn-cart-${p.id}">
          <i class="fa-solid fa-cart-shopping"></i> ${inCart?'En carrito':(p.tipo==='alquiler'?'Alquilar':'Agregar')}
        </button>
        <button class="btn-icon fav ${inFav?'fav-active':''}" onclick="toggleFav(${p.id})" id="btn-fav-${p.id}" title="Favorito"><i class="fa-${inFav?'solid':'regular'} fa-heart"></i></button>
        <button class="btn-icon edit" onclick="openEdit(${p.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon del" onclick="eliminarProducto(${p.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  </div>`;
}
function filterProductos(){
  const q=(document.getElementById('search-input')?.value||'').toLowerCase();
  const cat=document.getElementById('cat-filter')?.value||'';
  const sort=document.getElementById('sort-filter')?.value||'nombre';
  const tipoFil=document.getElementById('tipo-filter')?.value||'';
  const estadoFil=document.getElementById('estado-filter')?.value||'';
  const fd=document.getElementById('fecha-desde')?.value||'';
  const fh=document.getElementById('fecha-hasta')?.value||'';
  let lista=state.productos.filter(p=>{
    if(q&&!p.nombre.toLowerCase().includes(q)&&!p.desc.toLowerCase().includes(q)) return false;
    if(cat&&p.cat!==cat) return false;
    if(tipoFil&&p.tipo!==tipoFil) return false;
    if(estadoFil&&p.estado!==estadoFil) return false;
    if(fd&&p.fechaInicio&&p.fechaInicio<fd) return false;
    if(fh&&p.fechaFin&&p.fechaFin>fh) return false;
    return true;
  });
  if(sort==='precio-asc') lista.sort((a,b)=>a.precio-b.precio);
  if(sort==='precio-desc') lista.sort((a,b)=>b.precio-a.precio);
  if(sort==='rating') lista.sort((a,b)=>b.rating-a.rating);
  if(sort==='stock') lista.sort((a,b)=>b.stock-a.stock);
  if(sort==='nombre') lista.sort((a,b)=>a.nombre.localeCompare(b.nombre));
  renderProductos(lista);
}
function resetFiltros(){
  ['search-input','cat-filter','sort-filter','tipo-filter','estado-filter','fecha-desde','fecha-hasta']
    .forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderProductos();
}

// ── CRUD productos ─────────────────────────────────────────
function crearProducto(){
  const nombre=document.getElementById('np-nombre').value.trim(); const cat=document.getElementById('np-cat').value;
  const desc=document.getElementById('np-desc').value.trim(); const precio=parseFloat(document.getElementById('np-precio').value);
  const stock=parseInt(document.getElementById('np-stock').value); const rating=parseFloat(document.getElementById('np-rating').value);
  const img=document.getElementById('np-img').value.trim(); const featured=document.getElementById('np-featured').value==='true';
  const tipo=document.getElementById('np-tipo').value||'compra'; const estado=document.getElementById('np-estado').value||'activo';
  const fechaInicio=document.getElementById('np-fecha-inicio').value||''; const fechaFin=document.getElementById('np-fecha-fin').value||'';
  if(!nombre||!cat||isNaN(precio)||isNaN(stock)){showNeonAlert('Completa los campos obligatorios','error');return;}
  state.productos.push({id:state.nextId++,nombre,cat,desc,precio,stock,rating:rating||5,img,featured,tipo,estado,fechaInicio,fechaFin});
  renderProductos(); renderDashboard(); closeModal('modal-nuevo-producto');
  ['np-nombre','np-cat','np-desc','np-precio','np-stock','np-img','np-fecha-inicio','np-fecha-fin'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('np-rating').value=5; document.getElementById('np-featured').value='false';
  showNeonAlert(`"${nombre}" creado`,'success'); updateBadges();
}
function openEdit(id){
  const p=state.productos.find(x=>x.id===id); if(!p) return;
  const fields={
    'ep-id':p.id,'ep-nombre':p.nombre,'ep-cat':p.cat,'ep-desc':p.desc,
    'ep-precio':p.precio,'ep-stock':p.stock,'ep-rating':p.rating,'ep-img':p.img||'',
    'ep-featured':p.featured?'true':'false','ep-tipo':p.tipo||'compra',
    'ep-estado':p.estado||'activo','ep-fecha-inicio':p.fechaInicio||'','ep-fecha-fin':p.fechaFin||''
  };
  Object.entries(fields).forEach(([k,v])=>{const el=document.getElementById(k);if(el)el.value=v;});
  openModal('modal-editar-producto');
}
function guardarEdicion(){
  const id=parseInt(document.getElementById('ep-id').value); const p=state.productos.find(x=>x.id===id); if(!p) return;
  p.nombre=document.getElementById('ep-nombre').value.trim(); p.cat=document.getElementById('ep-cat').value;
  p.desc=document.getElementById('ep-desc').value.trim(); p.precio=parseFloat(document.getElementById('ep-precio').value);
  p.stock=parseInt(document.getElementById('ep-stock').value); p.rating=parseFloat(document.getElementById('ep-rating').value);
  p.img=document.getElementById('ep-img').value.trim(); p.featured=document.getElementById('ep-featured').value==='true';
  p.tipo=document.getElementById('ep-tipo').value; p.estado=document.getElementById('ep-estado').value;
  p.fechaInicio=document.getElementById('ep-fecha-inicio').value; p.fechaFin=document.getElementById('ep-fecha-fin').value;
  renderProductos(); renderDashboard(); closeModal('modal-editar-producto'); showNeonAlert(`"${p.nombre}" actualizado`,'success');
}
function eliminarProducto(id){
  const p=state.productos.find(x=>x.id===id); if(!p||!confirm(`¿Eliminar "${p.nombre}"?`)) return;
  state.productos=state.productos.filter(x=>x.id!==id);
  state.carrito=state.carrito.filter(i=>i.productoId!==id);
  state.favoritos=state.favoritos.filter(x=>x!==id);
  renderProductos(); renderDashboard(); updateBadges(); showNeonAlert(`"${p.nombre}" eliminado`,'info');
}

// ── Carrito admin ──────────────────────────────────────────
function toggleCart(id){
  const ex=state.carrito.find(i=>i.productoId===id); const p=state.productos.find(x=>x.id===id);
  if(ex){state.carrito=state.carrito.filter(i=>i.productoId!==id);showNeonAlert(`"${p?.nombre}" removido del carrito`,'info');}
  else{if(p&&p.stock<=0){showNeonAlert('Sin stock','error');return;}state.carrito.push({productoId:id,qty:1});showNeonAlert(`"${p?.nombre}" agregado`,'success');}
  const btn=document.getElementById('btn-cart-'+id);
  if(btn){const ic=state.carrito.some(i=>i.productoId===id);btn.innerHTML=`<i class="fa-solid fa-cart-shopping"></i> ${ic?'En carrito':(p?.tipo==='alquiler'?'Alquilar':'Agregar')}`;btn.style.background=ic?'rgba(0,245,255,0.2)':'';btn.style.color=ic?'var(--cyan)':'';}
  updateBadges(); renderDashboard();
}
function renderCarrito(){
  const wrap=document.getElementById('carrito-wrap'); const empty=document.getElementById('empty-cart');
  if(state.carrito.length===0){if(wrap)wrap.style.display='none';if(empty)empty.style.display='block';return;}
  if(empty)empty.style.display='none';
  if(wrap)wrap.style.display='grid';
  const subtotal=state.carrito.reduce((s,i)=>{const p=state.productos.find(x=>x.id===i.productoId);return s+(p?p.precio*i.qty:0);},0);
  const tax=+(subtotal*0.19).toFixed(2); const total=+(subtotal+tax).toFixed(2);

  const leftHtml=`<p class="cart-items-count">${state.carrito.reduce((s,i)=>s+i.qty,0)} producto(s) en el carrito</p>
    ${state.carrito.map(item=>{const p=state.productos.find(x=>x.id===item.productoId);if(!p)return'';return `<div class="cart-item-v2">
      <div class="cart-item-img">${p.img?`<img src="${p.img}" alt="${p.nombre}" onerror="this.style.display='none'">`:' 📦'}</div>
      <div class="cart-item-info" style="flex:1"><p class="cart-item-name">${p.nombre}</p><p class="cart-item-cat">${p.cat}</p></div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${p.id},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${p.id},1)">+</button>
        <span class="cart-max-label">Máx ${p.stock}</span>
      </div>
      <div style="text-align:right;min-width:80px">
        <p class="cart-item-subtotal">$${(p.precio*item.qty).toFixed(2)}</p>
        <p class="cart-unit-price">$${p.precio.toFixed(2)} c/u</p>
      </div>
      <button class="btn-icon del" onclick="removeFromCart(${p.id})" style="margin-left:4px"><i class="fa-solid fa-trash"></i></button>
    </div>`;}).join('')}`;

  const rightHtml=`<div class="cart-summary-v2">
    <p class="cart-summary-title">Resumen del Pedido</p>
    ${state.carrito.map(item=>{const p=state.productos.find(x=>x.id===item.productoId);if(!p)return'';return `<div class="summary-row"><span class="lbl">${p.nombre} ×${item.qty}</span><span class="val">$${(p.precio*item.qty).toFixed(2)}</span></div>`;}).join('')}
    <div class="summary-row" style="margin-top:8px"><span class="lbl">Subtotal</span><span class="val">$${subtotal.toFixed(2)}</span></div>
    <div class="summary-row"><span class="lbl">Envío</span><span class="val free">GRATIS</span></div>
    <div class="summary-row"><span class="lbl">Impuestos (19%)</span><span class="val">$${tax.toFixed(2)}</span></div>
    <div class="summary-total"><span class="lbl">Total</span><span class="val">$${total.toFixed(2)}</span></div>
    <button class="btn-checkout" onclick="checkoutCart()"><i class="fa-solid fa-credit-card"></i> Proceder al Pago</button>
    <button class="btn-seguir" onclick="navigate('productos',document.querySelector('[data-page=productos]'))">← Seguir Comprando</button>
    <button class="btn-sm btn-danger" style="width:100%;margin-top:8px;justify-content:center" onclick="clearCart()"><i class="fa-solid fa-trash"></i> Vaciar Carrito</button>
  </div>`;

  const cl=document.getElementById('cart-col-left'); const cr=document.getElementById('cart-col-right');
  if(cl)cl.innerHTML=leftHtml; if(cr)cr.innerHTML=rightHtml;
}
function changeQty(id,delta){
  const item=state.carrito.find(i=>i.productoId===id); if(!item) return;
  const p=state.productos.find(x=>x.id===id); const nq=item.qty+delta; if(nq<1) return;
  if(p&&nq>p.stock){showNeonAlert('Stock máximo: '+p.stock,'error');return;}
  item.qty=nq; renderCarrito(); renderDashboard(); updateBadges();
}
function removeFromCart(id){
  const p=state.productos.find(x=>x.id===id);
  state.carrito=state.carrito.filter(i=>i.productoId!==id);
  renderCarrito(); renderDashboard(); updateBadges();
  if(p)showNeonAlert(`"${p.nombre}" removido`,'info');
}
function clearCart(){
  if(!confirm('¿Vaciar el carrito?')) return;
  state.carrito=[]; renderCarrito(); renderDashboard(); updateBadges(); showNeonAlert('Carrito vaciado','info');
}
function checkoutCart(){
  if(state.carrito.length===0){showNeonAlert('El carrito está vacío','error');return;}
  const subtotal=state.carrito.reduce((s,i)=>{const p=state.productos.find(x=>x.id===i.productoId);return s+(p?p.precio*i.qty:0);},0);
  const total=+(subtotal*1.19).toFixed(2);
  state.carrito.forEach(item=>{
    const p=state.productos.find(x=>x.id===item.productoId);
    if(p){p.stock=Math.max(0,p.stock-item.qty);if(p.tipo==='alquiler')p.estado='en-uso';}
  });
  state.carrito=[]; renderCarrito(); renderDashboard(); updateBadges();
  showNeonAlert(`¡Compra de $${total.toFixed(2)} procesada!`,'success');
}

// ── Favoritos ──────────────────────────────────────────────
function toggleFav(id){
  const p=state.productos.find(x=>x.id===id); const inFav=state.favoritos.includes(id);
  if(inFav){state.favoritos=state.favoritos.filter(x=>x!==id);showNeonAlert(`"${p?.nombre}" removido de favoritos`,'info');}
  else{state.favoritos.push(id);showNeonAlert(`"${p?.nombre}" añadido a favoritos`,'success');}
  const btn=document.getElementById('btn-fav-'+id);
  if(btn){const nf=state.favoritos.includes(id);btn.className=`btn-icon fav ${nf?'fav-active':''}`;btn.innerHTML=`<i class="fa-${nf?'solid':'regular'} fa-heart"></i>`;}
  updateBadges(); renderDashboard();
}
function renderFavoritos(){
  const grid=document.getElementById('favorites-grid'); const empty=document.getElementById('empty-fav');
  const bar=document.getElementById('favs-total-bar');
  const favs=state.productos.filter(p=>state.favoritos.includes(p.id));
  if(favs.length===0){if(grid)grid.innerHTML='';if(empty)empty.style.display='block';if(bar)bar.style.display='none';return;}
  if(empty)empty.style.display='none';
  if(grid)grid.innerHTML=favs.map(p=>buildProductCard(p)).join('');
  if(bar){bar.style.display='flex';const tv=favs.reduce((s,p)=>s+p.precio,0);setText('favs-count',favs.length);setText('favs-valor','$'+tv.toFixed(2));}
}

// ── Pedidos admin ──────────────────────────────────────────
function renderPedidos(){
  const list=document.getElementById('orders-list'); if(!list) return;
  if(state.pedidos.length===0){list.innerHTML='<div class="empty-state"><i class="fa-solid fa-clipboard-list" style="font-size:3rem;color:var(--yellow);margin-bottom:16px;"></i><p>No hay pedidos</p></div>';return;}
  list.innerHTML=state.pedidos.map(o=>buildOrderCard(o,true)).join('');
}
function buildOrderCard(o,isAdmin){
  const lineas=(o.lineas||[]).map(l=>`
    <div class="order-line-item">
      <div><p class="order-line-name">${l.nombre}</p><p class="order-line-qty">Cantidad: ${l.qty}</p></div>
      <span class="order-line-price">$${(l.precio*l.qty).toFixed(2)}</span>
    </div>`).join('');
  const statusSel=isAdmin?`<select class="order-status-select" onchange="cambiarEstadoPedido('${o.id}',this.value)">
    <option value="pending" ${o.estado==='pending'?'selected':''}>Pendiente</option>
    <option value="transit" ${o.estado==='transit'?'selected':''}>En Camino</option>
    <option value="delivered" ${o.estado==='delivered'?'selected':''}>Entregado</option>
    <option value="cancelled" ${o.estado==='cancelled'?'selected':''}>Cancelado</option>
  </select>`:`<span class="order-status status-${o.estado}">${o.estadoLabel}</span>`;
  return `<div class="order-card-v2">
    <div class="order-header-v2">
      <span class="order-id-v2">${o.id}</span>
      <span class="order-status status-${o.estado}">${o.estadoLabel}</span>
      ${o.cliente?`<span class="order-client" style="margin-left:8px">· ${o.cliente}</span>`:''}
      <div style="flex:1"></div>${statusSel}
    </div>
    <p class="order-date-v2">Creado: ${o.fecha}</p>
    ${o.actualizado?`<p class="order-updated">Últ. actualización: ${o.actualizado}</p>`:''}
    <div class="order-items-section" style="margin-top:14px">
      <p class="order-items-label">Artículos</p>${lineas}
    </div>
    ${o.direccion?`<div class="order-detail-row"><p class="order-detail-lbl"><i class="fa-solid fa-location-dot"></i> Dirección de envío</p><p class="order-detail-val">${o.direccion}</p></div>`:''}
    ${o.seguimiento?`<div class="order-detail-row"><p class="order-detail-lbl"><i class="fa-solid fa-truck"></i> Número de seguimiento</p><p class="order-detail-val">${o.seguimiento}</p></div>`:''}
    <div class="order-total-v2"><span>Total</span><span class="amt">$${o.total.toFixed(2)}</span></div>
  </div>`;
}
function cambiarEstadoPedido(id,newEstado){
  const o=state.pedidos.find(x=>x.id===id); if(!o) return;
  const map={pending:'Pendiente',transit:'En Camino',delivered:'Entregado',cancelled:'Cancelado'};
  o.estado=newEstado; o.estadoLabel=map[newEstado]||newEstado;
  showNeonAlert(`Pedido ${id} → ${o.estadoLabel}`,'success');
}

// ── Perfil editable ────────────────────────────────────────
function renderPerfil(){
  const card=document.getElementById('perfil-card'); if(!card) return;
  const pr=state.perfil; const editing=state.editandoPerfil;
  card.innerHTML=`
    <div class="profile-header-v2">
      <div class="profile-avatar avatar-wrap" onclick="openModal('modal-avatar')" title="Cambiar avatar" style="cursor:pointer;position:relative">
        ${state.avatarUrl
          ?`<img class="avatar-img" src="${state.avatarUrl}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,245,255,0.4);">`
          :`<i class="fa-solid fa-user" style="font-size:2rem;color:var(--cyan);width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(0,245,255,0.15),rgba(255,0,200,0.15));border:2px solid rgba(0,245,255,0.3);display:flex;align-items:center;justify-content:center;"></i>`}
        <button class="avatar-edit-btn" onclick="openModal('modal-avatar')"><i class="fa-solid fa-camera"></i></button>
      </div>
      <div><p class="profile-name-v2">${pr.nombre}</p><span class="profile-role-badge role-admin">Administrador</span></div>
      <button class="btn-edit-profile" onclick="toggleEditPerfil()">${editing?'Cancelar':'<i class=\'fa-solid fa-pen\'></i> Editar Perfil'}</button>
    </div>
    <div class="profile-field ${editing?'editing':''}">
      <i class="fa-solid fa-user"></i><div class="profile-field-inner"><p class="profile-field-label">Nombre completo</p>
      ${editing?`<input id="pf-nombre" value="${pr.nombre}" class="modal-input" style="padding:0;background:none;border:none;font-size:0.9rem">`:`<p class="profile-field-val">${pr.nombre}</p>`}</div>
    </div>
    <div class="profile-field ${editing?'editing':''}">
      <i class="fa-regular fa-envelope"></i><div class="profile-field-inner"><p class="profile-field-label">Email</p>
      ${editing?`<input id="pf-email" value="${pr.email}" class="modal-input" style="padding:0;background:none;border:none;font-size:0.9rem">`:`<p class="profile-field-val">${pr.email}</p>`}</div>
    </div>
    <div class="profile-field ${editing?'editing':''}">
      <i class="fa-solid fa-phone"></i><div class="profile-field-inner"><p class="profile-field-label">Teléfono</p>
      ${editing?`<input id="pf-telefono" value="${pr.telefono}" class="modal-input" style="padding:0;background:none;border:none;font-size:0.9rem">`:`<p class="profile-field-val">${pr.telefono}</p>`}</div>
    </div>
    <div class="profile-field ${editing?'editing':''}">
      <i class="fa-solid fa-location-dot"></i><div class="profile-field-inner"><p class="profile-field-label">Dirección</p>
      ${editing?`<input id="pf-direccion" value="${pr.direccion}" class="modal-input" style="padding:0;background:none;border:none;font-size:0.9rem">`:`<p class="profile-field-val">${pr.direccion}</p>`}</div>
    </div>
    ${editing?`<div class="profile-edit-actions">
      <button class="btn-save-profile" onclick="guardarPerfil()"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
      <button class="btn-cancel-edit" onclick="cancelarEditPerfil()">Cancelar</button>
    </div>`:
    `<div class="profile-bottom-v2">
      <div class="profile-bottom-item"><p class="lbl">Total Productos</p><p class="val">${state.productos.length}</p></div>
      <div class="profile-bottom-item"><p class="lbl">Favoritos</p><p class="val">${state.favoritos.length}</p></div>
      <div class="profile-bottom-item"><p class="lbl">Rol de usuario</p><p class="val role-val">Admin</p></div>
    </div>`}`;
  setText('p-total',state.productos.length); setText('p-fav',state.favoritos.length);
  setText('p-cart',state.carrito.reduce((s,i)=>s+i.qty,0));
}
function toggleEditPerfil(){state.editandoPerfil=!state.editandoPerfil;renderPerfil();}
function cancelarEditPerfil(){state.editandoPerfil=false;renderPerfil();}
function guardarPerfil(){
  state.perfil.nombre=document.getElementById('pf-nombre')?.value||state.perfil.nombre;
  state.perfil.email=document.getElementById('pf-email')?.value||state.perfil.email;
  state.perfil.telefono=document.getElementById('pf-telefono')?.value||state.perfil.telefono;
  state.perfil.direccion=document.getElementById('pf-direccion')?.value||state.perfil.direccion;
  state.editandoPerfil=false; renderPerfil(); showNeonAlert('Perfil actualizado','success');
}

// ── Avatar ─────────────────────────────────────────────────
function initAvatarModal(){
  document.querySelectorAll('.avatar-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.avatar-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.avatar-tab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active'); const tgt=document.getElementById('tab-'+tab.dataset.tab);if(tgt)tgt.classList.add('active');
    });
  });
  const dz=document.getElementById('avatar-drop-zone'); const fi=document.getElementById('avatar-file-input');
  if(dz){
    dz.addEventListener('click',()=>fi&&fi.click());
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='var(--cyan)';});
    dz.addEventListener('dragleave',()=>{dz.style.borderColor='';});
    dz.addEventListener('drop',e=>{e.preventDefault();dz.style.borderColor='';const f=e.dataTransfer.files[0];if(f)processAvatarFile(f);});
  }
  if(fi)fi.addEventListener('change',e=>{if(e.target.files[0])processAvatarFile(e.target.files[0]);});
}
function processAvatarFile(file){
  if(!file.type.startsWith('image/')){showNeonAlert('Solo imágenes','error');return;}
  const r=new FileReader();r.onload=e=>{showAvatarPreview(e.target.result);state._pendingAvatar=e.target.result;};r.readAsDataURL(file);
}
function previewAvatarUrl(){
  const url=document.getElementById('avatar-url-input')?.value.trim();
  if(!url){showNeonAlert('URL inválida','error');return;}
  showAvatarPreview(url);state._pendingAvatar=url;
}
function showAvatarPreview(src){
  const w=document.getElementById('avatar-preview-wrap');if(!w)return;
  w.innerHTML=`<img src="${src}" onerror="this.src=''" alt="Vista previa">`;w.style.display='flex';
}
function guardarAvatar(){
  if(!state._pendingAvatar){showNeonAlert('Selecciona una imagen','error');return;}
  state.avatarUrl=state._pendingAvatar;state._pendingAvatar=null;
  closeModal('modal-avatar'); showNeonAlert('Avatar actualizado','success'); renderPerfil();
}

// ── Calendario ─────────────────────────────────────────────
function renderCalendar(){
  const main=document.getElementById('calendar-main-wrap');if(!main)return;
  const y=state.calendarYear,m=state.calendarMonth;
  const monthNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dayNames=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];const today=new Date();
  const firstDay=new Date(y,m,1).getDay(); const daysInMonth=new Date(y,m+1,0).getDate(); const daysInPrev=new Date(y,m,0).getDate();
  const monthEvDays=state.eventos.filter(ev=>{const d=new Date(ev.fecha);return d.getFullYear()===y&&d.getMonth()===m;}).map(ev=>new Date(ev.fecha).getDate());
  let cells=''; const headers=dayNames.map(d=>`<div class="cal-day-header">${d}</div>`).join('');
  for(let i=firstDay-1;i>=0;i--) cells+=`<div class="cal-day other-month">${daysInPrev-i}</div>`;
  for(let d=1;d<=daysInMonth;d++){
    const it=d===today.getDate()&&m===today.getMonth()&&y===today.getFullYear();
    const he=monthEvDays.includes(d);
    cells+=`<div class="cal-day${it?' today':''}${he?' has-event':''}" onclick="abrirEventoDia(${y},${m+1},${d})">${d}</div>`;
  }
  const rem=42-firstDay-daysInMonth; for(let d=1;d<=rem;d++) cells+=`<div class="cal-day other-month">${d}</div>`;
  main.innerHTML=`<div class="cal-header">
    <button class="cal-nav-btn" onclick="changeMonth(-1)">‹</button>
    <span class="cal-title" style="color:var(--green)">${monthNames[m]} ${y}</span>
    <button class="cal-nav-btn" onclick="changeMonth(1)">›</button>
  </div><div class="cal-grid">${headers}${cells}</div>`;
  renderEventPanel();
}
function changeMonth(delta){
  state.calendarMonth+=delta;
  if(state.calendarMonth>11){state.calendarMonth=0;state.calendarYear++;}
  if(state.calendarMonth<0){state.calendarMonth=11;state.calendarYear--;}
  renderCalendar();
}
function renderEventPanel(){
  const panel=document.getElementById('eventos-list');if(!panel)return;
  const y=state.calendarYear,m=state.calendarMonth;
  const prox=state.eventos.filter(ev=>{const d=new Date(ev.fecha);return d.getFullYear()===y&&d.getMonth()===m;}).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
  if(prox.length===0){panel.innerHTML='<div class="no-events"><i class="fa-regular fa-calendar-xmark"></i><p>No hay eventos próximos</p></div>';return;}
  panel.innerHTML=prox.map(ev=>{
    const d=new Date(ev.fecha);
    return `<div class="event-item tipo-${ev.tipo.toLowerCase()}">
      <p class="event-title">${ev.titulo}</p>
      <p class="event-meta">${d.toLocaleDateString('es-CO',{day:'2-digit',month:'short'})}, ${d.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</p>
      ${ev.desc?`<p class="event-meta" style="margin-top:2px">${ev.desc}</p>`:''}
      <span class="event-type-badge">${ev.tipo}</span>
    </div>`;
  }).join('');
}
function abrirEventoDia(y,m,d){
  const fi=document.getElementById('ev-fecha');
  if(fi)fi.value=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T10:00`;
  openModal('modal-nuevo-evento');
}
function crearEvento(){
  const titulo=document.getElementById('ev-titulo')?.value.trim();
  const desc=document.getElementById('ev-desc')?.value.trim();
  const fecha=document.getElementById('ev-fecha')?.value;
  const tipo=document.getElementById('ev-tipo')?.value||'Evento';
  if(!titulo||!fecha){showNeonAlert('Título y fecha son obligatorios','error');return;}
  state.eventos.push({titulo,desc,fecha,tipo,id:Date.now()});
  document.getElementById('ev-titulo').value='';document.getElementById('ev-desc').value='';document.getElementById('ev-fecha').value='';
  closeModal('modal-nuevo-evento');renderCalendar();showNeonAlert(`Evento "${titulo}" creado`,'success');
}

// ── Badges ─────────────────────────────────────────────────
function updateBadges(){
  const cq=state.carrito.reduce((s,i)=>s+i.qty,0); const fq=state.favoritos.length;
  const bc=document.getElementById('badge-cart');const bf=document.getElementById('badge-fav');const bt=document.getElementById('badge-tickets');
  if(bc){bc.textContent=cq;bc.style.display=cq?'':'none';}
  if(bf){bf.textContent=fq;bf.style.display=fq?'':'none';}
  if(bt){const op=state.tickets.filter(t=>t.estado!=='closed').length;bt.textContent=op;bt.style.display=op?'':'none';}
}
function openModal(id){const el=document.getElementById(id);if(el)el.classList.add('open');}
function closeModal(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}
function closeModalOutside(e,id){if(e.target.id===id)closeModal(id);}
function setText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}
function showNeonAlert(msg,type='info'){
  const icons={success:'✓',error:'✕',info:'ℹ'};
  const el=document.getElementById('neonAlert');if(!el)return;
  el.className=`neon-alert ${type}`;el.innerHTML=`<span>${icons[type]||'•'}</span> ${msg}`;
  el.style.display='flex';el.offsetHeight;el.classList.add('show');
  clearTimeout(el._timer);el._timer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{el.style.display='none';},400);},3000);
}
