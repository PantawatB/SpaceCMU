import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Chat, ChatType } from "../entities/Chat";
import { Message, MessageType } from "../entities/Message";
import { ChatParticipant } from "../entities/ChatParticipant";
import { sanitizeUser, createResponse, listResponse } from "../utils/serialize";
import { User } from "../entities/User";

/**
 * Get all chats for the authenticated user
 */
export async function getMyChats(
  req: Request & { user?: User },
  res: Response
) {
  try {
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
  console.log("=== CREATE DIRECT CHAT DEBUG ===");
  console.log("Request body:", req.body);
  console.log(
    "User from req:",
    req.user ? { id: req.user.id, name: req.user.name } : "undefined"
  );

  try {
    // Validate user authentication
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const currentUser = req.user;
    console.log("✅ Current user:", {
      id: currentUser.id,
      name: currentUser.name,
    });

    // Validate request body
    const { otherUserId } = req.body;
    if (!otherUserId) {
      console.log("❌ No otherUserId provided");
      return res.status(400).json({ message: "Other user ID is required" });
    }

    console.log("🔍 Looking for other user:", otherUserId);

    // Get repositories
    const userRepo = AppDataSource.getRepository(User);
    const chatRepo = AppDataSource.getRepository(Chat);
    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);

    // Check if other user exists
    const otherUser = await userRepo.findOne({ where: { id: otherUserId } });
    if (!otherUser) {
      console.log("❌ Other user not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Other user found:", {
      id: otherUser.id,
      name: otherUser.name,
    });

    // Skip checking for existing chats for now - just create new one
    console.log("🔄 Skipping existing chat check for simplicity");

    console.log("🆕 Creating new chat...");

    // Create new direct chat
    const newChat = chatRepo.create({
      type: ChatType.DIRECT,
      createdBy: currentUser,
    });

    const savedChat = await chatRepo.save(newChat);
    console.log("✅ Chat created with ID:", savedChat.id);

    // Add both users as participants
    const participant1 = chatParticipantRepo.create({
      chat: savedChat,
      user: currentUser,
    });
    const participant2 = chatParticipantRepo.create({
      chat: savedChat,
      user: otherUser,
    });

    await chatParticipantRepo.save([participant1, participant2]);
    console.log("✅ Participants added successfully");

    const response = {
      id: savedChat.id,
      type: savedChat.type,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
      },
    };

    console.log("✅ Returning response:", response);
    return res.status(201).json(response);
  } catch (error) {
    console.error("❌ Error creating direct chat:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Unknown error"
    );
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get messages in a specific chat
 */
export async function getChatMessages(
  req: Request & { user?: User },
  res: Response
) {
  try {
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
      order: { createdAt: "ASC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json({
      messages: messages, // Show oldest first without reverse
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
    const chatRepo = AppDataSource.getRepository(Chat);

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

    // Check if this message is the lastMessage of its chat
    const chat = await chatRepo.findOne({
      where: { id: message.chat.id },
      relations: ["lastMessage"],
    });

    if (chat && chat.lastMessage && chat.lastMessage.id === messageId) {
      // Find the previous message to set as new lastMessage
      const previousMessage = await messageRepo
        .createQueryBuilder("message")
        .where("message.chatId = :chatId", { chatId: chat.id })
        .andWhere("message.id != :messageId", { messageId })
        .orderBy("message.createdAt", "DESC")
        .leftJoinAndSelect("message.sender", "sender")
        .getOne();

      // Update chat's lastMessage before deleting
      chat.lastMessage = previousMessage || null;
      await chatRepo.save(chat);
    }

    await messageRepo.remove(message);
    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Clear all messages in a chat (for testing purposes)
 */
export async function clearChatMessages(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const { chatId } = req.params;

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

    // Delete all messages in the chat
    await messageRepo.delete({ chat: { id: chatId } });

    // Update chat's lastMessage to null
    const chat = await chatRepo.findOne({ where: { id: chatId } });
    if (chat) {
      chat.lastMessage = null;
      await chatRepo.save(chat);
    }

    return res.json({ message: "All messages cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get chat participants (for debugging)
 */
export async function getChatParticipants(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { chatId } = req.params;
    const chatParticipantRepo = AppDataSource.getRepository(ChatParticipant);

    const participants = await chatParticipantRepo.find({
      where: { chat: { id: chatId } },
      relations: ["user", "chat"],
    });

    return res.json(
      createResponse("Chat participants fetched", {
        chatId,
        participants: participants.map((p) => ({
          ...sanitizeUser(p.user),
          joinedAt: p.joinedAt,
        })),
      })
    );
  } catch (error) {
    console.error("Error getting chat participants:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
