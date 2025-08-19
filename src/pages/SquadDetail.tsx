import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSquadStore } from '@/stores/squadStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading, { PageLoading } from '@/components/Loading';
import Modal, { ConfirmModal } from '@/components/Modal';
import Input from '@/components/Input';
import { 
  Users, 
  Crown, 
  MapPin, 
  Calendar,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Shield
} from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => void;
  isLoading: boolean;
}

function InviteMemberModal({ isOpen, onClose, onInvite, isLoading }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    onInvite(email.trim());
    setEmail('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="Enter player's email"
          fullWidth
          required
        />
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function SquadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentSquad, 
    fetchSquadById, 
    joinSquad,
    leaveSquad,
    removeMember,
    deleteSquad,
    isLoading 
  } = useSquadStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [squadMembers, setSquadMembers] = useState([]);

  useEffect(() => {
    if (id) {
      fetchSquadById(id);
      // TODO: Fetch squad members
    }
  }, [id, fetchSquadById]);

  if (isLoading || !currentSquad) {
    return <PageLoading text="Loading squad details..." />;
  }

  const isMember = squadMembers.some((member: any) => member.userId === user?.id);
  const isCaptain = currentSquad.captainId === user?.id;
  const canManage = isCaptain || user?.role === 'admin';

  const handleJoin = async () => {
    try {
      await joinSquad(currentSquad.id);
      // TODO: Refresh squad data
    } catch (error) {
      console.error('Failed to join squad:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveSquad(currentSquad.id);
      setShowLeaveModal(false);
      // TODO: Refresh squad data or redirect
    } catch (error) {
      console.error('Failed to leave squad:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await removeMember(currentSquad.id, memberToRemove.userId);
      setMemberToRemove(null);
      // TODO: Refresh squad data
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSquad(currentSquad.id);
      navigate('/squads');
    } catch (error) {
      console.error('Failed to delete squad:', error);
    }
  };

  const handleInvite = async (email: string) => {
    try {
      // TODO: Implement invite functionality
      console.log('Inviting:', email);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/squads">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Squads
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Squad Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {currentSquad.name}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{currentSquad.game}</span>
                      </div>
                      {currentSquad.isPrivate && (
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex space-x-2">
                      <Link to={`/squads/${currentSquad.id}/edit`}>
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
                        <Crown className="w-4 h-4 mr-2" />
                        <span>Captain</span>
                      </div>
                      <span className="text-white">
                        {currentSquad.captainName || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Members</span>
                      </div>
                      <span className="text-white">
                        {squadMembers.length}/{currentSquad.maxMembers || 5}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Created</span>
                      </div>
                      <span className="text-white">
                        {new Date(currentSquad.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>Status</span>
                      </div>
                      <span className="text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                
                {currentSquad.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {currentSquad.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Squad Members</CardTitle>
                  {canManage && (
                    <Button 
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {squadMembers.length > 0 ? (
                  <div className="space-y-4">
                    {squadMembers.map((member: any, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-sm font-medium">
                              {member.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="text-white font-medium mr-2">
                                {member.username}
                              </span>
                              {member.userId === currentSquad.captainId && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {member.firstName} {member.lastName}
                            </p>
                          </div>
                        </div>
                        
                        {canManage && member.userId !== currentSquad.captainId && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No members found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!isMember && isAuthenticated && user?.role === 'player' && !currentSquad.isPrivate && (
                    <Button fullWidth onClick={handleJoin}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Squad
                    </Button>
                  )}
                  
                  {isMember && !isCaptain && (
                    <Button 
                      variant="danger" 
                      fullWidth
                      onClick={() => setShowLeaveModal(true)}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave Squad
                    </Button>
                  )}
                  
                  {canManage && (
                    <Button 
                      fullWidth
                      onClick={() => setShowInviteModal(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Invite Players
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Squad Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Squad Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tournaments Played</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Wins</span>
                    <span className="text-green-400 font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Losses</span>
                    <span className="text-red-400 font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white font-medium">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        isLoading={isLoading}
      />

      {/* Leave Squad Confirmation */}
      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeave}
        title="Leave Squad"
        message="Are you sure you want to leave this squad? You'll need to be invited again to rejoin."
        confirmText="Leave Squad"
        variant="danger"
      />

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.username} from the squad?`}
        confirmText="Remove"
        variant="danger"
      />

      {/* Delete Squad Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Squad"
        message="Are you sure you want to delete this squad? This action cannot be undone and all members will be removed."
        confirmText="Delete Squad"
        variant="danger"
      />
    </div>
  );
}