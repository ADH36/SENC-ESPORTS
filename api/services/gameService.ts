import db from '../config/database';

export interface Game {
  id?: number;
  name: string;
  description?: string;
  image_url?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateGameData {
  name: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateGameData {
  name?: string;
  description?: string;
  image_url?: string;
  status?: 'active' | 'inactive';
}

// Get all active games
export async function getAllActiveGames(): Promise<Game[]> {
  return await db('games')
    .where('status', 'active')
    .orderBy('name', 'asc');
}

// Get all games (admin)
export async function getAllGames(): Promise<Game[]> {
  return await db('games')
    .orderBy('created_at', 'desc');
}

// Get game by ID
export async function getGameById(id: number): Promise<Game | null> {
  const game = await db('games')
    .where('id', id)
    .first();
  
  return game || null;
}

// Create new game
export async function createGame(gameData: CreateGameData): Promise<Game> {
  const [gameId] = await db('games')
    .insert({
      name: gameData.name,
      description: gameData.description,
      image_url: gameData.image_url,
      status: gameData.status || 'active'
    });
  
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error('Failed to create game');
  }
  
  return game;
}

// Update game
export async function updateGame(id: number, updateData: UpdateGameData): Promise<Game | null> {
  const updateFields: any = {};
  
  if (updateData.name !== undefined) updateFields.name = updateData.name;
  if (updateData.description !== undefined) updateFields.description = updateData.description;
  if (updateData.image_url !== undefined) updateFields.image_url = updateData.image_url;
  if (updateData.status !== undefined) updateFields.status = updateData.status;
  
  if (Object.keys(updateFields).length === 0) {
    return await getGameById(id);
  }
  
  updateFields.updated_at = new Date();
  
  const updatedRows = await db('games')
    .where('id', id)
    .update(updateFields);
  
  if (updatedRows === 0) {
    return null;
  }
  
  return await getGameById(id);
}

// Delete game
export async function deleteGame(id: number): Promise<boolean> {
  const deletedRows = await db('games')
    .where('id', id)
    .del();
  
  return deletedRows > 0;
}

// Check if game exists
export async function gameExists(id: number): Promise<boolean> {
  const game = await db('games')
    .where('id', id)
    .first();
  
  return !!game;
}

// Get games count
export async function getGamesCount(): Promise<number> {
  const result = await db('games')
    .count('id as count')
    .first();
  
  return result?.count || 0;
}