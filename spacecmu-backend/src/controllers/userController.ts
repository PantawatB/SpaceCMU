import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { Persona } from "../entities/Persona";
import { Actor } from "../entities/Actor";
import { hashPassword, comparePassword } from "../utils/hash";
import {
  sanitizeUser,
  sanitizeUserProfile,
  createResponse,
  listResponse,
} from "../utils/serialize";
import { generateRandomPersonaName } from "../utils/personaGenerator";

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

    const userActor = new Actor();
    const personaActor = new Actor();
    const user = userRepo.create({
      studentId,
      email,
      passwordHash: await hashPassword(password),
      name,
      actor: userActor,
    });
    const newPersona = new Persona();
    newPersona.displayName = generateRandomPersonaName();
    newPersona.actor = personaActor;

    user.persona = newPersona;
    newPersona.user = user;
    userActor.user = user;
    personaActor.persona = newPersona;
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

    const user = await userRepo.findOne({
      where: whereCondition,
      relations: ["persona"],
    });
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

    const friendCount =
      user.actor && user.actor.friends ? user.actor.friends.length : 0;

    return res.json({
      id: user.id,
      studentId: user.studentId,
      email: user.email,
      name: user.name,
      bio: user.bio,
      isAdmin: user.isAdmin,
      profileImg: user.profileImg,
      bannerImg: user.bannerImg,
      friendCount,
      actorId: user.actor ? user.actor.id : null,
      persona: user.persona
        ? {
            id: user.persona.id,
            displayName: user.persona.displayName,
            avatarUrl: user.persona.avatarUrl,
            bannerImg: user.persona.bannerImg,
            bio: user.persona.bio,
            changeCount: user.persona.changeCount,
            lastChangedAt: user.persona.lastChangedAt,
            isBanned: user.persona.isBanned,
            actorId: user.persona.actor ? user.persona.actor.id : null,
          }
        : null,
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

    const { name, password, bio, profileImg, bannerImg } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    if (name) {
      user.name = name;
    }

    if (password) {
      user.passwordHash = await hashPassword(password);
    }

    if (typeof profileImg !== "undefined") {
      user.profileImg = profileImg;
    }

    if (typeof bannerImg !== "undefined") {
      user.bannerImg = bannerImg;
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
 * 📌 ค้นหาผู้ใช้ทั้งหมดในระบบจากชื่อ (มี Pagination)
 */
export async function searchUsers(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const currentUser = req.user!;
    const { name } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Search 'name' query is required" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const [users, totalItems] = await userRepo
      .createQueryBuilder("user")
      .where("user.name ILIKE :name", { name: `%${name}%` })
      .leftJoinAndSelect("user.actor", "actor")
      .orderBy("user.name", "ASC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const results = users
      .filter((user) => user.id !== currentUser.id)
      .map((user) => ({
        id: user.id,
        name: user.name,
        profileImg: user.profileImg,
        bio: user.bio,
        actorId: user.actor ? user.actor.id : null,
      }));

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      items: results,
      meta: {
        totalItems,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("searchUsers error:", err);
    return res.status(500).json({ message: "Failed to search for users" });
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

/**
 * 📌 ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ
 */
export async function listAllUsers(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const currentUser = req.user!;

    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.actor", "actor")
      .orderBy("user.name", "ASC")
      // ❌ ไม่ต้องมี .skip() และ .take() แล้ว
      .getMany();

    // กรอง user ที่ login อยู่ปัจจุบันออกจากผลลัพธ์
    const results = users
      .filter((user) => user.id !== currentUser.id)
      .map((user) => ({
        id: user.id,
        name: user.name,
        profileImg: user.profileImg,
        bio: user.bio,
        actorId: user.actor ? user.actor.id : null,
      }));

    // ส่งข้อมูลกลับไปเป็น array ตรงๆ
    return res.json(results);
  } catch (err) {
    console.error("listAllUsers error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}
