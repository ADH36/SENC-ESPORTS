import { create } from 'zustand';
import axios from 'axios';

export interface Squad {
  id: string;
  name: string;
  description?: string;
  game: string;
  captainId: string;
  isRecruiting: boolean;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  captain?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  memberCount?: number;
}

interface SquadMember {
  id: string;
  squadId: string;
  userId: string;
  role: 'captain' | 'member';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface SquadState {
  squads: Squad[];
  currentSquad: Squad | null;
  squadMembers: SquadMember[];
  userSquads: Squad[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  
  // Actions
  fetchSquads: (page?: number, game?: string) => Promise<void>;
  fetchSquadById: (id: string) => Promise<void>;
  fetchSquadMembers: (squadId: string) => Promise<void>;
  createSquad: (squadData: any) => Promise<Squad>;
  updateSquad: (id: string, updateData: any) => Promise<void>;
  deleteSquad: (id: string) => Promise<void>;
  joinSquad: (squadId: string) => Promise<void>;
  leaveSquad: (squadId: string) => Promise<void>;
  removeMember: (squadId: string, userId: string) => Promise<void>;
  fetchUserSquads: () => Promise<void>;
  clearError: () => void;
  setCurrentSquad: (squad: Squad | null) => void;
}

export const useSquadStore = create<SquadState>((set, get) => ({
  squads: [],
  currentSquad: null,
  squadMembers: [],
  userSquads: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    currentPage: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  },

  fetchSquads: async (page = 1, game) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (game) params.append('game', game);
      
      const response = await axios.get(`/api/squads?${params}`);
      const { squads, pagination: paginationData } = response.data.data;
      
      const updatedPagination = {
        ...paginationData,
        currentPage: page,
        hasMore: page < paginationData.totalPages
      };
      
      set({
        squads,
        pagination: updatedPagination,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch squads';
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  fetchSquadById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/squads/${id}`);
      const squad = response.data.data.squad;
      
      set({
        currentSquad: squad,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch squad';
      set({
        isLoading: false,
        error: errorMessage,
        currentSquad: null
      });
    }
  },

  fetchSquadMembers: async (squadId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/squads/${squadId}/members`);
      const members = response.data.data.members;
      
      set({
        squadMembers: members,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch squad members';
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  createSquad: async (squadData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/squads', squadData);
      const squad = response.data.data.squad;
      
      set((state) => ({
        squads: [squad, ...state.squads],
        userSquads: [squad, ...state.userSquads],
        isLoading: false,
        error: null
      }));
      
      return squad;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create squad';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  updateSquad: async (id: string, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/squads/${id}`, updateData);
      const updatedSquad = response.data.data.squad;
      
      set((state) => ({
        squads: state.squads.map(s => 
          s.id === id ? updatedSquad : s
        ),
        userSquads: state.userSquads.map(s => 
          s.id === id ? updatedSquad : s
        ),
        currentSquad: state.currentSquad?.id === id 
          ? updatedSquad 
          : state.currentSquad,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update squad';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  deleteSquad: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/squads/${id}`);
      
      set((state) => ({
        squads: state.squads.filter(s => s.id !== id),
        userSquads: state.userSquads.filter(s => s.id !== id),
        currentSquad: state.currentSquad?.id === id 
          ? null 
          : state.currentSquad,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete squad';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  joinSquad: async (squadId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/api/squads/${squadId}/join`);
      
      // Refresh squad data and user squads
      await Promise.all([
        get().fetchSquadById(squadId),
        get().fetchUserSquads()
      ]);
      
      set({
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to join squad';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  leaveSquad: async (squadId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/api/squads/${squadId}/leave`);
      
      // Refresh squad data and user squads
      await Promise.all([
        get().fetchSquadById(squadId),
        get().fetchUserSquads()
      ]);
      
      set({
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to leave squad';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  removeMember: async (squadId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/squads/${squadId}/members/${userId}`);
      
      // Refresh squad members
      await get().fetchSquadMembers(squadId);
      
      set({
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove member';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  fetchUserSquads: async () => {
    try {
      // This would need a specific endpoint for user's squads
      // For now, we'll filter from all squads based on user membership
      const response = await axios.get('/api/squads?limit=100');
      const { squads } = response.data.data;
      
      // In a real implementation, you'd have an endpoint that returns
      // only squads the user is a member of
      set({
        userSquads: squads
      });
    } catch (error: any) {
      console.error('Failed to fetch user squads:', error);
    }
  },

  setCurrentSquad: (squad: Squad | null) => {
    set({ currentSquad: squad });
  },

  clearError: () => set({ error: null })
}));