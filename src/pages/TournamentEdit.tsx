import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading, { PageLoading } from '@/components/Loading';
import { showToast } from '@/components/Toast';
import { ArrowLeft, Save, X } from 'lucide-react';

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
  bannerUrl?: string;
}

const formatOptions = [
  { value: 'single_elimination', label: 'Single Elimination' },
  { value: 'double_elimination', label: 'Double Elimination' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'swiss', label: 'Swiss' }
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open for Registration' },
  { value: 'registration_closed', label: 'Registration Closed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function TournamentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    format: 'single_elimination' as Tournament['format'],
    maxParticipants: 16,
    prizePool: 0,
    rules: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    status: 'draft' as Tournament['status'],
    bannerUrl: ''
  });

  // Check authentication and permissions
  useEffect(() => {
    if (!isAuthenticated) {
      showToast.error('Authentication required');
      navigate('/login');
      return;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      showToast.error('Insufficient permissions. Only admins and managers can edit tournaments.');
      navigate('/manage');
      return;
    }
  }, [user, navigate, isAuthenticated]);

  // Fetch tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const token = accessToken;
        if (!token) {
          showToast.error('Authentication required');
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/tournaments/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tournament: ${response.statusText}`);
        }

        const data = await response.json();
        const tournament = data.data || data;
        
        setTournament(tournament);
        
        setFormData({
          name: tournament.name || '',
          game: tournament.game || '',
          format: tournament.format || 'single_elimination',
          maxParticipants: tournament.max_participants || 16,
          prizePool: tournament.prize_pool || 0,
          rules: tournament.rules || '',
          registrationDeadline: tournament.registration_deadline ? new Date(tournament.registration_deadline).toISOString().slice(0, 16) : '',
          startDate: tournament.start_date ? new Date(tournament.start_date).toISOString().slice(0, 16) : '',
          endDate: tournament.end_date ? new Date(tournament.end_date).toISOString().slice(0, 16) : '',
          status: tournament.status || 'draft',
          bannerUrl: tournament.bannerUrl || ''
        });
      } catch (error) {
        console.error('Error fetching tournament:', error);
        showToast.error('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast.error('Tournament name is required');
      return false;
    }
    
    if (!formData.game.trim()) {
      showToast.error('Game is required');
      return false;
    }
    
    if (formData.maxParticipants < 2) {
      showToast.error('Maximum participants must be at least 2');
      return false;
    }
    
    if (!formData.registrationDeadline) {
      showToast.error('Registration deadline is required');
      return false;
    }
    
    if (!formData.startDate) {
      showToast.error('Start date is required');
      return false;
    }
    
    if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
      showToast.error('Registration deadline must be before start date');
      return false;
    }
    
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      showToast.error('End date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      showToast.error('Tournament ID is required');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = accessToken;
      if (!token) {
        showToast.error('Authentication required');
        navigate('/login');
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        game: formData.game.trim(),
        format: formData.format,
        max_participants: Number(formData.maxParticipants),
        prize_pool: Number(formData.prizePool) || 0,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        registration_deadline: formData.registrationDeadline,
        rules: formData.rules?.trim() || null,
        status: formData.status
      };

      const response = await fetch(`http://localhost:3000/api/tournaments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      showToast.success('Tournament updated successfully! 🎉');
      
      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate(`/tournaments/${id}`);
      }, 1000);
    } catch (error) {
      console.error('Error updating tournament:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tournament';
      showToast.error(`Update failed: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoading text="Loading tournament..." />;
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Link to="/manage">
            <Button>Back to Management</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={`/tournaments/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tournament
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Tournament</h1>
              <p className="text-gray-400 mt-1">Update tournament details and settings</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tournament Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter tournament name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game *
                  </label>
                  <Input
                    type="text"
                    value={formData.game}
                    onChange={(e) => handleInputChange('game', e.target.value)}
                    placeholder="e.g., Valorant, CS2, League of Legends"
                    required
                  />
                </div>
              </div>

              {/* Format and Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tournament Format *
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {formatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Participants *
                  </label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    min="2"
                    max="1024"
                    required
                  />
                </div>
              </div>

              {/* Prize Pool and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prize Pool ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.prizePool}
                    onChange={(e) => handleInputChange('prizePool', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Deadline *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Banner Image URL
                </label>
                <Input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => handleInputChange('bannerUrl', e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Rules
                </label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  placeholder="Enter tournament rules and regulations..."
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <Link to={`/tournaments/${id}`}>
                  <Button variant="ghost" type="button">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <Loading size="sm" className="mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}