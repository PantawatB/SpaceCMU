import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  sanitizeUser,
  sanitizeUserProfile,
  createResponse,
  listResponse,
} from "../utils/serialize";

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
    const { email, studentId, password } = req.body;

    // Support both email and studentId login
    if ((!email && !studentId) || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Find user by email or studentId
    const whereCondition = email ? { email } : { studentId };
    const user = await userRepo.findOne({ where: whereCondition });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "changeme";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    return res.json(
      createResponse("Login successful", {
        token,
        user: sanitizeUserProfile(user), // Login gets full profile
      })
    );
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

    return res.json(
      createResponse("User profile fetched", {
        ...sanitizeUserProfile(user), // Own profile gets full info
        friendCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    );
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

    const { name, password, bio } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    if (name) {
      user.name = name;
    }

    if (password) {
      user.passwordHash = await hashPassword(password);
    }

    if (typeof bio === "string") {
      user.bio = bio;
    }

    await userRepo.save(user);

    return res.json(
      createResponse("User updated successfully", {
        user: sanitizeUserProfile(user), // Updated profile gets full info
      })
    );
  } catch (err) {
    console.error("UpdateUser error:", err);
    return res.status(500).json({ message: "Failed to update user" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Repost (พร้อมค้นหาจากชื่อคนโพส)
 */
export async function getMyReposts(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { authorName } = req.query;

    const userRepo = AppDataSource.getRepository(User);
    const userWithReposts = await userRepo.findOne({
      where: { id: user.id },
      relations: [
        "repostedPosts",
        "repostedPosts.user",
        "repostedPosts.persona",
      ],
    });

    if (!userWithReposts) {
      return res.status(404).json({ message: "User not found" });
    }

    let repostedPosts = userWithReposts.repostedPosts || [];

    if (authorName && typeof authorName === "string") {
      const searchTerm = authorName.toLowerCase();
      repostedPosts = repostedPosts.filter(
        (post) => post.user && post.user.name.toLowerCase().includes(searchTerm)
      );
    }

    // sanitize post.user for safety
    const sanitized = repostedPosts.map((post: any) => {
      if (post.isAnonymous && post.persona) return post;
      return { ...post, user: sanitizeUser(post.user) };
    });
    return res.json(listResponse(sanitized));
  } catch (err) {
    console.error("getMyReposts error:", err);
    return res.status(500).json({ message: "Failed to fetch reposts" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Like (พร้อมค้นหาจากชื่อคนโพส)
 */
export async function getMyLikedPosts(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { authorName } = req.query;

    const userRepo = AppDataSource.getRepository(User);
    const userWithLikes = await userRepo.findOne({
      where: { id: user.id },
      relations: ["likedPosts", "likedPosts.user", "likedPosts.persona"],
    });

    if (!userWithLikes) {
      return res.status(404).json({ message: "User not found" });
    }

    let likedPosts = userWithLikes.likedPosts || [];

    if (authorName && typeof authorName === "string") {
      const searchTerm = authorName.toLowerCase();
      likedPosts = likedPosts.filter(
        (post) => post.user && post.user.name.toLowerCase().includes(searchTerm)
      );
    }

    const sanitized = likedPosts.map((post: any) => {
      if (post.isAnonymous && post.persona) return post;
      return { ...post, user: sanitizeUser(post.user) };
    });
    return res.json(listResponse(sanitized));
  } catch (err) {
    console.error("getMyLikedPosts error:", err);
    return res.status(500).json({ message: "Failed to fetch liked posts" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Save (พร้อมค้นหาจากชื่อคนโพส)
 */
export async function getMySavedPosts(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { authorName } = req.query;

    const userRepo = AppDataSource.getRepository(User);
    const userWithSaves = await userRepo.findOne({
      where: { id: user.id },
      relations: ["savedPosts", "savedPosts.user", "savedPosts.persona"],
    });

    if (!userWithSaves) {
      return res.status(404).json({ message: "User not found" });
    }

    let savedPosts = userWithSaves.savedPosts || [];

    if (authorName && typeof authorName === "string") {
      const searchTerm = authorName.toLowerCase();
      savedPosts = savedPosts.filter(
        (post) => post.user && post.user.name.toLowerCase().includes(searchTerm)
      );
    }

    const sanitized = savedPosts.map((post: any) => {
      if (post.isAnonymous && post.persona) return post;
      return { ...post, user: sanitizeUser(post.user) };
    });
    return res.json(listResponse(sanitized));
  } catch (err) {
    console.error("getMySavedPosts error:", err);
    return res.status(500).json({ message: "Failed to fetch saved posts" });
  }
}
