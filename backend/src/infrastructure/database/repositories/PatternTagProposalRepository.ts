import { FindOptions, Op } from "sequelize";
import {
  PatternTagProposal,
  PatternTagProposalAttributes,
  PatternTagProposalCreationAttributes,
  TagProposalStatus,
} from "@infrastructure/database/models/PatternTagProposal";
import { TagCategory } from "@infrastructure/database/models/TagCategory";
import { Tag } from "@infrastructure/database/models/Tag";
import { User } from "@infrastructure/database/models/User";
import { NotFoundError } from "@shared/errors";

export class PatternTagProposalRepository {
  create(data: PatternTagProposalCreationAttributes): Promise<PatternTagProposal> {
    return PatternTagProposal.create(data);
  }

  findById(id: string, options?: FindOptions<PatternTagProposal>): Promise<PatternTagProposal | null> {
    return PatternTagProposal.findByPk(id, options);
  }

  async requireById(id: string, options?: FindOptions<PatternTagProposal>): Promise<PatternTagProposal> {
    const proposal = await this.findById(id, options);
    if (!proposal) {
      throw new NotFoundError("Pattern tag proposal");
    }
    return proposal;
  }

  listByPattern(patternId: string, userId?: string): Promise<PatternTagProposal[]> {
    return PatternTagProposal.findAll({
      where: {
        patternId,
        ...(userId ? { [Op.or]: [{ status: "approved" }, { userId }] } : { status: "approved" }),
      },
      include: [
        { model: TagCategory, as: "category" },
        { model: Tag, as: "tag" },
        { model: User, as: "proposedBy" },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  listPending(): Promise<PatternTagProposal[]> {
    return PatternTagProposal.findAll({
      where: { status: "pending" },
      include: [
        { model: TagCategory, as: "category" },
        { model: Tag, as: "tag" },
        { model: User, as: "proposedBy" },
      ],
      order: [["createdAt", "ASC"]],
    });
  }

  async update(proposal: PatternTagProposal, data: Partial<PatternTagProposalAttributes>): Promise<PatternTagProposal> {
    await proposal.update(data);
    return proposal;
  }

  async setStatus(
    id: string,
    status: TagProposalStatus,
    data: Partial<PatternTagProposalAttributes> = {}
  ): Promise<PatternTagProposal> {
    const proposal = await this.requireById(id);
    await proposal.update({ status, ...data });
    return proposal;
  }
}
