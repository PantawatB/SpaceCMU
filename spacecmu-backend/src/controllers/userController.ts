import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { hashPassword, comparePassword } from "../utils/hash";

/**
 * Registers a new user. This function expects a CMU student ID, CMU email,
 * password and name. It ensures that both student ID and email are unique
 * and creates a new user record with a hashed password.
 */
export async function register(req: Request, res: Response) {
  try {
    const { studentId, email, password, name } = req.body;
    if (!studentId || !email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userRepo = AppDataSource.getRepository(User);

    const existingById = await userRepo.findOne({ where: { studentId } });
    if (existingById) {
      return res.status(409).json({ message: "Student ID already registered" });
    }

    const existingByEmail = await userRepo.findOne({ where: { email } });
    if (existingByEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await hashPassword(password);
    const user = userRepo.create({
      studentId,
      email,
      passwordHash: hashed,
      name,
    });

    await userRepo.save(user);
    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
}

/**
 * Authenticates a user by email and password. Returns a signed JWT on success.
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET || "changeme";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
}

/**
 * Returns the currently authenticated user's profile.
 */
export async function getMe(req: Request & { user?: User }, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendCount = user.friends ? user.friends.length : 0;

    return res.json({
      id: user.id,
      studentId: user.studentId,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      friendCount,
      persona: user.persona || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

/**
 * Updates basic user info (e.g., name, password).
 */
export async function updateUser(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    if (name) {
      user.name = name;
    }

    if (password) {
      user.passwordHash = await hashPassword(password);
    }

    await userRepo.save(user);

    return res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
      },
    });
  } catch (err) {
    console.error("UpdateUser error:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
}
