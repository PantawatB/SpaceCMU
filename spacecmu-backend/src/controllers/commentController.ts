import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Comment } from "../entities/Comment";

/**
 * 📌 สร้างคอมเมนต์ใหม่ใต้โพสต์
 */
export async function createCommentOnPost(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOneBy({ id: postId });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentRepo = AppDataSource.getRepository(Comment);
    const newComment = commentRepo.create({
      content,
      user,
      post,
    });

    await commentRepo.save(newComment);

    return res.status(201).json(newComment);
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
      relations: ["user"],
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // อนุญาตให้แก้ไขได้เฉพาะเจ้าของคอมเมนต์เท่านั้น
    if (comment.user.id !== user.id) {
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
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    return res.json(comments);
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
      relations: ["user"],
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.id !== user.id && !user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await commentRepo.remove(comment);

    return res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ message: "Failed to delete comment" });
  }
}
