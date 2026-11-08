import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImagePreviewGallery} from '../../components/ImagePreview/ImagePreviewGallery';
import {useGalleryImages} from '../../hooks/useGalleryImages';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme/colors';
import {MAX_IMAGES_PER_GALLERY} from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'ImagePreview'>;

export function ImagePreviewScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {galleryId, initialIndex} = route.params;
  const {images, loading} = useGalleryImages(galleryId);
  const [index, setIndex] = useState(initialIndex);
  const safeIndex = Math.min(index, Math.max(images.length - 1, 0));

  const label = useMemo(
    () => `${images.length ? safeIndex + 1 : 0}/${images.length} · ${images.length}/${MAX_IMAGES_PER_GALLERY} ảnh`,
    [images.length, safeIndex],
  );

  return (
    <View style={styles.screen}>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : images.length === 0 ? (
        <Text style={styles.empty}>Không còn ảnh để xem.</Text>
      ) : (
        <ImagePreviewGallery
          images={images}
          initialIndex={safeIndex}
          onIndexChange={setIndex}
        />
      )}
      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.close}>
          <Text style={styles.closeText}>Đóng</Text>
        </Pressable>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {marginTop: 120},
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 120,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  close: {
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeText: {
    color: colors.text,
    fontWeight: '700',
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
});
