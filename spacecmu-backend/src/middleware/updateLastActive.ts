import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

export async function updateLastActive(
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) {
  try {
    if (req.user) {
      const now = new Date();
      const lastActive = new Date(req.user.lastActiveAt);
      const diffInSeconds = (now.getTime() - lastActive.getTime()) / 1000;

      if (diffInSeconds > 60) {
        const userRepo = AppDataSource.getRepository(User);
        req.user.lastActiveAt = now;
        await userRepo.save(req.user);
      }
    }
  } catch (error) {
    console.error("Failed to update last active timestamp", error);
  }
  next();
}
