import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function getProjects() {
  const res = await fetch(`${getApiUrl()}/api/planning/projects/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProjectById(projectId: number) {
  const res = await fetch(`${getApiUrl()}/api/planning/projects/${projectId}/`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(project: {
  name: string;
  description?: string;
  status?: string;
  due_date?: string;
  area?: number;
}) {
  const res = await fetch(`${getApiUrl()}/api/planning/projects/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to save project');
  return res.json();
}

export async function updateProject(projectId: number, project: any) {
  const res = await fetch(`${getApiUrl()}/api/planning/projects/${projectId}/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(projectId: number) {
  const res = await fetch(`${getApiUrl()}/api/planning/projects/${projectId}/`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return true;
}
