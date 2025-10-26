import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function initProductionDatabase() {
  try {
    const client = await pool.connect();
    try {
      console.log('🚀 Initializing production database...');
      
      // Read and execute the main schema
      console.log('📋 Creating main schema...');
      const mainSchema = fs.readFileSync(
        path.join(__dirname, '../config/schema.sql'), 
        'utf8'
      );
      await client.query(mainSchema);
      console.log('✅ Main schema created');

      // Run organizations migration
      console.log('🏢 Adding organizations...');
      const orgMigration = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_organizations.sql'), 
        'utf8'
      );
      await client.query(orgMigration);
      console.log('✅ Organizations added');

      // Run analytics migration
      console.log('📊 Adding analytics features...');
      const analyticsMigration = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_completed_at.sql'), 
        'utf8'
      );
      await client.query(analyticsMigration);
      console.log('✅ Analytics features added');

      // Run ingestion migration
      console.log('📤 Adding ingestion features...');
      const ingestionMigration = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_ingestion_jobs.sql'), 
        'utf8'
      );
      await client.query(ingestionMigration);
      console.log('✅ Ingestion features added');

      // Run background jobs migration
      console.log('⚙️ Adding background jobs...');
      const backgroundJobsMigration = fs.readFileSync(
        path.join(__dirname, '../config/migration_add_background_jobs.sql'), 
        'utf8'
      );
      await client.query(backgroundJobsMigration);
      console.log('✅ Background jobs added');

      // Verify tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log('\n📋 Database tables created:');
      tables.forEach(table => console.log(`   • ${table}`));

      // Create default organization if it doesn't exist
      const orgCheck = await client.query(`
        SELECT id FROM organizations WHERE name = 'Default Organization'
      `);
      
      if (orgCheck.rowCount === 0) {
        await client.query(`
          INSERT INTO organizations (name, description) 
          VALUES ('Default Organization', 'Default organization for all users')
        `);
        console.log('✅ Default organization created');
      } else {
        console.log('✅ Default organization already exists');
      }

      console.log('\n🎉 Production database initialization complete!');
      console.log('\n🔗 Database URL: Connected successfully');
      console.log(`📊 Total tables: ${tables.length}`);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Production database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initProductionDatabase();
}

export default initProductionDatabase;
