import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import axios from 'axios';
import {
  Activity,
  Settings,
  Database,
  Shield,
  Bell,
  Mail,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Download,
  Upload,
  MemoryStick
} from 'lucide-react';

interface SystemStats {
  serverUptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage?: number;
  activeConnections: number;
  totalRequests?: number;
  errorRate?: number;
  timestamp?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

function SystemSettingsModal({ isOpen, onClose, onSave }: SystemSettingsModalProps) {
  const [settings, setSettings] = useState({
    siteName: 'SENC Esports',
    maintenanceMode: false,
    registrationEnabled: true,
    tournamentCreationEnabled: true,
    maxTournamentParticipants: 64,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Settings" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
          />
          
          <Input
            label="Max Tournament Participants"
            type="number"
            value={settings.maxTournamentParticipants}
            onChange={(e) => setSettings(prev => ({ ...prev, maxTournamentParticipants: parseInt(e.target.value) }))}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-400">Temporarily disable site access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">User Registration</h3>
              <p className="text-sm text-gray-400">Allow new users to register accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Tournament Creation</h3>
              <p className="text-sm text-gray-400">Allow managers to create new tournaments</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.tournamentCreationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, tournamentCreationEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-400">Send email notifications to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Automatic Backup</h3>
              <p className="text-sm text-gray-400">Automatically backup database</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    serverUptime: 'Loading...',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 32,
    activeConnections: 0,
    totalRequests: 89432,
    errorRate: 0.02
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      timestamp: '2024-01-20T15:30:00Z',
      user: 'admin',
      action: 'User Role Changed',
      details: 'Changed player1 role from player to manager',
      type: 'info'
    },
    {
      id: '2',
      timestamp: '2024-01-20T15:25:00Z',
      user: 'manager1',
      action: 'Tournament Created',
      details: 'Created tournament "Spring Championship 2024"',
      type: 'success'
    },
    {
      id: '3',
      timestamp: '2024-01-20T15:20:00Z',
      user: 'system',
      action: 'Database Backup',
      details: 'Automatic database backup completed successfully',
      type: 'success'
    },
    {
      id: '4',
      timestamp: '2024-01-20T15:15:00Z',
      user: 'player2',
      action: 'Failed Login',
      details: 'Multiple failed login attempts detected',
      type: 'warning'
    },
    {
      id: '5',
      timestamp: '2024-01-20T15:10:00Z',
      user: 'system',
      action: 'Server Error',
      details: 'Database connection timeout in tournament module',
      type: 'error'
    }
  ]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch system statistics from API
  const fetchSystemStats = async () => {
    try {
      setStatsError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/system/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSystemStats(prevStats => ({
          ...prevStats,
          serverUptime: response.data.data.serverUptime,
          cpuUsage: response.data.data.cpuUsage,
          memoryUsage: response.data.data.memoryUsage,
          activeConnections: response.data.data.activeConnections,
          timestamp: response.data.data.timestamp
        }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch system statistics');
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setStatsError(error instanceof Error ? error.message : 'Failed to fetch system statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load system stats on component mount and set up periodic refresh
  useEffect(() => {
    fetchSystemStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = (settings: any) => {
    console.log('Saving settings:', settings);
    // TODO: API call to save settings
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {statsError && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Failed to load system statistics</p>
                <p className="text-sm text-gray-400">{statsError}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchSystemStats}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Server Uptime</p>
                <p className="text-2xl font-bold text-white">
                  {isLoadingStats ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    systemStats.serverUptime
                  )}
                </p>
              </div>
              <Server className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold text-white">
                  {isLoadingStats ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    `${systemStats.cpuUsage}%`
                  )}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isLoadingStats ? 'bg-gray-600 animate-pulse' : 'bg-blue-500'
                }`}
                style={{ width: `${isLoadingStats ? 0 : systemStats.cpuUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold text-white">
                  {isLoadingStats ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    `${systemStats.memoryUsage}%`
                  )}
                </p>
              </div>
              <MemoryStick className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isLoadingStats ? 'bg-gray-600 animate-pulse' : 'bg-yellow-500'
                }`}
                style={{ width: `${isLoadingStats ? 0 : systemStats.memoryUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Connections</p>
                <p className="text-2xl font-bold text-white">
                  {isLoadingStats ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    systemStats.activeConnections.toLocaleString()
                  )}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              variant="ghost" 
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-6 h-6 mb-2" />
              <span className="text-sm">Settings</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
              <Database className="w-6 h-6 mb-2" />
              <span className="text-sm">Backup</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-sm">Security</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
              <Bell className="w-6 h-6 mb-2" />
              <span className="text-sm">Notifications</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Export Data</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center p-4 h-auto">
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm">Import Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div 
                key={log.id} 
                className={`border-l-4 pl-4 py-2 ${getLogColor(log.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getLogIcon(log.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{log.action}</span>
                        <span className="text-sm text-gray-400">by {log.user}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{log.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Settings Modal */}
      <SystemSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}