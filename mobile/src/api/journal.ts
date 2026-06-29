import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function createJournalEntry(entry: {
  date: string;
  highlight: string;
  notes?: string;
  mood_score?: number | null;
  energy_score?: number | null;
  custom_ratings?: { label: string, score: number }[];
}) {
  const res = await fetch(`${getApiUrl()}/api/journal/entries/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.date || 'Failed to save journal entry');
  }
  return res.json();
}

export async function updateJournalEntry(id: number, entry: {
  date: string;
  highlight: string;
  notes?: string;
  mood_score?: number | null;
  energy_score?: number | null;
  custom_ratings?: { label: string, score: number }[];
}) {
  const res = await fetch(`${getApiUrl()}/api/journal/entries/${id}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.date || 'Failed to update journal entry');
  }
  return res.json();
}

export async function deleteJournalEntry(id: number) {
  const res = await fetch(`${getApiUrl()}/api/journal/entries/${id}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete journal entry');
  return true;
}

export async function getJournalEntries(date?: string) {
  const url = date ? `${getApiUrl()}/api/journal/entries/?date=${date}` : `${getApiUrl()}/api/journal/entries/`;
  const res = await fetch(url, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch journal entries');
  return res.json();
}

export async function getJournalSettings() {
  const res = await fetch(`${getApiUrl()}/api/journal/settings/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch journal settings');
  return res.json();
}

export async function updateJournalSettings(settings: {
  reminder_enabled: boolean;
  reminder_time: string;
  repeat_mode: string;
  days_of_week: number[];
  default_tags?: string[];
}) {
  console.log('Sending journal settings update:', JSON.stringify(settings));
  const res = await fetch(`${getApiUrl()}/api/journal/settings/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Journal settings update failed, response:', errorData);
    throw new Error(JSON.stringify(errorData) || 'Failed to update journal settings');
  }
  return res.json();
}
