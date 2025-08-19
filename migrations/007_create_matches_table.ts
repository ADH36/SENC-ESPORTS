import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('matches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('tournament_id').notNullable();
    table.uuid('bracket_id').notNullable();
    table.integer('round_number').notNullable();
    table.integer('match_number').notNullable();
    table.datetime('scheduled_time').nullable();
    table.enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled']).defaultTo('scheduled');
    table.uuid('winner_id').nullable();
    table.string('score', 100).nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
    
    // Create indexes
    table.index('tournament_id', 'idx_matches_tournament');
    table.index('bracket_id', 'idx_matches_bracket');
    table.index('round_number', 'idx_matches_round');
    table.index('status', 'idx_matches_status');
    
    // Foreign key constraints
    table.foreign('tournament_id').references('id').inTable('tournaments').onDelete('CASCADE');
    table.foreign('bracket_id').references('id').inTable('brackets').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('matches');
}