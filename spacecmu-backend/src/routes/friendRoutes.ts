import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  listFriends,
  listFriendRequests,
  cancelFriendRequest,
  getFriendStatuses,
} from "../controllers/friendController";
import { updateLastActive } from "../middleware/updateLastActive";

const router = Router();

// ทุก route เกี่ยวกับ friend ต้อง login ก่อน
router.use(authenticateToken, updateLastActive);

// 📌 ส่งคำขอเป็นเพื่อน
// POST /api/friends/request
router.post("/request", sendFriendRequest);

// 📌 ยกเลิกคำขอเป็นเพื่อน
// DELETE /api/friends/request/:requestId
router.delete("/request/:requestId", cancelFriendRequest);

// 📌 ยอมรับคำขอเป็นเพื่อน
// POST /api/friends/accept/:friendId
router.post("/accept/:requestId", acceptFriendRequest);

// 📌 ดูคำขอเป็นเพื่อนทั้งหมด
router.get("/requests", listFriendRequests);

// 📌 ปฏิเสธคำขอเป็นเพื่อน
// POST /api/friends/reject/:requestId
router.post("/reject/:requestId", rejectFriendRequest);

// 📌 ลบเพื่อน
// DELETE /api/friends/:friendId
router.delete("/:friendId", removeFriend);

// 📌 ดูเพื่อนทั้งหมด
// GET /api/friends
router.get("/", listFriends);

// 📌 ดูสถานะของเพื่อน
// GET /api/friends/statuses
router.get("/statuses", getFriendStatuses);

export default router;
