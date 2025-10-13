"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequest = sendFriendRequest;
exports.cancelFriendRequest = cancelFriendRequest;
exports.listFriendRequests = listFriendRequests;
exports.acceptFriendRequest = acceptFriendRequest;
exports.rejectFriendRequest = rejectFriendRequest;
exports.listFriends = listFriends;
exports.removeFriend = removeFriend;
exports.getFriendStatuses = getFriendStatuses;
const ormconfig_1 = require("../ormconfig");
const Actor_1 = require("../entities/Actor");
const FriendRequest_1 = require("../entities/FriendRequest");
const serialize_1 = require("../utils/serialize");
const socket_1 = require("../socket");
/**
 * 📌 ส่งคำขอเป็นเพื่อน
 */
function sendFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromActorId, toActorId } = req.body;
            const user = req.user;
            if (!fromActorId || !toActorId) {
                return res
                    .status(400)
                    .json({ message: "fromActorId and toActorId are required" });
            }
            if (fromActorId === toActorId) {
                return res
                    .status(400)
                    .json({ message: "Cannot send friend request to yourself" });
            }
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const fromActor = yield actorRepo.findOne({
                where: { id: fromActorId },
                relations: ["user", "persona.user"],
            });
            if (!fromActor) {
                return res.status(404).json({ message: "Sending actor not found" });
            }
            const isOwner = (fromActor.user && fromActor.user.id === user.id) ||
                (fromActor.persona && fromActor.persona.user.id === user.id);
            if (!isOwner) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to send request from this actor" });
            }
            const toActor = yield actorRepo.findOneBy({ id: toActorId });
            if (!toActor) {
                return res.status(404).json({ message: "Target actor not found" });
            }
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const anyExistingRequest = yield frRepo.findOne({
                where: [
                    { fromActor: { id: fromActorId }, toActor: { id: toActorId } },
                    { fromActor: { id: toActorId }, toActor: { id: fromActorId } },
                ],
            });
            if (anyExistingRequest) {
                if (anyExistingRequest.status === "pending") {
                    return res
                        .status(400)
                        .json({ message: "Friend request is already pending" });
                }
                yield frRepo.remove(anyExistingRequest);
            }
            const request = frRepo.create({
                fromActor,
                toActor,
                status: "pending",
            });
            yield frRepo.save(request);
            const requestData = {
                id: request.id,
                fromActorId: fromActor.id,
                toActorId: toActor.id,
                status: "pending",
                sentAt: new Date().toISOString(),
            };
            return res
                .status(201)
                .json((0, serialize_1.createResponse)("Friend request sent", requestData));
        }
        catch (err) {
            console.error("sendFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to send friend request" });
        }
    });
}
/**
 * 📌 ยกเลิกคำขอเป็นเพื่อนที่ส่งไประหว่าง Actors
 */
function cancelFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const request = yield frRepo.findOne({
                where: { id: requestId },
                relations: ["fromActor", "fromActor.user", "fromActor.persona.user"],
            });
            if (!request) {
                return res.status(404).json({ message: "Friend request not found" });
            }
            const isOwner = (request.fromActor.user && request.fromActor.user.id === user.id) ||
                (request.fromActor.persona &&
                    request.fromActor.persona.user.id === user.id);
            if (!isOwner) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to cancel this request" });
            }
            yield frRepo.remove(request);
            return res.status(200).json({ message: "Friend request cancelled" });
        }
        catch (err) {
            console.error("cancelFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to cancel friend request" });
        }
    });
}
/**
 * 📌 ดึงคำขอเป็นเพื่อนสำหรับ Actor ID ที่ระบุ
 */
function listFriendRequests(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { actorId } = req.params;
            if (!actorId) {
                return res
                    .status(400)
                    .json({ message: "Actor ID is required in the URL path" });
            }
            const isOwnerOfActor = (user.actor && user.actor.id === actorId) ||
                (user.persona && user.persona.actor && user.persona.actor.id === actorId);
            if (!isOwnerOfActor) {
                return res.status(403).json({
                    message: "Forbidden: You can only view your own friend requests.",
                });
            }
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const requests = yield frRepo.find({
                where: [
                    { toActor: { id: actorId }, status: "pending" },
                    { fromActor: { id: actorId }, status: "pending" },
                ],
                relations: [
                    "fromActor",
                    "fromActor.user",
                    "fromActor.persona",
                    "toActor",
                    "toActor.user",
                    "toActor.persona",
                ],
                order: { createdAt: "DESC" },
            });
            const response = {
                incoming: [],
                outgoing: [],
            };
            for (const req of requests) {
                const formattedReq = {
                    id: req.id,
                    from: req.fromActor.user
                        ? {
                            name: req.fromActor.user.name,
                            type: "user",
                            actorId: req.fromActor.id,
                            profileImg: req.fromActor.user.profileImg,
                        }
                        : {
                            name: req.fromActor.persona.displayName,
                            type: "persona",
                            actorId: req.fromActor.id,
                            profileImg: req.fromActor.persona.avatarUrl,
                        },
                    to: req.toActor.user
                        ? {
                            name: req.toActor.user.name,
                            type: "user",
                            actorId: req.toActor.id,
                            profileImg: req.toActor.user.profileImg,
                        }
                        : {
                            name: req.toActor.persona.displayName,
                            type: "persona",
                            actorId: req.toActor.id,
                            profileImg: req.toActor.persona.avatarUrl,
                        },
                    status: req.status,
                };
                if (req.toActor.id === actorId) {
                    response.incoming.push(formattedReq);
                }
                else {
                    response.outgoing.push(formattedReq);
                }
            }
            return res.json(response);
        }
        catch (err) {
            console.error("listFriendRequests error:", err);
            return res.status(500).json({ message: "Failed to fetch friend requests" });
        }
    });
}
/**
 * 📌 ตอบรับคำขอเป็นเพื่อนระหว่าง Actors
 */
function acceptFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const request = yield frRepo.findOne({
                where: { id: requestId },
                relations: [
                    "fromActor",
                    "toActor",
                    "toActor.user",
                    "toActor.persona.user",
                ],
            });
            if (!request || request.status !== "pending") {
                return res.status(404).json({
                    message: "Friend request not found or has already been handled",
                });
            }
            const isReceiver = (request.toActor.user && request.toActor.user.id === user.id) ||
                (request.toActor.persona && request.toActor.persona.user.id === user.id);
            if (!isReceiver) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to accept this request" });
            }
            request.status = "accepted";
            yield frRepo.save(request);
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const fromActor = yield actorRepo.findOne({
                where: { id: request.fromActor.id },
                relations: ["friends"],
            });
            const toActor = yield actorRepo.findOne({
                where: { id: request.toActor.id },
                relations: ["friends"],
            });
            if (fromActor && toActor) {
                if (!fromActor.friends)
                    fromActor.friends = [];
                if (!toActor.friends)
                    toActor.friends = [];
                fromActor.friends.push(toActor);
                toActor.friends.push(fromActor);
                yield actorRepo.save([fromActor, toActor]);
            }
            // Return the updated friendship data
            const friendshipData = {
                requestId,
                fromActorId: request.fromActor.id,
                toActorId: request.toActor.id,
                status: "accepted",
                acceptedAt: new Date().toISOString(),
            };
            return res.json((0, serialize_1.createResponse)("Friend request accepted", friendshipData));
        }
        catch (err) {
            console.error("acceptFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to accept friend request" });
        }
    });
}
/**
 * 📌 ปฏิเสธคำขอเป็นเพื่อนระหว่าง Actors
 */
function rejectFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const request = yield frRepo.findOne({
                where: { id: requestId },
                relations: ["toActor", "toActor.user", "toActor.persona.user"],
            });
            if (!request || request.status !== "pending") {
                return res.status(404).json({
                    message: "Friend request not found or has already been handled",
                });
            }
            const isReceiver = (request.toActor.user && request.toActor.user.id === user.id) ||
                (request.toActor.persona && request.toActor.persona.user.id === user.id);
            if (!isReceiver) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to reject this request" });
            }
            request.status = "declined";
            yield frRepo.save(request);
            return res.json({ message: "Friend request rejected" });
        }
        catch (err) {
            console.error("rejectFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to reject friend request" });
        }
    });
}
/**
 * 📌 ดึงรายชื่อเพื่อนของ Actor ที่ระบุ (พร้อมฟังก์ชันค้นหาจากชื่อ)
 */
function listFriends(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { actorId } = req.params;
            const { name } = req.query;
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const actor = yield actorRepo.findOne({
                where: { id: actorId },
                relations: [
                    "friends",
                    "friends.user",
                    "friends.persona",
                    "friends.user.actor",
                    "friends.persona.actor",
                ],
            });
            if (!actor) {
                return res.status(404).json({ message: "Actor not found" });
            }
            let friends = (actor.friends || [])
                .map((friend) => {
                if (friend.user) {
                    return {
                        actorId: friend.id,
                        name: friend.user.name,
                        type: "user",
                        profileImg: friend.user.profileImg,
                        bio: friend.user.bio,
                    };
                }
                if (friend.persona) {
                    return {
                        actorId: friend.id,
                        name: friend.persona.displayName,
                        type: "persona",
                        profileImg: friend.persona.avatarUrl,
                        bio: friend.persona.bio,
                    };
                }
                return null;
            })
                .filter(Boolean);
            if (name && typeof name === "string") {
                const searchTerm = name.toLowerCase();
                friends = friends.filter((friend) => friend.name.toLowerCase().includes(searchTerm));
            }
            return res.json(friends);
        }
        catch (err) {
            console.error("listFriends error:", err);
            return res.status(500).json({ message: "Failed to fetch friends list" });
        }
    });
}
/**
 * 📌 ลบเพื่อนระหว่าง Actors
 */
function removeFriend(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { actorId, friendActorId } = req.params;
            const user = req.user;
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const fromActor = yield actorRepo.findOne({
                where: { id: actorId },
                relations: ["friends", "user", "persona.user"],
            });
            if (!fromActor) {
                return res
                    .status(404)
                    .json({ message: "Your actor profile was not found" });
            }
            const isOwner = (fromActor.user && fromActor.user.id === user.id) ||
                (fromActor.persona && fromActor.persona.user.id === user.id);
            if (!isOwner) {
                return res.status(403).json({
                    message: "Not authorized to remove friends from this profile",
                });
            }
            const friendToRemove = yield actorRepo.findOne({
                where: { id: friendActorId },
                relations: ["friends"],
            });
            if (!friendToRemove) {
                return res.status(404).json({ message: "Friend actor not found" });
            }
            fromActor.friends = (fromActor.friends || []).filter((f) => f.id !== friendActorId);
            friendToRemove.friends = (friendToRemove.friends || []).filter((f) => f.id !== actorId);
            yield actorRepo.save([fromActor, friendToRemove]);
            return res.json({ message: "Friend removed" });
        }
        catch (err) {
            console.error("removeFriend error:", err);
            return res.status(500).json({ message: "Failed to remove friend" });
        }
    });
}
/**
 * 📌 ดึงสถานะออนไลน์ของเพื่อนทั้งหมดของ Actor ที่ระบุ
 */
function getFriendStatuses(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { actorId } = req.params;
            const actorRepo = ormconfig_1.AppDataSource.getRepository(Actor_1.Actor);
            const actor = yield actorRepo.findOne({
                where: { id: actorId },
                relations: [
                    "friends",
                    "friends.user",
                    "friends.persona",
                    "friends.persona.user",
                ],
            });
            if (!actor) {
                return res.status(404).json({ message: "Actor not found" });
            }
            const statuses = (actor.friends || [])
                .map((friendActor) => {
                if (friendActor.user) {
                    return {
                        actorId: friendActor.id,
                        name: friendActor.user.name,
                        type: "user",
                        isOnline: (0, socket_1.isUserOnline)(friendActor.user.id),
                        lastActiveAt: friendActor.user.lastActiveAt,
                    };
                }
                if (friendActor.persona && friendActor.persona.user) {
                    const underlyingUser = friendActor.persona.user;
                    return {
                        actorId: friendActor.id,
                        name: friendActor.persona.displayName,
                        type: "persona",
                        isOnline: (0, socket_1.isUserOnline)(underlyingUser.id),
                        lastActiveAt: underlyingUser.lastActiveAt,
                    };
                }
                return null;
            })
                .filter(Boolean);
            return res.json(statuses);
        }
        catch (err) {
            console.error("getFriendStatuses error:", err);
            return res.status(500).json({ message: "Failed to fetch friend statuses" });
        }
    });
}
