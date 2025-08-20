import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import TournamentEdit from './pages/TournamentEdit';
import Squads from './pages/Squads';
import SquadDetail from './pages/SquadDetail';
import SquadEdit from './pages/SquadEdit';
import Admin from './pages/Admin';
import Manage from './pages/Manage';
import Profile from './pages/Profile';
import AdminGuide from './components/AdminGuide';
import { PageLoading } from './components/Loading';

function App() {
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <PageLoading text="Initializing..." />;
  }

  return (
    <Router>
      <Toaster 
        position="top-right" 
        theme="dark" 
        richColors 
        closeButton 
        duration={4000}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/manage/tournaments/:id/edit" element={<TournamentEdit />} />
          <Route path="/squads" element={<Squads />} />
          <Route path="/squads/:id" element={<SquadDetail />} />
          <Route path="/squads/:id/edit" element={<SquadEdit />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/guide" element={<AdminGuide />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><div className="text-center"><h1 className="text-4xl font-bold mb-4">404</h1><p className="text-gray-400">Page not found</p></div></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
