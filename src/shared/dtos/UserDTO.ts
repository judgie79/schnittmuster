export interface UserDTO {
  id: string;
  username: string;
  email: string;
  authProvider: "local" | "google";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdateDTO {
  username?: string;
  email?: string;
  password?: string;
}
