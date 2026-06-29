/**
 * Base URL from `EXPO_PUBLIC_API_URL` (see DEVELOPMENT.md).
 * Physical devices cannot reach your machine's localhost — use your LAN IP or a tunnel.
 */
export function getApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  const base = raw?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000';
  return base;
}
