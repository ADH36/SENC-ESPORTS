exports.up = async function(knex) {
  return knex.schema.createTable('tournament_registrations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('tournament_id').notNullable();
    table.uuid('user_id').nullable();
    table.uuid('squad_id').nullable();
    table.enum('registration_type', ['individual', 'squad']).notNullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'withdrawn']).defaultTo('pending');
    table.timestamp('registered_at').defaultTo(knex.fn.now());
    
    // Create unique constraint
    table.unique(['tournament_id', 'user_id', 'squad_id'], 'unique_tournament_participant');
    
    // Create indexes
    table.index('tournament_id', 'idx_registrations_tournament');
    table.index('user_id', 'idx_registrations_user');
    table.index('squad_id', 'idx_registrations_squad');
    table.index('status', 'idx_registrations_status');
    
    // Foreign key constraints
    table.foreign('tournament_id').references('id').inTable('tournaments').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('squad_id').references('id').inTable('squads').onDelete('CASCADE');
  });
};

exports.down = async function(knex) {
  return knex.schema.dropTable('tournament_registrations');
};