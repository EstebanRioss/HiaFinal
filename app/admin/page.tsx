'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Court, Sport, CourtRequest } from '@/types';
import AvailabilityEditor, {
  AvailabilityState,
  createEmptyAvailabilityState,
  serializeAvailability,
} from '../components/AvailabilityEditor';

interface Owner {
  id: string;
  name: string;
  email: string;
}

export default function AdminPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [requests, setRequests] = useState<CourtRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'futbol' as Sport,
    location: '',
    pricePerHour: '',
    description: '',
    ownerId: '',
  });
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(
    createEmptyAvailabilityState()
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourts();
    fetchOwners();
    fetchRequests();
  }, []);

  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/courts');
      const data = await res.json();
      setCourts(data.courts || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch('/api/users?role=owner');
      const data = await res.json();
      if (data.users && data.users.length > 0) {
        setOwners(data.users);
        setFormData(prev => ({ ...prev, ownerId: data.users[0].id }));
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/court-requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(`/api/court-requests/${requestId}/approve`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al aprobar solicitud');
        return;
      }

      alert('Solicitud aprobada y cancha creada exitosamente');
      fetchCourts();
      fetchRequests();
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      return;
    }

    try {
      const res = await fetch(`/api/court-requests/${requestId}/reject`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al rechazar solicitud');
        return;
      }

      alert('Solicitud rechazada');
      fetchRequests();
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sport: 'futbol',
      location: '',
      pricePerHour: '',
      description: '',
      ownerId: owners[0]?.id || '',
    });
    setAvailabilityState(createEmptyAvailabilityState());
  };

  const buildAvailabilityPayload = () => {
    const payload = serializeAvailability(availabilityState);
    if (payload.length === 0) {
      setError('Debes definir al menos un rango horario.');
      return null;
    }

    const hasInvalidRange = payload.some((day) =>
      day.ranges.some((range) => range.startTime >= range.endTime)
    );

    if (hasInvalidRange) {
      setError('Revisa que cada rango horario tenga un inicio anterior al fin.');
      return null;
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const availability = buildAvailabilityPayload();
    if (!availability) return;

    try {
      const res = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerHour: Number(formData.pricePerHour),
          availability,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la cancha');
        return;
      }

      setSuccess('Cancha creada exitosamente');
      resetForm();
      setShowForm(false);
      fetchCourts();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'white' }}>Panel de Administración</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancelar' : 'Agregar Cancha'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2>Agregar Nueva Cancha</h2>
            
            {success && (
              <div className="alert alert-success">{success}</div>
            )}

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la Cancha</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deporte</label>
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value as Sport })}
                >
                  <option value="futbol">Fútbol</option>
                  <option value="basquet">Básquet</option>
                  <option value="tenis">Tenis</option>
                  <option value="padel">Pádel</option>
                  <option value="voley">Vóley</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Precio por Hora</label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <AvailabilityEditor
                availability={availabilityState}
                onChange={setAvailabilityState}
              />

              <div className="form-group">
                <label>Dueño de la Cancha</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  required
                >
                  <option value="">Seleccione un dueño</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Crear Cancha
              </button>
            </form>
          </div>
        )}

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Solicitudes de Canchas ({requests.filter(r => r.status === 'pending').length} pendientes)</h2>
          {requests.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No hay solicitudes de canchas.
            </p>
          ) : (
            <div className="grid">
              {requests.map((request) => {
                const owner = owners.find(o => o.id === request.ownerId);
                return (
                  <div key={request.id} className="court-card">
                    <h3>{request.name}</h3>
                    <p><strong>Dueño:</strong> {owner ? `${owner.name} (${owner.email})` : 'N/A'}</p>
                    <p><strong>Deporte:</strong> {request.sport}</p>
                    <p><strong>Ubicación:</strong> {request.location}</p>
                    <p><strong>Precio:</strong> ${request.pricePerHour}/hora</p>
                    <p><strong>Descripción:</strong> {request.description}</p>
                <p><strong>Disponibilidad propuesta:</strong></p>
                <ul style={{ paddingLeft: '18px', color: '#475569' }}>
                  {request.availability.map((day) => (
                    <li key={day.dayOfWeek}>
                      <strong>{day.dayOfWeek}:</strong>{' '}
                      {day.ranges.map((range) => `${range.startTime} - ${range.endTime}`).join(', ')}
                    </li>
                  ))}
                </ul>
                    <p><strong>Estado:</strong> {
                      request.status === 'pending' ? (
                        <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Pendiente</span>
                      ) : request.status === 'approved' ? (
                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>Aprobada</span>
                      ) : (
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Rechazada</span>
                      )
                    }</p>
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="btn btn-success"
                          style={{ flex: 1 }}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                        >
                          ✗ Rechazar
                        </button>
                      </div>
                    )}
                    {request.reviewedAt && (
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                        Revisada el {new Date(request.reviewedAt).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Canchas Existentes ({courts.length})</h2>
          <div className="grid">
            {courts.map((court) => (
              <div key={court.id} className="court-card">
                <h3>{court.name}</h3>
                <p><strong>Deporte:</strong> {court.sport}</p>
                <p><strong>Ubicación:</strong> {court.location}</p>
                <p><strong>Precio:</strong> ${court.pricePerHour}/hora</p>
                <p><strong>Puntuación:</strong> {court.averageRating.toFixed(1)}/5.0</p>
                <p><strong>Disponibilidad:</strong></p>
                <ul style={{ paddingLeft: '18px', color: '#475569' }}>
                  {court.availability.map((day) => (
                    <li key={day.dayOfWeek}>
                      <strong>{day.dayOfWeek}:</strong>{' '}
                      {day.ranges.map((range) => `${range.startTime} - ${range.endTime}`).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

