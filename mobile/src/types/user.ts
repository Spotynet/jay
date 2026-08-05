export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  timezone: string;
  onboarding_completed: boolean;
  is_premium: boolean;
}
