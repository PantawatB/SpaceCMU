"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { useEffect, useState } from 'react';
import ChatWindow from '@/components/ChatWindow';

type Persona = { id?: string; displayName?: string; avatarUrl?: string; bio?: string; friendCount?: number; bannerImg?: string };
type CurrentUser = { id?: string; name?: string; studentId?: string; profileImg?: string; bannerImg?: string; bio?: string | null; persona?: Persona; friendCount?: number } | null;

import { API_BASE_URL } from '@/utils/apiConfig';

export default function ProfileMainPage() {

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

  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [activeProfile, setActiveProfile] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('activeProfile');
      return v ? parseInt(v, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch current user');
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();

    // listen for activeProfile changes from Sidebar
    const handler = (e: Event) => {
      // event detail is the new profile index
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === 'number') setActiveProfile(detail);
    };
    window.addEventListener('activeProfileChanged', handler as EventListener);
    return () => window.removeEventListener('activeProfileChanged', handler as EventListener);
  }, []);

  // compute displayed profile
  const publicProfile = {
    name: currentUser?.name ?? 'Kamado Tanjiro',
    studentId: currentUser?.studentId ?? '6506xxxxx',
    // keep avatar null when profileImg is null so UI can show a gray placeholder
    avatar: currentUser?.profileImg ?? null,
    // banner: use null when not provided so UI shows default gradient
    banner: currentUser?.bannerImg ?? null,
    // keep bio null when not set so UI can show 'No bio.' explicitly
    bio: currentUser?.bio ?? null,
    friendCount: currentUser?.friendCount ?? 0,
  };

  const anonymousProfile = {
    name: currentUser?.persona?.displayName ?? 'Noobcat',
    // keep avatar null when persona has no avatarUrl so UI can show gray placeholder
    avatar: currentUser?.persona?.avatarUrl ?? null,
    bio: currentUser?.persona?.bio ?? null,
    friendCount: currentUser?.persona?.friendCount ?? 0,
  };

  const displayed = activeProfile === 0 ? publicProfile : anonymousProfile;

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
        <section className="flex-1 overflow-y-auto flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow relative overflow-hidden">
            {/* Cover Image */}
            {publicProfile.banner ? (
              // show provided banner image
              (publicProfile.banner.startsWith('http') ? (
                <div className="h-40 w-full relative">
                  <Image
                    loader={({ src }) => src}
                    src={publicProfile.banner}
                    alt="banner"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-40 w-full relative">
                  <Image
                    src={publicProfile.banner}
                    alt="banner"
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="h-40 w-full bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 flex items-center justify-center relative">
                {/* Rainbow background (default when no banner) */}
              </div>
            )}
            {/* Profile Avatar - left aligned */}
            <div className="absolute left-10 top-28 flex items-center">
              <div className="rounded-full border-4 border-white p-1 bg-white">
                {displayed.avatar ? (
                  // render provided avatar (external or local)
                  (typeof displayed.avatar === 'string' && displayed.avatar.startsWith('http')) ? (
                    <Image
                      loader={({ src }) => src}
                      src={displayed.avatar}
                      alt={displayed.name}
                      width={90}
                      height={90}
                      unoptimized
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src={displayed.avatar}
                      alt={displayed.name}
                      width={90}
                      height={90}
                      className="rounded-full"
                    />
                  )
                ) : (
                  // no profile image: show neutral gray placeholder circle
                  <div className="w-[90px] h-[90px] rounded-full bg-gray-300 border-2 border-white" aria-hidden="true" />
                )}
              </div>
              {/* Stats - right of avatar */}
              <div className="flex flex-col justify-center ml-6 relative" style={{ top: '18px' }}>
                <div className="flex gap-8">
                  <div className="text-center">
                    <span className="text-xl font-semibold">{displayed.friendCount}</span>
                    <span className="text-gray-500 ml-1">Friends</span>
                    {/* <span className="text-gray-500 ml-4">|</span> */}
                    {/* <span className="text-black-500 ml-4 font-semibold">65</span>
                    <span className="text-gray-500 ml-1">Engineers</span> */}
                  </div>
                </div>
              </div>
            </div>
            {/* Name & Verified */}
            <div className="flex items-center mt-20 ml-8">
              <span className="text-2xl font-bold">{displayed.name}</span>
              {activeProfile === 0 && (
                <svg
                  className="w-6 h-6 text-blue-500 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.93 6.36l-4.24 4.24a1 1 0 01-1.41 0l-2.12-2.12a1 1 0 111.41-1.41l1.41 1.41 3.54-3.54a1 1 0 111.41 1.41z" />
                </svg>
              )}
            </div>
            {/* Student id (only for public) */}
            {/* {activeProfile === 0 && (
              <div className="text-left text-gray-600 mt-2 px-8">@{publicProfile.studentId}</div>
            )} */}
            {/* Bio */}
            <div className="text-left text-gray-600 mt-2 px-8">
              {displayed.bio ?? 'No bio.'}
            </div>
            {/* Tabs */}
            <div className="flex justify-center mt-6 border-b border-gray-200">
              <button className="px-6 py-3 font-medium text-gray-700 bg-gray-100 rounded-t-xl">
                Reposts
              </button>
              <button className="px-6 py-3 font-medium text-gray-700">Friends</button>
              <button className="px-6 py-3 font-medium text-gray-700">
                Likes
              </button>
              <button className="px-6 py-3 font-medium text-gray-700">
                Saved
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
}
