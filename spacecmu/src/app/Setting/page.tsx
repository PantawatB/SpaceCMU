"use client";
import Sidebar from "../../components/Sidebar";
import ChatWindow from '@/components/ChatWindow';

export default function SettingPage() {
  const menuItems = [
    { name: "Profile", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none"/></svg>
    ), link: "/Profile" },
    { name: "Feeds", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M4 10h16"/></svg>
    ), link: "/Feeds" },
    { name: "Market", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path stroke="currentColor" strokeWidth="2" d="M3 9l1 10a2 2 0 002 2h12a2 2 0 002-2l1-10" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M5 9V7a7 7 0 0114 0v2" fill="none"/></svg>
    ), link: "/Market" },
    { name: "Friends", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M2 20c0-3 3-5 6-5s6 2 6 5" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M12 20c0-3 3-5 6-5s6 2 6 5" fill="none"/></svg>
    ), link: "/Friends" },
    { name: "Setting", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
    ), link: "/Setting" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Setting content ไม่มี SearchBar */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Setting</h1>
          {/* ...setting content... */}
        </div>
      </main>
      {/* Chat Window */}
      <ChatWindow />
    </div>
  )
}
