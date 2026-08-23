/**
 * OVERLOAD Root Application Entry
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayerProvider } from './src/context';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
