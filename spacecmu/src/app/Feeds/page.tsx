"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { API_BASE_URL } from '@/utils/apiConfig';



export default function FeedsMainPage() {
  const [feedMode, setFeedMode] = useState("Global");
  const [showShareBar, setShowShareBar] = useState(true);
  const [postText, setPostText] = useState("");
  const [postMode, setPostMode] = useState<'public'|'anonymous'>('public');
  const [posting, setPosting] = useState(false);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  // Mock chat data
  const mockChats = [
    { id: 1, name: "Nezuko Kamado", avatar: "/nezuko.jpg", lastMessage: "Thanks for helping me!", time: "2m", unread: 2, online: true },
    { id: 2, name: "Zenitsu Agatsuma", avatar: "/zenitsu.jpg", lastMessage: "Are you free tomorrow?", time: "15m", unread: 0, online: true },
    { id: 3, name: "Inosuke Hashibira", avatar: "/inosuke.jpeg", lastMessage: "Let's train together!", time: "1h", unread: 1, online: false },
  ];

  const mockMessages = [
    { id: 1, senderId: 1, text: "Hey! How are you?", time: "10:30 AM", isMine: false },
    { id: 2, senderId: 0, text: "I'm good! How about you?", time: "10:32 AM", isMine: true },
    { id: 3, senderId: 1, text: "Thanks for helping me!", time: "10:35 AM", isMine: false },
  ];

  const menuItems = [
    {
      name: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 20c0-4 4-6 8-6s8 2 8 6"
            fill="none"
          />
        </svg>
      ),
      link: "/Profile",
    },
    {
      name: "Feeds",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <rect
            x="4"
            y="6"
            width="16"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M4 10h16"
            fill="none"
          />
        </svg>
      ),
      link: "/Feeds",
    },
    {
      name: "Market",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M3 9l1 10a2 2 0 002 2h12a2 2 0 002-2l1-10"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M5 9V7a7 7 0 0114 0v2"
            fill="none"
          />
        </svg>
      ),
      link: "/Market",
    },
    {
      name: "Friends",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="8"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="16"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M2 20c0-3 3-5 6-5s6 2 6 5"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 20c0-3 3-5 6-5s6 2 6 5"
            fill="none"
          />
        </svg>
      ),
      link: "/Friends",
    },
    {
      name: "Setting",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          />
        </svg>
      ),
      link: "/Setting",
    },
  ];

  const handleSend = async () => {
    if (!postText.trim()) return;
    setPosting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: postText, visibility: postMode, location: "" })
      });
      if (!res.ok) throw new Error('Post failed');
      setPostText('');
      // TODO: refresh posts
    } catch (err: unknown) {
      console.error(err);
    }
    setPosting(false);
  };

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar (Left) */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content (Center) */}
      <main className="flex-1 pt-8 px-8 pb-0 flex flex-col gap-4 relative">
        {/* Search bar */}
        <div className="mb-2">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="21"
                  y1="21"
                  x2="16.65"
                  y2="16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 rounded-full bg-white text-sm placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        {/* Feeds Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Feeds</h1>
          <div className="flex gap-8 text-gray-400 font-semibold text-lg">
            <button
              className={
                feedMode === "Global"
                  ? "text-black border-b-2 border-black pb-1"
                  : "hover:text-black"
              }
              onClick={() => setFeedMode("Global")}
            >
              Global
            </button>
            <button
              className={
                feedMode === "Friends"
                  ? "text-black border-b-2 border-black pb-1"
                  : "hover:text-black"
              }
              onClick={() => setFeedMode("Friends")}
            >
              Friends
            </button>
          </div>
        </div>
        {/* Feeds Section: scrollable only for posts */}
        <section className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {/* โพสต์ตัวอย่าง 10 โพสต์ */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={"bg-gray-50 rounded-2xl p-6 shadow  relative"}
            >
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={i % 2 === 0 ? "/tanjiro.jpg" : "/noobcat.png"}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">
                    {i % 2 === 0 ? "Kamado Tanjiro" : "Noobcat"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {i % 2 === 0 ? "65,Engineering" : "Anonymous"}
                  </div>
                  <div className="text-xs text-gray-400">{i + 1} hours ago</div>
                </div>
              </div>
              <div className="mb-2 text-base font-semibold">
                {i % 2 === 0
                  ? "I love my family so much!"
                  : "Just chilling and enjoying life."}
              </div>
              <div className="flex gap-3 mb-2">
                <Image
                  src={
                    i % 2 === 0 ? "/tanjiro_with_family.webp" : "/cat-post.jpg"
                  }
                  alt="avatar"
                  width={480}
                  height={40}
                  className="object-cover"
                />
              </div>

              {/* Post actions */}
              <div className="flex gap-6 text-gray-500 text-base mt-6">
                <span className="text-pink-500 font-semibold">Like</span>
                <span>Comment</span>
                <span>Share</span>
              </div>
              <button className="absolute top-6 right-6 text-gray-400 text-2xl">
                ⋮
              </button>
            </div>
          ))}
        </section>
        {/* Share something bar - fixed bottom, larger size, toggle show/hide with arrow icon */}
        <div
          className={`fixed left-80 right-80 bottom-6 z-10 flex flex-col items-center ${
            showShareBar ? "" : "bg-transparent p-0 shadow-none"
          }`}
        >
          <button
            className="mb-2 text-2xl text-gray-500 bg-gray-200 rounded-full p-1 hover:bg-gray-300 flex items-center justify-center"
            onClick={() => setShowShareBar((prev) => !prev)}
            style={{ width: "40px", height: "40px" }}
            aria-label={showShareBar ? "Hide Share Bar" : "Show Share Bar"}
          >
            {showShareBar ? (
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-6 h-6"
              >
                <path d="M6 15l6-6 6 6" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-6 h-6"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </button>
          {showShareBar && (
            <div className="bg-gray-50 rounded-xl shadow-lg px-8 py-5 flex flex-col gap-3 w-full max-w-3xl">
              <div className="flex items-center gap-3">
                <Image
                  src="/tanjiro.jpg"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />

                <input
                  type="text"
                  placeholder="Share something"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full bg-white text-gray-500 border-none outline-none text-lg"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-6 items-center">
                  <div className="relative">
                    <select value={postMode} onChange={(e) => setPostMode(e.target.value as 'public'|'anonymous')}
                      className="px-3 py-2 border rounded-md bg-white text-sm">
                      <option value="public">Public</option>
                      <option value="anonymous">Anonymous</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSend} disabled={posting}
                  className="bg-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-800 transition">
                  {posting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Right Section: Recent Active Friends (no border) */}
      <aside className="w-80 p-8 bg-white flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Active Friends</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="font-medium">People 1</div>
                <div className="text-xs text-gray-400">Active now</div>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="font-medium">People 2</div>
                <div className="text-xs text-gray-400">Active 2m ago</div>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="font-medium">People 3</div>
                <div className="text-xs text-gray-400">Active 5m ago</div>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      {/* Chat Window - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-20">
        {/* Chat List View */}
        {!selectedChat && (
          <div
            className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
              isChatOpen ? "w-80 h-[480px]" : "w-80 h-14"
            }`}
          >
            {/* Chat Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b border-gray-100 cursor-pointer"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
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
                {mockChats.filter(c => c.unread > 0).length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {mockChats.reduce((sum, c) => sum + c.unread, 0)}
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition">
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

            {/* Chat List */}
            {isChatOpen && (
              <div className="overflow-y-auto h-[calc(100%-56px)]">
                {mockChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition border-b border-gray-50"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative">
                        <Image
                          src={chat.avatar}
                          alt={chat.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">
                          {chat.name}
                        </h4>
                        <span className="text-xs text-gray-400">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Individual Chat View */}
        {selectedChat && (
          <div className="bg-white rounded-2xl shadow-2xl w-80 h-[520px] flex flex-col">
            {/* Chat Header */}
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
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    <Image
                      src={mockChats.find(c => c.id === selectedChat)?.avatar || "/noobcat.png"}
                      alt="chat"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {mockChats.find(c => c.id === selectedChat)?.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">
                    {mockChats.find(c => c.id === selectedChat)?.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {mockChats.find(c => c.id === selectedChat)?.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedChat(null);
                  setIsChatOpen(false);
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.isMine
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        msg.isMine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      // TODO: Send message API call
                      console.log('Send message:', chatMessage);
                      setChatMessage('');
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={() => {
                    if (chatMessage.trim()) {
                      // TODO: Send message API call
                      console.log('Send message:', chatMessage);
                      setChatMessage('');
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition"
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
    </div>
  );
}
