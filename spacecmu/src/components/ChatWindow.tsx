"use client";

import { useState } from 'react';
import Image from 'next/image';

type ChatItem = { id: number; name: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean };
type MessageItem = { id: number; senderId: number; text: string; time: string; isMine: boolean };

export default function ChatWindow() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  // mock data (replace with API later)
  const mockChats: ChatItem[] = [
    { id: 1, name: "Nezuko Kamado", avatar: "/nezuko.jpg", lastMessage: "Thanks for helping me!", time: "2m", unread: 2, online: true },
    { id: 2, name: "Zenitsu Agatsuma", avatar: "/zenitsu.jpg", lastMessage: "Are you free tomorrow?", time: "15m", unread: 0, online: true },
    { id: 3, name: "Inosuke Hashibira", avatar: "/inosuke.jpeg", lastMessage: "Let's train together!", time: "1h", unread: 1, online: false },
  ];

  const mockMessages: MessageItem[] = [
    { id: 1, senderId: 1, text: "Hey! How are you?", time: "10:30 AM", isMine: false },
    { id: 2, senderId: 0, text: "I'm good! How about you?", time: "10:32 AM", isMine: true },
    { id: 3, senderId: 1, text: "Thanks for helping me!", time: "10:35 AM", isMine: false },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-20">
      {!selectedChat && (
        <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${isChatOpen ? 'w-80 h-[480px]' : 'w-80 h-14'}`}>
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-gray-100 cursor-pointer"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <h3 className="font-bold text-gray-800">Messages</h3>
              {mockChats.filter(c => c.unread > 0).length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {mockChats.reduce((sum, c) => sum + c.unread, 0)}
                </span>
              )}
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isChatOpen ? 'rotate-0' : 'rotate-180'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {isChatOpen && (
            <div className="overflow-y-auto h-[calc(100%-56px)]">
              {mockChats.map((chat) => (
                <div key={chat.id} onClick={() => setSelectedChat(chat.id)} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition border-b border-gray-50">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                      <Image src={chat.avatar} alt={chat.name} fill className="object-cover" />
                    </div>
                    {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">{chat.name}</h4>
                      <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">{chat.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedChat && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-[520px] flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image src={mockChats.find(c => c.id === selectedChat)?.avatar || "/noobcat.png"} alt="chat" fill className="object-cover" />
                </div>
                {mockChats.find(c => c.id === selectedChat)?.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">{mockChats.find(c => c.id === selectedChat)?.name}</h4>
                <p className="text-xs text-gray-400">{mockChats.find(c => c.id === selectedChat)?.online ? 'Active now' : 'Offline'}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedChat(null); setIsChatOpen(false); }} className="text-gray-400 hover:text-gray-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.isMine ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-xs mt-1 block ${msg.isMine ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    console.log('Send message:', chatMessage);
                    setChatMessage('');
                  }
                }}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button onClick={() => { if (chatMessage.trim()) { console.log('Send message:', chatMessage); setChatMessage(''); } }} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
