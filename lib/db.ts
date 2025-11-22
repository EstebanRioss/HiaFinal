import { User, Court, Reservation, Rating, CourtRequest, DayOfWeek, CourtAvailability } from '@/types';
import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth';

const dataDir = path.join(process.cwd(), 'data');

// Asegurar que el directorio data existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const daysOfWeek: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const defaultAvailability = (): CourtAvailability[] =>
  daysOfWeek.map((day) => ({
    dayOfWeek: day,
    ranges: [
      {
        startTime: '10:00',
        endTime: '22:00',
      },
    ],
  }));

const normalizeAvailability = (availability?: CourtAvailability[]): CourtAvailability[] => {
  if (!availability || availability.length === 0) {
    return defaultAvailability();
  }

  return availability.map((item) => ({
    dayOfWeek: item.dayOfWeek,
    ranges: (item.ranges || [])
      .filter((range) => range.startTime && range.endTime)
      .map((range) => ({
        startTime: range.startTime,
        endTime: range.endTime,
      })),
  }));
};

const usersFile = path.join(dataDir, 'users.json');
const courtsFile = path.join(dataDir, 'courts.json');
const reservationsFile = path.join(dataDir, 'reservations.json');
const ratingsFile = path.join(dataDir, 'ratings.json');
const courtRequestsFile = path.join(dataDir, 'courtRequests.json');

// Funciones de lectura
export function readUsers(): User[] {
  if (!fs.existsSync(usersFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

export function readCourts(): Court[] {
  if (!fs.existsSync(courtsFile)) {
    return [];
  }
  const courts = JSON.parse(fs.readFileSync(courtsFile, 'utf-8'));
  return courts.map((court: Court) => ({
    ...court,
    availability: normalizeAvailability(court.availability),
  }));
}

export function readReservations(): Reservation[] {
  if (!fs.existsSync(reservationsFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(reservationsFile, 'utf-8'));
}

export function readRatings(): Rating[] {
  if (!fs.existsSync(ratingsFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(ratingsFile, 'utf-8'));
}

export function readCourtRequests(): CourtRequest[] {
  if (!fs.existsSync(courtRequestsFile)) {
    return [];
  }
  const requests = JSON.parse(fs.readFileSync(courtRequestsFile, 'utf-8'));
  return requests.map((request: CourtRequest) => ({
    ...request,
    availability: normalizeAvailability(request.availability),
  }));
}

// Funciones de escritura
export function writeUsers(users: User[]): void {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

export function writeCourts(courts: Court[]): void {
  fs.writeFileSync(courtsFile, JSON.stringify(courts, null, 2));
}

export function writeReservations(reservations: Reservation[]): void {
  fs.writeFileSync(reservationsFile, JSON.stringify(reservations, null, 2));
}

export function writeRatings(ratings: Rating[]): void {
  fs.writeFileSync(ratingsFile, JSON.stringify(ratings, null, 2));
}

export function writeCourtRequests(requests: CourtRequest[]): void {
  fs.writeFileSync(courtRequestsFile, JSON.stringify(requests, null, 2));
}

// Inicializar datos de ejemplo si no existen
export async function initializeData(): Promise<void> {
  const users = readUsers();
  if (users.length === 0) {
    // Contraseñas hasheadas: todas son "123456" para facilitar pruebas
    const adminPassword = await hashPassword('123456');
    const ownerPassword = await hashPassword('123456');
    const playerPassword = await hashPassword('123456');
    
    const defaultUsers: User[] = [
      {
        id: '1',
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'owner@example.com',
        password: ownerPassword,
        name: 'Dueño de Cancha',
        role: 'owner',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'player@example.com',
        password: playerPassword,
        name: 'Jugador',
        role: 'player',
        createdAt: new Date().toISOString(),
      },
    ];
    writeUsers(defaultUsers);
  }
}

