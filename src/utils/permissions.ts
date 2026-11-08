import {PermissionsAndroid, Platform} from 'react-native';

export async function ensurePhotoLibraryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      {
        title: 'Quyền truy cập thư viện ảnh',
        message:
          'Mini Image Manager cần quyền đọc ảnh để bạn có thể chọn hình từ thư viện.',
        buttonPositive: 'Cho phép',
        buttonNegative: 'Từ chối',
      },
    );
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
      title: 'Quyền truy cập thư viện ảnh',
      message:
        'Mini Image Manager cần quyền đọc ảnh để bạn có thể chọn hình từ thư viện.',
      buttonPositive: 'Cho phép',
      buttonNegative: 'Từ chối',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}
