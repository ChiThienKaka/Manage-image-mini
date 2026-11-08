import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {ImageRecord} from '../../types';
import {LONG_PRESS_DURATION_MS} from '../../utils/constants';
import {toFileUri} from '../../utils/paths';
import {colors} from '../../theme/colors';

type Props = {
  images: ImageRecord[];
  index: number;
  onIndexChange: (index: number) => void;
  onOpenPreview: (index: number) => void;
  onLongPressComplete: (index: number) => void;
  onAddPress?: () => void;
  canAdd?: boolean;
};

const {width} = Dimensions.get('window');

export function ImagePager({
  images,
  index,
  onIndexChange,
  onOpenPreview,
  onLongPressComplete,
  onAddPress,
  canAdd = true,
}: Props) {
  const listRef = useRef<FlatList<ImageRecord>>(null);
  const progress = useSharedValue(0);
  const holdingIndex = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);
  const [pagerHeight, setPagerHeight] = useState(0);

  const startHold = (itemIndex: number) => {
    holdingIndex.current = itemIndex;
    setHolding(true);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: LONG_PRESS_DURATION_MS,
      easing: Easing.linear,
    });
  };

  const cancelHold = () => {
    holdingIndex.current = null;
    setHolding(false);
    cancelAnimation(progress);
    progress.value = withTiming(0, {duration: 160});
  };

  const holdStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + progress.value * 0.04}],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    if (images.length === 0 || pagerHeight === 0) {
      return;
    }
    listRef.current?.scrollToIndex({index, animated: true});
  }, [index, images.length, pagerHeight]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== index) {
      onIndexChange(nextIndex);
    }
  };

  if (images.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Chưa có ảnh</Text>
        <Text style={styles.emptyText}>Thêm ảnh từ thư viện để bắt đầu gallery này.</Text>
        {canAdd ? (
          <Pressable style={styles.emptyButton} onPress={onAddPress}>
            <Text style={styles.emptyButtonText}>Thêm ảnh</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={styles.flex}
      onLayout={event => setPagerHeight(event.nativeEvent.layout.height)}>
      {pagerHeight > 0 ? (
        <FlatList
          ref={listRef}
          data={images}
          horizontal
          pagingEnabled
          keyExtractor={item => item.id}
          extraData={index}
          getItemLayout={(_, itemIndex) => ({
            length: width,
            offset: width * itemIndex,
            index: itemIndex,
          })}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({index: info.index, animated: true});
            }, 80);
          }}
          onMomentumScrollEnd={onMomentumScrollEnd}
          showsHorizontalScrollIndicator={false}
          style={styles.flex}
          renderItem={({item, index: itemIndex}) => (
            <Pressable
              delayLongPress={LONG_PRESS_DURATION_MS}
              onPress={() => onOpenPreview(itemIndex)}
              onPressIn={() => startHold(itemIndex)}
              onPressOut={cancelHold}
              onLongPress={() => {
                cancelHold();
                onLongPressComplete(itemIndex);
              }}
              style={[styles.page, {height: pagerHeight}]}>
              <Animated.View
                style={[
                  styles.imageWrap,
                  {height: pagerHeight - 24},
                  itemIndex === index ? holdStyle : undefined,
                ]}>
                {item.missing ? (
                  <View style={styles.missing}>
                    <Text style={styles.missingTitle}>Ảnh bị thiếu</Text>
                    <Text style={styles.missingText}>
                      File không còn trong bộ nhớ ứng dụng. Hãy xóa hoặc thay thế ảnh này.
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{uri: toFileUri(item.file_path)}}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </Pressable>
          )}
        />
      ) : null}
      {holding ? (
        <View style={styles.holdHint}>
          <Text style={styles.holdText}>Giữ 5 giây để mở menu thao tác</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, barStyle]} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  page: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    width: width - 32,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: colors.add,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#052E16',
    fontWeight: '700',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  missingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  missingText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  holdHint: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 12,
    backgroundColor: colors.overlay,
    borderRadius: 14,
    padding: 12,
  },
  holdText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
  },
  track: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 99,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    backgroundColor: colors.accent,
  },
});
