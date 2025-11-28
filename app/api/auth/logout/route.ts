import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout exitoso' });
  // Ensure delete uses the same path
  try {
    response.cookies.delete('token');
  } catch {
    // fallback: set cookie with expired maxAge
    response.cookies.set('token', '', { path: '/', maxAge: 0 });
  }
  return response;
}


