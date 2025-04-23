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
  const { fecha, id_rest, total } = req.body;
  try {
    const result = await connection.query(
      'INSERT INTO pedido (fecha, id_rest, total) VALUES ($1, $2, $3) RETURNING *',
      [fecha, id_rest, total]
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

module.exports = router;