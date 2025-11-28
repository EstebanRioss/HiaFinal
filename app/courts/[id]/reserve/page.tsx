'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { Court, PaymentMethod, TransferTiming } from '@/types';

export default function ReservePage() {
  const params = useParams();
  const router = useRouter();
  const [court, setCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    paymentMethod: 'transferencia' as PaymentMethod,
    transferTiming: 'inmediato' as TransferTiming,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCourt();
    }
  }, [params.id]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (formData.date && params.id) {
      fetchAvailableSlots(formData.date);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, params.id]);

  const fetchCourt = async () => {
    try {
      const res = await fetch(`/api/courts/${params.id}`);
      const data = await res.json();
      if (data.court) {
        setCourt(data.court);
      }
    } catch (error) {
      console.error('Error fetching court:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (data.user) {
        setUserRole(data.user.role);
      } else {
        setUserRole(null);
      }
    } catch {
      setUserRole(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    setFormData((prev) => ({ ...prev, startTime: '' }));
    try {
      const res = await fetch(`/api/courts/${params.id}/slots?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setAvailableSlots(data.slots || []);
      } else {
        setError(data.error || 'No se pudieron cargar los horarios disponibles');
        setAvailableSlots([]);
      }
    } catch {
      setError('No se pudieron cargar los horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculateTotal = () => {
    if (!court) return 0;
    return typeof court.price_per_hour === 'number' && !isNaN(court.price_per_hour) ? court.price_per_hour : Number(court.price_per_hour) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!court) return;

    if (!formData.date || !formData.startTime) {
      setError('Selecciona una fecha y uno de los horarios disponibles.');
      return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: court.id,
          date: formData.date,
          startTime: formData.startTime,
          paymentMethod: formData.paymentMethod,
          transferTiming: formData.paymentMethod === 'transferencia' ? formData.transferTiming : undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la reserva');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reservations');
      }, 2000);
    } catch (err) {
      setError('Error de conexión');
    }
  };

  if (!court || checkingAuth) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <p>Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  if (!userRole || !['player', 'owner'].includes(userRole)) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h1>Reservar Cancha</h1>
            <p>
              Debes iniciar sesión como <strong>jugador</strong> o <strong>dueño</strong> para reservar una cancha.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => router.push('/login')}>
                Iniciar sesión
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/register')}>
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <h1>Reservar Cancha: {court.name}</h1>
          <p><strong>Deporte:</strong> {court.sport}</p>
          <p><strong>Ubicación:</strong> {court.location}</p>
          <p><strong>Precio por hora:</strong> ${court.price_per_hour}</p>

          {success && (
            <div className="alert alert-success">
              ¡Reserva creada exitosamente! Redirigiendo...
            </div>
          )}

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div style={{ margin: '20px 0' }}>
            <h3>Horarios publicados por el dueño</h3>
            <ul style={{ paddingLeft: '18px', color: '#475569' }}>
              {court.availability.map((day) => (
                <li key={day.dayOfWeek}>
                  <strong>{day.dayOfWeek}:</strong>{' '}
                  {day.ranges.map((range) => `${range.startTime} - ${range.endTime}`).join(', ')}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Selecciona un turno disponible (1 hora)</label>
              {loadingSlots ? (
                <p>Cargando horarios...</p>
              ) : availableSlots.length === 0 && formData.date ? (
                <p style={{ color: '#991b1b' }}>No hay turnos disponibles para esta fecha.</p>
              ) : (
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={!formData.date || availableSlots.length === 0}
                  required
                >
                  <option value="">Selecciona un horario</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} - {`${String(Number(slot.split(':')[0]) + 1).padStart(2, '0')}:${slot.split(':')[1]}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              >
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            {formData.paymentMethod === 'transferencia' && (
              <div className="form-group">
                <label>¿Cuándo realizar la transferencia?</label>
                <select
                  value={formData.transferTiming}
                  onChange={(e) => setFormData({ ...formData, transferTiming: e.target.value as TransferTiming })}
                >
                  <option value="inmediato">En el momento</option>
                  <option value="antes_entrada">Antes de entrar a la cancha</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Total a Pagar</label>
              <input
                type="text"
                value={`$${calculateTotal().toFixed(2)}`}
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Confirmar Reserva
            </button>
          </form>
        </div>
      </div>
    </>
  );
}


