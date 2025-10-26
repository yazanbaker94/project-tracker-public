import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runIngestionMigration() {
  try {
    const client = await pool.connect();
    try {
      console.log('🚀 Running ingestion jobs migration...');
      
      const migrationSql = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_ingestion_jobs.sql'), 
        'utf8'
      );
      
      await client.query(migrationSql);
      console.log('✅ Migration: ingestion_jobs table created');

      // Verify the table was created
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'ingestion_jobs' AND table_schema = 'public'
      `);

      if ((tableCheck.rowCount ?? 0) > 0) {
        console.log('✅ Verified: ingestion_jobs table exists');
      } else {
        console.error('❌ Verification failed: ingestion_jobs table not found');
        process.exit(1);
      }

      // Verify columns
      const columnsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ingestion_jobs'
        ORDER BY ordinal_position
      `);
      
      console.log(`✅ Table has ${columnsCheck.rowCount} columns`);
      console.log('   Columns:', columnsCheck.rows.map(r => r.column_name).join(', '));

      // Verify triggers
      const triggerCheck = await client.query(`
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'ingestion_jobs'
      `);

      if ((triggerCheck.rowCount ?? 0) > 0) {
        console.log(`✅ Verified: ${triggerCheck.rowCount} trigger(s) installed`);
      }

      console.log('\n🎉 Ingestion migration complete!');
      console.log('\n📤 New features enabled:');
      console.log('   • File upload tracking');
      console.log('   • Asynchronous job processing');
      console.log('   • Webhook callback support');
      console.log('   • Job status monitoring');

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Ingestion migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runIngestionMigration();

