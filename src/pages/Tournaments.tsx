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
    fetchTournaments(1, filters.status, filters.game);
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
      await registerForTournament(tournamentId, undefined);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !isLoading) {
      fetchTournaments(
        pagination.currentPage + 1,
        filters.status,
        filters.game
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-900 text-blue-300';
      case 'active':
        return 'bg-green-900 text-green-300';
      case 'completed':
        return 'bg-gray-600 text-gray-300';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  const canRegister = (tournament: any) => {
    return isAuthenticated && 
           user?.role === 'player' && 
           tournament.status === 'upcoming' &&
           new Date(tournament.registrationDeadline) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
            <p className="text-gray-400">
              Discover and join competitive esports tournaments
            </p>
          </div>
          {isAuthenticated && (user?.role === 'manager' || user?.role === 'admin') && (
            <Link to="/manage">
              <Button className="mt-4 md:mt-0">
                <Trophy className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tournaments..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                    fullWidth
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Game
                  </label>
                  <select
                    value={filters.game}
                    onChange={(e) => handleFilterChange('game', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Games</option>
                    <option value="League of Legends">League of Legends</option>
                    <option value="Valorant">Valorant</option>
                    <option value="CS2">CS2</option>
                    <option value="Dota 2">Dota 2</option>
                    <option value="Overwatch 2">Overwatch 2</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    value={filters.format}
                    onChange={(e) => handleFilterChange('format', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Formats</option>
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double-elimination">Double Elimination</option>
                    <option value="round-robin">Round Robin</option>
                    <option value="swiss">Swiss</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Grid */}
        {isLoading && tournaments.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading tournaments..." />
          </div>
        ) : tournaments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} hover className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {tournament.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{tournament.game}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Start Date</span>
                        </div>
                        <span className="text-white">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Participants</span>
                        </div>
                        <span className="text-white">
                          {tournament.currentParticipants || 0}/{tournament.maxParticipants}
                        </span>
                      </div>
                      
                      {tournament.prizePool && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-400">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>Prize Pool</span>
                          </div>
                          <span className="text-green-400 font-medium">
                            ${tournament.prizePool.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Trophy className="w-4 h-4 mr-1" />
                          <span>Format</span>
                        </div>
                        <span className="text-white capitalize">
                          {tournament.format.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Link to={`/tournaments/${tournament.id}`} className="flex-1">
                        <Button variant="ghost" fullWidth>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {canRegister(tournament) && (
                        <Button
                          onClick={() => handleRegister(tournament.id)}
                          className="flex-1"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Register
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  loading={isLoading}
                  variant="ghost"
                  size="lg"
                >
                  Load More Tournaments
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
            <p className="text-gray-400 mb-6">
              {filters.search || filters.game || filters.status || filters.format
                ? 'Try adjusting your filters to find more tournaments.'
                : 'Be the first to create a tournament!'}
            </p>
            {isAuthenticated && (user?.role === 'manager' || user?.role === 'admin') && (
              <Link to="/manage">
                <Button>
                  <Trophy className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}