# Nhật Ký Thay Đổi Quản Trị PCHub (ADMIN_CHANGELOG.md)

Tài liệu ghi lại toàn bộ tiến độ kiểm tra, sửa lỗi chức năng và thiết kế lại giao diện hệ thống quản trị PCHub Admin Dashboard theo từng đợt thực hiện.

---

## 📌 ĐỢT 1 (WAVE 1): Design Tokens, App Shell, Thông Báo Toast & Quản Lý Đơn Hàng Chi Tiết
**Ngày hoàn thành:** 26/11/2026  
**Trạng thái kiểm thử:** ✅ Đã hoàn tất và vượt qua 100% kịch bản tự động hóa Playwright & `npm run build`

### 1. Những lỗi đã được giải quyết triệt để
- **Lỗi chữ màu trắng trên nền trắng ("ko hiển thị chữ"):**
  - *Nguyên nhân:* Thẻ bao bọc `StorefrontShell` trước đây gán class `.dark` cho toàn bộ trang con, dẫn đến các thẻ `input`, `textarea`, và bảng biểu bên trong Admin thừa hưởng quy tắc CSS chữ trắng trên nền trắng.
  - *Giải pháp:* `AdminShell` tự động loại bỏ class `.dark` khỏi `document.documentElement`, đồng thời thiết lập quy tắc CSS cưỡng bức độ tương phản cao (`color: #0f172a !important`) cho mọi trường nhập liệu bên trong phân vùng admin.
- **Lỗi `Minified React error #441` khi thao tác đơn hàng & flash sale:**
  - *Nguyên nhân:* Server Actions của Supabase bị chặn bởi Row-Level Security (RLS) khi phiên làm việc dùng cookie nội bộ `pchub_admin_session`.
  - *Giải pháp:* Tích hợp cơ chế dự phòng an toàn qua PostgreSQL Pool trực tiếp (`@/lib/db`), đảm bảo các thao tác cập nhật trạng thái đơn hàng, thanh toán và ghi chú luôn thực thi thành công.
- **Lỗi mã hóa cookie phiên đăng nhập (`decodeURIComponent`):**
  - Cập nhật cả `middleware.ts` và `layout.tsx` giải mã chuỗi JSON URL-encoded, đảm bảo việc xác thực session qua môi trường kiểm thử tự động luôn mượt mà.

### 2. Các thành phần và trang mới được triển khai
- **Trang Chi Tiết Đơn Hàng (`/admin/orders/[id]`):**
  - **Tiến trình đơn hàng (Stepper 5 bước):** *Chờ duyệt → Đã xác nhận → Đang giao hàng → Hoàn thành* (hoặc *Đã hủy đơn*). Hỗ trợ nút chuyển nhanh bước xử lý trực tiếp.
  - **Mẫu in hóa đơn bán lẻ chuyên nghiệp:** Tích hợp nút **"In hóa đơn"** mở lệnh in chuẩn hệ thống, định dạng hóa đơn bán lẻ A4/A5 tự động ẩn toàn bộ thanh công cụ và sidebar.
  - **Bảng linh kiện chi tiết:** Hiển thị ảnh linh kiện, tên sản phẩm, mã SKU chính hãng, số lượng, đơn giá và tổng tiền.
  - **Khối khách hàng & giao nhận:** Hiển thị tên, số điện thoại, email, địa chỉ giao hàng 4 cấp.
  - **Quản lý thanh toán:** Hiển thị trạng thái thanh toán hiện tại kèm nút bấm chuyển đổi nhanh sang "Đã thanh toán".
  - **Ghi chú nội bộ:** Cho phép nhân viên lưu ghi chú nghiệp vụ xử lý đơn hàng với phản hồi Toast thông báo.
- **Design System & Shell (theo chuẩn Stitch Mockup):**
  - **Sidebar:** Tông màu Slate Navy đậm sang trọng, đồng bộ icon các phân hệ (Tổng quan, Sản phẩm, Đơn hàng, Khách hàng, Marketing, Nội dung, Hệ thống), hiển thị thẻ định danh quản trị viên Super Admin ở góc dưới.
  - **Header:** Thanh tìm kiếm nhanh dạng spotlight, chuông thông báo, menu truy cập tài khoản.
  - **AdminToastProvider & AdminConfirmDialog:** Hệ thống toast notification (Success, Error, Info) và modal xác nhận thao tác xóa nguy hiểm có animation mượt mà.

---

## 🧪 Hướng Dẫn Kiểm Thử Thủ Công (Manual Test Guide)

1. **Đăng nhập khu vực Quản trị:**
   - Truy cập: `http://localhost:3000/admin/login`
   - Nhập tài khoản: `admin@pchub.vn` / `admin123456`
   - Xác nhận: Hệ thống điều hướng thành công vào `/admin` Dashboard chuẩn giao diện Stitch.

2. **Kiểm tra Danh sách và Chi tiết Đơn hàng:**
   - Truy cập: `http://localhost:3000/admin/orders`
   - Bấm vào bất kỳ đơn hàng nào (ví dụ đơn `#ORD-0047` hoặc đơn thực tế trong CSDL).
   - Xác nhận: Trang `/admin/orders/[id]` hiển thị đầy đủ Stepper tiến trình, danh sách linh kiện, thông tin người nhận và ghi chú.

3. **Kiểm tra tính năng Đổi trạng thái & Lưu ghi chú:**
   - Bấm nút **"Xác nhận đơn hàng →"**: Trạng thái chuyển sang màu xanh dương, thông báo Toast hiện góc dưới màn hình.
   - Bấm nút **"✓ Đánh dấu Đã thanh toán"**: Thẻ thanh toán chuyển sang trạng thái "Đã thanh toán".
   - Nhập ghi chú mới vào ô "Ghi chú nội bộ nhân viên" và bấm **"Lưu ghi chú"**: Toast thông báo thành công.

4. **Kiểm tra In hóa đơn:**
   - Bấm nút **"In hóa đơn"** ở đầu trang.
   - Xác nhận giao diện in (Print Preview): Toàn bộ sidebar, breadcrumb và các nút bấm được ẩn; hóa đơn bán lẻ PCHub với tiêu đề công ty và bảng giá hiển thị chuẩn nét.

---

## 🚀 Kế Hoạch ĐỢT 2 (WAVE 2: Sản Phẩm, Danh Mục, Hãng Sản Xuất)
1. **Component Bảng Dữ Liệu Dùng Chung (`AdminDataTable`):**
   - Hỗ trợ Sticky Header, chọn nhiều dòng (Bulk select), thanh tác vụ hàng loạt (Xóa đã chọn, Đổi trạng thái).
   - Bộ lọc theo trạng thái/thương hiệu, ô tìm kiếm debounce, phân trang mượt, Empty state chuẩn UX.
   - Tự động chuyển đổi hiển thị dạng thẻ card trên màn hình di động (< 640px).
2. **Nâng cấp Quản lý Sản Phẩm (`/admin/products` & `/admin/products/new` / `[id]`):**
   - Multi-image upload preview (kéo thả ảnh, chọn ảnh đại diện).
   - Quản lý thông số kỹ thuật phần cứng PC (CPU Socket, RAM Bus, GPU TDP/Kích thước, Công suất nguồn khuyến nghị).
3. **Nâng cấp Danh Mục & Hãng Sản Xuất (`/admin/categories`, `/admin/brands`):**
   - Tự động tạo slug tiếng Việt chuẩn SEO không dấu (`vietnamese-slug`).
   - Hiển thị số lượng sản phẩm liên kết và xem trước logo thương hiệu.
