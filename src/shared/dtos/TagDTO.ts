export interface TagCategoryDTO {
  id: string;
  name: string;
  displayOrder: number;
}

export interface TagDTO {
  id: string;
  name: string;
  colorHex: string;
  tagCategoryId: string;
  category?: TagCategoryDTO;
}
