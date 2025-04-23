const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los productos de un pedido específico
router.get('/pedidos/:id_pedido/productos', async (req, res) => {
  const { id_pedido } = req.params;
  try {
    const query = `
      SELECT p.id_prod, p.nombre, p.precio, dp.cantidad, dp.subtotal
      FROM pedido pe
      JOIN detallepedido dp ON pe.id_pedido = dp.id_pedido
      JOIN producto p ON dp.id_prod = p.id_prod
      WHERE pe.id_pedido = $1
    `;
    const result = await connection.query(query, [id_pedido]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener productos del pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos del pedido', details: error.message });
  }
});

// Obtener los productos más vendidos (más de X unidades)
router.get('/productos/mas-vendidos/:min_unidades', async (req, res) => {
  const { min_unidades } = req.params;
  try {
    const query = `
      SELECT p.id_prod, p.nombre, COUNT(dp.id_prod) AS total_vendido
      FROM producto p
      JOIN detallepedido dp ON p.id_prod = dp.id_prod
      GROUP BY p.id_prod, p.nombre
      HAVING COUNT(dp.id_prod) > $1
      ORDER BY total_vendido DESC
    `;
    const result = await connection.query(query, [min_unidades]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos más vendidos', details: error.message });
  }
});

// Obtener el total de ventas por restaurante
router.get('/restaurantes/ventas', async (req, res) => {
  try {
    const query = `
      SELECT r.id_rest, r.nombre, SUM(p.total) AS total_ventas
      FROM restaurante r
      JOIN pedido p ON r.id_rest = p.id_rest
      GROUP BY r.id_rest, r.nombre
      ORDER BY total_ventas DESC
    `;
    const result = await connection.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener total de ventas por restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al obtener total de ventas por restaurante', details: error.message });
  }
});

// Obtener los pedidos realizados en una fecha específica
router.get('/pedidos/fecha/:fecha', async (req, res) => {
  const { fecha } = req.params;
  try {
    const query = `
      SELECT *
      FROM pedido
      WHERE fecha = $1
    `;
    const result = await connection.query(query, [fecha]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener pedidos por fecha:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pedidos por fecha', details: error.message });
  }
});

// Obtener los empleados por rol en un restaurante
router.get('/restaurantes/:id_rest/empleados/:rol', async (req, res) => {
  const { id_rest, rol } = req.params;
  try {
    const query = `
      SELECT e.id_empleado, e.nombre, e.rol
      FROM empleado e
      WHERE e.id_rest = $1 AND e.rol = $2
    `;
    const result = await connection.query(query, [id_rest, rol]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener empleados por rol en restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleados por rol en restaurante', details: error.message });
  }
});

module.exports = router;