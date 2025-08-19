import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTournamentStore } from '@/stores/tournamentStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading, { PageLoading } from '@/components/Loading';
import Modal, { ConfirmModal } from '@/components/Modal';
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Trophy,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  MapPin,
  DollarSign,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  game: string;
  format: string;
  maxParticipants: number;
  registrationCount: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isPublic: boolean;
  createdAt: string;
}

interface TournamentActionsDropdownProps {
  tournament: Tournament;
  onView: (tournament: Tournament) => void;
  onEdit: (tournament: Tournament) => void;
  onDelete: (tournament: Tournament) => void;
  onManageRegistrations: (tournament: Tournament) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function TournamentActionsDropdown({ 
  tournament, 
  onView, 
  onEdit, 
  onDelete, 
  onManageRegistrations,
  isOpen,
  onToggle 
}: TournamentActionsDropdownProps) {
  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={onToggle}>
        <MoreVertical className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onView(tournament);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
            
            <button
              onClick={() => {
                onEdit(tournament);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Tournament
            </button>
            
            <button
              onClick={() => {
                onManageRegistrations(tournament);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Manage Registrations
            </button>
            
            <div className="border-t border-gray-700 my-1"></div>
            
            <button
              onClick={() => {
                onDelete(tournament);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Tournament
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function CreateTournamentModal({ isOpen, onClose, onSave, isLoading }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    format: 'single-elimination',
    maxParticipants: 16,
    prizePool: 0,
    startDate: '',
    endDate: '',
    description: '',
    isPublic: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.game.trim()) {
      newErrors.game = 'Game is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = 'Must allow at least 2 participants';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      setFormData({
        name: '',
        game: '',
        format: 'single-elimination',
        maxParticipants: 16,
        prizePool: 0,
        startDate: '',
        endDate: '',
        description: '',
        isPublic: true
      });
      setErrors({});
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Tournament" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tournament Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Game"
            value={formData.game}
            onChange={(e) => handleChange('game', e.target.value)}
            error={errors.game}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Format
            </label>
            <select
              value={formData.format}
              onChange={(e) => handleChange('format', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single-elimination">Single Elimination</option>
              <option value="double-elimination">Double Elimination</option>
              <option value="round-robin">Round Robin</option>
              <option value="swiss">Swiss System</option>
            </select>
          </div>
          <Input
            label="Max Participants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value) || 0)}
            error={errors.maxParticipants}
            min={2}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            required
          />
          <Input
            label="End Date"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={errors.endDate}
            required
          />
        </div>
        
        <Input
          label="Prize Pool ($)"
          type="number"
          value={formData.prizePool}
          onChange={(e) => handleChange('prizePool', parseFloat(e.target.value) || 0)}
          min={0}
          step={0.01}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Tournament description..."
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleChange('isPublic', e.target.checked)}
            className="mr-2 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-gray-300">
            Make tournament public
          </label>
        </div>
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Create Tournament
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Manage() {
  const { user } = useAuthStore();
  const { tournaments, fetchTournaments, createTournament, deleteTournament, isLoading } = useTournamentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalRegistrations: 0,
    totalPrizePool: 0
  });

  // Mock tournaments data - replace with actual API calls
  const [mockTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Spring Championship',
      game: 'League of Legends',
      format: 'single-elimination',
      maxParticipants: 32,
      registrationCount: 24,
      prizePool: 5000,
      startDate: '2024-02-15T10:00:00Z',
      endDate: '2024-02-17T18:00:00Z',
      status: 'upcoming',
      isPublic: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Weekly Valorant Cup',
      game: 'Valorant',
      format: 'double-elimination',
      maxParticipants: 16,
      registrationCount: 16,
      prizePool: 1000,
      startDate: '2024-01-20T14:00:00Z',
      endDate: '2024-01-21T20:00:00Z',
      status: 'ongoing',
      isPublic: true,
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: '3',
      name: 'CS2 Masters',
      game: 'Counter-Strike 2',
      format: 'swiss',
      maxParticipants: 24,
      registrationCount: 20,
      prizePool: 2500,
      startDate: '2024-01-05T12:00:00Z',
      endDate: '2024-01-07T22:00:00Z',
      status: 'completed',
      isPublic: true,
      createdAt: '2024-01-01T08:00:00Z'
    }
  ]);

  useEffect(() => {
    // Calculate stats from mock data
    const totalRegistrations = mockTournaments.reduce((sum, t) => sum + t.registrationCount, 0);
    const totalPrizePool = mockTournaments.reduce((sum, t) => sum + t.prizePool, 0);
    const activeTournaments = mockTournaments.filter(t => t.status === 'upcoming' || t.status === 'ongoing').length;
    
    setStats({
      totalTournaments: mockTournaments.length,
      activeTournaments,
      totalRegistrations,
      totalPrizePool
    });
  }, [mockTournaments]);

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoading text="Loading management panel..." />;
  }

  const filteredTournaments = mockTournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesGame = gameFilter === 'all' || tournament.game === gameFilter;
    
    return matchesSearch && matchesStatus && matchesGame;
  });

  const uniqueGames = Array.from(new Set(mockTournaments.map(t => t.game)));

  const handleCreateTournament = async (data: any) => {
    setIsCreating(true);
    try {
      await createTournament(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create tournament:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!selectedTournament) return;
    
    setIsDeleting(true);
    try {
      await deleteTournament(selectedTournament.id);
      setShowDeleteModal(false);
      setSelectedTournament(null);
    } catch (error) {
      console.error('Failed to delete tournament:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewTournament = (tournament: Tournament) => {
    // TODO: Navigate to tournament details
    console.log('View tournament:', tournament.name);
  };

  const handleEditTournament = (tournament: Tournament) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit tournament:', tournament.name);
  };

  const handleManageRegistrations = (tournament: Tournament) => {
    // TODO: Open registrations management modal
    console.log('Manage registrations for:', tournament.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-900 text-blue-300';
      case 'ongoing':
        return 'bg-green-900 text-green-300';
      case 'completed':
        return 'bg-gray-900 text-gray-300';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tournament Management</h1>
            <p className="text-gray-400">Create and manage your tournaments</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900 rounded-lg mr-4">
                  <Trophy className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Tournaments</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-900 rounded-lg mr-4">
                  <Activity className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Tournaments</p>
                  <p className="text-2xl font-bold text-white">{stats.activeTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Registrations</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900 rounded-lg mr-4">
                  <DollarSign className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Prize Pool</p>
                  <p className="text-2xl font-bold text-white">${stats.totalPrizePool.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Management */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tournaments</CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Games</option>
                {uniqueGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
              
              <Button variant="ghost">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Tournaments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tournament</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Game</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Participants</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Prize Pool</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Start Date</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-medium">{tournament.name}</div>
                          <div className="text-sm text-gray-400">{tournament.format}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{tournament.game}</td>
                      <td className="py-4 px-4">
                        <div className="text-white">
                          {tournament.registrationCount}/{tournament.maxParticipants}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(tournament.registrationCount / tournament.maxParticipants) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        ${tournament.prizePool.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <TournamentActionsDropdown
                          tournament={tournament}
                          onView={handleViewTournament}
                          onEdit={handleEditTournament}
                          onDelete={(t) => {
                            setSelectedTournament(t);
                            setShowDeleteModal(true);
                          }}
                          onManageRegistrations={handleManageRegistrations}
                          isOpen={openDropdown === tournament.id}
                          onToggle={() => setOpenDropdown(openDropdown === tournament.id ? null : tournament.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTournaments.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No tournaments found</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Tournament
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTournament}
        isLoading={isCreating}
      />

      {/* Delete Tournament Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTournament(null);
        }}
        onConfirm={handleDeleteTournament}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${selectedTournament?.name}"? This action cannot be undone and all registrations will be lost.`}
        confirmText="Delete Tournament"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}