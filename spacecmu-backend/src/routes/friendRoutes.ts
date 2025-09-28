import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  listFriends,
} from "../controllers/friendController";

const router = Router();

// ทุก route เกี่ยวกับ friend ต้อง login ก่อน
router.use(authenticateToken);

// 📌 ส่งคำขอเป็นเพื่อน
// POST /api/friends/request/:friendId
router.post("/request/:friendId", sendFriendRequest);

// 📌 ยอมรับคำขอเป็นเพื่อน
// POST /api/friends/accept/:friendId
router.post("/accept/:friendId", acceptFriendRequest);

// 📌 ปฏิเสธคำขอเป็นเพื่อน
// POST /api/friends/reject/:friendId
router.post("/reject/:friendId", rejectFriendRequest);

// 📌 ลบเพื่อน
// DELETE /api/friends/:friendId
router.delete("/:friendId", removeFriend);

// 📌 ดูเพื่อนทั้งหมด
// GET /api/friends
router.get("/", listFriends);

export default router;
