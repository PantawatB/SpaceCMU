"use client";


import Sidebar from "../../components/Sidebar";
import React from "react";
import Image from "next/image";



// Friend card component
interface FriendCardProps {
  name: string;
  bio: string;
  followed: boolean;
  onFollow: () => void;
  onRemove: () => void;
}
function FriendCard({ name, bio, followed, onFollow, onRemove }: FriendCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden flex flex-col items-center shadow-lg bg-white font-Roboto-light mb-6">
      <div className="h-24 w-full bg-gray-500"></div>
      <div className="top-24 z-10 flex items-center flex-col gap-4 px-5 py-5">
        <div className="-mt-16">
          <Image
            src="/tanjiro.jpg"
            alt="Profile Avatar"
            width={75}
            height={75}
            className="rounded-full border-2 border-white shadow"
          />
        </div>
        <div className="flex items-center flex-col">
          <p title="name" className="text-black font-Roboto-md">
            {name}
          </p>
          <p title="bio" className="text-xs text-gray-500 font-medium">
            {bio}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`bg-gray-600 transition-all gradient text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1 ${followed ? "" : "opacity-50"}`}
            onClick={onFollow}
          >
            {followed ? "Accept" : "Friend"}
          </button>
          <button
            className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
            onClick={onRemove}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function HorizontalScrollSection({ title, items }: { title: string; items: FriendCardProps[] }) {
  const [startIdx, setStartIdx] = React.useState(0);
  const visibleCount = 4;
  const canGoBack = startIdx > 0;
  const canGoNext = startIdx + visibleCount < items.length;
  const visibleItems = items.slice(startIdx, startIdx + visibleCount);
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setStartIdx(Math.max(0, startIdx - visibleCount))}
            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 ${!canGoBack ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canGoBack}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setStartIdx(Math.min(items.length - visibleCount, startIdx + visibleCount))}
            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 ${!canGoNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canGoNext}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="flex gap-8 ">
        {visibleItems.map((f, idx) => (
          <div key={idx} className="w-80">
            <FriendCard {...f} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Mock data
const friendRequests: FriendCardProps[] = [
  {
    name: "People 1",
    bio: "In the business of making things happen",
    followed: true,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 2",
    bio: "Coffee lover & developer",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 3",
    bio: "Frontend wizard & cat lover",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 4",
    bio: "Backend engineer, runner",
    followed: true,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "Anna Ivanova",
    bio: "UX/UI designer, traveler",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
];
const peopleYouMayKnow: FriendCardProps[] = [
  {
    name: "People 5",
    bio: "Design is my passion",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 6",
    bio: "Always learning",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 7",
    bio: "Fullstack developer",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "People 8",
    bio: "Marketing & growth hacker",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
  {
    name: "Tomás García",
    bio: "React Native expert",
    followed: false,
    onFollow: () => {},
    onRemove: () => {},
  },
];

export default function FriendsMainPage() {
  
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
          <path stroke="currentColor" strokeWidth="2" d="M4 10h16" />
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
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Search bar */}
        <div className="mb-6">
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
        <div className="flex flex-col">
          <HorizontalScrollSection title="Friend Requests" items={friendRequests} />
          <HorizontalScrollSection title="People you may know" items={peopleYouMayKnow} />
        </div>
      </main>
    </div>
  );
}
