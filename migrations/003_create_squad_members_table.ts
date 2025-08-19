import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('squad_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('squad_id').notNullable();
    table.uuid('user_id').notNullable();
    table.string('role', 50).defaultTo('member');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    
    // Create unique constraint
    table.unique(['squad_id', 'user_id'], 'unique_squad_user');
    
    // Create indexes
    table.index('squad_id', 'idx_squad_members_squad');
    table.index('user_id', 'idx_squad_members_user');
    
    // Foreign key constraints
    table.foreign('squad_id').references('id').inTable('squads').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('squad_members');
}