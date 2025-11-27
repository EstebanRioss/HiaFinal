import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/pg";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json();

  if (!email || !password || !name || !role)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const exists = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rowCount > 0)
    return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await query(
    `INSERT INTO users (id, email, password, name, role, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [id, email, hash, name, role]
  );

  const token = generateToken({ id, email, name, role });

  return NextResponse.json({ token });
}
