"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/apiConfig";

export default function BannedWarning() {
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("User ban status:", data.isBanned); // Debug log
          setIsBanned(data.isBanned || false);
        }
      } catch (error) {
        console.error("Error checking ban status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkBanStatus();
  }, []);

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim()) {
      alert("Please provide a reason for your appeal");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/appeals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: appealReason }),
      });

      if (res.ok) {
        alert("Appeal submitted successfully! An admin will review it soon.");
        setShowAppealModal(false);
        setAppealReason("");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to submit appeal");
      }
    } catch (error) {
      console.error("Error submitting appeal:", error);
      alert("Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !isBanned) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-bold text-lg">Your Account Has Been Banned</p>
              <p className="text-sm">
                You cannot create posts, comment, or interact with content.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAppealModal(true)}
            className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Appeal Ban
          </button>
        </div>
      </div>

      {/* Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Appeal Your Ban
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Please explain why you believe your ban should be lifted. An admin
              will review your appeal.
            </p>
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Enter your appeal reason..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAppealModal(false);
                  setAppealReason("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAppeal}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Appeal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
