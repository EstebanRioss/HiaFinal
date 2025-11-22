import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alquiler de Canchas Deportivas',
  description: 'Sistema de alquiler de canchas deportivas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}


