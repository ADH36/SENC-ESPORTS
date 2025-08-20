import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTournamentStore } from '@/stores/tournamentStore';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import Loading from '@/components/Loading';
import Bracket, { Participant, Match } from '@/components/Bracket';
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
  type: 'bracket' | 'youtube_embed';
  title: string;
  content?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  embedType?: string;
  tournamentId: string;
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

function BracketContent({ content, title, tournamentId }: { content: string; title: string; tournamentId: string }) {
  const { currentTournament } = useTournamentStore();
  const [bracketData, setBracketData] = useState<{ participants: Participant[]; matches: Match[] } | null>(null);
  const [showTextFallback, setShowTextFallback] = useState(false);

  useEffect(() => {
    // Try to parse bracket data from content or fetch from API
    const fetchBracketData = async () => {
      try {
        // First try to get structured bracket data from API
        const response = await fetch(`/api/tournaments/${tournamentId}/bracket`);
        if (response.ok) {
          const data = await response.json();
          setBracketData({
            participants: data.participants || [],
            matches: data.matches || []
          });
          return;
        }
      } catch (error) {
        console.log('No structured bracket data available, using text fallback');
      }

      // If no structured data, try to parse from content or create mock data
      if (content && content.includes('Match')) {
        // Create mock participants and matches from text content
        const mockParticipants: Participant[] = [
          { id: '1', name: 'Team Alpha', type: 'squad', seed: 1 },
          { id: '2', name: 'Team Beta', type: 'squad', seed: 2 },
          { id: '3', name: 'Team Gamma', type: 'squad', seed: 3 },
          { id: '4', name: 'Team Delta', type: 'squad', seed: 4 },
          { id: '5', name: 'Team Echo', type: 'squad', seed: 5 },
          { id: '6', name: 'Team Foxtrot', type: 'squad', seed: 6 },
          { id: '7', name: 'Team Golf', type: 'squad', seed: 7 },
          { id: '8', name: 'Team Hotel', type: 'squad', seed: 8 }
        ];

        const mockMatches: Match[] = [
          {
            id: '1',
            round: 1,
            position: 1,
            participant1: mockParticipants[0],
            participant2: mockParticipants[1],
            winner: mockParticipants[0],
            score1: 2,
            score2: 1,
            status: 'completed'
          },
          {
            id: '2',
            round: 1,
            position: 2,
            participant1: mockParticipants[2],
            participant2: mockParticipants[3],
            winner: mockParticipants[2],
            score1: 2,
            score2: 0,
            status: 'completed'
          },
          {
            id: '3',
            round: 1,
            position: 3,
            participant1: mockParticipants[4],
            participant2: mockParticipants[5],
            status: 'pending',
            scheduledTime: '2024-03-16T14:00:00Z'
          },
          {
            id: '4',
            round: 1,
            position: 4,
            participant1: mockParticipants[6],
            participant2: mockParticipants[7],
            status: 'pending',
            scheduledTime: '2024-03-16T16:00:00Z'
          },
          {
            id: '5',
            round: 2,
            position: 1,
            participant1: mockParticipants[0],
            participant2: mockParticipants[2],
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

        setBracketData({ participants: mockParticipants, matches: mockMatches });
      } else {
        setShowTextFallback(true);
      }
    };

    fetchBracketData();
  }, [content, tournamentId]);

  if (showTextFallback || !bracketData) {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-blue-400" />
        {title}
      </h3>
      <Bracket
        tournamentId={tournamentId}
        format={currentTournament?.format || 'single_elimination'}
        participants={bracketData.participants}
        matches={bracketData.matches}
        isManager={false}
      />
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
          <BracketContent content={item.content} title={item.title} tournamentId={item.tournamentId} />
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
      // Mock data for demonstration
      const mockContent: ContentItem[] = [
        {
          id: '1',
          type: 'bracket',
          title: 'Tournament Bracket',
          content: `Round 1:
Match 1: Team Alpha vs Team Beta - Winner: Team Alpha (2-1)
Match 2: Team Gamma vs Team Delta - Winner: Team Gamma (2-0)
Match 3: Team Echo vs Team Foxtrot - Scheduled: March 15, 2:00 PM
Match 4: Team Golf vs Team Hotel - Scheduled: March 15, 4:00 PM

Semifinals:
Match 5: Team Alpha vs Team Gamma - Pending
Match 6: Winner of Match 3 vs Winner of Match 4 - Pending

Finals:
Match 7: Winner of Match 5 vs Winner of Match 6 - Pending`,
          tournamentId: tournamentId,
          isVisible: true,
          createdAt: '2024-03-10T10:00:00Z',
          updatedAt: '2024-03-10T10:00:00Z',
          createdBy: 'admin',
          updatedBy: 'admin'
        },
        {
          id: '2',
          type: 'youtube_embed',
          title: 'Tournament Highlights',
          youtubeVideoId: 'dQw4w9WgXcQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          embedType: 'highlight',
          tournamentId: tournamentId,
          isVisible: true,
          createdAt: '2024-03-10T11:00:00Z',
          updatedAt: '2024-03-10T11:00:00Z',
          createdBy: 'admin',
          updatedBy: 'admin'
        },
        {
          id: '3',
          type: 'youtube_embed',
          title: 'Live Stream',
          youtubeVideoId: 'jNQXAC9IVRw',
          youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
          embedType: 'live_stream',
          tournamentId: tournamentId,
          isVisible: true,
          createdAt: '2024-03-10T12:00:00Z',
          updatedAt: '2024-03-10T12:00:00Z',
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