export interface TagCategoryPayload {
  name: string;
  displayOrder?: number;
}

export interface TagPayload {
  name: string;
  tagCategoryId: string;
  colorHex: string;
}

export interface TagUpdatePayload extends Partial<TagPayload> {}
export interface TagCategoryUpdatePayload extends Partial<TagCategoryPayload> {}
