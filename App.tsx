import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

// Import or define your WebWrapper here
import WebWrapper from './components/WebWrapper';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WebWrapper>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </WebWrapper>
    </SafeAreaProvider>
  );
}
