import { environment } from "./environment";

export const authConfig = {
  jwt: {
    accessSecret: environment.jwt.accessSecret,
    accessExpiry: environment.jwt.accessExpiry,
    refreshSecret: environment.jwt.refreshSecret,
    refreshExpiry: environment.jwt.refreshExpiry,
  },
  oauth: {
    provider: environment.oauth.provider,
    googleClientId: environment.oauth.googleClientId,
    googleClientSecret: environment.oauth.googleClientSecret,
    callbackUrl: environment.oauth.callbackUrl,
  },
};

export const jwtOptions = {
  issuer: "schnittmuster-manager",
  audience: "schnittmuster-clients",
  expiresIn: authConfig.jwt.accessExpiry,
};
