import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

/**
 * Authentication middleware that validates a JWT from the `Authorization`
 * header. If valid, it attaches the authenticated user to `req.user`.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }
  try {
    const secret = process.env.JWT_SECRET || "changeme";
    const payload = jwt.verify(token, secret) as { userId: string };
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: payload.userId },
      relations: ["persona", "friends"],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // @ts-ignore attach user property to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Authorization middleware that ensures the authenticated user has admin
 * privileges. Should be used after authenticateToken.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  const user: User = req.user;
  if (!user || !user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Forbidden: admin privileges required" });
  }
  next();
}
