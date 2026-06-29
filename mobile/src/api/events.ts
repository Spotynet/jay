import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function createEvent(event: {
  name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
}) {
  const res = await fetch(`${getApiUrl()}/api/events/events/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to save event');
  return res.json();
}

export async function getEventsForDate(date: string) {
  const res = await fetch(`${getApiUrl()}/api/events/events/?date=${date}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function getEventById(eventId: number) {
  const res = await fetch(`${getApiUrl()}/api/events/events/${eventId}/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function updateEvent(eventId: number, event: any) {
  const res = await fetch(`${getApiUrl()}/api/events/events/${eventId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}
