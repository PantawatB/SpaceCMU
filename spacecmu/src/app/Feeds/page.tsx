"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { API_BASE_URL } from '@/utils/apiConfig';
import ChatWindow from '@/components/ChatWindow';



export default function FeedsMainPage() {
  const [feedMode, setFeedMode] = useState("Global");
  const [showShareBar, setShowShareBar] = useState(true);
  const [postText, setPostText] = useState("");
  const [postMode, setPostMode] = useState<'public'|'friends'>('public');
  const [posting, setPosting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{postId: number, text: string, author: string}[]>([
    { postId: 0, text: "This is amazing!", author: "Nezuko"},
    { postId: 0, text: "Love this post!", author: "Zenitsu" },
    { postId: 1, text: "So cute!", author: "Inosuke" },
  ]);
  
  // Active profile mode: 0 = public, 1 = anonymous
  const [activeProfile, setActiveProfile] = useState<number>(0);

  // Sync activeProfile from localStorage on mount and listen for changes
  useEffect(() => {
    try {
      const v = localStorage.getItem('activeProfile');
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
      if (typeof detail === 'number') setActiveProfile(detail);
    };
    window.addEventListener('activeProfileChanged', handler as EventListener);
    return () => window.removeEventListener('activeProfileChanged', handler as EventListener);
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
    visibility: 'public' | 'friends';
    location?: string | null;
    author: {
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
  const token = localStorage.getItem('token');
  if (!token || !currentUser) return;

  const actorId = activeProfile === 1
    ? currentUser.persona?.actorId
    : currentUser.actorId;

  if (!actorId) {
    console.error("Sidebar: Could not determine actorId to fetch friends.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/friends/${actorId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch friends for sidebar');
    }

    const data: SidebarFriend[] = await res.json();
    setSidebarFriends(data);
  } catch (err) {
    console.error(err);
    setSidebarFriends([]); 
  }
};

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Fetch posts from API
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const response = await res.json();
        // API returns { data: [...] }, extract the array
        const data = response.data || response;
        // Ensure data is an array
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Posts data is not an array:', data);
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
    fetchSidebarFriends(); 
  }, [feedMode, currentUser, activeProfile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        alert('Please login to post');
        setPosting(false);
        return;
      }

      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      headers.Authorization = `Bearer ${token}`;

      // Prepare post data with isAnonymous flag based on active profile
      const postData = {
        content: postText,
        imageUrl: "", // Backend doesn't support image yet
        isAnonymous: activeProfile === 1, // true if anonymous mode
        visibility: postMode,
      };

      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(postData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Post failed');
      }

      // Clear the input
      setPostText('');
      
      // Reload the page to show new post
      window.location.reload();
    } catch (err: unknown) {
      console.error('Error creating post:', err);
      if (err instanceof Error) {
        alert(`Failed to create post: ${err.message}`);
      } else {
        alert('Failed to create post');
      }
    }
    setPosting(false);
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleReportClick = (postId: number) => {
    setReportPostId(postId);
    setShowReportModal(true);
    setOpenDropdownId(null);
  };

  const handleReportSubmit = () => {
    // TODO: Send report to API
    console.log(`Reporting post ${reportPostId} with feedback: ${reportText}`);
    setShowReportModal(false);
    setReportText("");
    setReportPostId(null);
  };

  const handleCommentClick = (postId: number) => {
    setCommentPostId(postId);
    setShowCommentModal(true);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim() || commentPostId === null) return;
    const newComment = {
      postId: commentPostId,
      text: commentText,
      author: activeProfile === 0 
        ? (currentUser?.name ?? "Anonymous")
        : (currentUser?.persona?.displayName ?? "Anonymous"),
      time: "Just now"
    };
    setComments([newComment, ...comments]);
    setCommentText("");
    setShowCommentModal(false);
    setCommentPostId(null);
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
          {Array.isArray(posts) && posts.map((post) => {
            // API returns author object with either name+profileImg (public) or displayName+avatarUrl (anonymous)
            const isPublicPost = !!post.author?.name;
            const authorName = isPublicPost ? post.author.name : post.author.displayName;
            const authorAvatar = isPublicPost ? post.author.profileImg : post.author.avatarUrl;
            const fallbackAvatar = isPublicPost ? "/tanjiro.jpg" : "/noobcat.png";
            
            return (
              <div
                key={`api-${post.id}`}
                className={"bg-gray-50 rounded-2xl p-6 shadow relative"}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={authorAvatar ?? fallbackAvatar}
                    alt={authorName ?? "avatar"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold">
                      {authorName ?? (isPublicPost ? "User" : "Anonymous")}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="mb-2 mt-2 text-base font-semibold">
                  {post.content}
                </div>
                {post.imageUrl && (
                  <div className="flex gap-3 mb-2">
                    <Image
                      src={post.imageUrl}
                      alt="post image"
                      width={480}
                      height={40}
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Post actions */}
                <div className="flex items-center justify-between text-gray-500 text-sm mt-6">
                  <div className="flex gap-6">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-pink-500 transition ${likedPosts.has(post.id) ? 'text-pink-500' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={likedPosts.has(post.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Like
                    </button>
                    <button 
                      onClick={() => handleCommentClick(post.id)}
                      className="flex items-center gap-1.5 hover:text-blue-500 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                      Comment
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-green-500 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                      </svg>
                      Repost
                    </button>
                  </div>
                  <button 
                    onClick={() => toggleSave(post.id)}
                    className={`flex items-center gap-1.5 hover:text-yellow-500 transition ${savedPosts.has(post.id) ? 'text-yellow-500' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={savedPosts.has(post.id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Save
                  </button>
                </div>
                
                {/* Dropdown menu */}
                <div className="absolute top-6 right-6 dropdown-container">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === post.id ? null : post.id)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ⋮
                  </button>
                  {openDropdownId === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => handleReportClick(post.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                        </svg>
                        Report Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Mock Posts - Show after API posts */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`mock-${i}`}
              className={"bg-gray-50 rounded-2xl p-6 shadow relative"}
            >
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={
                    i % 2 === 0
                      ? (currentUser?.profileImg ?? "/tanjiro.jpg")
                      : (currentUser?.persona?.avatarUrl ?? "/noobcat.png")
                  }
                  alt={i % 2 === 0 ? (currentUser?.name ?? "avatar") : (currentUser?.persona?.displayName ?? "avatar")}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">
                    {i % 2 === 0
                      ? (currentUser?.name ?? "Kamado Tanjiro")
                      : (currentUser?.persona?.displayName ?? "Noobcat")}
                  </div>
                  {/* <div className="text-xs text-gray-400">
                    {i % 2 === 0 ? "65,Engineering" : "Anonymous"}
                  </div> */}
                  {/* <div className="text-xs text-gray-400">{i + 1} hours ago</div> */}
                </div>
              </div>
              <div className="mb-2 mt-2 text-base font-semibold">
                {i % 2 === 0
                  ? "I love my family so much!"
                  : "Just chilling and enjoying life."}
              </div>
              <div className="flex gap-3 mb-2">
                <Image
                  src={
                    i % 2 === 0 ? "/tanjiro_with_family.webp" : "/cat-post.jpg"
                  }
                  alt="avatar"
                  width={480}
                  height={40}
                  className="object-cover"
                />
              </div>

              {/* Post actions */}
              <div className="flex items-center justify-between text-gray-500 text-sm mt-6">
                <div className="flex gap-6">
                  <button 
                    onClick={() => toggleLike(i)}
                    className={`flex items-center gap-1.5 hover:text-pink-500 transition ${likedPosts.has(i) ? 'text-pink-500' : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={likedPosts.has(i) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    Like
                  </button>
                  <button 
                    onClick={() => handleCommentClick(i)}
                    className="flex items-center gap-1.5 hover:text-blue-500 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    Comment
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-green-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                    </svg>
                    Repost
                  </button>
                </div>
                <button 
                  onClick={() => toggleSave(i)}
                  className={`flex items-center gap-1.5 hover:text-yellow-500 transition ${savedPosts.has(i) ? 'text-yellow-500' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={savedPosts.has(i) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  Save
                </button>
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute top-6 right-6 dropdown-container">
                <button 
                  onClick={() => setOpenDropdownId(openDropdownId === i ? null : i)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ⋮
                </button>
                {openDropdownId === i && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => handleReportClick(i)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                      </svg>
                      Report Post
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                <Image
                  src={activeProfile === 0 
                    ? (currentUser?.profileImg ?? "/tanjiro.jpg")
                    : (currentUser?.persona?.avatarUrl ?? "/noobcat.png")
                  }
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />

                <input
                  type="text"
                  placeholder="Share something"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full bg-white text-gray-500 border-none outline-none text-lg"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-6 items-center">
                  <div className="relative">
                    <select value={postMode} onChange={(e) => setPostMode(e.target.value as 'public'|'friends')}
                      className="px-3 py-2 border rounded-md bg-white text-sm">
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSend} disabled={posting}
                  className="bg-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-800 transition">
                  {posting ? 'Sending...' : 'Send'}
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
              sidebarFriends.map((friend) => (
                <li key={friend.actorId} className="flex items-center gap-3">
                  {friend.profileImg ? (
                    <Image
                      src={friend.profileImg}
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
              ))
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
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
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
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Report Post</h2>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="What's Your Feedback?"
              className="w-full h-40 p-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none mb-6"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-2xl">😃</span>
                </button>
                <button
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <span className="text-2xl">🥲</span>
                </button>
              </div>
              <button
                onClick={handleReportSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white pl-6 pr-4 py-3 rounded-full flex items-center gap-2 transition"
              >
                <span className="font-semibold">Send</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
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
              {comments
                .filter(comment => comment.postId === commentPostId)
                .map((comment, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author}</span>
                       
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              {comments.filter(comment => comment.postId === commentPostId).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Write Comment Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <Image
                  src={activeProfile === 0 
                    ? (currentUser?.profileImg ?? "/tanjiro.jpg")
                    : (currentUser?.persona?.avatarUrl ?? "/noobcat.png")
                  }
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover flex-shrink-0"
                />
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
                      disabled={!commentText.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold text-sm transition"
                    >
                      Post Comment
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
