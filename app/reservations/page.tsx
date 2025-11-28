'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Reservation, Court } from '@/types';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<(Reservation & { court: Court })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations/user', { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed fetching reservations', res.status, text);
        setReservations([]);
        return;
      }

      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (reservationId: string, courtId: string) => {
    const rating = prompt('Ingresa una puntuación del 1 al 5:');
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      alert('Por favor ingresa un número entre 1 y 5');
      return;
    }

    const comment = prompt('Ingresa un comentario (opcional):') || '';

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          reservationId,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al calificar');
        return;
      }

      alert('¡Calificación enviada exitosamente!');
      fetchReservations();
    } catch (error) {
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <p>Cargando reservas...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Mis Reservas</h1>

        {reservations.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>
              No tienes reservas aún.
            </p>
          </div>
        ) : (
          <div className="grid">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="court-card">
                <h3>{(reservation as any).court?.name || (reservation as any).court_name || 'Cancha'}</h3>
                <p><strong>Fecha:</strong> {new Date(reservation.date).toLocaleDateString('es-ES')}</p>
                <p><strong>Horario:</strong> {reservation.start_time} - {reservation.end_time}</p>
                <p><strong>Total:</strong> ${reservation.total_price}</p>
                <p><strong>Método de pago:</strong> {reservation.payment_method}</p>
                {reservation.payment_method === 'transferencia' && reservation.transfer_timing && (
                  <p><strong>Transferencia:</strong> {reservation.transfer_timing === 'inmediato' ? 'En el momento' : 'Antes de entrar'}</p>
                )}
                <p><strong>Estado:</strong> {
                  reservation.status === 'pending' ? 'Pendiente' :
                  reservation.status === 'confirmed' ? 'Confirmada' :
                  reservation.status === 'completed' ? 'Completada' : 'Cancelada'
                }</p>
                {reservation.status === 'completed' && (
                  <button
                    onClick={() => handleRate(reservation.id, reservation.court_id)}
                    className="btn btn-success"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    ⭐ Calificar Cancha
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

