import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle, 
  Circle,
  Play,
  Crown,
  Calendar,
  MapPin
} from 'lucide-react';
import Button from './Button';
import Card, { CardContent } from './Card';
import Modal from './Modal';

interface Participant {
  id: string;
  name: string;
  type: 'player' | 'squad';
  avatar?: string;
  seed?: number;
}

interface Match {
  id: string;
  round: number;
  position: number;
  participant1?: Participant;
  participant2?: Participant;
  winner?: Participant;
  score1?: number;
  score2?: number;
  status: 'pending' | 'ongoing' | 'completed';
  scheduledTime?: string;
  completedTime?: string;
}

interface BracketProps {
  tournamentId: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  participants: Participant[];
  matches: Match[];
  isManager?: boolean;
  onUpdateMatch?: (matchId: string, data: any) => void;
  onScheduleMatch?: (matchId: string, time: string) => void;
}

interface MatchCardProps {
  match: Match;
  isManager?: boolean;
  onUpdate?: (matchId: string, data: any) => void;
  onSchedule?: (matchId: string, time: string) => void;
}

function MatchCard({ match, isManager, onUpdate, onSchedule }: MatchCardProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [score1, setScore1] = useState(match.score1 || 0);
  const [score2, setScore2] = useState(match.score2 || 0);
  const [scheduledTime, setScheduledTime] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-gray-600 bg-gray-800';
      case 'ongoing':
        return 'border-blue-500 bg-blue-900/20';
      case 'completed':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-gray-600 bg-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'ongoing':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleUpdateMatch = () => {
    if (onUpdate) {
      const winner = score1 > score2 ? match.participant1 : match.participant2;
      onUpdate(match.id, {
        score1,
        score2,
        winner,
        status: 'completed',
        completedTime: new Date().toISOString()
      });
    }
    setShowUpdateModal(false);
  };

  const handleScheduleMatch = () => {
    if (onSchedule && scheduledTime) {
      onSchedule(match.id, scheduledTime);
    }
    setShowScheduleModal(false);
  };

  const isWinner = (participant?: Participant) => {
    return match.winner && participant && match.winner.id === participant.id;
  };

  return (
    <>
      <div className={`border-2 rounded-lg p-3 min-w-[200px] ${getStatusColor(match.status)}`}>
        {/* Match Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {getStatusIcon(match.status)}
            <span className="text-xs text-gray-400 ml-1">
              Round {match.round}
            </span>
          </div>
          {match.scheduledTime && (
            <div className="flex items-center text-xs text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(match.scheduledTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="space-y-2">
          {/* Participant 1 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            isWinner(match.participant1) ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700'
          }`}>
            <div className="flex items-center">
              {isWinner(match.participant1) && (
                <Crown className="w-4 h-4 text-yellow-400 mr-2" />
              )}
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium">
                  {match.participant1?.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-sm text-white truncate">
                {match.participant1?.name || 'TBD'}
              </span>
            </div>
            {match.status === 'completed' && (
              <span className="text-sm font-medium text-white">
                {match.score1 || 0}
              </span>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center">
            <span className="text-xs text-gray-500">VS</span>
          </div>

          {/* Participant 2 */}
          <div className={`flex items-center justify-between p-2 rounded ${
            isWinner(match.participant2) ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700'
          }`}>
            <div className="flex items-center">
              {isWinner(match.participant2) && (
                <Crown className="w-4 h-4 text-yellow-400 mr-2" />
              )}
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium">
                  {match.participant2?.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-sm text-white truncate">
                {match.participant2?.name || 'TBD'}
              </span>
            </div>
            {match.status === 'completed' && (
              <span className="text-sm font-medium text-white">
                {match.score2 || 0}
              </span>
            )}
          </div>
        </div>

        {/* Manager Actions */}
        {isManager && match.participant1 && match.participant2 && (
          <div className="mt-3 space-y-2">
            {match.status === 'pending' && (
              <Button 
                size="sm" 
                fullWidth 
                variant="ghost"
                onClick={() => setShowScheduleModal(true)}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Schedule
              </Button>
            )}
            {(match.status === 'ongoing' || match.status === 'pending') && (
              <Button 
                size="sm" 
                fullWidth
                onClick={() => setShowUpdateModal(true)}
              >
                Update Score
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Update Match Modal */}
      <Modal 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
        title="Update Match Score"
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {match.participant1?.name} Score
              </label>
              <input
                type="number"
                value={score1}
                onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {match.participant2?.name} Score
              </label>
              <input
                type="number"
                value={score2}
                onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>
          </div>
          
          <div className="flex space-x-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMatch}>
              Update Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Match Modal */}
      <Modal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Match"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Match Time
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 justify-end pt-4">
            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMatch}>
              Schedule Match
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function SingleEliminationBracket({ matches, isManager, onUpdateMatch, onScheduleMatch }: {
  matches: Match[];
  isManager?: boolean;
  onUpdateMatch?: (matchId: string, data: any) => void;
  onScheduleMatch?: (matchId: string, time: string) => void;
}) {
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const maxRound = Math.max(...Object.keys(rounds).map(Number));

  return (
    <div className="flex space-x-8 overflow-x-auto pb-4">
      {Object.keys(rounds)
        .sort((a, b) => Number(a) - Number(b))
        .map((roundNum) => {
          const round = Number(roundNum);
          const roundMatches = rounds[round];
          const isFinalsRound = round === maxRound;
          
          return (
            <div key={round} className="flex flex-col space-y-4 min-w-[220px]">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isFinalsRound ? 'Finals' : `Round ${round}`}
                </h3>
                {isFinalsRound && (
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
                )}
              </div>
              
              <div className="space-y-4">
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isManager={isManager}
                    onUpdate={onUpdateMatch}
                    onSchedule={onScheduleMatch}
                  />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

function RoundRobinBracket({ matches, participants, isManager, onUpdateMatch, onScheduleMatch }: {
  matches: Match[];
  participants: Participant[];
  isManager?: boolean;
  onUpdateMatch?: (matchId: string, data: any) => void;
  onScheduleMatch?: (matchId: string, time: string) => void;
}) {
  // Calculate standings
  const standings = participants.map(participant => {
    const participantMatches = matches.filter(m => 
      m.participant1?.id === participant.id || m.participant2?.id === participant.id
    );
    
    let wins = 0;
    let losses = 0;
    let points = 0;
    
    participantMatches.forEach(match => {
      if (match.status === 'completed' && match.winner) {
        if (match.winner.id === participant.id) {
          wins++;
          points += 3; // 3 points for a win
        } else {
          losses++;
        }
      }
    });
    
    return {
      participant,
      wins,
      losses,
      points,
      played: wins + losses
    };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Standings Table */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Standings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-400">Rank</th>
                  <th className="text-left py-2 px-4 text-gray-400">Participant</th>
                  <th className="text-center py-2 px-4 text-gray-400">Played</th>
                  <th className="text-center py-2 px-4 text-gray-400">Wins</th>
                  <th className="text-center py-2 px-4 text-gray-400">Losses</th>
                  <th className="text-center py-2 px-4 text-gray-400">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, index) => (
                  <tr key={standing.participant.id} className="border-b border-gray-800">
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        {index === 0 && <Crown className="w-4 h-4 text-yellow-400 mr-2" />}
                        <span className="text-white font-medium">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium">
                            {standing.participant.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white">{standing.participant.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center text-gray-300">{standing.played}</td>
                    <td className="py-2 px-4 text-center text-green-400">{standing.wins}</td>
                    <td className="py-2 px-4 text-center text-red-400">{standing.losses}</td>
                    <td className="py-2 px-4 text-center text-white font-medium">{standing.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matches Grid */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-white mb-4">Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isManager={isManager}
                onUpdate={onUpdateMatch}
                onSchedule={onScheduleMatch}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Bracket({ 
  tournamentId, 
  format, 
  participants, 
  matches, 
  isManager, 
  onUpdateMatch, 
  onScheduleMatch 
}: BracketProps) {
  const [selectedFormat, setSelectedFormat] = useState(format);

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Participants Yet</h3>
          <p className="text-gray-400 mb-4">
            Participants will appear here once they register for the tournament.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Bracket Not Generated</h3>
          <p className="text-gray-400 mb-4">
            The tournament bracket will be generated when registration closes.
          </p>
          {isManager && (
            <Button>
              Generate Bracket
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bracket Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Bracket</h2>
          <p className="text-gray-400">
            {participants.length} participants • {format.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} format
          </p>
        </div>
        
        {isManager && (
          <div className="flex space-x-2">
            <Button variant="ghost">
              <MapPin className="w-4 h-4 mr-2" />
              Export Bracket
            </Button>
            <Button variant="ghost">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule All
            </Button>
          </div>
        )}
      </div>

      {/* Bracket Content */}
      <Card>
        <CardContent className="p-6">
          {format === 'single-elimination' && (
            <SingleEliminationBracket
              matches={matches}
              isManager={isManager}
              onUpdateMatch={onUpdateMatch}
              onScheduleMatch={onScheduleMatch}
            />
          )}
          
          {format === 'double-elimination' && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Double Elimination</h3>
              <p className="text-gray-400">Double elimination bracket coming soon...</p>
            </div>
          )}
          
          {format === 'round-robin' && (
            <RoundRobinBracket
              matches={matches}
              participants={participants}
              isManager={isManager}
              onUpdateMatch={onUpdateMatch}
              onScheduleMatch={onScheduleMatch}
            />
          )}
          
          {format === 'swiss' && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Swiss System</h3>
              <p className="text-gray-400">Swiss system bracket coming soon...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export type { Participant, Match, BracketProps };