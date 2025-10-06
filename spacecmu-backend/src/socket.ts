import { Server, Socket } from "socket.io";
import { AppDataSource } from "./ormconfig";
import { Message } from "./entities/Message";
import { Conversation } from "./entities/Conversation";
import { User } from "./entities/User";

const onlineUsers = new Map<string, string>();

export function initializeSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("authenticate", (userId: string) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.broadcast.emit("user_online", { userId });
        console.log(`User ${userId} is online.`);
      }
    });

    socket.on("join_room", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined room ${conversationId}`);
    });

    socket.on(
      "send_message",
      async (data: {
        conversationId: string;
        senderId: string;
        content: string;
      }) => {
        try {
          const { conversationId, senderId, content } = data;

          const messageRepo = AppDataSource.getRepository(Message);
          const convoRepo = AppDataSource.getRepository(Conversation);
          const userRepo = AppDataSource.getRepository(User);
          const conversation = await convoRepo.findOneBy({
            id: conversationId,
          });
          const sender = await userRepo.findOneBy({ id: senderId });

          if (!conversation || !sender) {
            socket.emit("message_error", "Conversation or sender not found");
            return;
          }

          const newMessage = messageRepo.create({
            conversation,
            sender,
            content,
          });
          await messageRepo.save(newMessage);
          io.to(conversationId).emit("new_message", newMessage);
        } catch (error) {
          console.error("Error saving message:", error);
          socket.emit("message_error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        socket.broadcast.emit("user_offline", { userId: disconnectedUserId });
        console.log(`User ${disconnectedUserId} is offline.`);

        try {
          const userRepo = AppDataSource.getRepository(User);
          const user = await userRepo.findOneBy({ id: disconnectedUserId });
          if (user) {
            user.lastActiveAt = new Date();
            await userRepo.save(user);
          }
        } catch (error) {
          console.error("Failed to update last active on disconnect", error);
        }
      }
    });
  });
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
