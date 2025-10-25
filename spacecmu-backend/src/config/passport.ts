import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { Actor } from "../entities/Actor";
import { Persona } from "../entities/Persona";
import { generateRandomPersonaName } from "../utils/personaGenerator";
import { hashPassword } from "../utils/hash";
import dotenv from "dotenv";

dotenv.config();

export function configureGoogleStrategy() {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CALLBACK_URL
  ) {
    console.error(
      "❌ Google OAuth environment variables not set! Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL in .env"
    );
    throw new Error("Missing Google OAuth environment variables.");
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },

      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        const userRepo = AppDataSource.getRepository(User);
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;
        const profileImg = profile.photos?.[0]?.value;

        if (!email || !googleId) {
          console.error(
            "Google profile missing required email or id:",
            profile
          );
          return done(
            new Error(
              "Google profile did not return required information (email/id)"
            ),
            undefined
          );
        }

        try {
          let user = await userRepo.findOne({
            where: { email },

            relations: ["actor", "persona", "persona.actor"],
          });

          if (user) {
            console.log(
              `User found via email for Google login: ${email} (ID: ${user.id})`
            );
            return done(null, user);
          } else {
            console.log(`Creating new user for Google login: ${email}`);

            const userActor = new Actor();
            const personaActor = new Actor();

            const newUser = userRepo.create({
              email: email,
              name: name || email.split("@")[0],
              studentId: `google-${googleId.substring(0, 15)}`,
              passwordHash: await hashPassword(
                Math.random().toString(36).slice(-8) + Date.now()
              ),
              profileImg: profileImg,
              actor: userActor,
            });

            const newPersona = new Persona();
            newPersona.displayName = generateRandomPersonaName();
            newPersona.actor = personaActor;

            newUser.persona = newPersona;
            newPersona.user = newUser;
            userActor.user = newUser;
            personaActor.persona = newPersona;

            const savedUser = await userRepo.save(newUser);
            console.log(
              "✅ New user created successfully with ID:",
              savedUser.id
            );

            const completeNewUser = await userRepo.findOne({
              where: { id: savedUser.id },
              relations: ["actor", "persona", "persona.actor"],
            });

            if (!completeNewUser) {
              console.error(
                `Failed to retrieve newly created user with ID: ${savedUser.id}`
              );
              return done(
                new Error("Failed to retrieve newly created user."),
                undefined
              );
            }
            return done(null, completeNewUser);
          }
        } catch (err) {
          console.error("❌ Error during Google OAuth verification:", err);
          return done(err as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    console.log("Deserializing user:", id);
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id },
        relations: ["persona", "persona.actor", "actor", "actor.friends"],
      });
      if (!user) {
        console.log(`Deserialize failed: User not found with ID ${id}`);
        return done(new Error(`User not found with ID ${id}`), null);
      }
      done(null, user);
    } catch (err) {
      console.error("❌ Error deserializing user:", err);
      done(err as Error, null);
    }
  });

  console.log("✅ Google OAuth Strategy configured.");
}
