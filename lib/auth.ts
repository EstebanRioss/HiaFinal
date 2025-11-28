// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { query } from "./pg";
import { User } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export async function requireAuth(req: NextRequest) {
  // Accept token from Authorization header or cookie named 'token'
  const headerToken = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  let cookieToken: string | undefined = undefined;
  try {
    // Prefer documented API if available
    if ((req as any).cookies && typeof (req as any).cookies.get === 'function') {
      const c = (req as any).cookies.get('token');
      if (c) cookieToken = c.value ?? c;
    } else {
      const c = (req as any).cookies?.get?.('token');
      if (c) cookieToken = c.value ?? c;
    }
  } catch {
    /* ignore */
  }

  const token = headerToken || cookieToken;

  if (!token) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const decoded = verifyToken(token);

    const { rows } = await query<User>("SELECT * FROM users WHERE id = $1 LIMIT 1", [decoded.id]);
    if (!rows.length) {
      return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    return { user: rows[0], error: null };
  } catch {
    return { user: null, error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

export async function requireRole(req: NextRequest, role?: string | string[]) {
  const { user, error } = await requireAuth(req);
  if (error) return { user: null, error };

  // If no role specified, just return the authenticated user
  if (!role) return { user, error: null };

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user!.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, error: null };
}
