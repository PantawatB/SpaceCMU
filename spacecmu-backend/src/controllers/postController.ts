import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { In } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Persona } from "../entities/Persona";
import { sanitizeUser, createResponse, listResponse } from "../utils/serialize";

/**
 * 📌 สร้างโพสต์ใหม่
 */
export async function createPost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { content, imageUrl, isAnonymous, visibility, location } = req.body;
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const vis: "public" | "friends" =
      visibility === "friends" ? "friends" : "public";

    let persona: Persona | null = null;
    if (isAnonymous) {
      if (!user.persona) {
        return res.status(400).json({
          message: "You must create a persona before posting anonymously",
        });
      }

      const friendCount = user.friends ? user.friends.length : 0;
      const MIN_FRIENDS_TO_POST_ANON = 10;

      if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
        return res.status(403).json({
          message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
        });
      }

      persona = user.persona;
    }

    const postRepo = AppDataSource.getRepository(Post);
    const post = postRepo.create({
      user,
      persona,
      content,
      imageUrl,
      isAnonymous: !!isAnonymous,
      visibility: vis,
      location,
    });

    await postRepo.save(post);

    // sanitize author before returning
    const postToReturn = { ...post, user: sanitizeUser(post.user) };
    return res
      .status(201)
      .json(createResponse("Post created", { post: postToReturn }));
  } catch (err) {
    console.error("createPost error:", err);
    return res.status(500).json({ message: "Failed to create post" });
  }
}

/**
 * 📌 อัปเดตโพสต์
 */
export async function updatePost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const { content, imageUrl, location } = req.body;
    const user = req.user;

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["user"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!user || post.user.id !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;

    if (typeof location !== "undefined") {
      post.location = location;
    }

    await postRepo.save(post);
    const postToReturn = { ...post, user: sanitizeUser((post as any).user) };
    return res.json(createResponse("Post updated", { post: postToReturn }));
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({ message: "Failed to update post" });
  }
}

/**
 * 📌 ลบโพสต์
 */
export async function deletePost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["user"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!user || post.user.id !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await postRepo.remove(post);
    return res.json(createResponse("Post deleted", null));
  } catch (err) {
    console.error("deletePost error:", err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
}

/**
 * 📌 ดึงโพสต์ทั้งหมด (ใช้สำหรับ list)
 */
export async function listPosts(req: Request, res: Response) {
  try {
    const postRepo = AppDataSource.getRepository(Post);
    const posts = await postRepo.find({
      relations: ["user", "persona"],
      order: { createdAt: "DESC" },
      take: 50,
    });
    // sanitize user for each post unless anonymous
    const sanitized = posts.map((p) => {
      if (p.isAnonymous && p.persona) return p;
      return { ...p, user: sanitizeUser(p.user) };
    });
    return res.json(listResponse(sanitized));
  } catch (err) {
    console.error("listPosts error:", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
}

/**
 * 📌 ดึงโพสต์เดียว (frontend เรียกใช้ getPost)
 */
export async function getPost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const postRepo = AppDataSource.getRepository(Post);

    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["user", "persona"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const postToReturn = {
      ...post,
      user:
        post.isAnonymous && post.persona ? undefined : sanitizeUser(post.user),
    };
    return res.json(createResponse("Post fetched", { post: postToReturn }));
  } catch (err) {
    console.error("getPost error:", err);
    return res.status(500).json({ message: "Failed to fetch post" });
  }
}

/**
 * 📌 Feed สาธารณะ (แบบมี Pagination)
 */
export async function getPublicFeed(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const postRepo = AppDataSource.getRepository(Post);
    const [posts, totalItems] = await postRepo.findAndCount({
      where: { visibility: "public" },
      relations: ["user", "persona"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: skip,
    });

    const items = posts.map((post) => {
      const author =
        post.isAnonymous && post.persona
          ? {
              name: post.persona.displayName,
              avatarUrl: post.persona.avatarUrl,
            }
          : { name: post.user.name };
      const { user, persona, ...restOfPost } = post;
      return { ...restOfPost, author };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.json(
      createResponse("Public feed fetched", {
        items: items,
        meta: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      })
    );
  } catch (err) {
    console.error("getPublicFeed error:", err);
    return res.status(500).json({ message: "Failed to fetch public feed" });
  }
}

/**
 * 📌 Feed เพื่อน (แบบมี Pagination)
 */
export async function getFriendFeed(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const friendIds = user.friends ? user.friends.map((f) => f.id) : [];
    const ids = [...friendIds, user.id];

    const postRepo = AppDataSource.getRepository(Post);
    const [posts, totalItems] = await postRepo.findAndCount({
      where: { user: { id: In(ids) }, visibility: In(["public", "friends"]) },
      relations: ["user", "persona"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: skip,
    });

    const items = posts.map((post) => {
      const author =
        post.isAnonymous && post.persona
          ? {
              name: post.persona.displayName,
              avatarUrl: post.persona.avatarUrl,
            }
          : { name: post.user.name };
      const { user, persona, ...restOfPost } = post;
      return { ...restOfPost, author };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.json(
      createResponse("Friend feed fetched", {
        items: items,
        meta: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      })
    );
  } catch (err) {
    console.error("getFriendFeed error:", err);
    return res.status(500).json({ message: "Failed to fetch friend feed" });
  }
}

/**
 * 📌 ดึงโพสต์ตาม ID
 */
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const postRepo = AppDataSource.getRepository(Post);

    const post = await postRepo.findOne({
      where: { id },
      relations: ["user", "persona"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const postToReturn = {
      ...post,
      user:
        post.isAnonymous && post.persona ? undefined : sanitizeUser(post.user),
    };
    return res.json(createResponse("Post fetched", { post: postToReturn }));
  } catch (err) {
    console.error("getPostById error:", err);
    return res.status(500).json({ message: "Failed to fetch post" });
  }
}

/**
 * 📌 กด like โพสต์
 */
export async function likePost(req: Request & { user?: User }, res: Response) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["likedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likedBy) post.likedBy = [];
    if (post.likedBy.some((u) => u.id === user.id)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likedBy.push(user);
    await postRepo.save(post);

    return res.json({ message: "Post liked" });
  } catch (err) {
    console.error("likePost error:", err);
    return res.status(500).json({ message: "Failed to like post" });
  }
}

/**
 * 📌 ยกเลิก Like โพสต์
 */
export async function undoLikePost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["likedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likedBy = post.likedBy.filter((u) => u.id !== user.id);
    await postRepo.save(post);

    return res.json({ message: "Like undone" });
  } catch (err) {
    console.error("undoLikePost error:", err);
    return res.status(500).json({ message: "Failed to undo like" });
  }
}

/**
 * 📌 Repost โพสต์
 */
export async function repostPost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["repostedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.repostedBy) post.repostedBy = [];
    // เช็คว่าเคย Repost ไปแล้วหรือยัง
    if (post.repostedBy.some((u) => u.id === user.id)) {
      return res
        .status(400)
        .json({ message: "You already reposted this post" });
    }

    post.repostedBy.push(user);
    await postRepo.save(post);

    return res.json({ message: "Post reposted" });
  } catch (err) {
    console.error("repostPost error:", err);
    return res.status(500).json({ message: "Failed to repost post" });
  }
}

/**
 * 📌 ยกเลิก Repost
 */
export async function undoRepost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["repostedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.repostedBy = post.repostedBy.filter((u) => u.id !== user.id);
    await postRepo.save(post);

    return res.json({ message: "Repost undone" });
  } catch (err) {
    console.error("undoRepost error:", err);
    return res.status(500).json({ message: "Failed to undo repost" });
  }
}

/**
 * 📌 Save โพสต์
 */
export async function savePost(req: Request & { user?: User }, res: Response) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["savedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.savedBy) post.savedBy = [];
    if (post.savedBy.some((u) => u.id === user.id)) {
      return res.status(400).json({ message: "You already saved this post" });
    }

    post.savedBy.push(user);
    await postRepo.save(post);

    return res.json({ message: "Post saved" });
  } catch (err) {
    console.error("savePost error:", err);
    return res.status(500).json({ message: "Failed to save post" });
  }
}

/**
 * 📌 ยกเลิก Save โพสต์
 */
export async function unsavePost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOne({
      where: { id: postId },
      relations: ["savedBy"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.savedBy = post.savedBy.filter((u) => u.id !== user.id);
    await postRepo.save(post);

    return res.json({ message: "Post unsaved" });
  } catch (err) {
    console.error("unsavePost error:", err);
    return res.status(500).json({ message: "Failed to unsave post" });
  }
}

/**
 * 📌 ค้นหาโพสต์จากชื่อผู้เขียน (Author)
 */
export async function searchPostsByAuthor(req: Request, res: Response) {
  try {
    const { authorName } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!authorName || typeof authorName !== "string") {
      return res.status(400).json({ message: "authorName query is required" });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const [posts, totalItems] = await postRepo
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.user", "author") // 1. เชื่อมตาราง post กับ user
      .where("author.name ILIKE :name", { name: `%${authorName}%` }) // 2. ค้นหาแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount(); // 3. ดึงข้อมูลพร้อมนับจำนวนทั้งหมด

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      items: posts,
      meta: {
        totalItems,
        itemCount: posts.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("searchPostsByAuthor error:", err);
    return res.status(500).json({ message: "Failed to search posts" });
  }
}
