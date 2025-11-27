import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/pg";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { rows } = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  if (!rows.length) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = generateToken(user);

  return NextResponse.json({ token });
}
