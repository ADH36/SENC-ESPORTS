exports.up = async function(knex) {
  // Create content_items table
  await knex.schema.createTable('content_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('tournament_id').notNullable();
    table.enum('content_type', ['bracket', 'youtube_embed', 'announcement']).notNullable();
    table.text('content').nullable(); // JSON content for brackets, URL for YouTube, text for announcements
    table.string('title').nullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('tournament_id', 'idx_content_items_tournament');
    table.index('content_type', 'idx_content_items_type');
    table.index('is_active', 'idx_content_items_active');
    table.index('created_by', 'idx_content_items_creator');
    
    // Foreign key constraints
    table.foreign('tournament_id').references('id').inTable('tournaments').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT');
    table.foreign('updated_by').references('id').inTable('users').onDelete('RESTRICT');
  });

  // Create audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('content_item_id').notNullable();
    table.enum('action', ['create', 'update', 'delete', 'activate', 'deactivate']).notNullable();
    table.text('old_content').nullable(); // Previous content state
    table.text('new_content').nullable(); // New content state
    table.uuid('user_id').notNullable();
    table.string('user_role').notNullable();
    table.string('ip_address').nullable();
    table.text('change_reason').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('content_item_id', 'idx_audit_logs_content');
    table.index('user_id', 'idx_audit_logs_user');
    table.index('action', 'idx_audit_logs_action');
    table.index('created_at', 'idx_audit_logs_date');
    
    // Foreign key constraints
    table.foreign('content_item_id').references('id').inTable('content_items').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
  });

  // Create youtube_embeds table for specific YouTube functionality
  await knex.schema.createTable('youtube_embeds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('content_item_id').notNullable();
    table.string('youtube_url').notNullable();
    table.string('youtube_video_id').notNullable();
    table.string('embed_code').notNullable();
    table.json('video_metadata').nullable(); // Title, duration, thumbnail, etc.
    table.boolean('is_validated').defaultTo(false);
    table.timestamp('validated_at').nullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index('content_item_id', 'idx_youtube_embeds_content');
    table.index('youtube_video_id', 'idx_youtube_embeds_video_id');
    table.index('is_validated', 'idx_youtube_embeds_validated');
    
    // Foreign key constraints
    table.foreign('content_item_id').references('id').inTable('content_items').onDelete('CASCADE');
    
    // Unique constraint
    table.unique('content_item_id', 'unique_youtube_embed_per_content');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('youtube_embeds');
  await knex.schema.dropTable('audit_logs');
  await knex.schema.dropTable('content_items');
};