import React, {useEffect, useState} from 'react';
import {BackHandler, Pressable, StatusBar, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LockedImagePager} from '../../components/ImageList/LockedImagePager';
import {useGalleryImages} from '../../hooks/useGalleryImages';
import type {RootStackParamList} from '../../navigation/types';
import {clearLockSession} from '../../services/lockService';
import {colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LockedPreview'>;

export function LockedPreviewScreen({navigation, route}: Props) {
  const {galleryId, initialIndex} = route.params;
  const {images} = useGalleryImages(galleryId);
  const [index, setIndex] = useState(initialIndex);
  const [unlockVisible, setUnlockVisible] = useState(false);
  const safeIndex = Math.min(index, Math.max(images.length - 1, 0));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const onUnlock = async () => {
    await clearLockSession();
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <LockedImagePager
        images={images}
        index={safeIndex}
        onIndexChange={setIndex}
        onUnlockHoldComplete={() => setUnlockVisible(true)}
      />
      {unlockVisible ? (
        <View style={styles.unlockLayer} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            onPress={onUnlock}
            style={({pressed}) => [styles.unlockCircle, pressed && styles.pressed]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  unlockLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.unlock,
  },
  pressed: {
    opacity: 0.85,
    transform: [{scale: 0.96}],
  },
});
