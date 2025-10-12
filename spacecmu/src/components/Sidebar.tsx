"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/apiConfig';

export interface SidebarMenuItem {
  name: string;
  icon: React.ReactNode;
  link?: string;
}

interface SidebarProps {
  menuItems: SidebarMenuItem[];
}

// profiles will be derived from current user (public and anonymous persona)
type Persona = { id?: string; displayName?: string; avatarUrl?: string };
type CurrentUser = { id?: string; name?: string; studentId?: string; profileImg?: string; persona?: Persona } | null;

export default function Sidebar({ menuItems }: SidebarProps) {
  const pathname = usePathname();
  // start with 0 on both server and client to avoid hydration mismatch
  const [activeProfile, setActiveProfile] = useState<number>(0);
  const [hydrated, setHydrated] = useState<boolean>(false);
  // read persisted value synchronously on mount to avoid a visible flash
  useLayoutEffect(() => {
    try {
      const v = localStorage.getItem('activeProfile');
      if (v) {
        const parsed = parseInt(v, 10);
        if (!Number.isNaN(parsed)) setActiveProfile(parsed);
      }
    } catch {
      // ignore
    } finally {
      // mark hydrated after reading storage so we can enable transitions
      setHydrated(true);
    }
  }, []);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  // helper to set and persist active profile immediately
  const setProfile = (idx: number) => {
    setActiveProfile(idx);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('activeProfile', String(idx));
      } catch {
        // ignore
      }
      try {
        window.dispatchEvent(new CustomEvent('activeProfileChanged', { detail: idx }));
      } catch {
        // ignore
      }
    }
  };

  // listen for custom activeProfileChanged events from other components (same-window)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === 'number') setActiveProfile(detail);
    };
    window.addEventListener('activeProfileChanged', handler as EventListener);
    return () => window.removeEventListener('activeProfileChanged', handler as EventListener);
  }, []);

  // listen for storage events (cross-tab or code that writes directly to localStorage)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'activeProfile') {
        try {
          const v = e.newValue;
          if (v) setActiveProfile(parseInt(v, 10));
          else setActiveProfile(0);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
  }, []);

  const profiles = [
    {
      type: "Public",
      name: currentUser?.name ?? "Kamado Tanjiro",
      username: currentUser?.studentId ? `@${currentUser.studentId}` : "@6506xxxxx",
      avatar: currentUser?.profileImg ?? "/tanjiro.jpg",
      bg: "bg-gradient-to-tr from-purple-400 via-cyan-300 to-yellow-300",
    },
    {
      type: "Anonymous",
      name: currentUser?.persona?.displayName ?? "Noobcat",
      username: "@anonymous",
      avatar: currentUser?.persona?.avatarUrl ?? "/noobcat.png",
      bg: "bg-gray-400",
    },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // ignore
      }
    }
    router.push('/');
  };

  return (
    <aside className="w-64 p-6 flex flex-col justify-between h-screen bg-white">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          {/* <Image
            src="/SpaceCMUlogo3.png"
            alt="SpaceCMU Logo"
            width={120}
            height={120}
            className="object-contain"
          /> */}
          <Image
            src="/SpaceCMUlogo1.png"
            alt="SpaceCMU Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold text-gray-800">SpaceCMU</span>
        </div>
        {/* Profile Section */}
        <div className="flex gap-8 items-center mb-8 justify-center">
          {profiles.map((profile, idx) => {
            const isActive = activeProfile === idx;
            return (
            <div
              key={profile.type}
              role="button"
              tabIndex={0}
              onClick={() => setProfile(idx)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setProfile(idx); }}
              className={`cursor-pointer flex flex-col items-center ${hydrated ? 'transition-all duration-300' : ''} ${hydrated && isActive ? '' : 'opacity-50 grayscale'}`}
             >
               <div
                 className={`w-14 h-14 rounded-full flex items-center justify-center relative ${profile.bg} shadow-lg`}
               >
                {typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? (
                  // external image: use Next/Image with a simple loader and unoptimized to avoid hostname config
                  <Image
                    loader={({ src }) => src}
                    src={profile.avatar}
                    alt={profile.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    priority
                  />
                ) : (
                  <Image
                    src={profile.avatar}
                    alt={profile.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    priority
                  />
                )}
                {hydrated && isActive && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow"></span>
                )}
               </div>
              <div className="mt-2 text-sm font-semibold text-gray-800">
                <div className="max-w-[5rem] truncate text-center" title={profile.name}>{profile.name}</div>
              </div>
              <div className="text-xs text-gray-500 max-w-[10rem] truncate text-center" title={profile.username}>{profile.username}</div>
            </div>
          )})}
        </div>

        {/* Menu */}
        <nav className="space-y-3">
          {menuItems.map((item) =>
            item.link ? (
              <Link
                href={item.link}
                key={item.name}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left ${
                  pathname === item.link
                    ? "bg-white text-black shadow-md border border-gray-200 font-semibold"
                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                <span
                  className={pathname === item.link ? "text-base" : "text-sm"}
                >
                  {item.name}
                </span>
              </Link>
            ) : (
              <button
                key={item.name}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 transition font-medium text-left text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </button>
            )
          )}
        </nav>
      </div>
      <div className="pt-6">
        {/* Toggle Profile Button */}
        <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
          <button
            className={`flex-1 py-2 text-center font-semibold ${hydrated ? 'transition-all duration-300' : ''} ${hydrated && activeProfile === 0 ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}
            onClick={() => setProfile(0)}
          >
            Public
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold ${hydrated ? 'transition-all duration-300' : ''} ${hydrated && activeProfile === 1 ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}
            onClick={() => setProfile(1)}
          >
            Anonymous
          </button>
        </div>
        <button className="w-full flex items-center gap-3 justify-center bg-black text-white rounded-lg px-3 py-2 font-semibold hover:bg-gray-800" onClick={handleLogout}>
          <span className="w-5 h-5 flex items-center justify-center">
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
                d="M17 16l4-4m0 0l-4-4m4 4H7"
              />
              <path
                stroke="currentColor"
                strokeWidth="2"
                d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z"
              />
            </svg>
          </span>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}
