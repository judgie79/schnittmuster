import { Op } from "sequelize";
import { Role } from "@infrastructure/database/models/Role";
import { User } from "@infrastructure/database/models/User";
import { UserRole } from "@infrastructure/database/models/UserRole";
import { NotFoundError } from "@shared/errors";
import { RoleDTO, UserRole as UserRoleName } from "@schnittmuster/dtos";
import { RoleMapper } from "@shared/mappers";

export class RoleService {
  constructor(private readonly defaultRole: UserRoleName | string = "user") {}

  async listRoles(): Promise<RoleDTO[]> {
    const roles = await Role.findAll({ order: [["name", "ASC"]] });
    return RoleMapper.toDTOList(roles);
  }

  async findRoleByIdOrName(roleIdOrName: string): Promise<Role> {
    const role = await Role.findOne({
      where: {
        [Op.or]: [{ id: roleIdOrName }, { name: roleIdOrName }],
      },
    });
    if (!role) {
      throw new NotFoundError("Role");
    }
    return role;
  }

  async getUserRoles(userId: string): Promise<RoleDTO[]> {
    const roles = await Role.findAll({
      include: [
        {
          model: User,
          as: "users",
          attributes: [],
          where: { id: userId },
        },
      ],
      order: [["name", "ASC"]],
    });
    return RoleMapper.toDTOList(roles);
  }

  async ensureDefaultRole(userId: string): Promise<void> {
    const roles = await this.getUserRoles(userId);
    if (roles.length === 0) {
      await this.assignRole(userId, this.defaultRole);
    }
  }

  async assignRole(userId: string, roleIdOrName: string): Promise<RoleDTO> {
    const role = await this.findRoleByIdOrName(roleIdOrName);
    await UserRole.upsert({ userId, roleId: role.id });
    return RoleMapper.toDTO(role);
  }

  async revokeRole(userId: string, roleIdOrName: string): Promise<void> {
    const role = await this.findRoleByIdOrName(roleIdOrName);
    await UserRole.destroy({ where: { userId, roleId: role.id } });
  }

  async userHasRole(userId: string, roles: Array<UserRoleName | string>): Promise<boolean> {
    if (!roles.length) {
      return true;
    }
    const matches = await Role.count({
      include: [
        {
          model: User,
          as: "users",
          attributes: [],
          where: { id: userId },
        },
      ],
      where: { name: { [Op.in]: roles } },
    });
    return matches > 0;
  }
}
