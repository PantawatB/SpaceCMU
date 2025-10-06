import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { FriendRequest } from "../entities/FriendRequest";
import { isUserOnline } from "../socket";

/**
 * 📌 ส่งคำขอเป็นเพื่อน
 */
export async function sendFriendRequest(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { toUserId } = req.body;
    if (!toUserId) {
      return res.status(400).json({ message: "toUserId is required" });
    }

    const fromUser = req.user!;
    if (fromUser.id === toUserId) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const target = await userRepo.findOne({
      where: { id: toUserId },
      relations: ["friends"],
    });
    if (!target) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (fromUser.friends && fromUser.friends.some((f) => f.id === toUserId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const frRepo = AppDataSource.getRepository(FriendRequest);
    const existing = await frRepo.findOne({
      where: { fromUser, toUser: target, status: "pending" },
    });
    if (existing) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const reverse = await frRepo.findOne({
      where: { fromUser: target, toUser: fromUser, status: "pending" },
    });
    if (reverse) {
      return res
        .status(400)
        .json({ message: "Friend request already received" });
    }

    const request = frRepo.create({
      fromUser,
      toUser: target,
      status: "pending",
    });
    await frRepo.save(request);

    return res.status(201).json({ message: "Friend request sent" });
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to send friend request" });
  }
}

/**
 * 📌 ดึงคำขอเป็นเพื่อน (pending)
 */
export async function listFriendRequests(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const frRepo = AppDataSource.getRepository(FriendRequest);

    const requests = await frRepo.find({
      where: [
        { toUser: { id: user.id }, status: "pending" },
        { fromUser: { id: user.id }, status: "pending" },
      ],
      relations: ["fromUser", "toUser"],
    });

    return res.json(requests);
  } catch (err) {
    console.error("listFriendRequests error:", err);
    return res.status(500).json({ message: "Failed to fetch friend requests" });
  }
}

/**
 * 📌 ยอมรับคำขอเพื่อน
 */
export async function acceptFriendRequest(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { requestId } = req.params;
    const user = req.user!;
    const frRepo = AppDataSource.getRepository(FriendRequest);

    const request = await frRepo.findOne({
      where: { id: requestId },
      relations: ["fromUser", "toUser"],
    });

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.toUser.id !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    await frRepo.save(request);

    // add each other to friends
    const userRepo = AppDataSource.getRepository(User);
    const fromUser = await userRepo.findOne({
      where: { id: request.fromUser.id },
      relations: ["friends"],
    });
    const toUser = await userRepo.findOne({
      where: { id: request.toUser.id },
      relations: ["friends"],
    });

    if (fromUser && toUser) {
      fromUser.friends = [...(fromUser.friends || []), toUser];
      toUser.friends = [...(toUser.friends || []), fromUser];
      await userRepo.save(fromUser);
      await userRepo.save(toUser);
    }

    return res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to accept friend request" });
  }
}

/**
 * 📌 ปฏิเสธคำขอเพื่อน
 */
export async function rejectFriendRequest(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { requestId } = req.params;
    const user = req.user!;
    const frRepo = AppDataSource.getRepository(FriendRequest);

    const request = await frRepo.findOne({
      where: { id: requestId },
      relations: ["toUser"],
    });

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.toUser.id !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "declined";
    await frRepo.save(request);

    return res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("rejectFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to reject friend request" });
  }
}

/**
 * 📌 ดึงเพื่อนทั้งหมด
 */
export async function listFriends(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const friends = user.friends || [];
    const result = friends.map((f) => ({ id: f.id, name: f.name }));
    return res.json(result);
  } catch (err) {
    console.error("listFriends error:", err);
    return res.status(500).json({ message: "Failed to fetch friends list" });
  }
}

/**
 * 📌 ลบเพื่อน
 */
export async function removeFriend(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { friendId } = req.params;
    const user = req.user!;
    const userRepo = AppDataSource.getRepository(User);

    const friend = await userRepo.findOne({
      where: { id: friendId },
      relations: ["friends"],
    });
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    user.friends = (user.friends || []).filter((f) => f.id !== friendId);
    friend.friends = (friend.friends || []).filter((f) => f.id !== user.id);

    await userRepo.save(user);
    await userRepo.save(friend);

    return res.json({ message: "Friend removed" });
  } catch (err) {
    console.error("removeFriend error:", err);
    return res.status(500).json({ message: "Failed to remove friend" });
  }
}

/**
 * 📌 ดึงสถานะออนไลน์ของเพื่อนทั้งหมด
 */
export async function getFriendStatuses(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user || !user.friends) return res.json([]);

    const statuses = user.friends.map((friend) => ({
      userId: friend.id,
      name: friend.name,
      isOnline: isUserOnline(friend.id), // เช็คจาก Map ของ Socket.IO
      lastActiveAt: friend.lastActiveAt, // ดึงจาก database
    }));

    return res.json(statuses);
  } catch (err) {
    console.error("getFriendStatuses error:", err);
    return res.status(500).json({ message: "Failed to fetch friend statuses" });
  }
}
