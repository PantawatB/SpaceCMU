import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { BanAppeal } from "../entities/BanAppeal";
import { User } from "../entities/User";

/**
 * 📌 สร้างคำร้องขออุทธรณ์ (Banned user only)
 */
export async function createAppeal(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!user.isBanned) {
      return res.status(400).json({ message: "You are not banned" });
    }

    const { reason } = req.body;
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // Check if user already has a pending appeal
    const appealRepo = AppDataSource.getRepository(BanAppeal);
    const existingAppeal = await appealRepo.findOne({
      where: { user: { id: user.id }, status: "pending" },
    });

    if (existingAppeal) {
      return res
        .status(400)
        .json({ message: "You already have a pending appeal" });
    }

    const appeal = appealRepo.create({
      user: user,
      reason: reason.trim(),
      status: "pending",
    });

    await appealRepo.save(appeal);

    return res.json({
      message: "Appeal submitted successfully",
      appeal: {
        id: appeal.id,
        reason: appeal.reason,
        status: appeal.status,
        createdAt: appeal.createdAt,
      },
    });
  } catch (err) {
    console.error("createAppeal error:", err);
    return res.status(500).json({ message: "Failed to create appeal" });
  }
}

/**
 * 📌 ดูคำร้องของตัวเอง (Banned user)
 */
export async function getMyAppeals(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const appealRepo = AppDataSource.getRepository(BanAppeal);
    const appeals = await appealRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: "DESC" },
    });

    return res.json(appeals);
  } catch (err) {
    console.error("getMyAppeals error:", err);
    return res.status(500).json({ message: "Failed to fetch appeals" });
  }
}

/**
 * 📌 ดูคำร้องทั้งหมด (Admin only)
 */
export async function listAppeals(req: Request, res: Response) {
  try {
    const status = req.query.status as
      | "pending"
      | "approved"
      | "rejected"
      | undefined;

    const appealRepo = AppDataSource.getRepository(BanAppeal);
    const where = status ? { status } : {};
    const appeals = await appealRepo.find({
      where,
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    return res.json(appeals);
  } catch (err) {
    console.error("listAppeals error:", err);
    return res.status(500).json({ message: "Failed to fetch appeals" });
  }
}

/**
 * 📌 อนุมัติคำร้อง (Admin only) - ปลดแบนทันที
 */
export async function approveAppeal(req: Request, res: Response) {
  try {
    const { appealId } = req.params;
    const { response } = req.body;

    const appealRepo = AppDataSource.getRepository(BanAppeal);
    const appeal = await appealRepo.findOne({
      where: { id: appealId },
      relations: ["user"],
    });

    if (!appeal) {
      return res.status(404).json({ message: "Appeal not found" });
    }

    if (appeal.status !== "pending") {
      return res.status(400).json({ message: "Appeal already processed" });
    }

    // Unban user
    const userRepo = AppDataSource.getRepository(User);
    appeal.user.isBanned = false;
    await userRepo.save(appeal.user);

    // Update appeal
    appeal.status = "approved";
    appeal.adminResponse =
      response || "Appeal approved. You have been unbanned.";
    await appealRepo.save(appeal);

    return res.json({ message: "Appeal approved and user unbanned", appeal });
  } catch (err) {
    console.error("approveAppeal error:", err);
    return res.status(500).json({ message: "Failed to approve appeal" });
  }
}

/**
 * 📌 ปฏิเสธคำร้อง (Admin only)
 */
export async function rejectAppeal(req: Request, res: Response) {
  try {
    const { appealId } = req.params;
    const { response } = req.body;

    const appealRepo = AppDataSource.getRepository(BanAppeal);
    const appeal = await appealRepo.findOne({
      where: { id: appealId },
      relations: ["user"],
    });

    if (!appeal) {
      return res.status(404).json({ message: "Appeal not found" });
    }

    if (appeal.status !== "pending") {
      return res.status(400).json({ message: "Appeal already processed" });
    }

    appeal.status = "rejected";
    appeal.adminResponse = response || "Appeal rejected.";
    await appealRepo.save(appeal);

    return res.json({ message: "Appeal rejected", appeal });
  } catch (err) {
    console.error("rejectAppeal error:", err);
    return res.status(500).json({ message: "Failed to reject appeal" });
  }
}
