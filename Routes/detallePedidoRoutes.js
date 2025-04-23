const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los detalles de pedido
router.get('/detalles-pedido', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM detallepedido');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener detalles de pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalles de pedido', details: error.message });
  }
});

// Obtener un detalle de pedido por ID
router.get('/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  try {
    const result = await connection.query('SELECT * FROM detallepedido WHERE id_detalle = $1', [id_detalle]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener detalle de pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalle de pedido', details: error.message });
  }
});

// Crear un nuevo detalle de pedido
router.post('/detalles-pedido', async (req, res) => {
  const { id_pedido, id_prod, cantidad, subtotal } = req.body;
  try {
    const result = await connection.query(
      'INSERT INTO detallepedido (id_pedido, id_prod, cantidad, subtotal) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pedido, id_prod, cantidad, subtotal]
    );
    res.status(201).json({ success: true, message: 'Detalle de pedido creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear detalle de pedido:', error);
    res.status(500).json({ success: false, message: 'Error al crear detalle de pedido', details: error.message });
  }
});

// Actualizar un detalle de pedido
router.put('/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  const { id_pedido, id_prod, cantidad, subtotal } = req.body;
  try {
    const result = await connection.query(
      'UPDATE detallepedido SET id_pedido = $1, id_prod = $2, cantidad = $3, subtotal = $4 WHERE id_detalle = $5 RETURNING *',
      [id_pedido, id_prod, cantidad, subtotal, id_detalle]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Detalle de pedido actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar detalle de pedido:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar detalle de pedido', details: error.message });
  }
});

// Eliminar un detalle de pedido
router.delete('/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  try {
    const result = await connection.query('DELETE FROM detallepedido WHERE id_detalle = $1 RETURNING *', [id_detalle]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Detalle de pedido eliminado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Detalle de pedido no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar detalle de pedido:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar detalle de pedido', details: error.message });
  }
});

module.exports = router;