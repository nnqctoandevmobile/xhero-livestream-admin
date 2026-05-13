# XHERO Livestream Admin

Đây là trang quản trị (Admin Dashboard) dành cho hệ thống nền tảng XHERO Livestream, được xây dựng bằng React và Vite.

## 🚀 Hướng dẫn cài đặt và khởi chạy

Để chạy dự án trên môi trường phát triển (Local Development), vui lòng làm theo các bước sau:

1. **Cài đặt các gói phụ thuộc (Dependencies)**
   Mở terminal tại thư mục gốc của dự án và chạy lệnh:
   ```bash
   npm install
   ```

2. **Khởi chạy ứng dụng (Development Server)**
   Sau khi cài đặt xong, khởi động Vite dev server bằng lệnh:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ mặc định (thường là `http://localhost:5173`). Bạn có thể mở trình duyệt và truy cập vào đường dẫn hiển thị trên terminal.

## 📁 Cấu trúc các trang hiện tại

Hiện tại, hệ thống quản trị đang bao gồm **2 trang chính**:

### 1. Trang Đăng nhập (Login Page)
- **Đường dẫn**: `/sign-in`
- **Mô tả**: Đây là trang xác thực người dùng. Người quản trị cần nhập Tên đăng nhập và Mật khẩu để hệ thống cấp quyền truy cập. Sau khi đăng nhập thành công, hệ thống sẽ lưu thông tin xác thực và tự động chuyển hướng đến Trang Chủ.

### 2. Trang Chủ (Home Page)
- **Đường dẫn**: `/home`
- **Mô tả**: Trang tổng quan dành cho quản trị viên, nơi hiển thị Sidebar bên trái và khu vực nội dung chính ở bên phải. Trang chủ được chia thành các tab (chức năng) khác nhau để quản lý:
  - **Danh sách phiên**: Quản lý và theo dõi các phiên livestream (Đang Live, Sắp diễn ra, Đã kết thúc,...).
  - **Tạo phiên mới**: Thiết lập cấu hình và tạo phòng livestream mới.
  - **Form tư vấn**: Quản lý các mẫu form đăng ký hoặc yêu cầu tư vấn.
  - **Video playback**: Quản lý danh sách các video đã được lưu lại từ các phiên livestream trước đó.
  - *(Và các tính năng mở rộng khác như Thống kê...)*

---

*Lưu ý: Dự án sử dụng cấu hình biến môi trường với các tiền tố `VITE_`, `NEXT_PUBLIC_` và `REACT_APP_` thông qua Vite config. Đảm bảo bạn đã có sẵn file `.env` hợp lệ trước khi khởi chạy.*
