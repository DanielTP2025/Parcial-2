const { Pool } = require('pg');
require('dotenv').config(); // Si usas variables de entorno

const pool = new Pool({
  host:  'aws-0-us-east-1.pooler.supabase.com',
  port:  5432,
  user:  'postgres.rocfhjlymbahygurfyah',
  password:'1076736842', 
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;