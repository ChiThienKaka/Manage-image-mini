# Mini Image Manager

Ứng dụng React Native CLI (0.81, TypeScript) để quản lý hình ảnh trên Android. Ảnh được copy vào bộ nhớ riêng của app; SQLite chỉ lưu metadata và đường dẫn, không lưu BLOB.

## Yêu cầu môi trường

- Node.js 18+
- JDK 17
- Android SDK (API 36 / Build Tools 36)
- Thiết bị Android hoặc emulator

## Chạy bản phát triển

```sh
npm start
npm run android
```

## Build APK

Trên Windows, nếu CMake/ninja báo đường dẫn dài hơn 260 ký tự, đặt Gradle home ngắn trước khi build:

```sh
set GRADLE_USER_HOME=D:\g
npm run apk
```

File APK release:

`android/app/build/outputs/apk/release/app-release.apk`

APK này được ký bằng debug keystore (đủ để cài trực tiếp khi kiểm thử). Trên thiết bị:

1. Copy APK vào điện thoại.
2. Mở file và cho phép cài từ nguồn không xác định nếu hệ thống yêu cầu.
3. Mở **Mini Image Manager**, tạo gallery, thêm ảnh từ thư viện.

## Kiểm thử chức năng trên máy thật

- Giới hạn 5 ảnh / gallery và chọn nhiều ảnh cùng lúc.
- Vuốt trái/phải trên gallery và màn preview.
- Pinch-to-zoom, double-tap, kéo ảnh khi đang zoom.
- Nhấn giữ 5 giây để hiện menu 3 nút tròn (xanh thêm, vàng sửa, đỏ xóa).
- Xác nhận trước khi xóa; hủy thì không đổi dữ liệu.
- Đóng app rồi mở lại: ảnh vẫn còn vì đã lưu trong thư mục riêng + SQLite.

## Kiến trúc lưu trữ

- File: `{DocumentDirectory}/MiniImageManager/images/{uuid}.ext`
- SQLite: `mini_image_manager.sqlite` với bảng `galleries` và `images`
- Nếu copy/ghi DB thất bại giữa chừng, file tạm được xóa và không để metadata mồ côi.
