import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

// Areas
export async function getAreas() {
  const res = await fetch(`${getApiUrl()}/api/planning/areas/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch areas');
  return res.json();
}

export async function createArea(area: { name: string; color?: string; icon?: string }) {
  const res = await fetch(`${getApiUrl()}/api/planning/areas/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(area),
  });
  if (!res.ok) throw new Error('Failed to save area');
  return res.json();
}

export async function updateArea(areaId: number, area: any) {
  const res = await fetch(`${getApiUrl()}/api/planning/areas/${areaId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(area),
  });
  if (!res.ok) throw new Error('Failed to update area');
  return res.json();
}

export async function deleteArea(areaId: number) {
  const res = await fetch(`${getApiUrl()}/api/planning/areas/${areaId}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete area');
  return true;
}

// Goals
export async function getGoals() {
  const res = await fetch(`${getApiUrl()}/api/planning/goals/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
}

export async function createGoal(goal: { area: number; title: string; description?: string; target_date?: string }) {
  const res = await fetch(`${getApiUrl()}/api/planning/goals/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error('Failed to save goal');
  return res.json();
}

export async function updateGoal(goalId: number, goal: any) {
  const res = await fetch(`${getApiUrl()}/api/planning/goals/${goalId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(goal),
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
}

export async function deleteGoal(goalId: number) {
  const res = await fetch(`${getApiUrl()}/api/planning/goals/${goalId}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete goal');
  return true;
}
