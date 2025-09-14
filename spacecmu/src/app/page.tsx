"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [activeMenu, setActiveMenu] = useState("Profile");
  const menuItems = [
    { name: "Profile", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none"/></svg>
    ) },
    { name: "Feeds", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M4 10h16"/></svg>
    ) },
    { name: "Market", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path stroke="currentColor" strokeWidth="2" d="M3 9l1 10a2 2 0 002 2h12a2 2 0 002-2l1-10" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M5 9V7a7 7 0 0114 0v2" fill="none"/></svg>
    ) },
    { name: "Friends", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M2 20c0-3 3-5 6-5s6 2 6 5" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M12 20c0-3 3-5 6-5s6 2 6 5" fill="none"/></svg>
    ) },
    { name: "Setting", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
    ) },
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col justify-between h-screen bg-white">
        <div>
          {/* Logo */}
          <div className="text-2xl font-bold mb-8">⌘</div>
          {/* Menu */}
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left ${
                  activeMenu === item.name
                    ? "bg-white text-black shadow-md border border-gray-200 font-semibold"
                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className={activeMenu === item.name ? "text-base" : "text-sm"}>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-6">
          <button className="w-full flex items-center gap-3 justify-center bg-black text-white rounded-lg px-3 py-2 font-semibold hover:bg-gray-800">
            <span className="w-5 h-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path stroke="currentColor" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/><path stroke="currentColor" strokeWidth="2" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z"/></svg>
            </span>
            <span className="text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 rounded-full bg-white text-sm placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Profile Header */}
        <div className="relative">
          <div className="h-40 w-full rounded-lg bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300"></div>
          <div className="flex items-center gap-6 mt-[-3rem] bg-white p-6 rounded-lg shadow relative z-10">
            <img
              src="https://i.pravatar.cc/100?img=6"
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Fredy Mercury</h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">✔️</span>
              </div>
              <p className="text-gray-500 text-sm">
                Alzea Arafat, Indonesian based senior UI/UX designer with more than 10 years experience in various industry from early stage startups to unicorns. His hobby is playing guitar.
              </p>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>1.25k Followers</span>
                <span>455 Followings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6">
          <button className="py-2 border-b-2 border-black font-medium">Events</button>
          <button className="py-2 text-gray-500 hover:text-black">Room</button>
          <button className="py-2 text-gray-500 hover:text-black">Donations</button>
          <button className="py-2 text-gray-500 hover:text-black">Followers</button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition relative">
            <img src="https://picsum.photos/400/200" className="rounded-lg" />
            <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow text-gray-400 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
            </button>
            <h3 className="font-semibold mt-2">お祭りイベント</h3>
            <p className="text-sm text-gray-500">Hana Matsuri event and market</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition relative">
            <img src="https://picsum.photos/401/200" className="rounded-lg" />
            <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow text-gray-400 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
            </button>
            <h3 className="font-semibold mt-2">Hot Pot</h3>
            <p className="text-sm text-gray-500">Spicy and hot foodie paradise</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition relative">
            <img src="https://picsum.photos/402/200" className="rounded-lg" />
            <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow text-gray-400 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
              </svg>
            </button>
            <h3 className="font-semibold mt-2">FUN DAY</h3>
            <p className="text-sm text-gray-500">Enjoy day with music and fun</p>
          </div>
        </div>
      </main>
    </div>
  )
}
