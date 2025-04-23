const express = require('express');
const connection = require('./db');
const cors = require('cors');

const restauranteRoutes = require('./Routes/restauranteRoutes');
const empleadoRoutes = require('./Routes/empleadoRoutes');
const productoRoutes = require('./Routes/productoRoutes');
const pedidoRoutes = require('./Routes/pedidoRoutes');
const detallePedidoRoutes = require('./Routes/detallePedidoRoutes');
const customQueriesRoutes = require('./Routes/customQueriesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', restauranteRoutes);
app.use('/api', empleadoRoutes);
app.use('/api', productoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', detallePedidoRoutes);
app.use('/api/custom', customQueriesRoutes);

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Corriendo en puerto ${PORT}`);
});