import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Star,
  Clock,
  BookOpen,
  Send,
  Loader2,
  User,
  Trophy,
  MessageSquare,
  Code,
  Video,
  X,
  Sparkles,
  Zap,
  Target,
  CheckCircle
} from 'lucide-react';
import { getPeerMatches, sendPeerInvitation } from '@/services/peerLearningService';
import socketService from '@/services/socketService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PeerMatchingModal = ({ isOpen, onClose, courseId, chapterId, levelId, courseTitle }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [sessionType, setSessionType] = useState('content_learning');
  const [studyMode, setStudyMode] = useState('guided');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [waitingForAcceptance, setWaitingForAcceptance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && courseId && chapterId && levelId) {
      fetchPeerMatches();
      
      // Ensure WebSocket connection for peer matching
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token && !socketService.isSocketConnected()) {
        socketService.connect(token).then(() => {
          console.log('✅ Connected to WebSocket for peer matching');
          socketService.joinPeerLearning();
        }).catch(error => {
          console.error('❌ Failed to connect to WebSocket:', error);
          toast.error('Failed to connect to real-time service');
        });
      } else if (socketService.isSocketConnected()) {
        console.log('✅ WebSocket already connected, joining peer learning lobby');
        socketService.joinPeerLearning();
      }
    }
  }, [isOpen, courseId, chapterId, levelId]);

  useEffect(() => {
    if (isOpen) {
      // Set up WebSocket listener for invitation acceptance
      socketService.onInvitationAccepted((notification) => {
        console.log('🎉 Invitation accepted!', notification);
        
        setWaitingForAcceptance(false);
        toast.success(notification.message);
        
        // Navigate to the session as leader
        navigate(`/course/${notification.invitation.course._id}/chapter/${notification.invitation.chapter}/level/${notification.invitation.level}`, {
          state: { 
            learningMode: 'peer',
            peerSession: notification.session,
            isSessionLeader: true
          }
        });
        
        onClose();
      });
    }

    // Only cleanup when component unmounts, not when modal closes
    // This ensures WebSocket stays connected for invitation notifications
    return () => {
      // Only remove listeners if we're not waiting for acceptance
      if (!waitingForAcceptance) {
        socketService.removeListener('invitation-accepted-notification');
      }
    };
  }, [isOpen, navigate, onClose, waitingForAcceptance]);

  const startWaitingForAcceptance = () => {
    setWaitingForAcceptance(true);
    
    // Auto-stop waiting after 5 minutes
    setTimeout(() => {
      if (waitingForAcceptance) {
        setWaitingForAcceptance(false);
        toast.error('Invitation expired. The peer did not respond in time.');
      }
    }, 5 * 60 * 1000);
  };

  const fetchPeerMatches = async () => {
    try {
      setLoading(true);
      const data = await getPeerMatches(courseId, chapterId, levelId);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching peer matches:', error);
      toast.error('Failed to load peer matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedUser) return;

    try {
      setSendingInvitation(selectedUser._id);
      
      const invitationData = {
        inviteeId: selectedUser._id,
        courseId,
        chapterId,
        levelId,
        sessionType,
        message: invitationMessage,
        studyMode,
        estimatedDuration: 60,
        settings: {
          allowVoiceNotes: true,
          allowScreenShare: true,
          syncNavigation: true,
          collaborativeNotes: true
        }
      };

      await sendPeerInvitation(invitationData);
      
      toast.success(`Invitation sent to ${selectedUser.fullName}! Waiting for response...`);
      setShowInviteForm(false);
      setSelectedUser(null);
      setInvitationMessage('');
      
      // Start waiting for WebSocket notification
      startWaitingForAcceptance();
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
      setSendingInvitation(null);
    }
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const formatLastSeen = (lastAccessedAt) => {
    if (!lastAccessedAt) return 'Never';
    
    const diff = Date.now() - new Date(lastAccessedAt);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Find Learning Partners
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Connect with peers learning {courseTitle} at a similar level
          </p>
        </DialogHeader>

        {waitingForAcceptance ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-6 max-w-md">
              <div className="relative">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Invitation Sent!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your learning invitation has been sent. We're waiting for your peer to respond. 
                  You'll be automatically redirected when they accept the invitation.
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                <span>This may take a few minutes</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setWaitingForAcceptance(false);
                  socketService.removeListener('invitation-accepted-notification');
                  toast.info('Stopped waiting for response');
                }}
                className="w-full"
              >
                Cancel Waiting
              </Button>
            </div>
          </div>
        ) : !showInviteForm ? (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                  <p className="text-sm text-muted-foreground">Finding compatible learning partners...</p>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">No matches found</h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn't find any compatible peers for this level right now. 
                    Try again later or continue with solo learning.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {matches.length} compatible learning partner{matches.length !== 1 ? 's' : ''}
                  </p>
                  <Button variant="outline" size="sm" onClick={fetchPeerMatches}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid gap-4">
                  {matches.map((match) => (
                    <Card key={match.user._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                              {match.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">{match.user.fullName}</h3>
                                <p className="text-sm text-muted-foreground">@{match.user.username}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getCompatibilityColor(match.compatibility.score)} border-0`}>
                                  <Star className="w-3 h-3 mr-1" />
                                  {match.compatibility.score}% match
                                </Badge>
                                {match.isOnline && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600">Online</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {match.user.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {match.user.bio}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span>{match.progress.completedLevels} levels completed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>{Math.round(match.progress.totalTimeSpent / 60)}h studied</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-500" />
                                <span>Active {formatLastSeen(match.progress.lastAccessedAt)}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Compatibility factors:</p>
                              <div className="flex flex-wrap gap-1">
                                {match.compatibility.factors.map((factor, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex flex-wrap gap-1">
                                {match.technologies.slice(0, 3).map((tech, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {match.technologies.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{match.technologies.length - 3} more
                                  </Badge>
                                )}
                              </div>

                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(match.user);
                                  setShowInviteForm(true);
                                }}
                                disabled={sendingInvitation === match.user._id}
                              >
                                {sendingInvitation === match.user._id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4 mr-2" />
                                )}
                                Invite
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Invitation Form */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                  {selectedUser?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">Invite {selectedUser?.fullName}</h3>
                <p className="text-sm text-muted-foreground">Send a learning invitation</p>
              </div>
            </div>

            <Tabs value={sessionType} onValueChange={setSessionType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content_learning" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Content Learning
                </TabsTrigger>
                <TabsTrigger value="collaborative_test" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Collaborative Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content_learning" className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Study Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={studyMode === 'guided' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudyMode('guided')}
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Guided
                    </Button>
                    <Button
                      variant={studyMode === 'discussion' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudyMode('discussion')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discussion
                    </Button>
                    <Button
                      variant={studyMode === 'practice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStudyMode('practice')}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Practice
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collaborative_test" className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Collaborative Testing</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Work together to solve coding challenges, share ideas, and learn from each other's approaches.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-3">
              <label className="text-sm font-medium">Personal Message (Optional)</label>
              <Textarea
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                placeholder="Hi! I'd love to learn this topic together. Want to collaborate?"
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowInviteForm(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={sendingInvitation}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {sendingInvitation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Invitation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PeerMatchingModal; 