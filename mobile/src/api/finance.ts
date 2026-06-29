import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

// Finance Entry API
export async function getFinanceEntries() {
  const res = await fetch(`${getApiUrl()}/api/finance/entries/`, { headers: await getAuthHeaders() });
  return res.json();
}

export async function createFinanceEntry(data: any) {
  const res = await fetch(`${getApiUrl()}/api/finance/entries/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateFinanceEntry(id: string, data: any) {
  const res = await fetch(`${getApiUrl()}/api/finance/entries/${id}/`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Account API
export async function getAccounts() {
  const res = await fetch(`${getApiUrl()}/api/finance/accounts/`, { headers: await getAuthHeaders() });
  return res.json();
}

export async function createAccount(data: any) {
  const res = await fetch(`${getApiUrl()}/api/finance/accounts/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Category API
export async function getCategories() {
  const res = await fetch(`${getApiUrl()}/api/finance/categories/`, { headers: await getAuthHeaders() });
  return res.json();
}

export async function createCategory(data: any) {
  const res = await fetch(`${getApiUrl()}/api/finance/categories/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
