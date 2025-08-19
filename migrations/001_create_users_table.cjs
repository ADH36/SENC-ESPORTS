exports.up = async function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('email', 255).unique().notNullable();
    table.string('username', 50).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.enum('role', ['player', 'manager', 'admin']).defaultTo('player');
    table.boolean('is_active').defaultTo(true);
    table.string('avatar_url', 500).nullable();
    table.timestamps(true, true);
    
    // Create indexes
    table.index('email', 'idx_users_email');
    table.index('username', 'idx_users_username');
    table.index('role', 'idx_users_role');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('users');
};