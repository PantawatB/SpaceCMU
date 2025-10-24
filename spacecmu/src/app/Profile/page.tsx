"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import { normalizeImageUrl } from "@/utils/apiConfig";

type Persona = {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  friendCount?: number;
  bannerImg?: string;
};
type CurrentUser = {
  id?: string;
  name?: string;
  studentId?: string;
  profileImg?: string;
  bannerImg?: string;
  bio?: string | null;
  persona?: Persona;
  friendCount?: number;
} | null;

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  status?: string;
  seller?: {
    id: string;
    name: string;
    profileImg?: string;
  };
};

import { API_BASE_URL } from "@/utils/apiConfig";

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

  const DEFAULT_IMAGE =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23E5E7EB'/%3E%3C/svg%3E";

  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [activeProfile, setActiveProfile] = useState<number>(0);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  // Initialize activeProfile from localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("activeProfile");
      if (v) {
        setActiveProfile(parseInt(v, 10));
      }
    }
  }, []);

  // modal states for editing
  const [editingBanner, setEditingBanner] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "posts" | "market" | "reposts" | "likes" | "saved"
  >("posts");

  // hover states
  const [hoverBanner, setHoverBanner] = useState(false);
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [hoverName, setHoverName] = useState(false);
  const [hoverBio, setHoverBio] = useState(false);

  // file preview states
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // handle file selection
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // reset modal states when closing
  const closeBannerModal = () => {
    setEditingBanner(false);
    setNewBannerPreview(null);
    setBannerFile(null);
  };

  const closeAvatarModal = () => {
    setEditingAvatar(false);
    setNewAvatarPreview(null);
    setAvatarFile(null);
  };

  // API handlers for saving changes
  const handleSaveBanner = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You need to be logged in to update your profile");
      return;
    }

    // TODO: Upload bannerFile to server first if it exists
    // For now, we'll use the preview URL (in production, you'd upload the file and get a URL back)
    if (!bannerFile) {
      alert("Please select a banner image first");
      return;
    }

    const endpoint = activeProfile === 0 ? "/api/users/me" : "/api/personas/me";
    const fieldName = activeProfile === 0 ? "bannerImg" : "bannerImg";

    try {
      // First, upload the file
      const formData = new FormData();
      formData.append("file", bannerFile);

      const uploadRes = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Upload response status:", uploadRes?.status);

      if (!uploadRes || !uploadRes.ok) {
        const errorText = await uploadRes?.text();
        console.error("Upload error:", errorText);
        throw new Error("Failed to upload banner image");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url; // Backend returns {url: "..."} directly

      // Then update the profile
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT", // Changed from PATCH to PUT
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: imageUrl, // Use uploaded URL
        }),
      });

      if (!res.ok) throw new Error("Failed to update banner");

      // Refresh user data
      const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data);
      }

      closeBannerModal();
      alert("Banner updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update banner");
    }
  };

  const handleSaveAvatar = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You need to be logged in to update your profile");
      return;
    }

    if (!avatarFile) {
      alert("Please select a profile picture first");
      return;
    }

    const endpoint = activeProfile === 0 ? "/api/users/me" : "/api/personas/me";
    const fieldName = activeProfile === 0 ? "profileImg" : "avatarUrl";

    try {
      // First, upload the file
      const formData = new FormData();
      formData.append("file", avatarFile);

      const uploadRes = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url; // Backend returns {url: "..."} directly

      // Then update the profile
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT", // Changed from PATCH to PUT
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: imageUrl, // Use uploaded URL
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile picture");

      // Refresh user data
      const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data);
      }

      closeAvatarModal();
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile picture");
    }
  };

  const handleSaveName = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You need to be logged in to update your profile");
      return;
    }

    const input = document.querySelector<HTMLInputElement>(
      'input[type="text"][placeholder="Enter your name"]'
    );
    const newName = input?.value?.trim();

    if (!newName) {
      alert("Please enter a name");
      return;
    }

    const endpoint = activeProfile === 0 ? "/api/users/me" : "/api/personas/me";
    const fieldName = activeProfile === 0 ? "name" : "displayName";

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: newName,
        }),
      });

      if (!res.ok) throw new Error("Failed to update name");

      // Refresh user data
      const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data);
      }

      setEditingName(false);
      alert("Name updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update name");
    }
  };

  const handleSaveBio = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You need to be logged in to update your profile");
      return;
    }

    const textarea = document.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder="Tell us about yourself..."]'
    );
    const newBio = textarea?.value?.trim() || "";

    const endpoint = activeProfile === 0 ? "/api/users/me" : "/api/personas/me";

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: newBio,
        }),
      });

      if (!res.ok) throw new Error("Failed to update bio");

      // Refresh user data
      const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data);
      }

      setEditingBio(false);
      alert("Bio updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update bio");
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  // Fetch user's products
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser?.id) return;

    const fetchMyProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const products = json.data || json;
          // Filter products owned by current user
          const myItems = products.filter(
            (p: Product) => p.seller?.id === currentUser.id
          );
          setMyProducts(myItems);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchMyProducts();
  }, [currentUser]);

  // Listen for activeProfile changes from Sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") {
        setActiveProfile(detail);
      }
    };
    window.addEventListener("activeProfileChanged", handler as EventListener);
    return () =>
      window.removeEventListener(
        "activeProfileChanged",
        handler as EventListener
      );
  }, []);

  // compute displayed profile
  const publicProfile = {
    name: currentUser?.name ?? "Kamado Tanjiro",
    studentId: currentUser?.studentId ?? "6506xxxxx",
    // keep avatar null when profileImg is null so UI can show a gray placeholder
    avatar: currentUser?.profileImg ?? null,
    // banner: use null when not provided so UI shows default gradient
    banner: currentUser?.bannerImg ?? null,
    // keep bio null when not set so UI can show 'No bio.' explicitly
    bio: currentUser?.bio ?? null,
    friendCount: currentUser?.friendCount ?? 0,
  };

  const anonymousProfile = {
    name: currentUser?.persona?.displayName ?? "Noobcat",
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
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setHoverBanner(true)}
              onMouseLeave={() => setHoverBanner(false)}
              onClick={() => setEditingBanner(true)}
            >
              {publicProfile.banner ? (
                // show provided banner image
                publicProfile.banner.startsWith("http") ? (
                  <div className="h-40 w-full relative">
                    <Image
                      loader={({ src }) => src}
                      src={normalizeImageUrl(publicProfile.banner)}
                      alt="banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full relative">
                    <Image
                      src={normalizeImageUrl(publicProfile.banner)}
                      alt="banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                )
              ) : (
                <div className="h-40 w-full bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200 flex items-center justify-center relative">
                  {/* Rainbow background (default when no banner) */}
                </div>
              )}
              {/* Hover overlay with pencil icon */}
              {hoverBanner && (
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-12 h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 013.182 0l.469.469a2.25 2.25 0 010 3.182l-9.75 9.75a4.5 4.5 0 01-1.591.939l-3.645 1.214a.75.75 0 01-.949-.949l1.214-3.645a4.5 4.5 0 01.939-1.591l9.75-9.75z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 7.125l-2.625-2.625"
                    />
                  </svg>
                </div>
              )}
            </div>
            {/* Profile Avatar - left aligned */}
            <div className="absolute left-10 top-28 flex items-center">
              <div
                className="rounded-full border-4 border-white p-1 bg-white relative cursor-pointer"
                onMouseEnter={() => setHoverAvatar(true)}
                onMouseLeave={() => setHoverAvatar(false)}
                onClick={() => setEditingAvatar(true)}
              >
                <Image
                  src={normalizeImageUrl(displayed.avatar) || DEFAULT_IMAGE}
                  alt={displayed.name}
                  width={90}
                  height={90}
                  className="w-[90px] h-[90px] rounded-full object-cover"
                />
                {/* Hover overlay with pencil icon */}
                {hoverAvatar && (
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 3.487a2.25 2.25 0 013.182 0l.469.469a2.25 2.25 0 010 3.182l-9.75 9.75a4.5 4.5 0 01-1.591.939l-3.645 1.214a.75.75 0 01-.949-.949l1.214-3.645a4.5 4.5 0 01.939-1.591l9.75-9.75z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 7.125l-2.625-2.625"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {/* Stats - right of avatar */}
              <div
                className="flex flex-col justify-center ml-6 relative"
                style={{ top: "18px" }}
              >
                <div className="flex gap-8">
                  <div className="text-center">
                    <span className="text-xl font-semibold">
                      {displayed.friendCount}
                    </span>
                    <span className="text-gray-500 ml-1">Friends</span>
                    {/* <span className="text-gray-500 ml-4">|</span> */}
                    {/* <span className="text-black-500 ml-4 font-semibold">65</span>
                    <span className="text-gray-500 ml-1">Engineers</span> */}
                  </div>
                </div>
              </div>
            </div>
            {/* Name & Verified */}
            <div
              className="flex items-center mt-20 ml-8 cursor-pointer group"
              onMouseEnter={() => setHoverName(true)}
              onMouseLeave={() => setHoverName(false)}
              onClick={() => setEditingName(true)}
            >
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
              {/* Pencil icon on hover */}
              {hoverName && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 ml-2 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 013.182 0l.469.469a2.25 2.25 0 010 3.182l-9.75 9.75a4.5 4.5 0 01-1.591.939l-3.645 1.214a.75.75 0 01-.949-.949l1.214-3.645a4.5 4.5 0 01.939-1.591l9.75-9.75z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 7.125l-2.625-2.625"
                  />
                </svg>
              )}
            </div>
            {/* Student id (only for public) */}
            {/* {activeProfile === 0 && (
              <div className="text-left text-gray-600 mt-2 px-8">@{publicProfile.studentId}</div>
            )} */}
            {/* Bio */}
            <div
              className="text-left text-gray-600 mt-2 px-8 cursor-pointer group flex items-center"
              onMouseEnter={() => setHoverBio(true)}
              onMouseLeave={() => setHoverBio(false)}
              onClick={() => setEditingBio(true)}
            >
              <span>{displayed.bio ?? "No bio."}</span>
              {/* Pencil icon on hover */}
              {hoverBio && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 ml-2 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 013.182 0l.469.469a2.25 2.25 0 010 3.182l-9.75 9.75a4.5 4.5 0 01-1.591.939l-3.645 1.214a.75.75 0 01-.949-.949l1.214-3.645a4.5 4.5 0 01.939-1.591l9.75-9.75z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 7.125l-2.625-2.625"
                  />
                </svg>
              )}
            </div>
            {/* Tabs */}
            <div className="flex justify-center mt-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "posts"
                    ? "text-gray-900 bg-gray-100 rounded-t-xl border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Your Posts
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "market"
                    ? "text-gray-900 bg-gray-100 rounded-t-xl border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Your Market Items
              </button>
              <button
                onClick={() => setActiveTab("reposts")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "reposts"
                    ? "text-gray-900 bg-gray-100 rounded-t-xl border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Reposts
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "likes"
                    ? "text-gray-900 bg-gray-100 rounded-t-xl border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Likes
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "saved"
                    ? "text-gray-900 bg-gray-100 rounded-t-xl border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Saved
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "posts" && (
                <div className="text-center text-gray-500 py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No posts yet</p>
                  <p className="text-sm mt-1">Your posts will appear here</p>
                </div>
              )}
              {activeTab === "market" && (
                <>
                  {myProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {myProducts.map((product) => (
                        <article
                          key={product.id}
                          className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col hover:shadow-lg transition-shadow"
                        >
                          {/* Product Image */}
                          <div className="w-full h-48">
                            <Image
                              src={
                                normalizeImageUrl(product.imageUrl) ||
                                "/noobcat.png"
                              }
                              alt={product.name}
                              width={300}
                              height={192}
                              className="w-full h-full object-cover rounded-t-xl"
                            />
                          </div>
                          {/* Card Content */}
                          <div className="flex-1 flex flex-col p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {product.description || "No description"}
                            </p>
                            {/* Price */}
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-lg font-semibold text-orange-600">
                                ฿{product.price}
                              </span>
                              {product.status === "sold" && (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                                  Sold
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No items listed yet</p>
                      <p className="text-sm mt-1">
                        Your market items will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
              {activeTab === "reposts" && (
                <div className="text-center text-gray-500 py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                    />
                  </svg>
                  <p className="text-lg font-medium">No reposts yet</p>
                  <p className="text-sm mt-1">Your reposts will appear here</p>
                </div>
              )}
              {activeTab === "likes" && (
                <div className="text-center text-gray-500 py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No liked posts yet</p>
                  <p className="text-sm mt-1">
                    Posts you like will appear here
                  </p>
                </div>
              )}
              {activeTab === "saved" && (
                <div className="text-center text-gray-500 py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No saved posts yet</p>
                  <p className="text-sm mt-1">
                    Posts you save will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      {/* Chat Window */}
      <ChatWindow />

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeBannerModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Edit Banner</h2>
            <div className="flex gap-6 mb-6">
              {/* Current banner */}
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Current</p>
                <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  {publicProfile.banner ? (
                    publicProfile.banner.startsWith("http") ? (
                      <Image
                        loader={({ src }) => src}
                        src={publicProfile.banner}
                        alt="current banner"
                        width={300}
                        height={128}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={publicProfile.banner}
                        alt="current banner"
                        width={300}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-pink-200 via-yellow-200 to-green-200"></div>
                  )}
                </div>
              </div>
              {/* New banner preview */}
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">New</p>
                <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  {newBannerPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newBannerPreview}
                      alt="new banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Preview</span>
                  )}
                </div>
              </div>
            </div>
            {/* Upload button */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
              >
                {bannerFile ? "Change Banner" : "Upload New Banner"}
              </label>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                onClick={handleSaveBanner}
              >
                Save
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={closeBannerModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Avatar Modal */}
      {editingAvatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeAvatarModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Edit Profile Picture</h2>
            <div className="flex gap-6 mb-6 justify-center">
              {/* Current avatar */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Current</p>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 mx-auto">
                  <Image
                    src={normalizeImageUrl(displayed.avatar) || DEFAULT_IMAGE}
                    alt="current"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* New avatar preview */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">New</p>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mx-auto overflow-hidden">
                  {newAvatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newAvatarPreview}
                      alt="new avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">Preview</span>
                  )}
                </div>
              </div>
            </div>
            {/* Upload button */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
              >
                {avatarFile ? "Change Picture" : "Upload New Picture"}
              </label>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                onClick={handleSaveAvatar}
              >
                Save
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={closeAvatarModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {editingName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setEditingName(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Edit Name</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue={displayed.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                placeholder="Enter your name"
              />
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                onClick={handleSaveName}
              >
                Save
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={() => setEditingName(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {editingBio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setEditingBio(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Edit Bio</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                defaultValue={displayed.bio ?? ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 min-h-[120px] resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                onClick={handleSaveBio}
              >
                Save
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={() => setEditingBio(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
