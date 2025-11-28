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

  const res = NextResponse.json({ token });
  // Set httpOnly cookie so browser sends it automatically on subsequent requests
  // Include SameSite and secure flags appropriately
  const cookieOptions: any = { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax' };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookies.set('token', token, cookieOptions);
  return res;
}
