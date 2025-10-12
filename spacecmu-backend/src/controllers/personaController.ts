import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Persona } from "../entities/Persona";
import { User } from "../entities/User";

/**
 * 📌 ดึง persona ของ user ที่ล็อกอิน
 */
export async function getMyPersona(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    return res.json({ persona: user.persona || null });
  } catch (err) {
    console.error("getMyPersona error:", err);
    return res.status(500).json({ message: "Failed to fetch persona" });
  }
}

/**
 * 📌 ดึง persona ตาม userId
 */
export async function getPersona(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["persona"],
    });

    if (!user || !user.persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    return res.json(user.persona);
  } catch (err) {
    console.error("getPersona error:", err);
    return res.status(500).json({ message: "Failed to fetch persona" });
  }
}

/**
 * 📌 ดึง personas ทั้งหมด (admin/debug use)
 */
export async function listPersonas(req: Request, res: Response) {
  try {
    const personaRepo = AppDataSource.getRepository(Persona);
    const personas = await personaRepo.find({ relations: ["user"] });
    return res.json(personas);
  } catch (err) {
    console.error("listPersonas error:", err);
    return res.status(500).json({ message: "Failed to fetch personas" });
  }
}

/**
 * 📌 สร้าง persona ใหม่ (ครั้งแรกของ user)
 */
export async function createPersona(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { displayName, avatarUrl, bio } = req.body;
    if (!displayName) {
      return res.status(400).json({ message: "displayName is required" });
    }

    if (user.persona) {
      return res
        .status(400)
        .json({ message: "Persona already exists, use updatePersona" });
    }

    const personaRepo = AppDataSource.getRepository(Persona);
    const persona = personaRepo.create({
      displayName,
      avatarUrl,
      bio,
      changeCount: 1,
      lastChangedAt: new Date(),
      user,
    });

    await personaRepo.save(persona);

    const userRepo = AppDataSource.getRepository(User);
    user.persona = persona;
    await userRepo.save(user);

    return res.status(201).json({ message: "Persona created", persona });
  } catch (err) {
    console.error("createPersona error:", err);
    return res.status(500).json({ message: "Failed to create persona" });
  }
}

/**
 * 📌 อัปเดต persona ของ user
 */
export async function updatePersona(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user || !user.persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    const { displayName, avatarUrl, bio, bannerImg } = req.body;
    const personaRepo = AppDataSource.getRepository(Persona);
    const persona = user.persona;

    if (displayName) persona.displayName = displayName;
    if (avatarUrl) persona.avatarUrl = avatarUrl;
    if (typeof bio !== "undefined") persona.bio = bio;
    if (typeof bannerImg !== "undefined") {
      persona.bannerImg = bannerImg;
    }
    persona.changeCount += 1;
    persona.lastChangedAt = new Date();

    await personaRepo.save(persona);

    return res.json({ message: "Persona updated", persona });
  } catch (err) {
    console.error("updatePersona error:", err);
    return res.status(500).json({ message: "Failed to update persona" });
  }
}

/**
 * 📌 ลบ persona ของ user
 */
export async function deletePersona(
  req: Request & { user?: User },
  res: Response
) {
  try {
    const user = req.user;
    if (!user || !user.persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    const personaRepo = AppDataSource.getRepository(Persona);
    await personaRepo.remove(user.persona);

    const userRepo = AppDataSource.getRepository(User);
    user.persona = null as any;
    await userRepo.save(user);

    return res.json({ message: "Persona deleted" });
  } catch (err) {
    console.error("deletePersona error:", err);
    return res.status(500).json({ message: "Failed to delete persona" });
  }
}
