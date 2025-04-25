const express = require('express');
const router = express.Router();
const connection = require('../db');

// 1. Obtener todos los productos de un pedido específico
router.get('/productos-pedido/:id_pedido', async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const result = await connection.query(`
      SELECT p.id_prod, p.nombre, p.precio, dp.cantidad, dp.subtotal
      FROM detalle_pedido dp
      JOIN producto p ON dp.id_prod = p.id_prod
      WHERE dp.id_pedido = $1
    `, [id_pedido]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos del pedido', details: error.message });
  }
});

// 2. Obtener los productos más vendidos (más de X unidades)
router.get('/mas-vendidos', async (req, res) => {
  const { minimo = 10 } = req.query;
  try {
    const result = await connection.query(`
      SELECT p.id_prod, p.nombre, SUM(dp.cantidad) AS total_vendido
      FROM producto p
      JOIN detalle_pedido dp ON p.id_prod = dp.id_prod
      GROUP BY p.id_prod, p.nombre
      HAVING SUM(dp.cantidad) > $1
      ORDER BY total_vendido DESC
    `, [minimo]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos más vendidos', details: error.message });
  }
});

// 3. Obtener el total de ventas por restaurante
router.get('/ventas-por-restaurante', async (req, res) => {
  try {
    const result = await connection.query(`
      SELECT r.id_rest, r.nombre, SUM(dp.subtotal) AS total_ventas
      FROM restaurante r
      JOIN pedido p ON r.id_rest = p.id_rest
      JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
      GROUP BY r.id_rest, r.nombre
      ORDER BY total_ventas DESC
    `);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener ventas por restaurante', details: error.message });
  }
});

// 4. Obtener los pedidos realizados en una fecha específica
router.get('/pedidos-por-fecha', async (req, res) => {
  const { fecha } = req.query;
  try {
    const result = await connection.query(`
      SELECT * FROM pedido WHERE DATE(fecha) = $1
    `, [fecha]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener pedidos por fecha', details: error.message });
  }
});

// 5. Obtener los empleados por rol en un restaurante
router.get('/empleados-por-rol', async (req, res) => {
  const { id_rest, rol } = req.query;
  try {
    const result = await connection.query(`
      SELECT * FROM empleado
      WHERE id_rest = $1 AND rol = $2
    `, [id_rest, rol]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener empleados por rol', details: error.message });
  }
});

module.exports = router;

