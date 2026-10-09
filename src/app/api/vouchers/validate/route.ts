import { NextResponse } from 'next/server';
import { fetchSbuyWooCommerceCoupon, fetchSbuyWooCommerceCategories } from '@/lib/sbuy';
import { AVAILABLE_VOUCHERS } from '@/lib/vouchers';

interface CartItemInput {
  id?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
  brand?: string;
  slug?: string;
  product?: any;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, totalPrice = 0, shippingFee = 0, items = [] } = body;

    const normalizedCode = (code || '').trim().toUpperCase();
    if (!normalizedCode) {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const cartItems: CartItemInput[] = Array.isArray(items) ? items : [];

    // 1️⃣ Query live WooCommerce Coupons REST API first
    const wooCoupon = await fetchSbuyWooCommerceCoupon(normalizedCode);
    if (wooCoupon) {
      // Check expiry date if specified
      if (wooCoupon.date_expires) {
        const expTime = new Date(wooCoupon.date_expires).getTime();
        // Allow expiry on same day (end of day)
        if (expTime > 0 && expTime + 86400000 < Date.now()) {
          return NextResponse.json({
            success: false,
            error: 'Mã giảm giá này lỗi'
          }, { status: 400 });
        }
      }

      const minAmount = parseFloat(wooCoupon.minimum_amount || '0');
      if (minAmount > 0 && totalPrice < minAmount) {
        return NextResponse.json({
          success: false,
          error: 'Mã giảm giá này lỗi'
        }, { status: 400 });
      }

      // Check category & product restrictions
      const restrictedCatIds = wooCoupon.product_categories || [];
      const excludedCatIds = wooCoupon.excluded_product_categories || [];
      const restrictedProdIds = (wooCoupon.product_ids || []).map(Number);
      const excludedProdIds = (wooCoupon.excluded_product_ids || []).map(Number);

      const hasRestrictions = restrictedCatIds.length > 0 || restrictedProdIds.length > 0;

      // Fetch categories map from WooCommerce for accurate name mapping
      const wcCategories = await fetchSbuyWooCommerceCategories();
      const catMap = new Map(wcCategories.map(c => [c.id, c]));

      // Function to check if a single cart item matches the coupon restrictions
      const isItemEligible = (item: CartItemInput) => {
        const rawItemId = Number(String(item.id || '').replace(/\D/g, ''));
        
        // Excluded products
        if (excludedProdIds.length > 0 && rawItemId && excludedProdIds.includes(rawItemId)) {
          return false;
        }

        // Restricted products
        if (restrictedProdIds.length > 0) {
          if (rawItemId && restrictedProdIds.includes(rawItemId)) {
            return true;
          }
          if (restrictedCatIds.length === 0) {
            return false;
          }
        }

        // Check category
        const itemCatName = (item.category || item.product?.category_name || '').toLowerCase().trim();
        const itemCatSlug = (item.product?.category_slug || '').toLowerCase().trim();
        const itemProdCats: number[] = (item.product?.categories || []).map((c: any) => Number(c.id));
        const itemName = (item.name || '').toLowerCase();

        // Check excluded categories
        if (excludedCatIds.length > 0) {
          if (itemProdCats.some((id: number) => excludedCatIds.includes(id))) return false;
          for (const excId of excludedCatIds) {
            const excCat = catMap.get(excId);
            if (excCat && (itemCatName.includes(excCat.name.toLowerCase()) || itemCatSlug === excCat.slug)) {
              return false;
            }
          }
        }

        // If no restricted categories, item is eligible
        if (restrictedCatIds.length === 0) {
          return true;
        }

        // Match against restricted category IDs
        if (itemProdCats.some((id: number) => restrictedCatIds.includes(id))) {
          return true;
        }

        for (const catId of restrictedCatIds) {
          const cat = catMap.get(catId);
          const catName = (cat?.name || '').toLowerCase();
          const catSlug = (cat?.slug || '').toLowerCase();

          // Direct category name / slug match
          if (catName && (itemCatName.includes(catName) || itemCatName === catName)) return true;
          if (catSlug && (itemCatSlug === catSlug || itemCatSlug.includes(catSlug))) return true;

          // Keyword heuristics based on WooCommerce category taxonomy
          if (catId === 73 || catName.includes('ram') || catSlug.includes('ram')) {
            if (itemCatName.includes('ram') || itemName.includes('ram ') || itemName.startsWith('ram') || itemName.includes('ddr4') || itemName.includes('ddr5') || itemName.includes('bộ nhớ trong')) {
              return true;
            }
          } else if (catId === 89 || catName.includes('chuột') || catSlug.includes('chuot')) {
            if (itemCatName.includes('chuột') || itemName.includes('chuột') || itemName.includes('mouse')) {
              return true;
            }
          } else if (catId === 87 || catName.includes('bàn phím') || catSlug.includes('ban-phim')) {
            if (itemCatName.includes('phím') || itemName.includes('bàn phím') || itemName.includes('keyboard')) {
              return true;
            }
          } else if (catId === 69 || catName.includes('cpu') || catSlug.includes('cpu')) {
            if (itemCatName.includes('cpu') || itemName.includes('intel core') || itemName.includes('ryzen') || itemName.includes('vi xử lý')) {
              return true;
            }
          } else if (catId === 75 || catName.includes('vga') || catSlug.includes('vga')) {
            if (itemCatName.includes('vga') || itemCatName.includes('card') || itemName.includes('rtx') || itemName.includes('gtx') || itemName.includes('radeon')) {
              return true;
            }
          } else if (catId === 71 || catName.includes('mainboard') || catSlug.includes('mainboard')) {
            if (itemCatName.includes('main') || itemName.includes('bo mạch') || itemName.includes('b760') || itemName.includes('z790') || itemName.includes('b650')) {
              return true;
            }
          } else if (catId === 85 || catId === 47 || catName.includes('màn hình') || catSlug.includes('man-hinh')) {
            if (itemCatName.includes('màn') || itemName.includes('màn hình') || itemName.includes('monitor')) {
              return true;
            }
          } else if (catId === 79 || catName.includes('nguồn') || catSlug.includes('nguon')) {
            if (itemCatName.includes('nguồn') || itemCatName.includes('psu') || itemName.includes('nguồn máy tính')) {
              return true;
            }
          } else if (catId === 77 || catName.includes('ổ cứng') || catSlug.includes('o-cung')) {
            if (itemCatName.includes('ssd') || itemCatName.includes('hdd') || itemCatName.includes('ổ cứng') || itemName.includes('ssd') || itemName.includes('nvme')) {
              return true;
            }
          } else if (catId === 81 || catName.includes('case') || catSlug.includes('case')) {
            if (itemCatName.includes('case') || itemName.includes('vỏ case') || itemName.includes('thùng máy')) {
              return true;
            }
          } else if (catId === 83 || catName.includes('tản nhiệt') || catSlug.includes('tan-nhiet')) {
            if (itemCatName.includes('tản') || itemName.includes('tản nhiệt') || itemName.includes('cooler')) {
              return true;
            }
          }
        }

        return false;
      };

      // Determine eligible items in cart
      let eligibleItems = cartItems;
      if (hasRestrictions && cartItems.length > 0) {
        eligibleItems = cartItems.filter(isItemEligible);

        if (eligibleItems.length === 0) {
          const catNames = restrictedCatIds
            .map(id => catMap.get(id)?.name || (id === 73 ? 'RAM' : id === 89 ? 'Chuột' : id === 87 ? 'Bàn phím' : id === 69 ? 'CPU' : id === 75 ? 'VGA' : 'Linh kiện'))
            .filter(Boolean)
            .join(', ');

          return NextResponse.json({
            success: false,
            error: 'Mã giảm giá này lỗi'
          }, { status: 400 });
        }
      }

      const amountVal = parseFloat(wooCoupon.amount || '0');
      const maxVal = parseFloat(wooCoupon.maximum_amount || '0');
      let discount = 0;
      let label = `Giảm giá từ WooCommerce`;

      // Calculate base subtotal of eligible items
      const eligibleSubtotal = eligibleItems.length > 0
        ? eligibleItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
        : totalPrice;

      if (wooCoupon.discount_type === 'percent') {
        discount = Math.round((eligibleSubtotal * amountVal) / 100);
        if (maxVal > 0) {
          discount = Math.min(discount, maxVal);
        }
        label = `Giảm ${amountVal}%`;
      } else if (wooCoupon.discount_type === 'fixed_product') {
        if (eligibleItems.length > 0) {
          discount = eligibleItems.reduce((sum, it) => {
            const itemPrice = Number(it.price) || 0;
            const itemQty = Number(it.quantity) || 1;
            return sum + Math.min(amountVal, itemPrice) * itemQty;
          }, 0);
        } else {
          discount = Math.min(amountVal, totalPrice);
        }
        label = `Giảm ${amountVal.toLocaleString('vi-VN')}₫/sản phẩm`;
      } else {
        // fixed_cart
        discount = Math.min(amountVal, eligibleSubtotal > 0 ? eligibleSubtotal : totalPrice);
        label = `Giảm ${amountVal.toLocaleString('vi-VN')}₫`;
      }

      return NextResponse.json({
        success: true,
        code: wooCoupon.code.toUpperCase(),
        discount,
        type: wooCoupon.discount_type === 'percent' ? 'percent' : 'fixed',
        label,
        eligibleCount: eligibleItems.length
      });
    }

    // 2️⃣ Fallback to local presets if not found in WooCommerce
    const localVoucher = AVAILABLE_VOUCHERS.find(v => v.code === normalizedCode);
    if (localVoucher) {
      if (totalPrice < localVoucher.minOrder) {
        return NextResponse.json({
          success: false,
          error: 'Mã giảm giá này lỗi'
        }, { status: 400 });
      }

      let discount = 0;
      if (localVoucher.type === 'percent') {
        const raw = Math.round((totalPrice * localVoucher.value) / 100);
        discount = localVoucher.maxDiscount ? Math.min(raw, localVoucher.maxDiscount) : raw;
      } else if (localVoucher.type === 'fixed') {
        discount = Math.min(localVoucher.value, totalPrice);
      }

      return NextResponse.json({
        success: true,
        code: localVoucher.code,
        discount,
        type: localVoucher.type,
        label: localVoucher.name
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Mã giảm giá này lỗi'
    }, { status: 404 });

  } catch (error: any) {
    console.error('Voucher validation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Mã giảm giá này lỗi'
    }, { status: 500 });
  }
}
