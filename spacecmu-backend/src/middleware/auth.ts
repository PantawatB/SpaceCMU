import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

interface JwtPayload {
  userId: string;
}

/**
 * Authentication middleware that validates a JWT from the `Authorization`
 * header. If valid, it attaches the authenticated user to `req.user`.
 */
export async function authenticateToken(
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    // ✅ บังคับให้ต้องมี JWT_SECRET จริง ๆ
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables!");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: payload.userId },
      relations: ["persona", "friends"], // ดึง relation มาด้วย
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);

    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Authorization middleware that ensures the authenticated user has admin
 * privileges. Should be used after authenticateToken.
 */
export function requireAdmin(
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) {
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Forbidden: admin privileges required" });
  }
  next();
}
