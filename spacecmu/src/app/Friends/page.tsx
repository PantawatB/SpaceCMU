"use client";


import Sidebar from "../../components/Sidebar";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_BASE_URL } from "../../utils/apiConfig";
import ChatWindow from '@/components/ChatWindow';

// Interface for friend request API response
interface FriendRequestUser {
  id: string;
  studentId: string;
  email: string;
  name: string;
  bio: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

interface FriendRequestResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fromUser: FriendRequestUser;
  toUser: FriendRequestUser;
}



// Friend card component
interface FriendCardProps {
  id: string;
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
          {followed ? (
            // Pending friend request: show Accept / Reject buttons
            <>
              <button
                className="bg-gray-600 hover:bg-gray-700 transition-all text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1"
                onClick={onFollow}
              >
                Accept
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 transition-all text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1"
                onClick={onRemove}
              >
                Reject
              </button>
            </>
          ) : (
            // Other cards: keep Add Friend + remove icon
            <>
              <button
                className={`bg-gray-600 transition-all gradient text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1`}
                onClick={onFollow}
              >
                Add Friend
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
            </>
          )}
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

export default function FriendsMainPage() {
  const [friendRequests, setFriendRequests] = useState<FriendCardProps[]>([]);
  const [friends, setFriends] = useState<FriendCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FriendRequestResponse[] = await response.json();
      
      // Transform API data to match FriendCardProps interface
      const transformedRequests: FriendCardProps[] = data.map((request) => ({
        id: request.id,
        name: request.fromUser.name,
        bio: request.fromUser.bio || "No bio available",
        followed: request.status === "pending",
        onFollow: () => handleAcceptRequest(request.id),
        onRemove: () => handleRejectRequest(request.id),
      }));

      setFriendRequests(transformedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friend requests');
      console.error('Error fetching friend requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch current friends list
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/friends`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn('Failed to fetch friends:', res.status);
        return;
      }

      const data: { id: string; name: string; bio: string | null }[] = await res.json();
      const transformed: FriendCardProps[] = data.map((u) => ({
        id: u.id,
        name: u.name,
        bio: u.bio || 'No bio available',
        followed: false,
        onFollow: () => {},
        onRemove: () => {},
      }));

      setFriends(transformed);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  // Function to handle accepting friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh friend requests after accepting
        fetchFriendRequests();
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Function to handle rejecting friend request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/friends/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh friend requests after rejecting
        fetchFriendRequests();
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  // Fetch friend requests and friends on component mount
  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mock data for "People you may know" section
  const peopleYouMayKnow: FriendCardProps[] = [
    {
      id: 'p5',
      name: "People 5",
      bio: "Design is my passion",
      followed: false,
      onFollow: () => {},
      onRemove: () => {},
    },
    {
      id: 'p6',
      name: "People 6",
      bio: "Always learning",
      followed: false,
      onFollow: () => {},
      onRemove: () => {},
    },
    {
      id: 'p7',
      name: "People 7",
      bio: "Fullstack developer",
      followed: false,
      onFollow: () => {},
      onRemove: () => {},
    },
    {
      id: 'p8',
      name: "People 8",
      bio: "Marketing & growth hacker",
      followed: false,
      onFollow: () => {},
      onRemove: () => {},
    },
    {
      id: 'p9',
      name: "Tomás García",
      bio: "React Native expert",
      followed: false,
      onFollow: () => {},
      onRemove: () => {},
    },
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading friend requests...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <>
              <HorizontalScrollSection title="Friends" items={friends} />
              <HorizontalScrollSection title="Friend Requests" items={friendRequests} />
              <HorizontalScrollSection title="People you may know" items={peopleYouMayKnow} />
            </>
          )}
        </div>
      </main>
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
}
