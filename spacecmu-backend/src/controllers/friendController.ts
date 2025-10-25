import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { Actor } from "../entities/Actor";
import { FriendRequest } from "../entities/FriendRequest";
import { createResponse } from "../utils/serialize";

import { In } from "typeorm";

/**
 * 📌 ส่งคำขอเป็นเพื่อน
 */
export async function sendFriendRequest(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { fromActorId, toActorId } = req.body;
    const user = req.user!;

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

    const actorRepo = AppDataSource.getRepository(Actor);

    const fromActor = await actorRepo.findOne({
      where: { id: fromActorId },
      relations: ["user", "persona.user"],
    });

    if (!fromActor) {
      return res.status(404).json({ message: "Sending actor not found" });
    }

    const isOwner =
      (fromActor.user && fromActor.user.id === user.id) ||
      (fromActor.persona && fromActor.persona.user.id === user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to send request from this actor" });
    }

    const toActor = await actorRepo.findOneBy({ id: toActorId });
    if (!toActor) {
      return res.status(404).json({ message: "Target actor not found" });
    }

    const frRepo = AppDataSource.getRepository(FriendRequest);
    const anyExistingRequest = await frRepo.findOne({
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

      await frRepo.remove(anyExistingRequest);
    }
    const request = frRepo.create({
      fromActor,
      toActor,
      status: "pending",
    });
    await frRepo.save(request);

    const requestData = {
      id: request.id,
      fromActorId: fromActor.id,
      toActorId: toActor.id,
      status: "pending",
      sentAt: new Date().toISOString(),
    };

    return res
      .status(201)
      .json(createResponse("Friend request sent", requestData));
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to send friend request" });
  }
}

/**
 * 📌 ยกเลิกคำขอเป็นเพื่อนที่ส่งไประหว่าง Actors
 */
export async function cancelFriendRequest(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { requestId } = req.params;
    const user = req.user!;

    const frRepo = AppDataSource.getRepository(FriendRequest);
    const request = await frRepo.findOne({
      where: { id: requestId },
      relations: ["fromActor", "fromActor.user", "fromActor.persona.user"],
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    const isOwner =
      (request.fromActor.user && request.fromActor.user.id === user.id) ||
      (request.fromActor.persona &&
        request.fromActor.persona.user.id === user.id);

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this request" });
    }

    await frRepo.remove(request);

    return res.status(200).json({ message: "Friend request cancelled" });
  } catch (err) {
    console.error("cancelFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to cancel friend request" });
  }
}

/**
 * 📌 ดึงคำขอเป็นเพื่อนสำหรับ Actor ID ที่ระบุ
 */
export async function listFriendRequests(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user!;
    const { actorId } = req.params;

    if (!actorId) {
      return res
        .status(400)
        .json({ message: "Actor ID is required in the URL path" });
    }

    const isOwnerOfActor =
      (user.actor && user.actor.id === actorId) ||
      (user.persona && user.persona.actor && user.persona.actor.id === actorId);

    if (!isOwnerOfActor) {
      return res.status(403).json({
        message: "Forbidden: You can only view your own friend requests.",
      });
    }

    const frRepo = AppDataSource.getRepository(FriendRequest);

    const requests = await frRepo.find({
      where: [
        { toActor: { id: actorId }, status: "pending" },
        { fromActor: { id: actorId }, status: "pending" },
      ],
      relations: [
        "fromActor",
        "fromActor.user",
        "fromActor.persona",
        "fromActor.persona.user", // ✅ Load persona.user for userId
        "toActor",
        "toActor.user",
        "toActor.persona",
        "toActor.persona.user", // ✅ Load persona.user for userId
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
              userId: req.fromActor.user.id, // ✅ Add userId for chat creation
              name: req.fromActor.user.name,
              type: "user",
              actorId: req.fromActor.id,
              profileImg: req.fromActor.user.profileImg,
            }
          : {
              userId: req.fromActor.persona!.user?.id, // ✅ Add userId for chat creation
              name: req.fromActor.persona!.displayName,
              type: "persona",
              actorId: req.fromActor.id,
              profileImg: req.fromActor.persona!.avatarUrl,
            },
        to: req.toActor.user
          ? {
              userId: req.toActor.user.id, // ✅ Add userId for chat creation
              name: req.toActor.user.name,
              type: "user",
              actorId: req.toActor.id,
              profileImg: req.toActor.user.profileImg,
            }
          : {
              userId: req.toActor.persona!.user?.id, // ✅ Add userId for chat creation
              name: req.toActor.persona!.displayName,
              type: "persona",
              actorId: req.toActor.id,
              profileImg: req.toActor.persona!.avatarUrl,
            },
        status: req.status,
      };

      if (req.toActor.id === actorId) {
        (response.incoming as any).push(formattedReq);
      } else {
        (response.outgoing as any).push(formattedReq);
      }
    }

    return res.json(response);
  } catch (err) {
    console.error("listFriendRequests error:", err);
    return res.status(500).json({ message: "Failed to fetch friend requests" });
  }
}

/**
 * 📌 ตอบรับคำขอเป็นเพื่อนระหว่าง Actors
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

    const isReceiver =
      (request.toActor.user && request.toActor.user.id === user.id) ||
      (request.toActor.persona && request.toActor.persona.user.id === user.id);

    if (!isReceiver) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    request.status = "accepted";
    await frRepo.save(request);

    const actorRepo = AppDataSource.getRepository(Actor);
    const fromActor = await actorRepo.findOne({
      where: { id: request.fromActor.id },
      relations: ["friends"],
    });
    const toActor = await actorRepo.findOne({
      where: { id: request.toActor.id },
      relations: ["friends"],
    });

    if (fromActor && toActor) {
      if (!fromActor.friends) fromActor.friends = [];
      if (!toActor.friends) toActor.friends = [];

      fromActor.friends.push(toActor);
      toActor.friends.push(fromActor);

      await actorRepo.save([fromActor, toActor]);
    }

    // Return the updated friendship data
    const friendshipData = {
      requestId,
      fromActorId: request.fromActor.id,
      toActorId: request.toActor.id,
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    };

    return res.json(createResponse("Friend request accepted", friendshipData));
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    return res.status(500).json({ message: "Failed to accept friend request" });
  }
}

/**
 * 📌 ปฏิเสธคำขอเป็นเพื่อนระหว่าง Actors
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
      relations: ["toActor", "toActor.user", "toActor.persona.user"],
    });

    if (!request || request.status !== "pending") {
      return res.status(404).json({
        message: "Friend request not found or has already been handled",
      });
    }

    const isReceiver =
      (request.toActor.user && request.toActor.user.id === user.id) ||
      (request.toActor.persona && request.toActor.persona.user.id === user.id);

    if (!isReceiver) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
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
 * 📌 ดึงรายชื่อเพื่อนของ Actor ที่ระบุ (พร้อมฟังก์ชันค้นหาจากชื่อ)
 */
export async function listFriends(req: Request, res: Response) {
  try {
    const { actorId } = req.params;
    const { name } = req.query;

    const actorRepo = AppDataSource.getRepository(Actor);
    const actor = await actorRepo.findOne({
      where: { id: actorId },
      relations: [
        "friends",
        "friends.user",
        "friends.persona",
        "friends.persona.user", // ✅ Load persona.user for userId
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
            userId: friend.user.id, // ✅ Add userId for chat creation
            name: friend.user.name,
            type: "user",
            profileImg: friend.user.profileImg,
            bannerImg: friend.user.bannerImg,
            bio: friend.user.bio,
          };
        }
        if (friend.persona) {
          return {
            actorId: friend.id,
            userId: friend.persona.user?.id, // ✅ Add userId for chat creation (persona's owner)
            name: friend.persona.displayName,
            type: "persona",
            profileImg: friend.persona.avatarUrl,
            bannerImg: friend.persona.bannerImg,
            bio: friend.persona.bio,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (name && typeof name === "string") {
      const searchTerm = name.toLowerCase();
      friends = friends.filter((friend) =>
        friend!.name.toLowerCase().includes(searchTerm)
      );
    }

    return res.json(friends);
  } catch (err) {
    console.error("listFriends error:", err);
    return res.status(500).json({ message: "Failed to fetch friends list" });
  }
}

/**
 * 📌 ลบเพื่อนระหว่าง Actors
 */
export async function removeFriend(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const { actorId, friendActorId } = req.params;
    const user = req.user!;

    const actorRepo = AppDataSource.getRepository(Actor);

    const fromActor = await actorRepo.findOne({
      where: { id: actorId },
      relations: ["friends", "user", "persona.user"],
    });

    if (!fromActor) {
      return res
        .status(404)
        .json({ message: "Your actor profile was not found" });
    }

    const isOwner =
      (fromActor.user && fromActor.user.id === user.id) ||
      (fromActor.persona && fromActor.persona.user.id === user.id);
    if (!isOwner) {
      return res.status(403).json({
        message: "Not authorized to remove friends from this profile",
      });
    }
    const friendToRemove = await actorRepo.findOne({
      where: { id: friendActorId },
      relations: ["friends"],
    });

    if (!friendToRemove) {
      return res.status(404).json({ message: "Friend actor not found" });
    }

    fromActor.friends = (fromActor.friends || []).filter(
      (f) => f.id !== friendActorId
    );
    friendToRemove.friends = (friendToRemove.friends || []).filter(
      (f) => f.id !== actorId
    );

    await actorRepo.save([fromActor, friendToRemove]);

    return res.json({ message: "Friend removed" });
  } catch (err) {
    console.error("removeFriend error:", err);
    return res.status(500).json({ message: "Failed to remove friend" });
  }
}

/**
 * 📌 ดึงสถานะออนไลน์ของเพื่อนทั้งหมดของ Actor ที่ระบุ
 */
export async function getFriendStatuses(req: Request, res: Response) {
  try {
    const { actorId } = req.params;

    const actorRepo = AppDataSource.getRepository(Actor);
    const actor = await actorRepo.findOne({
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
            isOnline: false, // Socket.IO removed - always show offline
            lastActiveAt: friendActor.user.lastActiveAt,
          };
        }
        if (friendActor.persona && friendActor.persona.user) {
          const underlyingUser = friendActor.persona.user;
          return {
            actorId: friendActor.id,
            name: friendActor.persona.displayName,
            type: "persona",
            isOnline: false, // Socket.IO removed - always show offline
            lastActiveAt: underlyingUser.lastActiveAt,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json(statuses);
  } catch (err) {
    console.error("getFriendStatuses error:", err);
    return res.status(500).json({ message: "Failed to fetch friend statuses" });
  }
}
