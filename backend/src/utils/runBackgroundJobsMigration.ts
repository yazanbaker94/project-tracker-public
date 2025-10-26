import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runBackgroundJobsMigration() {
  try {
    const client = await pool.connect();
    try {
      console.log('🚀 Running background jobs migration...');
      
      const migrationSql = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_background_jobs.sql'), 
        'utf8'
      );
      
      await client.query(migrationSql);
      console.log('✅ Migration: background_jobs table created');

      // Verify the table was created
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'background_jobs' AND table_schema = 'public'
      `);

      if ((tableCheck.rowCount ?? 0) > 0) {
        console.log('✅ Verified: background_jobs table exists');
      } else {
        console.error('❌ Verification failed: background_jobs table not found');
        process.exit(1);
      }

      // Verify columns
      const columnsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'background_jobs'
        ORDER BY ordinal_position
      `);
      
      console.log(`✅ Table has ${columnsCheck.rowCount} columns`);

      // Verify triggers
      const triggerCheck = await client.query(`
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'background_jobs'
      `);

      if ((triggerCheck.rowCount ?? 0) > 0) {
        console.log(`✅ Verified: ${triggerCheck.rowCount} trigger(s) installed`);
      }

      console.log('\n🎉 Background jobs migration complete!');
      console.log('\n⚙️ New features enabled:');
      console.log('   • Background job processing');
      console.log('   • Analytics recalculation');
      console.log('   • Job status tracking with progress');
      console.log('   • Async task management');

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Background jobs migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runBackgroundJobsMigration();

