import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, Shield, Calendar, Award } from 'lucide-react';
import Button from '@/components/Button';
import Card, { CardContent } from '@/components/Card';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Trophy,
      title: 'Tournament Management',
      description: 'Create and manage esports tournaments with automated bracket generation and real-time updates.'
    },
    {
      icon: Users,
      title: 'Squad System',
      description: 'Form teams, invite members, and compete together in squad-based tournaments.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about match results, tournament progress, and team activities.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Advanced security measures to protect your data and ensure fair competition.'
    },
    {
      icon: Calendar,
      title: 'Event Scheduling',
      description: 'Schedule matches and tournaments with automatic timezone handling and reminders.'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Track your progress, earn achievements, and climb the leaderboards.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-blue-400">SENC Esports</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate platform for competitive gaming. Create tournaments, form squads, and compete at the highest level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/tournaments">
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                      View Tournaments
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/tournaments">
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                      Browse Tournaments
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose SENC Esports?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built by gamers, for gamers. Our platform provides everything you need for competitive esports.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover className="h-full">
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">1000+</div>
              <div className="text-xl text-gray-300">Active Players</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-xl text-gray-300">Tournaments Hosted</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">$10K+</div>
              <div className="text-xl text-gray-300">Prize Pool Distributed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Competing?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of players already competing on SENC Esports. Create your account and start your journey today.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Create Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}