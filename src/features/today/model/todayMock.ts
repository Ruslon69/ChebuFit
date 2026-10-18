import { rewardsMock } from '../../rewards';
import type { TodayViewModel } from './TodayViewModel';

export const todayMock = {
  greeting: 'evening',
  name: 'Руслан',
  date: '2026-10-17T12:00:00+02:00',
  orangeBalance: rewardsMock.orangeBalance,
  workout: { title: 'Грудь + трицепс', exerciseCount: 6, durationMinutes: 55 },
  weight: { kg: 85, changeKg: -0.6, periodDays: 30, changeTone: 'positive' },
} satisfies Omit<TodayViewModel, 'water' | 'nutrition'>;
