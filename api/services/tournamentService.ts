import db from '../config/database.js';

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  prizePool?: number;
  rules?: string;
  registrationDeadline: Date;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  managerId: string;
  bannerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  manager?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  registrationCount?: number;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId?: string;
  squadId?: string;
  registrationType: 'individual' | 'squad';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
  participant?: {
    id: string;
    name: string;
    type: 'user' | 'squad';
  };
}

export interface CreateTournamentData {
  name: string;
  game: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  prizePool?: number;
  rules?: string;
  registrationDeadline: Date;
  startDate: Date;
  endDate?: Date;
  managerId: string;
}

export interface UpdateTournamentData {
  name?: string;
  game?: string;
  format?: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants?: number;
  prizePool?: number;
  rules?: string;
  registrationDeadline?: Date;
  startDate?: Date;
  endDate?: Date;
  status?: 'draft' | 'open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  bannerUrl?: string;
}

class TournamentService {
  async createTournament(tournamentData: CreateTournamentData): Promise<Tournament> {
    const {
      name,
      game,
      format,
      maxParticipants,
      prizePool,
      rules,
      registrationDeadline,
      startDate,
      endDate,
      managerId
    } = tournamentData;

    // Check if tournament name already exists
    const existingTournament = await db('tournaments')
      .where('name', name)
      .first();

    if (existingTournament) {
      throw new Error('Tournament with this name already exists');
    }

    const [tournamentId] = await db('tournaments').insert({
      id: db.raw('(UUID())'),
      name,
      game,
      format,
      max_participants: maxParticipants,
      prize_pool: prizePool,
      rules,
      registration_deadline: registrationDeadline,
      start_date: startDate,
      end_date: endDate,
      status: 'draft',
      manager_id: managerId
    }).returning('id');

    return this.getTournamentById(tournamentId.id);
  }

  async getTournamentById(id: string): Promise<Tournament> {
    const tournament = await db('tournaments')
      .select(
        'tournaments.id',
        'tournaments.name',
        'tournaments.game',
        'tournaments.format',
        'tournaments.max_participants as maxParticipants',
        'tournaments.prize_pool as prizePool',
        'tournaments.rules',
        'tournaments.registration_deadline as registrationDeadline',
        'tournaments.start_date as startDate',
        'tournaments.end_date as endDate',
        'tournaments.status',
        'tournaments.manager_id as managerId',
        'tournaments.banner_url as bannerUrl',
        'tournaments.created_at as createdAt',
        'tournaments.updated_at as updatedAt',
        'users.username as managerUsername',
        'users.first_name as managerFirstName',
        'users.last_name as managerLastName'
      )
      .leftJoin('users', 'tournaments.manager_id', 'users.id')
      .where('tournaments.id', id)
      .first();

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Get registration count
    const registrationCount = await db('tournament_registrations')
      .where('tournament_id', id)
      .count('* as count')
      .first();

    return {
      ...tournament,
      manager: {
        id: tournament.managerId,
        username: tournament.managerUsername,
        firstName: tournament.managerFirstName,
        lastName: tournament.managerLastName
      },
      registrationCount: registrationCount?.count || 0
    };
  }

  async getAllTournaments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    game?: string
  ): Promise<{ tournaments: Tournament[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db('tournaments')
      .select(
        'tournaments.id',
        'tournaments.name',
        'tournaments.game',
        'tournaments.format',
        'tournaments.max_participants as maxParticipants',
        'tournaments.prize_pool as prizePool',
        'tournaments.rules',
        'tournaments.registration_deadline as registrationDeadline',
        'tournaments.start_date as startDate',
        'tournaments.end_date as endDate',
        'tournaments.status',
        'tournaments.manager_id as managerId',
        'tournaments.banner_url as bannerUrl',
        'tournaments.created_at as createdAt',
        'tournaments.updated_at as updatedAt',
        'users.username as managerUsername',
        'users.first_name as managerFirstName',
        'users.last_name as managerLastName'
      )
      .leftJoin('users', 'tournaments.manager_id', 'users.id')
      .orderBy('tournaments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    let countQuery = db('tournaments');

    if (status) {
      query = query.where('tournaments.status', status);
      countQuery = countQuery.where('status', status);
    }

    if (game) {
      query = query.where('tournaments.game', game);
      countQuery = countQuery.where('game', game);
    }

    const [tournaments, totalResult] = await Promise.all([
      query,
      countQuery.count('* as count').first()
    ]);

    const tournamentsWithManager = tournaments.map(tournament => ({
      ...tournament,
      manager: {
        id: tournament.managerId,
        username: tournament.managerUsername,
        firstName: tournament.managerFirstName,
        lastName: tournament.managerLastName
      }
    }));

    return {
      tournaments: tournamentsWithManager,
      total: totalResult?.count || 0
    };
  }

  async updateTournament(id: string, updateData: UpdateTournamentData, requesterId: string): Promise<Tournament> {
    // Check if requester is manager or admin
    const tournament = await db('tournaments').where('id', id).first();
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const requester = await db('users').where('id', requesterId).first();
    if (tournament.manager_id !== requesterId && requester?.role !== 'admin') {
      throw new Error('Only tournament manager or admin can update tournament');
    }

    const updateFields: any = { updated_at: db.fn.now() };
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.game) updateFields.game = updateData.game;
    if (updateData.format) updateFields.format = updateData.format;
    if (updateData.maxParticipants) updateFields.max_participants = updateData.maxParticipants;
    if (updateData.prizePool !== undefined) updateFields.prize_pool = updateData.prizePool;
    if (updateData.rules !== undefined) updateFields.rules = updateData.rules;
    if (updateData.registrationDeadline) updateFields.registration_deadline = updateData.registrationDeadline;
    if (updateData.startDate) updateFields.start_date = updateData.startDate;
    if (updateData.endDate !== undefined) updateFields.end_date = updateData.endDate;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.bannerUrl !== undefined) updateFields.banner_url = updateData.bannerUrl;

    await db('tournaments').where('id', id).update(updateFields);
    return this.getTournamentById(id);
  }

  async registerForTournament(
    tournamentId: string,
    userId: string,
    squadId?: string
  ): Promise<TournamentRegistration> {
    const tournament = await db('tournaments').where('id', tournamentId).first();
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'open') {
      throw new Error('Tournament registration is not open');
    }

    if (new Date() > new Date(tournament.registration_deadline)) {
      throw new Error('Registration deadline has passed');
    }

    // Check if already registered
    const existingRegistration = await db('tournament_registrations')
      .where({
        tournament_id: tournamentId,
        user_id: userId
      })
      .orWhere(function() {
        if (squadId) {
          this.where({
            tournament_id: tournamentId,
            squad_id: squadId
          });
        }
      })
      .first();

    if (existingRegistration) {
      throw new Error('Already registered for this tournament');
    }

    // Check participant limit
    const registrationCount = await db('tournament_registrations')
      .where('tournament_id', tournamentId)
      .count('* as count')
      .first();

    if (registrationCount && registrationCount.count >= tournament.max_participants) {
      throw new Error('Tournament is full');
    }

    const registrationType = squadId ? 'squad' : 'individual';

    const [registrationId] = await db('tournament_registrations').insert({
      id: db.raw('(UUID())'),
      tournament_id: tournamentId,
      user_id: userId,
      squad_id: squadId,
      registration_type: registrationType,
      status: 'pending'
    }).returning('id');

    return this.getRegistrationById(registrationId.id);
  }

  async getRegistrationById(id: string): Promise<TournamentRegistration> {
    const registration = await db('tournament_registrations')
      .select(
        'tournament_registrations.id',
        'tournament_registrations.tournament_id as tournamentId',
        'tournament_registrations.user_id as userId',
        'tournament_registrations.squad_id as squadId',
        'tournament_registrations.registration_type as registrationType',
        'tournament_registrations.status',
        'tournament_registrations.registered_at as registeredAt'
      )
      .where('tournament_registrations.id', id)
      .first();

    if (!registration) {
      throw new Error('Registration not found');
    }

    return registration;
  }

  async getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    const registrations = await db('tournament_registrations')
      .select(
        'tournament_registrations.id',
        'tournament_registrations.tournament_id as tournamentId',
        'tournament_registrations.user_id as userId',
        'tournament_registrations.squad_id as squadId',
        'tournament_registrations.registration_type as registrationType',
        'tournament_registrations.status',
        'tournament_registrations.registered_at as registeredAt',
        'users.username as userUsername',
        'users.first_name as userFirstName',
        'users.last_name as userLastName',
        'squads.name as squadName'
      )
      .leftJoin('users', 'tournament_registrations.user_id', 'users.id')
      .leftJoin('squads', 'tournament_registrations.squad_id', 'squads.id')
      .where('tournament_registrations.tournament_id', tournamentId)
      .orderBy('tournament_registrations.registered_at', 'desc');

    return registrations.map(reg => ({
      id: reg.id,
      tournamentId: reg.tournamentId,
      userId: reg.userId,
      squadId: reg.squadId,
      registrationType: reg.registrationType,
      status: reg.status,
      registeredAt: reg.registeredAt,
      participant: {
        id: reg.squadId || reg.userId,
        name: reg.squadName || `${reg.userFirstName} ${reg.userLastName}`,
        type: reg.squadId ? 'squad' : 'user'
      }
    }));
  }

  async updateRegistrationStatus(
    registrationId: string,
    status: 'approved' | 'rejected',
    managerId: string
  ): Promise<void> {
    const registration = await db('tournament_registrations')
      .join('tournaments', 'tournament_registrations.tournament_id', 'tournaments.id')
      .select('tournaments.manager_id', 'tournament_registrations.id')
      .where('tournament_registrations.id', registrationId)
      .first();

    if (!registration) {
      throw new Error('Registration not found');
    }

    const manager = await db('users').where('id', managerId).first();
    if (registration.manager_id !== managerId && manager?.role !== 'admin') {
      throw new Error('Only tournament manager or admin can update registration status');
    }

    await db('tournament_registrations')
      .where('id', registrationId)
      .update({ status });
  }

  async deleteTournament(id: string, requesterId: string): Promise<void> {
    const tournament = await db('tournaments').where('id', id).first();
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const requester = await db('users').where('id', requesterId).first();
    if (tournament.manager_id !== requesterId && requester?.role !== 'admin') {
      throw new Error('Only tournament manager or admin can delete tournament');
    }

    if (tournament.status === 'in_progress') {
      throw new Error('Cannot delete tournament that is in progress');
    }

    const trx = await db.transaction();

    try {
      // Delete related data
      await trx('match_participants').whereIn('match_id', 
        trx('matches').select('id').where('tournament_id', id)
      ).del();
      await trx('matches').where('tournament_id', id).del();
      await trx('brackets').where('tournament_id', id).del();
      await trx('tournament_registrations').where('tournament_id', id).del();
      await trx('tournaments').where('id', id).del();
      
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

export default new TournamentService();