# BÁO CÁO PHÂN TÍCH LỖI VÀ KẾ HOẠCH SỬA LỖI TRANG QUẢN LÝ TÀI KHOẢN (PCHUB)

**Dự án:** PCHub (https://pchub-iota.vercel.app)  
**Trang bị lỗi:** `/tai-khoan/don-hang` (User Dashboard / Customer Portal)  
**Tác giả:** Lê Văn Chương  
**Ngày lập báo cáo:** 02/09/2026  

---

## 1. PHÂN TÍCH NHỮNG LỖI ĐANG GẶP PHẢI (Theo Ảnh Màn Hình)

### 🔴 Lỗi 1: Vỡ Giao Diện (CSS Unstyled / Broken Layout)
*   **Hiện trạng:** 
    *   Thanh Sidebar quản lý tài khoản (Tổng quan, Đơn hàng, Yêu thích, Bảo hành, Lịch sử AI Chat, v.v.) bị vỡ bố cục, hiển thị xếp chồng theo hàng dọc bên trái mà không có styling.
    *   Toàn bộ vùng nội dung chính (Main Content Area) bị đẩy xuống dưới hoặc trắng xóa.
    *   Không thấy các component UI card, bảng biểu hay avatar.
*   **Nguyên nhân Kỹ thuật:**
    *   Thiếu class CSS hoặc Flexbox/Grid wrapper trên layout chung của trang `/tai-khoan/layout.tsx`.
    *   CSS Tailwind không import đúng hoặc class bị dính gõ sai (ví dụ `flex-col` thay vì `flex-row` ở khung chứa Sidebar + Content).
    *   Lỗi Hydration Mismatch khiến CSS Modules/Tailwind không được inject đầy đủ khi render phía Client.

### 🔴 Lỗi 2: Chưa Lấy Được Dữ Liệu Thật (Hardcoded / Mock Data / API Fail)
*   **Hiện trạng:**
    *   Thông tin người dùng ("Lê Đức Hải", `lehai17082004@gmail.com`) và đơn hàng `ORD-20260820-0089` đang bị ghi cứng (hardcode) hoặc lấy từ mock static data.
    *   Các con số thống kê: `Tất cả (1) Chờ xác nhận (0) Đang giao (1) Đã giao (0) Hủy (0)` bị lệch với dữ liệu thực tế trong DB hoặc không load được API thật.
    *   Khi F5 trang không gọi API fetch profile/orders mới nhất.
*   **Nguyên nhân Kỹ thuật:**
    *   Chưa tích hợp API Endpoint kết nối đến cơ sở dữ liệu (Prisma / Supabase / MongoDB / PostgreSQL).
    *   Chưa gắn `JWT token` hoặc `Session Auth` vào header khi gọi API lấy thông tin người dùng đang đăng nhập.

---

## 2. DANH SÁCH CÁC VIỆC CẦN LÀM (TODO LIST)

### 📌 THIẾT LẬP VÀ SỬA LAYOUT GIAO DIỆN (UI/UX)
- [ ] **Bước 1:** Sửa file `app/tai-khoan/layout.tsx` (hoặc `pages/tai-khoan/_layout.tsx`).
  - [ ] Thêm Wrapper Layout dạng Flexbox (`display: flex`) / Grid (`grid grid-cols-1 md:grid-cols-4 gap-6`).
  - [ ] Tách Sidebar thành component riêng `<AccountSidebar />` chiếm 1 cột (25% width).
  - [ ] Tách Main Content thành `<main>` chiếm 3 cột (75% width).
- [ ] **Bước 2:** Style lại `<AccountSidebar />`.
  - [ ] Thêm Avatar tròn + Tên User + Email có khung đệm `bg-white p-4 rounded-xl shadow-sm border`.
  - [ ] Thêm style hover/active cho menu điều hướng (`hover:bg-blue-50 hover:text-blue-600 font-medium`).
  - [ ] Gắn Icon chuẩn từ `lucide-react` (thay vì các icon unicode đang bị lỗi font).
- [ ] **Bước 3:** Style lại trang `app/tai-khoan/don-hang/page.tsx`.
  - [ ] Thiết kế lại danh sách tab bộ lọc đơn hàng: `[Tất cả] [Chờ xác nhận] [Đang giao] [Đã giao] [Đã hủy]`.
  - [ ] Dùng Card component hiển thị từng Order (gồm Code đơn hàng, Ngày đặt, Mã tracking, Danh sách sản phẩm, Tổng tiền, Trạng thái Badge màu sắc).

---

### 📌 XỬ LÝ LOGIC DỮ LIỆU THẬT & CONNECT API (BACKEND INTEGRATION)

- [ ] **Bước 4:** Tạo các API Endpoints (Next.js App Router Route Handlers):
  - [ ] `GET /api/user/profile`: Lấy thông tin user hiện tại qua Session Token.
  - [ ] `GET /api/user/orders`: Lấy danh sách đơn hàng theo `userId` từ DB.
  - [ ] `GET /api/user/orders/[id]`: Lấy chi tiết 1 đơn hàng cụ thể.

- [ ] **Bước 5:** Kết nối Frontend với API (Client Data Fetching):
  - [ ] Sử dụng `SWR` hoặc `React Query` (`@tanstack/react-query`) để fetch dữ liệu client-side với cơ chế caching & revalidation tự động.
  - [ ] Thêm trạng thái `isLoading` (Skeleton Loading animation) khi dữ liệu đang được tải từ server.
  - [ ] Thêm trạng thái `isError` & `Empty state` khi người dùng chưa có đơn hàng nào.

- [ ] **Bước 6:** Xác thực Nguồn Dữ Liệu & Authentication:
  - [ ] Kiểm tra Middleware auth: Nếu người dùng chưa đăng nhập, tự động chuyển hướng (`redirect('/login')`).
  - [ ] Thay thế hoàn toàn dữ liệu cứng (`Lê Đức Hải`) bằng `session.user.name` và `session.user.email`.

---

## 3. CẤU TRÚC CODE THAM KHẢO CHO DỰ ÁN

### A. File Layout Tài Khoản (`app/tai-khoan/layout.tsx`)
```tsx
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar chiếm 250px / 1 phần */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <AccountSidebar />
          </aside>
          
          {/* Content chính */}
          <main className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
```

### B. Fetch Dữ Liệu Đơn Hàng Thật (`app/tai-khoan/don-hang/page.tsx`)
```tsx
"use client";

import useSWR from "swr";
import { OrderCard } from "@/components/account/OrderCard";
import { OrderSkeleton } from "@/components/account/OrderSkeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR("/api/user/orders", fetcher);

  if (isLoading) return <OrderSkeleton />;
  if (error) return <div className="text-red-500">Không thể tải danh sách đơn hàng. Vui lòng thử lại sau!</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))
      )}
    </div>
  );
}
```

---

## 4. CHECKLIST TIẾN ĐỘ KIỂM THỬ (TESTING CHECKLIST)

- [ ] Layout hiển thị responsive hoàn hảo trên Mobile, Tablet và Desktop.
- [ ] Màn hình Skeleton hiển thị mượt mà trong lúc chờ gọi API.
- [ ] Dữ liệu user (Name, Email, Order List) khớp 100% với database sau khi đăng nhập tài khoản khác nhau.
- [ ] Không còn dòng text cứng `ORD-20260820-0089` hay `Lê Đức Hải`.
- [ ] Test trường hợp user bị hết hạn Token / Chưa đăng nhập sẽ nhảy sang trang `/login`.
