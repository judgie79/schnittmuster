import { PatternTagProposal } from "@infrastructure/database/models/PatternTagProposal";
import { PatternTagProposalDTO } from "@shared/dtos";
import { TagMapper } from "./TagMapper";
import { UserMapper } from "./UserMapper";

export class PatternTagProposalMapper {
  static toDTO(proposal: PatternTagProposal): PatternTagProposalDTO {
    const category = proposal.get("category") as any;
    const tag = proposal.get("tag") as any;
    const proposedBy = proposal.get("proposedBy") as any;

    return {
      id: proposal.id,
      patternId: proposal.patternId,
      proposedByUserId: proposal.userId,
      tagCategoryId: proposal.tagCategoryId,
      name: proposal.name,
      status: proposal.status,
      colorHex: proposal.colorHex,
      tagId: proposal.tagId ?? undefined,
      approvedByUserId: proposal.approvedByUserId ?? undefined,
      approvedAt: proposal.approvedAt?.toISOString(),
      createdAt: proposal.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: proposal.updatedAt?.toISOString() ?? new Date().toISOString(),
      tag: tag ? TagMapper.toDTO(tag) : undefined,
      category: category ? TagMapper.toCategoryDTO(category) : undefined,
      proposedBy: proposedBy ? UserMapper.toDTO(proposedBy) : undefined,
    };
  }

  static toDTOList(proposals: PatternTagProposal[]): PatternTagProposalDTO[] {
    return proposals.map((proposal) => this.toDTO(proposal));
  }
}
