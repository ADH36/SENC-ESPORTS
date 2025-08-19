import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
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

  // Insert users
  const [adminUser] = await knex('users').insert([
    {
      id: knex.raw('(UUID())'),
      email: 'admin@esports.com',
      username: 'admin',
      password_hash: adminPasswordHash,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin'
    }
  ]).returning('id');

  const [playerUser] = await knex('users').insert([
    {
      id: knex.raw('(UUID())'),
      email: 'player@esports.com',
      username: 'player1',
      password_hash: playerPasswordHash,
      first_name: 'John',
      last_name: 'Player',
      role: 'player'
    }
  ]).returning('id');

  const [managerUser] = await knex('users').insert([
    {
      id: knex.raw('(UUID())'),
      email: 'manager@esports.com',
      username: 'manager1',
      password_hash: managerPasswordHash,
      first_name: 'Jane',
      last_name: 'Manager',
      role: 'manager'
    }
  ]).returning('id');

  // Insert sample squad
  const [squad] = await knex('squads').insert([
    {
      id: knex.raw('(UUID())'),
      name: 'Elite Gamers',
      description: 'Professional esports team',
      game: 'League of Legends',
      captain_id: playerUser.id,
      is_recruiting: true
    }
  ]).returning('id');

  // Insert squad member
  await knex('squad_members').insert([
    {
      id: knex.raw('(UUID())'),
      squad_id: squad.id,
      user_id: playerUser.id,
      role: 'captain'
    }
  ]);

  // Insert sample tournament
  await knex('tournaments').insert([
    {
      id: knex.raw('(UUID())'),
      name: 'Spring Championship 2024',
      game: 'League of Legends',
      format: 'single_elimination',
      max_participants: 32,
      prize_pool: 5000.00,
      rules: 'Standard tournament rules apply. All participants must be registered players.',
      registration_deadline: knex.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'),
      start_date: knex.raw('DATE_ADD(NOW(), INTERVAL 14 DAY)'),
      manager_id: managerUser.id,
      status: 'open'
    }
  ]);
}