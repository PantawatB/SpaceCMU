"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeImageUrl } from "@/utils/apiConfig";

type PostAuthor = {
  type?: "user" | "persona";
  name?: string;
  profileImg?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null; // เพิ่ม avatar field จาก API
  displayName?: string;
};

type Post = {
  id: number | string;
  content: string;
  imageUrl?: string | null;
  visibility: "public" | "friends";
  author: PostAuthor;
  actorId: string;
  likeCount?: number;
  likes?: number; // รองรับทั้ง 2 format
  repostCount?: number;
  shares?: number; // รองรับทั้ง 2 format
  saveCount?: number;
  commentCount?: number;
  comments?: number; // รองรับทั้ง 2 format
  createdAt: string;
  updatedAt?: string | undefined;
};

type PostCardProps = {
  post: Post;
  currentUser: {
    id?: string;
    actorId?: string | null;
    isAdmin?: boolean;
    persona?: {
      actorId?: string | null;
    } | null;
  } | null;
  isLiked: boolean;
  isSaved: boolean;
  isReposted: boolean;
  toggleLike?: (postId: string) => void;
  toggleSave?: (postId: string) => void;
  toggleRepost?: (postId: string) => void;
  handleCommentClick?: (postId: string | number) => void;
  handleDeletePost?: (postId: string | number) => void;
  handleReportClick?: (postId: string) => void;
  onLike?: (postId: number) => void;
  onSave?: (postId: number) => void;
  onRepost?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onReport?: (postId: number) => void;
  showActions?: boolean;
};

export default function PostCard({
  post,
  currentUser,
  isLiked,
  isSaved,
  isReposted,
  toggleLike,
  toggleSave,
  toggleRepost,
  handleCommentClick,
  handleDeletePost,
  handleReportClick,
  onLike,
  onSave,
  onRepost,
  onComment,
  onDelete,
  onReport,
  showActions = true,
}: PostCardProps) {
  const [openDropdown, setOpenDropdown] = useState(false);

  // Use the appropriate handler (Profile uses toggle/handle, Feeds uses on)
  const likeHandler = toggleLike || onLike;
  const saveHandler = toggleSave || onSave;
  const repostHandler = toggleRepost || onRepost;
  const commentHandler = handleCommentClick || onComment;
  const deleteHandler = handleDeletePost || onDelete;
  const reportHandler = handleReportClick || onReport;

  // Determine if this is a public or anonymous post based on author.type
  const isPublicPost = post.author?.type === "user";
  const isAnonymousPost = post.author?.type === "persona";
  
  // Get author info based on post type
  // API ส่งชื่อมาใน field name สำหรับทั้ง user และ persona
  const authorName = post.author?.name || post.author?.displayName;
    
  // เลือกรูปตาม type - รองรับทั้ง avatar, profileImg, avatarUrl
  const authorAvatar = isPublicPost 
    ? (post.author.avatar || post.author.profileImg)
    : isAnonymousPost 
    ? (post.author.avatar || post.author.avatarUrl)
    : (post.author.avatar || post.author.profileImg || post.author.avatarUrl);
    
  const fallbackAvatar = isPublicPost ? "/tanjiro.jpg" : "/noobcat.png";

  // Get counts - รองรับทั้ง 2 format
  const likeCount = post.likeCount ?? post.likes ?? 0;
  const commentCount = post.commentCount ?? post.comments ?? 0;
  const repostCount = post.repostCount ?? post.shares ?? 0;

  // Check if current user can delete this post
  const canDelete =
    currentUser?.isAdmin ||
    post.actorId === currentUser?.actorId ||
    post.actorId === currentUser?.persona?.actorId;

  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow relative">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-2">
        <Image
          src={normalizeImageUrl(authorAvatar) || fallbackAvatar}
          alt={authorName ?? "avatar"}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div>
          <div className="font-bold">
            {authorName ?? (isPublicPost ? "User" : "Anonymous")}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-2 mt-2 text-base font-semibold">{post.content}</div>

      {/* Image */}
      {post.imageUrl && (
        <div className="flex gap-3 mb-2">
          <Image
            src={normalizeImageUrl(post.imageUrl)}
            alt="post image"
            width={480}
            height={40}
            className="object-cover rounded-lg"
          />
        </div>
      )}

      {/* Post Actions */}
      {showActions && (
        <div className="flex items-center justify-between text-gray-500 text-sm mt-6">
          <div className="flex gap-6">
            <button
              onClick={() => likeHandler && (likeHandler as (id: string | number) => void)(post.id)}
              className={`flex items-center gap-1.5 hover:text-pink-500 transition ${
                isLiked ? "text-pink-500" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              Like{" "}
              {likeCount > 0 ? `(${likeCount})` : ""}
            </button>

            <button
              onClick={() => commentHandler && (commentHandler as (id: string | number) => void)(post.id)}
              className="flex items-center gap-1.5 hover:text-blue-500 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                />
              </svg>
              Comment{" "}
              {commentCount > 0 ? `(${commentCount})` : ""}
            </button>

            <button
              onClick={() => repostHandler && (repostHandler as (id: string | number) => void)(post.id)}
              className={`flex items-center gap-1.5 hover:text-green-500 transition ${
                isReposted ? "text-green-500" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isReposted ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
              Repost{" "}
              {repostCount > 0 ? `(${repostCount})` : ""}
            </button>
          </div>

          <button
            onClick={() => saveHandler && (saveHandler as (id: string | number) => void)(post.id)}
            className={`flex items-center gap-1.5 hover:text-yellow-500 transition ${
              isSaved ? "text-yellow-500" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isSaved ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
            Save
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {showActions && (deleteHandler || reportHandler) && (
        <div className="absolute top-6 right-6 dropdown-container">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ⋮
          </button>
          {openDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
              {canDelete && deleteHandler && (
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    (deleteHandler as (id: string | number) => void)(post.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  Delete Post
                </button>
              )}
              {reportHandler && (
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    (reportHandler as (id: string | number) => void)(post.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
                    />
                  </svg>
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
