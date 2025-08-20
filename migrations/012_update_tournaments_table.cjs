/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('tournaments', function(table) {
    table.integer('game_id').unsigned().references('id').inTable('games').onDelete('SET NULL');
    table.enum('registration_type', ['squad', 'single', 'both']).defaultTo('both');
    table.decimal('registration_cost', 10, 2).defaultTo(0);
    table.boolean('is_paid').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('tournaments', function(table) {
    table.dropColumn('game_id');
    table.dropColumn('registration_type');
    table.dropColumn('registration_cost');
    table.dropColumn('is_paid');
  });
};