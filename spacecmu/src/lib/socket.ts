import { io, Socket } from "socket.io-client";

// Types for better type safety
interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  chatId: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:3000", {
      withCredentials: true,
      autoConnect: true,
    });

    // Auto-authenticate if user is logged in (client-side only)
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId && token) {
        socket.emit("authenticate", { userId, token });
      }
    }

    // Socket connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error: unknown) => {
      console.error("Socket error:", error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Chat-specific functions
export function joinChat(chatId: string) {
  const sock = getSocket();
  sock.emit("join_conversation", chatId);
}

export function leaveChat(chatId: string) {
  const sock = getSocket();
  sock.emit("leave_conversation", chatId);
}

export function sendMessage(
  chatId: string,
  content: string,
  type: string = "text"
) {
  const sock = getSocket();
  sock.emit("send_message", {
    conversationId: chatId,
    content,
    type,
  });
}

export function onNewMessage(callback: (message: Message) => void) {
  const sock = getSocket();
  sock.on("new_message", callback);
}

export function offNewMessage(callback?: (message: Message) => void) {
  const sock = getSocket();
  if (callback) {
    sock.off("new_message", callback);
  } else {
    sock.off("new_message");
  }
}
