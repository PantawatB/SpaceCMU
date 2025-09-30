import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { In } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Persona } from "../entities/Persona";

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

    const { content, imageUrl, isAnonymous, visibility } = req.body;
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
    });

    await postRepo.save(post);

    return res.status(201).json({ message: "Post created", post });
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
    const { content, imageUrl } = req.body;
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

    await postRepo.save(post);
    return res.json({ message: "Post updated", post });
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
    return res.json({ message: "Post deleted" });
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
    return res.json(posts);
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

    return res.json(post);
  } catch (err) {
    console.error("getPost error:", err);
    return res.status(500).json({ message: "Failed to fetch post" });
  }
}

/**
 * 📌 Feed สาธารณะ
 */
export async function getPublicFeed(req: Request, res: Response) {
  try {
    const postRepo = AppDataSource.getRepository(Post);
    const posts = await postRepo.find({
      where: { visibility: "public" },
      relations: ["user", "persona"],
      order: { createdAt: "DESC" },
      take: 50,
    });

    const result = posts.map((post) => {
      const author =
        post.isAnonymous && post.persona
          ? {
              name: post.persona.displayName,
              avatarUrl: post.persona.avatarUrl,
            }
          : { name: post.user.name };

      return { ...post, author };
    });

    return res.json(result);
  } catch (err) {
    console.error("getPublicFeed error:", err);
    return res.status(500).json({ message: "Failed to fetch public feed" });
  }
}

/**
 * 📌 Feed เพื่อน
 */
export async function getFriendFeed(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const friendIds = user.friends ? user.friends.map((f) => f.id) : [];
    const ids = [...friendIds, user.id];

    const postRepo = AppDataSource.getRepository(Post);
    const posts = await postRepo.find({
      where: { user: { id: In(ids) }, visibility: In(["public", "friends"]) },
      relations: ["user", "persona"],
      order: { createdAt: "DESC" },
      take: 50,
    });

    const result = posts.map((post) => {
      const author =
        post.isAnonymous && post.persona
          ? {
              name: post.persona.displayName,
              avatarUrl: post.persona.avatarUrl,
            }
          : { name: post.user.name };

      return { ...post, author };
    });

    return res.json(result);
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

    return res.json(post);
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
 * 📌 ถอน like โพสต์
 */
export async function unlikePost(
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

    return res.json({ message: "Post unliked" });
  } catch (err) {
    console.error("unlikePost error:", err);
    return res.status(500).json({ message: "Failed to unlike post" });
  }
}
