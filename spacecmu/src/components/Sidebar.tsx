"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface SidebarMenuItem {
  name: string;
  icon: React.ReactNode;
  link?: string;
}

interface SidebarProps {
  menuItems: SidebarMenuItem[];
}

const profiles = [
  {
    type: "Public",
    name: "Kamado Tanjiro",
    username: "@6506xxxxx",
    avatar: "/tanjiro.jpg", // เปลี่ยนเป็น path รูปจริง
    bg: "bg-gradient-to-tr from-purple-400 via-cyan-300 to-yellow-300",
  },
  {
    type: "Anonymous",
    name: "Noobcat",
    username: "@anonymous",
    avatar: "/noobcat.png", // เปลี่ยนเป็น path รูปจริง
    bg: "bg-gray-400",
  },
];

export default function Sidebar({ menuItems }: SidebarProps) {
  const pathname = usePathname();
  const [activeProfile, setActiveProfile] = useState(0);

  return (
    <aside className="w-64 p-6 flex flex-col justify-between h-screen bg-white">
      <div>
        {/* Logo */}
        <div className="text-2xl font-bold mb-8">⌘</div>
        {/* Profile Section */}
        <div className="flex gap-4 items-center mb-8">
          {profiles.map((profile, idx) => (
            <div
              key={profile.type}
              className={`flex flex-col items-center transition-all duration-300 ${activeProfile === idx ? "" : "opacity-50 grayscale"}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center relative ${profile.bg} shadow-lg`}>
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                {activeProfile === idx && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow"></span>
                )}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-800">{profile.name}</div>
              <div className="text-xs text-gray-500">{profile.username}</div>
            </div>
          ))}
        </div>
        
        {/* Menu */}
        <nav className="space-y-3">
          {menuItems.map((item) => (
            item.link ? (
              <Link href={item.link} key={item.name} className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left ${
                pathname === item.link
                  ? "bg-white text-black shadow-md border border-gray-200 font-semibold"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}>
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className={pathname === item.link ? "text-base" : "text-sm"}>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.name}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            )
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {/* Toggle Profile Button */}
        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
          <button
            className={`flex-1 py-2 text-center font-semibold transition-all duration-300 ${activeProfile === 0 ? "bg-white text-black" : "bg-gray-200 text-gray-500"}`}
            onClick={() => setActiveProfile(0)}
          >
            Public
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold transition-all duration-300 ${activeProfile === 1 ? "bg-white text-black" : "bg-gray-200 text-gray-500"}`}
            onClick={() => setActiveProfile(1)}
          >
            Anonymous
          </button>
        </div>
        <button className="w-full flex items-center gap-3 justify-center bg-black text-white rounded-lg px-3 py-2 font-semibold hover:bg-gray-800">
          <span className="w-5 h-5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path stroke="currentColor" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/><path stroke="currentColor" strokeWidth="2" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z"/></svg>
          </span>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
