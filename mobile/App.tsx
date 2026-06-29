import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import RootProvider from './src/navigation/RootProvider';

export default function App() {
  return (
    <RootProvider>
      <AppNavigator />
    </RootProvider>
  );
}
