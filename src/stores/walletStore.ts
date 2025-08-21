import { create } from 'zustand';
import axios from 'axios';

interface Wallet {
  id: string;
  userId: string;
  walletId: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'adjustment' | 'tournament_fee' | 'tournament_prize';
  amount: number;
  balance_before: number;
  balance_after: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  reference_id?: string;
  processed_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface WalletRequest {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  user_notes?: string;
  admin_notes?: string;
  payment_method?: string;
  payment_details?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  requests: WalletRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  transactionsPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  requestsPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: (page?: number, limit?: number) => Promise<void>;
  fetchRequests: (page?: number, limit?: number) => Promise<void>;
  createDepositRequest: (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => Promise<void>;
  createWithdrawalRequest: (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  clearError: () => void;
  resetPagination: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallet: null,
  transactions: [],
  requests: [],
  isLoading: false,
  error: null,
  
  transactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  },
  requestsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  },

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet`);
      const { wallet } = response.data.data;
      
      set({
        wallet,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch wallet';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  fetchTransactions: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
        params: { page, limit }
      });
      const { transactions, pagination } = response.data.data;
      
      set({
        transactions: page === 1 ? transactions : [...get().transactions, ...transactions],
        transactionsPagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          hasMore: pagination.hasMore
        },
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch transactions';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  fetchRequests: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/requests`, {
        params: { page, limit }
      });
      const { requests, pagination } = response.data.data;
      
      set({
        requests: page === 1 ? requests : [...get().requests, ...requests],
        requestsPagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          hasMore: pagination.hasMore
        },
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch requests';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  createDepositRequest: async (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/requests`, {
        type: 'deposit',
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        user_notes: userNotes
      });
      
      const { request } = response.data.data;
      
      set({
        requests: [request, ...get().requests],
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create deposit request';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  createWithdrawalRequest: async (amount: number, paymentMethod: string, paymentDetails: string, userNotes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/requests`, {
        type: 'withdrawal',
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        user_notes: userNotes
      });
      
      const { request } = response.data.data;
      
      set({
        requests: [request, ...get().requests],
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create withdrawal request';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  cancelRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch(`${API_BASE_URL}/api/wallet/requests/${requestId}/cancel`);
      
      set({
        requests: get().requests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'cancelled' as const }
            : request
        ),
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel request';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
  
  resetPagination: () => set({
    transactionsPagination: {
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false
    },
    requestsPagination: {
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false
    }
  })
}));