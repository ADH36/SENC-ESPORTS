import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('match_participants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('match_id').notNullable();
    table.uuid('participant_id').notNullable();
    table.enum('participant_type', ['user', 'squad']).notNullable();
    table.integer('seed').nullable();
    
    // Create unique constraint
    table.unique(['match_id', 'participant_id'], 'unique_match_participant');
    
    // Create indexes
    table.index('match_id', 'idx_match_participants_match');
    table.index('participant_id', 'idx_match_participants_participant');
    
    // Foreign key constraint
    table.foreign('match_id').references('id').inTable('matches').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('match_participants');
}