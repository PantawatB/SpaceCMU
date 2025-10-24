import { API_BASE_URL } from "@/utils/apiConfig";

// Types
export interface Message {
  id: string;
  content: string;
  type: string;
  senderId?: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Chat {
  id: string;
  type: "direct" | "group";
  name?: string;
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    profileImg?: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  updatedAt?: string;
}

// Helper to get auth header
function authHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all chats for current user
 */
export async function getMyChats(): Promise<Chat[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      headers: authHeader(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    return [];
  }
}

/**
 * Fetch messages for a specific chat
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/messages?limit=50`,
      {
        headers: authHeader(),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Could not fetch messages (HTTP ${response.status})`);
      return [];
    }

    const data = await response.json();
    return data.data?.messages || [];
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

/**
 * Send a message via REST API
 */
export async function sendMessageRest(
  chatId: string,
  content: string
): Promise<Message | null> {
  try {
    const url = `${API_BASE_URL}/api/chats/${chatId}/messages`;
    const headers = {
      ...authHeader(),
      "Content-Type": "application/json",
    };
    const body = {
      content,
      type: "text",
    };

    console.log("📤 [sendMessageRest] Sending message:");
    console.log("   URL:", url);
    console.log("   Headers:", headers);
    console.log("   Body:", body);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log(
      "📥 [sendMessageRest] Response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to send message:", response.status, errorText);
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ [sendMessageRest] Success:", result);
    // Backend returns { message: "...", data: { id, content, ... } }
    return result.data || null;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
}

/**
 * Get unread messages count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/unread-count`, {
      headers: authHeader(),
    });

    if (!response.ok) {
      console.warn(`⚠️ Could not fetch unread count (HTTP ${response.status})`);
      return 0;
    }

    const data = await response.json();
    return data.unreadCount || 0;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
}

/**
 * Mark chat messages as read
 */
export async function markChatAsRead(chatId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/mark-read`,
      {
        method: "POST",
        headers: authHeader(),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Could not mark chat as read (HTTP ${response.status})`);
    }
  } catch (error) {
    console.error("Failed to mark chat as read:", error);
  }
}
