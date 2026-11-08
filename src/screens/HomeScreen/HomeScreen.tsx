import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {useGalleries} from '../../hooks/useGalleries';
import {MAX_IMAGES_PER_GALLERY} from '../../utils/constants';
import {toFileUri} from '../../utils/paths';
import {colors} from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {galleries, loading, error, addGallery, deleteGallery} = useGalleries();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const onCreate = async () => {
    setCreating(true);
    try {
      const gallery = await addGallery(name || `Gallery ${galleries.length + 1}`);
      setName('');
      navigation.navigate('Gallery', {galleryId: gallery.id});
    } catch (createError) {
      Alert.alert(
        'Không thể tạo gallery',
        createError instanceof Error ? createError.message : 'Đã xảy ra lỗi.',
      );
    } finally {
      setCreating(false);
    }
  };

  const onDelete = (id: string, galleryName: string) => {
    Alert.alert('Xóa gallery', `Xóa "${galleryName}" và toàn bộ ảnh bên trong?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          deleteGallery(id).catch(deleteError => {
            Alert.alert(
              'Không thể xóa',
              deleteError instanceof Error ? deleteError.message : 'Đã xảy ra lỗi.',
            );
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 12}]}>
      <Text style={styles.kicker}>Mini Image Manager</Text>
      <Text style={styles.title}>Gallery của bạn</Text>
      <Text style={styles.subtitle}>Mỗi gallery lưu tối đa {MAX_IMAGES_PER_GALLERY} ảnh gốc.</Text>

      <View style={styles.composer}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tên gallery mới"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable style={styles.createButton} onPress={onCreate} disabled={creating}>
          <Text style={styles.createText}>{creating ? '...' : 'Tạo'}</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={colors.accent} style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={galleries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : <Text style={styles.empty}>Chưa có gallery. Tạo một gallery để bắt đầu.</Text>
        }
        renderItem={({item}) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('Gallery', {galleryId: item.id})}
            onLongPress={() => onDelete(item.id, item.name)}>
            {item.preview_path ? (
              <Image source={{uri: toFileUri(item.preview_path)}} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]} />
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.image_count}/{MAX_IMAGES_PER_GALLERY} ảnh
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 20,
  },
  composer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  createText: {
    color: colors.background,
    fontWeight: '700',
  },
  loader: {marginVertical: 16},
  error: {color: colors.remove, marginBottom: 8},
  list: {paddingBottom: 32, gap: 12},
  empty: {color: colors.muted, textAlign: 'center', marginTop: 48},
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 84,
    height: 84,
    backgroundColor: colors.surfaceAlt,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.muted,
    marginTop: 4,
  },
});
