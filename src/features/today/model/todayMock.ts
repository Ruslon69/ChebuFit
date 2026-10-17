import type { TodayViewModel } from './TodayViewModel';

export const todayMock = {
  greeting: 'evening',
  name: 'Руслан',
  date: '2026-10-17T12:00:00+02:00',
  calories: { consumed: 1940, target: 2845 },
  macros: [
    { id: 'protein', consumed: 128, target: 185 },
    { id: 'fat', consumed: 47, target: 65 },
    { id: 'carbs', consumed: 241, target: 380 },
  ],
  water: { consumedMl: 1500, targetMl: 2500, portionMl: 250 },
  meals: [
    { id: 'breakfast', calories: 520 },
    { id: 'lunch', calories: 680 },
    { id: 'dinner', calories: 540 },
    { id: 'snacks', calories: 200 },
  ],
  workout: { title: 'Грудь + трицепс', exerciseCount: 6, durationMinutes: 55 },
  weight: { kg: 85, changeKg: -0.6, periodDays: 30, changeTone: 'positive' },
} satisfies TodayViewModel;
