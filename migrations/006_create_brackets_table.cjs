exports.up = async function(knex) {
  return knex.schema.createTable('brackets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('tournament_id').notNullable();
    table.enum('bracket_type', ['main', 'losers', 'consolation']).defaultTo('main');
    table.json('bracket_data').notNullable();
    table.timestamps(true, true);
    
    // Create indexes
    table.index('tournament_id', 'idx_brackets_tournament');
    
    // Foreign key constraint
    table.foreign('tournament_id').references('id').inTable('tournaments').onDelete('CASCADE');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('brackets');
};