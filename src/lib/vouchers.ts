export interface Voucher {
  code: string;
  name: string;
  type: 'percent' | 'fixed' | 'freeship';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
}

export const AVAILABLE_VOUCHERS: Voucher[] = [
  {
    code: 'PCHUB10',
    name: 'Giảm 10%',
    type: 'percent',
    value: 10,
    minOrder: 500000,
    maxDiscount: 500000,
    description: 'Giảm 10% tối đa 500K cho đơn từ 500.000₫',
  },
  {
    code: 'SAVE50K',
    name: 'Giảm 50K',
    type: 'fixed',
    value: 50000,
    minOrder: 300000,
    description: 'Giảm trực tiếp 50.000₫ cho đơn từ 300.000₫',
  },
  {
    code: 'FREESHIP',
    name: 'Freeship',
    type: 'freeship',
    value: 0,
    minOrder: 0,
    description: 'Miễn phí giao hàng toàn quốc (tiết kiệm 30.000₫)',
  },
  {
    code: 'PCHUB20',
    name: 'Giảm 20%',
    type: 'percent',
    value: 20,
    minOrder: 1000000,
    maxDiscount: 200000,
    description: 'Giảm 20% tối đa 200K cho đơn từ 1.000.000₫',
  },
  {
    code: 'PCNEW10',
    name: 'Khách mới -10%',
    type: 'percent',
    value: 10,
    minOrder: 200000,
    maxDiscount: 300000,
    description: 'Giảm 10% cho khách hàng mua đơn đầu tiên',
  },
];

/**
 * Returns the most relevant voucher tag for a product given its price
 */
export function getProductVoucher(price: number): Voucher {
  if (price >= 1000000) {
    return AVAILABLE_VOUCHERS[0]; // PCHUB10
  }
  if (price >= 300000) {
    return AVAILABLE_VOUCHERS[1]; // SAVE50K
  }
  return AVAILABLE_VOUCHERS[2]; // FREESHIP
}

/**
 * Validates and calculates discount for a voucher code and order total
 */
export function calculateVoucherDiscount(
  code: string,
  totalPrice: number,
  shippingFee: number = 30000
): { discount: number; shipping: number; error?: string; voucher?: Voucher } {
  const normalizedCode = code.trim().toUpperCase();
  const voucher = AVAILABLE_VOUCHERS.find((v) => v.code === normalizedCode);

  if (!voucher) {
    return {
      discount: 0,
      shipping: shippingFee,
      error: 'Mã giảm giá không tồn tại hoặc đã hết hạn',
    };
  }

  if (totalPrice < voucher.minOrder) {
    return {
      discount: 0,
      shipping: shippingFee,
      error: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString(
        'vi-VN'
      )}₫ để dùng mã ${voucher.code}`,
    };
  }

  let discount = 0;
  let shipping = shippingFee;

  if (voucher.type === 'percent') {
    const rawDiscount = Math.round((totalPrice * voucher.value) / 100);
    discount = voucher.maxDiscount
      ? Math.min(rawDiscount, voucher.maxDiscount)
      : rawDiscount;
  } else if (voucher.type === 'fixed') {
    discount = Math.min(voucher.value, totalPrice);
  } else if (voucher.type === 'freeship') {
    shipping = 0;
  }

  return { discount, shipping, voucher };
}
