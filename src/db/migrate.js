import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Migration runner - executes SQL migration files
 */

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🚀 Running database migrations...\n');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

    // Get already executed migrations
    const executedResult = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(executedResult.rows.map((r) => r.name));

    console.log(`📂 Found ${files.length} migration file(s)\n`);

    if (files.length === 0) {
      console.log('⚠️  No migration files found. Create .sql files in src/db/migrations/\n');
    }

    // Execute each migration
    for (const file of files.sort()) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  ${file} (already executed)`);
        continue;
      }

      console.log(`▶️  Executing ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        console.log(`✅ ${file}\n`);
      } catch (err) {
        console.error(`❌ Error in ${file}:`, err.message);
        throw err;
      }
    }

    console.log('✅ All migrations completed successfully!\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;
