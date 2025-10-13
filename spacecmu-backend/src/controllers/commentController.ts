import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Comment } from "../entities/Comment";
import { Actor } from "../entities/Actor";
import { sanitizeUser, createResponse, listResponse } from "../utils/serialize";

/**
 * 📌 สร้างคอมเมนต์ใหม่ใต้โพสต์
 */
export async function createCommentOnPost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const { content, actorId } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!content)
      return res.status(400).json({ message: "Content is required" });
    if (!actorId)
      return res.status(400).json({ message: "actorId is required" });

    const isOwnerOfActor =
      user.actor?.id === actorId || user.persona?.actor?.id === actorId;
    if (!isOwnerOfActor) {
      return res
        .status(403)
        .json({ message: "Not authorized to comment with this actor" });
    }

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOneBy({ id: postId });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const actorRepo = AppDataSource.getRepository(Actor);
    const actor = await actorRepo.findOneBy({ id: actorId });
    if (!actor) return res.status(404).json({ message: "Actor not found" });

    const commentRepo = AppDataSource.getRepository(Comment);
    const newComment = commentRepo.create({
      content,
      actor,
      post,
    });

    await commentRepo.save(newComment);

    return res
      .status(201)
      .json(createResponse("Comment created", { comment: newComment }));
  } catch (err) {
    console.error("createCommentOnPost error:", err);
    return res.status(500).json({ message: "Failed to create comment" });
  }
}

/**
 * 📌 แก้ไขคอมเมนต์
 */
export async function updateComment(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({
      where: { id: commentId },
      relations: ["actor"],
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwnerOfActor =
      user.actor?.id === comment.actor.id ||
      user.persona?.actor?.id === comment.actor.id;
    if (!isOwnerOfActor) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
    }

    comment.content = content;
    await commentRepo.save(comment);

    return res.json(comment);
  } catch (err) {
    console.error("updateComment error:", err);
    return res.status(500).json({ message: "Failed to update comment" });
  }
}

/**
 * 📌 ดึงคอมเมนต์ทั้งหมดของโพสต์
 */
export async function listCommentsForPost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const commentRepo = AppDataSource.getRepository(Comment);

    const comments = await commentRepo.find({
      where: { post: { id: postId } },
      relations: ["actor", "actor.user", "actor.persona"],
      order: { createdAt: "ASC" },
    });

    const sanitized = comments.map((comment) => {
      const { actor, ...restOfComment } = comment;
      const author = actor.user
        ? {
            type: "user",
            actorId: actor.id,
            name: actor.user.name,
            profileImg: actor.user.profileImg,
          }
        : {
            type: "persona",
            actorId: actor.id,
            name: actor.persona!.displayName,
            avatarUrl: actor.persona!.avatarUrl,
          };
      return { ...restOfComment, author };
    });

    return res.json(listResponse(sanitized));
  } catch (err) {
    console.error("listCommentsForPost error:", err);
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
}

/**
 * 📌 ลบคอมเมนต์
 */
export async function deleteComment(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { commentId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const commentRepo = AppDataSource.getRepository(Comment);
    const comment = await commentRepo.findOne({
      where: { id: commentId },
      relations: ["actor"],
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwnerOfActor =
      user.actor?.id === comment.actor.id ||
      user.persona?.actor?.id === comment.actor.id;
    if (!isOwnerOfActor && !user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await commentRepo.remove(comment);

    return res.status(200).json(createResponse("Comment deleted", null));
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ message: "Failed to delete comment" });
  }
}
