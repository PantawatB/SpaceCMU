"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const friendController_1 = require("../controllers/friendController");
const updateLastActive_1 = require("../middleware/updateLastActive");
const router = (0, express_1.Router)();
// Middleware ที่จะทำงานกับทุก Route ในไฟล์นี้
router.use(auth_1.authenticateToken, updateLastActive_1.updateLastActive);
// --- ⚙️ Friend Requests ---
// ส่งคำขอเป็นเพื่อน (ต้องระบุ fromActorId และ toActorId ใน body)
// POST /api/friends/request
router.post("/request", friendController_1.sendFriendRequest);
// ยกเลิกคำขอเป็นเพื่อนที่ส่งไป
// DELETE /api/friends/request/:requestId
router.delete("/request/:requestId", friendController_1.cancelFriendRequest);
// ดูคำขอเป็นเพื่อนของ Actor ID ที่ระบุ
// GET /api/friends/requests/:actorId
router.get("/requests/:actorId", friendController_1.listFriendRequests);
// ตอบรับคำขอเป็นเพื่อน
// POST /api/friends/accept/:requestId
router.post("/accept/:requestId", friendController_1.acceptFriendRequest);
// ปฏิเสธคำขอเป็นเพื่อน
// POST /api/friends/reject/:requestId
router.post("/reject/:requestId", friendController_1.rejectFriendRequest);
// --- 🤝 Friends ---
// ดึงรายชื่อเพื่อนของ Actor ที่ระบุ
// GET /api/friends/:actorId
router.get("/:actorId", friendController_1.listFriends);
// ลบเพื่อน
// DELETE /api/friends/:actorId/friends/:friendActorId
router.delete("/:actorId/friends/:friendActorId", friendController_1.removeFriend);
// ดึงสถานะออนไลน์ของเพื่อนของ Actor ที่ระบุ
// GET /api/friends/:actorId/statuses
router.get("/:actorId/statuses", friendController_1.getFriendStatuses);
exports.default = router;
