/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('wallet_transactions', function(table) {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().notNullable().references('id').inTable('wallets').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['deposit', 'withdrawal', 'admin_adjustment', 'tournament_fee', 'tournament_prize']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('balance_before', 15, 2).notNullable();
    table.decimal('balance_after', 15, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).defaultTo('completed');
    table.string('description', 500);
    table.string('reference_id', 100); // For linking to requests or other entities
    table.integer('processed_by').unsigned().references('id').inTable('users').onDelete('SET NULL'); // Admin who processed
    table.text('admin_notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index('wallet_id');
    table.index('user_id');
    table.index('type');
    table.index('status');
    table.index('reference_id');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('wallet_transactions');
};