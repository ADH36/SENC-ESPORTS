import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface ContentItem {
  id: string;
  tournamentId: string;
  type: 'bracket' | 'youtube_embed' | 'announcement';
  title: string;
  description?: string;
  content: any;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface YouTubeEmbed {
  id: string;
  contentItemId: string;
  youtubeUrl: string;
  videoId: string;
  embedType: 'highlight' | 'live_stream' | 'recap' | 'interview';
  duration?: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  contentItemId: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  oldValues?: any;
  newValues?: any;
  userId: string;
  createdAt: Date;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateBracketData {
  tournamentId: string;
  bracketData: any;
  title: string;
  description?: string;
  userId: string;
}

export interface CreateYouTubeEmbedData {
  tournamentId: string;
  youtubeUrl: string;
  title: string;
  description?: string;
  embedType: 'highlight' | 'live_stream' | 'recap' | 'interview';
  userId: string;
}

export interface UpdateYouTubeEmbedData {
  youtubeUrl?: string;
  title?: string;
  description?: string;
  embedType?: 'highlight' | 'live_stream' | 'recap' | 'interview';
  isActive?: boolean;
  userId: string;
}

class ContentService {
  // Extract YouTube video ID from URL
  private extractYouTubeVideoId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (!match) {
      throw new Error('Invalid YouTube URL');
    }
    return match[1];
  }

  // Create audit log entry
  private async createAuditLog(
    contentItemId: string,
    action: string,
    userId: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await db('audit_logs').insert({
      id: uuidv4(),
      content_item_id: contentItemId,
      action,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      user_id: userId
    });
  }

  // Check user permissions
  private async checkUserPermissions(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await db('users')
      .select('role_permissions.permission_id')
      .join('role_permissions', 'users.role', 'role_permissions.role')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('users.id', userId)
      .where('permissions.name', permission)
      .first();

    return !!userPermissions;
  }

  async getContentByTournament(tournamentId: string, type?: string): Promise<ContentItem[]> {
    let query = db('content_items')
      .select(
        'content_items.id',
        'content_items.tournament_id as tournamentId',
        'content_items.type',
        'content_items.title',
        'content_items.description',
        'content_items.content',
        'content_items.is_active as isActive',
        'content_items.created_by as createdBy',
        'content_items.updated_by as updatedBy',
        'content_items.created_at as createdAt',
        'content_items.updated_at as updatedAt',
        'users.username as creatorUsername',
        'users.first_name as creatorFirstName',
        'users.last_name as creatorLastName'
      )
      .leftJoin('users', 'content_items.created_by', 'users.id')
      .where('content_items.tournament_id', tournamentId)
      .where('content_items.is_active', true)
      .orderBy('content_items.created_at', 'desc');

    if (type) {
      query = query.where('content_items.type', type);
    }

    const contentItems = await query;

    return contentItems.map(item => ({
      ...item,
      content: typeof item.content === 'string' ? JSON.parse(item.content) : item.content,
      creator: {
        id: item.createdBy,
        username: item.creatorUsername,
        firstName: item.creatorFirstName,
        lastName: item.creatorLastName
      }
    }));
  }

  async createOrUpdateBracket(data: CreateBracketData): Promise<ContentItem> {
    const { tournamentId, bracketData, title, description, userId } = data;

    // Check permissions
    const hasPermission = await this.checkUserPermissions(userId, 'update_tournament_brackets');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to update tournament brackets');
    }

    // Check if bracket already exists for this tournament
    const existingBracket = await db('content_items')
      .where('tournament_id', tournamentId)
      .where('type', 'bracket')
      .first();

    let contentItem;
    
    if (existingBracket) {
      // Update existing bracket
      const oldValues = {
        title: existingBracket.title,
        description: existingBracket.description,
        content: existingBracket.content
      };

      await db('content_items')
        .where('id', existingBracket.id)
        .update({
          title,
          description,
          content: JSON.stringify(bracketData),
          updated_by: userId,
          updated_at: new Date()
        });

      // Create audit log
      await this.createAuditLog(
        existingBracket.id,
        'update',
        userId,
        oldValues,
        { title, description, content: bracketData }
      );

      contentItem = await this.getContentById(existingBracket.id);
    } else {
      // Create new bracket
      const contentId = uuidv4();
      
      await db('content_items').insert({
        id: contentId,
        tournament_id: tournamentId,
        type: 'bracket',
        title,
        description,
        content: JSON.stringify(bracketData),
        is_active: true,
        created_by: userId,
        updated_by: userId
      });

      // Create audit log
      await this.createAuditLog(
        contentId,
        'create',
        userId,
        null,
        { title, description, content: bracketData }
      );

      contentItem = await this.getContentById(contentId);
    }

    return contentItem;
  }

  async createYouTubeEmbed(data: CreateYouTubeEmbedData): Promise<ContentItem> {
    const { tournamentId, youtubeUrl, title, description, embedType, userId } = data;

    // Check permissions
    const hasPermission = await this.checkUserPermissions(userId, 'embed_youtube_videos');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to embed YouTube videos');
    }

    // Extract video ID
    const videoId = this.extractYouTubeVideoId(youtubeUrl);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const contentId = uuidv4();
    const embedId = uuidv4();

    // Start transaction
    await db.transaction(async (trx) => {
      // Create content item
      await trx('content_items').insert({
        id: contentId,
        tournament_id: tournamentId,
        type: 'youtube_embed',
        title,
        description,
        content: JSON.stringify({ embedId }),
        is_active: true,
        created_by: userId,
        updated_by: userId
      });

      // Create YouTube embed record
      await trx('youtube_embeds').insert({
        id: embedId,
        content_item_id: contentId,
        youtube_url: youtubeUrl,
        video_id: videoId,
        embed_type: embedType,
        thumbnail_url: thumbnailUrl
      });

      // Create audit log
      await this.createAuditLog(
        contentId,
        'create',
        userId,
        null,
        { title, description, youtubeUrl, embedType }
      );
    });

    return this.getContentById(contentId);
  }

  async updateYouTubeEmbed(embedId: string, data: UpdateYouTubeEmbedData): Promise<ContentItem> {
    const { youtubeUrl, title, description, embedType, isActive, userId } = data;

    // Check permissions
    const hasPermission = await this.checkUserPermissions(userId, 'embed_youtube_videos');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to update YouTube embeds');
    }

    // Get existing embed
    const existingEmbed = await db('youtube_embeds')
      .select('youtube_embeds.*', 'content_items.title', 'content_items.description', 'content_items.is_active')
      .join('content_items', 'youtube_embeds.content_item_id', 'content_items.id')
      .where('youtube_embeds.id', embedId)
      .first();

    if (!existingEmbed) {
      throw new Error('YouTube embed not found');
    }

    const oldValues = {
      title: existingEmbed.title,
      description: existingEmbed.description,
      youtubeUrl: existingEmbed.youtube_url,
      embedType: existingEmbed.embed_type,
      isActive: existingEmbed.is_active
    };

    const updateData: any = {
      updated_by: userId,
      updated_at: new Date()
    };

    const embedUpdateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (embedType !== undefined) embedUpdateData.embed_type = embedType;

    if (youtubeUrl) {
      const videoId = this.extractYouTubeVideoId(youtubeUrl);
      embedUpdateData.youtube_url = youtubeUrl;
      embedUpdateData.video_id = videoId;
      embedUpdateData.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Update content item
      if (Object.keys(updateData).length > 2) { // More than just updated_by and updated_at
        await trx('content_items')
          .where('id', existingEmbed.content_item_id)
          .update(updateData);
      }

      // Update YouTube embed
      if (Object.keys(embedUpdateData).length > 0) {
        await trx('youtube_embeds')
          .where('id', embedId)
          .update(embedUpdateData);
      }

      // Create audit log
      await this.createAuditLog(
        existingEmbed.content_item_id,
        'update',
        userId,
        oldValues,
        { title, description, youtubeUrl, embedType, isActive }
      );
    });

    return this.getContentById(existingEmbed.content_item_id);
  }

  async deleteContent(contentId: string, userId: string): Promise<void> {
    // Check permissions (either bracket or youtube permission)
    const hasBracketPermission = await this.checkUserPermissions(userId, 'update_tournament_brackets');
    const hasYouTubePermission = await this.checkUserPermissions(userId, 'embed_youtube_videos');
    
    if (!hasBracketPermission && !hasYouTubePermission) {
      throw new Error('Insufficient permissions to delete content');
    }

    // Get existing content
    const existingContent = await db('content_items')
      .where('id', contentId)
      .first();

    if (!existingContent) {
      throw new Error('Content not found');
    }

    // Create audit log before deletion
    await this.createAuditLog(
      contentId,
      'delete',
      userId,
      {
        title: existingContent.title,
        description: existingContent.description,
        type: existingContent.type
      },
      null
    );

    // Start transaction
    await db.transaction(async (trx) => {
      // Delete related YouTube embed if exists
      if (existingContent.type === 'youtube_embed') {
        await trx('youtube_embeds')
          .where('content_item_id', contentId)
          .del();
      }

      // Delete content item
      await trx('content_items')
        .where('id', contentId)
        .del();
    });
  }

  async getContentById(contentId: string): Promise<ContentItem> {
    const contentItem = await db('content_items')
      .select(
        'content_items.id',
        'content_items.tournament_id as tournamentId',
        'content_items.type',
        'content_items.title',
        'content_items.description',
        'content_items.content',
        'content_items.is_active as isActive',
        'content_items.created_by as createdBy',
        'content_items.updated_by as updatedBy',
        'content_items.created_at as createdAt',
        'content_items.updated_at as updatedAt',
        'users.username as creatorUsername',
        'users.first_name as creatorFirstName',
        'users.last_name as creatorLastName'
      )
      .leftJoin('users', 'content_items.created_by', 'users.id')
      .where('content_items.id', contentId)
      .first();

    if (!contentItem) {
      throw new Error('Content not found');
    }

    return {
      ...contentItem,
      content: typeof contentItem.content === 'string' ? JSON.parse(contentItem.content) : contentItem.content,
      creator: {
        id: contentItem.createdBy,
        username: contentItem.creatorUsername,
        firstName: contentItem.creatorFirstName,
        lastName: contentItem.creatorLastName
      }
    };
  }

  async getAuditTrail(contentId: string, page: number = 1, limit: number = 20): Promise<{ auditLogs: AuditLog[], total: number }> {
    const offset = (page - 1) * limit;

    const auditLogs = await db('audit_logs')
      .select(
        'audit_logs.id',
        'audit_logs.content_item_id as contentItemId',
        'audit_logs.action',
        'audit_logs.old_values as oldValues',
        'audit_logs.new_values as newValues',
        'audit_logs.user_id as userId',
        'audit_logs.created_at as createdAt',
        'users.username as userUsername',
        'users.first_name as userFirstName',
        'users.last_name as userLastName'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.content_item_id', contentId)
      .orderBy('audit_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('audit_logs')
      .where('content_item_id', contentId)
      .count('* as count')
      .first();

    return {
      auditLogs: auditLogs.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
        user: {
          id: log.userId,
          username: log.userUsername,
          firstName: log.userFirstName,
          lastName: log.userLastName
        }
      })),
      total: totalCount?.count || 0
    };
  }

  async getTournamentAuditTrail(tournamentId: string, page: number = 1, limit: number = 20): Promise<{ auditLogs: AuditLog[], total: number }> {
    const offset = (page - 1) * limit;

    const auditLogs = await db('audit_logs')
      .select(
        'audit_logs.id',
        'audit_logs.content_item_id as contentItemId',
        'audit_logs.action',
        'audit_logs.old_values as oldValues',
        'audit_logs.new_values as newValues',
        'audit_logs.user_id as userId',
        'audit_logs.created_at as createdAt',
        'users.username as userUsername',
        'users.first_name as userFirstName',
        'users.last_name as userLastName'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .leftJoin('content_items', 'audit_logs.content_item_id', 'content_items.id')
      .where('content_items.tournament_id', tournamentId)
      .orderBy('audit_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('audit_logs')
      .leftJoin('content_items', 'audit_logs.content_item_id', 'content_items.id')
      .where('content_items.tournament_id', tournamentId)
      .count('* as count')
      .first();

    return {
      auditLogs: auditLogs.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
        user: {
          id: log.userId,
          username: log.userUsername,
          firstName: log.userFirstName,
          lastName: log.userLastName
        }
      })),
      total: totalCount?.count || 0
    };
  }
}

export default new ContentService();