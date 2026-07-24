# 🏡 Hidden Gem - Hệ Thống Đặt Phòng Homestay & VR 360°

Hệ thống ứng dụng Web Full-Stack dành cho khách hàng đặt phòng Homestay nghỉ dưỡng (với trải nghiệm VR 360°, Gemini AI Trip Planner, khóa giữ chỗ server Pessimistic Locking) và màn hình Lễ tân Admin quản lý check-in, tính hóa đơn và mã hóa sơ đồ DB.

---

## 🚀 1. Hướng Dẫn Chạy Dự Án Trên Localhost Bằng Visual Studio / VS Code

### 📋 Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.0.0` (Khuyên dùng Node 20 LTS).
- **Trình soạn thảo**: Visual Studio Code (hoặc Visual Studio 2022 / WebStorm).
- **NPM** hoặc **Yarn / Bun / PNPM**.

---

### 🔨 Các Bước Cài Đặt & Chạy Lên Localhost

#### Bước 1: Mở dự án trong Visual Studio Code / Visual Studio
Mở VS Code hoặc Visual Studio, chọn **File** ➔ **Open Folder...** ➔ Chọn thư mục dự án `Hidden Gem`.

#### Bước 2: Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc (hoặc sao chép từ `.env.example`):
```bash
cp .env.example .env
```
*(Tùy chọn) Thêm Gemini API Key vào `.env` nếu muốn sử dụng tính năng tạo lịch trình phượt AI:*
```env
GEMINI_API_KEY=AIzaSy...
```

#### Bước 3: Cài đặt các gói phụ thuộc (Dependencies)
Mở Terminal trong VS Code (`Ctrl + ~` hoặc `Cmd + ~`) và chạy lệnh:
```bash
npm install
```

#### Bước 4: Khởi chạy môi trường Dev Server
Chạy lệnh phát triển:
```bash
npm run dev
```
Hoặc bấm phím **F5** trong VS Code (đã được cấu hình sẵn trong `.vscode/launch.json`).

Hệ thống Backend Express + Vite sẽ tự động khởi tạo trên cổng **3000**.
Mở trình duyệt bất kỳ và truy cập địa chỉ:
👉 **`http://localhost:3000`**

---

## 🛠️ Các Lệnh Thường Dùng (Scripts)

| Lệnh | Mô Tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy máy chủ Express + Vite HMR trên `http://localhost:3000` |
| `npm run build` | Đóng gói sản phẩm thành tệp `dist/server.cjs` chuẩn Production |
| `npm start` | Chạy ứng dụng đã build trong môi trường Production (`node dist/server.cjs`) |
| `npm run lint` | Kiểm tra lỗi cú pháp TypeScript (`tsc --noEmit`) |


---

## 🔑 Tài Khoản Đăng Nhập Lễ Tân (Admin)

Bên khách hàng (**Guest**) truy cập trực tiếp **không cần đăng nhập**.
Đối với màn hình **Lễ tân Admin**:
- **Username**: `admin`
- **Password**: `admin123`
*(Hoặc ấn nút "Đăng Nhập Nhanh Demo 1-Click" trên giao diện)*

---

## 📌 Bảng So Sánh Sản Phẩm Hiện Tại & Các Yếu Tố Cần Để Thành Trang Booking Thực Thụ

| Hạng mục | Đã Có Trong Ứng Dụng | Cần Bổ Sung Để Thành Trang Booking Thực Thụ (Production) |
| :--- | :--- | :--- |
| **Danh Sách 15 Phòng & VR 360°** | ✅ Đã giới hạn đúng 15 phòng với trình xem VR 360° giả lập kéo rê 3D linh hoạt. | 🔴 Tích hợp thêm camera chụp hình thực tế Matterport 360 SDK hoặc Panolens.js / Three.js chuyên sâu. |
| **Khóa Giữ Phòng (Anti-Collision)** | ✅ Đã có Pessimistic Locking 10 phút trên Server Express. | 🔴 Kết nối cơ sở dữ liệu Postgres Redis Cache thật để duy trì state khóa khi nâng cấp scale multi-server. |
| **Thanh Toán (Payment Gateways)** | ✅ Đã mô phỏng luồng VNPay, Stripe, Thẻ tín dụng & Quét mã QR. | 🔴 Đăng ký Webhook IPN chính thức từ VNPay / Momo / ZaloPay API / Stripe Live Key. |
| **Gửi Mã Pin & Khóa Cửa SmartLock** | ✅ Đã có giao diện hiển thị OTP & Mã Pin khóa số thông minh. | 🔴 Tích hợp SMS OTP Gateway (Twilio/Brandname SMS) & Tuya/TTLock IoT Smart Lock Cloud API. |
| **Lễ Tân & Check-In** | ✅ Đã có Dashboard nhận phòng, tính phí dịch vụ phát sinh & tự động xuất hóa đơn. | 🔴 Tích hợp máy quét CCCD chip NFC / OCR tự động điền thông tin lưu trú lên Bộ Công An (VNeID). |
| **Cơ Sở Dữ Liệu** | ✅ Đã cung cấp sẵn bộ Script DDL PostgreSQL 8 bảng & mã DBML vẽ ERD. | 🔴 Deploy DB thực tế trên GCP Cloud SQL / Supabase / Neon PostgreSQL. |
