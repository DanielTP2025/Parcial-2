const express = require('express');
const router = express.Router();
const connection = require('../db'); // Asegúrate de que la ruta a tu archivo db.js sea correcta

// Obtener todos los restaurantes
router.get('/restaurantes', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM restaurante');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener restaurantes', details: error.message });
  }
});

// Obtener un restaurante por ID
router.get('/restaurantes/:id_rest', async (req, res) => {
  const { id_rest } = req.params;
  try {
    const result = await connection.query('SELECT * FROM restaurante WHERE id_rest = $1', [id_rest]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al obtener restaurante', details: error.message });
  }
});

// Crear un nuevo restaurante
router.post('/restaurantes', async (req, res) => {
  const { id_rest, nombre, ciudad, direccion, fecha_apertura } = req.body;
  try {
    const result = await connection.query(
      'INSERT INTO restaurante (nombre, ciudad, direccion, fecha_apertura) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, ciudad, direccion, fecha_apertura]
    );
    res.status(201).json({ success: true, message: 'Restaurante creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al crear restaurante', details: error.message });
  }
});

// Actualizar un restaurante
router.put('/restaurantes/:id_rest', async (req, res) => {
  const { id_rest } = req.params;
  const { nombre, ciudad, direccion, fecha_apertura } = req.body;
  try {
    const result = await connection.query(
      'UPDATE restaurante SET nombre = $1, ciudad = $2, direccion = $3, fecha_apertura = $4 WHERE id_rest = $5 RETURNING *',
      [nombre, ciudad, direccion, fecha_apertura, id_rest]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Restaurante actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar restaurante', details: error.message });
  }
});

// Eliminar un restaurante
router.delete('/restaurantes/:id_rest', async (req, res) => {
  const { id_rest } = req.params;
  try {
    const result = await connection.query('DELETE FROM restaurante WHERE id_rest = $1 RETURNING *', [id_rest]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Restaurante eliminado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar restaurante:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar restaurante', details: error.message });
  }
});

module.exports = router;