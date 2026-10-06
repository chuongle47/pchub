import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletData, WalletTransaction, LinkedWallet } from './wallet-service';

export interface WalletStoreState {
  wallet: WalletData;
  transactions: WalletTransaction[];
  linkedWallets: LinkedWallet[];
  
  // Actions
  setWallet: (wallet: Partial<WalletData>) => void;
  deductBalance: (amount: number, description: string, refCode?: string) => void;
  addBalance: (amount: number, description: string, refCode?: string, type?: 'DEPOSIT' | 'REFUND') => void;
  addTransaction: (tx: WalletTransaction) => void;
  setTransactions: (txs: WalletTransaction[]) => void;
  setLinkedWallets: (wallets: LinkedWallet[]) => void;
  syncWithBackend: (token?: string) => Promise<void>;
  resetWallet: () => void;
}

const DEFAULT_WALLET: WalletData = {
  walletcode: 'PCH-8789',
  balance: 16000000,
  currency: 'VND',
};

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  {
    code: '62ff0cad-8e0d-48ec-a0b8-bd4a91b14805',
    sender_wallet_code: 'PCH-8789',
    receiver_wallet_code: '9fc5-4e85-8cdd-141c',
    type: 'TRANSFER',
    amount: 2000000,
    fee: 0,
    currency: 'VND',
    description: 'Chuyển tiền mua linh kiện PC',
    date: 'Hôm nay, 10:30',
  },
  {
    code: 'df7398a2-936a-4ff7-b6e8-6cd2ac4e8b85',
    sender_wallet_code: null,
    receiver_wallet_code: 'PCH-8789',
    type: 'DEPOSIT',
    amount: 5000000,
    fee: 0,
    currency: 'VND',
    description: 'Nạp tiền vào ví điện tử NKS',
    date: '05/10/2026, 14:15',
  },
  {
    code: '42b88241-5127-4e11-ae92-74ba32b9da76',
    sender_wallet_code: 'PCH-8789',
    receiver_wallet_code: null,
    type: 'WITHDRAW',
    amount: 1000000,
    fee: 0,
    currency: 'VND',
    description: 'Rút tiền về tài khoản ngân hàng',
    date: '03/10/2026, 09:20',
  },
];

const DEFAULT_LINKED_WALLETS: LinkedWallet[] = [
  {
    id: 'momo-1',
    type: 'momo',
    name: 'Ví MoMo liên kết',
    accountNumber: '0977758789',
    accountName: 'Lê Đức Hải',
    status: 'active',
  },
  {
    id: 'zalopay-1',
    type: 'zalopay',
    name: 'Ví ZaloPay liên kết',
    accountNumber: '0977758789',
    accountName: 'Lê Đức Hải',
    status: 'active',
  },
];

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set, get) => ({
      wallet: DEFAULT_WALLET,
      transactions: DEFAULT_TRANSACTIONS,
      linkedWallets: DEFAULT_LINKED_WALLETS,

      setWallet: (walletUpdates) => {
        set((state) => ({
          wallet: { ...state.wallet, ...walletUpdates },
        }));
      },

      deductBalance: (amount: number, description: string, refCode?: string) => {
        const state = get();
        const currentBalance = state.wallet?.balance ?? 0;
        const newBalance = Math.max(0, currentBalance - amount);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `Hôm nay, ${timeStr}`;

        const newTx: WalletTransaction = {
          code: refCode || `TX-WD-${Date.now().toString(36).toUpperCase()}`,
          sender_wallet_code: state.wallet?.walletcode || 'PCH-8789',
          receiver_wallet_code: null,
          type: 'WITHDRAW',
          amount: amount,
          fee: 0,
          currency: 'VND',
          description: description || 'Thanh toán qua ví điện tử',
          date: dateStr,
          created_at: now.toISOString(),
        };

        set({
          wallet: { ...state.wallet, balance: newBalance },
          transactions: [newTx, ...state.transactions],
        });
      },

      addBalance: (amount: number, description: string, refCode?: string, type: 'DEPOSIT' | 'REFUND' = 'DEPOSIT') => {
        const state = get();
        const currentBalance = state.wallet?.balance ?? 0;
        const newBalance = currentBalance + amount;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `Hôm nay, ${timeStr}`;

        const newTx: WalletTransaction = {
          code: refCode || `TX-DP-${Date.now().toString(36).toUpperCase()}`,
          sender_wallet_code: null,
          receiver_wallet_code: state.wallet?.walletcode || 'PCH-8789',
          type: type,
          amount: amount,
          fee: 0,
          currency: 'VND',
          description: description || 'Nạp tiền vào ví điện tử',
          date: dateStr,
          created_at: now.toISOString(),
        };

        set({
          wallet: { ...state.wallet, balance: newBalance },
          transactions: [newTx, ...state.transactions],
        });
      },

      addTransaction: (tx: WalletTransaction) => {
        set((state) => ({
          transactions: [tx, ...state.transactions.filter((t) => t.code !== tx.code)],
        }));
      },

      setTransactions: (txs: WalletTransaction[]) => {
        set({ transactions: txs });
      },

      setLinkedWallets: (wallets: LinkedWallet[]) => {
        set({ linkedWallets: wallets });
      },

      syncWithBackend: async (token?: string, orders?: any[]) => {
        let serverWalletCode = '';
        let serverCurrency = 'VND';
        let serverTxs: WalletTransaction[] = [];

        try {
          const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token || '' }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            serverWalletCode = json.data.walletcode || '';
            serverCurrency = json.data.currency || 'VND';
          }

          const txRes = await fetch('/api/wallet/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token || '' }),
          });
          const txJson = await txRes.json();
          if (txJson.success && Array.isArray(txJson.data) && txJson.data.length > 0) {
            serverTxs = txJson.data;
          }
        } catch (err) {
          console.warn('[WalletStore] syncWithBackend warning:', err);
        }

        const state = get();
        const walletcode = serverWalletCode || state.wallet.walletcode || '1fb5-82ed-4bac-b971';

        // 1. Combine server & existing transactions
        let currentTxs = [...state.transactions];
        serverTxs.forEach((stx) => {
          if (!currentTxs.some((t) => t.code === stx.code)) {
            currentTxs.push(stx);
          }
        });

        // 2. Reconcile with all orders placed in the system
        if (Array.isArray(orders) && orders.length > 0) {
          orders.forEach((ord: any) => {
            const isWalletPayment = ord.paymentMethod === 'wallet' ||
              (ord.paymentMethodLabel && ord.paymentMethodLabel.toLowerCase().includes('ví'));

            if (!isWalletPayment) return;

            const orderTotal = Number(ord.total) || 0;
            const orderRef = ord.id;
            const prodName = ord.products?.[0]?.name || 'Sản phẩm linh kiện';

            const hasPaymentTx = currentTxs.some((t) => t.code === orderRef || t.code === `ORD-${orderRef}` || t.code === `TX-${orderRef}`);

            if (!hasPaymentTx) {
              const payTx: WalletTransaction = {
                code: orderRef,
                sender_wallet_code: walletcode,
                receiver_wallet_code: null,
                type: 'WITHDRAW',
                amount: orderTotal,
                fee: 0,
                currency: 'VND',
                description: `Thanh toán đơn hàng ${orderRef} (${prodName})`,
                date: ord.date || 'Gần đây',
              };
              currentTxs = [payTx, ...currentTxs];
            }

            // If order was cancelled, make sure refund transaction exists
            if (ord.status === 'cancelled') {
              const refundRef = `REF-${orderRef}`;
              const hasRefundTx = currentTxs.some((t) => t.code === refundRef);
              if (!hasRefundTx) {
                const refundTx: WalletTransaction = {
                  code: refundRef,
                  sender_wallet_code: null,
                  receiver_wallet_code: walletcode,
                  type: 'REFUND',
                  amount: orderTotal,
                  fee: 0,
                  currency: 'VND',
                  description: `Hoàn tiền hủy đơn hàng ${orderRef}`,
                  date: ord.date || 'Gần đây',
                };
                currentTxs = [refundTx, ...currentTxs];
              }
            }
          });
        }

        // 3. Compute net balance starting from 16.000.000 base + deposits/refunds - withdrawals/transfers
        // Initial base seed: 16.000.000 (standard NKS e-wallet seed)
        let computedBalance = 16000000;
        
        // Sum up all transactions beyond the initial seed transactions
        const seedTxCodes = new Set(['62ff0cad-8e0d-48ec-a0b8-bd4a91b14805', 'df7398a2-936a-4ff7-b6e8-6cd2ac4e8b85', '42b88241-5127-4e11-ae92-74ba32b9da76']);
        
        currentTxs.forEach((tx) => {
          if (seedTxCodes.has(tx.code)) return; // Seed transactions already reflected in 16.000.000 base

          const amt = Number(tx.amount) || 0;
          if (tx.type === 'DEPOSIT' || tx.type === 'REFUND') {
            computedBalance += amt;
          } else if (tx.type === 'WITHDRAW' || tx.type === 'TRANSFER') {
            computedBalance = Math.max(0, computedBalance - amt);
          }
        });

        set({
          wallet: {
            walletcode,
            balance: computedBalance,
            currency: serverCurrency,
          },
          transactions: currentTxs,
        });
      },

      resetWallet: () => {
        set({
          wallet: DEFAULT_WALLET,
          transactions: DEFAULT_TRANSACTIONS,
          linkedWallets: DEFAULT_LINKED_WALLETS,
        });
      },
    }),
    {
      name: 'pchub-wallet-store',
    }
  )
);
