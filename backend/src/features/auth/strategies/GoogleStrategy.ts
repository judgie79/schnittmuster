import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { environment } from "@config/environment";
import logger from "@shared/utils/logger";
import { AuthService } from "../AuthService";

const authService = new AuthService();

const hasGoogleCredentials = Boolean(environment.oauth.googleClientId && environment.oauth.googleClientSecret);

if (!hasGoogleCredentials) {
  logger.warn("Google OAuth credentials missing – Google login disabled");
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: environment.oauth.googleClientId,
        clientSecret: environment.oauth.googleClientSecret,
        callbackURL: environment.oauth.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google profile missing email"));
          }
          const username = profile.displayName || profile.name?.givenName || email;
          const user = await authService.upsertOAuthUser({
            email,
            username,
          });
          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
}

export default passport;
