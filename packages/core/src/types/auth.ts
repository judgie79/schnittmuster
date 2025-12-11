export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  name: string;
}
