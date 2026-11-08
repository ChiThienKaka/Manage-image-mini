import React from 'react';
import {ActivityIndicator, StatusBar, StyleSheet, Text, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';
import {RootNavigator} from './src/navigation/RootNavigator';
import {useAppBootstrap} from './src/hooks/useAppBootstrap';
import {colors} from './src/theme/colors';

enableScreens();

function App() {
  const {ready, error, lockSession} = useAppBootstrap();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {!ready ? (
          <View style={styles.boot}>
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : (
              <ActivityIndicator color={colors.accent} size="large" />
            )}
          </View>
        ) : (
          <NavigationContainer>
            <RootNavigator lockSession={lockSession} />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  error: {
    color: colors.remove,
    textAlign: 'center',
  },
});

export default App;
