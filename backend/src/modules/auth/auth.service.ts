import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { AppError } from '../../utils/errors.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function registerUser(email: string, password: string, name: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw AppError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ email, passwordHash, name }).returning();
  return { id: user!.id, email: user!.email, name: user!.name };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw AppError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw AppError.unauthorized('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, email: user.email } satisfies TokenPayload,
    config.auth.jwtSecret,
    { expiresIn: config.auth.tokenExpiresIn },
  );

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
  } catch {
    throw AppError.unauthorized('Invalid token');
  }
}
