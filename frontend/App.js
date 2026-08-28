import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={COLORS.primaryPurple} />
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ErrorBoundary>
            <AppProvider>
              <AppNavigator />
            </AppProvider>
          </ErrorBoundary>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryPurple,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgLavender,
  },
});
