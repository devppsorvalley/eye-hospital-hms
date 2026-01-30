import pkg from 'pg';
const { Pool } = pkg;

const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
console.log('DB_SSL:', process.env.DB_SSL);
console.log('SSL config for Pool:', sslConfig);

// PostgreSQL connection pool with SSL support for RDS
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'seemant_hms_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: sslConfig,
});

// Test connection
pool.on('connect', () => {
  console.log('PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
}

export async function closePool() {
  await pool.end();
  console.log('Connection pool closed');
}
