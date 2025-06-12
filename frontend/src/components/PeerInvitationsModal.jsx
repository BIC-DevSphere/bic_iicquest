import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  BookOpen,
  Check,
  X,
  Loader2,
  UserPlus,
  Send,
  Users,
  Calendar,
  MessageSquare,
  Code,
  Target,
  Zap
} from 'lucide-react';
import { 
  getReceivedInvitations, 
  getSentInvitations, 
  respondToInvitation, 
  cancelInvitation 
} from '@/services/peerLearningService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PeerInvitationsModal = ({ isOpen, onClose }) => {
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const [receivedData, sentData] = await Promise.all([
        getReceivedInvitations('pending'),
        getSentInvitations('pending')
      ]);
      setReceivedInvitations(receivedData.invitations || []);
      setSentInvitations(sentData.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setResponding(invitationId);
      const response = await respondToInvitation(invitationId, 'accept');
      
      toast.success('Invitation accepted! Starting peer session...');
      
      // Navigate to the level with peer session data
      const invitation = receivedInvitations.find(inv => inv._id === invitationId);
      if (invitation && response.session) {
        navigate(`/course/${invitation.course._id}/chapter/${invitation.chapter}/level/${invitation.level}`, {
          state: { 
            learningMode: 'peer',
            peerSession: response.session
          }
        });
        onClose();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setResponding(null);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      setResponding(invitationId);
      await respondToInvitation(invitationId, 'decline');
      
      toast.success('Invitation declined');
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    } finally {
      setResponding(null);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      setCancelling(invitationId);
      await cancelInvitation(invitationId);
      
      toast.success('Invitation cancelled');
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    } finally {
      setCancelling(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'collaborative_test':
        return <Code className="w-4 h-4" />;
      case 'discussion':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStudyModeIcon = (mode) => {
    switch (mode) {
      case 'guided':
        return <Target className="w-4 h-4" />;
      case 'discussion':
        return <MessageSquare className="w-4 h-4" />;
      case 'practice':
        return <Zap className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Peer Learning Invitations
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Received ({receivedInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({sentInvitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : receivedInvitations.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <UserPlus className="w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">No invitations received</h3>
                  <p className="text-sm text-muted-foreground">
                    When someone invites you to learn together, you'll see it here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedInvitations.map((invitation) => (
                  <Card key={invitation._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                            {invitation.inviter.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{invitation.inviter.fullName}</h3>
                              <p className="text-sm text-muted-foreground">@{invitation.inviter.username}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatTimeAgo(invitation.createdAt)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Wants to learn together</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="w-4 h-4" />
                              <span>{invitation.course.title}</span>
                            </div>
                          </div>

                          {invitation.message && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm italic">"{invitation.message}"</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(invitation.sessionType)}
                              <span className="capitalize">{invitation.sessionType.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStudyModeIcon(invitation.invitationData.studyMode)}
                              <span className="capitalize">{invitation.invitationData.studyMode} mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>~{invitation.invitationData.estimatedDuration}min</span>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={() => handleAcceptInvitation(invitation._id)}
                              disabled={responding === invitation._id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {responding === invitation._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-2" />
                              )}
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeclineInvitation(invitation._id)}
                              disabled={responding === invitation._id}
                            >
                              {responding === invitation._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : sentInvitations.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">No invitations sent</h3>
                  <p className="text-sm text-muted-foreground">
                    Find learning partners and send invitations to start collaborating.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sentInvitations.map((invitation) => (
                  <Card key={invitation._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {invitation.invitee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{invitation.invitee.fullName}</h3>
                              <p className="text-sm text-muted-foreground">@{invitation.invitee.username}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatTimeAgo(invitation.createdAt)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Invitation to learn together</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="w-4 h-4" />
                              <span>{invitation.course.title}</span>
                            </div>
                          </div>

                          {invitation.message && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm italic">"{invitation.message}"</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(invitation.sessionType)}
                              <span className="capitalize">{invitation.sessionType.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStudyModeIcon(invitation.invitationData.studyMode)}
                              <span className="capitalize">{invitation.invitationData.studyMode} mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>~{invitation.invitationData.estimatedDuration}min</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                              Waiting for {invitation.invitee.fullName} to respond...
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation._id)}
                              disabled={cancelling === invitation._id}
                            >
                              {cancelling === invitation._id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PeerInvitationsModal; 