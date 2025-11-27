'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { Court, Sport } from '@/types';

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'high' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    filterCourts();
  }, [courts, sportFilter, ratingFilter]);

  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/courts');
      const data = await res.json();
      setCourts(data.courts || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourts = () => {
    let filtered = [...courts];

    // Filtro por deporte
    if (sportFilter !== 'all') {
      filtered = filtered.filter(court => court.sport === sportFilter);
    }

    // Filtro por puntuación
    if (ratingFilter === 'high') {
      filtered = filtered.sort((a, b) => b.average_rating - a.average_rating);
    } else if (ratingFilter === 'low') {
      filtered = filtered.sort((a, b) => a.average_rating - b.average_rating);
    } else {
      filtered = filtered.sort((a, b) => b.average_rating - a.average_rating);
    }

    setFilteredCourts(filtered);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="rating">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
        <span style={{ color: '#666', fontSize: '14px', marginLeft: '5px' }}>
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Cargando canchas...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ color: 'white', marginBottom: '20px' }}>Canchas Disponibles</h1>

        <div className="filters">
          <div className="form-group">
            <label>Deporte</label>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value as Sport | 'all')}
            >
              <option value="all">Todos los deportes</option>
              <option value="futbol">Fútbol</option>
              <option value="basquet">Básquet</option>
              <option value="tenis">Tenis</option>
              <option value="padel">Pádel</option>
              <option value="voley">Vóley</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ordenar por Puntuación</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as 'all' | 'high' | 'low')}
            >
              <option value="all">Todas</option>
              <option value="high">Mejores Puntuadas</option>
              <option value="low">Peores Puntuadas</option>
            </select>
          </div>
        </div>

        {filteredCourts.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>
              No se encontraron canchas con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid">
            {filteredCourts.map((court) => (
              <div key={court.id} className="court-card">
                <h3>{court.name}</h3>
                <p><strong>Deporte:</strong> {court.sport}</p>
                <p><strong>Ubicación:</strong> {court.location}</p>
                <p><strong>Precio:</strong> ${court.price_per_hour}/hora</p>
                {renderStars(court.average_rating)}
                <p style={{ fontSize: '14px', color: '#666' }}>{court.description}</p>
                <Link
                  href={`/courts/${court.id}/reserve`}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '15px', display: 'block', textAlign: 'center' }}
                >
                  Reservar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


