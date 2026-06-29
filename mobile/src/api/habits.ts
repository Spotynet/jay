import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function getAllHabits() {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch habits');
  return res.json();
}

export async function getHabitsForDate(date: string) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/?date=${date}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch habits');
  return res.json();
}

export async function getHabitById(habitId: number) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/${habitId}/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch habit');
  return res.json();
}

export async function createHabit(habit: {
  name: string;
  description: string;
  frequency: string;
  days_of_week: number[];
  target_value: number;
  category: string;
  reminder_time?: string;
}) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error('Failed to save habit');
  return res.json();
}

export async function updateHabit(habitId: number, habit: any) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/${habitId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error('Failed to update habit');
  return res.json();
}

export async function toggleHabitCompletion(habitId: number, date: string) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/${habitId}/toggle_completion/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ date }),
  });
  if (!res.ok) throw new Error('Failed to toggle habit completion');
  return res.json();
}

export async function incrementHabitProgress(habitId: number, date: string) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/${habitId}/increment_progress/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ date }),
  });
  if (!res.ok) throw new Error('Failed to increment habit progress');
  return res.json();
}

export async function deleteHabit(habitId: number) {
  const res = await fetch(`${getApiUrl()}/api/habits/habits/${habitId}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete habit');
  return true;
}
