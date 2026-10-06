/**
 * NKS Member E-Wallet Service
 * Integrates with https://account.nks.vn/api/nks/user/wallet/*
 */

const NKS_WALLET_BASE_URL = 'https://account.nks.vn/api/nks/user/wallet';

export interface WalletData {
  walletcode: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  code: string;
  sender_wallet_code: string | null;
  receiver_wallet_code: string | null;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | string;
  amount: number;
  fee?: number;
  currency: string;
  description?: string;
  created_at?: string;
  date?: string;
}

export interface LinkedWallet {
  id: string;
  type: 'momo' | 'zalopay' | 'nks';
  name: string;
  accountNumber: string;
  accountName: string;
  isPrimary?: boolean;
  status: 'active' | 'pending';
}

/**
 * Helper to call NKS Wallet API using FormData
 */
async function callNksWalletApi(endpoint: string, formDataFields: Record<string, any>) {
  const url = `${NKS_WALLET_BASE_URL}${endpoint ? `/${endpoint.replace(/^\//, '')}` : ''}`;

  const formData = new FormData();
  Object.entries(formDataFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    let result: any = {};
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { message: text };
    }

    return {
      status: response.status,
      ok: response.ok,
      data: result,
    };
  } catch (error: any) {
    console.error(`[NKS Wallet API] Error on ${url}:`, error.message);
    return {
      status: 502,
      ok: false,
      data: { success: false, message: error.message || 'Lỗi kết nối máy chủ ví NKS' },
    };
  }
}

export const WalletService = {
  /**
   * 1. POST https://account.nks.vn/api/nks/user/wallet
   * Retrieve wallet balance & walletcode
   */
  async getWallet(token: string, currency = 'VND') {
    if (!token) {
      return { success: false, message: 'Thiếu mã xác thực token' };
    }

    const res = await callNksWalletApi('', {
      access_token: token,
      currency,
    });

    if (res.ok && (res.data?.success || res.data?.data?.walletcode)) {
      return {
        success: true as const,
        data: res.data.data as WalletData,
        message: res.data.message || 'Lấy thông tin ví thành công',
      };
    }

    return {
      success: false as const,
      message: res.data?.message || 'Không thể lấy thông tin ví',
      data: res.data,
    };
  },

  /**
   * 2. POST https://account.nks.vn/api/nks/user/wallet/deposit
   * Deposit / Add money to wallet
   */
  async deposit(token: string, amount: number, currency = 'VND') {
    if (!token) {
      return { success: false, message: 'Thiếu mã xác thực token' };
    }
    if (!amount || amount <= 0) {
      return { success: false, message: 'Số tiền nạp không hợp lệ' };
    }

    const res = await callNksWalletApi('deposit', {
      access_token: token,
      amount,
      currency,
    });

    if (res.ok && (res.data?.success || res.data?.data?.walletcode)) {
      return {
        success: true as const,
        data: res.data.data as WalletData,
        message: res.data.message || 'Nạp tiền vào ví thành công',
      };
    }

    return {
      success: false as const,
      message: res.data?.message || 'Nạp tiền vào ví thất bại',
      data: res.data,
    };
  },

  /**
   * 3. POST https://account.nks.vn/api/nks/user/wallet/withdraw
   * Withdraw money from wallet
   */
  async withdraw(token: string, amount: number, currency = 'VND') {
    if (!token) {
      return { success: false, message: 'Thiếu mã xác thực token' };
    }
    if (!amount || amount <= 0) {
      return { success: false, message: 'Số tiền rút không hợp lệ' };
    }

    const res = await callNksWalletApi('withdraw', {
      access_token: token,
      amount,
      currency,
    });

    if (res.ok && (res.data?.success || res.data?.data?.walletcode)) {
      return {
        success: true as const,
        data: res.data.data as WalletData,
        message: res.data.message || 'Rút tiền từ ví thành công',
      };
    }

    return {
      success: false as const,
      message: res.data?.message || 'Rút tiền từ ví thất bại',
      data: res.data,
    };
  },

  /**
   * 4. POST https://account.nks.vn/api/nks/user/wallet/transactions
   * Get all transactions
   */
  async getTransactions(token: string) {
    if (!token) {
      return { success: false, message: 'Thiếu mã xác thực token', data: [] };
    }

    const res = await callNksWalletApi('transactions', {
      access_token: token,
    });

    if (res.ok && res.data) {
      const txs = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      return {
        success: true as const,
        data: txs as WalletTransaction[],
        message: res.data.message || 'Lấy danh sách giao dịch thành công',
      };
    }

    return {
      success: false as const,
      message: res.data?.message || 'Không thể lấy danh sách giao dịch',
      data: [],
    };
  },

  /**
   * 5. POST https://account.nks.vn/api/nks/user/wallet/transaction/send
   * Transfer money from this wallet to another user
   */
  async transfer(token: string, data: {
    ruser_id: string | number;
    amount: number;
    fee?: number;
    currency?: string;
    description?: string;
  }) {
    if (!token) {
      return { success: false, message: 'Thiếu mã xác thực token' };
    }
    if (!data.ruser_id) {
      return { success: false, message: 'Vui lòng nhập ID hoặc mã ví người nhận' };
    }
    if (!data.amount || data.amount <= 0) {
      return { success: false, message: 'Số tiền chuyển không hợp lệ' };
    }

    const res = await callNksWalletApi('transaction/send', {
      access_token: token,
      ruser_id: data.ruser_id,
      amount: data.amount,
      fee: data.fee ?? 0,
      currency: data.currency || 'VNĐ',
      description: data.description || 'Chuyển tiền qua ví NKS',
    });

    if (res.ok && (res.data?.success || res.data?.data?.walletcode)) {
      return {
        success: true as const,
        data: res.data.data as WalletData,
        message: res.data.message || 'Chuyển tiền thành công!',
      };
    }

    return {
      success: false as const,
      message: res.data?.message || 'Chuyển tiền thất bại. Vui lòng kiểm tra lại số dư hoặc ID người nhận.',
      data: res.data,
    };
  },
};
