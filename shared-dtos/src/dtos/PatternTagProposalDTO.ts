import type { ISODateString, UUID } from './types'
import type { TagCategoryDTO, TagDTO } from './TagDTO'
import type { UserDTO } from './UserDTO'

export type TagProposalStatus = 'pending' | 'approved' | 'rejected'

export interface PatternTagProposalDTO {
  id: UUID
  patternId: UUID
  proposedByUserId: UUID
  tagCategoryId: UUID
  name: string
  status: TagProposalStatus
  colorHex: string
  tagId?: UUID
  approvedByUserId?: UUID
  approvedAt?: ISODateString
  createdAt: ISODateString
  updatedAt: ISODateString
  tag?: TagDTO
  category?: TagCategoryDTO
  proposedBy?: UserDTO
}
