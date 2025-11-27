export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: string;
}

export type DayOfWeek =
  | 'domingo'
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado';

export interface TimeRange {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CourtAvailability {
  dayOfWeek: DayOfWeek;
  ranges: TimeRange[];
}

export type PaymentMethod = 'transferencia' | 'tarjeta' | 'efectivo';

export type TransferTiming = 'inmediato' | 'antes_entrada';

export interface Court {
  id: string;
  name: string;
  sport: string;
  location: string;
  price_per_hour: number;
  owner_id: string;
  description: string;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  availability: CourtAvailability[];
}

export interface Reservation {
  id: string;
  court_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  payment_method: string;
  transfer_timing: string;
  status: string;
  created_at: string;
}

export interface Rating {
  id: string;
  court_id: string;
  user_id: string;
  reservation_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type Sport =
  | "futbol"
  | "tenis"
  | "padel"
  | "voley"
  | "basquet"
  | string;

export interface CourtRequest {
  id: string;
  owner_id: string;
  name: string;
  sport: Sport;
  location: string;
  price_per_hour: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  availability: CourtAvailability[]; // Tipado estrictamente para disponibilidad
}