import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal';
import { showToast } from '@/components/Toast';
import { 
  FileText, 
  Youtube, 
  History, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Trophy,
  ExternalLink
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  game: string;
  startDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface ContentItem {
  id: string;
  tournamentId: string;
  tournamentName: string;
  type: 'bracket' | 'youtube_embed';
  title: string;
  content?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  embedType?: 'highlight' | 'live_stream' | 'recap' | 'interview';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface AuditLog {
  id: string;
  contentItemId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, any>;
  performedBy: string;
  performedAt: string;
}

interface BracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  existingContent?: ContentItem;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function BracketModal({ isOpen, onClose, tournament, existingContent, onSave, isLoading }: BracketModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (existingContent) {
      setTitle(existingContent.title);
      setContent(existingContent.content || '');
      setIsVisible(existingContent.isVisible);
    } else {
      setTitle('');
      setContent('');
      setIsVisible(true);
    }
  }, [existingContent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      isVisible,
      type: 'bracket'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${existingContent ? 'Update' : 'Create'} Tournament Bracket`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tournament
          </label>
          <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
            {tournament?.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bracket Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter bracket title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bracket Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter bracket content, match results, or embed code..."
            rows={8}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isVisible" className="text-sm text-gray-300">
            Make bracket visible to public
          </label>
        </div>

        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {existingContent ? 'Update' : 'Create'} Bracket
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  existingContent?: ContentItem;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function YouTubeModal({ isOpen, onClose, tournament, existingContent, onSave, isLoading }: YouTubeModalProps) {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [embedType, setEmbedType] = useState<'highlight' | 'live_stream' | 'recap' | 'interview'>('highlight');
  const [isVisible, setIsVisible] = useState(true);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (existingContent) {
      setTitle(existingContent.title);
      setYoutubeUrl(existingContent.youtubeUrl || '');
      setDescription(existingContent.content || '');
      setEmbedType(existingContent.embedType || 'highlight');
      setIsVisible(existingContent.isVisible);
    } else {
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
      setEmbedType('highlight');
      setIsVisible(true);
    }
    setUrlError('');
  }, [existingContent, isOpen]);

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)[a-zA-Z0-9_-]{11}(&.*)?$/;
    return youtubeRegex.test(url);
  };

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url);
    if (url && !validateYouTubeUrl(url)) {
      setUrlError('Please enter a valid YouTube URL');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYouTubeUrl(youtubeUrl)) {
      setUrlError('Please enter a valid YouTube URL');
      return;
    }
    
    onSave({
      title,
      youtubeUrl,
      description,
      embedType,
      isVisible,
      type: 'youtube_embed'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${existingContent ? 'Update' : 'Add'} YouTube Video`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tournament
          </label>
          <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300">
            {tournament?.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube URL
          </label>
          <Input
            value={youtubeUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className={urlError ? 'border-red-500' : ''}
          />
          {urlError && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {urlError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Video Type
          </label>
          <select
            value={embedType}
            onChange={(e) => setEmbedType(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="highlight">Highlight</option>
            <option value="live_stream">Live Stream</option>
            <option value="recap">Recap</option>
            <option value="interview">Interview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isVisible" className="text-sm text-gray-300">
            Make video visible to public
          </label>
        </div>

        <div className="flex space-x-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!!urlError}>
            {existingContent ? 'Update' : 'Add'} Video
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ContentManagement() {
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [selectedTournamentObj, setSelectedTournamentObj] = useState<Tournament | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audit'>('content');

  // Check if user has content management permissions
  const canManageContent = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchContentItems = async (tournamentId?: string) => {
    try {
      const token = localStorage.getItem('token') || (user as any)?.token;
      const url = tournamentId ? `/api/content/tournament/${tournamentId}` : '/api/content';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch content items');
      }
      
      const data = await response.json();
      const contentItems = data.data?.contentItems || data.contentItems || [];
      
      const filtered = tournamentId 
        ? contentItems.filter((item: any) => item.tournamentId === tournamentId)
        : contentItems;
      
      setContentItems(filtered);
    } catch (error) {
      console.error('Failed to fetch content items:', error);
      showToast.apiError(error, 'Failed to load content');
      // Set empty array on error - no fallback to mock data
      setContentItems([]);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch tournaments
      const token = localStorage.getItem('token') || (user as any)?.token;
      const tournamentsResponse = await fetch('/api/tournaments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!tournamentsResponse.ok) {
        throw new Error('Failed to fetch tournaments');
      }
      
      const tournamentsData = await tournamentsResponse.json();
      setTournaments(tournamentsData.data?.tournaments || []);
      
      // Fetch content items separately
      await fetchContentItems();
    } catch (error) {
      console.error('Failed to fetch content data:', error);
      showToast.apiError(error, 'Failed to load tournaments');
      // Set empty array on error - no fallback to mock data
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };



  const filteredContent = contentItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tournamentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTournament = selectedTournament === 'all' || item.tournamentId === selectedTournament;
    const matchesType = contentTypeFilter === 'all' || item.type === contentTypeFilter;
    
    return matchesSearch && matchesTournament && matchesType;
  });

  const handleCreateBracket = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    setSelectedTournamentObj(tournament || null);
    setSelectedContent(null);
    setShowBracketModal(true);
  };

  const handleCreateYouTube = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    setSelectedTournamentObj(tournament || null);
    setSelectedContent(null);
    setShowYouTubeModal(true);
  };

  const handleEditContent = (content: ContentItem) => {
    const tournament = tournaments.find(t => t.id === content.tournamentId);
    setSelectedTournamentObj(tournament || null);
    setSelectedContent(content);
    
    if (content.type === 'bracket') {
      setShowBracketModal(true);
    } else {
      setShowYouTubeModal(true);
    }
  };

  const handleSaveContent = async (data: any) => {
    setIsUpdating(true);
    try {
      const endpoint = data.type === 'bracket' ? '/api/content/bracket' : '/api/content/youtube';
      const method = selectedContent ? 'PUT' : 'POST';
      const url = selectedContent ? `${endpoint}/${selectedContent.id}` : endpoint;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(user as any)?.token}`
        },
        body: JSON.stringify({
          ...data,
          tournamentId: selectedTournamentObj?.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
      // Refresh content after successful save
      await fetchContentItems();
      showToast.success(selectedContent ? 'Content updated successfully!' : 'Content created successfully!');
      
      setShowBracketModal(false);
      setShowYouTubeModal(false);
      setSelectedContent(null);
      setSelectedTournamentObj(null);
    } catch (error) {
      console.error('Failed to save content:', error);
      showToast.apiError(error, 'Failed to save content');
      // For demo purposes, still close modal on error
      setShowBracketModal(false);
      setShowYouTubeModal(false);
    } finally {
      setIsUpdating(false);
    }
  };



  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(user as any)?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      // Refresh content after successful delete
      await fetchContentItems();
      showToast.success('Content deleted successfully!');
    } catch (error) {
      console.error('Failed to delete content:', error);
      showToast.apiError(error, 'Failed to delete content');
      // For demo purposes, still remove from state on error
      setContentItems(prev => prev.filter(item => item.id !== contentId));
    }
  };

  const handleViewAudit = (contentId: string) => {
    // TODO: Fetch audit logs for specific content
    setShowAuditModal(true);
  };

  if (!canManageContent) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to manage content.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <Loading text="Loading content management..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Management</h2>
          <p className="text-gray-400">Manage tournament brackets and YouTube embeds</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedTournament}
            onChange={(e) => {
              setSelectedTournament(e.target.value);
              if (e.target.value !== 'all') {
                const tournament = tournaments.find(t => t.id === e.target.value);
                setSelectedTournamentObj(tournament || null);
              }
            }}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
          
          {selectedTournament !== 'all' && (
            <>
              <Button onClick={() => handleCreateBracket(selectedTournament)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Bracket
              </Button>
              <Button onClick={() => handleCreateYouTube(selectedTournament)}>
                <Youtube className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Content Items
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Audit Trail
          </button>
        </nav>
      </div>

      {activeTab === 'content' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={contentTypeFilter}
                  onChange={(e) => setContentTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="bracket">Brackets</option>
                  <option value="youtube_embed">YouTube Videos</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Content Items */}
          <Card>
            <CardHeader>
              <CardTitle>Content Items ({filteredContent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredContent.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No content items found</p>
                  {selectedTournament !== 'all' && (
                    <div className="mt-4 space-x-3">
                      <Button onClick={() => handleCreateBracket(selectedTournament)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Bracket
                      </Button>
                      <Button onClick={() => handleCreateYouTube(selectedTournament)}>
                        <Youtube className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <div key={item.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {item.type === 'bracket' ? (
                              <FileText className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Youtube className="w-5 h-5 text-red-400" />
                            )}
                            <h3 className="text-lg font-medium text-white">{item.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.isVisible 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-900 text-gray-300'
                            }`}>
                              {item.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 mb-2">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            {item.tournamentName}
                          </p>
                          
                          {item.type === 'youtube_embed' && item.youtubeUrl && (
                            <div className="flex items-center text-sm text-gray-400 mb-2">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              <a 
                                href={item.youtubeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-400"
                              >
                                View on YouTube
                              </a>
                              {item.embedType && (
                                <span className="ml-2 px-2 py-1 bg-gray-800 rounded text-xs">
                                  {item.embedType.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>
                              <User className="w-4 h-4 inline mr-1" />
                              Created by {item.createdBy}
                            </span>
                            <span>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditContent(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewAudit(item.id)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Audit trail functionality coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <BracketModal
        isOpen={showBracketModal}
        onClose={() => {
          setShowBracketModal(false);
          setSelectedContent(null);
          setSelectedTournamentObj(null);
        }}
        tournament={selectedTournamentObj}
        existingContent={selectedContent || undefined}
        onSave={handleSaveContent}
        isLoading={isUpdating}
      />

      <YouTubeModal
        isOpen={showYouTubeModal}
        onClose={() => {
          setShowYouTubeModal(false);
          setSelectedContent(null);
          setSelectedTournamentObj(null);
        }}
        tournament={selectedTournamentObj}
        existingContent={selectedContent || undefined}
        onSave={handleSaveContent}
        isLoading={isUpdating}
      />
    </div>
  );
}