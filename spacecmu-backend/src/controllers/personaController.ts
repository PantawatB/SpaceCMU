import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Persona } from '../entities/Persona';
import { User } from '../entities/User';

/**
 * Retrieves the persona of the currently authenticated user. Returns null if
 * none exists.
 */
export async function getMyPersona(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  return res.json({ persona: user.persona || null });
}

/**
 * Creates or updates the authenticated user's persona. Enforces a monthly
 * change limit (default 2 changes per month). If the user does not yet
 * have a persona, one is created. Otherwise the display name and avatar
 * can be modified within the allowed limits.
 */
export async function upsertPersona(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  const { displayName, avatarUrl } = req.body;
  if (!displayName) {
    return res.status(400).json({ message: 'displayName is required' });
  }
  const personaRepo = AppDataSource.getRepository(Persona);
  let persona = user.persona;
  const now = new Date();

  if (!persona) {
    // Create new persona
    persona = personaRepo.create({ displayName, avatarUrl, changeCount: 1, lastChangedAt: now, user });
    await personaRepo.save(persona);
    // Attach persona to user
    const userRepo = AppDataSource.getRepository(User);
    user.persona = persona;
    await userRepo.save(user);
    return res.status(201).json({ message: 'Persona created', persona });
  }
  // Existing persona – enforce monthly change limit
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const diff = now.getTime() - persona.lastChangedAt.getTime();
  if (diff > ONE_MONTH_MS) {
    // Reset change count when more than a month has passed
    persona.changeCount = 0;
    persona.lastChangedAt = now;
  }
  const MAX_CHANGES_PER_MONTH = 2;
  if (persona.changeCount >= MAX_CHANGES_PER_MONTH) {
    return res.status(429).json({ message: 'Persona change limit reached for this month' });
  }
  persona.displayName = displayName;
  persona.avatarUrl = avatarUrl;
  persona.changeCount += 1;
  persona.lastChangedAt = now;
  await personaRepo.save(persona);
  return res.json({ message: 'Persona updated', persona });
}
