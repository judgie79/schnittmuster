// User Types
export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreateInput {
  username: string;
  email: string;
  password: string;
}

export interface IUserResponse {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

// Pattern Types
export interface IPattern {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  file_path: string;
  thumbnail_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPatternCreateInput {
  name: string;
  description?: string;
}

export interface IPatternWithTags extends IPattern {
  tags: ITag[];
  notes: IPatternNote[];
}

// Tag Types
export interface ITagCategory {
  id: number;
  name: string;
  description?: string;
  display_order?: number;
  created_at: Date;
}

export interface ITag {
  id: number;
  name: string;
  tag_category_id: number;
  color_hex?: string;
  category?: ITagCategory;
  created_at: Date;
}

export interface IPatternTag {
  pattern_id: number;
  tag_id: number;
  assigned_at: Date;
}

// Pattern Note Types
export interface IPatternNote {
  id: number;
  pattern_id: number;
  note_text: string;
  created_at: Date;
}

// Auth Types
export interface IJwtPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IAuthResponse {
  access_token: string;
  refresh_token: string;
  user: IUserResponse;
}

// Error Types
export interface IApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}
