"use client";

import Sidebar from "../../components/Sidebar";
import BannedWarning from "../../components/BannedWarning";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_BASE_URL, normalizeImageUrl } from "../../utils/apiConfig";
import ChatWindow from "@/components/ChatWindow";

// Interface for search user result from /api/users/search
interface SearchUser {
  id: string; // ✅ User.id (must have for chat creation)
  name?: string;
  profileImg?: string | null;
  bio?: string | null;
  actorId?: string; // optional for friend operations
  type?: string; // user or persona type
}

// Interface for friend request API response
interface FriendRequestActor {
  name: string;
  type: string;
  actorId: string;
  profileImg?: string | null;
}

interface FriendRequestResponse {
  id: string;
  from: FriendRequestActor;
  to: FriendRequestActor;
  status: string;
}

interface FriendRequestsApiResponse {
  incoming: FriendRequestResponse[];
  outgoing: FriendRequestResponse[];
}

// Friend card component
interface FriendCardProps {
  id: string; // actorId for friend operations and chat creation
  name: string;
  bio: string;
  followed: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isFriend?: boolean;
  readonlyFriendLabel?: boolean;
  onFollow: () => void;
  onRemove: () => void;
  onMessage?: () => void;
}
function FriendCard({
  name,
  bio,
  followed,
  avatarUrl,
  bannerUrl,
  isFriend,
  readonlyFriendLabel,
  onFollow,
  onRemove,
  onMessage,
}: FriendCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden flex flex-col items-center shadow-lg bg-white font-Roboto-light mb-6">
      {/* Banner with increased height to accommodate profile image overlap */}
      <div className="h-32 w-full bg-gradient-to-r from-blue-400 to-purple-500 relative">
        {bannerUrl ? (
          <Image
            src={normalizeImageUrl(bannerUrl)}
            alt="Banner"
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex items-center flex-col gap-4 px-5 py-5 w-full">
        {/* Profile image positioned to overlap banner */}
        <div className="-mt-12 mb-2 relative z-10">
          {avatarUrl ? (
            <Image
              src={normalizeImageUrl(avatarUrl)}
              alt="Profile Avatar"
              width={75}
              height={75}
              className="rounded-full border-4 border-white shadow-lg object-cover"
              style={{ width: "75px", height: "75px" }}
            />
          ) : (
            <div className="w-[75px] h-[75px] rounded-full border-4 border-white shadow-lg bg-gray-200" />
          )}
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
          ) : isFriend ? (
            // Existing friend
            <>
              {readonlyFriendLabel ? (
                <>
                  <button
                    className="bg-gray-300 text-gray-700 cursor-default text-[15px] px-3 py-[6px] rounded-full"
                    disabled
                  >
                    Your Friend
                  </button>
                  <button
                    className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                    onClick={onMessage}
                    aria-label="Message"
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
                        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97 5.969 5.969 0 014.936 20.9 4.48 4.48 0 015.914 18.875c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`bg-red-600 hover:bg-red-700 transition-all text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1`}
                    onClick={onRemove}
                  >
                    Unfriend
                  </button>
                  <button
                    className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                    onClick={onMessage}
                    aria-label="Message"
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
                        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97 5.969 5.969 0 014.936 20.9 4.48 4.48 0 015.914 18.875c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            // Other cards: keep Add Friend + Message
            <>
              <button
                className={`bg-gray-600 transition-all gradient text-[15px] text-white px-3 py-[6px] rounded-full flex items-center gap-1`}
                onClick={onFollow}
              >
                Add Friend
              </button>
              <button
                className="bg-gray-200/65 hover:bg-gray-200 transition-colors p-2 rounded-full"
                onClick={onMessage}
                aria-label="Message"
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
                    d="M7 8h10M7 12h6m-6 4h4M21 12c0 4.418-4.03 8-9 8a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97 5.969 5.969 0 014.936 20.9 4.48 4.48 0 015.914 18.875c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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

function HorizontalScrollSection({
  title,
  items,
}: {
  title: string;
  items: FriendCardProps[];
}) {
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
            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 ${
              !canGoBack ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canGoBack}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setStartIdx(
                Math.min(items.length - visibleCount, startIdx + visibleCount)
              )
            }
            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 ${
              !canGoNext ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!canGoNext}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
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
  const [rawFriendRequests, setRawFriendRequests] =
    useState<FriendRequestsApiResponse>({ incoming: [], outgoing: [] });
  const [friends, setFriends] = useState<FriendCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<number>(0);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState<FriendCardProps[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendCardProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFriendForChat, setSelectedFriendForChat] = useState<
    string | null
  >(null);

  // Listen for active profile changes
  useEffect(() => {
    // Get initial value from localStorage
    const storedProfile = localStorage.getItem("activeProfile");
    if (storedProfile) {
      setActiveProfile(parseInt(storedProfile, 10) || 0);
    }

    // Listen for changes
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") {
        setActiveProfile(detail);
      }
    };
    window.addEventListener("activeProfileChanged", handler as EventListener);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeProfile") {
        const v = e.newValue;
        setActiveProfile(v ? parseInt(v, 10) : 0);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(
        "activeProfileChanged",
        handler as EventListener
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Function to start chat with a friend
  const handleStartChat = async (otherActorId: string) => {
    try {
      console.log("🚀 Starting chat with Actor ID:", otherActorId);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("You need to be logged in to start a chat");
        return;
      }

      // Get current user's actorId based on active profile
      const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        throw new Error("Failed to fetch current user info");
      }

      const meData: { actorId?: string; persona?: { actorId?: string } } =
        await meRes.json();

      // ✅ Use the appropriate actorId based on active profile
      const myActorId =
        activeProfile === 1 && meData.persona?.actorId
          ? meData.persona.actorId
          : meData.actorId;

      if (!myActorId) {
        throw new Error("Could not determine your actor ID");
      }

      console.log("👤 My Actor ID:", myActorId);
      console.log("👥 Other Actor ID:", otherActorId);

      // ✅ Backend now requires both myActorId and otherActorId
      const payload = { myActorId, otherActorId };
      console.log("📦 [Chat] create payload:", payload);
      console.log(
        "📤 Sending API request to:",
        `${API_BASE_URL}/api/chats/direct`
      );

      const response = await fetch(`${API_BASE_URL}/api/chats/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chat creation failed:", response.status, errorText);
        throw new Error(
          `Failed to create or get chat: ${response.status} - ${errorText}`
        );
      }

      const chatData = await response.json();
      console.log("Chat created/retrieved:", chatData);

      // Backend returns { id, type, myActorId, otherActorId }
      const chatId = chatData.id || chatData.data?.chat?.id;
      if (!chatId) {
        console.error("No chat ID in response:", chatData);
        throw new Error("Invalid chat response");
      }

      // Set the friend for chat and open chat window
      setSelectedFriendForChat(chatId);
      setChatOpen(true);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Failed to start chat. Please try again.");
    }
  };

  const performSearch = async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required for search");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/users/search?name=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Search failed with status: ${res.status}`);
      }

      const responseData: {
        items: SearchUser[];
      } = await res.json();

      const currentFriendIds = new Set(friends.map((f) => f.id));

      const transformedResults: FriendCardProps[] = responseData.items.map(
        (u) => {
          // Debug logging for each search result
          console.log("🔍 [Search Result] User:", {
            id: u.id, // User.id (for chat creation)
            actorId: u.actorId, // Actor.id (for friend operations)
            name: u.name,
            type: u.type || "unknown",
          });

          return {
            id: u.actorId ?? u.id, // actorId for friend operations and chat creation
            name: u.name ?? "Unknown User",
            bio: u.bio ?? "No bio available",
            followed: false,
            avatarUrl: u.profileImg ? normalizeImageUrl(u.profileImg) : null,
            isFriend: currentFriendIds.has(u.actorId ?? u.id),
            readonlyFriendLabel: currentFriendIds.has(u.actorId ?? u.id),
            onFollow: () => sendFriendRequest(u.actorId),
            onRemove: () => unfriend(u.actorId),
            onMessage: () => {
              // ✅ Use actorId for chat creation (supports separate User/Persona chats)
              const actorId = u.actorId ?? u.id;
              if (actorId) handleStartChat(actorId);
              else console.warn("No actorId for", u);
            },
          };
        }
      );

      setSearchResults(transformedResults);
    } catch (err) {
      console.error("Error performing search:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Function to fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // First get current user's actorId or persona.actorId
      const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        throw new Error(`Failed to fetch current user: ${meRes.status}`);
      }

      const meData: { actorId?: string; persona?: { actorId?: string } } =
        await meRes.json();

      // Determine which actorId to use based on active profile
      const actorId =
        activeProfile === 1 && meData.persona?.actorId
          ? meData.persona.actorId
          : meData.actorId;

      if (!actorId) {
        throw new Error("No actorId found for current user");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/friends/requests/${actorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FriendRequestsApiResponse = await response.json();

      // ✅ Store raw data for filtering
      setRawFriendRequests(data);

      // Transform incoming friend requests to match FriendCardProps interface
      const transformedRequests: FriendCardProps[] = data.incoming.map(
        (request) => ({
          id: request.from?.actorId ?? request.id, // ✅ Use actorId for chat creation
          name: request.from?.name ?? "Unknown",
          bio: "No bio available",
          followed: request.status === "pending",
          avatarUrl: request.from?.profileImg
            ? normalizeImageUrl(request.from.profileImg)
            : null,
          onFollow: () => handleAcceptRequest(request.id),
          onRemove: () => handleRejectRequest(request.id),
          onMessage: () => {
            const actorId = request.from?.actorId;
            if (actorId) handleStartChat(actorId);
            else console.warn("No actorId for request", request);
          },
        })
      );

      setFriendRequests(transformedRequests);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch friend requests"
      );
      console.error("Error fetching friend requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch current friends list
  const fetchFriends = async (): Promise<FriendCardProps[]> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      // First get current user's actorId or persona.actorId
      const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        console.warn("Failed to fetch current user:", meRes.status);
        return [];
      }

      const meData: { actorId?: string; persona?: { actorId?: string } } =
        await meRes.json();

      // Determine which actorId to use based on active profile
      const actorId =
        activeProfile === 1 && meData.persona?.actorId
          ? meData.persona.actorId
          : meData.actorId;

      if (!actorId) {
        console.warn("No actorId found for current user");
        return [];
      }

      const res = await fetch(`${API_BASE_URL}/api/friends/${actorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn("Failed to fetch friends:", res.status);
        return [];
      }

      const data: {
        actorId: string;
        name: string;
        type: string;
        profileImg?: string | null;
        bannerImg?: string | null;
        bio?: string | null;
      }[] = await res.json();
      const transformed: FriendCardProps[] = data.map((u) => ({
        id: u.actorId,
        name: u.name,
        bio: u.bio || "No bio available",
        followed: false,
        isFriend: true,
        onFollow: () => {},
        onRemove: () => unfriend(u.actorId),
        onMessage: () => {
          // ✅ Use actorId for chat creation (supports separate User/Persona chats)
          const actorId = u.actorId;
          if (actorId) handleStartChat(actorId);
          else console.warn("No actorId for friend", u);
        },
        avatarUrl: u.profileImg ? normalizeImageUrl(u.profileImg) : null,
        bannerUrl: u.bannerImg ? normalizeImageUrl(u.bannerImg) : null,
      }));

      setFriends(transformed);
      return transformed;
    } catch (err) {
      console.error("Error fetching friends:", err);
      return [];
    }
  };

  // Function to handle accepting friend request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/friends/accept/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Refresh friend requests after accepting
        fetchFriendRequests();
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  // Function to handle rejecting friend request
  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/friends/reject/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Refresh friend requests after rejecting
        fetchFriendRequests();
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  // Function to send friend request
  const sendFriendRequest = async (toActorId?: string) => {
    if (!toActorId) return;
    try {
      console.log("📤 Sending friend request to actor:", toActorId);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to send friend requests");
        return;
      }

      // Resolve our current actorId according to activeProfile
      const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        console.warn(
          "Failed to fetch current user when sending friend request",
          meRes.status
        );
        return;
      }

      const meData: { actorId?: string; persona?: { actorId?: string } } =
        await meRes.json();
      const fromActorId =
        activeProfile === 1 && meData.persona?.actorId
          ? meData.persona.actorId
          : meData.actorId;

      if (!fromActorId) {
        alert("Unable to determine your actorId for the current profile");
        return;
      }

      console.log("👤 My Actor ID:", fromActorId);
      console.log("👥 Target Actor ID:", toActorId);

      // Check if trying to add yourself
      if (fromActorId === toActorId) {
        alert("You cannot send a friend request to yourself!");
        return;
      }

      const payload = { fromActorId, toActorId };
      console.log("📦 Friend request payload:", payload);

      const res = await fetch(`${API_BASE_URL}/api/friends/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error(
          "❌ Failed to send friend request:",
          res.status,
          errorData
        );
        alert(
          `Failed to send friend request: ${
            errorData.message || "Unknown error"
          }`
        );
      } else {
        // Refresh friend requests so pending requests appear
        await fetchFriendRequests();
        alert("Friend request sent");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  // Function to unfriend someone (DELETE /api/friends/{meActorId}/friends/{targetActorId})
  const unfriend = async (targetActorId?: string) => {
    if (!targetActorId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to unfriend");
        return;
      }

      // Resolve our current actorId according to activeProfile
      const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meRes.ok) {
        console.warn(
          "Failed to fetch current user when unfriending",
          meRes.status
        );
        return;
      }

      const meData: { actorId?: string; persona?: { actorId?: string } } =
        await meRes.json();
      const myActorId =
        activeProfile === 1 && meData.persona?.actorId
          ? meData.persona.actorId
          : meData.actorId;

      if (!myActorId) {
        alert("Unable to determine your actorId for the current profile");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/friends/${encodeURIComponent(
          myActorId
        )}/friends/${encodeURIComponent(targetActorId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.warn("Failed to unfriend", res.status);
      } else {
        // Refresh friends + suggestions
        await fetchFriends();
        const currentFriends = await fetchFriends();
        const friendIds = new Set(currentFriends.map((f) => f.id));
        await fetchPeopleYouMayKnow(friendIds);
      }
    } catch (err) {
      console.error("Error unfriending user:", err);
    }
  };

  // Function to fetch "People you may know" data
  const fetchPeopleYouMayKnow = async (friendIds?: Set<string>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/users/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn(
          'Failed to fetch users for "People you may know"',
          res.status
        );
        return;
      }

      const data: {
        id: string;
        name?: string;
        profileImg?: string | null;
        bio?: string | null;
        actorId?: string;
      }[] = await res.json();

      const mapped: FriendCardProps[] = data.map((u) => ({
        id: u.actorId ?? u.id,
        name: u.name ?? "Unknown",
        bio: u.bio ?? "No bio available",
        followed: false,
        avatarUrl: u.profileImg ? normalizeImageUrl(u.profileImg) : null,
        isFriend: false,
        readonlyFriendLabel: false,
        onFollow: () => sendFriendRequest(u.actorId ?? u.id),
        onRemove: () => unfriend(u.actorId ?? u.id),
        onMessage: () => {
          // ✅ Use actorId for chat creation (supports separate User/Persona chats)
          const actorId = u.actorId ?? u.id;
          if (actorId) handleStartChat(actorId);
          else console.warn("No actorId for user", u);
        },
      }));

      const friendActorIds = friendIds ?? new Set(friends.map((f) => f.id));

      // ✅ Collect pending request actor IDs from raw data
      const pendingRequestIds = new Set([
        ...rawFriendRequests.incoming.map((r) => r.from.actorId),
        ...rawFriendRequests.outgoing.map((r) => r.to.actorId),
      ]);

      console.log("🔍 Friend actor IDs:", Array.from(friendActorIds));
      console.log("🔍 Pending request IDs:", Array.from(pendingRequestIds));
      console.log(
        "🔍 People before filtering:",
        mapped.map((p) => ({ id: p.id, name: p.name }))
      );

      // ✅ Filter out friends AND pending requests from "People you may know"
      const nonFriends = mapped.filter(
        (item) =>
          !friendActorIds.has(item.id) && !pendingRequestIds.has(item.id)
      );

      console.log(
        "🔍 People after filtering:",
        nonFriends.map((p) => ({ id: p.id, name: p.name }))
      );

      setPeopleYouMayKnow(nonFriends);
    } catch (err) {
      console.error("Error fetching people you may know:", err);
    }
  };

  // Fetch friend requests and friends on component mount and when activeProfile changes
  useEffect(() => {
    const load = async () => {
      console.log(
        "🔄 Active profile changed to:",
        activeProfile === 1 ? "Persona" : "User"
      );
      // Clear existing data first
      setFriendRequests([]);
      setFriends([]);
      setPeopleYouMayKnow([]);

      // fetch friends first so we can mark existing friends correctly
      const currentFriends = await fetchFriends();
      const friendIds = new Set(currentFriends.map((f) => f.id));
      await fetchPeopleYouMayKnow(friendIds);
      await fetchFriendRequests(); // ✅ Make sure to await

      console.log(
        "✅ Data refreshed for",
        activeProfile === 1 ? "Persona" : "User"
      );
    };
    load();
  }, [activeProfile]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <BannedWarning />
      {/* Sidebar (sticky to viewport so it doesn't move when right column scrolls) */}
      <div className="sticky top-0 self-start h-screen">
        <Sidebar menuItems={menuItems} />
      </div>
      {/* Main Content (make this column scroll internally) */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
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
              placeholder="Search for friends..."
              className="w-full pl-10 pr-3 py-2 rounded-full bg-white text-sm placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          {searchQuery.trim() ? (
            isSearching ? (
              <div className="text-center text-gray-500">Searching...</div>
            ) : (
              <HorizontalScrollSection
                title="Search Results"
                items={searchResults}
              />
            )
          ) : loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <>
              <HorizontalScrollSection title="Friends" items={friends} />
              <HorizontalScrollSection
                title="Friend Requests"
                items={friendRequests}
              />
              <HorizontalScrollSection
                title="People you may know"
                items={peopleYouMayKnow}
              />
            </>
          )}
        </div>
      </main>
      {/* Chat Window */}
      {chatOpen && selectedFriendForChat && (
        <ChatWindow
          chatId={selectedFriendForChat}
          onClose={() => {
            setChatOpen(false);
            setSelectedFriendForChat(null);
          }}
        />
      )}
    </div>
  );
}
