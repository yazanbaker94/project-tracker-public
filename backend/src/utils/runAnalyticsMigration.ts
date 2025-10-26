import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runAnalyticsMigration() {
  try {
    const client = await pool.connect();
    try {
      console.log('🚀 Running analytics migration...');
      
      const migrationSql = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_completed_at.sql'), 
        'utf8'
      );
      
      await client.query(migrationSql);
      console.log('✅ Migration: completed_at field added to projects table');

      // Verify the column was added
      const columnCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'completed_at'
      `);

      if ((columnCheck.rowCount ?? 0) > 0) {
        console.log('✅ Verified: completed_at column exists');
        console.log(`   Type: ${columnCheck.rows[0].data_type}`);
      } else {
        console.error('❌ Verification failed: completed_at column not found');
        process.exit(1);
      }

      // Check how many completed projects were updated
      const completedCount = await client.query(`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE status = 'completed' AND completed_at IS NOT NULL
      `);
      console.log(`✅ Updated ${completedCount.rows[0].count} completed projects with completion timestamp`);

      // Verify trigger exists
      const triggerCheck = await client.query(`
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_completed_at'
      `);

      if ((triggerCheck.rowCount ?? 0) > 0) {
        console.log('✅ Verified: Auto-completion trigger installed');
      }

      console.log('\n🎉 Analytics migration complete!');
      console.log('\n📊 New features enabled:');
      console.log('   • Average completion time tracking');
      console.log('   • Automatic timestamp on project completion');
      console.log('   • Enhanced analytics capabilities');

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Analytics migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAnalyticsMigration();

