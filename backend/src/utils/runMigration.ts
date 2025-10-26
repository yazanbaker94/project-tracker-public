import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export const runOrganizationMigration = async () => {
  try {
    console.log('🔄 Running organization migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../config/migration_add_organizations.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await pool.query(migration);
    
    console.log('✅ Organization migration completed successfully');
    
    // Create a default organization if none exists
    const orgCheck = await pool.query('SELECT COUNT(*) as count FROM organizations');
    const orgCount = parseInt(orgCheck.rows[0].count);
    
    if (orgCount === 0) {
      console.log('📝 Creating default organization...');
      const result = await pool.query(
        `INSERT INTO organizations (name, description) 
         VALUES ($1, $2) 
         RETURNING id, name`,
        ['Default Organization', 'Default organization for existing users']
      );
      console.log(`✅ Created organization: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      
      // Update existing users to belong to the default organization
      const updateUsers = await pool.query(
        'UPDATE users SET organization_id = $1 WHERE organization_id IS NULL',
        [result.rows[0].id]
      );
      console.log(`✅ Updated ${updateUsers.rowCount} users with organization`);
      
      // Update existing projects to belong to the default organization
      const updateProjects = await pool.query(
        'UPDATE projects SET organization_id = $1 WHERE organization_id IS NULL',
        [result.rows[0].id]
      );
      console.log(`✅ Updated ${updateProjects.rowCount} projects with organization`);
    }
    
    // Verify the migration
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'users', 'projects')
      ORDER BY table_name
    `);
    console.log('\n📊 Current tables:', tables.rows.map(r => r.table_name).join(', '));
    
    // Check columns
    const userCols = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'organization_id'
    `);
    
    const projectCols = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name = 'organization_id'
    `);
    
    if (userCols.rows.length > 0 && projectCols.rows.length > 0) {
      console.log('✅ Migration verified: organization_id columns added successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runOrganizationMigration()
    .then(() => {
      console.log('\n🎉 Migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export default runOrganizationMigration;
