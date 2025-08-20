import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading from '@/components/Loading';
import { 
  FileText, 
  Youtube, 
  Eye, 
  EyeOff, 
  Calendar, 
  User,
  ExternalLink,
  Play,
  Trophy
} from 'lucide-react';

interface ContentItem {
  id: string;
  tournamentId: string;
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

interface TournamentContentProps {
  tournamentId: string;
  tournamentName: string;
}

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function BracketContent({ content, title }: { content: string; title: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-400" />
        {title}
      </h3>
      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function ContentItemCard({ item }: { item: ContentItem }) {
  const getEmbedTypeColor = (type: string) => {
    switch (type) {
      case 'highlight':
        return 'bg-yellow-900 text-yellow-300';
      case 'live_stream':
        return 'bg-red-900 text-red-300';
      case 'recap':
        return 'bg-blue-900 text-blue-300';
      case 'interview':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const getEmbedTypeIcon = (type: string) => {
    switch (type) {
      case 'live_stream':
        return <Play className="w-4 h-4" />;
      default:
        return <Youtube className="w-4 h-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center text-lg">
              {item.type === 'bracket' ? (
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
              ) : (
                <Youtube className="w-5 h-5 mr-2 text-red-400" />
              )}
              {item.title}
            </CardTitle>
            
            <div className="flex items-center space-x-3 mt-2">
              {item.type === 'youtube_embed' && item.embedType && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getEmbedTypeColor(item.embedType)}`}>
                  {getEmbedTypeIcon(item.embedType)}
                  <span className="ml-1">{item.embedType.replace('_', ' ')}</span>
                </span>
              )}
              
              <span className="flex items-center text-sm text-gray-400">
                <User className="w-4 h-4 mr-1" />
                {item.updatedBy}
              </span>
              
              <span className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {item.type === 'youtube_embed' && item.youtubeUrl && (
            <a
              href={item.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              YouTube
            </a>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {item.type === 'bracket' && item.content ? (
          <BracketContent content={item.content} title={item.title} />
        ) : item.type === 'youtube_embed' && item.youtubeVideoId ? (
          <div className="space-y-4">
            <YouTubeEmbed videoId={item.youtubeVideoId} title={item.title} />
            {item.content && (
              <div className="text-gray-300 text-sm leading-relaxed">
                {item.content}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>Content not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TournamentContent({ tournamentId, tournamentName }: TournamentContentProps) {
  const { user } = useAuthStore();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'bracket' | 'youtube_embed'>('all');

  useEffect(() => {
    fetchTournamentContent();
  }, [tournamentId]);

  const fetchTournamentContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/content/tournament/${tournamentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tournament content');
      }
      
      const data = await response.json();
      setContentItems(data.contentItems || []);
    } catch (error) {
      console.error('Failed to fetch tournament content:', error);
      // Fallback to mock data if API fails
      const mockContent: ContentItem[] = [
        {
          id: '1',
          tournamentId,
          type: 'bracket',
          title: 'Quarter Finals Bracket',
          content: `QUARTER FINALS\n\nMatch 1: Team Alpha vs Team Beta\nResult: Team Alpha wins 2-1\nDate: March 15, 2024\n\nMatch 2: Team Gamma vs Team Delta\nResult: Team Gamma wins 2-0\nDate: March 15, 2024\n\nMatch 3: Team Echo vs Team Foxtrot\nScheduled: March 16, 2024 at 2:00 PM\n\nMatch 4: Team Golf vs Team Hotel\nScheduled: March 16, 2024 at 4:00 PM\n\nSEMI FINALS\nTBD vs TBD\nScheduled: March 17, 2024`,
          isVisible: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-16T14:30:00Z',
          createdBy: 'admin',
          updatedBy: 'manager1'
        },
        {
          id: '2',
          tournamentId,
          type: 'youtube_embed',
          title: 'Championship Highlights',
          content: 'Watch the best moments from our championship matches! Featuring incredible plays, clutch moments, and victory celebrations.',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          youtubeVideoId: 'dQw4w9WgXcQ',
          embedType: 'highlight',
          isVisible: true,
          createdAt: '2024-01-17T09:00:00Z',
          updatedAt: '2024-01-17T09:00:00Z',
          createdBy: 'manager1',
          updatedBy: 'manager1'
        },
        {
          id: '3',
          tournamentId,
          type: 'youtube_embed',
          title: 'Live Stream - Finals',
          content: 'Join us live for the epic finals match! Don\'t miss the action as our top teams battle for the championship.',
          youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          youtubeVideoId: 'jNQXAC9IVRw',
          embedType: 'live_stream',
          isVisible: true,
          createdAt: '2024-01-18T12:00:00Z',
          updatedAt: '2024-01-18T12:00:00Z',
          createdBy: 'admin',
          updatedBy: 'admin'
        }
      ];
      
      setContentItems(mockContent);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = contentItems.filter(item => {
    if (!item.isVisible) {
      // Only show hidden content to managers and admins
      const canViewHidden = user?.role === 'admin' || user?.role === 'manager';
      if (!canViewHidden) return false;
    }
    
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const brackets = filteredContent.filter(item => item.type === 'bracket');
  const videos = filteredContent.filter(item => item.type === 'youtube_embed');

  if (isLoading) {
    return <Loading text="Loading tournament content..." />;
  }

  if (contentItems.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Content Available</h3>
          <p className="text-gray-400">
            Tournament content will appear here when available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          All Content ({filteredContent.length})
        </button>
        <button
          onClick={() => setActiveFilter('bracket')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'bracket'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Brackets ({brackets.length})
        </button>
        <button
          onClick={() => setActiveFilter('youtube_embed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'youtube_embed'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Videos ({videos.length})
        </button>
      </div>

      {/* Content Items */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              No {activeFilter === 'all' ? 'content' : activeFilter === 'bracket' ? 'brackets' : 'videos'} available
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredContent.map((item) => (
            <div key={item.id} className="relative">
              {!item.isVisible && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="flex items-center px-2 py-1 bg-gray-900 text-gray-300 rounded-full text-xs">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hidden
                  </span>
                </div>
              )}
              <ContentItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}