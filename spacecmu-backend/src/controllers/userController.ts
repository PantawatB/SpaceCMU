import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { Persona } from "../entities/Persona";
import { Actor } from "../entities/Actor";
import { Post } from "../entities/Post";
import { hashPassword, comparePassword } from "../utils/hash";
import { sanitizeUserProfile, createResponse } from "../utils/serialize";
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
        user: sanitizeUserProfile(user),
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

    // คำนวณ friendCount ของ User หลัก (เหมือนเดิม)
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
      friendCount, // friendCount ของ User หลัก
      actorId: user.actor ? user.actor.id : null,
      persona: user.persona
        ? {
            id: user.persona.id,
            displayName: user.persona.displayName,
            avatarUrl: user.persona.avatarUrl,
            bannerImg: user.persona.bannerImg,
            bio: user.persona.bio,
            changeCount: user.persona.changeCount,
            friendCount:
              user.persona.actor && user.persona.actor.friends
                ? user.persona.actor.friends.length
                : 0,
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

    if (name) user.name = name;
    if (password) user.passwordHash = await hashPassword(password);
    if (typeof profileImg !== "undefined") user.profileImg = profileImg;
    if (typeof bannerImg !== "undefined") user.bannerImg = bannerImg;
    if (typeof bio === "string") user.bio = bio;

    await userRepo.save(user);

    return res.json(
      createResponse("User updated successfully", {
        user: sanitizeUserProfile(user),
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

    const myActorIds = [currentUser.actor.id];
    if (currentUser.persona?.actor) {
      myActorIds.push(currentUser.persona.actor.id);
    }

    const actorRepo = AppDataSource.getRepository(Actor);
    const qb = actorRepo
      .createQueryBuilder("actor")
      .leftJoinAndSelect("actor.user", "user")
      .leftJoinAndSelect("actor.persona", "persona")
      .leftJoinAndSelect("persona.user", "personaUser") // ✅ Add persona.user relation
      .where("(user.name ILIKE :name OR persona.displayName ILIKE :name)", {
        name: `%${name}%`,
      })
      .andWhere("actor.id NOT IN (:...myActorIds)", { myActorIds })
      .orderBy("user.name", "ASC")
      .addOrderBy("persona.displayName", "ASC")
      .skip(skip)
      .take(limit);

    const [actors, totalItems] = await qb.getManyAndCount();

    const results = actors
      .map((actor) => {
        if (actor.user) {
          // ✅ Direct user - return real User.id
          return {
            id: actor.user.id, // ✅ Real User.id (CRITICAL for chat creation)
            actorId: actor.id, // Actor ID for friend operations
            name: actor.user.name,
            type: "user",
            profileImg: actor.user.profileImg,
            bio: actor.user.bio,
          };
        }
        if (actor.persona && actor.persona.user) {
          // ✅ Persona with user relation - return real User.id
          return {
            id: actor.persona.user.id, // ✅ Real User.id from persona.user (CRITICAL for chat creation)
            actorId: actor.id, // Actor ID for friend operations
            name: actor.persona.displayName,
            type: "persona",
            profileImg: actor.persona.avatarUrl,
            bio: actor.persona.bio,
          };
        }
        // Skip actors without proper user references
        console.warn("⚠️ Skipping actor without user reference:", actor.id);
        return null;
      })
      .filter(Boolean);

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
    console.error("searchActors error:", err);
    return res.status(500).json({ message: "Failed to search for actors" });
  }
}

/**
 * 📌 Debug endpoint to resolve User.id ↔ Actor.id mapping
 * Usage: GET /api/users/resolve?id=USER_ID or GET /api/users/resolve?actorId=ACTOR_ID
 */
export async function resolveUserActorMapping(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { id: userId, actorId } = req.query;

    if (!userId && !actorId) {
      return res.status(400).json({
        message:
          "Provide either 'id' (User.id) or 'actorId' (Actor.id) parameter",
      });
    }

    if (userId && actorId) {
      return res.status(400).json({
        message: "Provide only one parameter: either 'id' or 'actorId'",
      });
    }

    const userRepo = AppDataSource.getRepository(User);
    const actorRepo = AppDataSource.getRepository(Actor);

    let result: any = null;

    if (userId) {
      // Resolve User.id → Actor.id(s)
      const user = await userRepo.findOne({
        where: { id: userId as string },
        relations: ["actor", "persona", "persona.actor"],
      });

      if (!user) {
        return res.status(404).json({
          message: `User not found with id: ${userId}`,
          provided: { userId },
        });
      }

      result = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        actors: [
          user.actor
            ? {
                id: user.actor.id,
                type: "user_actor",
                linkedToUser: user.id,
              }
            : null,
          user.persona?.actor
            ? {
                id: user.persona.actor.id,
                type: "persona_actor",
                linkedToPersona: user.persona.id,
                personaName: user.persona.displayName,
              }
            : null,
        ].filter(Boolean),
        mapping: `User.id ${user.id} maps to ${
          user.actor ? 1 : 0
        } user actor(s) and ${user.persona?.actor ? 1 : 0} persona actor(s)`,
      };
    } else if (actorId) {
      // Resolve Actor.id → User.id
      const actor = await actorRepo.findOne({
        where: { id: actorId as string },
        relations: ["user", "persona", "persona.user"],
      });

      if (!actor) {
        return res.status(404).json({
          message: `Actor not found with id: ${actorId}`,
          provided: { actorId },
        });
      }

      let resolvedUser = null;
      let actorType = "unknown";

      if (actor.user) {
        resolvedUser = actor.user;
        actorType = "user_actor";
      } else if (actor.persona?.user) {
        resolvedUser = actor.persona.user;
        actorType = "persona_actor";
      }

      if (!resolvedUser) {
        return res.status(404).json({
          message: `No user found for actor: ${actorId}`,
          actor: {
            id: actor.id,
            hasUser: !!actor.user,
            hasPersona: !!actor.persona,
          },
        });
      }

      result = {
        actor: {
          id: actor.id,
          type: actorType,
          hasUser: !!actor.user,
          hasPersona: !!actor.persona,
        },
        resolvedUser: {
          id: resolvedUser.id,
          name: resolvedUser.name,
          email: resolvedUser.email,
        },
        mapping: `Actor.id ${actor.id} (${actorType}) maps to User.id ${resolvedUser.id}`,
      };
    }

    return res.json({
      success: true,
      result,
      debug: {
        queryParams: { userId, actorId },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("resolveUserActorMapping error:", error);
    return res.status(500).json({
      message: "Failed to resolve user/actor mapping",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Repost
 */
export async function getRepostsByActor(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    const { actorId } = req.params;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!actorId)
      return res.status(400).json({ message: "Actor ID is required" });

    const isOwnerOfActor =
      user.actor?.id === actorId || user.persona?.actor?.id === actorId;
    if (!isOwnerOfActor) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this actor's reposts" });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const repostedPosts = await postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.actor", "author_actor")
      .leftJoinAndSelect("author_actor.user", "author_user")
      .leftJoinAndSelect("author_actor.persona", "author_persona")
      .loadRelationCountAndMap("post.likeCount", "post.likedBy")
      .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
      .loadRelationCountAndMap("post.saveCount", "post.savedBy")
      .loadRelationCountAndMap("post.commentCount", "post.comments")
      .innerJoin("post.repostedBy", "reposting_actor")
      .where("reposting_actor.id = :actorId", { actorId })
      .orderBy("post.createdAt", "DESC")
      .getMany();

    // Serialize posts with author info
    const serializedPosts = repostedPosts.map((post) => {
      const author = post.actor;
      let displayName = "Unknown";
      let avatar = null;

      if (author) {
        if (author.user) {
          displayName = author.user.name || "Unknown User";
          avatar = author.user.profileImg;
        } else if (author.persona) {
          displayName = author.persona.displayName || "Unknown Persona";
          avatar = author.persona.avatarUrl;
        }
      }

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        visibility: post.visibility,
        createdAt: post.createdAt,
        likes: (post as any).likeCount || 0,
        comments: (post as any).commentCount || 0,
        shares: (post as any).repostCount || 0,
        author: {
          id: author?.id,
          displayName,
          avatar,
        },
      };
    });

    return res.json({ data: serializedPosts });
  } catch (err) {
    console.error("getRepostsByActor error:", err);
    return res.status(500).json({ message: "Failed to fetch reposts" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Like
 */
export async function getLikedPostsByActor( // เปลี่ยนชื่อฟังก์ชันให้ชัดเจนขึ้น
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    const { actorId } = req.params; // รับ actorId จาก URL params

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!actorId)
      return res.status(400).json({ message: "Actor ID is required" });

    const isOwnerOfActor =
      user.actor?.id === actorId || user.persona?.actor?.id === actorId;
    if (!isOwnerOfActor) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this actor's liked posts" });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const likedPosts = await postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.actor", "author_actor")
      .leftJoinAndSelect("author_actor.user", "author_user")
      .leftJoinAndSelect("author_actor.persona", "author_persona")
      .loadRelationCountAndMap("post.likeCount", "post.likedBy")
      .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
      .loadRelationCountAndMap("post.saveCount", "post.savedBy")
      .loadRelationCountAndMap("post.commentCount", "post.comments")
      .innerJoin("post.likedBy", "liking_actor")
      .where("liking_actor.id = :actorId", { actorId })
      .orderBy("post.createdAt", "DESC")
      .getMany();

    // Serialize posts with author info
    const serializedPosts = likedPosts.map((post) => {
      const author = post.actor;
      let displayName = "Unknown";
      let avatar = null;

      if (author) {
        if (author.user) {
          displayName = author.user.name || "Unknown User";
          avatar = author.user.profileImg;
        } else if (author.persona) {
          displayName = author.persona.displayName || "Unknown Persona";
          avatar = author.persona.avatarUrl;
        }
      }

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        visibility: post.visibility,
        createdAt: post.createdAt,
        likes: (post as any).likeCount || 0,
        comments: (post as any).commentCount || 0,
        shares: (post as any).repostCount || 0,
        author: {
          id: author?.id,
          displayName,
          avatar,
        },
      };
    });

    return res.json({ data: serializedPosts });
  } catch (err) {
    console.error("getLikedPostsByActor error:", err);
    return res.status(500).json({ message: "Failed to fetch liked posts" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Save
 */
export async function getCurrentUserActor(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const userWithActor = await userRepo.findOne({
      where: { id: user.id },
      relations: ["actor", "persona", "persona.actor"],
    });

    if (!userWithActor) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(
      createResponse("Actor information retrieved", {
        userId: userWithActor.id,
        userName: userWithActor.name,
        userActor: userWithActor.actor
          ? {
              id: userWithActor.actor.id,
            }
          : null,
        personaActor: userWithActor.persona?.actor
          ? {
              id: userWithActor.persona.actor.id,
              personaId: userWithActor.persona.id,
              displayName: userWithActor.persona.displayName,
            }
          : null,
      })
    );
  } catch (err) {
    console.error("getCurrentUserActor error:", err);
    return res.status(500).json({ message: "Failed to get actor information" });
  }
}

/**
 * 📌 ดึงรายการโพสต์ที่ user คนปัจจุบันเคย Save (พร้อมค้นหาจากชื่อคนโพส)
 */
export async function getSavedPostsByActor(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    const { actorId } = req.params; // 1. รับ actorId จาก URL params

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!actorId)
      return res.status(400).json({ message: "Actor ID is required" });

    // 2. ตรวจสอบว่า user ที่ login เป็นเจ้าของ actorId นี้
    const isOwnerOfActor =
      user.actor?.id === actorId || user.persona?.actor?.id === actorId;
    if (!isOwnerOfActor) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this actor's saved posts" });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const savedPosts = await postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.actor", "author_actor")
      .leftJoinAndSelect("author_actor.user", "author_user")
      .leftJoinAndSelect("author_actor.persona", "author_persona")
      .loadRelationCountAndMap("post.likeCount", "post.likedBy")
      .loadRelationCountAndMap("post.repostCount", "post.repostedBy")
      .loadRelationCountAndMap("post.saveCount", "post.savedBy")
      .loadRelationCountAndMap("post.commentCount", "post.comments")
      .innerJoin("post.savedBy", "saving_actor")
      .where("saving_actor.id = :actorId", { actorId }) // 3. ค้นหาด้วย actorId เดียว
      .orderBy("post.createdAt", "DESC")
      .getMany();

    // Serialize posts with author info
    const serializedPosts = savedPosts.map((post) => {
      const author = post.actor;
      let displayName = "Unknown";
      let avatar = null;

      if (author) {
        if (author.user) {
          displayName = author.user.name || "Unknown User";
          avatar = author.user.profileImg;
        } else if (author.persona) {
          displayName = author.persona.displayName || "Unknown Persona";
          avatar = author.persona.avatarUrl;
        }
      }

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        visibility: post.visibility,
        createdAt: post.createdAt,
        likes: (post as any).likeCount || 0,
        comments: (post as any).commentCount || 0,
        shares: (post as any).repostCount || 0,
        author: {
          id: author?.id,
          displayName,
          avatar,
        },
      };
    });

    return res.json({ data: serializedPosts });
  } catch (err) {
    console.error("getSavedPostsByActor error:", err);
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

    const myActorIds = [currentUser.actor.id];
    if (currentUser.persona?.actor) {
      myActorIds.push(currentUser.persona.actor.id);
    }

    const actorRepo = AppDataSource.getRepository(Actor);
    const allActors = await actorRepo
      .createQueryBuilder("actor")
      .leftJoinAndSelect("actor.user", "user")
      .leftJoinAndSelect("actor.persona", "persona")
      .where("actor.id NOT IN (:...myActorIds)", { myActorIds })
      .getMany();

    const results = allActors
      .map((actor) => {
        if (actor.user) {
          return {
            actorId: actor.id,
            name: actor.user.name,
            type: "user",
            profileImg: actor.user.profileImg,
            bio: actor.user.bio,
          };
        }
        if (actor.persona) {
          return {
            actorId: actor.id,
            name: actor.persona.displayName,
            type: "persona",
            profileImg: actor.persona.avatarUrl,
            bio: actor.persona.bio,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json(results);
  } catch (err) {
    console.error("listAllActors error:", err);
    return res.status(500).json({ message: "Failed to fetch actors" });
  }
}
