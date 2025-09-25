import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { In } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Persona } from "../entities/Persona";

/**
 * Creates a new post. Supports both public and friend‑only visibility as well
 * as anonymous posting via the user's persona. Anonymous posts require the
 * user to have at least 10 friends.
 */
export async function createPost(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  const { content, imageUrl, isAnonymous, visibility } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ message: "Post content is required" });
  }
  const vis: "public" | "friends" =
    visibility === "friends" ? "friends" : "public";
  const postRepo = AppDataSource.getRepository(Post);
  let persona: Persona | null = null;
  if (isAnonymous) {
    // Must have a persona and at least 10 friends
    if (!user.persona) {
      return res
        .status(400)
        .json({
          message: "You must create a persona before posting anonymously",
        });
    }
    const friendCount = user.friends ? user.friends.length : 0;
    const MIN_FRIENDS_TO_POST_ANON = 10;
    if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
      return res
        .status(403)
        .json({
          message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
        });
    }
    persona = user.persona;
  }
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
}

/**
 * Returns the global feed containing public posts. Does not require
 * authentication. Only displays persona details when posts are anonymous.
 */
export async function getPublicFeed(req: Request, res: Response) {
  const postRepo = AppDataSource.getRepository(Post);
  const posts = await postRepo.find({
    where: { visibility: "public" },
    relations: ["user", "persona"],
    order: { createdAt: "DESC" },
    take: 50,
  });
  const result = posts.map((post) => {
    let author: { name: string; avatarUrl?: string };
    if (post.isAnonymous && post.persona) {
      author = {
        name: post.persona.displayName,
        avatarUrl: post.persona.avatarUrl,
      };
    } else {
      author = { name: post.user.name };
    }
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      isAnonymous: post.isAnonymous,
      createdAt: post.createdAt,
      author,
    };
  });
  return res.json(result);
}

/**
 * Returns the friend feed for the authenticated user. Includes posts authored
 * by the user and by their friends. Both public and friend‑only posts are
 * included.
 */
export async function getFriendFeed(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
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
    let author: { name: string; avatarUrl?: string };
    if (post.isAnonymous && post.persona) {
      author = {
        name: post.persona.displayName,
        avatarUrl: post.persona.avatarUrl,
      };
    } else {
      author = { name: post.user.name };
    }
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      isAnonymous: post.isAnonymous,
      createdAt: post.createdAt,
      author,
    };
  });
  return res.json(result);
}

/**
 * Retrieves a single post by ID. Returns persona or user name accordingly.
 */
export async function getPostById(req: Request, res: Response) {
  const { id } = req.params;
  const postRepo = AppDataSource.getRepository(Post);
  const post = await postRepo.findOne({
    where: { id },
    relations: ["user", "persona"],
  });
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  let author: { name: string; avatarUrl?: string };
  if (post.isAnonymous && post.persona) {
    author = {
      name: post.persona.displayName,
      avatarUrl: post.persona.avatarUrl,
    };
  } else {
    author = { name: post.user.name };
  }
  return res.json({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    author,
  });
}
