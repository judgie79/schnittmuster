import { QueryInterface, QueryTypes } from "sequelize";

const RESOURCE_TABLE = "resources";
const RESOURCE_ACCESS_TABLE = "resource_access";

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Backfill pattern resources
    await queryInterface.sequelize.query(
      `INSERT INTO ${RESOURCE_TABLE} (id, type, owner_id, reference_id, created_at, updated_at)
       SELECT p.id, 'pattern', p.user_id, p.id, NOW(), NOW()
       FROM patterns p
       WHERE NOT EXISTS (
         SELECT 1 FROM ${RESOURCE_TABLE} r WHERE r.id = p.id
       )`,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `INSERT INTO ${RESOURCE_ACCESS_TABLE} (user_id, resource_id, rights, granted_by, created_at, updated_at)
       SELECT p.user_id, p.id, ARRAY['read','write','delete']::text[], p.user_id, NOW(), NOW()
       FROM patterns p
       WHERE NOT EXISTS (
         SELECT 1 FROM ${RESOURCE_ACCESS_TABLE} ra
         WHERE ra.user_id = p.user_id AND ra.resource_id = p.id
       )`,
      { transaction }
    );

    // Determine fallback owner for tags (prefer an admin, fallback to first user)
    const [adminRows] = (await queryInterface.sequelize.query<{ id: string }>(
      `SELECT u.id
         FROM users u
         INNER JOIN user_roles ur ON ur.user_id = u.id
         INNER JOIN roles r ON r.id = ur.role_id AND r.name = 'admin'
         ORDER BY u.created_at ASC
         LIMIT 1`,
      { transaction, type: QueryTypes.SELECT }
    )) as [{ id: string }[], unknown];

    let tagOwnerId = adminRows?.[0]?.id;
    if (!tagOwnerId) {
      const [userRows] = (await queryInterface.sequelize.query<{ id: string }>(
        `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`,
        { transaction, type: QueryTypes.SELECT }
      )) as [{ id: string }[], unknown];
      tagOwnerId = userRows?.[0]?.id;
    }

    if (tagOwnerId) {
      await queryInterface.sequelize.query(
        `INSERT INTO ${RESOURCE_TABLE} (id, type, owner_id, reference_id, created_at, updated_at)
         SELECT t.id, 'tag', :ownerId, t.id, NOW(), NOW()
         FROM tags t
         WHERE NOT EXISTS (
           SELECT 1 FROM ${RESOURCE_TABLE} r WHERE r.id = t.id
         )`,
        { transaction, replacements: { ownerId: tagOwnerId } }
      );

      await queryInterface.sequelize.query(
        `INSERT INTO ${RESOURCE_ACCESS_TABLE} (user_id, resource_id, rights, granted_by, created_at, updated_at)
         SELECT :ownerId, t.id, ARRAY['read','write','delete']::text[], :ownerId, NOW(), NOW()
         FROM tags t
         WHERE NOT EXISTS (
           SELECT 1 FROM ${RESOURCE_ACCESS_TABLE} ra
           WHERE ra.user_id = :ownerId AND ra.resource_id = t.id
         )`,
        { transaction, replacements: { ownerId: tagOwnerId } }
      );
    }
  });
}

export async function down(_queryInterface: QueryInterface): Promise<void> {
  // Data backfill is irreversible without risking legitimate resources, so the down migration is intentionally a no-op.
}
