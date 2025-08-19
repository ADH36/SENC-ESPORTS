import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import { 
  Trophy, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign,
  MapPin,
  Eye,
  UserPlus
} from 'lucide-react';

export default function Tournaments() {
  const { 
    tournaments, 
    fetchTournaments, 
    registerForTournament,
    isLoading, 
    pagination 
  } = useTournamentStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [filters, setFilters] = useState({
    search: '',
    game: '',
    status: '',
    format: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTournaments({ page: 1, limit: 12, ...filters });
  }, [fetchTournaments, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async (tournamentId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }
    
    try {
      await registerForTournament(tournamentId, {
        registrationType: 'individual',
        squadId: undefined
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !isLoading) {
      fetchTournaments({ 
        page: pagination.currentPage + 1, 
        limit: