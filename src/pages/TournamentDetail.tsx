import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading, { PageLoading } from '@/components/Loading';
import Modal, { ConfirmModal } from '@/components/Modal';
import Input from '@/components/Input';
import Bracket, { Participant, Match } from '@/components/Bracket';
import TournamentContent from '@/components/TournamentContent';
import { 
  Calendar, 
  MapPin, 
  Users,
  Trophy,
  DollarSign,
  Clock,
  ArrowLeft,
  UserPlus,
  Edit,
  Trash2,
  Crown,
  Target,
  CheckCircle,
  Award
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { registrationType: 'individual' | 'squad'; squadId?: string }) => void;
  userSquads: any[];
}

function RegistrationModal({ isOpen, onClose, onConfirm, userSquads }: RegistrationModalProps) {
  const [registrationType, setRegistrationType] = useState<'individual' | 'squad'>('individual');
  const [selectedSquad, setSelectedSquad] = useState('');

  const handleSubmit = () => {
    onConfirm({
      registrationType,
      squadId: registrationType === 'squad' ? selectedSquad : undefined
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register for Tournament">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Registration Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="individual"
                checked={registrationType === 'individual'}
                onChange={(e) => setRegistrationType(e.target.value as 'individual')}
                className="mr-2"
              />
              <span className="text-white">Individual Registration</span>
            </label>
            {userSquads.length > 0 && (
              <label className="flex items-center">
                <input
                  type="radio"
                  value="squad"
                  checked={registrationType === 'squad'}
                  onChange={(e) => setRegistrationType(e.target.value as 'squad')}
                  className="mr-2"
                />
                <span className="text-white">Squad Registration</span>
              </label>
            )}
          </div>
        </div>

        {registrationType === 'squad' && userSquads.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Squad
            </label>
            <select
              value={selectedSquad}
              onChange={(e) => setSelectedSquad(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a squad...</option>
              {userSquads.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name} ({squad.game})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex space-x-3 justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={registrationType === 'squad' && !selectedSquad}
          >
            Register
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentTournament, 
    fetchTournamentById, 
    registerForTournament,
    deleteTournament,
    isLoading 
  } = useTournamentStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userSquads, setUserSquads] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'bracket' | 'participants'>('details');

  useEffect(() => {
    if (id) {
      fetchTournamentById(id);
      
      // Mock participants data
      const mockParticipants: Participant[] = [
        { id: '1', name: 'Team Alpha', type: 'squad', seed: 1 },
        { id: '2', name: 'Team Beta', type: 'squad', seed: 2 },
        { id: '3', name: 'Team Gamma', type: 'squad', seed: 3 },
        { id: '4', name: 'Team Delta', type: 'squad', seed: 4 },
        { id: '5', name: 'Player One', type: 'player', seed: 5 },
        { id: '6', name: 'Player Two', type: 'player', seed: 6 },
        { id: '7', name: 'Player Three', type: 'player', seed: 7 },
        { id: '8', name: 'Player Four', type: 'player', seed: 8 }
      ];
      
      // Mock matches data for single elimination
      const mockMatches: Match[] = [
        {
          id: '1',
          round: 1,
          position: 1,
          participant1: mockParticipants[0],
          participant2: mockParticipants[7],
          status: 'completed',
          winner: mockParticipants[0],
          score1: 2,
          score2: 1,
          completedTime: '2024-01-20T15:30:00Z'
        },
        {
          id: '2',
          round: 1,
          position: 2,
          participant1: mockParticipants[1],
          participant2: mockParticipants[6],
          status: 'completed',
          winner: mockParticipants[1],
          score1: 2,
          score2: 0,
          completedTime: '2024-01-20T16:00:00Z'
        },
        {
          id: '3',
          round: 1,
          position: 3,
          participant1: mockParticipants[2],
          participant2: mockParticipants[5],
          status: 'ongoing',
          scheduledTime: '2024-01-21T14:00:00Z'
        },
        {
          id: '4',
          round: 1,
          position: 4,
          participant1: mockParticipants[3],
          participant2: mockParticipants[4],
          status: 'pending',
          scheduledTime: '2024-01-21T15:00:00Z'
        },
        {
          id: '5',
          round: 2,
          position: 1,
          participant1: mockParticipants[0],
          participant2: mockParticipants[1],
          status: 'pending'
        },
        {
          id: '6',
          round: 2,
          position: 2,
          status: 'pending'
        },
        {
          id: '7',
          round: 3,
          position: 1,
          status: 'pending'
        }
      ];
      
      setParticipants(mockParticipants);
      setMatches(mockMatches);
    }
  }, [id, fetchTournamentById]);

  if (isLoading || !currentTournament) {
    return <PageLoading text="Loading tournament details..." />;
  }

  const canRegister = () => {
    return isAuthenticated && 
           user?.role === 'player' && 
           currentTournament.status === 'open' &&
           new Date(currentTournament.registrationDeadline) > new Date();
  };

  const canManage = () => {
    return isAuthenticated && 
           (user?.role === 'admin' || 
            (user?.role === 'manager' && currentTournament.managerId === user.id));
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

  const handleRegister = async (data: { registrationType: 'individual' | 'squad'; squadId?: string }) => {
    try {
      await registerForTournament(currentTournament.id, data.squadId);
      // TODO: Refresh registrations
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTournament(currentTournament.id);
      navigate('/tournaments');
    } catch (error) {
      console.error('Failed to delete tournament:', error);
    }
  };

  const handleUpdateMatch = async (matchId: string, data: any) => {
    try {
      // TODO: API call to update match
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, ...data } : match
      ));
      console.log('Match updated:', matchId, data);
    } catch (error) {
      console.error('Failed to update match:', error);
    }
  };

  const handleScheduleMatch = async (matchId: string, time: string) => {
    try {
      // TODO: API call to schedule match
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, scheduledTime: time } : match
      ));
      console.log('Match scheduled:', matchId, time);
    } catch (error) {
      console.error('Failed to schedule match:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/tournaments">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bracket'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Participants ({participants.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tournament Info */}
              <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {currentTournament.name}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{currentTournament.game}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentTournament.status)}`}>
                        {currentTournament.status}
                      </span>
                    </div>
                  </div>
                  {canManage() && (
                    <div className="flex space-x-2">
                      <Link to={`/manage/tournaments/${currentTournament.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Start Date</span>
                      </div>
                      <span className="text-white">
                        {new Date(currentTournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Registration Deadline</span>
                      </div>
                      <span className="text-white">
                        {new Date(currentTournament.registrationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Trophy className="w-4 h-4 mr-2" />
                        <span>Format</span>
                      </div>
                      <span className="text-white capitalize">
                        {currentTournament.format.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Participants</span>
                      </div>
                      <span className="text-white">
                        {currentTournament.currentParticipants || 0}/{currentTournament.maxParticipants}
                      </span>
                    </div>
                    
                    {currentTournament.prizePool && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>Prize Pool</span>
                        </div>
                        <span className="text-green-400 font-medium">
                          ${currentTournament.prizePool.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Target className="w-4 h-4 mr-2" />
                        <span>Entry Fee</span>
                      </div>
                      <span className="text-white">
                        {currentTournament.prizePool ? `$${currentTournament.prizePool}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {currentTournament.rules && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Rules</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {currentTournament.rules}
                    </p>
                  </div>
                )}
                
                {currentTournament.rules && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Rules</h3>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {currentTournament.rules}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
            {/* Registration Card */}
            {canRegister() && (
              <Card>
                <CardHeader>
                  <CardTitle>Register Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Join this tournament and compete for glory!
                  </p>
                  <Button 
                    fullWidth
                    onClick={() => setShowRegistrationModal(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                {registrations.length > 0 ? (
                  <div className="space-y-3">
                    {registrations.slice(0, 10).map((registration: any, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium">
                              {registration.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white">{registration.username}</span>
                        </div>
                        {registration.type === 'squad' && (
                          <span className="text-xs text-gray-400">Squad</span>
                        )}
                      </div>
                    ))}
                    {registrations.length > 10 && (
                      <p className="text-sm text-gray-400 text-center pt-2">
                        +{registrations.length - 10} more participants
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No participants yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tournament Manager */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {currentTournament.manager ? `${currentTournament.manager.firstName} ${currentTournament.manager.lastName}` : 'Tournament Manager'}
                    </p>
                    <p className="text-sm text-gray-400">Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Tournament Content</h3>
              <p className="text-gray-400 text-sm">
                Brackets, highlights, and live streams
              </p>
            </div>
            
            <TournamentContent 
              tournamentId={id!} 
              tournamentName={currentTournament?.name || 'Tournament'}
            />
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Participants</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{participant.name}</h3>
                          <span className="text-sm text-gray-400">#{participant.seed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${
                            participant.type === 'squad' 
                              ? 'bg-blue-900 text-blue-300' 
                              : 'bg-green-900 text-green-300'
                          }`}>
                            {participant.type === 'squad' ? 'Squad' : 'Player'}
                          </span>
                          {participant.type === 'squad' && (
                            <Users className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Participants Yet</h3>
                    <p className="text-gray-400">
                      Participants will appear here once registration begins.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onConfirm={handleRegister}
        userSquads={userSquads}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}