import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('brackets');
}