# PCHub — Báo cáo tổng hợp: Audit, Lỗi kỹ thuật, CSS & Prompt sửa lỗi

**Site:** https://pchub-iota.vercel.app/
**Ngày tổng hợp:** 27/09/2026
**Đã xem trực tiếp:** `/` (trang chủ), `/build-pc`, `/search`, `/community`
**Chưa xem được:** `/product/...`, `/support`, `/login`, `/tai-khoan/yeu-thich`, giỏ hàng, thanh toán — cần gửi thêm link hoặc ảnh chụp để audit tiếp.

---

## MỤC LỤC

1. Tóm tắt ưu tiên (làm trước)
2. Vấn đề kỹ thuật đã báo (dark/light, sticky header) + CSS sửa
3. Phát hiện theo từng trang
4. Lỗi/mâu thuẫn nội dung & từ ngữ
5. Checklist UX/UI theo thiết bị
6. Các trang chưa kiểm tra được
7. Prompt tổng hợp để giao cho AI code / dev
8. Bước tiếp theo

---

## 1. Tóm tắt ưu tiên (làm trước)

| # | Vấn đề | Mức độ | Trang |
|---|---|---|---|
| 1 | `/search` chạy một phiên bản code khác với phần còn lại của site (header, tên gọi, footer đều lệch) | **Nghiêm trọng** | `/search` |
| 2 | Trang `/search` không có ô tìm kiếm, không có sản phẩm, kẹt ở "Đang tải..." | **Nghiêm trọng** | `/search` |
| 3 | Lộ tên cá nhân "Lê Văn Chương" trong meta author + footer thay vì tên thương hiệu | Cao | `/search` |
| 4 | Dark mode: mở lên dark, cuộn xuống lại light (không nhất quán) | Cao | Toàn site |
| 5 | Header mất sticky khi cuộn | Cao | Toàn site |
| 6 | Banner "Giảm trên 60%" nhưng sản phẩm chỉ giảm 11–19% | Cao | Trang chủ |
| 7 | Nút "Xem chi tiết" ở `/community` dẫn về `/build-pc` trống, không giữ cấu hình của bài đăng | Cao | `/community` |
| 8 | Không có ô tìm kiếm ở header trên toàn site | Cao | Toàn site |
| 9 | Danh mục "Gaming Gear", "Laptops" ở `/search` (bản cũ) không khớp 6 danh mục chính thức | Trung bình | `/search` |
| 10 | Route yêu thích không nhất quán: `/tai-khoan/yeu-thich` vs `/search?wishlist=true` | Trung bình | Toàn site |
| 11 | Ảnh sản phẩm dùng chung 1 ảnh/danh mục, không phải ảnh thật | Trung bình | Trang chủ |
| 12 | Card sản phẩm 2 nút to trên mobile, dễ vỡ layout | Trung bình | Trang chủ, danh mục |
| 13 | "Đang tải sản phẩm từ catalog..." — lộ ngôn ngữ kỹ thuật, không có skeleton | Trung bình | Trang chủ |
| 14 | Icon dùng emoji (⚡🔥🖥️👥✨) thay vì SVG | Thấp | Toàn site |
| 15 | Footer rất dài, không gập trên mobile | Thấp | Toàn site |

---

## 2. Vấn đề kỹ thuật đã báo + CSS sửa

### 2.1 Dark mode không nhất quán
**Triệu chứng:** mở trang lên nền tối, cuộn xuống các section chuyển sang nền sáng.

**Nguyên nhân khả nghi:**
- Nhiều section/card/footer dùng màu hardcode (`#fff`, `#f9fafb`, `#f5f6f8`...) thay vì biến theo theme.
- `body`/`html` không có `background` theo theme, không khai báo `color-scheme`.
- Có thể tồn tại 2 cơ chế dark mode chạy song song (`prefers-color-scheme` và `class`/`data-theme`) không đồng bộ với nhau.

### 2.2 Mất sticky header
**Triệu chứng:** header không dính khi cuộn trang.

**Nguyên nhân khả nghi:**
- Phần tử cha của header có `overflow: hidden/auto/scroll`, làm `position: sticky` mất tác dụng.
- Header bị bọc trong khối chỉ cao bằng chính nó thay vì ngang cấp với `<main>`.

### 2.3 CSS sửa (paste-ready)

Dán vào cuối file CSS toàn cục. Đổi `[data-theme="dark"]` thành đúng cơ chế dark mode thật của site nếu khác.

```css
/* ===== Theme tokens: một nguồn màu duy nhất ===== */
:root {
  color-scheme: light;
  --pc-bg: #f5f6f8;
  --pc-surface: #ffffff;
  --pc-surface-2: #f9fafb;
  --pc-text: #111827;
  --pc-muted: #6b7280;
  --pc-border: #e5e7eb;
  --pc-primary: #2563eb;
  --pc-danger: #e11d48;
}

/* Theo hệ thống, trừ khi người dùng ép light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --pc-bg: #0b0f17;
    --pc-surface: #131a26;
    --pc-surface-2: #1a2333;
    --pc-text: #e5e7eb;
    --pc-muted: #9ca3af;
    --pc-border: #263042;
  }
}

/* Người dùng chọn dark thủ công */
:root[data-theme="dark"] {
  color-scheme: dark;
  --pc-bg: #0b0f17;
  --pc-surface: #131a26;
  --pc-surface-2: #1a2333;
  --pc-text: #e5e7eb;
  --pc-muted: #9ca3af;
  --pc-border: #263042;
}

/* Nền và chữ áp cho cả html lẫn body để không lộ nền trắng */
html { background: var(--pc-bg); color: var(--pc-text); }
body {
  background: var(--pc-bg);
  color: var(--pc-text);
  overflow-x: clip; /* thay cho hidden: không phá sticky */
}

/* Mọi section, card, footer dùng token thay vì màu cứng */
main, section, .product-section, .flash-sale, .hero,
.site-footer, .bottom-nav, .product-sticky-cta {
  background-color: var(--pc-bg);
  color: var(--pc-text);
}
.product-card, .category-list a, .site-header {
  background: var(--pc-surface);
  color: var(--pc-text);
  border-color: var(--pc-border);
}
.product-card .thumb { background: var(--pc-surface-2); }
.product-card .specs, .product-card .price-old { color: var(--pc-muted); }
.site-header .search-box input {
  background: var(--pc-surface-2);
  color: var(--pc-text);
  border: 1px solid var(--pc-border);
}
.bottom-nav { background: var(--pc-surface); border-top: 1px solid var(--pc-border); }

/* ===== Sticky header ===== */
/* 1) Gỡ overflow ở mọi wrapper cha (đổi tên class cho khớp layout thật) */
html, body, #__next, #root, .app, .layout, .page-wrapper, .site-wrapper {
  overflow: visible;
}
body { overflow-x: clip; }

/* 2) Header dính */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0px);
  backdrop-filter: saturate(1.4) blur(8px);
}

/* 3) Chặn tràn ngang gây mất sticky/cuộn ngang */
img, video, canvas, svg { max-width: 100%; }
```

**Cách kiểm tra sticky nhanh:** Mở DevTools, chọn `.site-header`, đi lên từng phần tử cha. Phần tử nào có `overflow` khác `visible` là thủ phạm — đổi sang `visible` hoặc `clip`. Nếu vẫn mất, kiểm tra header có bị bọc trong `<div>` chỉ cao bằng chính nó không, và `z-index` có thấp hơn hero/banner không.

### 2.4 CSS tối ưu mobile (paste-ready, từ đợt audit UI trước)

```css
/* ===== PCHub – Mobile optimization ===== */
:root {
  --pc-radius: 12px;
  --tab-h: 56px;
}

html { -webkit-text-size-adjust: 100%; }
body { padding-bottom: calc(var(--tab-h) + env(safe-area-inset-bottom, 0px)); }
img { max-width: 100%; height: auto; display: block; }

@media (max-width: 768px) {
  .container { padding-inline: 12px; }

  /* Header: logo + search + cart */
  .site-header {
    padding: 8px 12px; padding-top: calc(8px + env(safe-area-inset-top, 0px));
    display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center;
  }
  .site-header .main-nav, .site-header .nav-links { display: none; }
  .site-header .search-box input {
    width: 100%; height: 40px; border-radius: 999px;
    border: 1px solid var(--pc-border); padding: 0 14px; font-size: 16px;
  }

  /* Hero */
  .hero { display: flex; flex-direction: column-reverse; gap: 12px; padding: 16px 12px; text-align: center; }
  .hero h1 { font-size: clamp(1.5rem, 6.5vw, 2rem); line-height: 1.2; }
  .hero .btn-group { display: grid; gap: 8px; }
  .hero .btn-group .btn { min-height: 46px; width: 100%; }

  /* Danh mục: vuốt ngang */
  .category-list {
    display: flex; gap: 8px; overflow-x: auto; padding: 4px 12px;
    scroll-snap-type: x proximity; scrollbar-width: none;
  }
  .category-list::-webkit-scrollbar { display: none; }
  .category-list a {
    flex: 0 0 auto; scroll-snap-align: start; min-height: 40px;
    padding: 0 14px; border-radius: 999px;
    display: inline-flex; align-items: center; font-size: .875rem; white-space: nowrap;
  }

  /* Section sản phẩm: carousel ngang */
  .product-section .product-grid {
    display: flex; gap: 10px; overflow-x: auto;
    scroll-snap-type: x mandatory; padding: 4px 12px 12px; margin-inline: -12px;
    scrollbar-width: none;
  }
  .product-section .product-grid::-webkit-scrollbar { display: none; }
  .product-section .product-card { flex: 0 0 68%; max-width: 260px; scroll-snap-align: start; }

  /* Trang danh mục/tìm kiếm: lưới 2 cột */
  .product-grid.is-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; overflow: visible; margin: 0; padding: 0; }
  .product-grid.is-grid .product-card { flex: none; max-width: none; }

  /* Card */
  .product-card { border-radius: var(--pc-radius); padding: 10px; display: flex; flex-direction: column; gap: 6px; position: relative; }
  .product-card .thumb { aspect-ratio: 1 / 1; object-fit: contain; border-radius: 8px; }
  .product-card .badge-sale {
    position: absolute; top: 8px; left: 8px; background: var(--pc-danger);
    color: #fff; font-size: .7rem; font-weight: 700; padding: 2px 6px; border-radius: 6px;
  }
  .product-card h3 {
    font-size: .85rem; line-height: 1.35; font-weight: 600;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    min-height: 2.7em;
  }
  .product-card .specs {
    font-size: .72rem; line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .product-card .price-new { color: var(--pc-danger); font-weight: 800; font-size: 1rem; }
  .product-card .price-old { font-size: .75rem; text-decoration: line-through; }

  /* 1 nút chính + icon giỏ hàng */
  .product-card .actions { display: grid; grid-template-columns: 1fr 44px; gap: 6px; margin-top: auto; }
  .product-card .btn-buy { min-height: 40px; border-radius: 8px; font-weight: 700; font-size: .85rem; }
  .product-card .btn-cart { min-height: 40px; width: 44px; padding: 0; border-radius: 8px; font-size: 0; }
  .product-card .btn-cart svg { width: 20px; height: 20px; font-size: initial; }

  /* Flash sale */
  .flash-sale { border-radius: var(--pc-radius); padding: 12px; }
  .flash-sale .countdown { font-variant-numeric: tabular-nums; font-weight: 800; }

  /* Skeleton cho "Đang tải sản phẩm..." */
  .skeleton {
    background: linear-gradient(90deg, #eceff3 25%, #f6f7f9 37%, #eceff3 63%);
    background-size: 400% 100%; animation: sk 1.2s ease infinite; border-radius: 8px;
  }
  @keyframes sk { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }

  /* Footer accordion (dùng <details>) */
  .site-footer details { border-bottom: 1px solid rgba(255,255,255,.12); }
  .site-footer summary { padding: 14px 0; font-weight: 600; cursor: pointer; list-style: none; }
  .site-footer details ul { padding: 0 0 12px; }
  .site-footer details a { display: block; padding: 8px 0; }

  /* Bottom tab bar */
  .bottom-nav {
    position: fixed; inset: auto 0 0 0; z-index: 60; height: calc(var(--tab-h) + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-top: 1px solid var(--pc-border);
    display: grid; grid-template-columns: repeat(5, 1fr);
  }
  .bottom-nav a {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; font-size: .68rem; min-height: 44px;
  }
  .bottom-nav a.active { color: var(--pc-primary); }
  .bottom-nav a svg { width: 22px; height: 22px; }
  .bottom-nav .build-pc span {
    background: var(--pc-primary); border-radius: 50%; width: 46px; height: 46px;
    display: grid; place-items: center; margin-top: -18px; box-shadow: 0 4px 12px rgba(37,99,235,.4);
    color: #fff;
  }

  /* Nút chat AI né tab bar */
  .ai-fab { right: 12px; bottom: calc(var(--tab-h) + 12px + env(safe-area-inset-bottom, 0px)); }

  /* Thanh mua hàng dính ở trang sản phẩm */
  .product-sticky-cta {
    position: fixed; left: 0; right: 0; bottom: calc(var(--tab-h) + env(safe-area-inset-bottom, 0px));
    padding: 8px 12px; display: flex; gap: 8px; align-items: center;
    box-shadow: 0 -2px 10px rgba(0,0,0,.08); z-index: 55;
  }

  /* Vùng chạm tối thiểu */
  button, .btn, a.btn { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
```

---

## 3. Phát hiện theo từng trang

### 3.1 Trang chủ (`/`)
- Banner "GIẢM TRÊN 60%" nhưng sản phẩm thực tế giảm 11–19%.
- 2 CTA hero "Xây dựng PC ngay" / "Xây dựng PC AI" cùng trỏ `/build-pc`, không phân biệt.
- Giờ hoạt động ban đầu mâu thuẫn: hotline "8:00–22:00" vs cửa hàng "8:00–20:00" (không có nhãn phân biệt rõ — **đã cải thiện ở bản build-pc/community mới**, xem mục 3.1b).
- "Đang tải sản phẩm từ catalog..." — lộ thuật ngữ kỹ thuật, không có skeleton.
- Ảnh sản phẩm dùng chung 1 ảnh cho cả danh mục (`cpu-box.jpg`, `cat-mainboard.jpg`, `ram-rgb.jpg`).
- Card sản phẩm 2 nút to ("Thêm vào giỏ hàng" + "Mua ngay") — dễ vỡ layout trên mobile.
- Icon dùng emoji (⚡🔥🖥️👥).
- Footer dài, không gập trên mobile.
- Tên gọi cũ: "PC Builder", "AI Advisor" — không khớp với bản `/build-pc`, `/community` mới hơn.

### 3.1b Cải thiện đã thấy ở `/build-pc` và `/community` (so với trang chủ)
- Tên gọi thống nhất: **"Build PC"**, **"Tư vấn AI"**.
- Giờ hoạt động có nhãn rõ: "8:00–22:00 hàng ngày" (hotline) và "8:00–20:00 (Thứ 2 – Chủ nhật)" (cửa hàng).
- Copyright đổi thành "Bản quyền thuộc về PCHub" thay vì "All Rights Reserved".
- Link địa chỉ cửa hàng trỏ đúng `/support` thay vì `#`.

→ Cho thấy site có nhiều bản/nhánh không đồng bộ — cần rà soát lại toàn bộ deploy.

### 3.2 `/build-pc`
**Điểm tốt:**
- 8 nhóm linh kiện bắt buộc + 3 nhóm phụ kiện tùy chọn, đầy đủ.
- Khối "AI Phân Tích Tương Thích – Powered by Google Gemini" minh bạch công nghệ.
- Có "Xuất file cấu hình (PDF/Excel)" — điểm mạnh hiếm thấy, nên làm nổi bật hơn.

**Vấn đề:**
- 11 ô linh kiện hiện giống hệt nhau ("Vui lòng chọn linh kiện" + nút "Chọn linh kiện"), không icon/ảnh phân biệt, không giá tham khảo trước khi chọn.
- Thứ tự nút: "Thanh Toán Ngay Dàn PC" đặt trước "Thêm tất cả vào giỏ hàng" — nên đảo lại hoặc phân cấp rõ nút chính/phụ.
- "AI gợi ý: Khuyên Dùng Hàng Đầu" chỉ thấy ở ô CPU — cần xác nhận có ở mọi ô không.
- "Tải cấu hình (0)" khi chưa đăng nhập dễ gây hiểu lầm là lỗi.
- Chưa xem được trạng thái sau khi chọn linh kiện thật (ảnh, giá, cảnh báo xung đột) — cần ảnh chụp màn hình.

### 3.3 `/search` — VẤN ĐỀ NGHIÊM TRỌNG NHẤT
Trang này chạy **bản code/deploy khác** so với `/build-pc` và `/community`:

| So sánh | `/build-pc`, `/community` (bản mới) | `/search` (bản cũ) |
|---|---|---|
| Header nav | "Build PC", "Danh mục sản phẩm", "Cộng đồng", "Khuyến mãi" (VI) | "Components", "Gaming Gear", "Laptops", "Deals" (EN) |
| Tính năng AI | "Tư vấn AI" | "AI Advisor" |
| Wishlist | `/tai-khoan/yeu-thich` | `/search?wishlist=true` |
| Copyright | "© 2026 PCHub. Bản quyền thuộc về PCHub..." | "All Rights Reserved. Tác giả: Lê Văn Chương" |
| Meta author | PCHub Technology | Lê Văn Chương (tên cá nhân — rò rỉ thông tin không nên công khai) |
| Địa chỉ cửa hàng (footer) | Link `/support` | Link `#` (chết) |

**Vấn đề riêng:**
- Không có ô tìm kiếm dù đây chính là trang tìm kiếm.
- Không hiện sản phẩm, bộ lọc, sắp xếp, phân trang — chỉ có chữ "Đang tải..." và khung site chung.
- Danh mục "Gaming Gear", "Laptops" không khớp 6 danh mục chính thức (CPU/GPU/RAM/SSD/Mainboard/PSU).

**Đề xuất:** Kiểm tra deployment log/branch của route `/search` trước tiên — nhiều khả năng là lỗi deploy sai nhánh hoặc cache CDN cũ, không phải lỗi CSS/nội dung thông thường.

### 3.4 `/community`
**Điểm tốt:**
- 3 build showcase với đủ thông tin: tên, tác giả, linh kiện chính, nhận xét hiệu năng, giá.
- Badge phân loại "Gaming"/"Workstation"/"Budget" và "AI Pick".
- Nút "Chia sẻ build" khuyến khích đóng góp cộng đồng.

**Vấn đề:**
- Footer gọi là "Blog & Hướng dẫn" nhưng nội dung thực là build showcase — các bài viết blog ở trang chủ không xuất hiện ở đây.
- Tab "ALL" tiếng Anh giữa các tab tiếng Việt khác.
- Nút "Xem chi tiết" của cả 3 build đều trỏ về `/build-pc` trống — mất dữ liệu build cụ thể, gây trải nghiệm xấu (bấm xem build 86 triệu ra trang trắng).
- Avatar tác giả chỉ 1 chữ cái, không ảnh thật.

---

## 4. Lỗi/mâu thuẫn nội dung & từ ngữ

| Nội dung hiện tại | Vấn đề | Đề xuất |
|---|---|---|
| "GIẢM TRÊN 60%" | Sản phẩm giảm thật 11–19% | Sửa số đúng thực tế |
| 2 CTA hero cùng trỏ `/build-pc` | Không phân biệt | Tách luồng hoặc gộp 1 CTA |
| "Đang tải sản phẩm từ catalog..." | Lộ thuật ngữ kỹ thuật | "Đang tải sản phẩm..." + skeleton |
| "PC Builder" (trang chủ cũ) vs "Build PC" (build-pc, community) | Không nhất quán | Dùng "Build PC" toàn site |
| "AI Advisor" (search cũ) vs "Tư vấn AI" (bản mới) | Không nhất quán | Dùng "Tư vấn AI" toàn site |
| "Sản phẩm cực HOT" / "Sản phẩm CPU - Bộ Vi Xử Lý" | Cách đặt tên section không đồng nhất | "CPU – Bộ vi xử lý", "Nổi bật" |
| Meta author "Lê Văn Chương" ở `/search` | Rò rỉ tên cá nhân ra public | Đổi thành "PCHub Technology" |
| "All Rights Reserved" (search) vs "Bản quyền thuộc về PCHub" (build-pc, community) | Footer không đồng bộ | Chọn 1 bản duy nhất, đồng bộ toàn site |

---

## 5. Checklist UX/UI theo thiết bị

### Mobile (360–430px)
- [ ] Header sticky, có ô tìm kiếm thật ở mọi trang (đặc biệt `/search`)
- [ ] Bottom tab bar: Trang chủ / Danh mục / Build PC / Tư vấn AI / Tài khoản
- [ ] Card sản phẩm 1 nút chính + icon giỏ hàng
- [ ] Section sản phẩm dạng carousel vuốt ngang
- [ ] Footer dạng accordion
- [ ] `/build-pc`: mỗi ô linh kiện có icon/ảnh riêng, thanh tổng tiền + tương thích dính đáy
- [ ] `/community`: nút "Xem chi tiết" mang theo dữ liệu build cụ thể

### Tablet (768px)
- [ ] Lưới sản phẩm 3 cột
- [ ] `/build-pc`: 2 cột danh sách linh kiện

### Laptop/Desktop (≥1280px)
- [ ] Lưới sản phẩm 4–5 cột
- [ ] Sidebar bộ lọc cố định ở `/search`
- [ ] `/build-pc`: bố cục 2 cột — linh kiện trái, tóm tắt + AI phân tích dính phải
- [ ] `/community`: lưới build showcase nhiều cột

### Chung mọi thiết bị
- [ ] Đồng bộ code/nội dung giữa các trang — ưu tiên số 1, đặc biệt `/search`
- [ ] Light/dark nhất quán toàn site, không lộ nền trắng khi cuộn
- [ ] Header sticky ổn định
- [ ] Không cuộn ngang toàn trang ở bất kỳ breakpoint
- [ ] Vùng chạm tối thiểu 44px
- [ ] Một tên gọi duy nhất mỗi tính năng: "Build PC", "Tư vấn AI", "Cộng đồng"
- [ ] Không lộ tên cá nhân trong metadata/footer công khai
- [ ] Route wishlist thống nhất: `/tai-khoan/yeu-thich`
- [ ] Ảnh sản phẩm thật, không dùng chung 1 ảnh/danh mục
- [ ] Icon SVG thay emoji
- [ ] `alt` ảnh mô tả đúng, `loading="lazy"` trừ ảnh đầu trang
- [ ] Mỗi trang 1 `<h1>`, phân cấp h2/h3 hợp lý

---

## 6. Các trang/luồng chưa kiểm tra được

- [ ] `/product/...` — Trang chi tiết sản phẩm
- [ ] Giỏ hàng — chưa thấy icon giỏ hàng rõ ràng ở bất kỳ header nào
- [ ] Thanh toán/đặt hàng
- [ ] `/support` — Về PCHub, Liên hệ, Chính sách bảo hành/đổi trả, Hướng dẫn mua hàng
- [ ] `/tai-khoan/yeu-thich` — Danh sách yêu thích
- [ ] `/login` — Đăng nhập/Đăng ký
- [ ] Trang 404
- [ ] Giao diện chatbot AI khi tương tác thật
- [ ] Trạng thái "đã chọn linh kiện" thật trong `/build-pc` (ảnh, giá, cảnh báo xung đột)
- [ ] Bài viết blog thật (nội dung đầy đủ, không chỉ excerpt)

**Gửi thêm:** link các trang trên, hoặc ảnh chụp màn hình nếu trang cần đăng nhập/JS nặng không fetch được.

---

## 7. Prompt tổng hợp — giao cho AI code / dev

```markdown
# Nhiệm vụ: Sửa lỗi kỹ thuật + đồng bộ nội dung + tối ưu UI/UX cho PCHub

## Bước 0 — Đọc trước khi sửa
1. Đọc cấu trúc project, framework, cách viết CSS, các component chính
   (Header, Hero, ProductCard, ProductSection, Footer, BottomNav nếu có,
   trang /build-pc, /search, /community).
2. Kiểm tra deployment/branch history của route /search — xác nhận vì sao
   trang này khác hẳn /build-pc và /community về header, tên gọi, footer,
   và có meta author là tên cá nhân "Lê Văn Chương" thay vì "PCHub Technology".
   Đây là ưu tiên số 1, cần xử lý TRƯỚC các phần UI khác.
3. Tóm tắt kế hoạch (file nào sẽ sửa) trước khi code.

## Nhóm A — Lỗi nghiêm trọng (làm trước)
1. Đồng bộ /search với bản mới nhất của site: header, nav, tên gọi tính năng
   ("Build PC", "Tư vấn AI"), footer, copyright, route wishlist
   (/tai-khoan/yeu-thich), link địa chỉ cửa hàng trỏ /support thay vì #.
2. Xóa tên cá nhân khỏi meta author và footer công khai, thay bằng "PCHub Technology".
3. Thêm ô tìm kiếm thật vào header (mọi trang, đặc biệt /search), có kết quả
   thật, bộ lọc, sắp xếp, phân trang thay vì kẹt ở "Đang tải...".
4. /community: nút "Xem chi tiết" của mỗi build phải dẫn tới trang chi tiết
   build đó (mang theo ID/params), không phải /build-pc trống.
5. Sửa banner "Giảm trên 60%" cho khớp mức giảm giá thật của sản phẩm (11–19%),
   hoặc chỉ hiển thị banner này khi có sản phẩm giảm đúng mức đó.

## Nhóm B — Dark mode không nhất quán
1. Thống nhất MỘT cơ chế dark mode (class/data-theme hoặc prefers-color-scheme),
   áp trên <html>.
2. Thay mọi màu hardcode (#fff, #f5f6f8, #f9fafb, bg-white, bg-gray-*...) ở
   section/card/footer/bottom-nav bằng token theo theme.
3. Đặt color-scheme trên :root theo theme, background + color cho cả html và body.
4. Đọc theme sớm (script inline hoặc next-themes) để tránh nháy sáng lúc hydrate.

## Nhóm C — Sticky header
1. position: sticky; top: 0; z-index: 100 cho header, padding-top theo safe-area.
2. Gỡ overflow: hidden/auto/scroll ở mọi phần tử cha của header (dùng
   overflow-x: clip trên body nếu chỉ cần chặn cuộn ngang).
3. Đảm bảo header ngang cấp với <main>, không bọc trong khối chỉ cao bằng
   chính nó.

## Nhóm D — Tối ưu mobile
1. Header: logo + tìm kiếm + giỏ hàng, ẩn menu ngang, chuyển xuống bottom tab bar
   (Trang chủ / Danh mục / Build PC / Tư vấn AI / Tài khoản).
2. ProductCard: 1 nút chính "Mua ngay" + icon giỏ hàng 44x44px, line-clamp
   tên/thông số, ảnh tỉ lệ vuông.
3. Section sản phẩm trang chủ: carousel vuốt ngang có scroll-snap.
4. Footer: accordion (<details>/<summary>) trên mobile.
5. "Đang tải sản phẩm từ catalog..." → skeleton loading.
6. /build-pc: mỗi ô linh kiện có icon/ảnh riêng biệt (không lặp UI giống hệt
   nhau 11 lần); thanh tổng tiền + trạng thái tương thích dính đáy trên mobile.
7. Icon emoji (⚡🔥🖥️👥✨) → SVG.
8. Vùng chạm tối thiểu 44px toàn site.

## Nhóm E — Đồng bộ từ ngữ toàn site
1. Chọn và áp dụng nhất quán: "Build PC" (không dùng "Xây dựng PC"/"PC Builder"
   lẫn lộn), "Tư vấn AI" (không dùng "AI Advisor"/"AI Consultation").
2. Đồng bộ giờ hoạt động, địa chỉ, chính sách bảo hành giữa mọi trang.
3. Gom chuỗi văn bản lặp vào một file hằng số/i18n thay vì hardcode rải rác.

## Ràng buộc
- Không đổi logic nghiệp vụ, API, route hiện có trừ khi được nêu ở Nhóm A.4.
- Không tự bịa số liệu/chính sách; nơi thiếu dữ liệu thật thì đánh dấu
  TODO(content) và liệt kê lại.
- Giữ nguyên giao diện desktop khi sửa phần mobile-only (Nhóm D), trừ khi
  lỗi đó cũng xảy ra ở desktop (Nhóm B, C).
- Test ở 360px, 390px, 768px, 1280px, cả light/dark, cả khi reload giữa trang.

## Bàn giao
Làm theo nhóm A → B → C → D → E. Sau mỗi nhóm liệt kê file đã sửa. Cuối cùng:
- Xác nhận build không lỗi.
- Báo cáo nguyên nhân gốc vì sao /search từng khác các trang khác.
- Danh sách TODO(content) cần tôi cung cấp dữ liệu thật.
```

---

## 8. Bước tiếp theo

1. Ưu tiên kiểm tra vì sao `/search` khác hẳn các trang còn lại (deployment/branch/cache).
2. Gửi thêm link hoặc ảnh chụp cho các trang ở mục 6 để hoàn thiện audit.
3. Xác nhận trên trình duyệt thật: dark/light và sticky header đã fix hay chưa.
4. Sau khi `/search` được đồng bộ và các trang còn lại đã xem được, làm audit chi tiết cho giỏ hàng, thanh toán, và trạng thái đã chọn linh kiện trong `/build-pc`.
