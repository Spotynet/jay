import { getApiUrl } from './config';

export async function checkEmailExists(email: string): Promise<{ exists: boolean }> {
  const res = await fetch(`${getApiUrl()}/api/users/check-email/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!res.ok) throw new Error('Failed to verify email');
  return res.json();
}
