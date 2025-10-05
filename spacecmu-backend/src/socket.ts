import { Server, Socket } from "socket.io";
import { AppDataSource } from "./ormconfig";
import { Message } from "./entities/Message";
import { Conversation } from "./entities/Conversation";
import { User } from "./entities/User";

export function initializeSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    // เมื่อ user เข้าร่วมห้องแชทส่วนตัว
    socket.on("join_room", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined room ${conversationId}`);
    });

    // เมื่อมีการส่งข้อความใหม่
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
            // ส่ง event กลับไปบอกว่ามีข้อผิดพลาด
            socket.emit("message_error", "Conversation or sender not found");
            return;
          }

          const newMessage = messageRepo.create({
            conversation,
            sender,
            content,
          });

          await messageRepo.save(newMessage);

          // ส่งข้อความใหม่ไปให้ทุกคนในห้องนั้น (รวมถึงตัวเอง)
          io.to(conversationId).emit("new_message", newMessage);
        } catch (error) {
          console.error("Error saving message:", error);
          socket.emit("message_error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
