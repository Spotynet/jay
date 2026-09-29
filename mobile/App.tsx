import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import RootProvider from './src/navigation/RootProvider';
import { useAuthStore } from './src/store/authStore';
import { getJournalSettings } from './src/api/journal';
import { syncJournalReminder } from './src/utils/journalReminder';

function JournalReminderSync() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    getJournalSettings()
      .then((settings) => syncJournalReminder(settings))
      .catch(() => {});
  }, [user]);

  return null;
}

export default function App() {
  return (
    <RootProvider>
      <JournalReminderSync />
      <AppNavigator />
    </RootProvider>
  );
}
