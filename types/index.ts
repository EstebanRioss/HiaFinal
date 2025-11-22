export type UserRole = 'admin' | 'owner' | 'player';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type Sport = 'futbol' | 'basquet' | 'tenis' | 'padel' | 'voley';
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface TimeRange {
  startTime: string; // formato HH:mm
  endTime: string;   // formato HH:mm
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
  sport: Sport;
  location: string;
  pricePerHour: number;
  ownerId: string;
  description: string;
  image?: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  availability: CourtAvailability[];
}

export interface Reservation {
  id: string;
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  transferTiming?: TransferTiming;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Rating {
  id: string;
  courtId: string;
  userId: string;
  reservationId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface CourtRequest {
  id: string;
  ownerId: string;
  name: string;
  sport: Sport;
  location: string;
  pricePerHour: number;
  description: string;
  availability: CourtAvailability[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

