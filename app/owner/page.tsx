'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Court, CourtRequest, Sport } from '@/types';
import AvailabilityEditor, {
  AvailabilityState,
  createEmptyAvailabilityState,
  serializeAvailability,
} from '../components/AvailabilityEditor';

export default function OwnerPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [requests, setRequests] = useState<CourtRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'futbol' as Sport,
    location: '',
    pricePerHour: '',
    description: '',
  });
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(
    createEmptyAvailabilityState()
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [courtsRes, requestsRes] = await Promise.all([
        fetch('/api/courts/my-courts'),
        fetch('/api/court-requests'),
      ]);
      
      const courtsData = await courtsRes.json();
      const requestsData = await requestsRes.json();
      
      setCourts(courtsData.courts || []);
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sport: 'futbol',
      location: '',
      pricePerHour: '',
      description: '',
    });
    setAvailabilityState(createEmptyAvailabilityState());
  };

  const buildAvailabilityPayload = () => {
    const payload = serializeAvailability(availabilityState);
    if (payload.length === 0) {
      setError('Debes definir al menos un rango horario disponible.');
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

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const availability = buildAvailabilityPayload();
    if (!availability) return;

    try {
      const res = await fetch('/api/courts/owner', {
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
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleRequestCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const availability = buildAvailabilityPayload();
    if (!availability) return;

    try {
      const res = await fetch('/api/court-requests', {
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
        setError(data.error || 'Error al enviar la solicitud');
        return;
      }

      setSuccess('Solicitud enviada exitosamente. El administrador la revisará pronto.');
      resetForm();
      setShowRequestForm(false);
      fetchData();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { backgroundColor: '#ffc107', color: '#000' },
      approved: { backgroundColor: '#28a745', color: '#fff' },
      rejected: { backgroundColor: '#dc3545', color: '#fff' },
    };
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return (
      <span
        style={{
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '14px',
          ...styles[status as keyof typeof styles],
        }}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
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

  const canAddDirectly = courts.length === 0;

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: 'white' }}>Mis Canchas</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canAddDirectly ? (
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
                {showAddForm ? 'Cancelar' : 'Agregar Primera Cancha'}
              </button>
            ) : (
              <button onClick={() => setShowRequestForm(!showRequestForm)} className="btn btn-primary">
                {showRequestForm ? 'Cancelar' : 'Solicitar Nueva Cancha'}
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {showAddForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2>Agregar Primera Cancha</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Puedes agregar tu primera cancha directamente. Para agregar más, necesitarás solicitar permiso al administrador.
            </p>
            <form onSubmit={handleAddCourt}>
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

              <button type="submit" className="btn btn-primary">
                Crear Cancha
              </button>
            </form>
          </div>
        )}

        {showRequestForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2>Solicitar Nueva Cancha</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Ya tienes una cancha. Para agregar más, debes solicitar permiso al administrador.
            </p>
            <form onSubmit={handleRequestCourt}>
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

              <button type="submit" className="btn btn-primary">
                Enviar Solicitud
              </button>
            </form>
          </div>
        )}

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Mis Canchas ({courts.length})</h2>
          {courts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No tienes canchas registradas. Agrega tu primera cancha usando el botón arriba.
            </p>
          ) : (
            <div className="grid">
              {courts.map((court) => (
                <div key={court.id} className="court-card">
                  <h3>{court.name}</h3>
                  <p><strong>Deporte:</strong> {court.sport}</p>
                  <p><strong>Ubicación:</strong> {court.location}</p>
                  <p><strong>Precio:</strong> ${court.pricePerHour}/hora</p>
                <p><strong>Puntuación promedio:</strong> {court.averageRating.toFixed(1)}/5.0</p>
                <p><strong>Total de calificaciones:</strong> {court.totalRatings}</p>
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
          )}
        </div>

        {requests.length > 0 && (
          <div className="card">
            <h2>Solicitudes de Canchas ({requests.length})</h2>
            <div className="grid">
              {requests.map((request) => (
                <div key={request.id} className="court-card">
                  <h3>{request.name}</h3>
                  <p><strong>Deporte:</strong> {request.sport}</p>
                  <p><strong>Ubicación:</strong> {request.location}</p>
                  <p><strong>Precio:</strong> ${request.pricePerHour}/hora</p>
                  <p><strong>Descripción:</strong> {request.description}</p>
                <p><strong>Disponibilidad solicitada:</strong></p>
                <ul style={{ paddingLeft: '18px', color: '#475569' }}>
                  {request.availability.map((day) => (
                    <li key={day.dayOfWeek}>
                      <strong>{day.dayOfWeek}:</strong>{' '}
                      {day.ranges.map((range) => `${range.startTime} - ${range.endTime}`).join(', ')}
                    </li>
                  ))}
                </ul>
                  <p><strong>Estado:</strong> {getStatusBadge(request.status)}</p>
                  {request.reviewedAt && (
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Revisada el {new Date(request.reviewedAt).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
