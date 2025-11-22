'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link href="/">
          <h1 style={{ color: '#667eea', margin: 0 }}>🏟️ Canchas Deportivas</h1>
        </Link>
        <div className="navbar-links">
          <Link href="/">Inicio</Link>
          <Link href="/courts">Canchas</Link>
          {user ? (
            <>
              {user.role === 'admin' && <Link href="/admin">Admin</Link>}
              {user.role === 'owner' && <Link href="/owner">Mis Canchas</Link>}
              <Link href="/reservations">Mis Reservas</Link>
              <span>Hola, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Iniciar Sesión</Link>
              <Link href="/register">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


