/**
 * Development fixtures for visual validation of the content-driven timeline.
 * Not used as production user data.
 */
import { AgendaItem } from './timelineLayout';

function at(hour: number, minute: number, day = new Date()): Date {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function buildReferenceTimelineFixtures(day: Date = new Date()): AgendaItem[] {
  return [
    {
      id: 'fixture-sleep',
      title: 'Primary sleep',
      type: 'event',
      timeRange: '06:30',
      startTime: at(6, 30, day),
      subtitle: '98% · 7h 26m',
      isActive: true,
      groupId: 'sleep-primary',
    },
    {
      id: 'fixture-bf-1',
      title: 'Greek Yogurt',
      type: 'event',
      timeRange: '09:00',
      startTime: at(9, 0, day),
      groupId: 'meal-breakfast',
      nutrition: { calories: 120, fat: 4, carbs: 9, protein: 15 },
      isActive: true,
    },
    {
      id: 'fixture-bf-2',
      title: 'Blueberries',
      type: 'event',
      timeRange: '09:00',
      startTime: at(9, 0, day),
      groupId: 'meal-breakfast',
      nutrition: { calories: 42, fat: 0, carbs: 11, protein: 1 },
      isActive: true,
    },
    {
      id: 'fixture-bf-3',
      title: 'Almond Butter',
      type: 'event',
      timeRange: '09:00',
      startTime: at(9, 0, day),
      groupId: 'meal-breakfast',
      nutrition: { calories: 98, fat: 9, carbs: 3, protein: 3 },
      isActive: true,
      badge: 'up',
    },
    {
      id: 'fixture-lunch-1',
      title: 'Sweet Potato',
      type: 'event',
      timeRange: '13:00',
      startTime: at(13, 0, day),
      groupId: 'meal-lunch',
      nutrition: { calories: 112, fat: 0, carbs: 26, protein: 2 },
      isActive: true,
    },
    {
      id: 'fixture-lunch-2',
      title: 'Tilapia Fillets',
      type: 'event',
      timeRange: '13:00',
      startTime: at(13, 0, day),
      groupId: 'meal-lunch',
      nutrition: { calories: 145, fat: 3, carbs: 0, protein: 30 },
      isActive: true,
    },
    {
      id: 'fixture-lunch-3',
      title: 'Lettuce Salad',
      type: 'event',
      timeRange: '13:00',
      startTime: at(13, 0, day),
      groupId: 'meal-lunch',
      nutrition: { calories: 28, fat: 0, carbs: 5, protein: 2 },
      isActive: true,
      badge: 'neutral',
    },
    {
      id: 'fixture-lunch-4',
      title: 'Tilapia Fillets',
      type: 'event',
      timeRange: '13:00',
      startTime: at(13, 0, day),
      groupId: 'meal-lunch',
      nutrition: { calories: 145, fat: 3, carbs: 0, protein: 30 },
      isActive: true,
    },
    {
      id: 'fixture-snack-1',
      title: 'Raw Honey',
      type: 'event',
      timeRange: '17:00',
      startTime: at(17, 0, day),
      groupId: 'meal-snack',
      nutrition: { calories: 64, fat: 0, carbs: 17, protein: 0 },
      isActive: true,
    },
    {
      id: 'fixture-snack-2',
      title: 'Banana',
      type: 'event',
      timeRange: '17:00',
      startTime: at(17, 0, day),
      groupId: 'meal-snack',
      nutrition: { calories: 105, fat: 0, carbs: 27, protein: 1 },
      isActive: true,
    },
    {
      id: 'fixture-snack-3',
      title: 'Blackberry jam with a deliberately long title',
      type: 'event',
      timeRange: '17:00',
      startTime: at(17, 0, day),
      groupId: 'meal-snack',
      nutrition: { calories: 50, fat: 0, carbs: 13, protein: 0 },
      isActive: true,
    },
    {
      id: 'fixture-snack-4',
      title: 'Organic Brown Rice Cakes',
      type: 'event',
      timeRange: '17:00',
      startTime: at(17, 0, day),
      groupId: 'meal-snack',
      nutrition: { calories: 70, fat: 1, carbs: 15, protein: 1 },
      isActive: true,
    },
  ];
}
