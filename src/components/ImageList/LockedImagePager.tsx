import React, {useEffect, useRef} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import type {ImageRecord} from '../../types';
import {UNLOCK_HOLD_DURATION_MS} from '../../utils/constants';
import {toFileUri} from '../../utils/paths';

type Props = {
  images: ImageRecord[];
  index: number;
  onIndexChange: (index: number) => void;
  onUnlockHoldComplete: () => void;
};

const {width, height} = Dimensions.get('window');

export function LockedImagePager({
  images,
  index,
  onIndexChange,
  onUnlockHoldComplete,
}: Props) {
  const listRef = useRef<FlatList<ImageRecord>>(null);

  useEffect(() => {
    if (images.length === 0) {
      return;
    }
    listRef.current?.scrollToIndex({index, animated: false});
  }, [index, images.length]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== index) {
      onIndexChange(nextIndex);
    }
  };

  if (images.length === 0) {
    return <View style={styles.screen} />;
  }

  return (
    <FlatList
      ref={listRef}
      data={images}
      horizontal
      pagingEnabled
      bounces={false}
      keyExtractor={item => item.id}
      extraData={index}
      getItemLayout={(_, itemIndex) => ({
        length: width,
        offset: width * itemIndex,
        index: itemIndex,
      })}
      onScrollToIndexFailed={info => {
        setTimeout(() => {
          listRef.current?.scrollToIndex({index: info.index, animated: false});
        }, 80);
      }}
      onMomentumScrollEnd={onMomentumScrollEnd}
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => (
        <Pressable
          delayLongPress={UNLOCK_HOLD_DURATION_MS}
          onLongPress={onUnlockHoldComplete}
          style={styles.page}>
          {item.missing ? (
            <View style={styles.page} />
          ) : (
            <Image
              source={{uri: toFileUri(item.file_path)}}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width,
    height,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height,
  },
});
