-- ============================================================================
-- 004_add_is_test_to_orders.sql: Thêm cờ is_test phục vụ lọc đơn hàng thử nghiệm
-- ============================================================================

-- 1. Bổ sung cột is_test cho bảng orders (mặc định là false)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- 2. Đánh index tối ưu bộ lọc ẩn/hiện đơn hàng test
CREATE INDEX IF NOT EXISTS idx_orders_is_test ON public.orders(is_test);

-- 3. Gợi ý cập nhật cờ is_test cho các đơn hàng mẫu có sẵn (nếu cần)
-- UPDATE public.orders 
-- SET is_test = true 
-- WHERE code LIKE '%TEST%' OR customer_name ILIKE '%test%' OR email ILIKE '%test%';
