import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../entities/User";

dotenv.config();
const router = Router();

router.get("/google", (req, res, next) => {
  console.log("Initiating Google Login...");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Received callback from Google...");
    passport.authenticate("google", {
      failureRedirect: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login?error=google-auth-failed`
        : "/login?error=google-auth-failed",
      session: false,
    })(req, res, next);
  },

  (req, res) => {
    console.log("Google authentication successful, generating JWT...");
    const user = req.user as User;

    if (!user || !user.id) {
      console.error(
        "❌ User object not found or missing ID after Google auth."
      );
      return res.redirect(
        process.env.FRONTEND_URL
          ? `${process.env.FRONTEND_URL}/login?error=user-data-missing`
          : "/login?error=user-data-missing"
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET is not set!");
      return res.redirect(
        process.env.FRONTEND_URL
          ? `${process.env.FRONTEND_URL}/login?error=server-config-error`
          : "/login?error=server-config-error"
      );
    }

    const tokenPayload = { userId: user.id };
    const token = jwt.sign(tokenPayload, secret, { expiresIn: "7d" });
    console.log(`✅ JWT generated for user ${user.id}`);

    const frontendCallbackUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/auth/callback`
      : "/auth/callback";
    res.redirect(`${frontendCallbackUrl}?token=${token}`);
  }
);

export default router;
