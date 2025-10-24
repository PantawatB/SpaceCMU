"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  getMyChats,
  getMessages,
  sendMessageRest,
  type Chat,
  type Message,
} from "@/lib/chatApi";
import { API_BASE_URL, normalizeImageUrl } from "@/utils/apiConfig";

interface ChatWindowProps {
  chatId?: string;
  onClose?: () => void;
}

export default function ChatWindow({ chatId, onClose }: ChatWindowProps = {}) {
  const [isChatOpen, setIsChatOpen] = useState(!!chatId);
  const [selectedChat, setSelectedChat] = useState<string | null>(
    chatId || null
  );
  const [chatMessage, setChatMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const userId = userData.id || userData.data?.id;
          setCurrentUserId(userId);
          console.log("✅ Current user ID:", userId);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Handle chatId prop changes
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
      setIsChatOpen(true);
    }
  }, [chatId]);

  // Fetch chats when component mounts or chat window opens
  useEffect(() => {
    if (isChatOpen && chats.length === 0) {
      loadChats();
    }
  }, [isChatOpen, chats.length]);

  // Load messages and start polling when chat is selected
  useEffect(() => {
    if (selectedChat) {
      // Load messages immediately
      loadMessages(selectedChat);

      // Poll for new messages every 2 seconds
      const pollInterval = setInterval(() => {
        loadMessages(selectedChat);
      }, 2000);

      // Cleanup polling when changing chats
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      const fetchedChats = await getMyChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
    setLoading(false);
  };

  const loadMessages = async (chatId: string) => {
    try {
      const fetchedMessages = await getMessages(chatId);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedChat) return;

    const messageText = chatMessage.trim();
    setChatMessage("");

    try {
      // Send via REST API
      await sendMessageRest(selectedChat, messageText);

      // Immediately reload messages to show the new one
      await loadMessages(selectedChat);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
      // Restore message if failed
      setChatMessage(messageText);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;

    // Debug log
    console.log("Chat object:", chat);
    console.log("Current user ID:", currentUserId);
    console.log("Participants:", chat.participants);

    // For direct chats, show the other participant's name
    if (chat.participants && chat.participants.length > 0) {
      // If we have currentUserId, filter it out
      if (currentUserId) {
        const otherParticipant = chat.participants.find(
          (p) => p.id !== currentUserId
        );
        if (otherParticipant) {
          console.log("Found other participant:", otherParticipant.name);
          return otherParticipant.name;
        }
      }

      // Fallback: just show the first participant that's not in localStorage userId
      const localUserId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (localUserId) {
        const otherParticipant = chat.participants.find(
          (p) => p.id !== localUserId
        );
        if (otherParticipant) {
          console.log("Found via localStorage:", otherParticipant.name);
          return otherParticipant.name;
        }
      }

      // Last resort: show first participant
      console.log("Using first participant:", chat.participants[0].name);
      return chat.participants[0].name;
    }

    return "Unknown User";
  };

  const getOtherParticipant = (chat: Chat) => {
    if (!chat.participants || chat.participants.length === 0) return null;

    if (currentUserId) {
      return chat.participants.find((p) => p.id !== currentUserId) || null;
    }

    const localUserId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (localUserId) {
      return chat.participants.find((p) => p.id !== localUserId) || null;
    }

    return chat.participants[0] || null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-20">
      {!selectedChat && (
        <div
          className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
            isChatOpen ? "w-80 h-[480px]" : "w-80 h-14"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              <h3 className="font-bold text-gray-800">Messages</h3>
              {chats.filter(() => false).length > 0 && ( // ปิดการแสดง unread badge ชั่วคราว
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  0
                </span>
              )}
            </div>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`w-5 h-5 transition-transform duration-300 ${
                  isChatOpen ? "rotate-0" : "rotate-180"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>

          {isChatOpen && (
            <div className="overflow-y-auto h-[calc(100%-56px)]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">Loading chats...</div>
                </div>
              ) : (
                <>
                  {chats.map((chat) => {
                    const otherUser = getOtherParticipant(chat);
                    const profileImg = otherUser?.profileImg;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat.id)}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition border-b border-gray-50"
                      >
                        <div className="relative">
                          {profileImg ? (
                            <Image
                              src={normalizeImageUrl(profileImg)}
                              alt="Profile"
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {getChatDisplayName(chat)
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm text-gray-800 truncate">
                              {getChatDisplayName(chat)}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {chat.lastMessage
                                ? formatTime(chat.lastMessage.createdAt)
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate">
                              {chat.lastMessage?.content || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {chats.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">
                        No chats found
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {selectedChat && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-[520px] flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <div className="relative">
                {(() => {
                  const currentChat = chats.find((c) => c.id === selectedChat);
                  const otherUser = currentChat
                    ? getOtherParticipant(currentChat)
                    : null;
                  const profileImg = otherUser?.profileImg;

                  return profileImg ? (
                    <Image
                      src={normalizeImageUrl(profileImg)}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {currentChat
                          ? getChatDisplayName(currentChat)
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">
                  {selectedChat && chats.find((c) => c.id === selectedChat)
                    ? getChatDisplayName(
                        chats.find((c) => c.id === selectedChat)!
                      )
                    : "Chat"}
                </h4>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedChat(null);
                setIsChatOpen(false);
                onClose?.();
              }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
            {messages.map((msg) => {
              const isMine = msg.sender.id === currentUserId;

              // Check if message contains image URL
              const lines = msg.content.split("\n");
              const hasImage = lines.some(
                (line) =>
                  line.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                  line.includes("/uploads/")
              );

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {hasImage ? (
                      <div className="space-y-2">
                        {lines.map((line, idx) => {
                          const trimmedLine = line.trim();
                          const isImageUrl =
                            trimmedLine.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                            trimmedLine.includes("/uploads/");

                          if (isImageUrl) {
                            // Make sure URL is absolute and normalized
                            let imageUrl = trimmedLine.startsWith("http")
                              ? trimmedLine
                              : `${API_BASE_URL}${trimmedLine}`;

                            // Normalize localhost URLs
                            imageUrl = normalizeImageUrl(imageUrl);

                            return (
                              <div
                                key={idx}
                                className="rounded-lg overflow-hidden bg-white p-2"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imageUrl}
                                  alt="Product"
                                  className="w-full h-auto max-w-[200px] object-cover rounded-lg"
                                  onError={(e) => {
                                    // Show placeholder if image fails to load
                                    const target = e.currentTarget;
                                    target.src =
                                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNCRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                                    target.onerror = null; // Prevent infinite loop
                                  }}
                                />
                                <p className="text-xs text-gray-400 mt-1 break-all">
                                  {trimmedLine}
                                </p>
                              </div>
                            );
                          } else if (trimmedLine) {
                            return (
                              <p key={idx} className="text-sm">
                                {trimmedLine}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <span
                      className={`text-xs mt-1 block ${
                        isMine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">No messages yet</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && chatMessage.trim()) {
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!chatMessage.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
