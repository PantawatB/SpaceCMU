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
}

/**
 * Authenticates a user by email and password. Returns a signed JWT on success.
 */
export async function login(req: Request, res: Response) {
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
  return res.json({ token });
}

/**
 * Returns the currently authenticated user's profile along with their persona
 * and friend count. Does not reveal private persona details for others.
 */
export async function getMe(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  // Only include non‑sensitive fields in response
  const {
    id,
    studentId,
    email,
    name,
    persona,
    isAdmin,
    friends,
    createdAt,
    updatedAt,
  } = user;
  const friendCount = friends ? friends.length : 0;
  return res.json({
    id,
    studentId,
    email,
    name,
    isAdmin,
    friendCount,
    persona,
    createdAt,
    updatedAt,
  });
}
