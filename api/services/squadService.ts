import db from '../config/database';

export interface Squad {
  id: string;
  name: string;
  description?: string;
  game: string;
  captainId: string;
  isRecruiting: boolean;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  captain?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  memberCount?: number;
}

export interface SquadMember {
  id: string;
  squadId: string;
  userId: string;
  role: 'captain' | 'member';
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface CreateSquadData {
  name: string;
  description?: string;
  game: string;
  captainId: string;
  isRecruiting?: boolean;
}

export interface UpdateSquadData {
  name?: string;
  description?: string;
  game?: string;
  isRecruiting?: boolean;
  logoUrl?: string;
}

class SquadService {
  async createSquad(squadData: CreateSquadData): Promise<Squad> {
    const { name, description, game, captainId, isRecruiting = true } = squadData;

    // Check if squad name already exists
    const existingSquad = await db('squads')
      .where('name', name)
      .first();

    if (existingSquad) {
      throw new Error('Squad with this name already exists');
    }

    // Check if user is already a captain of another squad
    const existingCaptain = await db('squad_members')
      .where({ user_id: captainId, role: 'captain' })
      .first();

    if (existingCaptain) {
      throw new Error('User is already a captain of another squad');
    }

    const trx = await db.transaction();

    try {
      // Create squad
      const [squadId] = await trx('squads').insert({
        id: trx.raw('(UUID())'),
        name,
        description,
        game,
        captain_id: captainId,
        is_recruiting: isRecruiting
      }).returning('id');

      // Add captain as squad member
      await trx('squad_members').insert({
        id: trx.raw('(UUID())'),
        squad_id: squadId.id,
        user_id: captainId,
        role: 'captain'
      });

      await trx.commit();
      return this.getSquadById(squadId.id);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getSquadById(id: string): Promise<Squad> {
    const squad = await db('squads')
      .select(
        'squads.id',
        'squads.name',
        'squads.description',
        'squads.game',
        'squads.captain_id as captainId',
        'squads.is_recruiting as isRecruiting',
        'squads.logo_url as logoUrl',
        'squads.created_at as createdAt',
        'squads.updated_at as updatedAt',
        'users.username as captainUsername',
        'users.first_name as captainFirstName',
        'users.last_name as captainLastName'
      )
      .leftJoin('users', 'squads.captain_id', 'users.id')
      .where('squads.id', id)
      .first();

    if (!squad) {
      throw new Error('Squad not found');
    }

    // Get member count
    const memberCount = await db('squad_members')
      .where('squad_id', id)
      .count('* as count')
      .first();

    return {
      ...squad,
      captain: {
        id: squad.captainId,
        username: squad.captainUsername,
        firstName: squad.captainFirstName,
        lastName: squad.captainLastName
      },
      memberCount: memberCount?.count || 0
    };
  }

  async getSquadMembers(squadId: string): Promise<SquadMember[]> {
    const members = await db('squad_members')
      .select(
        'squad_members.id',
        'squad_members.squad_id as squadId',
        'squad_members.user_id as userId',
        'squad_members.role',
        'squad_members.joined_at as joinedAt',
        'users.username',
        'users.first_name as firstName',
        'users.last_name as lastName',
        'users.avatar_url as avatarUrl'
      )
      .join('users', 'squad_members.user_id', 'users.id')
      .where('squad_members.squad_id', squadId)
      .orderBy('squad_members.role', 'desc')
      .orderBy('squad_members.joined_at', 'asc');

    return members.map(member => ({
      id: member.id,
      squadId: member.squadId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.userId,
        username: member.username,
        firstName: member.firstName,
        lastName: member.lastName,
        avatarUrl: member.avatarUrl
      }
    }));
  }

  async addMember(squadId: string, userId: string): Promise<void> {
    // Check if user is already in the squad
    const existingMember = await db('squad_members')
      .where({ squad_id: squadId, user_id: userId })
      .first();

    if (existingMember) {
      throw new Error('User is already a member of this squad');
    }

    // Check if squad is recruiting
    const squad = await db('squads')
      .where({ id: squadId, is_recruiting: true })
      .first();

    if (!squad) {
      throw new Error('Squad not found or not recruiting');
    }

    await db('squad_members').insert({
      id: db.raw('(UUID())'),
      squad_id: squadId,
      user_id: userId,
      role: 'member'
    });
  }

  async removeMember(squadId: string, userId: string, requesterId: string): Promise<void> {
    // Check if requester is captain or the member themselves
    const squad = await db('squads').where('id', squadId).first();
    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captain_id !== requesterId && userId !== requesterId) {
      throw new Error('Only squad captain or the member themselves can remove members');
    }

    // Cannot remove captain
    if (squad.captain_id === userId) {
      throw new Error('Cannot remove squad captain');
    }

    const deleted = await db('squad_members')
      .where({ squad_id: squadId, user_id: userId })
      .del();

    if (!deleted) {
      throw new Error('Member not found in squad');
    }
  }

  async updateSquad(id: string, updateData: UpdateSquadData, requesterId: string): Promise<Squad> {
    // Check if requester is captain
    const squad = await db('squads').where('id', id).first();
    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captain_id !== requesterId) {
      throw new Error('Only squad captain can update squad details');
    }

    const updateFields: any = { updated_at: db.fn.now() };
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.game) updateFields.game = updateData.game;
    if (updateData.isRecruiting !== undefined) updateFields.is_recruiting = updateData.isRecruiting;
    if (updateData.logoUrl !== undefined) updateFields.logo_url = updateData.logoUrl;

    await db('squads').where('id', id).update(updateFields);
    return this.getSquadById(id);
  }

  async getAllSquads(page: number = 1, limit: number = 20, game?: string): Promise<{ squads: Squad[], total: number }> {
    const offset = (page - 1) * limit;
    let query = db('squads')
      .select(
        'squads.id',
        'squads.name',
        'squads.description',
        'squads.game',
        'squads.captain_id as captainId',
        'squads.is_recruiting as isRecruiting',
        'squads.logo_url as logoUrl',
        'squads.created_at as createdAt',
        'squads.updated_at as updatedAt',
        'users.username as captainUsername',
        'users.first_name as captainFirstName',
        'users.last_name as captainLastName'
      )
      .leftJoin('users', 'squads.captain_id', 'users.id')
      .orderBy('squads.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    let countQuery = db('squads');

    if (game) {
      query = query.where('squads.game', game);
      countQuery = countQuery.where('game', game);
    }

    const [squads, totalResult] = await Promise.all([
      query,
      countQuery.count('* as count').first()
    ]);

    const squadsWithCaptain = squads.map(squad => ({
      ...squad,
      captain: {
        id: squad.captainId,
        username: squad.captainUsername,
        firstName: squad.captainFirstName,
        lastName: squad.captainLastName
      }
    }));

    return {
      squads: squadsWithCaptain,
      total: Number(totalResult?.count) || 0
    };
  }

  async deleteSquad(id: string, requesterId: string): Promise<void> {
    // Check if requester is captain
    const squad = await db('squads').where('id', id).first();
    if (!squad) {
      throw new Error('Squad not found');
    }

    if (squad.captain_id !== requesterId) {
      throw new Error('Only squad captain can delete the squad');
    }

    const trx = await db.transaction();

    try {
      // Remove all squad members
      await trx('squad_members').where('squad_id', id).del();
      
      // Delete squad
      await trx('squads').where('id', id).del();
      
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

export default new SquadService();