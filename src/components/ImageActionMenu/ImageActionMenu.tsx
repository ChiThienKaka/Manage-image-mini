import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme/colors';

type Props = {
  visible: boolean;
  canAdd: boolean;
  canLock: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLock: () => void;
  onClose: () => void;
};

function ActionCircle({
  color,
  label,
  disabled,
  onPress,
}: {
  color: string;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.circleWrap,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <View style={[styles.circle, {backgroundColor: color}]} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export function ImageActionMenu({
  visible,
  canAdd,
  canLock,
  onAdd,
  onEdit,
  onDelete,
  onLock,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>Thao tác ảnh</Text>
          <Text style={styles.subtitle}>Chọn một chức năng hoặc chạm ra ngoài để hủy.</Text>
          <View style={styles.row}>
            <ActionCircle color={colors.add} label="Thêm" disabled={!canAdd} onPress={onAdd} />
            <ActionCircle color={colors.edit} label="Sửa" onPress={onEdit} />
            <ActionCircle color={colors.remove} label="Xóa" onPress={onDelete} />
          </View>
          <View style={styles.lockRow}>
            <ActionCircle
              color={colors.lock}
              label="Lock"
              disabled={!canLock}
              onPress={onLock}
            />
          </View>
          {!canAdd ? (
            <Text style={styles.limit}>Gallery đã đủ 5/5 ảnh, không thể thêm mới.</Text>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  lockRow: {
    marginTop: 22,
    alignItems: 'center',
  },
  circleWrap: {
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{scale: 0.96}],
  },
  disabled: {
    opacity: 0.35,
  },
  limit: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 18,
    fontSize: 12,
  },
});
