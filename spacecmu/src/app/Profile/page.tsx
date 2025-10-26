"use client";

import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import ChatWindow from "@/components/ChatWindow";
import { normalizeImageUrl } from "@/utils/apiConfig";
import PostCard from "@/components/PostCard";

type Persona = {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  friendCount?: number;
  bannerImg?: string;
  actorId?: string;
};
type CurrentUser = {
  id?: string;
  name?: string;
  studentId?: string;
  profileImg?: string;
  bannerImg?: string;
  bio?: string | null;
  actorId?: string;
  persona?: Persona;
  friendCount?: number;
  isAdmin?: boolean;
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

type Post = {
  id: string;
  actorId: string;
  actorType: "user" | "persona";
  content: string;
  imageUrl?: string;
  visibility: "public" | "friends";
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  saveCount?: number;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    type?: "user" | "persona";
    name?: string;
    profileImg?: string | null;
    avatarUrl?: string | null;
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
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

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
  // Product edit modal states
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductModalId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });

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

  // Product image upload
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);

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

      if (!uploadRes || !uploadRes.ok) {
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

      // Refresh user data based on active profile
      if (activeProfile === 0) {
        // Refresh public profile only
        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser((prev) => ({
            ...prev,
            ...userData,
            // Keep persona data unchanged
            persona: prev?.persona,
          }));
        }
      } else {
        // Refresh anonymous profile only
        const personaRes = await fetch(`${API_BASE_URL}/api/personas/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (personaRes.ok) {
          const personaData = await personaRes.json();
          setCurrentUser((prev) => ({
            ...prev,
            // Update only persona data, keep user data unchanged
            persona: personaData,
          }));
        }
      }

      closeBannerModal();
      alert("Banner updated successfully!");
    } catch {
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

      // Refresh user data based on active profile
      if (activeProfile === 0) {
        // Refresh public profile only
        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser((prev) => ({
            ...prev,
            ...userData,
            // Keep persona data unchanged
            persona: prev?.persona,
          }));
        }
      } else {
        // Refresh anonymous profile only
        const personaRes = await fetch(`${API_BASE_URL}/api/personas/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (personaRes.ok) {
          const personaData = await personaRes.json();
          setCurrentUser((prev) => ({
            ...prev,
            // Update only persona data, keep user data unchanged
            persona: personaData,
          }));
        }
      }

      closeAvatarModal();
      alert("Profile picture updated successfully!");
    } catch {
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
    } catch {
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
    } catch {
      alert("Failed to update bio");
    }
  };

  // Handle edit product
  const handleEditProduct = (productId: string) => {
    // Find the product from the local state (myProducts)
    const product = myProducts.find((p) => p.id === productId);
    
    if (!product) {
      alert("Product not found");
      return;
    }

    // Set the form data with the product's current values
    setProductFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      image: product.imageUrl || "",
    });
    
    setEditingProductModalId(productId);
    setIsEditProductModalOpen(true);
  };

  // Handle save product
  const handleSaveProduct = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      // Step 1: Update image first (if image URL exists and is not the original)
      const originalProduct = myProducts.find((p) => p.id === editingProductId);
      const imageChanged = originalProduct && productFormData.image !== originalProduct.imageUrl;

      if (imageChanged && productFormData.image) {
        const imageRes = await fetch(
          `${API_BASE_URL}/api/products/${editingProductId}/image`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: productFormData.image,
            }),
          }
        );

        if (!imageRes.ok) {
          throw new Error("Failed to update product image");
        }
      }

      // Step 2: Update other product details
      const formData = new FormData();
      formData.append("name", productFormData.name);
      formData.append("description", productFormData.description);
      formData.append("price", productFormData.price);

      const res = await fetch(
        `${API_BASE_URL}/api/products/${editingProductId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      alert("Product updated successfully!");
      setIsEditProductModalOpen(false);
      setEditingProductModalId(null);

      // Refresh products - use the same method as initial fetch
      const productsRes = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (productsRes.ok) {
        const json = await productsRes.json();
        const products = json.data || json;
        // Filter products owned by current user
        const myItems = products.filter(
          (p: Product) => p.seller?.id === currentUser?.id
        );
        setMyProducts(myItems);
      }
    } catch {
      alert("Failed to update product");
    }
  };

  // Handle product image upload
  const handleProductImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProductImage(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("Please log in to upload images");
        setIsUploadingProductImage(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.url || data.imageUrl;
        
        // Use functional update to avoid stale state
        setProductFormData((prev) => ({
          ...prev,
          image: imageUrl,
        }));
        
        alert("Image uploaded successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to upload image: ${errorData.message || res.statusText}`);
      }
    } catch {
      alert("Failed to upload image. Please check your connection.");
    } finally {
      setIsUploadingProductImage(false);
      // Reset the file input so the same file can be selected again if needed
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("You must be logged in.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove from local state
      setMyProducts((prev) => prev.filter((p) => p.id !== productId));

      alert("Product deleted successfully");
    } catch {
      alert("Failed to delete product");
    }
  };

  // --- Post Interaction Handlers ---
  // States for tracking post interactions
  const [likedPostsSet, setLikedPostsSet] = useState<Set<string>>(new Set());
  const [savedPostsSet, setSavedPostsSet] = useState<Set<string>>(new Set());
  const [repostedPostsSet, setRepostedPostsSet] = useState<Set<string>>(new Set());

  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentPosting, setCommentPosting] = useState(false);

  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [reportText, setReportText] = useState("");

  type Comment = {
    id: string;
    content: string;
    authorId: string;
    author?: {
      type?: "user" | "persona";
      name?: string;
      profileImg?: string | null;
      avatarUrl?: string | null;
      avatar?: string | null; // เพิ่ม avatar field จาก API
      actorId?: string;
    };
    authorName?: string;
    authorAvatar?: string;
    createdAt: string;
  };

  const handleInteraction = async (
    postId: string,
    action: "like" | "repost" | "save",
    stateSet: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    updatePostsInTab: (postId: string, countProperty: string, delta: number) => void
  ) => {
    const token = localStorage.getItem("token");
    if (!currentUser || !token) {
      alert("Please login to interact.");
      return;
    }

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) {
      return;
    }

    const countProperty =
      action === "like"
        ? "likeCount"
        : action === "repost"
        ? "repostCount"
        : "saveCount";

    const isCurrentlyActive = stateSet.has(postId);
    const method = isCurrentlyActive ? "DELETE" : "POST";
    const url = `${API_BASE_URL}/api/posts/${postId}/${action}`;

    const oldStateSet = new Set(stateSet);
    const newSet = new Set(stateSet);
    if (isCurrentlyActive) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    setter(newSet);

    // Optimistically update UI
    const delta = isCurrentlyActive ? -1 : 1;
    updatePostsInTab(postId, countProperty, delta);

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
      // Revert on error
      setter(oldStateSet);
      updatePostsInTab(postId, countProperty, -delta);
    }
  };

  const updatePostsInAllTabs = (postId: number | string, countProperty: string, delta: number) => {
    const updateFn = (posts: Post[]) =>
      posts.map((p) => {
        if (String(p.id) === String(postId)) {
          const currentCount = (p as Record<string, unknown>)[countProperty] as number || 0;
          const newCount = currentCount + delta;
          return { ...p, [countProperty]: newCount < 0 ? 0 : newCount };
        }
        return p;
      });

    setMyPosts(updateFn);
    setLikedPosts(updateFn);
    setRepostedPosts(updateFn);
    setSavedPosts(updateFn);
  };

  const toggleLike = (postId: string) => {
    handleInteraction(postId, "like", likedPostsSet, setLikedPostsSet, updatePostsInAllTabs);
  };

  const toggleSave = (postId: string) => {
    handleInteraction(postId, "save", savedPostsSet, setSavedPostsSet, updatePostsInAllTabs);
  };

  const toggleRepost = (postId: string) => {
    handleInteraction(postId, "repost", repostedPostsSet, setRepostedPostsSet, updatePostsInAllTabs);
  };

  const handleReportClick = (postId: string) => {
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    if (reportPostId === null) {
      setShowReportModal(false);
      setReportText("");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/posts/${reportPostId}/report`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback: reportText }),
        });
      }
    } catch {
      // Error submitting report
    } finally {
      setShowReportModal(false);
      setReportText("");
      setReportPostId(null);
    }
  };

  const handleCommentClick = async (postId: string | number) => {
    setCommentPostId(postId);
    setShowCommentModal(true);
    setCurrentComments([]);
    setCommentText("");

    if (typeof postId === "string") {
      await fetchCommentsForPost(postId);
    }
  };

  const fetchCommentsForPost = async (postId: string | number) => {
    setCommentsLoading(true);
    setCurrentComments([]);
    try {
      if (typeof postId !== "string") {
        setCommentsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setCommentsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });        if (res.ok) {
          const data = await res.json();
          setCurrentComments(data.data || data || []);
        }
      } catch {
        // Error fetching comments
      }
    setCommentsLoading(false);
  };

  const handleCommentSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!commentPostId || !token || !currentUser) {
      return;
    }

    const actorId =
      activeProfile === 1 ? currentUser.persona?.actorId : currentUser.actorId;

    if (!actorId) {
      return;
    }

    setCommentPosting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${commentPostId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentText,
          actorId: actorId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit comment");
      }

      setCommentText("");
      if (typeof commentPostId === "string") {
        await fetchCommentsForPost(commentPostId);
      }

      // Update comment count
      updatePostsInAllTabs(Number(commentPostId), "commentCount", 1);
    } catch {
      alert("Failed to submit comment");
    } finally {
      setCommentPosting(false);
    }
  };

  const handleDeletePost = async (postIdToDelete: string | number) => {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postIdToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      // Remove from all tab arrays
      setMyPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
      setLikedPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
      setRepostedPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));
      setSavedPosts((prev) => prev.filter((p) => p.id !== postIdToDelete));

      alert("Post deleted successfully");
    } catch {
      alert("Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentIdToDelete: string) => {
    const token = localStorage.getItem("token");
    if (!token || !commentPostId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/posts/${commentPostId}/comments/${commentIdToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove from local state
      setCurrentComments((prev) => prev.filter((c) => c.id !== commentIdToDelete));

      // Decrement comment count
      updatePostsInAllTabs(Number(commentPostId), "commentCount", -1);

      alert("Comment deleted successfully");
    } catch {
      alert("Failed to delete comment");
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
      } catch {
        // Error fetching user
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
      } catch {
        // Error fetching products
      }
    };
    fetchMyProducts();
  }, [currentUser]);

  // Fetch user's posts
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser) return;

    const actorId =
      activeProfile === 0 ? currentUser.actorId : currentUser.persona?.actorId;

    if (!actorId) {
      return;
    }

    const fetchMyPosts = async () => {
      try {
        const url = `${API_BASE_URL}/api/posts/actor/${actorId}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setMyPosts(json.data || json);
        }
      } catch {
        // Error fetching posts
      }
    };
    fetchMyPosts();
  }, [currentUser, activeProfile]);

  // Fetch user's liked posts
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser) return;

    const actorId =
      activeProfile === 0 ? currentUser.actorId : currentUser.persona?.actorId;
    if (!actorId) return;

    const fetchLikes = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/actor/${actorId}/likes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const json = await res.json();
          const posts = json.data || json;
          setLikedPosts(posts);
          // Update liked posts set
          const likedSet = new Set<string>(posts.map((p: Post) => String(p.id)));
          setLikedPostsSet(likedSet);
        }
      } catch {
        // Error fetching liked posts
      }
    };
    fetchLikes();
  }, [currentUser, activeProfile]);

  // Fetch user's reposts
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser) return;

    const actorId =
      activeProfile === 0 ? currentUser.actorId : currentUser.persona?.actorId;
    if (!actorId) return;

    const fetchReposts = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/actor/${actorId}/reposts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const json = await res.json();
          const posts = json.data || json;
          setRepostedPosts(posts);
          // Update reposted posts set
          const repostedSet = new Set<string>(posts.map((p: Post) => String(p.id)));
          setRepostedPostsSet(repostedSet);
        }
      } catch {
        // Error fetching reposts
      }
    };
    fetchReposts();
  }, [currentUser, activeProfile]);

  // Fetch user's saved posts
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !currentUser) return;

    const actorId =
      activeProfile === 0 ? currentUser.actorId : currentUser.persona?.actorId;
    if (!actorId) return;

    const fetchSaved = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/actor/${actorId}/saved`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const json = await res.json();
          const posts = json.data || json;
          setSavedPosts(posts);
          // Update saved posts set
          const savedSet = new Set<string>(posts.map((p: Post) => String(p.id)));
          setSavedPostsSet(savedSet);
        }
      } catch {
        // Error fetching saved posts
      }
    };
    fetchSaved();
  }, [currentUser, activeProfile]);

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
    // Use only persona's banner (not shared with public)
    banner: currentUser?.persona?.bannerImg ?? null,
    bio: currentUser?.persona?.bio ?? null,
    friendCount: currentUser?.persona?.friendCount ?? 0,
  };

  const displayed = activeProfile === 0 ? publicProfile : anonymousProfile;

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* Sidebar - keep it fixed/sticky so only main scrolls */}
      <div className="h-screen sticky top-0 self-start">
        <Sidebar menuItems={menuItems} />
      </div>
      {/* Main Content */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
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
              {/* Hide Market tab in Anonymous mode */}
              {activeProfile === 0 && (
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
              )}
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
                <>
                  {myPosts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {myPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isLiked={likedPostsSet.has(post.id)}
                          isSaved={savedPostsSet.has(post.id)}
                          isReposted={repostedPostsSet.has(post.id)}
                          toggleLike={toggleLike}
                          toggleSave={toggleSave}
                          toggleRepost={toggleRepost}
                          handleCommentClick={handleCommentClick}
                          handleDeletePost={handleDeletePost}
                          handleReportClick={handleReportClick}
                        />
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
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No posts yet</p>
                      <p className="text-sm mt-1">Your posts will appear here</p>
                    </div>
                  )}
                </>
              )}
              {activeTab === "market" && (
                <>
                  {myProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {myProducts.map((product) => (
                        <article
                          key={product.id}
                          className="bg-white rounded-xl shadow-md w-full max-w-[300px] mx-auto mb-8 border border-gray-100 flex flex-col h-[380px] overflow-hidden relative"
                        >
                          {/* Delete Button - Top Right */}
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                            title="Delete product"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          {/* Product Image */}
                          <div className="w-full h-48">
                            {product.imageUrl ? (
                              <Image
                                src={normalizeImageUrl(product.imageUrl)}
                                alt={product.name}
                                width={300}
                                height={192}
                                className="w-full h-full object-cover rounded-t-xl"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-xl">
                                <span className="text-gray-400 text-sm">No image</span>
                              </div>
                            )}
                          </div>
                          {/* Card Content */}
                          <div className="p-4 pb-4 flex flex-col flex-1">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2 overflow-hidden break-words whitespace-normal">
                                {product.description || "No description"}
                              </p>
                            </div>

                            {/* Footer - pinned to bottom: price above seller row */}
                            <div className="mt-auto flex flex-col gap-3">
                              {/* Price (pinned just above seller row) */}
                              <div className="flex items-center justify-start">
                                <span className="text-md font-semibold text-orange-600 truncate max-w-full">
                                  ฿{product.price}
                                </span>
                              </div>

                              {/* Seller row with Edit button */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 flex-shrink-0">
                                    {(activeProfile === 0 ? currentUser?.profileImg : currentUser?.persona?.avatarUrl) ? (
                                      <Image
                                        src={
                                          normalizeImageUrl(
                                            activeProfile === 0
                                              ? currentUser?.profileImg
                                              : currentUser?.persona?.avatarUrl
                                          )!
                                        }
                                        alt={
                                          activeProfile === 0
                                            ? currentUser?.name || "User"
                                            : currentUser?.persona?.displayName ||
                                              "Persona"
                                        }
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full rounded-full bg-gray-300 border border-gray-200"></div>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                      {activeProfile === 0
                                        ? currentUser?.name || "User"
                                        : currentUser?.persona?.displayName ||
                                          "Persona"}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEditProduct(product.id)}
                                  className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
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
                <>
                  {repostedPosts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {repostedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isLiked={likedPostsSet.has(post.id)}
                          isSaved={savedPostsSet.has(post.id)}
                          isReposted={repostedPostsSet.has(post.id)}
                          toggleLike={toggleLike}
                          toggleSave={toggleSave}
                          toggleRepost={toggleRepost}
                          handleCommentClick={handleCommentClick}
                          handleDeletePost={handleDeletePost}
                          handleReportClick={handleReportClick}
                        />
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
                          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                        />
                      </svg>
                      <p className="text-lg font-medium">No reposts yet</p>
                      <p className="text-sm mt-1">
                        Your reposts will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
              {activeTab === "likes" && (
                <>
                  {likedPosts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {likedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isLiked={likedPostsSet.has(post.id)}
                          isSaved={savedPostsSet.has(post.id)}
                          isReposted={repostedPostsSet.has(post.id)}
                          toggleLike={toggleLike}
                          toggleSave={toggleSave}
                          toggleRepost={toggleRepost}
                          handleCommentClick={handleCommentClick}
                          handleDeletePost={handleDeletePost}
                          handleReportClick={handleReportClick}
                        />
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
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No liked posts yet</p>
                      <p className="text-sm mt-1">
                        Posts you like will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
              {activeTab === "saved" && (
                <>
                  {savedPosts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {savedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isLiked={likedPostsSet.has(post.id)}
                          isSaved={savedPostsSet.has(post.id)}
                          isReposted={repostedPostsSet.has(post.id)}
                          toggleLike={toggleLike}
                          toggleSave={toggleSave}
                          toggleRepost={toggleRepost}
                          handleCommentClick={handleCommentClick}
                          handleDeletePost={handleDeletePost}
                          handleReportClick={handleReportClick}
                        />
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
                          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No saved posts yet</p>
                      <p className="text-sm mt-1">
                        Posts you save will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      {/* Chat Window */}
      <ChatWindow />

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
                  const isUserComment = comment.author?.type === "user";
                  // รองรับ author.avatar จาก API
                  const authorAvatarRaw = isUserComment
                    ? (comment.author?.avatar || comment.author?.profileImg)
                    : (comment.author?.avatar || comment.author?.avatarUrl);
                  
                  const authorAvatar = authorAvatarRaw ? normalizeImageUrl(authorAvatarRaw) : null;
                  const authorName = comment.author?.name;

                  const canDelete =
                    currentUser?.isAdmin ||
                    comment.author?.actorId === currentUser?.actorId ||
                    comment.author?.actorId === currentUser?.persona?.actorId;

                  return (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-gray-50 rounded-xl relative group"
                    >
                      {authorAvatar ? (
                        <Image
                          src={authorAvatar}
                          alt={authorName || "User"}
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

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      src={normalizeImageUrl(currentUser.profileImg)!}
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
                    src={normalizeImageUrl(currentUser.persona.avatarUrl)!}
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
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
              placeholder="Please describe why you're reporting this post..."
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none mb-4"
              rows={5}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportText("");
                }}
                className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportText.trim()}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold text-sm transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Edit Product Modal */}
      {isEditProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setIsEditProductModalOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              {/* Left Side - Preview Card */}
              <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center border-r border-gray-200">
                <div className="w-full max-w-[280px]">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
                    Preview
                  </h3>
                  <article
                    className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col"
                    style={{ minHeight: 350 }}
                  >
                    {/* Product Image */}
                    <div className="w-full h-[160px]">
                      {productFormData.image ? (
                        <Image
                          src={normalizeImageUrl(productFormData.image)}
                          alt="Preview"
                          width={300}
                          height={160}
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-xl">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    {/* Card Content */}
                    <div className="flex-1 flex flex-col p-4 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                          {productFormData.name || "Product Name"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2 overflow-hidden break-words whitespace-normal">
                          {productFormData.description ||
                            "Product description will appear here..."}
                        </p>
                      </div>

                      {/* Footer pinned to bottom */}
                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex items-center justify-start">
                          <span className="text-sm font-semibold text-orange-600 truncate max-w-full">
                            {productFormData.price
                              ? `฿${productFormData.price}`
                              : "฿0"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 flex-shrink-0">
                              {(activeProfile === 0 ? currentUser?.profileImg : currentUser?.persona?.avatarUrl) ? (
                                <Image
                                  src={
                                    normalizeImageUrl(
                                      activeProfile === 0
                                        ? currentUser?.profileImg
                                        : currentUser?.persona?.avatarUrl
                                    )!
                                  }
                                  alt="You"
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gray-300 border border-gray-200"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                              You
                            </span>
                          </div>
                          <button className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium">
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="md:w-1/2 flex flex-col min-h-0">
                <div className="p-8 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Product
                    </h2>
                    <button
                      onClick={() => {
                        setIsEditProductModalOpen(false);
                        setEditingProductModalId(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8">
                  <div className="space-y-5">
                    {/* Product Name */}
                    <div>
                      <label
                        htmlFor="product-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="product-name"
                        value={productFormData.name}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter product name"
                        maxLength={60}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="product-description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="product-description"
                        value={productFormData.description}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter product description"
                        rows={4}
                        maxLength={240}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label
                        htmlFor="product-price"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Price (฿)
                      </label>
                      <input
                        type="number"
                        id="product-price"
                        value={productFormData.price}
                        onChange={(e) =>
                          setProductFormData({
                            ...productFormData,
                            price: e.target.value,
                          })
                        }
                        placeholder="Enter price"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image {isUploadingProductImage && <span className="text-blue-500">(Uploading...)</span>}
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isUploadingProductImage 
                          ? 'border-blue-400 bg-blue-50 cursor-wait' 
                          : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      }`}>
                        <div
                          onClick={() => !isUploadingProductImage && productFileInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isUploadingProductImage)
                              productFileInputRef.current?.click();
                          }}
                        >
                          {isUploadingProductImage ? (
                            <>
                              <div className="w-10 h-10 mx-auto mb-2">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                              </div>
                              <p className="text-sm text-blue-600 font-medium">
                                Uploading image...
                              </p>
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-10 h-10 mx-auto mb-2 text-gray-400"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                />
                              </svg>
                              <p className="text-sm text-gray-500">
                                Click to upload image
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, WEBP up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          ref={productFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageSelect}
                          disabled={isUploadingProductImage}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="p-8 pt-4 bg-white border-t border-gray-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditProductModalOpen(false);
                        setEditingProductModalId(null);
                      }}
                      className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 px-6 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      Update Product
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
