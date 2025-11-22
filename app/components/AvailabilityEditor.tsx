'use client';

import { DayOfWeek, CourtAvailability } from '@/types';

const days: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export type AvailabilityState = Record<
  DayOfWeek,
  {
    startTime: string;
    endTime: string;
  }[]
>;

export const createEmptyAvailabilityState = (): AvailabilityState =>
  days.reduce(
    (acc, day) => ({
      ...acc,
      [day.value]: [],
    }),
    {} as AvailabilityState
  );

export const serializeAvailability = (availability: AvailabilityState): CourtAvailability[] =>
  days
    .map((day) => ({
      dayOfWeek: day.value,
      ranges: availability[day.value]
        .filter((range) => range.startTime && range.endTime)
        .map((range) => ({
          startTime: range.startTime,
          endTime: range.endTime,
        })),
    }))
    .filter((day) => day.ranges.length > 0);

interface AvailabilityEditorProps {
  availability: AvailabilityState;
  onChange: (availability: AvailabilityState) => void;
}

export default function AvailabilityEditor({ availability, onChange }: AvailabilityEditorProps) {
  const handleAddRange = (day: DayOfWeek) => {
    onChange({
      ...availability,
      [day]: [...availability[day], { startTime: '', endTime: '' }],
    });
  };

  const handleRangeChange = (
    day: DayOfWeek,
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const dayRanges = [...availability[day]];
    dayRanges[index] = {
      ...dayRanges[index],
      [field]: value,
    };

    onChange({
      ...availability,
      [day]: dayRanges,
    });
  };

  const handleRemoveRange = (day: DayOfWeek, index: number) => {
    const dayRanges = availability[day].filter((_, idx) => idx !== index);
    onChange({
      ...availability,
      [day]: dayRanges,
    });
  };

  return (
    <div className="availability-editor">
      <p className="availability-helper">
        Define los rangos horarios disponibles por día. Cada turno se tomará en bloques de 1 hora.
        Puedes agregar múltiples bloques por día (ej: 10:00-13:00 y 17:00-23:00).
      </p>
      {days.map((day) => (
        <div key={day.value} className="availability-day">
          <div className="availability-day-header">
            <h4>{day.label}</h4>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAddRange(day.value)}
            >
              + Agregar rango
            </button>
          </div>
          {availability[day.value].length === 0 ? (
            <p className="availability-empty">Sin horarios cargados para este día.</p>
          ) : (
            <div className="availability-ranges">
              {availability[day.value].map((range, index) => (
                <div key={index} className="availability-range">
                  <div className="form-group">
                    <label>Desde</label>
                    <input
                      type="time"
                      value={range.startTime}
                      onChange={(e) =>
                        handleRangeChange(day.value, index, 'startTime', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hasta</label>
                    <input
                      type="time"
                      value={range.endTime}
                      onChange={(e) =>
                        handleRangeChange(day.value, index, 'endTime', e.target.value)
                      }
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveRange(day.value, index)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

