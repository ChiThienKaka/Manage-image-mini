import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen/HomeScreen';
import {GalleryScreen} from '../screens/GalleryScreen/GalleryScreen';
import {ImagePreviewScreen} from '../screens/ImagePreviewScreen/ImagePreviewScreen';
import {LockedPreviewScreen} from '../screens/LockedPreviewScreen/LockedPreviewScreen';
import type {RootStackParamList} from './types';
import {colors} from '../theme/colors';
import type {LockSession} from '../services/lockService';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  lockSession: LockSession | null;
};

export function RootNavigator({lockSession}: Props) {
  return (
    <Stack.Navigator
      initialRouteName={lockSession ? 'LockedPreview' : 'Home'}
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.background},
        animation: 'fade',
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen
        name="ImagePreview"
        component={ImagePreviewScreen}
        options={{animation: 'fade', gestureEnabled: true}}
      />
      <Stack.Screen
        name="LockedPreview"
        component={LockedPreviewScreen}
        initialParams={
          lockSession
            ? {
                galleryId: lockSession.galleryId,
                initialIndex: lockSession.initialIndex,
              }
            : undefined
        }
        options={{gestureEnabled: false, animation: 'none'}}
      />
    </Stack.Navigator>
  );
}
