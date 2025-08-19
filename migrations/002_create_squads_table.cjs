exports.up = async function(knex) {
  return knex.schema.createTable('squads', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.string('game', 100).notNullable();
    table.uuid('captain_id').notNullable();
    table.boolean('is_recruiting').defaultTo(false);
    table.string('logo_url', 500).nullable();
    table.timestamps(true, true);
    
    // Create indexes
    table.index('captain_id', 'idx_squads_captain');
    table.index('game', 'idx_squads_game');
    
    // Foreign key constraint
    table.foreign('captain_id').references('id').inTable('users').onDelete('CASCADE');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('squads');
};