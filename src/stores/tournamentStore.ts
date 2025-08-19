import { create } from 'zustand';
import axios from 'axios';

interface Tournament {
  id: string;
  name: string;
  game: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  prizePool?: number;
  rules?: string;
  registrationDeadline: string;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  managerId: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  registrationCount?: number;
}

interface TournamentRegistration {
  id: string;
  tournamentId: string;
  userId?: string;
  squadId?: string;
  registrationType: 'individual' | 'squad';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  participant?: {
    id: string;
    name: string;
    type: 'user' | 'squad';
  };
}

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  registrations: TournamentRegistration[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchTournaments: (page?: number, status?: string, game?: string) => Promise<void>;
  fetchTournamentById: (id: string) => Promise<void>;
  createTournament: (tournamentData: any) => Promise<Tournament>;
  updateTournament: (id: string, updateData: any) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  registerForTournament: (tournamentId: string, squadId?: string) => Promise<void>;
  fetchTournamentRegistrations: (tournamentId: string) => Promise<void>;
  updateRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => Promise<void>;
  clearError: () => void;
  setCurrentTournament: (tournament: Tournament | null) => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  currentTournament: null,
  registrations: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },

  fetchTournaments: async (page = 1, status, game) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (status) params.append('status', status);
      if (game) params.append('game', game);
      
      const response = await axios.get(`/api/tournaments?${params}`);
      const { tournaments, pagination } = response.data.data;
      
      set({
        tournaments,
        pagination,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch tournaments';
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  fetchTournamentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/tournaments/${id}`);
      const tournament = response.data.data.tournament;
      
      set({
        currentTournament: tournament,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch tournament';
      set({
        isLoading: false,
        error: errorMessage,
        currentTournament: null
      });
    }
  },

  createTournament: async (tournamentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/tournaments', tournamentData);
      const tournament = response.data.data.tournament;
      
      set((state) => ({
        tournaments: [tournament, ...state.tournaments],
        isLoading: false,
        error: null
      }));
      
      return tournament;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create tournament';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  updateTournament: async (id: string, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/tournaments/${id}`, updateData);
      const updatedTournament = response.data.data.tournament;
      
      set((state) => ({
        tournaments: state.tournaments.map(t => 
          t.id === id ? updatedTournament : t
        ),
        currentTournament: state.currentTournament?.id === id 
          ? updatedTournament 
          : state.currentTournament,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update tournament';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  deleteTournament: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/tournaments/${id}`);
      
      set((state) => ({
        tournaments: state.tournaments.filter(t => t.id !== id),
        currentTournament: state.currentTournament?.id === id 
          ? null 
          : state.currentTournament,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete tournament';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  registerForTournament: async (tournamentId: string, squadId?: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`/api/tournaments/${tournamentId}/register`, {
        squadId
      });
      
      // Refresh tournament data to get updated registration count
      await get().fetchTournamentById(tournamentId);
      
      set({
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to register for tournament';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  fetchTournamentRegistrations: async (tournamentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/tournaments/${tournamentId}/registrations`);
      const registrations = response.data.data.registrations;
      
      set({
        registrations,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch registrations';
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  updateRegistrationStatus: async (registrationId: string, status: 'approved' | 'rejected') => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`/api/tournaments/registrations/${registrationId}`, {
        status
      });
      
      set((state) => ({
        registrations: state.registrations.map(r => 
          r.id === registrationId ? { ...r, status } : r
        ),
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update registration status';
      set({
        isLoading: false,
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  setCurrentTournament: (tournament: Tournament | null) => {
    set({ currentTournament: tournament });
  },

  clearError: () => set({ error: null })
}));