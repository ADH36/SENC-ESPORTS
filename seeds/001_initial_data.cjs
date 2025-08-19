const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('tournament_registrations').del();
  await knex('match_participants').del();
  await knex('matches').del();
  await knex('brackets').del();
  await knex('tournaments').del();
  await knex('squad_members').del();
  await knex('squads').del();
  await knex('users').del();

  // Hash password for admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const playerPasswordHash = await bcrypt.hash('player123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);

  // Generate UUIDs for users (using crypto.randomUUID for consistency)
  const { randomUUID } = require('crypto');
  const adminUserId = randomUUID();
  const playerUserId = randomUUID();
  const managerUserId = randomUUID();

  // Insert users
  await knex('users').insert([
    {
      id: adminUserId,
      email: 'admin@esports.com',
      username: 'admin',
      password_hash: adminPasswordHash,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin'
    }
  ]);

  await knex('users').insert([
    {
      id: playerUserId,
      email: 'player@esports.com',
      username: 'player1',
      password_hash: playerPasswordHash,
      first_name: 'John',
      last_name: 'Player',
      role: 'player'
    }
  ]);

  await knex('users').insert([
    {
      id: managerUserId,
      email: 'manager@esports.com',
      username: 'manager1',
      password_hash: managerPasswordHash,
      first_name: 'Jane',
      last_name: 'Manager',
      role: 'manager'
    }
  ]);

  // Generate UUID for squad
  const squadId = randomUUID();

  // Insert sample squad
  await knex('squads').insert([
    {
      id: squadId,
      name: 'Elite Gamers',
      description: 'Professional esports team',
      game: 'League of Legends',
      captain_id: playerUserId,
      is_recruiting: true
    }
  ]);

  // Insert squad member
  await knex('squad_members').insert([
    {
      id: randomUUID(),
      squad_id: squadId,
      user_id: playerUserId,
      role: 'captain'
    }
  ]);

  // Insert sample tournament
  await knex('tournaments').insert([
    {
      id: randomUUID(),
      name: 'Spring Championship 2024',
      game: 'League of Legends',
      format: 'single_elimination',
      max_participants: 32,
      prize_pool: 5000.00,
      rules: 'Standard tournament rules apply. All participants must be registered players.',
      registration_deadline: knex.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'),
      start_date: knex.raw('DATE_ADD(NOW(), INTERVAL 14 DAY)'),
      manager_id: managerUserId,
      status: 'open'
    }
  ]);
};