/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('wallet_requests', function(table) {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().notNullable().references('id').inTable('wallets').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['deposit', 'withdrawal']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'cancelled']).defaultTo('pending');
    table.text('user_notes'); // User's reason/notes for the request
    table.text('admin_notes'); // Admin's notes when processing
    table.string('payment_method', 100); // Bank transfer, cash, etc.
    table.text('payment_details'); // Account details, reference numbers, etc.
    table.integer('processed_by').unsigned().references('id').inTable('users').onDelete('SET NULL'); // Admin who processed
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('processed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index('wallet_id');
    table.index('user_id');
    table.index('type');
    table.index('status');
    table.index('processed_by');
    table.index('requested_at');
    table.index('processed_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('wallet_requests');
};