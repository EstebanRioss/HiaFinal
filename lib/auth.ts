import { User, UserRole } from '@/types';
import { readUsers } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: UserRole } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
  } catch {
    return null;
  }
}

export function getUserByEmail(email: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.id === id);
}


