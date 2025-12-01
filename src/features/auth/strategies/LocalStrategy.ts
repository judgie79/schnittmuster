import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { AuthRepository } from "../AuthRepository";
import { ForbiddenError } from "@shared/errors";

const authRepository = new AuthRepository();

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", session: false },
    async (email, password, done) => {
      try {
        const user = await authRepository.findByEmail(email);
        if (!user || !(await user.validatePassword(password))) {
          return done(new ForbiddenError("Invalid credentials"), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
