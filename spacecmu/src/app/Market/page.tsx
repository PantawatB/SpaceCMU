"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import BannedWarning from "../../components/BannedWarning";
import { API_BASE_URL, normalizeImageUrl } from "@/utils/apiConfig";

// MarketCard component
type MarketCardProps = {
  price: string;
  title: string;
  jobTitle: string;
  image: string;
  sellerName: string;
  sellerImage: string;
  sellerId: string;
  productId: string;
  isOwnProduct: boolean;
  onChatClick: (
    sellerId: string,
    productTitle: string,
    productImage: string
  ) => void;
  onEditClick?: (productId: string) => void;
};

function MarketCard({
  price,
  title,
  jobTitle,
  image,
  sellerName,
  sellerImage,
  sellerId,
  productId,
  isOwnProduct,
  onChatClick,
  onEditClick,
}: MarketCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-md w-full max-w-[300px] mx-auto mb-8 border border-gray-100 flex flex-col h-[380px] overflow-hidden">
      {/* Product Image */}
      <div className="w-full h-[180px] flex-shrink-0">
        <Image
          src={normalizeImageUrl(image)}
          alt={title}
          width={300}
          height={180}
          className="w-full h-full object-cover rounded-t-xl"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 pb-4 flex flex-col flex-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {title}
          </h3>
          {/* allow up to 2 lines, then show ellipsis; enable wrapping for English */}
          <p className="text-sm text-gray-500 mb-2 line-clamp-2 overflow-hidden break-words whitespace-normal">
            {jobTitle}
          </p>
        </div>

        {/* Footer - pinned to bottom: price above seller row */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Price (pinned just above seller row) */}
          <div className="flex items-center justify-start">
            <span className="text-md font-semibold text-orange-600 truncate max-w-full">
              {price}
            </span>
          </div>

          {/* Seller row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 flex-shrink-0">
                <Image
                  src={normalizeImageUrl(sellerImage)}
                  alt={sellerName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {sellerName}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (isOwnProduct && onEditClick) {
                    onEditClick(productId);
                  } else {
                    onChatClick(sellerId, title, image);
                  }
                }}
                className="card__btn bg-black text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {isOwnProduct ? "Edit" : "Chat"}
              </button>
              {isOwnProduct && (
                <button
                  onClick={async () => {
                    if (
                      !window.confirm(
                        "Are you sure you want to delete this product?"
                      )
                    ) {
                      return;
                    }

                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `${API_BASE_URL}/api/products/${productId}`,
                        {
                          method: "DELETE",
                          headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : undefined,
                        }
                      );

                      if (res.ok) {
                        alert("Product deleted successfully!");
                        window.location.reload();
                      } else {
                        alert("Failed to delete product");
                      }
                    } catch (err) {
                      console.error("Error deleting product:", err);
                      alert("Error deleting product");
                    }
                  }}
                  className="bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MarketMainPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(
    null
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Active profile mode: 0 = public, 1 = anonymous
  const [activeProfile, setActiveProfile] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "/noobcat.png", // default preview image
  });

  // Sync activeProfile from localStorage
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

    // Listen for activeProfile changes
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

  // image file handling for upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);

    // read preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) setFormData((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  // helper to trigger file picker
  const openFilePicker = () => fileInputRef.current?.click();

  // Display limits (match modal limits)
  const MAX_TITLE_LENGTH = 60;
  const MAX_DESC_LENGTH = 240;

  // Validation flags for preview warnings
  const titleTooLong = formData.name
    ? formData.name.length > MAX_TITLE_LENGTH
    : false;
  const descTooLong = formData.description
    ? formData.description.length > MAX_DESC_LENGTH
    : false;
  const priceDigits = formData.price
    ? String(formData.price).replace(/\D/g, "")
    : "";
  const priceTooLong = priceDigits.length > 8; // backend limit: 8 digits

  // Refs to preview title/description to detect visual clamping (ellipsis)
  const previewTitleRef = useRef<HTMLHeadingElement | null>(null);
  const previewDescRef = useRef<HTMLParagraphElement | null>(null);
  const [previewTitleClamped, setPreviewTitleClamped] = useState(false);
  const [previewDescClamped, setPreviewDescClamped] = useState(false);

  // Measure overflow to detect whether CSS line-clamp produced ellipsis
  useEffect(() => {
    const checkClamped = () => {
      try {
        const t = previewTitleRef.current;
        const d = previewDescRef.current;
        if (t) {
          setPreviewTitleClamped(
            t.scrollHeight > t.clientHeight || t.scrollWidth > t.clientWidth
          );
        }
        if (d) {
          setPreviewDescClamped(
            d.scrollHeight > d.clientHeight || d.scrollWidth > d.clientWidth
          );
        }
      } catch {
        // ignore
      }
    };

    // run after render
    requestAnimationFrame(checkClamped);

    // also listen to resize since clamping can change on width
    window.addEventListener("resize", checkClamped);
    return () => window.removeEventListener("resize", checkClamped);
  }, [formData.name, formData.description, isModalOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingProductId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "/noobcat.png",
    });
    setSelectedImageFile(null);
  };

  const handleSubmit = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const payload = new FormData();
      payload.append("name", formData.name);
      // ensure description is always sent as a string (handles numeric descriptions)
      payload.append("description", String(formData.description || ""));
      payload.append("price", String(formData.price || "0"));
      if (selectedImageFile) payload.append("image", selectedImageFile);

      const url =
        isEditMode && editingProductId
          ? `${API_BASE_URL}/api/products/${editingProductId}`
          : `${API_BASE_URL}/api/products`;

      const method = isEditMode && editingProductId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload failed", res.status, text);
        alert(
          isEditMode ? "Failed to update product" : "Failed to add product"
        );
        return;
      }

      // success
      const json = await res.json();
      console.log(isEditMode ? "Product updated" : "Product created", json);
      // reset form and close modal
      closeModal();
      // Refresh products
      fetchProducts();
    } catch (err) {
      console.error("Error submitting product", err);
      alert("Error submitting product");
    }
  };

  // prevent page layout shift and stop body scrolling when modal is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (isModalOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth)
        document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.paddingRight = originalPaddingRight || "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.paddingRight = originalPaddingRight || "";
    };
  }, [isModalOpen]);

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

  // mock data เพิ่ม sellerName, sellerImage
  /* Mock data (commented out) - moved to API
  const marketItems = [
    { price: "฿450", title: "รองเท้าแตะ", jobTitle: "รองเท้าแตะ 2 ข้าง ฟหกดฟหกดหฟกดหฟกดหฟฟหกดฟหกดฟหกดฟหกดฟหก", image: "/shoe.webp", sellerName: "Kamado Tanjiro", sellerImage: "/tanjiro.jpg" },
    { price: "฿80", title: "โทรศัพท์", jobTitle: "iphone ฟหกดหกดฟหกดฟหฟหกดหฟกดกดหฟดหฟดฟห", image: "/iphone.jpg", sellerName: "Nezuko Kamado", sellerImage: "/nezuko.jpg" },
    { price: "฿70", title: "กาแฟ", jobTitle: "ฟหกดฟหกดฟกดฟหกดฟหกดหฟดฟหกดหฟกดหฟดฟหด", image: "/coffee.jpeg", sellerName: "Zenitsu Agatsuma", sellerImage: "/zenitsu.jpg" },
    { price: "฿300", title: "รถบรรทุก", jobTitle: "ฟหกดานราืนรสาหฟนากสฟราสาฟรฟนาหนรกสานรฟหกด", image: "/toy.webp", sellerName: "Inosuke Hashibira", sellerImage: "/inosuke.jpeg" },
    { price: "฿400", title: "ยาสีฟัน", jobTitle: "ฟหกนดร่นฟรห่กดนรฟหนกยรด่ฟหนรกด่ยฟหนกร่ดฟหกนรด่ฟหยนดร่", image: "/tt.webp", sellerName: "Giyu Tomioka", sellerImage: "/giyu.webp" },
    { price: "฿150", title: "กาน้ำร้อน", jobTitle: "หฟกดร้ฟหนรนร้สไฟหกดฟห่กดฟาสดนานรฟห้สาก่นรฟห่นดรา", image: "/kk.jpg", sellerName: "Shinobu Kocho", sellerImage: "/shinobu.jpg" },
    { price: "฿120", title: "ตุ๊กตาหมี", jobTitle: "ฟหกดฟหดฟหกดฟหกดนหฟกรดฟหบกดฟหกดฟหกดฟหกด", image: "/bear.webp", sellerName: "Kyojuro Rengoku", sellerImage: "/kyojuro.jpg" },
    { price: "฿200", title: "ปลากระป๋อง", jobTitle: "ฟหสกด้่ฟหรก้ดนหฟร้กดนฟหกร้ดฟหนยกรด้ฟหกนดร้หฟด", image: "/fishcan.jpg", sellerName: "Mitsuri Kanroji", sellerImage: "/mitsuri.webp" },
  ];
  */

  // TODO: replace with API fetch
  type Product = {
    id: number;
    name: string;
    price: string | number | null;
    description: string | null;
    imageUrl: string | null;
    seller?: {
      id: string;
      name: string;
      profileImg?: string | null;
      actorId?: string | null;
    } | null;
  };

  const [marketItems, setMarketItems] = useState<
    Array<{
      price: string;
      title: string;
      jobTitle: string;
      image: string;
      sellerName: string;
      sellerImage: string;
      sellerId: string;
      productId: string;
      isOwnProduct: boolean;
    }>
  >([]);

  // Default gray placeholder image (data URL SVG) used when API has no image
  const DEFAULT_IMAGE =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23E5E7EB'/%3E%3C/svg%3E";

  const truncateText = (text: string, max: number) => {
    if (!text) return text;
    return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Fetch current user first
      let currentUser = null;
      if (token) {
        try {
          const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            currentUser = userData.id || userData.data?.id;
            setCurrentUserId(currentUser);
          }
        } catch (err) {
          console.error("Error fetching current user:", err);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const items: Product[] = json?.data ?? [];
      const mapped = items.map((p) => {
        const priceNum = p.price ? parseFloat(String(p.price)) : 0;
        const priceStr = Number.isInteger(priceNum)
          ? `฿${priceNum}`
          : `฿${priceNum.toFixed(2)}`;
        return {
          price: priceStr,
          title: truncateText(p.name || "Untitled Product", MAX_TITLE_LENGTH),
          jobTitle: truncateText(
            String(p.description ?? "No description provided"),
            MAX_DESC_LENGTH
          ),
          image: p.imageUrl || DEFAULT_IMAGE,
          sellerName: p.seller?.name || "Unknown Seller",
          sellerImage: p.seller?.profileImg || DEFAULT_IMAGE,
          sellerId: p.seller?.actorId || p.seller?.id || "",
          productId: String(p.id),
          isOwnProduct: currentUser ? p.seller?.id === currentUser : false,
        };
      });
      setMarketItems(mapped);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChatClick = async (
    sellerId: string,
    productTitle: string,
    productImage: string
  ) => {
    if (!sellerId) {
      alert("Seller information not available");
      return;
    }

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("You need to be logged in to chat");
        return;
      }

      // Get current user's actor ID
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user info");
      }

      const userData = await userResponse.json();
      const activeProfileMode = localStorage.getItem("activeProfile");
      const isPersona = activeProfileMode === "1";

      // Get my actor ID based on profile mode
      const myActorId =
        isPersona && userData.persona?.actorId
          ? userData.persona.actorId
          : userData.actorId;

      if (!myActorId) {
        alert("Unable to get your profile information");
        return;
      }

      // sellerId is the seller's actorId
      const otherActorId = sellerId;

      // Create or get existing chat with seller
      const response = await fetch(`${API_BASE_URL}/api/chats/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          myActorId,
          otherActorId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Chat creation error:", errorData);
        throw new Error(`Failed to create chat: ${response.status}`);
      }

      const chatData = await response.json();
      const chatId = chatData.id || chatData.data?.id;

      if (!chatId) {
        throw new Error("Invalid chat response");
      }

      // Send automatic message with product info and image
      const autoMessage = `สนใจ ${productTitle}\n${productImage}`;
      try {
        await fetch(`${API_BASE_URL}/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: autoMessage, type: "text" }),
        });
      } catch (msgErr) {
        console.error("Failed to send auto message:", msgErr);
        // Continue anyway - chat window will open
      }

      // Dispatch custom event to open chat in GlobalChat
      const openChatEvent = new CustomEvent("openChat", {
        detail: { chatId },
      });
      window.dispatchEvent(openChatEvent);

      // Update states
      setSelectedChatUserId(chatId);
      setChatOpen(true);
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden">
      <BannedWarning />
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col">
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
        {/* Header with Markets title and Add Product button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Markets</h1>
          {/* Only show Add Product button in public mode */}
          {activeProfile === 0 && (
            <button
              onClick={() => {
                setIsEditMode(false);
                setEditingProductId(null);
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  image: "/noobcat.png",
                });
                setSelectedImageFile(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Product
            </button>
          )}
        </div>
        {/* Market Cards Grid (scrollable area) */}
        <div className="flex-1 overflow-auto pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-8">
            {marketItems.map((item, idx) => (
              <MarketCard
                key={idx}
                price={item.price}
                title={item.title}
                jobTitle={item.jobTitle}
                image={item.image}
                sellerName={item.sellerName}
                sellerImage={item.sellerImage}
                sellerId={item.sellerId}
                productId={item.productId}
                isOwnProduct={item.isOwnProduct}
                onChatClick={handleChatClick}
                onEditClick={async (productId) => {
                  try {
                    // Fetch product details
                    const token =
                      typeof window !== "undefined"
                        ? localStorage.getItem("token")
                        : null;
                    const res = await fetch(
                      `${API_BASE_URL}/api/products/${productId}`,
                      {
                        headers: token
                          ? { Authorization: `Bearer ${token}` }
                          : undefined,
                      }
                    );

                    if (res.ok) {
                      const json = await res.json();
                      const product = json.data || json;

                      // Set form data for editing
                      setFormData({
                        name: product.name || "",
                        // always coerce to string so subsequent FormData.append won't receive a number
                        description:
                          product.description != null
                            ? String(product.description)
                            : "",
                        price: product.price ? String(product.price) : "",
                        image: product.imageUrl
                          ? normalizeImageUrl(product.imageUrl)
                          : "/noobcat.png",
                      });
                      setEditingProductId(productId);
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    } else {
                      alert("Failed to load product details");
                    }
                  } catch (err) {
                    console.error("Error loading product:", err);
                    alert("Failed to load product");
                  }
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeModal}
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
                  {/* warnings for input length */}
                  {(titleTooLong ||
                    descTooLong ||
                    priceTooLong ||
                    previewTitleClamped ||
                    previewDescClamped) && (
                    <div className="mb-3 text-sm text-red-600">
                      {(titleTooLong || previewTitleClamped) && (
                        <div>ชื่อสินค้าตอนนี้ยาวเกิน</div>
                      )}
                      {(descTooLong || previewDescClamped) && (
                        <div>คำอธิบายยาวเกินกว่าที่จะแสดง โปรดสั้นลง</div>
                      )}
                      {priceTooLong && (
                        <div>
                          ราคาต้องไม่เกิน 8 หลัก (ตอนนี้ {priceDigits.length}{" "}
                          หลัก)
                        </div>
                      )}
                    </div>
                  )}
                  <article
                    className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col"
                    style={{ minHeight: 350 }}
                  >
                    {/* Product Image */}
                    <div className="w-full h-[160px]">
                      <Image
                        src={normalizeImageUrl(formData.image)}
                        alt="Preview"
                        width={300}
                        height={160}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    </div>
                    {/* Card Content */}
                    <div className="flex-1 flex flex-col p-4 pb-3">
                      <div>
                        <h3
                          ref={previewTitleRef}
                          className="text-lg font-bold text-gray-900 mb-2 truncate"
                        >
                          {formData.name || "Product Name"}
                        </h3>
                        <p
                          ref={previewDescRef}
                          className="text-sm text-gray-500 mb-2 line-clamp-2 overflow-hidden break-words whitespace-normal"
                        >
                          {formData.description ||
                            "Product description will appear here..."}
                        </p>
                      </div>

                      {/* Footer pinned to bottom: price above seller row */}
                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex items-center justify-start">
                          <span className="text-sm font-semibold text-orange-600 truncate max-w-full">
                            {formData.price ? `฿${formData.price}` : "฿0"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 flex-shrink-0">
                              <Image
                                src="/tanjiro.jpg"
                                alt="You"
                                width={32}
                                height={32}
                                className="rounded-full object-cover aspect-square border border-gray-200 w-full h-full"
                              />
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
                      {isEditMode ? "Edit Product" : "Add Product"}
                    </h2>
                    <button
                      onClick={closeModal}
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
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        maxLength={60}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                        rows={4}
                        maxLength={240}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Price (฿)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Image Upload Placeholder */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <div
                          onClick={openFilePicker}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") openFilePicker();
                          }}
                        >
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
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
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
                      onClick={closeModal}
                      className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-6 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      {isEditMode ? "Update Product" : "Add Product"}
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
