import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImagePager} from '../../components/ImageList/ImagePager';
import {ImageActionMenu} from '../../components/ImageActionMenu/ImageActionMenu';
import {useGalleryImages} from '../../hooks/useGalleryImages';
import type {RootStackParamList} from '../../navigation/types';
import {colors} from '../../theme/colors';
import {MAX_IMAGES_PER_GALLERY} from '../../utils/constants';
import {ImageLimitError} from '../../services/imageService';
import {saveLockSession} from '../../services/lockService';
import {toFileUri} from '../../utils/paths';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

export function GalleryScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {galleryId} = route.params;
  const {
    gallery,
    images,
    loading,
    busy,
    error,
    addImages,
    replaceCurrentImage,
    deleteCurrentImage,
  } = useGalleryImages(galleryId);
  const [index, setIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const safeIndex = Math.min(index, Math.max(images.length - 1, 0));
  const currentImage = images[safeIndex];
  const canAdd = images.length < MAX_IMAGES_PER_GALLERY;

  useEffect(() => {
    if (index !== safeIndex) {
      setIndex(safeIndex);
    }
  }, [index, safeIndex]);

  const countLabel = useMemo(
    () => `${images.length}/${MAX_IMAGES_PER_GALLERY} ảnh`,
    [images.length],
  );

  const handleError = (actionError: unknown, title: string) => {
    const message =
      actionError instanceof ImageLimitError
        ? actionError.message
        : actionError instanceof Error
          ? actionError.message
          : 'Đã xảy ra lỗi.';
    Alert.alert(title, message);
  };

  const onAdd = async () => {
    setMenuVisible(false);
    try {
      await addImages();
    } catch (addError) {
      handleError(addError, 'Không thể thêm ảnh');
    }
  };

  const onEdit = async () => {
    setMenuVisible(false);
    if (!currentImage) {
      return;
    }
    try {
      await replaceCurrentImage(currentImage.id);
    } catch (editError) {
      handleError(editError, 'Không thể thay thế ảnh');
    }
  };

  const onLock = async () => {
    setMenuVisible(false);
    if (!currentImage) {
      return;
    }
    await saveLockSession({
      galleryId,
      initialIndex: safeIndex,
    });
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'LockedPreview',
          params: {galleryId, initialIndex: safeIndex},
        },
      ],
    });
  };

  const onDelete = () => {
    setMenuVisible(false);
    if (!currentImage) {
      return;
    }
    Alert.alert('Xóa ảnh', 'Ảnh sẽ bị xóa khỏi gallery và bộ nhớ ứng dụng.', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          deleteCurrentImage(currentImage.id).catch(deleteError => {
            handleError(deleteError, 'Không thể xóa ảnh');
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {gallery?.name ?? 'Gallery'}
          </Text>
          <Text style={styles.count}>{countLabel}</Text>
        </View>
        <Pressable
          onPress={onAdd}
          disabled={!canAdd || busy}
          style={[styles.addButton, (!canAdd || busy) && styles.addDisabled]}>
          <Text style={styles.addText}>Thêm</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <ImagePager
          images={images}
          index={safeIndex}
          canAdd={canAdd}
          onAddPress={onAdd}
          onIndexChange={setIndex}
          onOpenPreview={previewIndex =>
            navigation.navigate('ImagePreview', {
              galleryId,
              initialIndex: previewIndex,
            })
          }
          onLongPressComplete={() => setMenuVisible(true)}
        />
      )}

      {images.length > 0 ? (
        <View style={[styles.strip, {paddingBottom: insets.bottom + 12}]}>
          {images.map((image, imageIndex) => (
            <Pressable key={image.id} onPress={() => setIndex(imageIndex)}>
              <Image
                source={{uri: toFileUri(image.file_path)}}
                style={[
                  styles.mini,
                  imageIndex === safeIndex && styles.miniActive,
                ]}
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{height: insets.bottom + 24}} />
      )}

      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : null}

      <ImageActionMenu
        visible={menuVisible && Boolean(currentImage)}
        canAdd={canAdd}
        canLock={images.length > 0}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onLock={onLock}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 18,
  },
  headerText: {flex: 1},
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  count: {
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.add,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: 'center',
  },
  addDisabled: {opacity: 0.4},
  addText: {color: '#052E16', fontWeight: '700'},
  error: {
    color: colors.remove,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loader: {marginTop: 48},
  strip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  mini: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  miniActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  busy: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
