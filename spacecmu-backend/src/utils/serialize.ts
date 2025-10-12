import { User } from "../entities/User";

// Core user info for public display (no sensitive fields like passwordHash, email)
export function sanitizeUser(user: Partial<User> | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    bio: user.bio ?? null,
    isAdmin: !!user.isAdmin,
    persona: user.persona
      ? {
          id: (user as any).persona.id,
          displayName: (user as any).persona.displayName,
        }
      : null,
  };
}

// Minimal seller info for product listings
export function sanitizeSeller(user: Partial<User> | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
  };
}

// Full user profile (includes email/studentId for own profile)
export function sanitizeUserProfile(user: Partial<User> | null) {
  if (!user) return null;
  return {
    id: user.id,
    studentId: user.studentId,
    name: user.name,
    email: user.email,
    bio: user.bio ?? null,
    isAdmin: !!user.isAdmin,
    persona: user.persona
      ? {
          id: (user as any).persona.id,
          displayName: (user as any).persona.displayName,
        }
      : null,
  };
}

// Friend list item (minimal info)
export function sanitizeFriend(user: Partial<User> | null) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    bio: user.bio ?? null,
  };
}

export function createResponse(message: string, data: any) {
  return { message, data };
}

export function listResponse(data: any[]) {
  return { data };
}
