const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los productos
router.get('/productos', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM producto');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos', details: error.message });
  }
});

// Obtener un producto por ID
router.get('/productos/:id_prod', async (req, res) => {
  const { id_prod } = req.params;
  try {
    const result = await connection.query('SELECT * FROM producto WHERE id_prod = $1', [id_prod]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener producto', details: error.message });
  }
});

// Crear un nuevo producto
router.post('/productos', async (req, res) => {
  const { id_prod, nombre, precio } = req.body; 
  try {
    const result = await connection.query(
      'INSERT INTO producto (id_prod, nombre, precio) VALUES ($1, $2, $3) RETURNING *',
      [id_prod, nombre, precio]
    );
    res.status(201).json({ success: true, message: 'Producto creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto', details: error.message });
  }
});

// Actualizar un producto
router.put('/productos/:id_prod', async (req, res) => {
  const { id_prod } = req.params;
  const { nombre, precio } = req.body;
  try {
    const result = await connection.query(
      'UPDATE producto SET nombre = $1, precio = $2 WHERE id_prod = $3 RETURNING *',
      [nombre, precio, id_prod]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Producto actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar producto', details: error.message });
  }
});

// Eliminar un producto
router.delete('/productos/:id_prod', async (req, res) => {
  const { id_prod } = req.params;
  try {
    const result = await connection.query('DELETE FROM producto WHERE id_prod = $1 RETURNING *', [id_prod]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Producto eliminado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto', details: error.message });
  }
});

// Obtener productos más vendidos
router.get('/productos/mas-vendidos', async (req, res) => {
  const { minimo = 10 } = req.query;

  if (isNaN(minimo)) {
    return res.status(400).json({
      success: false,
      message: 'El parámetro minimo debe ser un número'
    });
  }

  try {
    const result = await connection.query(
      `SELECT p.id_prod, p.nombre, SUM(dp.cantidad) AS total_vendido
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

module.exports = router;
