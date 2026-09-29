import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function createTask(task: {
  name: string;
  description: string;
  due_date: string | null;
  due_time?: string | null;
  duration?: string | null;
  status: string;
  parent?: number;
  project?: number | null;
}) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to save task');
  return res.json();
}

export async function getTasksForDate(date: string) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/?date=${date}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getTaskById(taskId: number) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/${taskId}/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function getAllTasks() {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function updateTask(taskId: number, task: any) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/${taskId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(taskId: number) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/${taskId}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return true;
}

export async function toggleTaskCompletion(taskId: number) {
  const res = await fetch(`${getApiUrl()}/api/tasks/tasks/${taskId}/toggle_completion/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle task completion');
  return res.json();
}
