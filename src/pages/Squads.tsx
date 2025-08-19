import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSquadStore } from '@/stores/squadStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  UserPlus,
  Crown,
  MapPin
} from 'lucide-react';

interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function CreateSquadModal({ isOpen, onClose, onSubmit, isLoading }: CreateSquadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    isPrivate: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Squad name is required';
    }
    
    if (!formData.game) {
      newErrors.game = 'Game selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Squad" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Squad Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter squad name"
          fullWidth
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Game
          </label>
          <select
            name="game"
            value={formData.game}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a game...</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Valorant">Valorant</option>
            <option value="CS2">CS2</option>
            <option value="Dota 2">Dota 2</option>
            <option value="Overwatch 2">Overwatch 2</option>
            <option value="Rocket League">Rocket League</option>
          </select>
          {errors.game && (
            <p className="mt-1 text-sm text-red-400">{errors.game}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your squad..."
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
          />
          <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-300">
            Private squad (invite only)
          </label>
        </div>
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Create Squad
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Squads() {
  const { 
    squads, 
    fetchSquads, 
    createSquad,
    joinSquad,
    isLoading, 
    pagination 
  } = useSquadStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [filters, setFilters] = useState({
    search: '',
    game: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSquads(1, filters.game);
  }, [fetchSquads, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateSquad = async (data: any) => {
    try {
      await createSquad(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create squad:', error);
    }
  };

  const handleJoinSquad = async (squadId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      await joinSquad(squadId);
    } catch (error) {
      console.error('Failed to join squad:', error);
    }
  };

  const loadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchSquads(pagination.currentPage + 1, filters.game);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Squads</h1>
            <p className="text-gray-400">
              Find teammates and form competitive squads
            </p>
          </div>
          {isAuthenticated && user?.role === 'player' && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Squad
            </Button>
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
                    placeholder="Search squads..."
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
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option value="Rocket League">Rocket League</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Squad Grid */}
        {isLoading && squads.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading squads..." />
          </div>
        ) : squads.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {squads.map((squad) => (
                <Card key={squad.id} hover className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {squad.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{squad.game}</span>
                        </div>
                      </div>
                      {!squad.isRecruiting && (
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                          Not Recruiting
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {squad.description && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {squad.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Members</span>
                        </div>
                        <span className="text-white">
                          {squad.memberCount || 0}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Crown className="w-4 h-4 mr-1" />
                          <span>Captain</span>
                        </div>
                        <span className="text-white">
                          {squad.captain ? `${squad.captain.firstName} ${squad.captain.lastName}` : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Link to={`/squads/${squad.id}`} className="flex-1">
                        <Button variant="ghost" fullWidth>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {isAuthenticated && user?.role === 'player' && squad.isRecruiting && (
                        <Button
                          onClick={() => handleJoinSquad(squad.id)}
                          className="flex-1"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Join
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
                  Load More Squads
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No squads found</h3>
            <p className="text-gray-400 mb-6">
              {filters.search || filters.game
                ? 'Try adjusting your filters to find more squads.'
                : 'Be the first to create a squad!'}
            </p>
            {isAuthenticated && user?.role === 'player' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Squad
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Squad Modal */}
      <CreateSquadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSquad}
        isLoading={isLoading}
      />
    </div>
  );
}