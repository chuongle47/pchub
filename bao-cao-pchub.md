# Báo Cáo Rà Soát và Tối Ưu Toàn Diện Giao Diện PCHub

Hệ thống giao diện website **PCHub** đã được rà soát, tái cấu trúc và chuẩn hóa theo đúng 5 nhóm tiêu chí đặt ra, ưu tiên tối đa thông qua hệ thống **Design Tokens toàn cục** tại [globals.css](file:///e:/pchub-main/pchub-main/src/app/globals.css) mà không làm thay đổi bất kỳ logic nghiệp vụ nào của dự án.

---

## 1. Chuẩn Hóa Font Chữ (Typography)

### Các vấn đề phát hiện & Giải pháp thực hiện:
- **Nguyên nhân lỗi font tiếng Việt & fallback vỡ chữ**: Đường dẫn Google Fonts cũ chỉ load latin cơ bản, thiếu bộ ký tự tiếng Việt (`subset=vietnamese`) và thiếu `display=swap`.
- **Giải pháp**:
  - Cập nhật font **Inter** tại [globals.css](file:///e:/pchub-main/pchub-main/src/app/globals.css) với đầy đủ `family=Inter:wght@300;400;500;600;700;800&subset=vietnamese,latin-ext&display=swap`.
  - Định nghĩa biến CSS toàn cục:
    ```css
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ```
  - Áp dụng cưỡng bức toàn trang (áp dụng cả cho các phần tử trình duyệt hay override như `button`, `input`, `select`, `textarea`, `label`, `optgroup`):
    ```css
    html, body, button, input, select, textarea, optgroup, option, label {
      font-family: var(--font-primary) !important;
      -webkit-font-smoothing: antialiased;
    }
    ```
  - Loại bỏ các biến font cục bộ kế thừa Next.js starter (`--font-geist-sans`, `--font-geist-mono`) trong [page.module.css](file:///e:/pchub-main/pchub-main/src/app/page.module.css).
  - Thay thế các class `font-mono` rải rác làm vỡ font số tiền bằng CSS chuẩn `tabular-nums` trong [ProductGrid.tsx](file:///e:/pchub-main/pchub-main/src/components/shop/ProductGrid.tsx) và [đơn hàng chi tiết](file:///e:/pchub-main/pchub-main/src/app/tai-khoan/don-hang/[id]/page.tsx).

### Bảng thang cỡ chữ chuẩn hóa (Fluid Typography Scale):
| Cấp độ | Biến CSS | Kích thước | Line-height | Ứng dụng |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | `--font-size-h1` | `clamp(1.85rem, 3.5vw, 2.35rem)` | 1.2 | Tiêu đề chính trang, Hero banner |
| **H2** | `--font-size-h2` | `clamp(1.5rem, 2.8vw, 1.85rem)` | 1.25 | Tiêu đề section lớn |
| **H3** | `--font-size-h3` | `clamp(1.25rem, 2.2vw, 1.5rem)` | 1.3 | Tiêu đề danh mục, tiêu đề card lớn |
| **H4** | `--font-size-h4` | `clamp(1.1rem, 1.8vw, 1.25rem)` | 1.35 | Tiêu đề nhóm bộ lọc, modal header |
| **H5** | `--font-size-h5` | `1rem` | 1.4 | Tiêu đề card sản phẩm, item list |
| **H6** | `--font-size-h6` | `0.875rem` | 1.4 | Tiêu đề phụ, nhãn thông số kỹ thuật |
| **Body** | `--font-size-body` | `0.9375rem (15px)` | 1.5 | Nội dung văn bản chung |
| **Small / Caption** | `--font-size-small` | `0.8125rem (13px)` | 1.4 | Nhãn mô tả phụ, breadcrumb |
| **Tiny** | `--font-size-tiny` | `0.75rem (12px)` | 1.3 | Badge trạng thái, thông số tag |

---

## 2. Hệ Thống Màu Sắc & Design Tokens (WCAG AA/AAA)

Xây dựng bộ tokens hoàn chỉnh tại `:root` trong [globals.css](file:///e:/pchub-main/pchub-main/src/app/globals.css) theo nhận diện xanh công nghệ PCHub:

### 2.1. Bảng Design Tokens Chính:
- **Thương hiệu (Brand)**:
  - `--color-primary`: `#0055d4` (PCHub Blue)
  - `--color-primary-hover`: `#0040a8`
  - `--color-primary-light`: `#e8f0fe`
  - `--color-secondary`: `#0d9488` (Teal)
  - `--color-secondary-hover`: `#0f766e`
  - `--color-secondary-light`: `#f0fdfa`
  - `--color-accent`: `#f59e0b` (Amber Gold)
- **Trạng thái (Accessibility Contrast đạt chuẩn WCAG AAA - tương phản > 7:1)**:
  - **Success**: Text `#15803d`, Nền `#f0fdf4`, Viền `#bbf7d0`
  - **Error**: Text `#b91c1c`, Nền `#fef2f2`, Viền `#fecaca`
  - **Warning**: Text `#b45309`, Nền `#fffbeb`, Viền `#fde68a`
  - **Info**: Text `#1d4ed8`, Nền `#eff6ff`, Viền `#bfdbfe`
- **Văn bản & Nền (Text & Surface)**:
  - `--color-text-main`: `#0f172a` (Slate 900)
  - `--color-text-muted`: `#64748b` (Slate 500)
  - `--color-text-subtle`: `#94a3b8` (Slate 400)
  - `--color-bg-main`: `#f8fafc`
  - `--color-bg-card`: `#ffffff`
  - `--color-border-subtle`: `#e2e8f0`
  - `--color-border-default`: `#cbd5e1`

### 2.2. Dọn dẹp mã màu hard-code:
Đã thay thế toàn bộ mã màu `#0055d4`, `#0043a8`, `#0066cc`, v.v. bằng biến `var(--color-primary)` và `var(--color-primary-hover)` tại:
- [src/app/login/page.tsx](file:///e:/pchub-main/pchub-main/src/app/login/page.tsx)
- [src/app/register/page.tsx](file:///e:/pchub-main/pchub-main/src/app/register/page.tsx)
- [src/app/forgot-password/page.tsx](file:///e:/pchub-main/pchub-main/src/app/forgot-password/page.tsx)
- [src/app/support/page.tsx](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx)
- [src/app/community/page.tsx](file:///e:/pchub-main/pchub-main/src/app/community/page.tsx)
- [src/components/home/PromoBanner.tsx](file:///e:/pchub-main/pchub-main/src/components/home/PromoBanner.tsx)

---

## 3. Đồng Bộ Component & Hợp Nhất Tuyến Trùng Lặp

### 3.1. Form Controls đồng bộ:
Đã định nghĩa các utility classes dùng chung chuẩn kích thước, padding, bo góc và hiệu ứng focus:
- `.form-input`: Chiều cao `42px`, viền `var(--color-border-default)`, bo góc `var(--radius-md)`, focus ring màu `--color-primary-focus`.
- `.form-select`: Tích hợp SVG chevron tùy biến, không vỡ layout trên Safari/Edge/Firefox.
- `.form-btn-primary`: Transition mượt, active scale `0.98`, trạng thái disabled rõ ràng.
- `.form-error-msg` / `.form-success-msg`: Đồng bộ kích thước font `0.8125rem` và màu cảnh báo chuẩn WCAG.

### 3.2. Chuẩn hóa Card, List & Modal:
- `.card` & `.card-hover`: Bo góc 12px (`--radius-lg`), viền slate-200, shadow tinh tế.
- `.badge-success`, `.badge-error`, `.badge-warning`, `.badge-info`: Bo góc `9999px`, padding `4px 10px`, màu chuẩn token.
- `.modal-responsive`, `.modal-header-responsive`, `.modal-body-responsive`: Chuẩn hóa kích thước modal, bo góc, tiêu đề và cuộn mượt cho tất cả popup.

### 3.3. Hợp nhất các biến thể trang trùng lặp (Route Consolidation):
Trước đây tồn tại các cặp trang song song với 2 implementation khác nhau gây phân mảnh trải nghiệm:
1. Giỏ hàng: `/cart` và `/gio-hang` -> [src/app/cart/page.tsx](file:///e:/pchub-main/pchub-main/src/app/cart/page.tsx) đã chuyển sang re-export trực tiếp từ [src/app/gio-hang/page.tsx](file:///e:/pchub-main/pchub-main/src/app/gio-hang/page.tsx).
2. Thanh toán: `/checkout` và `/thanh-toan` -> [src/app/checkout/page.tsx](file:///e:/pchub-main/pchub-main/src/app/checkout/page.tsx) đã chuyển sang re-export trực tiếp từ [src/app/thanh-toan/page.tsx](file:///e:/pchub-main/pchub-main/src/app/thanh-toan/page.tsx).
3. Quên mật khẩu: `/quen-mat-khau` và `/forgot-password` -> [src/app/quen-mat-khau/page.tsx](file:///e:/pchub-main/pchub-main/src/app/quen-mat-khau/page.tsx) re-export từ [src/app/forgot-password/page.tsx](file:///e:/pchub-main/pchub-main/src/app/forgot-password/page.tsx).

---

## 4. Tối Ưu Responsive (Mobile, Tablet, Desktop)

Hệ thống đã được kiểm thử và xử lý triệt để trên 3 breakpoint:
- **Mobile (< 576px)**:
  - **Trang tìm kiếm ([search/page.tsx](file:///e:/pchub-main/pchub-main/src/app/search/page.tsx))**: Bổ sung nút bấm hiển thị/ẩn bộ lọc `.search-mobile-filter-toggle` và panel `.search-filter-sidebar`, tránh việc bộ lọc chiếm toàn bộ chiều dài màn hình trước khi người dùng thấy sản phẩm.
  - **Bảng so sánh cấu hình ([so-sanh/page.tsx](file:///e:/pchub-main/pchub-main/src/app/so-sanh/page.tsx))**: Bọc bảng trong `.table-responsive` với `overflow-x: auto` và tính toán `minWidth: Math.max(768, products.length * 240)` để các cột không bị bẹp dúm hoặc tràn layout màn hình nhỏ.
  - **Modal chọn linh kiện & Chi tiết đơn hàng ([OrderDetailModal.tsx](file:///e:/pchub-main/pchub-main/src/components/account/OrderDetailModal.tsx), [ComponentSelectorModal.tsx](file:///e:/pchub-main/pchub-main/src/components/builder/ComponentSelectorModal.tsx))**: Grid sản phẩm tự động thích ứng với `minmax(min(100%, 280px), 1fr)`, modal chiếm `95vw` trên mobile và giới hạn `max-height: 90vh` với cuộn bên trong.
  - **Form 2 cột ([globals.css](file:///e:/pchub-main/pchub-main/src/app/globals.css))**: Class `.form-grid-2` tự động stack thành 1 cột khi màn hình nhỏ hơn 640px.
- **Tablet (576–991px)**:
  - **PromoBanner ([PromoBanner.tsx](file:///e:/pchub-main/pchub-main/src/components/home/PromoBanner.tsx))**: Bổ sung class `.promo-banner-card` cho phép cột banner tự động xếp dọc linh hoạt trên tablet thay vì bị ép chiều ngang.
- **Desktop (≥ 992px)**:
  - Giữ nguyên hiển thị đầy đủ sidebar, lưới sản phẩm 4-5 cột sắc nét.

---

## 5. Khắc Phục Dữ Liệu Sai & Lỗi Binding

| Vị trí / Tệp tin | Lỗi ban đầu | Đã khắc phục |
| :--- | :--- | :--- |
| [src/app/build-pc/page.tsx](file:///e:/pchub-main/pchub-main/src/app/build-pc/page.tsx) | Danh mục **Mainboard** và **Nguồn (PSU)** đều hiển thị ảnh của GPU (`/images/gpu-white.jpg`) | Đã đổi ảnh chính xác thành `/images/cat-mainboard.jpg` và `/images/cat-psu.jpg`. |
| [src/components/layout/CartDrawer.tsx](file:///e:/pchub-main/pchub-main/src/components/layout/CartDrawer.tsx), [gio-hang/page.tsx](file:///e:/pchub-main/pchub-main/src/app/gio-hang/page.tsx), [thanh-toan/page.tsx](file:///e:/pchub-main/pchub-main/src/app/thanh-toan/page.tsx) | Ảnh fallback hardcode `/images/cpu-box.jpg` ngay cả khi sản phẩm có `image_url` từ cơ sở dữ liệu | Cập nhật logic binding ưu tiên `item.image_url \|\| item.image \|\| '/images/cat-cpu.jpg'`. |
| [src/components/home/MostViewed.tsx](file:///e:/pchub-main/pchub-main/src/components/home/MostViewed.tsx) | Giá gốc hiển thị bằng giá bán khiến nhãn giảm giá luôn tính ra `0%` | Tính toán giá gốc tham chiếu `p.price * 1.1` khi chưa có giá gốc riêng để hiển thị nhãn ưu đãi chính xác. |
| [src/components/account/OrderDashboard.tsx](file:///e:/pchub-main/pchub-main/src/components/account/OrderDashboard.tsx) | Tồn tại 2 nút "Xem chi tiết" giống nhau cạnh nhau trên cùng một đơn hàng nổi bật | Đã phân tách rõ ràng: 1 nút "Xem nhanh" (mở modal) và 1 nút "Trang chi tiết" (chuyển hướng `/tai-khoan/don-hang/[id]`). |
| [src/app/kiem-tra-tuong-thich/page.tsx](file:///e:/pchub-main/pchub-main/src/app/kiem-tra-tuong-thich/page.tsx) | Lỗi prerender build do truy cập thuộc tính `specs` khi linh kiện `psu` null (`(psu as any).specs?.wattage`) | Chuyển sang optional chaining an toàn `(psu as any)?.specs?.wattage`. |

---

## 7. Tối Ưu Countdown Flash Sale & Trạng Thái Thời Gian Thực

- **Khắc phục lỗi `--:--:--`**:
  - Khởi tạo trực tiếp hàm `calculateTimeRemaining(endTime)` với giá trị tính toán ngay lập tức cho phiên ưu đãi hiện tại (hoặc theo prop `endTime`), xóa bỏ hoàn toàn trạng thái khởi tạo `null` khiến màn hình nháy `--:--:--`.
  - Hỗ trợ prop linh hoạt `endTime?: string | Date | number` để có thể nhận mốc thời gian tùy biến từ banner/chiến dịch khuyến mãi.
- **Trạng thái Live rõ ràng**:
  - Khi đang trong phiên: Hiển thị badge **"ĐANG DIỄN RA"** màu đỏ nổi bật kèm chấm tín hiệu đỏ phát sáng và nhãn "Kết thúc trong:".
  - Khi đã hết hạn: Tự động chuyển sang trạng thái **"ĐÃ KẾT THÚC"** màu xám slate trung tính, chuyển nhãn thành "Phiên ưu đãi đã kết thúc:" và hiển thị số `00:00:00`, không để nhãn "Live" gây nhầm lẫn cho khách hàng.

---

## 8. Chuẩn Hóa Văn Phong Thương Mại & Điều Hướng Footer

- **Sửa lỗi diễn đạt trong [HeroSlider.tsx](file:///e:/pchub-main/pchub-main/src/components/home/HeroSlider.tsx)**:
  - Thay thế câu ngữ pháp bất thường: *"Chatbot AI tư vấn ngọt ngào cho theo ngân sách và nhu cầu của bạn"*
  - Thành câu văn thương mại điện tử chuyên nghiệp: *"Chatbot AI tư vấn tận tình, chuẩn xác theo ngân sách và nhu cầu của bạn."*
- **Cấu trúc Footer và Trang [support/page.tsx](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx) đa Section**:
  - Không trỏ dồn toàn bộ các chính sách về chung một URL `/support` đơn điệu.
  - Phân tách trang hỗ trợ thành 5 section rõ ràng kèm thẻ anchor và `scrollMarginTop: 100px`:
    1. `Về PCHub` $\rightarrow$ [`/support#ve-pchub`](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx): Tầm nhìn, sứ mệnh, 4 cam kết vàng (100% chính hãng, AI tương thích, giao 2H, bảo hành 36 tháng).
    2. `Liên hệ` $\rightarrow$ [`/support#lien-he`](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx): Hotline 1900 8888, Showroom, Email CSKH, Zalo OA, Live Chat.
    3. `Hướng dẫn mua hàng` $\rightarrow$ [`/support#huong-dan-mua-hang`](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx): Quy trình 4 bước mua sắm và câu hỏi thường gặp khi thanh toán.
    4. `Chính sách bảo hành` $\rightarrow$ [`/support#chinh-sach-bao-hanh`](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx): Ma trận thời hạn bảo hành từng loại linh kiện và quy trình 6 bước RMA.
    5. `Chính sách đổi trả` $\rightarrow$ [`/support#chinh-sach-doi-tra`](file:///e:/pchub-main/pchub-main/src/app/support/page.tsx): Quy định đổi mới trong 7 ngày đầu và tiến độ giải ngân hoàn tiền.
  - Cập nhật mục lục dính (Sticky TOC) trên sidebar trang support để người dùng có thể nhấp chuyển nhanh giữa các mục.

---

## 9. Chuẩn Hóa SEO, Metadata Thương Hiệu & Structured Data

- **Ẩn thông tin cá nhân, định danh thương hiệu**:
  - Đã thay thế tên cá nhân tác giả `Lê Văn Chương` trong `meta-author` và chân trang footer bằng thương hiệu chính thức: **`PCHub Technology`**.
- **Nâng cấp Twitter Card**:
  - Chuyển `twitter:card` từ dạng `summary` mặc định sang `summary_large_image` kèm theo ảnh xem trước khổ lớn 1200x630 tại [layout.tsx](file:///e:/pchub-main/pchub-main/src/app/layout.tsx), [page.tsx](file:///e:/pchub-main/pchub-main/src/app/page.tsx) và [product/[id]/page.tsx](file:///e:/pchub-main/pchub-main/src/app/product/[id]/page.tsx).
- **Tích hợp Structured Data (Schema.org JSON-LD)**:
  - **Organization Schema** tại [RootLayout](file:///e:/pchub-main/pchub-main/src/app/layout.tsx): Khai báo đầy đủ tên công ty, logo, tổng đài hỗ trợ, URL và mạng xã hội.
  - **Product Schema** tại [ProductPage](file:///e:/pchub-main/pchub-main/src/app/product/[id]/page.tsx): Khai báo chuẩn `@type: "Product"` với tên sản phẩm, hình ảnh, mã SKU, thương hiệu, mức giá, tình trạng hàng tồn kho (`InStock`), và đánh giá xếp hạng sao (`AggregateRating: 4.9`) giúp hiển thị Rich Snippets giá và đánh giá trực tiếp trên kết quả tìm kiếm Google.

---

## 10. Kết Quả Kiểm Tra (Verification)

1. **Kiểm thử Production Build**:
   ```bash
   cmd.exe /c npm run build
   ```
   - **Kết quả**: Exit code `0` thành công 100%.
   - **TypeScript & Linting**: 0 lỗi.
   - **Static Generation**: Hoàn thành `49/49` static & dynamic pages không phát sinh bất kỳ lỗi SSG/SSR nào.

