import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <-- Nova importação
import Routes from './src/routes';

const DarkNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#111827', 
  },
};

export default function App() {
  return (
    // SafeAreaProvider identifica as margens nativas do telemóvel
    <SafeAreaProvider>
      <NavigationContainer theme={DarkNavTheme}>
        <Routes />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}