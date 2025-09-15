"use client";
import { Inter } from "next/font/google";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function FeedsMainPage() {
  const [feedMode, setFeedMode] = useState("Global");
  const [showShareBar, setShowShareBar] = useState(true);
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
              className={"bg-gray-50 rounded-2xl p-6 shadow  relative"
              }
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
                  <div className="text-xs text-gray-400">
                    {i + 1} hours ago
                  </div>
                </div>
              </div>
              <div className="mb-2 text-base font-semibold">
                {i % 2 === 0
                  ? "I love my family so much!"
                  : "Just chilling and enjoying life."}
              </div>
              <div className="flex gap-3 mb-2">
                <Image
  src={i % 2 === 0 ? "/tanjiro_with_family.webp" : "/cat-post.jpg"}
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
          className={`fixed left-80 right-80 bottom-6 z-10 flex flex-col items-center ${showShareBar ? '' : 'bg-transparent p-0 shadow-none'}`}
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
                  className="flex-1 px-5 py-3 rounded-full bg-white text-gray-500 border-none outline-none text-lg"
                />
                <span className="text-2xl text-gray-400">😊</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-gray-700 font-medium hover:text-black text-base">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6"
                    >
                      <rect
                        x="4"
                        y="7"
                        width="16"
                        height="13"
                        rx="2"
                      />
                      <path d="M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2" />
                    </svg>
                    File
                  </button>
                  <button className="flex items-center gap-2 text-gray-700 font-medium hover:text-black text-base">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <rect x="4" y="4" width="16" height="16" rx="4" />
                    </svg>
                    Image
                  </button>
                  <button className="flex items-center gap-2 text-gray-700 font-medium hover:text-black text-base">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6"
                    >
                      <circle cx="12" cy="10" r="3" />
                      <path d="M12 13v7" />
                      <path d="M5 20h14" />
                    </svg>
                    Location
                  </button>
                  <button className="flex items-center gap-2 text-gray-700 font-medium hover:text-black text-base">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-6 h-6"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                    Public <span className="ml-1">▼</span>
                  </button>
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-800 transition">
                  Send
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
    </div>
  );
}
