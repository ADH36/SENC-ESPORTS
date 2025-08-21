import { create } from 'zustand';
import axios from 'axios';

interface Wallet {
  id: string;
  userId: string;
  walletId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'adjustment';
  amount: number;
  description: string;
  adminId?: string;
  createdAt: string;
  admin?: {
    username: string;
  };
}

interface WalletRequest {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    user: {
      username: string;
      firstName: string;
      lastName: string;
    };
  };
  admin?: {
    username: string;
  };
}

interface AdminWalletState {
  // Data
  wallets: Wallet[];
  requests: WalletRequest[];
  transactions: WalletTransaction[];
  selectedWallet: Wallet | null;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  
  // Error handling
  error: string | null;
  
  // Pagination
  walletsPagination: {
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
  transactionsPagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // Filters
  requestsFilter: {
    status: 'all' | 'pending' | 'approved' | 'rejected';
    type: 'all' | 'deposit' | 'withdrawal';
  };
  
  // Actions
  fetchWallets: (page?: number) => Promise<void>;
  fetchRequests: (page?: number, reset?: boolean) => Promise<void>;
  fetchTransactions: (walletId?: string, page?: number, reset?: boolean) => Promise<void>;
  fetchWalletByUserId: (userId: string) => Promise<void>;
  processRequest: (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => Promise<void>;
  adjustBalance: (userId: string, amount: number, description: string) => Promise<void>;
  createWallet: (userId: string) => Promise<void>;
  setRequestsFilter: (filter: Partial<AdminWalletState['requestsFilter']>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  wallets: [],
  requests: [],
  transactions: [],
  selectedWallet: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  walletsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  requestsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  transactionsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  requestsFilter: {
    status: 'all' as const,
    type: 'all' as const,
  },
};

export const useAdminWalletStore = create<AdminWalletState>((set, get) => ({
  ...initialState,
  
  fetchWallets: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/admin/wallet/wallets', {
        params: {
          page,
          limit: get().walletsPagination.limit,
        },
      });
      
      const { wallets, pagination } = response.data.data;
      
      set({
        wallets: page === 1 ? wallets : [...get().wallets, ...wallets],
        walletsPagination: {
          ...get().walletsPagination,
          page,
          total: pagination.total,
          hasMore: pagination.hasMore,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch wallets',
        isLoading: false,
      });
    }
  },
  
  fetchRequests: async (page = 1, reset = false) => {
    set({ isLoading: true, error: null });
    try {
      const { status, type } = get().requestsFilter;
      const response = await axios.get('/api/admin/wallet/requests', {
        params: {
          page,
          limit: get().requestsPagination.limit,
          status: status !== 'all' ? status : undefined,
          type: type !== 'all' ? type : undefined,
        },
      });
      
      const { requests, pagination } = response.data.data;
      
      set({
        requests: reset || page === 1 ? requests : [...get().requests, ...requests],
        requestsPagination: {
          ...get().requestsPagination,
          page,
          total: pagination.total,
          hasMore: pagination.hasMore,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch requests',
        isLoading: false,
      });
    }
  },
  
  fetchTransactions: async (walletId, page = 1, reset = false) => {
    set({ isLoading: true, error: null });
    try {
      const url = walletId 
        ? `/api/admin/wallet/users/${walletId}/transactions`
        : '/api/admin/wallet/transactions';
        
      const response = await axios.get(url, {
        params: {
          page,
          limit: get().transactionsPagination.limit,
        },
      });
      
      const { transactions, pagination } = response.data.data;
      
      set({
        transactions: reset || page === 1 ? transactions : [...get().transactions, ...transactions],
        transactionsPagination: {
          ...get().transactionsPagination,
          page,
          total: pagination.total,
          hasMore: pagination.hasMore,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },
  
  fetchWalletByUserId: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/admin/wallet/users/${userId}`);
      set({
        selectedWallet: response.data.data.wallet,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch wallet',
        isLoading: false,
      });
    }
  },
  
  processRequest: async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.post(`/api/admin/wallet/requests/${requestId}/process`, {
        action,
        adminNotes,
      });
      
      // Update the request in the list
      const updatedRequest = response.data.data.request;
      set({
        requests: get().requests.map(req => 
          req.id === requestId ? updatedRequest : req
        ),
        isProcessing: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || `Failed to ${action} request`,
        isProcessing: false,
      });
    }
  },
  
  adjustBalance: async (userId: string, amount: number, description: string) => {
    set({ isProcessing: true, error: null });
    try {
      await axios.post(`/api/admin/wallet/users/${userId}/adjust`, {
        amount,
        description,
      });
      
      // Refresh wallet data if it's currently selected
      if (get().selectedWallet?.userId === userId) {
        await get().fetchWalletByUserId(userId);
      }
      
      set({ isProcessing: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to adjust balance',
        isProcessing: false,
      });
    }
  },
  
  createWallet: async (userId: string) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await axios.post(`/api/admin/wallet/users/${userId}/create`);
      set({
        selectedWallet: response.data.data.wallet,
        isProcessing: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create wallet',
        isProcessing: false,
      });
    }
  },
  
  setRequestsFilter: (filter) => {
    set({
      requestsFilter: { ...get().requestsFilter, ...filter },
    });
    // Reset pagination and refetch
    set({
      requestsPagination: { ...get().requestsPagination, page: 1 },
    });
    get().fetchRequests(1, true);
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));