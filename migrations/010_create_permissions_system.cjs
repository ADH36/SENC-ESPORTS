exports.up = async function(knex) {
  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name').unique().notNullable();
    table.string('description').nullable();
    table.string('category').notNullable(); // 'content_management', 'tournament_management', etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index('name', 'idx_permissions_name');
    table.index('category', 'idx_permissions_category');
  });

  // Create role_permissions junction table
  await knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.enum('role', ['player', 'manager', 'admin']).notNullable();
    table.uuid('permission_id').notNullable();
    table.timestamps(true, true);
    
    // Unique constraint
    table.unique(['role', 'permission_id'], 'unique_role_permission');
    
    // Indexes
    table.index('role', 'idx_role_permissions_role');
    table.index('permission_id', 'idx_role_permissions_permission');
    
    // Foreign key constraints
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
  });

  // Insert content management permissions
  const permissions = [
    {
      name: 'update_tournament_brackets',
      description: 'Can update tournament bracket information',
      category: 'content_management'
    },
    {
      name: 'embed_youtube_videos',
      description: 'Can embed YouTube videos in tournaments',
      category: 'content_management'
    },
    {
      name: 'manage_tournament_content',
      description: 'Can manage all tournament content including announcements',
      category: 'content_management'
    },
    {
      name: 'view_audit_logs',
      description: 'Can view content management audit logs',
      category: 'content_management'
    },
    {
      name: 'moderate_content',
      description: 'Can moderate and approve content before publishing',
      category: 'content_management'
    }
  ];

  // Insert permissions and role assignments
  for (const permission of permissions) {
    // Generate UUID for permission
    const permissionId = knex.raw('(UUID())');
    
    // Insert permission
    await knex('permissions').insert({
      id: permissionId,
      ...permission,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    // Get the actual permission ID
    const [insertedPermission] = await knex('permissions')
      .select('id')
      .where('name', permission.name)
      .limit(1);

    // Assign permissions to roles
    if (permission.name === 'update_tournament_brackets' || permission.name === 'embed_youtube_videos') {
      // Both managers and admins can update brackets and embed videos
      await knex('role_permissions').insert([
        {
          id: knex.raw('(UUID())'),
          role: 'manager',
          permission_id: insertedPermission.id,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        },
        {
          id: knex.raw('(UUID())'),
          role: 'admin',
          permission_id: insertedPermission.id,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        }
      ]);
    } else {
      // Other permissions are admin-only
      await knex('role_permissions').insert({
        id: knex.raw('(UUID())'),
        role: 'admin',
        permission_id: insertedPermission.id,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
    }
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTable('role_permissions');
  await knex.schema.dropTable('permissions');
};