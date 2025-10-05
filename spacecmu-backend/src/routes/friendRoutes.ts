import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  listFriends,
  listFriendRequests,
} from "../controllers/friendController";

const router = Router();

// ทุก route เกี่ยวกับ friend ต้อง login ก่อน
router.use(authenticateToken);

// 📌 ส่งคำขอเป็นเพื่อน
// POST /api/friends/request
router.post("/request", sendFriendRequest);

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

export default router;
