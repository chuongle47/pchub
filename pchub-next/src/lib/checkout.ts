import { useRouter } from 'next/navigation';
import { useCartStore, useOrderStore } from '@/lib/store';

export interface CheckoutFormData {
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note?: string;
    method: string;
    fee: number;
  };
  payment: {
    method: string;
    label: string;
  };
  voucher?: string;
  discount: number;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
  paymentUrl?: string;
}

/**
 * Standardized checkout process for authenticated users
 * Validates user authentication and order data before payment
 */
export async function processCheckout(formData: CheckoutFormData, cartTotal: number): Promise<CheckoutResult> {
  try {
    // 1️⃣ Check if user is authenticated
    const authResponse = await fetch('/api/auth/me');
    if (!authResponse.ok) {
      return {
        success: false,
        error: 'Vui lòng đăng nhập để tiếp tục thanh toán'
      };
    }

    const user = await authResponse.json();
    if (!user?.id) {
      return {
        success: false,
        error: 'Không xác định được thông tin người dùng'
      };
    }

    // 2️⃣ Validate checkout data
    if (!formData.shipping?.name || !formData.shipping?.phone || !formData.shipping?.address) {
      return {
        success: false,
        error: 'Thông tin giao hàng không đầy đủ'
      };
    }

    if (!formData.payment?.method) {
      return {
        success: false,
        error: 'Vui lòng chọn phương thức thanh toán'
      };
    }

    // 3️⃣ Prepare order payload
    const orderPayload = {
      items: [], // Will be populated from cart
      shipping: formData.shipping,
      payment: {
        method: formData.payment.method,
        status: 'pending' as const
      },
      voucher: formData.voucher,
      discount: formData.discount,
      total: cartTotal + formData.shipping.fee - formData.discount
    };

    // 4️⃣ Submit order to API
    const orderResponse = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      return {
        success: false,
        error: errorData.message || 'Lỗi xử lý đơn hàng'
      };
    }

    const result = await orderResponse.json();

    if (result.status !== 'success') {
      return {
        success: false,
        error: result.message
      };
    }

    return {
      success: true,
      orderId: result.orderId,
      paymentUrl: result.data?.paymentUrl
    };

  } catch (error) {
    console.error('Checkout error:', error);
    return {
      success: false,
      error: 'Lỗi xử lý thanh toán. Vui lòng thử lại'
    };
  }
}

/**
 * Hook for using checkout in React components
 */
export function useCheckout() {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const checkout = async (formData: CheckoutFormData, cartTotal: number) => {
    const result = await processCheckout(formData, cartTotal);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Clear cart after successful order
    clearCart();

    // Redirect to success page
    router.push(`/dat-hang-thanh-cong?orderId=${result.orderId}`);

    return result;
  };

  return { checkout };
}
