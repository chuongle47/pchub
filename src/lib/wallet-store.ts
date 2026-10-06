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

      syncWithBackend: async (token?: string) => {
        try {
          const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token || '' }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            set((state) => ({
              wallet: {
                ...state.wallet,
                balance: json.data.balance,
                walletcode: json.data.walletcode || state.wallet.walletcode,
                currency: json.data.currency || 'VND',
              },
            }));
          }

          const txRes = await fetch('/api/wallet/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token || '' }),
          });
          const txJson = await txRes.json();
          if (txJson.success && Array.isArray(txJson.data) && txJson.data.length > 0) {
            const currentTxs = get().transactions;
            // Merge backend transactions with local ones without losing local checkout txs
            const combined = [...txJson.data];
            currentTxs.forEach((localTx) => {
              if (!combined.some((c) => c.code === localTx.code)) {
                combined.push(localTx);
              }
            });
            set({ transactions: combined });
          }
        } catch (err) {
          console.warn('[WalletStore] syncWithBackend warning:', err);
        }
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
