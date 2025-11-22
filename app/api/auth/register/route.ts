import { NextRequest, NextResponse } from 'next/server';
import { readUsers, writeUsers, initializeData } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await initializeData();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (role !== 'player' && role !== 'owner') {
      return NextResponse.json(
        { error: 'Rol inválido. Solo se permite "player" o "owner"' },
        { status: 400 }
      );
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    const token = generateToken(newUser);

    const response = NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}

