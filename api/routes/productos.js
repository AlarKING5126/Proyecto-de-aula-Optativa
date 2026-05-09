// ============================================================
//  routes/productos.js — CRUD de productos + filtros
// ============================================================
const router = require('express').Router();
const { query } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// ── GET /api/productos — Listar con filtros ─────────────────
router.get('/', async (req, res) => {
  const {
    q, categoria, tipo, estado,
    fecha_desde, fecha_hasta,
    sort = 'nombre', order = 'asc',
    page = 1, limit = 50
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const where  = ['p.activo = TRUE'];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`);
  }
  if (categoria) {
    params.push(categoria);
    where.push(`c.slug = $${params.length}`);
  }
  if (tipo) {
    params.push(tipo);
    where.push(`p.tipo = $${params.length}`);
  }
  if (estado) {
    params.push(estado);
    where.push(`p.estado = $${params.length}`);
  }
  if (fecha_desde) {
    params.push(fecha_desde);
    where.push(`p.fecha_inicio >= $${params.length}`);
  }
  if (fecha_hasta) {
    params.push(fecha_hasta);
    where.push(`(p.fecha_fin IS NULL OR p.fecha_fin <= $${params.length})`);
  }

  const sortMap = {
    nombre: 'p.nombre', precio: 'p.precio',
    rating: 'p.rating', stock: 'p.stock', id: 'p.id'
  };
  const sortCol = sortMap[sort] || 'p.nombre';
  const sortDir = order === 'desc' ? 'DESC' : 'ASC';

  params.push(parseInt(limit), offset);

  try {
    const sql = `
      SELECT p.id, p.nombre, p.descripcion,
             c.nombre AS categoria, c.slug AS categoria_slug,
             p.precio, p.stock, p.rating, p.img_url,
             p.featured, p.tipo, p.estado,
             p.fecha_inicio, p.fecha_fin,
             p.created_at, p.updated_at,
             (SELECT COUNT(*) FROM favoritos f WHERE f.producto_id = p.id) AS total_favoritos
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  ${where.join(' AND ')}
      ORDER  BY ${sortCol} ${sortDir}
      LIMIT  $${params.length - 1} OFFSET $${params.length}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  ${where.join(' AND ')}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2))
    ]);

    res.json({
      data:  dataResult.rows,
      total: parseInt(countResult.rows[0].total),
      page:  parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('GET /productos error:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ── GET /api/productos/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.nombre AS categoria, c.slug AS categoria_slug,
              (SELECT json_agg(pi ORDER BY pi.orden)
               FROM producto_imagenes pi WHERE pi.producto_id = p.id) AS imagenes
       FROM   productos p
       JOIN   categorias c ON c.id = p.categoria_id
       WHERE  p.id = $1 AND p.activo = TRUE`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// ── POST /api/productos — Crear (solo admin) ────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const {
    categoria_slug, nombre, descripcion, precio, stock,
    rating = 5, img_url, featured = false,
    tipo = 'compra', estado = 'activo', fecha_inicio, fecha_fin
  } = req.body;

  if (!nombre || !categoria_slug || precio == null || stock == null)
    return res.status(400).json({ error: 'nombre, categoria_slug, precio y stock son obligatorios' });

  try {
    const catResult = await query('SELECT id FROM categorias WHERE slug = $1', [categoria_slug]);
    if (catResult.rows.length === 0)
      return res.status(400).json({ error: 'Categoría no encontrada' });

    const result = await query(
      `INSERT INTO productos
         (categoria_id, nombre, descripcion, precio, stock, rating,
          img_url, featured, tipo, estado, fecha_inicio, fecha_fin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [catResult.rows[0].id, nombre, descripcion, precio, stock, rating,
       img_url, featured, tipo, estado, fecha_inicio || null, fecha_fin || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /productos error:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ── PUT /api/productos/:id — Actualizar (solo admin) ────────
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const {
    nombre, descripcion, precio, stock, rating,
    img_url, featured, tipo, estado, fecha_inicio, fecha_fin, categoria_slug
  } = req.body;

  try {
    let catId = null;
    if (categoria_slug) {
      const cat = await query('SELECT id FROM categorias WHERE slug = $1', [categoria_slug]);
      catId = cat.rows[0]?.id;
    }

    const result = await query(
      `UPDATE productos SET
         nombre       = COALESCE($1,  nombre),
         descripcion  = COALESCE($2,  descripcion),
         precio       = COALESCE($3,  precio),
         stock        = COALESCE($4,  stock),
         rating       = COALESCE($5,  rating),
         img_url      = COALESCE($6,  img_url),
         featured     = COALESCE($7,  featured),
         tipo         = COALESCE($8,  tipo),
         estado       = COALESCE($9,  estado),
         fecha_inicio = COALESCE($10, fecha_inicio),
         fecha_fin    = COALESCE($11, fecha_fin),
         categoria_id = COALESCE($12, categoria_id)
       WHERE id = $13
       RETURNING *`,
      [nombre, descripcion, precio, stock, rating, img_url, featured,
       tipo, estado, fecha_inicio, fecha_fin, catId, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ── DELETE /api/productos/:id — Soft delete (solo admin) ────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'UPDATE productos SET activo = FALSE WHERE id = $1 RETURNING id, nombre',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: `Producto "${result.rows[0].nombre}" eliminado`, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ── GET /api/productos/cat/lista — Listar categorías ────────
router.get('/cat/lista', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nombre, slug, descripcion FROM categorias WHERE activa = TRUE ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
