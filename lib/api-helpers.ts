// lib/api-helpers.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { query } from "./pg";

/**
 * Obtiene el usuario autenticado desde el token.
 * Devuelve `null` si el token no es válido o el usuario no existe.
 */
export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;
  if (authHeader) token = authHeader.split(" ")[1];

  if (!token) {
    try {
      if ((req as any).cookies && typeof (req as any).cookies.get === 'function') {
        const c = (req as any).cookies.get('token');
        if (c) token = c.value ?? c;
      } else {
        const c = (req as any).cookies?.get?.('token');
        if (c) token = c.value ?? c;
      }
    } catch {
      // ignore
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Buscar usuario en DB usando payload.id
  const result = await query("SELECT id, name, email, role FROM users WHERE id = $1", [
    payload.id,
  ]);

  if (result.rowCount === 0) return null;

  return result.rows[0];
}

/**
 * Middleware para proteger rutas privadas.
 * Devuelve el usuario autenticado o una respuesta 401.
 */
export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

/**
 * Middleware para rutas que requieren rol específico.
 */
export async function requireRole(req: NextRequest, role?: string | string[]) {
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!role) return user;

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  return user;
}