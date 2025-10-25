"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { API_BASE_URL, normalizeImageUrl } from "@/utils/apiConfig";
import ChatWindow from "@/components/ChatWindow";
import PostCard from "@/components/PostCard";

export default function FeedsMainPage() {
  const [feedMode, setFeedMode] = useState("Global");
  const [showShareBar, setShowShareBar] = useState(true);
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [postMode, setPostMode] = useState<"public" | "friends">("public");
  const [posting, setPosting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<number>>(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | string | null>(
    null
  );
  const [commentText, setCommentText] = useState("");

  type ApiComment = {
    id: string;
    content: string;
    createdAt: string;
    author: {
      type: "user" | "persona";
      actorId: string;
      name: string;
      profileImg?: string | null;
      avatarUrl?: string | null;
    };
  };

  const [currentComments, setCurrentComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentPosting, setCommentPosting] = useState(false);

  // Active profile mode: 0 = public, 1 = anonymous
  const [activeProfile, setActiveProfile] = useState<number>(0);

  // Sync activeProfile from localStorage on mount and listen for changes
  useEffect(() => {
    try {
      const v = localStorage.getItem("activeProfile");
      if (v) {
        const parsed = parseInt(v, 10);
        if (!Number.isNaN(parsed)) setActiveProfile(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for activeProfile changes from Sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setActiveProfile(detail);
    };
    window.addEventListener("activeProfileChanged", handler as EventListener);
    return () =>
      window.removeEventListener(
        "activeProfileChanged",
        handler as EventListener
      );
  }, []);

  // Chat is handled by the shared ChatWindow component (imported below)

  // Current logged-in user (fetched from API)
  type Persona = {
    id?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    changeCount?: number;
    lastChangedAt?: string | null;
    isBanned?: boolean;
    actorId?: string | null;
  };
  type CurrentUser = {
    id?: string;
    studentId?: string | null;
    email?: string | null;
    name?: string | null;
    bio?: string | null;
    isAdmin?: boolean;
    profileImg?: string | null;
    friendCount?: number;
    actorId?: string | null;
    persona?: Persona | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  // Post type from API
  type Post = {
    id: number;
    content: string;
    imageUrl?: string | null;
    visibility: "public" | "friends";
    location?: string | null;
    author: {
      type?: "user" | "persona";
      name?: string;
      profileImg?: string | null;
      avatarUrl?: string | null;
      displayName?: string;
    };
    actorId: string;
    likeCount?: number;
    repostCount?: number;
    saveCount?: number;
    createdAt: string;
    updatedAt: string;
  };
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);

  type SidebarFriend = {
    actorId: string;
    name: string;
    profileImg?: string | null;
  };
  const [sidebarFriends, setSidebarFriends] = useState<SidebarFriend[]>([]);

  const fetchSidebarFriends = async () => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) {
      console.error("Sidebar: Could not determine actorId to fetch friends.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/${actorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friends for sidebar");
      }

      const data: SidebarFriend[] = await res.json();
      setSidebarFriends(data);
    } catch (err) {
      console.error(err);
      setSidebarFriends([]);
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Fetch posts from API
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser) return;

    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        let data: Post[] = [];
        let url = "";

        if (feedMode === "Friends") {
          // Friends tab - ดึงโพสต์จากเพื่อน
          const actorId = activeProfile === 1 
            ? currentUser.persona?.actorId 
            : currentUser.actorId;

          if (!actorId) {
            console.error("Could not determine actorId for Friends feed");
            setPosts([]);
            setPostsLoading(false);
            return;
          }

          url = `${API_BASE_URL}/api/posts/feed/friends/${actorId}`;
          console.log("🔗 Fetching Friends feed from:", url);
        } else {
          // Global tab - ใช้ API endpoint /api/posts/feed/public
          url = `${API_BASE_URL}/api/posts/feed/public`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${feedMode.toLowerCase()} posts`);
        }

        const response = await res.json();
        data = response.data || response;

        // ตรวจสอบว่าข้อมูลเป็น array
        if (Array.isArray(data)) {
          // แสดงโพสต์ตามโหมด
          const mode = feedMode === "Global" ? "Global Feed" : "Friends Feed";
          console.log(`📝 ${mode}: Posts fetched from API:`, data.length, "posts");
          
          // Debug: แสดง author info ของโพสต์แรก
          if (data.length > 0) {
            console.log("🔍 First post author info:", {
              type: data[0].author?.type,
              name: data[0].author?.name,
              displayName: data[0].author?.displayName,
              profileImg: data[0].author?.profileImg,
              avatarUrl: data[0].author?.avatarUrl,
            });
          }
          setPosts(data);
        } else {
          console.error("Posts data is not an array:", data);
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
    fetchSidebarFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedMode, currentUser, activeProfile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!currentUser || !token) return;

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) return;

    const fetchInteractions = async (
      interactionType: "likes" | "reposts" | "saved"
    ) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/actor/${actorId}/${interactionType}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch ${interactionType}`);

        const response = await res.json();
        const data = response.data || [];

        if (Array.isArray(data)) {
          const postIds = new Set(data.map((post: Post) => post.id));

          if (interactionType === "likes") setLikedPosts(postIds);
          if (interactionType === "reposts") setRepostedPosts(postIds);
          if (interactionType === "saved") setSavedPosts(postIds);
        } else {
          console.error(
            `Fetched ${interactionType} data is not an array:`,
            data
          );
        }
      } catch (err) {
        console.error(`Error fetching ${interactionType}:`, err);
      }
    };

    fetchInteractions("likes");
    fetchInteractions("reposts");
    fetchInteractions("saved");
  }, [currentUser, activeProfile]);

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

  const handleSend = async () => {
    if (!postText.trim()) return;
    setPosting(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("Please login to post");
        setPosting(false);
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        // upload image to /api/uploads
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("Image upload failed");
        }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      headers.Authorization = `Bearer ${token}`;

      const postData = {
        content: postText,
        imageUrl,
        visibility: postMode, // "public" หรือ "friends"
        isAnonymous: activeProfile === 1, // ส่ง isAnonymous = true เมื่ออยู่ในโหมด Anonymous
      };

      console.log("📤 Creating post with data:", {
        visibility: postData.visibility,
        isAnonymous: postData.isAnonymous,
        activeProfile: activeProfile,
        postMode: postMode,
      });

      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Post failed");
      }

      setPostText("");
      setImageFile(null);
      setImagePreview("");
      window.location.reload();
    } catch (err) {
      console.error("Error creating post:", err);
      if (err instanceof Error) {
        alert(`Failed to create post: ${err.message}`);
      } else {
        alert("Failed to create post");
      }
    }
    setPosting(false);
  };

  const handleInteraction = async (
    postId: number,
    action: "like" | "repost" | "save",
    stateSet: Set<number>,
    setter: React.Dispatch<React.SetStateAction<Set<number>>>
  ) => {
    const token = localStorage.getItem("token");
    if (!currentUser || !token) {
      alert("Please login to interact.");
      return;
    }

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) {
      console.error("Could not find active actorId");
      return;
    }

    const countProperty: keyof Post =
      action === "like"
        ? "likeCount"
        : action === "repost"
        ? "repostCount"
        : "saveCount";

    const isCurrentlyActive = stateSet.has(postId);
    const method = isCurrentlyActive ? "DELETE" : "POST";
    const url = `${API_BASE_URL}/api/posts/${postId}/${action}`;

    const oldStateSet = new Set(stateSet);
    const oldPostsState = [...posts];

    const newSet = new Set(stateSet);
    if (isCurrentlyActive) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    setter(newSet);

    setPosts((currentPosts) =>
      currentPosts.map((p) => {
        if (p.id === postId) {
          const currentCount = (p[countProperty] as number) || 0;
          const newCount = currentCount + (isCurrentlyActive ? -1 : 1);

          return {
            ...p,
            [countProperty]: newCount < 0 ? 0 : newCount,
          };
        }
        return p;
      })
    );

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actorId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} post`);
      }
    } catch (err) {
      console.error(err);
      setter(oldStateSet);
      setPosts(oldPostsState);
    }
  };

  const toggleLike = (postId: number) => {
    handleInteraction(postId, "like", likedPosts, setLikedPosts);
  };

  const toggleSave = (postId: number) => {
    handleInteraction(postId, "save", savedPosts, setSavedPosts);
  };

  const toggleRepost = (postId: number) => {
    handleInteraction(postId, "repost", repostedPosts, setRepostedPosts);
  };

  const handleReportClick = (postId: number) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleReportSubmit = () => {
    console.log(`Reporting post ${reportPostId} with feedback: ${reportText}`);
    setShowReportModal(false);
    setReportText("");
    setReportPostId(null);
  };

  const handleCommentClick = async (postId: string | number) => {
    setCommentPostId(postId);
    setShowCommentModal(true);
    setCurrentComments([]);
    setCommentText("");

    // แปลง postId เป็น string ถ้าเป็น number
    const postIdStr = typeof postId === "number" ? String(postId) : postId;
    await fetchCommentsForPost(postIdStr);
  };

  const fetchCommentsForPost = async (postId: string | number) => {
    setCommentsLoading(true);
    setCurrentComments([]);
    try {
      // แปลง postId เป็น string ถ้าเป็น number
      const postIdStr = typeof postId === "number" ? String(postId) : postId;

      const res = await fetch(`${API_BASE_URL}/api/posts/${postIdStr}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const response = await res.json();
      const data = response.data || [];
      if (Array.isArray(data)) {
        console.log("💬 Comments fetched:", data.length, "comments");
        if (data.length > 0) {
          console.log("🔍 First comment author info:", {
            type: data[0].author?.type,
            name: data[0].author?.name,
            profileImg: data[0].author?.profileImg,
            avatarUrl: data[0].author?.avatarUrl,
          });
        }
        setCurrentComments(data as ApiComment[]);
      } else {
        console.error("API Comments data is not an array:", data);
        setCurrentComments([]);
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setCurrentComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || commentPostId === null) return;

    const token = localStorage.getItem("token");
    if (!currentUser || !token) {
      alert("Please login to comment");
      return;
    }

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) {
      console.error("Could not find active actorId for commenting");
      return;
    }

    setCommentPosting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/posts/${commentPostId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: commentText,
            actorId: actorId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to post comment");
      }

      setCommentText("");
      await fetchCommentsForPost(commentPostId);
    } catch (err) {
      console.error(err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setCommentPosting(false);
    }
  };

  const handleDeletePost = async (postIdToDelete: string | number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!currentUser || !token) {
      alert("Please login to delete posts.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postIdToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You are not authorized to delete this post.");
        }
        throw new Error("Failed to delete post. Please try again.");
      }

      setPosts((currentPosts) =>
        currentPosts.filter((p) => p.id != postIdToDelete)
      );
      alert("Post deleted successfully.");
    } catch (err) {
      console.error("Error deleting post:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred while deleting the post.");
      }
    }
  };

  const handleDeleteComment = async (commentIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!currentUser || !token) {
      alert("Please login to delete comments.");
      return;
    }

    if (commentPostId === null) {
      console.error("Cannot delete comment: commentPostId is null.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/posts/${commentPostId}/comments/${commentIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 403) {
          throw new Error(
            errorData?.message ||
              "You are not authorized to delete this comment."
          );
        }
        throw new Error(errorData?.message || "Failed to delete comment.");
      }

      setCurrentComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentIdToDelete)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred while deleting the comment.");
      }
    }
  };

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
          {postsLoading && (
            <div className="text-center py-8 text-gray-400">
              Loading posts...
            </div>
          )}

          {/* API Posts - Show first (newest on top) */}
          {Array.isArray(posts) &&
            posts
              .filter(
                (post) =>
                  feedMode !== "Global" ||
                  post.visibility === "public" ||
                  (post.visibility === "friends" &&
                    (sidebarFriends.some(
                      (friend) => friend.actorId === post.actorId
                    ) ||
                      post.actorId ===
                        (activeProfile === 1
                          ? currentUser?.persona?.actorId
                          : currentUser?.actorId)))
              )
              .map((post) => (
                <PostCard
                  key={`api-${post.id}`}
                  post={post}
                  currentUser={currentUser}
                  isLiked={likedPosts.has(post.id)}
                  isSaved={savedPosts.has(post.id)}
                  isReposted={repostedPosts.has(post.id)}
                  onLike={toggleLike}
                  onSave={toggleSave}
                  onRepost={toggleRepost}
                  onComment={handleCommentClick}
                  onDelete={handleDeletePost}
                  onReport={handleReportClick}
                />
              ))}
        </section>
        {/* Share something bar - fixed bottom, larger size, toggle show/hide with arrow icon */}
        <div
          className={`fixed left-80 right-80 bottom-6 z-10 flex flex-col items-center ${
            showShareBar ? "" : "bg-transparent p-0 shadow-none"
          }`}
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
                {activeProfile === 0 ? (
                  currentUser?.profileImg ? (
                    <Image
                      src={
                        normalizeImageUrl(currentUser.profileImg) ||
                        "/tanjiro.jpg"
                      }
                      alt="avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )
                ) : currentUser?.persona?.avatarUrl ? (
                  <Image
                    src={
                      normalizeImageUrl(currentUser.persona.avatarUrl) ||
                      "/noobcat.png"
                    }
                    alt="avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}

                <input
                  type="text"
                  placeholder="Share something"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full bg-white text-gray-500 border-none outline-none text-lg"
                />
              </div>
              {imagePreview && (
                <div className="mt-2 relative">
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={160}
                    height={160}
                    className="max-h-40 rounded-lg object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2 items-center">
                  <div className="relative flex items-center">
                    <select
                      value={postMode}
                      onChange={(e) =>
                        setPostMode(e.target.value as "public" | "friends")
                      }
                      className="px-3 py-2 border rounded-md bg-white text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                    </select>
                    {/* ปุ่มอัปโหลดรูปภาพแบบ custom อยู่ขวาของ select */}
                    <label
                      className="ml-4 cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                      title="Add image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5l4.72-4.72a2.25 2.25 0 013.18 0l2.4 2.4a2.25 2.25 0 003.18 0L21 10.5"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 9.75h.008v.008H16.5V9.75z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImageFile(null);
                            setImagePreview("");
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={posting}
                  className="bg-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-800 transition"
                >
                  {posting ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Right Section: Friends (no border) */}
      <aside className="w-80 p-8 bg-white flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Friends</h2>
          <ul className="space-y-4">
            {sidebarFriends.length > 0 ? (
              sidebarFriends.map((friend) => {
                const normalizedImg = normalizeImageUrl(friend.profileImg);
                return (
                  <li key={friend.actorId} className="flex items-center gap-3">
                    {normalizedImg ? (
                      <Image
                        src={normalizedImg}
                        alt={friend.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    )}
                    <div>
                      <div className="font-medium">{friend.name}</div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-sm text-gray-500">No friends to show.</li>
            )}
          </ul>
        </div>
      </aside>

      {/* Chat Window */}
      <ChatWindow />

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false);
              setReportText("");
            }
          }}
        >
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportText("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">
              Report Post
            </h2>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="What's Your Feedback?"
              className="w-full h-40 p-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none mb-6"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                  <span className="text-2xl">😃</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                  <span className="text-2xl">🥲</span>
                </button>
              </div>
              <button
                onClick={handleReportSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white pl-6 pr-4 py-3 rounded-full flex items-center gap-2 transition"
              >
                <span className="font-semibold">Send</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCommentModal(false);
              setCommentText("");
            }
          }}
        >
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => {
                setShowCommentModal(false);
                setCommentText("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Comments</h2>

            {/* Comments List - Scrollable */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
              {commentsLoading && (
                <div className="text-center text-gray-400 py-8">
                  Loading comments...
                </div>
              )}
              {!commentsLoading &&
                currentComments.map((comment) => {
                  const isUserComment = comment.author.type === "user";
                  const authorAvatar = isUserComment
                    ? normalizeImageUrl(comment.author.profileImg) ?? "/tanjiro.jpg"
                    : normalizeImageUrl(comment.author.avatarUrl) ?? "/noobcat.png";
                  
                  const authorName = isUserComment
                    ? comment.author.name
                    : comment.author.name; // API ส่งมาใน field name ทั้ง user และ persona

                  const canDelete =
                    currentUser?.isAdmin ||
                    comment.author.actorId === currentUser?.actorId ||
                    comment.author.actorId === currentUser?.persona?.actorId;

                  return (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-gray-50 rounded-xl relative group"
                    >
                      <Image
                        src={authorAvatar}
                        alt={authorName || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {authorName || (isUserComment ? "User" : "Anonymous")}
                          </span>
                          <span className="text-xs text-gray-400">
                            ·{" "}
                            {new Date(comment.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                      </div>

                      {/* 🟢 Delete Button - Show conditionally */}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" // Hidden until hover
                          title="Delete comment"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              {!commentsLoading && currentComments.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Write Comment Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                {activeProfile === 0 ? (
                  currentUser?.profileImg ? (
                    <Image
                      src={
                        normalizeImageUrl(currentUser.profileImg) ||
                        "/tanjiro.jpg"
                      }
                      alt="avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )
                ) : currentUser?.persona?.avatarUrl ? (
                  <Image
                    src={
                      normalizeImageUrl(currentUser.persona.avatarUrl) ||
                      "/noobcat.png"
                    }
                    alt="avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim() || commentPosting}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold text-sm transition"
                    >
                      {commentPosting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
