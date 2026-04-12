# Fractal CS105 — Tiểu luận Đồ họa Fractal

Môn học: **CS105 - Đồ họa Máy tính**

## Thành viên nhóm

| Họ và tên | MSSV |
|-----------|------|
| Lê Nguyễn Quốc Bảo | 23520108 |
| Phạm Khương Duy | 23520383 |
| Mai Xuân Tuấn | 23521714 |


---

## Mô tả dự án

Dự án tìm hiểu và trực quan hóa các loại **đồ họa Fractal** bằng **WebGL** chạy trực tiếp trên trình duyệt. Gồm 3 phần:

| Phần | Nội dung |
|------|----------|
| 2.1 & 2.2 | Bông tuyết Van Koch & Đảo Minkowski |
| 2.3 | Tam giác Sierpinski & Thảm Sierpinski |
| 2.4 | Tập Mandelbrot & Julia Set |

---

## Cách chạy

Có hai cách để chạy dự án:

### 1. Chạy trên trình duyệt (Dành cho phát triển)

> **Yêu cầu:** VS Code + extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
> *(Bắt buộc dùng HTTP server vì dự án dùng ES Modules và fetch shader.)*

**Bước 1:** Mở thư mục `Fractal_CS105/` bằng VS Code.

**Bước 2:** Click chuột phải vào file `index.html` ở thư mục gốc → chọn **"Open with Live Server"**.

**Bước 3:** Trình duyệt tự mở tại `http://127.0.0.1:5500` — chuyển tab để xem từng demo.

### 2. Chạy như ứng dụng Desktop (Sử dụng Electron)

> **Yêu cầu:** Đã cài đặt [Node.js](https://nodejs.org/).

**Bước 1: Cài đặt các gói phụ thuộc**
Mở terminal trong thư mục gốc của dự án và chạy lệnh:
```bash
npm install
```

**Bước 2: Khởi chạy ứng dụng**
Sau khi cài đặt xong, chạy lệnh sau:
```bash
npm start
```
Một cửa sổ ứng dụng sẽ hiện lên và bạn có thể tương tác với các fractal.

### 3. Đóng gói thành file .exe (Tùy chọn)

Nếu bạn muốn tạo file cài đặt `.exe` để phân phối, chạy lệnh sau:
```bash
npm run dist
```
File cài đặt sẽ được tạo trong thư mục `dist`.
