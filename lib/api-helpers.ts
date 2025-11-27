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
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
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
export async function requireRole(req: NextRequest, role: string) {
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== role) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  return user;
}