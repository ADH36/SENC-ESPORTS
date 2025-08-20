const knex = require('knex');
const config = require('./knexfile.cjs');

const db = knex(config.development);

async function dropPermissionsTable() {
  try {
    // Drop role_permissions first due to foreign key constraint
    await db.raw('DROP TABLE IF EXISTS role_permissions');
    console.log('Role permissions table dropped successfully');
    
    // Then drop permissions table
    await db.raw('DROP TABLE IF EXISTS permissions');
    console.log('Permissions table dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error.message);
  } finally {
    await db.destroy();
  }
}

dropPermissionsTable();