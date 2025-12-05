import { ForbiddenError, ValidationError } from "@shared/errors";
import { PatternRepository } from "@infrastructure/database/repositories/PatternRepository";
import { PatternTagProposalRepository } from "@infrastructure/database/repositories/PatternTagProposalRepository";
import { TagRepository } from "@infrastructure/database/repositories/TagRepository";
import { PatternTagProposal } from "@infrastructure/database/models/PatternTagProposal";
import { PatternTagProposalDTO, TagProposalStatus } from "@shared/dtos";
import { PatternTagProposalMapper } from "@shared/mappers";
import { AccessControlService } from "@features/access-control/AccessControlService";
import { PatternTag } from "@infrastructure/database/models/PatternTag";

interface CreateProposalPayload {
  name: string;
  tagCategoryId: string;
  colorHex: string;
}

export class TagProposalService {
  constructor(
    private readonly proposalRepository = new PatternTagProposalRepository(),
    private readonly patternRepository = new PatternRepository(),
    private readonly tagRepository = new TagRepository(),
    private readonly accessControlService = new AccessControlService()
  ) {}

  async create(userId: string, patternId: string, payload: CreateProposalPayload): Promise<PatternTagProposalDTO> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new ValidationError("Pattern not found");
    }
    if (pattern.userId !== userId) {
      throw new ForbiddenError("You are not allowed to update this pattern");
    }

    await this.ensureCategoryExists(payload.tagCategoryId);

    const normalizedName = payload.name.trim();
    if (!normalizedName) {
      throw new ValidationError("Tag name is required");
    }

    const proposal = await this.proposalRepository.create({
      patternId,
      userId,
      tagCategoryId: payload.tagCategoryId,
      name: normalizedName,
      colorHex: payload.colorHex,
    });

    return PatternTagProposalMapper.toDTO(proposal);
  }

  async listForPattern(patternId: string, userId: string): Promise<PatternTagProposalDTO[]> {
    const pattern = await this.patternRepository.findById(patternId);
    if (!pattern) {
      throw new ValidationError("Pattern not found");
    }
    const proposals = await this.proposalRepository.listByPattern(patternId, userId);
    return PatternTagProposalMapper.toDTOList(proposals);
  }

  async listPending(): Promise<PatternTagProposalDTO[]> {
    const proposals = await this.proposalRepository.listPending();
    return PatternTagProposalMapper.toDTOList(proposals);
  }

  async approve(proposalId: string, adminUserId: string): Promise<PatternTagProposalDTO> {
    const proposal = await this.proposalRepository.requireById(proposalId);
    if (proposal.status !== "pending") {
      throw new ValidationError("Proposal has already been processed");
    }

    await this.ensureCategoryExists(proposal.tagCategoryId);

    const existingTag = await this.tagRepository.findByNameAndCategory(proposal.name, proposal.tagCategoryId);
    const tag = existingTag
      ? existingTag
      : await this.tagRepository.create({
          name: proposal.name,
          tagCategoryId: proposal.tagCategoryId,
          colorHex: proposal.colorHex,
        });

    if (!existingTag) {
      await this.accessControlService.createResource({
        id: tag.id,
        type: "tag",
        ownerId: adminUserId,
        referenceId: tag.id,
      });
    }

    await this.attachTagToPattern(proposal.patternId, tag.id);

    const updated = await this.proposalRepository.update(proposal, {
      status: "approved",
      tagId: tag.id,
      approvedByUserId: adminUserId,
      approvedAt: new Date(),
    });

    return PatternTagProposalMapper.toDTO(updated);
  }

  async reject(proposalId: string, adminUserId: string): Promise<PatternTagProposalDTO> {
    const proposal = await this.proposalRepository.requireById(proposalId);
    if (proposal.status !== "pending") {
      throw new ValidationError("Proposal has already been processed");
    }
    const updated = await this.proposalRepository.update(proposal, {
      status: "rejected",
      approvedByUserId: adminUserId,
      approvedAt: new Date(),
    });
    return PatternTagProposalMapper.toDTO(updated);
  }

  private async ensureCategoryExists(tagCategoryId: string): Promise<void> {
    const category = await this.tagRepository.findCategoryById(tagCategoryId);
    if (!category) {
      throw new ValidationError("Tag category not found");
    }
  }

  private async attachTagToPattern(patternId: string, tagId: string): Promise<void> {
    await PatternTag.findOrCreate({ where: { patternId, tagId }, defaults: { patternId, tagId } });
  }
}
