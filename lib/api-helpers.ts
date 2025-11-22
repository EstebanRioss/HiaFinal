import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { UserRole } from '@/types';

export function getAuthUser(request: NextRequest): { id: string; email: string; role: UserRole } | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): { id: string; email: string; role: UserRole } {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('No autenticado');
  }
  return user;
}

export function requireRole(request: NextRequest, allowedRoles: UserRole[]): { id: string; email: string; role: UserRole } {
  const user = requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('No autorizado');
  }
  return user;
}


