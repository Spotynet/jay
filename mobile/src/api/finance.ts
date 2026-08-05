import { getApiUrl } from './config';
import * as tokenStorage from '../utils/authTokenStorage';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

async function getAuthHeaders() {
  const token = await tokenStorage.getAccessToken();
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Finance Entries ────────────────────────────────────────
export async function getFinanceEntries() {
  return apiCall<any[]>(`${getApiUrl()}/api/finance/entries/`);
}

export async function createFinanceEntry(data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/entries/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFinanceEntry(id: string, data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/entries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFinanceEntry(id: string) {
  return apiCall<void>(`${getApiUrl()}/api/finance/entries/${id}/`, {
    method: 'DELETE',
  });
}

// ─── Accounts ───────────────────────────────────────────────
export async function getAccounts() {
  return apiCall<any[]>(`${getApiUrl()}/api/finance/accounts/`);
}

export async function createAccount(data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/accounts/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAccount(id: string, data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/accounts/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: string) {
  return apiCall<void>(`${getApiUrl()}/api/finance/accounts/${id}/`, {
    method: 'DELETE',
  });
}

// ─── Categories ─────────────────────────────────────────────
export async function getCategories() {
  return apiCall<any[]>(`${getApiUrl()}/api/finance/categories/`);
}

export async function createCategory(data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/categories/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return apiCall<void>(`${getApiUrl()}/api/finance/categories/${id}/`, {
    method: 'DELETE',
  });
}

// ─── Budgets ────────────────────────────────────────────────
export async function getBudgets() {
  return apiCall<any[]>(`${getApiUrl()}/api/finance/budgets/`);
}

export async function createBudget(data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/budgets/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBudget(id: string, data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/budgets/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBudget(id: string) {
  return apiCall<void>(`${getApiUrl()}/api/finance/budgets/${id}/`, {
    method: 'DELETE',
  });
}

// ─── Transactions ───────────────────────────────────────────
export async function getTransactions() {
  return apiCall<any[]>(`${getApiUrl()}/api/finance/transactions/`);
}

export async function createTransaction(data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/transactions/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(id: string, data: any) {
  return apiCall<any>(`${getApiUrl()}/api/finance/transactions/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string) {
  return apiCall<void>(`${getApiUrl()}/api/finance/transactions/${id}/`, {
    method: 'DELETE',
  });
}
