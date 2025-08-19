import bcrypt from 'bcrypt';
import db from '../config/database.js';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'player' | 'manager' | 'admin';
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'player' | 'manager';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    const { email, username, password, firstName, lastName, role = 'player' } = userData;

    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [userId] = await db('users').insert({
      id: db.raw('(UUID())'),
      email,
      username,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role,
      is_active: true
    }).returning('id');

    // Return created user
    return this.getUserById(userId.id);
  }

  async getUserById(id: string): Promise<User> {
    const user = await db('users')
      .select(
        'id',
        'email',
        'username',
        'first_name as firstName',
        'last_name as lastName',
        'role',
        'is_active as isActive',
        'avatar_url as avatarUrl',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ id, is_active: true })
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User & { passwordHash: string }> {
    const user = await db('users')
      .select(
        'id',
        'email',
        'username',
        'first_name as firstName',
        'last_name as lastName',
        'role',
        'is_active as isActive',
        'avatar_url as avatarUrl',
        'password_hash as passwordHash',
        'created_at as createdAt',
        'updated_at as updatedAt'
      )
      .where({ email, is_active: true })
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    const updateFields: any = {};
    
    if (updateData.firstName) updateFields.first_name = updateData.firstName;
    if (updateData.lastName) updateFields.last_name = updateData.lastName;
    if (updateData.avatarUrl !== undefined) updateFields.avatar_url = updateData.avatarUrl;
    
    updateFields.updated_at = db.fn.now();

    await db('users')
      .where({ id, is_active: true })
      .update(updateFields);

    return this.getUserById(id);
  }

  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;

    const [users, totalResult] = await Promise.all([
      db('users')
        .select(
          'id',
          'email',
          'username',
          'first_name as firstName',
          'last_name as lastName',
          'role',
          'is_active as isActive',
          'avatar_url as avatarUrl',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .where('is_active', true)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('users').where('is_active', true).count('* as count').first()
    ]);

    return {
      users,
      total: totalResult?.count || 0
    };
  }

  async deactivateUser(id: string): Promise<void> {
    await db('users')
      .where({ id })
      .update({ is_active: false, updated_at: db.fn.now() });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default new UserService();