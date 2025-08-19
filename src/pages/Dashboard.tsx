import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTournamentStore } from '@/stores/tournamentStore';
import { useSquadStore } from '@/stores/squadStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading from '@/components/Loading';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Award, 
  Plus, 
  Eye,
  Clock,
  MapPin
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { tournaments, fetchTournaments, isLoading: tournamentsLoading } = useTournamentStore();
  const { squads, fetchUserSquads, isLoading: squadsLoading } = useSquadStore();
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalSquads: 0,
    upcomingMatches: 0
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTournaments({ page: 1, limit: 5 });
      fetchUserSquads();
    }
  }, [isAuthenticated, user, fetchTournaments, fetchUserSquads]);

  useEffect(() => {
    // Calculate stats from fetched data
    const activeTournaments = tournaments.filter(t => t.status === 'active').length;
    setStats({
      totalTournaments: tournaments.length,
      activeTournaments,
      totalSquads: squads.length,
      upcomingMatches: 0 // This would come from matches API
    });
  }, [tournaments, squads]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card>
          <CardContent>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
              <p className="text-gray-400 mb-6">Please log in to access your dashboard.</p>
              <Link to="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Browse Tournaments',
      description: 'Find and join tournaments',
      icon: Trophy,
      href: '/tournaments',
      color: 'bg-blue-600'
    },
    {
      title: 'Manage Squads',
      description: 'Create or join a squad',
      icon: Users,
      href: '/squads',
      color: 'bg-green-600'
    },
    ...(user?.role === 'manager' || user?.role === 'admin' ? [{
      title: 'Create Tournament',
      description: 'Organize a new tournament',
      icon: Plus,
      href: '/manage',
      color: 'bg-purple-600'
    }] : []),
    ...(user?.role === 'admin' ? [{
      title: 'Admin Panel',
      description: 'Manage platform settings',
      icon: Award,
      href: '/admin',
      color: 'bg-red-600'
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening in your esports journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalTournaments}</p>
                  <p className="text-gray-400 text-sm">Total Tournaments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.activeTournaments}</p>
                  <p className="text-gray-400 text-sm">Active Tournaments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalSquads}</p>
                  <p className="text-gray-400 text-sm">Your Squads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.upcomingMatches}</p>
                  <p className="text-gray-400 text-sm">Upcoming Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        to={action.href}
                        className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{action.title}</h4>
                          <p className="text-sm text-gray-400">{action.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tournaments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tournaments</CardTitle>
                  <Link to="/tournaments">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {tournamentsLoading ? (
                  <Loading text="Loading tournaments..." />
                ) : tournaments.length > 0 ? (
                  <div className="space-y-4">
                    {tournaments.slice(0, 5).map((tournament) => (
                      <div
                        key={tournament.id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{tournament.name}</h4>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="mr-4">{tournament.game}</span>
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.status === 'active' ? 'bg-green-900 text-green-300' :
                            tournament.status === 'upcoming' ? 'bg-blue-900 text-blue-300' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {tournament.status}
                          </span>
                          <Link to={`/tournaments/${tournament.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No tournaments found</p>
                    <Link to="/tournaments">
                      <Button>Browse Tournaments</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Squads */}
        {squads.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Squads</CardTitle>
                  <Link to="/squads">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {squadsLoading ? (
                  <Loading text="Loading squads..." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {squads.slice(0, 3).map((squad) => (
                      <div
                        key={squad.id}
                        className="p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{squad.name}</h4>
                            <p className="text-sm text-gray-400">{squad.game}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {squad.memberCount || 0} members
                          </span>
                          <Link to={`/squads/${squad.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}