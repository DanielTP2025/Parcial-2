const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los pedidos
router.get('/pedidos', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM pedido');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pedidos', details: error.message });
  }
});

// Obtener un pedido por ID
router.get('/pedidos/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const result = await connection.query('SELECT * FROM pedido WHERE id_pedido = $1', [id_pedido]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pedido', details: error.message });
  }
});

// Crear un nuevo pedido
router.post('/pedidos', async (req, res) => {
  const { id_pedido, fecha, id_rest, total } = req.body;
  try {
    const result = await connection.query(
      'INSERT INTO pedido (id_pedido, fecha, id_rest, total) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pedido, fecha, id_rest, total]
    );
    res.status(201).json({ success: true, message: 'Pedido creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, message: 'Error al crear pedido', details: error.message });
  }
});

// Actualizar un pedido
router.put('/pedidos/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;
  const { fecha, id_rest, total } = req.body;
  try {
    const result = await connection.query(
      'UPDATE pedido SET fecha = $1, id_rest = $2, total = $3 WHERE id_pedido = $4 RETURNING *',
      [fecha, id_rest, total, id_pedido]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Pedido actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar pedido', details: error.message });
  }
});

// Eliminar un pedido
router.delete('/pedidos/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const result = await connection.query('DELETE FROM pedido WHERE id_pedido = $1 RETURNING *', [id_pedido]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Pedido eliminado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar pedido', details: error.message });
  }
});
// Esta ruta quedará accesible como: /api/mas-vendidos
router.get('/mas-vendidos', async (req, res) => {
  const { minimo = 10 } = req.query;

  if (isNaN(minimo)) {
    return res.status(400).json({
      success: false,
      message: 'El parámetro minimo debe ser un número'
    });
  }

  try {
    const result = await connection.query(
      `SELECT p.id_prod, p.nombre, SUM(dp.cantidad) as total_vendido
       FROM producto p
       JOIN detalle_pedido dp ON p.id_prod = dp.id_prod
       GROUP BY p.id_prod, p.nombre
       HAVING SUM(dp.cantidad) > $1
       ORDER BY total_vendido DESC`,
      [Number(minimo)]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      unidades_minimas: Number(minimo)
    });
  } catch (error) {
    console.error('Error en productos más vendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos más vendidos',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/pedidos/por-fecha', async (req, res) => {
  const { fecha } = req.query; // Formato esperado: YYYY-MM-DD

  if (!fecha) {
    return res.status(400).json({
      success: false,
      message: 'Parámetro fecha es requerido',
      formato: 'YYYY-MM-DD'
    });
  }

  try {
    const result = await connection.query(
      `SELECT * FROM pedido
       WHERE DATE(fecha) = $1
       ORDER BY fecha DESC`,
      [fecha]
    );

    res.status(200).json({
      success: true,
      fecha_consultada: fecha,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos por fecha',
      details: error.message
    });
  }
});

module.exports = router;