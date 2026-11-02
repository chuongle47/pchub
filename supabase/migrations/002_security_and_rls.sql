-- ============================================================================
-- 002_security_and_rls.sql: RLS, Role Functions, Storage & Atomic RPCs
-- ============================================================================

-- 1. AUTH SYNC TRIGGER: auth.users -> public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(VARIADIC roles user_role[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = ANY(roles)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'editor', 'support')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compat_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Idempotent with DROP POLICY IF EXISTS)

-- PROFILES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admin full control on profiles" ON public.profiles;
CREATE POLICY "Admin full control on profiles" ON public.profiles FOR ALL USING (public.has_role('admin'));

-- CATEGORIES
DROP POLICY IF EXISTS "Public view active categories" ON public.categories;
CREATE POLICY "Public view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.has_role('admin', 'manager'));

-- BRANDS
DROP POLICY IF EXISTS "Public view active brands" ON public.brands;
CREATE POLICY "Public view active brands" ON public.brands FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage brands" ON public.brands;
CREATE POLICY "Staff manage brands" ON public.brands FOR ALL USING (public.has_role('admin', 'manager'));

-- PRODUCTS
DROP POLICY IF EXISTS "Public view active products" ON public.products;
CREATE POLICY "Public view active products" ON public.products FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage products" ON public.products;
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (public.has_role('admin', 'manager'));

-- COMPAT RULES
DROP POLICY IF EXISTS "Public view active compat rules" ON public.compat_rules;
CREATE POLICY "Public view active compat rules" ON public.compat_rules FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage compat rules" ON public.compat_rules;
CREATE POLICY "Staff manage compat rules" ON public.compat_rules FOR ALL USING (public.has_role('admin', 'manager'));

-- FLASH SALES
DROP POLICY IF EXISTS "Public view active flash sales" ON public.flash_sales;
CREATE POLICY "Public view active flash sales" ON public.flash_sales FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage flash sales" ON public.flash_sales;
CREATE POLICY "Staff manage flash sales" ON public.flash_sales FOR ALL USING (public.has_role('admin', 'manager'));

DROP POLICY IF EXISTS "Public view flash sale items" ON public.flash_sale_items;
CREATE POLICY "Public view flash sale items" ON public.flash_sale_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage flash sale items" ON public.flash_sale_items;
CREATE POLICY "Staff manage flash sale items" ON public.flash_sale_items FOR ALL USING (public.has_role('admin', 'manager'));

-- COUPONS
DROP POLICY IF EXISTS "Public view active coupons" ON public.coupons;
CREATE POLICY "Public view active coupons" ON public.coupons FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage coupons" ON public.coupons;
CREATE POLICY "Staff manage coupons" ON public.coupons FOR ALL USING (public.has_role('admin', 'manager'));

-- ORDERS & ITEMS
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('admin', 'manager', 'support'));

DROP POLICY IF EXISTS "Staff manage orders" ON public.orders;
CREATE POLICY "Staff manage orders" ON public.orders FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.has_role('admin', 'manager', 'support'))));

DROP POLICY IF EXISTS "Staff manage order items" ON public.order_items;
CREATE POLICY "Staff manage order items" ON public.order_items FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

DROP POLICY IF EXISTS "Users view order history" ON public.order_status_history;
CREATE POLICY "Users view order history" ON public.order_status_history FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND (orders.user_id = auth.uid() OR public.has_role('admin', 'manager', 'support'))));

DROP POLICY IF EXISTS "Staff manage order status history" ON public.order_status_history;
CREATE POLICY "Staff manage order status history" ON public.order_status_history FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

-- SHIPPING ZONES & SETTINGS
DROP POLICY IF EXISTS "Public view active shipping zones" ON public.shipping_zones;
CREATE POLICY "Public view active shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true OR public.is_staff());

DROP POLICY IF EXISTS "Admin manage shipping zones" ON public.shipping_zones;
CREATE POLICY "Admin manage shipping zones" ON public.shipping_zones FOR ALL USING (public.has_role('admin', 'manager'));

DROP POLICY IF EXISTS "Public view settings" ON public.settings;
CREATE POLICY "Public view settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL USING (public.has_role('admin'));

-- QUOTES & ITEMS
DROP POLICY IF EXISTS "Public/owner view quotes" ON public.quotes;
CREATE POLICY "Public/owner view quotes" ON public.quotes FOR SELECT
    USING (public.has_role('admin', 'manager', 'support'));

DROP POLICY IF EXISTS "Staff manage quotes" ON public.quotes;
CREATE POLICY "Staff manage quotes" ON public.quotes FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

DROP POLICY IF EXISTS "Staff manage quote items" ON public.quote_items;
CREATE POLICY "Staff manage quote items" ON public.quote_items FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

-- REVIEWS
DROP POLICY IF EXISTS "Public view approved reviews" ON public.reviews;
CREATE POLICY "Public view approved reviews" ON public.reviews FOR SELECT
    USING (status = 'approved' OR public.is_staff() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth users insert review" ON public.reviews;
CREATE POLICY "Auth users insert review" ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff manage reviews" ON public.reviews;
CREATE POLICY "Staff manage reviews" ON public.reviews FOR ALL
    USING (public.has_role('admin', 'manager', 'support'));

-- POSTS
DROP POLICY IF EXISTS "Public view published posts" ON public.posts;
CREATE POLICY "Public view published posts" ON public.posts FOR SELECT
    USING (status = 'published' OR public.is_staff());

DROP POLICY IF EXISTS "Staff manage posts" ON public.posts;
CREATE POLICY "Staff manage posts" ON public.posts FOR ALL
    USING (public.has_role('admin', 'editor'));

-- COMMUNITY BUILDS
DROP POLICY IF EXISTS "Public view approved builds" ON public.community_builds;
CREATE POLICY "Public view approved builds" ON public.community_builds FOR SELECT
    USING (status = 'approved' OR public.is_staff() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth users create community build" ON public.community_builds;
CREATE POLICY "Auth users create community build" ON public.community_builds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff manage community builds" ON public.community_builds;
CREATE POLICY "Staff manage community builds" ON public.community_builds FOR ALL
    USING (public.has_role('admin', 'editor'));

-- CONTACTS & NEWSLETTERS
DROP POLICY IF EXISTS "Staff view contacts" ON public.contacts;
CREATE POLICY "Staff view contacts" ON public.contacts FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff manage contacts" ON public.contacts;
CREATE POLICY "Staff manage contacts" ON public.contacts FOR ALL USING (public.has_role('admin', 'support'));

DROP POLICY IF EXISTS "Staff view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Staff manage newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff manage newsletter subscribers" ON public.newsletter_subscribers FOR ALL USING (public.has_role('admin', 'manager'));

-- WISHLISTS
DROP POLICY IF EXISTS "Users manage own wishlists" ON public.wishlists;
CREATE POLICY "Users manage own wishlists" ON public.wishlists FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI SETTINGS & CONVERSATIONS
DROP POLICY IF EXISTS "Public view ai settings" ON public.ai_settings;
CREATE POLICY "Public view ai settings" ON public.ai_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage ai settings" ON public.ai_settings;
CREATE POLICY "Admin manage ai settings" ON public.ai_settings FOR ALL USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Staff view ai conversations" ON public.ai_conversations;
CREATE POLICY "Staff view ai conversations" ON public.ai_conversations FOR SELECT USING (public.is_staff());

-- AUDIT LOGS
DROP POLICY IF EXISTS "Staff view audit logs" ON public.audit_logs;
CREATE POLICY "Staff view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role('admin'));

DROP POLICY IF EXISTS "Server insert audit logs" ON public.audit_logs;
CREATE POLICY "Server insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 5. ATOMIC RPC FUNCTIONS
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order JSONB,
    p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_code TEXT;
    v_item JSONB;
    v_prod_id UUID;
    v_qty INT;
    v_cur_stock INT;
    v_prod_price NUMERIC;
    v_prod_name TEXT;
    v_prod_sku TEXT;
BEGIN
    v_order_code := COALESCE(
        p_order->>'code',
        'PCH-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text from 1 for 6))
    );

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_prod_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Số lượng sản phẩm không hợp lệ';
        END IF;

        SELECT stock, price, name, sku INTO v_cur_stock, v_prod_price, v_prod_name, v_prod_sku
        FROM public.products
        WHERE id = v_prod_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Sản phẩm không tồn tại: %', v_prod_id;
        END IF;

        IF v_cur_stock < v_qty THEN
            RAISE EXCEPTION 'Sản phẩm "%" chỉ còn % trong kho, không đủ số lượng %', v_prod_name, v_cur_stock, v_qty;
        END IF;

        UPDATE public.products
        SET stock = stock - v_qty
        WHERE id = v_prod_id;
    END LOOP;

    INSERT INTO public.orders (
        code,
        user_id,
        customer_name,
        phone,
        email,
        shipping_address,
        subtotal,
        shipping_fee,
        discount,
        tax,
        total,
        payment_method,
        payment_status,
        status,
        note
    ) VALUES (
        v_order_code,
        NULLIF(p_order->>'user_id', '')::UUID,
        p_order->>'customer_name',
        p_order->>'phone',
        p_order->>'email',
        (p_order->'shipping_address')::JSONB,
        COALESCE((p_order->>'subtotal')::NUMERIC, 0),
        COALESCE((p_order->>'shipping_fee')::NUMERIC, 0),
        COALESCE((p_order->>'discount')::NUMERIC, 0),
        COALESCE((p_order->>'tax')::NUMERIC, 0),
        (p_order->>'total')::NUMERIC,
        COALESCE(p_order->>'payment_method', 'cod'),
        COALESCE((p_order->>'payment_status')::payment_status, 'pending'::payment_status),
        'pending'::order_status,
        p_order->>'note'
    ) RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            name_snapshot,
            sku_snapshot,
            price_snapshot,
            quantity
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            v_item->>'name_snapshot',
            v_item->>'sku_snapshot',
            (v_item->>'price_snapshot')::NUMERIC,
            (v_item->>'quantity')::INT
        );
    END LOOP;

    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (v_order_id, 'pending', 'Đơn hàng mới được tạo');

    RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_code', v_order_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.cancel_order_atomic(
    p_order_id UUID,
    p_actor_id UUID,
    p_reason TEXT DEFAULT 'Hủy đơn hàng'
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy đơn hàng';
    END IF;

    IF v_order.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Đơn hàng đã được hủy trước đó');
    END IF;

    FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.product_id IS NOT NULL THEN
            UPDATE public.products
            SET stock = stock + v_item.quantity
            WHERE id = v_item.product_id;
        END IF;
    END LOOP;

    UPDATE public.orders
    SET status = 'cancelled'::order_status
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (order_id, status, note, changed_by)
    VALUES (p_order_id, 'cancelled', p_reason, p_actor_id);

    RETURN jsonb_build_object('success', true, 'message', 'Đã hủy đơn và hoàn lại tồn kho');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_today_start TIMESTAMPTZ := date_trunc('day', v_now);
    v_week_start TIMESTAMPTZ := date_trunc('week', v_now);
    v_month_start TIMESTAMPTZ := date_trunc('month', v_now);

    v_revenue_today NUMERIC := 0;
    v_revenue_week NUMERIC := 0;
    v_revenue_month NUMERIC := 0;
    v_orders_today INT := 0;
    v_orders_pending INT := 0;
    v_quotes_new INT := 0;
    v_low_stock_count INT := 0;
    v_reviews_pending INT := 0;
    v_recent_sales JSONB := '[]'::jsonb;
    v_sales_by_category JSONB := '[]'::jsonb;
BEGIN
    SELECT COALESCE(SUM(total), 0), COUNT(id)
    INTO v_revenue_today, v_orders_today
    FROM public.orders
    WHERE created_at >= v_today_start AND status != 'cancelled';

    SELECT COALESCE(SUM(total), 0) INTO v_revenue_week
    FROM public.orders
    WHERE created_at >= v_week_start AND status != 'cancelled';

    SELECT COALESCE(SUM(total), 0) INTO v_revenue_month
    FROM public.orders
    WHERE created_at >= v_month_start AND status != 'cancelled';

    SELECT COUNT(id) INTO v_orders_pending
    FROM public.orders
    WHERE status = 'pending';

    SELECT COUNT(id) INTO v_quotes_new
    FROM public.quotes
    WHERE status = 'new';

    SELECT COUNT(id) INTO v_low_stock_count
    FROM public.products
    WHERE stock <= 5 AND is_active = true;

    SELECT COUNT(id) INTO v_reviews_pending
    FROM public.reviews
    WHERE status = 'pending';

    SELECT jsonb_agg(d) INTO v_recent_sales
    FROM (
        SELECT
            to_char(day, 'DD/MM') AS date,
            COALESCE(SUM(o.total), 0) AS total,
            COUNT(o.id) AS orders_count
        FROM generate_series(v_now - interval '6 days', v_now, interval '1 day') day
        LEFT JOIN public.orders o ON date_trunc('day', o.created_at) = date_trunc('day', day) AND o.status != 'cancelled'
        GROUP BY day
        ORDER BY day ASC
    ) d;

    SELECT jsonb_agg(c) INTO v_sales_by_category
    FROM (
        SELECT cat.name AS category_name, COALESCE(SUM(oi.price_snapshot * oi.quantity), 0) AS total_revenue
        FROM public.categories cat
        JOIN public.products p ON p.category_id = cat.id
        JOIN public.order_items oi ON oi.product_id = p.id
        JOIN public.orders o ON o.id = oi.order_id AND o.status != 'cancelled'
        GROUP BY cat.id, cat.name
        ORDER BY total_revenue DESC
        LIMIT 6
    ) c;

    RETURN jsonb_build_object(
        'revenue_today', v_revenue_today,
        'revenue_week', v_revenue_week,
        'revenue_month', v_revenue_month,
        'orders_today', v_orders_today,
        'orders_pending', v_orders_pending,
        'quotes_new', v_quotes_new,
        'low_stock_count', v_low_stock_count,
        'reviews_pending', v_reviews_pending,
        'recent_sales', COALESCE(v_recent_sales, '[]'::jsonb),
        'sales_by_category', COALESCE(v_sales_by_category, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. ENABLE REALTIME
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;