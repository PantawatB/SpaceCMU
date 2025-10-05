import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { In } from "typeorm";

/**
 * 📌 เริ่มแชทใหม่ หรือดึงห้องแชทที่มีอยู่แล้ว
 */
export async function findOrCreateChat(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    const { otherUserId } = req.body;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!otherUserId)
      return res.status(400).json({ message: "otherUserId is required" });

    const userRepo = AppDataSource.getRepository(User);
    const otherUser = await userRepo.findOneBy({ id: otherUserId });
    if (!otherUser)
      return res.status(404).json({ message: "Other user not found" });

    const convoRepo = AppDataSource.getRepository(Conversation);
    // ค้นหาห้องแชทที่มีผู้ใช้สองคนนี้อยู่แล้ว
    let conversation = await convoRepo
      .createQueryBuilder("conversation")
      .innerJoin("conversation.participants", "user1", "user1.id = :userId", {
        userId: user.id,
      })
      .innerJoin(
        "conversation.participants",
        "user2",
        "user2.id = :otherUserId",
        { otherUserId }
      )
      .getOne();

    if (!conversation) {
      // ถ้าไม่มี ให้สร้างห้องแชทใหม่
      conversation = convoRepo.create({
        participants: [user, otherUser],
      });
      await convoRepo.save(conversation);
    }

    return res.json(conversation);
  } catch (err) {
    console.error("findOrCreateChat error:", err);
    return res.status(500).json({ message: "Failed to create or find chat" });
  }
}

/**
 * 📌 ดึงรายการห้องแชททั้งหมดของผู้ใช้
 */
export async function listMyChats(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const convoRepo = AppDataSource.getRepository(Conversation);
    const conversations = await convoRepo.find({
      where: { participants: { id: user.id } },
      relations: ["participants", "messages"], // ดึงผู้ร่วมสนทนาและข้อความล่าสุดมาด้วย
      order: { updatedAt: "DESC" },
    });

    return res.json(conversations);
  } catch (err) {
    console.error("listMyChats error:", err);
    return res.status(500).json({ message: "Failed to list chats" });
  }
}

/**
 * 📌 ดึงประวัติข้อความในห้องแชท (พร้อม Pagination)
 */
export async function getChatMessages(req: Request, res: Response) {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const messageRepo = AppDataSource.getRepository(Message);
    const messages = await messageRepo.find({
      where: { conversation: { id: chatId } },
      relations: ["sender"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    });

    return res.json(messages.reverse()); // เรียงกลับเป็นจากเก่าไปใหม่
  } catch (err) {
    console.error("getChatMessages error:", err);
    return res.status(500).json({ message: "Failed to get messages" });
  }
}
