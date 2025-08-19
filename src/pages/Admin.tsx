import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading, { PageLoading } from '@/components/Loading';
import Modal, { ConfirmModal } from '@/components/Modal';
import AdminDashboard from '@/components/AdminDashboard';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Eye,
  Trash2,
  Plus,
  Calendar,
  Trophy,
  Target,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'player' | 'manager' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserActionsDropdownProps {
  user: User;
  onViewProfile: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onChangeRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function UserActionsDropdown({ 
  user, 
  onViewProfile, 
  onToggleStatus, 
  onChangeRole, 
  onDeleteUser,
  isOpen,
  onToggle 
}: UserActionsDropdownProps) {
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
                onViewProfile(user);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </button>
            
            <button
              onClick={() => {
                onToggleStatus(user);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              {user.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                onChangeRole(user);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Change Role
            </button>
            
            <div className="border-t border-gray-700 my-1"></div>
            
            <button
              onClick={() => {
                onDeleteUser(user);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, newRole: string) => void;
  isLoading: boolean;
}

function ChangeRoleModal({ isOpen, onClose, user, onSave, isLoading }: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedRole) {
      onSave(user.id, selectedRole);
    }
  };

  const roles = [
    { value: 'player', label: 'Player', description: 'Can participate in tournaments and join squads' },
    { value: 'manager', label: 'Tournament Manager', description: 'Can create and manage tournaments' },
    { value: 'admin', label: 'Administrator', description: 'Full platform access and user management' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change User Role" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-gray-300 mb-4">
            Changing role for: <span className="font-medium text-white">{user?.username}</span>
          </p>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-white font-medium">{role.label}</div>
                  <div className="text-sm text-gray-400">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Update Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Admin() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'reports'>('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTournaments: 0,
    activeSquads: 0
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock users data
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'player1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'player',
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            lastLogin: '2024-01-20T14:30:00Z'
          },
          {
            id: '2',
            username: 'manager1',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: 'manager',
            isActive: true,
            createdAt: '2024-01-10T09:00:00Z',
            lastLogin: '2024-01-19T16:45:00Z'
          },
          {
            id: '3',
            username: 'player2',
            firstName: 'Bob',
            lastName: 'Wilson',
            email: 'bob@example.com',
            role: 'player',
            isActive: false,
            createdAt: '2024-01-12T11:30:00Z'
          }
        ];
        
        setUsers(mockUsers);
        setStats({
          totalUsers: mockUsers.length,
          activeUsers: mockUsers.filter(u => u.isActive).length,
          totalTournaments: 5,
          activeSquads: 12
        });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (currentUser?.role !== 'admin') {
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
    return <PageLoading text="Loading admin panel..." />;
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewProfile = (user: User) => {
    // TODO: Navigate to user profile or show profile modal
    console.log('View profile for:', user.username);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      // TODO: API call to toggle user status
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, isActive: !u.isActive } : u
      ));
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmChangeRole = async (userId: string, newRole: string) => {
    setIsUpdating(true);
    try {
      // TODO: API call to change user role
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole as any } : u
      ));
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to change user role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      // TODO: API call to delete user
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900 text-red-300';
      case 'manager':
        return 'bg-purple-900 text-purple-300';
      case 'player':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage users, tournaments, and platform settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports & Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <AdminDashboard />
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
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
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900 rounded-lg mr-4">
                  <Trophy className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tournaments</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900 rounded-lg mr-4">
                  <Target className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Squads</p>
                  <p className="text-2xl font-bold text-white">{stats.activeSquads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* User Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="player">Players</option>
                <option value="manager">Managers</option>
                <option value="admin">Admins</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Button variant="ghost">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <UserActionsDropdown
                          user={user}
                          onViewProfile={handleViewProfile}
                          onToggleStatus={handleToggleStatus}
                          onChangeRole={handleChangeRole}
                          onDeleteUser={handleDeleteUser}
                          isOpen={openDropdown === user.id}
                          onToggle={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-700 rounded-lg">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Tournaments</h3>
                  <p className="text-gray-400 mb-4">Manage all tournaments</p>
                  <Button size="sm">Manage</Button>
                </div>
                
                <div className="text-center p-6 border border-gray-700 rounded-lg">
                  <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Squads</h3>
                  <p className="text-gray-400 mb-4">Manage all squads</p>
                  <Button size="sm">Manage</Button>
                </div>
                
                <div className="text-center p-6 border border-gray-700 rounded-lg">
                  <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Matches</h3>
                  <p className="text-gray-400 mb-4">Manage match results</p>
                  <Button size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Daily Active Users</span>
                    <span className="text-white font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tournament Registrations</span>
                    <span className="text-white font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Squad Formations</span>
                    <span className="text-white font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Matches Completed</span>
                    <span className="text-white font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="ghost">
                    Export User Data
                  </Button>
                  <Button className="w-full" variant="ghost">
                    Export Tournament Data
                  </Button>
                  <Button className="w-full" variant="ghost">
                    Export Squad Data
                  </Button>
                  <Button className="w-full" variant="ghost">
                    Export System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>

    {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={confirmChangeRole}
        isLoading={isUpdating}
      />

      {/* Toggle Status Confirmation */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmToggleStatus}
        title={`${selectedUser?.isActive ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${selectedUser?.isActive ? 'deactivate' : 'activate'} ${selectedUser?.username}?`}
        confirmText={selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        variant={selectedUser?.isActive ? 'danger' : 'primary'}
        loading={isUpdating}
      />

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.username}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        loading={isUpdating}
      />
    </div>
  );
}