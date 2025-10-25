import { Router, RequestHandler } from "express";
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

// Middleware ที่จะทำงานกับทุก Route ในไฟล์นี้
router.use(
  authenticateToken as RequestHandler,
  updateLastActive as RequestHandler
);

// --- ⚙️ Friend Requests ---

// ส่งคำขอเป็นเพื่อน (ต้องระบุ fromActorId และ toActorId ใน body)
// POST /api/friends/request
router.post("/request", sendFriendRequest as RequestHandler);

// ยกเลิกคำขอเป็นเพื่อนที่ส่งไป
// DELETE /api/friends/request/:requestId
router.delete("/request/:requestId", cancelFriendRequest as RequestHandler);

// ดูคำขอเป็นเพื่อนของ Actor ID ที่ระบุ
// GET /api/friends/requests/:actorId
router.get("/requests/:actorId", listFriendRequests as RequestHandler);

// ตอบรับคำขอเป็นเพื่อน
// POST /api/friends/accept/:requestId
router.post("/accept/:requestId", acceptFriendRequest as RequestHandler);

// ปฏิเสธคำขอเป็นเพื่อน
// POST /api/friends/reject/:requestId
router.post("/reject/:requestId", rejectFriendRequest as RequestHandler);

// --- 🤝 Friends ---

// ดึงรายชื่อเพื่อนของ Actor ที่ระบุ
// GET /api/friends/:actorId
router.get("/:actorId", listFriends as RequestHandler);

// ลบเพื่อน
// DELETE /api/friends/:actorId/friends/:friendActorId
router.delete(
  "/:actorId/friends/:friendActorId",
  removeFriend as RequestHandler
);

// ดึงสถานะออนไลน์ของเพื่อนของ Actor ที่ระบุ
// GET /api/friends/:actorId/statuses
router.get("/:actorId/statuses", getFriendStatuses as RequestHandler);

export default router;
