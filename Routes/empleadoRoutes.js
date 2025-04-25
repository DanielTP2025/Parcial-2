const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los empleados
router.get('/empleados', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM empleado');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleados', details: error.message });
  }
});

// Obtener un empleado por ID
router.get('/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  try {
    const result = await connection.query('SELECT * FROM empleado WHERE id_empleado = $1', [id_empleado]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ success: false, message: 'Error al obtener empleado', details: error.message });
  }
});

// Crear un nuevo empleado
router.post('/empleados', async (req, res) => {
  const { id_empleado, nombre, rol, id_rest } = req.body;
  try {
    const result = await connection.query(
      'INSERT INTO empleado (id_empleado, nombre, rol, id_rest) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_empleado, nombre, rol, id_rest]
    );
    res.status(201).json({ success: true, message: 'Empleado creado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ success: false, message: 'Error al crear empleado', details: error.message });
  }
});

// Actualizar un empleado
router.put('/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  const { nombre, rol, id_rest } = req.body;
  try {
    const result = await connection.query(
      'UPDATE empleado SET nombre = $1, rol = $2, id_rest = $3 WHERE id_empleado = $4 RETURNING *',
      [nombre, rol, id_rest, id_empleado]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Empleado actualizado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar empleado', details: error.message });
  }
});

// Eliminar un empleado
router.delete('/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  try {
    const result = await connection.query('DELETE FROM empleado WHERE id_empleado = $1 RETURNING *', [id_empleado]);
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Empleado eliminado', data: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar empleado', details: error.message });
  }
});

module.exports = router;