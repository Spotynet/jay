import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';
import { ApiError, parseJsonResponse } from './auth';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

export async function updateUser(userData: {
  first_name?: string;
  last_name?: string;
  timezone?: string;
}) {
  const res = await fetch(`${getApiUrl()}/api/users/me/`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
