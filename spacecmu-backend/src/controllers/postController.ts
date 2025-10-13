import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { In } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Actor } from "../entities/Actor";
import { createResponse } from "../utils/serialize";

/**
 * 📌 สร้างโพสต์ใหม่ (เวอร์ชันใหม่ อ้างอิงจาก Actor)
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

    let authorActor: Actor;

    if (isAnonymous) {
      if (!user.persona || !user.persona.actor) {
        return res.status(400).json({
          message: "You must have a persona to post anonymously",
        });
      }
      const friendCount = user.actor?.friends?.length || 0;
      const MIN_FRIENDS_TO_POST_ANON = 10;
      if (friendCount < MIN_FRIENDS_TO_POST_ANON) {
        return res.status(403).json({
          message: `You need at least ${MIN_FRIENDS_TO_POST_ANON} friends to post anonymously`,
        });
      }
      authorActor = user.persona.actor;
    } else {
      if (!user.actor)
        return res
          .status(400)
          .json({ message: "User actor profile not found" });
      authorActor = user.actor;
    }

    const postRepo = AppDataSource.getRepository(Post);
    const post = postRepo.create({
      actor: authorActor,
      content,
      imageUrl,
      visibility: vis,
      location,
    });

    await postRepo.save(post);

    const postToReturn = {
      ...post,
      actor: {
        id: post.actor.id,
        type: post.actor.persona ? "persona" : "user",
        name: post.actor.persona ? post.actor.persona.displayName : user.name,
      },
    };

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
      relations: ["actor"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isOwner =
      (user?.actor && post.actor.id === user.actor.id) ||
      (user?.persona?.actor && post.actor.id === user.persona.actor.id);

    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;

    if (typeof location !== "undefined") {
      post.location = location;
    }

    await postRepo.save(post);
    return res.json(createResponse("Post updated", { post }));
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
      relations: ["actor"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const isOwner =
      (user?.actor && post.actor.id === user.actor.id) ||
      (user?.persona?.actor && post.actor.id === user.persona.actor.id);

    if (!isOwner) {
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
      relations: ["actor", "actor.user", "actor.persona"],
      order: { createdAt: "DESC" },
      take: 50,
    });

    return res.json({ data: posts });
  } catch (err) {
    console.error("listPosts error:", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
}

/**
 * 📌 ดึงโพสต์เดียว
 */
export async function getPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const postRepo = AppDataSource.getRepository(Post);

    const post = await postRepo.findOne({
      where: { id },
      relations: ["actor", "actor.user", "actor.persona"],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(createResponse("Post fetched", { post }));
  } catch (err) {
    console.error("getPost error:", err);
    return res.status(500).json({ message: "Failed to fetch post" });
  }
}

/**
 * 📌 Feed สาธารณะ (แบบ Cursor-based Pagination)
 */
export async function getPublicFeed(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const lastCreatedAt = req.query.lastCreatedAt as string | undefined;
    const lastId = req.query.lastId as string | undefined;

    const postRepo = AppDataSource.getRepository(Post);
    const qb = postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.actor", "actor")
      .leftJoinAndSelect("actor.user", "user")
      .leftJoinAndSelect("actor.persona", "persona")
      .where("post.visibility = :visibility", { visibility: "public" });

    if (lastCreatedAt && lastId) {
      qb.andWhere(
        "(post.createdAt < :lastCreatedAt OR (post.createdAt = :lastCreatedAt AND post.id < :lastId))",
        {
          lastCreatedAt: new Date(lastCreatedAt),
          lastId,
        }
      );
    }

    qb.orderBy("post.createdAt", "DESC")
      .addOrderBy("post.id", "DESC")
      .take(limit + 1);

    const posts = await qb.getMany();

    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
      posts.pop();
    }

    const nextCursor =
      posts.length > 0
        ? {
            lastCreatedAt: posts[posts.length - 1].createdAt.toISOString(),
            lastId: posts[posts.length - 1].id,
          }
        : null;

    const items = posts.map((post) => {
      const author = post.actor.persona
        ? {
            name: post.actor.persona.displayName,
            avatarUrl: post.actor.persona.avatarUrl,
          }
        : {
            name: post.actor.user!.name,
            profileImg: post.actor.user!.profileImg,
          };

      const { actor, ...restOfPost } = post;
      return { ...restOfPost, author, actorId: actor.id };
    });

    return res.json({
      items,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    console.error("getPublicFeed error:", err);
    return res.status(500).json({ message: "Failed to fetch public feed" });
  }
}

/**
 * 📌 Feed เพื่อน (แบบ Cursor-based Pagination)
 */
export async function getFriendFeed(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user || !user.actor)
      return res
        .status(401)
        .json({ message: "Unauthorized or user actor not found" });

    const limit = parseInt(req.query.limit as string) || 20;
    const lastCreatedAt = req.query.lastCreatedAt as string | undefined;
    const lastId = req.query.lastId as string | undefined;

    const myActorIds = [user.actor.id];
    if (user.persona?.actor) {
      myActorIds.push(user.persona.actor.id);
    }
    const friendActorIds = user.actor.friends?.map((f) => f.id) || [];
    const visibleActorIds = [...myActorIds, ...friendActorIds];

    if (visibleActorIds.length === 0) {
      return res.json({ items: [], nextCursor: null, hasNextPage: false });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const qb = postRepo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.actor", "actor")
      .leftJoinAndSelect("actor.user", "user")
      .leftJoinAndSelect("actor.persona", "persona")
      .where("actor.id IN (:...visibleActorIds)", { visibleActorIds })
      .andWhere(
        " (post.visibility = 'public' OR (post.visibility = 'friends' AND actor.id IN (:...myActorIds))) ",
        { myActorIds: [...myActorIds, ...friendActorIds] } // Friends can see friends posts, I can see my own friends posts
      );

    if (lastCreatedAt && lastId) {
      qb.andWhere(
        "(post.createdAt < :lastCreatedAt OR (post.createdAt = :lastCreatedAt AND post.id < :lastId))",
        {
          lastCreatedAt: new Date(lastCreatedAt),
          lastId,
        }
      );
    }

    qb.orderBy("post.createdAt", "DESC")
      .addOrderBy("post.id", "DESC")
      .take(limit + 1);

    const posts = await qb.getMany();

    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
      posts.pop();
    }

    const nextCursor =
      posts.length > 0
        ? {
            lastCreatedAt: posts[posts.length - 1].createdAt.toISOString(),
            lastId: posts[posts.length - 1].id,
          }
        : null;

    const items = posts.map((post) => {
      const author = post.actor.persona
        ? {
            name: post.actor.persona.displayName,
            avatarUrl: post.actor.persona.avatarUrl,
          }
        : {
            name: post.actor.user!.name,
            profileImg: post.actor.user!.profileImg,
          };

      const { actor, ...restOfPost } = post;
      return { ...restOfPost, author, actorId: actor.id };
    });

    return res.json({
      items,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    console.error("getFriendFeed error:", err);
    return res.status(500).json({ message: "Failed to fetch friend feed" });
  }
}

/**
 * 📌 กด like โพสต์
 */
export async function likePost(req: Request & { user?: User }, res: Response) {
  try {
    const { id: postId } = req.params;
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
    const { id: postId } = req.params;
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
    const { id: postId } = req.params;
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
    const { id: postId } = req.params;
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
    const { id: postId } = req.params;
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
    const { id: postId } = req.params;
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
      .leftJoinAndSelect("post.actor", "actor")
      .leftJoin("actor.user", "user_author")
      .leftJoin("actor.persona", "persona_author")
      .where(
        "user_author.name ILIKE :name OR persona_author.displayName ILIKE :name",
        { name: `%${authorName}%` }
      )
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
