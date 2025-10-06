import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
<<<<<<< HEAD
import { Chat, ChatType } from "../entities/Chat";
import { Message, MessageType } from "../entities/Message";
import { ChatParticipant } from "../entities/ChatParticipant";
import { User } from "../entities/User";

/**
 * Get all chats for the authenticated user
 */
export async function getMyChats(
=======
import { User } from "../entities/User";
import { Conversation } from "../entities/Conversation";
import { Message } from "../entities/Message";
import { In } from "typeorm";

/**
 * 📌 เริ่มแชทใหม่ หรือดึงห้องแชทที่มีอยู่แล้ว
 */
export async function findOrCreateChat(
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
  req: Request & { user?: User },
  res: Response
) {
  try {
<<<<<<< HEAD
    const user = req.user!;

    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);

    // Get all chats where user is a participant
    const participations = await chatParticipantRepo.find({
      where: { user: { id: user.id } },
      relations: [
        "chat",
        "chat.lastMessage",
        "chat.lastMessage.sender",
        "chat.createdBy",
      ],
      order: { chat: { updatedAt: "DESC" } },
    });

    const chats = participations.map((p) => ({
      id: p.chat.id,
      type: p.chat.type,
      name: p.chat.name,
      lastMessage: p.chat.lastMessage
        ? {
            id: p.chat.lastMessage.id,
            content: p.chat.lastMessage.content,
            sender: {
              id: p.chat.lastMessage.sender.id,
              name: p.chat.lastMessage.sender.name,
            },
            createdAt: p.chat.lastMessage.createdAt,
          }
        : null,
      updatedAt: p.chat.updatedAt,
      joinedAt: p.joinedAt,
    }));

    return res.json(chats);
  } catch (error) {
    console.error("Error getting chats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Create a new direct message chat
 */
export async function createDirectChat(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const chatRepo = AppDataSource.getRepository(Chat);
    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);

    // Check if other user exists
    const otherUser = await userRepo.findOne({ where: { id: otherUserId } });
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if direct chat already exists between these users
    const existingParticipations = await chatParticipantRepo
      .createQueryBuilder("cp1")
      .innerJoin(
        ChatParticipant,
        "cp2",
        "cp1.chatId = cp2.chatId AND cp2.userId = :otherUserId",
        { otherUserId }
      )
      .innerJoin("cp1.chat", "chat")
      .where("cp1.userId = :userId AND chat.type = :type", {
        userId: user.id,
        type: ChatType.DIRECT,
      })
      .getOne();

    if (existingParticipations) {
      const chat = await chatRepo.findOne({
        where: { id: existingParticipations.chat.id },
        relations: ["lastMessage", "lastMessage.sender"],
      });

      return res.json({
        id: chat?.id,
        type: chat?.type,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
        },
      });
    }

    // Create new direct chat
    const newChat = chatRepo.create({
      type: ChatType.DIRECT,
    });
    await chatRepo.save(newChat);

    // Add both users as participants
    const participants = [
      chatParticipantRepo.create({ chat: newChat, user }),
      chatParticipantRepo.create({ chat: newChat, user: otherUser }),
    ];
    await chatParticipantRepo.save(participants);

    return res.status(201).json({
      id: newChat.id,
      type: newChat.type,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
      },
    });
  } catch (error) {
    console.error("Error creating direct chat:", error);
    return res.status(500).json({ message: "Internal server error" });
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
  }
}

/**
<<<<<<< HEAD
 * Get messages in a specific chat
 */
export async function getChatMessages(
=======
 * 📌 ดึงรายการห้องแชททั้งหมดของผู้ใช้
 */
export async function listMyChats(
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
  req: Request & { user?: User },
  res: Response
) {
  try {
<<<<<<< HEAD
    const user = req.user!;
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);
    const messageRepo = AppDataSource.getRepository(Message);

    // Verify user is a participant in this chat
    const participation = await chatParticipantRepo.findOne({
      where: {
        chat: { id: chatId },
        user: { id: user.id },
      },
    });

    if (!participation) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    // Get messages with pagination
    const [messages, total] = await messageRepo.findAndCount({
      where: { chat: { id: chatId } },
      relations: ["sender", "replyTo", "replyTo.sender"],
      order: { createdAt: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Send a message to a chat
 */
export async function sendMessage(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const { chatId } = req.params;
    const { content, type = MessageType.TEXT, replyToId } = req.body;

    if (!content && type === MessageType.TEXT) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const chatRepo = AppDataSource.getRepository(Chat);
    const messageRepo = AppDataSource.getRepository(Message);
    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);

    // Verify user is a participant in this chat
    const participation = await chatParticipantRepo.findOne({
      where: {
        chat: { id: chatId },
        user: { id: user.id },
      },
    });

    if (!participation) {
      return res
        .status(403)
        .json({ message: "You are not a participant in this chat" });
    }

    const chat = await chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if replying to an existing message
    let replyToMessage = null;
    if (replyToId) {
      replyToMessage = await messageRepo.findOne({
        where: { id: replyToId, chat: { id: chatId } },
      });
      if (!replyToMessage) {
        return res.status(404).json({ message: "Reply message not found" });
      }
    }

    // Create new message
    const newMessage = messageRepo.create({
      chat,
      sender: user,
      content,
      type,
      replyTo: replyToMessage || undefined,
    });
    await messageRepo.save(newMessage);

    // Update chat's last message
    chat.lastMessage = newMessage;
    await chatRepo.save(chat);

    // Return the created message with relations
    const savedMessage = await messageRepo.findOne({
      where: { id: newMessage.id },
      relations: ["sender", "replyTo", "replyTo.sender"],
    });

    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Delete a message (only by sender)
 */
export async function deleteMessage(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const { messageId } = req.params;

    const messageRepo = AppDataSource.getRepository(Message);

    const message = await messageRepo.findOne({
      where: { id: messageId },
      relations: ["sender", "chat"],
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.sender.id !== user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    await messageRepo.remove(message);
    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Internal server error" });
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
  }
}
