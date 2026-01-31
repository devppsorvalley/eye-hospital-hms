import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database validation script
 * Checks if all required tables and data exist
 */

async function validateDatabase() {
  try {
    console.log('🔍 Validating database structure...\n');

    // List of expected tables
    const expectedTables = [
      'users',
      'roles',
      'patients',
      'doctors',
      'opd_queue',
      'consultations',
      'bills',
      'bill_items',
      'service_charges',
      'service_categories',
      'icd_master',
      'visit_types',
    ];

    // Check if tables exist
    console.log('📋 Checking tables:\n');
    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    const existingTables = result.rows.map((r) => r.table_name);

    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} (MISSING)`);
      }
    }

    // Check row counts
    console.log('\n📊 Data validation:\n');

    const tablesCounts = [
      'users',
      'roles',
      'patients',
      'doctors',
      'service_charges',
      'icd_master',
      'visit_types',
    ];

    for (const table of tablesCounts) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult.rows[0].count;
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${table}: ${count} row(s)`);
    }

    // Check for test users
    console.log('\n👤 Test users:\n');
    const usersResult = await pool.query(
      `SELECT username, roles.name as role FROM users 
       LEFT JOIN roles ON users.role_id = roles.id 
       ORDER BY username`
    );

    if (usersResult.rows.length > 0) {
      for (const user of usersResult.rows) {
        console.log(`  ✅ ${user.username} (${user.role || 'NO ROLE'})`);
      }
    } else {
      console.log('  ⚠️  No users found - run npm run seed');
    }

    console.log('\n✅ Database validation complete!\n');
    await pool.end();
  } catch (err) {
    console.error('❌ Validation failed:', err.message);
    process.exit(1);
  }
}

validateDatabase();
