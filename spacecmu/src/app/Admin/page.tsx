"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import BannedWarning from "../../components/BannedWarning";
import Image from "next/image";
import { API_BASE_URL, normalizeImageUrl } from "@/utils/apiConfig";
import { useRouter } from "next/navigation";

type Report = {
  id: string;
  reason: string;
  status: "pending" | "reviewed" | "actioned";
  createdAt: string;
  reportingUser: {
    id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
  post?: {
    id: string;
    content: string;
    imageUrl?: string;
    actor?: {
      id: string;
      user?: {
        id: string;
        name: string;
        email: string;
      };
      persona?: {
        id: string;
        displayName: string;
      };
    };
  };
  persona?: {
    id: string;
    displayName: string;
    isBanned: boolean;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  isBanned: boolean;
  isAdmin: boolean;
  profileImg?: string;
  createdAt: string;
};

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profileImg?: string;
} | null;

type Appeal = {
  id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminResponse?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [activeTab, setActiveTab] = useState<
    "reports" | "users" | "posts" | "appeals"
  >("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/Login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not authenticated");

        const user = await res.json();
        if (!user.isAdmin) {
          alert("Access denied. Admin only.");
          router.push("/Feeds");
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error(err);
        router.push("/Login");
      }
    };
    checkAuth();
  }, [router]);

  // Fetch reports
  useEffect(() => {
    if (!currentUser) return;
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Reports data:", data);
          setReports(data);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "reports") {
      fetchReports();
    }
  }, [activeTab, currentUser]);

  // Fetch users
  useEffect(() => {
    if (!currentUser) return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Users data:", data);
          setUsers(data.data || data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, currentUser]);

  // Fetch appeals
  useEffect(() => {
    if (!currentUser) return;
    const fetchAppeals = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/appeals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAppeals(data);
        }
      } catch (err) {
        console.error("Failed to fetch appeals:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "appeals") {
      fetchAppeals();
    }
  }, [activeTab, currentUser]);

  const handleBanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${userId}/ban`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        alert("User banned successfully");
        // Refresh users list
        setActiveTab("reports");
        setTimeout(() => setActiveTab("users"), 100);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to ban user");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/user/${userId}/unban`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("User unbanned successfully");
        // Refresh users list
        setActiveTab("reports");
        setTimeout(() => setActiveTab("users"), 100);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to unban user");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to unban user");
    }
  };

  const handleDeletePost = async (postId: string, reportId?: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/post/${postId}/takedown`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reportId }),
        }
      );

      if (res.ok) {
        alert("Post deleted successfully");
        // Refresh reports
        setActiveTab("users");
        setTimeout(() => setActiveTab("reports"), 100);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleApproveAppeal = async (appealId: string) => {
    if (!confirm("Approve this appeal and unban the user?")) return;

    const token = localStorage.getItem("token");
    const adminResponse = prompt("Add a response (optional):");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appeals/${appealId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminResponse }),
        }
      );

      if (res.ok) {
        alert("Appeal approved and user unbanned");
        // Refresh appeals
        setActiveTab("reports");
        setTimeout(() => setActiveTab("appeals"), 100);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to approve appeal");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve appeal");
    }
  };

  const handleRejectAppeal = async (appealId: string) => {
    const adminResponse = prompt("Enter rejection reason:");
    if (!adminResponse) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appeals/${appealId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminResponse }),
        }
      );

      if (res.ok) {
        alert("Appeal rejected");
        // Refresh appeals
        setActiveTab("reports");
        setTimeout(() => setActiveTab("appeals"), 100);
      } else {
        const error = await res.json();
        alert(error.message || "Failed to reject appeal");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reject appeal");
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to promote this user to admin?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/user/${userId}/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("User promoted to admin successfully");
        // Refresh users list
        setActiveTab("reports");
        setTimeout(() => setActiveTab("users"), 100);
      } else {
        let errorMessage = "Failed to promote user";
        try {
          const error = await res.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Failed to promote user: ${res.status} ${res.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Promote error:", err);
      alert(
        "Failed to promote user: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke admin privileges?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/user/${userId}/revoke`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("Admin privileges revoked successfully");
        // Refresh users list
        setActiveTab("reports");
        setTimeout(() => setActiveTab("users"), 100);
      } else {
        let errorMessage = "Failed to revoke admin";
        try {
          const error = await res.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Failed to revoke admin: ${res.status} ${res.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Revoke error:", err);
      alert(
        "Failed to revoke admin: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to DELETE this user? This action cannot be undone!"
      )
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("User deleted successfully");
        // Refresh users list
        setActiveTab("reports");
        setTimeout(() => setActiveTab("users"), 100);
      } else {
        let errorMessage = "Failed to delete user";
        try {
          const error = await res.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // Response is not JSON, show status instead
          errorMessage = `Failed to delete user: ${res.status} ${res.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert(
        "Failed to delete user: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  };

  const handleMarkReviewed = async (reportId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/report/${reportId}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Refresh reports
        setActiveTab("users");
        setTimeout(() => setActiveTab("reports"), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const filteredReports = reports.filter(
    (report) =>
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportingUser?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <BannedWarning />
      <Sidebar menuItems={menuItems} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage reports, users, and content</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "reports"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Reports ({reports.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("appeals")}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === "appeals"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Appeals ({appeals.filter((a) => a.status === "pending").length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : activeTab === "reports" ? (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No reports found
              </div>
            ) : (
              filteredReports.map((report, index) => (
                <div
                  key={report.id || `report-${index}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          normalizeImageUrl(report.reportingUser?.profileImg) ||
                          "/tanjiro.jpg"
                        }
                        alt={report.reportingUser?.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">
                          {report.reportingUser?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Report Content */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">
                      Report Reason:
                    </div>
                    <div className="text-gray-600">
                      {report.reason || "No reason provided"}
                    </div>
                  </div>

                  {/* Reported Post */}
                  {report.post && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="font-semibold text-gray-700 mb-2">
                        Reported Post:
                      </div>
                      <div className="text-gray-600 mb-2">
                        {report.post.content}
                      </div>
                      {report.post.imageUrl && (
                        <Image
                          src={normalizeImageUrl(report.post.imageUrl)}
                          alt="Post image"
                          width={200}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Posted by:{" "}
                        {report.post.actor?.user?.name ||
                          report.post.actor?.persona?.displayName ||
                          "Unknown"}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {report.status === "pending" && (
                      <button
                        onClick={() => handleMarkReviewed(report.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {report.post && (
                      <button
                        onClick={() =>
                          handleDeletePost(report.post!.id, report.id)
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Delete Post
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "appeals" ? (
          <div className="space-y-4">
            {appeals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No appeals found
              </div>
            ) : (
              appeals.map((appeal, index) => (
                <div
                  key={appeal.id || `appeal-${index}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  {/* Appeal Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          normalizeImageUrl(appeal.user?.profileImg) ||
                          "/tanjiro.jpg"
                        }
                        alt={appeal.user?.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">
                          {appeal.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appeal.user?.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(appeal.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appeal.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appeal.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appeal.status}
                    </span>
                  </div>

                  {/* Appeal Reason */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-700 mb-2">
                      Appeal Reason:
                    </div>
                    <div className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {appeal.reason}
                    </div>
                  </div>

                  {/* Admin Response */}
                  {appeal.adminResponse && (
                    <div className="mb-4">
                      <div className="font-semibold text-gray-700 mb-2">
                        Admin Response:
                      </div>
                      <div className="text-gray-600 bg-blue-50 p-3 rounded-lg">
                        {appeal.adminResponse}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {appeal.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveAppeal(appeal.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Approve & Unban
                      </button>
                      <button
                        onClick={() => handleRejectAppeal(appeal.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No users found
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id || `user-${index}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={
                          normalizeImageUrl(user.profileImg) || "/tanjiro.jpg"
                        }
                        alt={user.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-lg">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.studentId && (
                          <div className="text-xs text-gray-400">
                            ID: {user.studentId}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1">
                          {user.isAdmin && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                              Admin
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-semibold">
                              Banned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {/* Ban/Unban Buttons */}
                      {!user.isBanned &&
                        !user.isAdmin &&
                        user.id !== currentUser.id && (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                          >
                            Ban User
                          </button>
                        )}
                      {user.isBanned && (
                        <button
                          onClick={() => handleUnbanUser(user.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Unban User
                        </button>
                      )}

                      {/* Admin Promote/Revoke Buttons */}
                      {!user.isAdmin && user.id !== currentUser.id && (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                        >
                          Make Admin
                        </button>
                      )}
                      {user.isAdmin && user.id !== currentUser.id && (
                        <button
                          onClick={() => handleRevokeAdmin(user.id)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                        >
                          Remove Admin
                        </button>
                      )}

                      {/* Delete User Button */}
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition text-sm"
                        >
                          Delete User
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
