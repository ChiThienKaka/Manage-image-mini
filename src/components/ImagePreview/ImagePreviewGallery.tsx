import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Gallery from 'react-native-awesome-gallery';
import type {ImageRecord} from '../../types';
import {toFileUri} from '../../utils/paths';
import {colors} from '../../theme/colors';

type Props = {
  images: ImageRecord[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
};

export function ImagePreviewGallery({images, initialIndex, onIndexChange}: Props) {
  return (
    <View style={styles.container}>
      <Gallery
        data={images}
        initialIndex={initialIndex}
        keyExtractor={item => item.id}
        onIndexChange={onIndexChange}
        doubleTapEnabled
        pinchEnabled
        swipeEnabled
        maxScale={6}
        renderItem={({item, setImageDimensions}) =>
          item.missing ? (
            <View
              style={styles.missing}
              onLayout={() => setImageDimensions({width: 1, height: 1})}>
              <Text style={styles.missingText}>Không tìm thấy file ảnh.</Text>
            </View>
          ) : (
            <Image
              source={{uri: toFileUri(item.file_path)}}
              style={styles.image}
              resizeMode="contain"
              onLoad={event => {
                setImageDimensions({
                  width: event.nativeEvent.source.width || item.width || 1,
                  height: event.nativeEvent.source.height || item.height || 1,
                });
              }}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: colors.muted,
  },
});
