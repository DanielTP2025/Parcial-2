const express = require('express');
const router = express.Router();
const connection = require('../db');

// Obtener todos los detalles de pedido
router.get('/detalles-pedido', async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM detalle_pedido');
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
    const result = await connection.query('SELECT * FROM detalle_pedido WHERE id_detalle = $1', [id_detalle]);
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

  // Validación básica
  if (!id_pedido || !id_prod || !cantidad || subtotal === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos',
      required: ['id_pedido', 'id_prod', 'cantidad', 'subtotal']
    });
  }

  try {
    // Verificar existencia del pedido y producto
    const [pedido, producto] = await Promise.all([
      connection.query('SELECT 1 FROM pedido WHERE id_pedido = $1', [id_pedido]),
      connection.query('SELECT 1 FROM producto WHERE id_prod = $1', [id_prod])
    ]);

    if (pedido.rows.length === 0 || producto.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Referencias no encontradas',
        details: {
          pedido_exists: pedido.rows.length > 0,
          producto_exists: producto.rows.length > 0
        }
      });
    }

    // Crear el detalle
    const result = await connection.query(
      `INSERT INTO detalle_pedido 
       (id_pedido, id_prod, cantidad, subtotal) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id_pedido, id_prod, cantidad, subtotal]
    );

    res.status(201).json({
      success: true,
      message: 'Detalle de pedido creado',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear detalle de pedido:', error);
    
    const response = {
      success: false,
      message: 'Error al crear detalle de pedido',
      details: error.message
    };

    if (error.code === '23503') { // Foreign key violation
      response.solution = 'Verificar que el pedido y producto existan';
    }

    res.status(500).json(response);
  }
});

// Actualizar un detalle de pedido
router.put('/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  const { id_pedido, id_prod, cantidad, subtotal } = req.body;

  try {
    // Validación básica de datos requeridos
    if (!id_pedido || !id_prod || cantidad === undefined || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        required: ['id_pedido', 'id_prod', 'cantidad', 'subtotal']
      });
    }

    const result = await connection.query(
      'UPDATE detalle_pedido SET id_pedido = $1, id_prod = $2, cantidad = $3, subtotal = $4 WHERE id_detalle = $5 RETURNING *',
      [id_pedido, id_prod, cantidad, subtotal, id_detalle]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ 
        success: true, 
        message: 'Detalle de pedido actualizado', 
        data: result.rows[0] 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Detalle de pedido no encontrado' 
      });
    }
  } catch (error) {
    console.error('Error al actualizar detalle de pedido:', error);
    
    // Manejo básico de errores
    const errorResponse = {
      success: false,
      message: 'Error al actualizar detalle de pedido',
      details: error.message
    };

    // Solo agregamos información específica para errores conocidos
    if (error.code === '23503') {
      errorResponse.details = 'El pedido o producto referenciado no existe';
    }

    res.status(500).json(errorResponse);
  }
});

// Eliminar un detalle de pedido
router.delete('/detalles-pedido/:id_detalle', async (req, res) => {
  const { id_detalle } = req.params;
  try {
    const result = await connection.query('DELETE FROM detalle_pedido WHERE id_detalle = $1 RETURNING *', [id_detalle]);
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