import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/Card';
import {
  BookOpen,
  Settings,
  Trophy,
  Youtube,
  Users,
  Shield,
  Edit,
  Save,
  Eye,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function AdminGuide() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const guideSections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Content Management Overview',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            The Content Management System allows administrators to update tournament brackets, 
            embed YouTube videos, and manage all tournament-related content with proper permissions and audit trails.
          </p>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Key Features</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Visual bracket management with real-time updates</li>
                  <li>• YouTube video embedding with validation</li>
                  <li>• Role-based permission system</li>
                  <li>• Complete audit trail for all changes</li>
                  <li>• Version control and rollback capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: 'Permission System',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Admin Permissions
              </h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Full bracket editing access</li>
                <li>• YouTube content management</li>
                <li>• User role assignment</li>
                <li>• System configuration</li>
                <li>• Audit log access</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Manager Permissions
              </h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Tournament bracket updates</li>
                <li>• Match result entry</li>
                <li>• Schedule management</li>
                <li>• Limited content editing</li>
                <li>• View audit logs</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-300 mb-2">Important Notes</h4>
                <p className="text-sm text-amber-200">
                  All permission changes are logged and require admin approval. 
                  Users must be authenticated with valid JWT tokens to access management features.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'brackets',
      title: 'Updating Tournament Brackets',
      icon: <Trophy className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-white mb-3">Step-by-Step Bracket Update Process</h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h5 className="font-semibold text-blue-400 mb-2">Access Tournament Management</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    Navigate to the tournament detail page and click the "Manage Tournament" button (visible only to admins/managers).
                  </p>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-400">
                    URL: /tournaments/[tournament-id] → Click "Manage Tournament"
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h5 className="font-semibold text-blue-400 mb-2">Navigate to Content Management</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    In the admin panel, go to the "Content Management" section to view all tournament content.
                  </p>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-400">
                    Admin Panel → Content Management → Select Tournament
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h5 className="font-semibold text-blue-400 mb-2">Update Bracket Information</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    Click "Edit" on the bracket content item to update match results, schedules, and participant information.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-green-400">Match Results:</span> <span className="text-gray-300">Update scores and winners</span>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-yellow-400">Scheduling:</span> <span className="text-gray-300">Set match dates and times</span>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-blue-400">Participants:</span> <span className="text-gray-300">Add/remove teams or players</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h5 className="font-semibold text-green-400 mb-2">Save and Publish</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    Review your changes and click "Save" to update the bracket. Changes are immediately visible to all users.
                  </p>
                  <div className="bg-green-900/30 border border-green-500/30 rounded p-2 text-xs text-green-200">
                    ✓ All changes are automatically logged with timestamps and user information
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Bracket Update Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-400 mb-2">Match Management</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• Update match scores</li>
                  <li>• Set match winners</li>
                  <li>• Schedule upcoming matches</li>
                  <li>• Add match notes/comments</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-400 mb-2">Tournament Structure</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• Modify bracket format</li>
                  <li>• Add/remove participants</li>
                  <li>• Adjust seeding</li>
                  <li>• Update tournament rules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'youtube',
      title: 'YouTube Content Management',
      icon: <Youtube className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-white mb-3">Adding YouTube Videos</h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h5 className="font-semibold text-red-400 mb-2">Create New Content Item</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    In the Content Management section, click "Add New Content" and select "YouTube Embed".
                  </p>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-400">
                    Content Management → Add New Content → YouTube Embed
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h5 className="font-semibold text-red-400 mb-2">Enter YouTube URL</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    Paste the YouTube video URL. The system will automatically validate and extract the video ID.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-green-400">✓ Valid:</span> <span className="text-gray-300">https://www.youtube.com/watch?v=VIDEO_ID</span>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-green-400">✓ Valid:</span> <span className="text-gray-300">https://youtu.be/VIDEO_ID</span>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-xs">
                      <span className="text-red-400">✗ Invalid:</span> <span className="text-gray-300">Non-YouTube URLs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h5 className="font-semibold text-red-400 mb-2">Configure Display Settings</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    Set the title, description, and visibility options for the embedded video.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-700 rounded p-2">
                      <span className="text-yellow-400">Title:</span> <span className="text-gray-300">Display name</span>
                    </div>
                    <div className="bg-gray-700 rounded p-2">
                      <span className="text-blue-400">Visibility:</span> <span className="text-gray-300">Public/Private</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">YouTube URL Validation</h4>
                <p className="text-sm text-yellow-200 mb-2">
                  The system automatically validates YouTube URLs and extracts video IDs. 
                  Invalid URLs will be rejected with helpful error messages.
                </p>
                <div className="text-xs text-yellow-200">
                  Supported formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'audit',
      title: 'Audit Trail & Version Control',
      icon: <Eye className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Change Tracking
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Every change to tournament content is automatically logged with detailed information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-400 mb-2">Tracked Information</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• User who made the change</li>
                  <li>• Timestamp of modification</li>
                  <li>• Type of change (create/update/delete)</li>
                  <li>• Before and after values</li>
                  <li>• IP address and session info</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-green-400 mb-2">Available Actions</h5>
                <ul className="text-gray-300 space-y-1">
                  <li>• View change history</li>
                  <li>• Compare versions</li>
                  <li>• Rollback to previous version</li>
                  <li>• Export audit logs</li>
                  <li>• Filter by user/date/type</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Accessing Audit Logs
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Admin Panel → Audit Logs → Select Tournament</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Content Management → History Tab → View Changes</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Tournament Detail → Management → Audit Trail</span>
              </div>
            </div>
          </div>

          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-300 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>• Review changes before publishing</li>
                  <li>• Use descriptive commit messages</li>
                  <li>• Regularly backup audit logs</li>
                  <li>• Monitor for unauthorized changes</li>
                  <li>• Train staff on proper procedures</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
            Admin Content Management Guide
          </CardTitle>
          <p className="text-gray-400">
            Complete guide for managing tournament brackets, YouTube content, and system administration
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guideSections.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              return (
                <div key={section.id} className="border border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">{section.icon}</div>
                      <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-700">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminGuide;