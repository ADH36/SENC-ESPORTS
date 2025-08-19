import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tournaments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name', 200).notNullable();
    table.string('game', 100).notNullable();
    table.enum('format', ['single_elimination', 'double_elimination', 'round_robin', 'swiss']).notNullable();
    table.integer('max_participants').notNullable();
    table.decimal('prize_pool', 10, 2).defaultTo(0);
    table.text('rules').notNullable();
    table.datetime('registration_deadline').notNullable();
    table.datetime('start_date').notNullable();
    table.datetime('end_date').nullable();
    table.enum('status', ['draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled']).defaultTo('draft');
    table.uuid('manager_id').notNullable();
    table.string('banner_url', 500).nullable();
    table.timestamps(true, true);
    
    // Create indexes
    table.index('game', 'idx_tournaments_game');
    table.index('status', 'idx_tournaments_status');
    table.index('manager_id', 'idx_tournaments_manager');
    table.index(['start_date', 'end_date'], 'idx_tournaments_dates');
    
    // Foreign key constraint
    table.foreign('manager_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tournaments');
}