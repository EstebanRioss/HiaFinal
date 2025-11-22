import { CourtAvailability, DayOfWeek } from '@/types';

export const dayNames: DayOfWeek[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

const orderedDays: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const normalizeDay = (day: DayOfWeek): DayOfWeek => day;

export const validateAvailability = (availability: CourtAvailability[]): boolean => {
  if (!Array.isArray(availability) || availability.length === 0) return false;

  return availability.every((day) => {
    if (!day.dayOfWeek || !orderedDays.includes(day.dayOfWeek)) return false;
    if (!Array.isArray(day.ranges) || day.ranges.length === 0) return false;
    return day.ranges.every((range) => {
      if (!range.startTime || !range.endTime) return false;
      return range.startTime < range.endTime;
    });
  });
};

export const getDayOfWeekFromDate = (dateISO: string): DayOfWeek => {
  const date = new Date(dateISO + 'T00:00:00');
  const dayIndex = date.getDay(); // 0 domingo
  return dayNames[dayIndex];
};

export const generateHourlySlots = (availability: CourtAvailability[], day: DayOfWeek): string[] => {
  const dayAvailability = availability.find((item) => item.dayOfWeek === day);
  if (!dayAvailability) return [];

  const slots: string[] = [];
  dayAvailability.ranges.forEach((range) => {
    let currentHour = range.startTime;
    while (currentHour < range.endTime) {
      const [hourStr, minuteStr] = currentHour.split(':');
      const hour = parseInt(hourStr, 10);
      const nextHour = hour + 1;
      const nextHourStr = `${String(nextHour).padStart(2, '0')}:${minuteStr}`;
      if (nextHourStr > range.endTime) break;
      slots.push(currentHour);
      currentHour = nextHourStr;
    }
  });

  return slots;
};

export const isSlotWithinAvailability = (
  availability: CourtAvailability[],
  day: DayOfWeek,
  startTime: string
): boolean => {
  return generateHourlySlots(availability, day).includes(startTime);
};

