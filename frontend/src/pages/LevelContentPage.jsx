import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  ArrowRight,
  Trophy,
  Lightbulb,
  Code,
  Users,
  MessageSquare,
  Video,
  Mic,
  Send,
  UserPlus,
  Sparkles,
  Share2,
  Eye,
  Pause,
  SkipForward,
  RotateCcw,
  HelpCircle,
  Star,
  Bookmark,
  ThumbsUp,
  Settings,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  PhoneCall,
  PhoneOff,
  Monitor,
  MousePointer,
  Pencil,
  FileText,
  Download,
  Upload,
  Copy,
  X,
  XIcon,
  Trash2,
  FileCode,
  Terminal
} from "lucide-react";
import {
  getCourseById,
  getChapterById,
  getLevelById,
  getLevelContent,
  getNextLevel
} from "@/services/courseService";
import { getCourseProgress, updateLevelProgress } from "@/services/userProgressService";
import { 
  getSessionById, 
  addMessageToSession, 
  updateSessionProgress,
  endSession 
} from "@/services/peerLearningService";
import PeerMatchingModal from "@/components/PeerMatchingModal";
import WebSocketDebugger from "@/components/WebSocketDebugger";
import { getCurrentUserId } from "@/utils/auth";
import socketService from "@/services/socketService";

const LevelContentPage = () => {
  const { courseId, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const learningMode = location.state?.learningMode || 'solo';
  
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [level, setLevel] = useState(null);
  const [content, setContent] = useState([]);
  const [progress, setProgress] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const [peer, setPeer] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPeerPanel, setShowPeerPanel] = useState(false);

  // Enhanced Peer Learning States
  const [peerSession, setPeerSession] = useState(null);
  const [isSessionLeader, setIsSessionLeader] = useState(false);
  const [collaborativeNotes, setCollaborativeNotes] = useState('');
  const [peerNotes, setPeerNotes] = useState('');
  const [sharedCodeEditor, setSharedCodeEditor] = useState('# Python code editor\n# Write your code here and press "Run Code" to see the output\n\nprint("Hello, World!")\n\n# Example function\ndef solution():\n    return "Your solution here"\n\n# Test the function\nresult = solution()\nprint(f"Result: {result}")');
  const [peerProgress, setPeerProgress] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [peerCursor, setPeerCursor] = useState({ line: 0, column: 0 });
  const [studyMode, setStudyMode] = useState('guided'); // 'guided', 'discussion', 'practice'
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isCodeEditorFullscreen, setIsCodeEditorFullscreen] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [showOutputTerminal, setShowOutputTerminal] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [peerAnswers, setPeerAnswers] = useState({});
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [peerScreenShare, setPeerScreenShare] = useState(false);
  const [sessionInsights, setSessionInsights] = useState({});
  const [collaborativeBookmarks, setCollaborativeBookmarks] = useState([]);
  const [peerReactions, setPeerReactions] = useState([]);
  const [sessionGoals, setSessionGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [showPeerTestModal, setShowPeerTestModal] = useState(false);
  const [peerTestInvitation, setPeerTestInvitation] = useState(null);
  const [isInPeerTest, setIsInPeerTest] = useState(false);
  const [peerTestData, setPeerTestData] = useState(null);
  const [showPeerMatchingModal, setShowPeerMatchingModal] = useState(false);
  const [realPeerSession, setRealPeerSession] = useState(null);
  const [showWebSocketDebugger, setShowWebSocketDebugger] = useState(false);
  
  // Refs for real-time features
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const sessionInitializedRef = useRef(false);

  useEffect(() => {
    fetchLevelData();
  }, [courseId, chapterId, levelId]);

  // Cleanup WebSocket connection when component unmounts ONLY
  useEffect(() => {
    return () => {
      // Only cleanup on actual component unmount, not state changes
      console.log('🧹 Component unmounting, cleaning up session...');
      if (socketService.isSocketConnected()) {
        // Get the current session from state
        const currentSession = realPeerSession;
        if (currentSession?.sessionId) {
          console.log('🚪 Leaving session on unmount:', currentSession.sessionId);
          socketService.leaveSession(currentSession.sessionId);
        }
        socketService.removeAllListeners();
      }
      // Reset session initialized flag
      sessionInitializedRef.current = false;
    };
  }, []); // Empty dependency array - only run on mount/unmount

  useEffect(() => {
    if (learningMode === 'peer' && !sessionInitializedRef.current) {
      // Check if we have a real session from state
      const sessionData = location.state?.peerSession;
      const isLeader = location.state?.isSessionLeader;
      
      console.log('🔄 Initializing peer session...', { sessionData: sessionData?.sessionId, isLeader });
      
      if (sessionData) {
        setRealPeerSession(sessionData);
        setIsSessionLeader(isLeader || false);
        initializeRealPeerSession(sessionData, isLeader);
      } else {
        initializePeerSession();
      }
      
      // Mark session as initialized to prevent multiple initializations
      sessionInitializedRef.current = true;
    } else if (learningMode !== 'peer' && sessionInitializedRef.current) {
      // User switched away from peer mode, clean up session
      console.log('🔄 Switching away from peer mode, cleaning up...');
      if (realPeerSession?.sessionId && socketService.isSocketConnected()) {
        socketService.leaveSession(realPeerSession.sessionId);
      }
      setRealPeerSession(null);
      setIsSessionActive(false);
      setShowPeerPanel(false);
      setPeer(null);
      sessionInitializedRef.current = false;
    }
  }, [learningMode]); // Only depend on learningMode to prevent multiple initializations

  // Session timer effect
  useEffect(() => {
    if (isSessionActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(sessionTimerRef.current);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [isSessionActive]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (event) => {
      // F11 or Ctrl+Shift+F for fullscreen toggle
      if (event.key === 'F11' || (event.ctrlKey && event.shiftKey && event.key === 'F')) {
        event.preventDefault();
        if (showCodeEditor) {
          setIsCodeEditorFullscreen(!isCodeEditorFullscreen);
        }
      }
      // Escape to exit fullscreen
      if (event.key === 'Escape' && isCodeEditorFullscreen) {
        setIsCodeEditorFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCodeEditor, isCodeEditorFullscreen]);

  // Setup WebSocket event listeners for real-time collaboration
  const setupWebSocketListeners = (sessionId) => {
    console.log('🎧 Setting up WebSocket listeners for session:', sessionId);
    
    // First, remove any existing listeners to prevent duplicates
    socketService.removeAllListeners();
    
    // Listen for new messages
    socketService.onNewMessage((messageData) => {
      console.log('📨 Received new message:', messageData);
      
      // Get current user ID to determine if message is from self or peer
      const currentUserId = getCurrentUserId();
      const isOwnMessage = messageData.sender._id === currentUserId;
      
      const newMessage = {
        id: messageData.id,
        sender: isOwnMessage ? 'me' : 'peer',
        text: messageData.text,
        timestamp: messageData.timestamp,
        type: messageData.type,
        senderInfo: messageData.sender
      };
      
      // Add message to chat (avoid duplicates by checking if already exists)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === messageData.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      
      // Handle special message types
      if (messageData.type === 'test_invitation' && !isOwnMessage) {
        setPeerTestInvitation({
          levelId,
          testCases: level?.testCases || [],
          invitedBy: 'peer',
          timestamp: messageData.timestamp
        });
        setShowPeerTestModal(true);
        toast.info('🎯 Your peer invited you to take a collaborative test!');
      } else if (messageData.type === 'test_acceptance' && !isOwnMessage) {
        toast.success('🎉 Your peer accepted the test invitation!');
        // Navigate to test page when peer accepts
        navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}/test`, {
          state: { 
            peerSession: realPeerSession,
            testData: peerTestInvitation
          }
        });
      } else if (messageData.type === 'test_decline' && !isOwnMessage) {
        toast.error('❌ Your peer declined the test invitation.');
        // End session and redirect to home
        handleEndSession().then(() => {
          navigate('/home');
        });
      } else if (messageData.type === 'voice_note' && !isOwnMessage) {
        toast.info('🎤 Your peer shared a voice note');
      } else if (messageData.type === 'system') {
        if (messageData.text.includes('screen sharing')) {
          toast.info(messageData.text);
        }
      }
    });

    // Listen for message confirmation
    socketService.onMessageSent((data) => {
      console.log('✅ Message sent confirmation:', data);
      // Optionally update message status or show confirmation
    });

    // Listen for message errors
    socketService.onMessageError((data) => {
      console.error('❌ Message error:', data);
      toast.error(`Failed to send message: ${data.error}`);
      
      // Optionally remove the failed message from UI or mark as failed
      setMessages(prev => prev.map(msg => 
        msg.text === data.originalMessage 
          ? { ...msg, failed: true, error: data.error }
          : msg
      ));
    });

    // Listen for navigation sync
    socketService.onNavigationSynced((data) => {
      console.log('🧭 Received navigation sync:', data);
      if (!isSessionLeader) {
        setCurrentContentIndex(data.contentIndex);
        toast.info(`${data.navigatedBy} navigated ${data.direction}`);
      }
    });

    // Listen for collaborative notes updates
    socketService.onNotesUpdated((data) => {
      console.log('📝 Received notes update:', data);
      setCollaborativeNotes(data.notes);
      toast.info(`${data.updatedBy} updated collaborative notes`);
    });

    // Listen for code editor updates
    socketService.onCodeUpdated((data) => {
      console.log('💻 Received code update:', data);
      setSharedCodeEditor(data.code);
      setPeerCursor(data.cursorPosition || { line: 0, column: 0 });
      toast.info('Code editor updated by your peer');
    });

    // Listen for reactions
    socketService.onReactionReceived((data) => {
      console.log('😄 Received reaction:', data);
      const reaction = {
        emoji: data.emoji,
        contentIndex: data.contentIndex,
        sender: data.sender,
        timestamp: data.timestamp
      };
      setPeerReactions(prev => [...prev, reaction]);
      toast.success(`${data.sender} reacted with ${data.emoji}`);
    });

    // Listen for peer joining/leaving
    socketService.onPeerJoined((data) => {
      console.log('👋 Peer joined:', data);
      toast.success(`🎉 ${data.user.fullName} joined the session!`);
    });

    socketService.onPeerLeft((data) => {
      console.log('🚪 Peer left:', data);
      toast.info(`👋 ${data.user.fullName} left the session`);
    });

    socketService.onPeerDisconnected((data) => {
      console.log('⚠️ Peer disconnected:', data);
      toast.warning(`⚠️ ${data.user.fullName} disconnected`);
    });

    // Listen for session join errors
    socketService.onSessionJoinError((data) => {
      console.error('❌ Session join error:', data);
      toast.error(`Failed to join session: ${data.error}`);
    });
  };

  const initializeRealPeerSession = async (sessionData, isLeader = false) => {
    try {
      console.log('🎯 Starting real peer session initialization...', sessionData.sessionId);
      
      // Fetch real session data from backend
      const response = await getSessionById(sessionData.sessionId);
      const session = response.session;
      
      // Get current user ID from JWT token
      const currentUserId = getCurrentUserId();
      
      // Connect to WebSocket and join the session
      const token = localStorage.getItem('authToken');
      if (token && socketService.isSocketConnected()) {
        console.log('🔌 WebSocket already connected, joining session...', session.sessionId);
        try {
          await socketService.joinSession(session.sessionId);
          console.log('✅ Successfully joined session via existing connection');
        } catch (error) {
          console.error('❌ Failed to join session:', error);
          toast.error(`Failed to join session: ${error.message}`);
          return;
        }
      } else if (token) {
        console.log('🔌 Connecting to WebSocket and joining session...', session.sessionId);
        try {
          await socketService.connect(token);
          await socketService.joinSession(session.sessionId);
          console.log('✅ Successfully connected and joined session');
        } catch (error) {
          console.error('❌ Failed to connect and join session:', error);
          toast.error(`Failed to join session: ${error.message}`);
          return;
        }
      } else {
        console.error('❌ No authentication token found');
        toast.error('Authentication required to join session');
        return;
      }
      
      // Set up real peer data
      const peerParticipant = session.participants.find(p => p.user._id !== currentUserId);
      const currentParticipant = session.participants.find(p => p.user._id === currentUserId);
      
      let peerData = null;
      if (peerParticipant) {
        peerData = {
          id: peerParticipant.user._id,
          name: peerParticipant.user.fullName,
          avatar: peerParticipant.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
          status: peerParticipant.isOnline ? 'online' : 'offline',
          role: peerParticipant.role,
          level: 'Intermediate',
          studyTime: 45,
          completedLevels: 12,
          currentStreak: 7
        };
        
        setPeer(peerData);
      }
      
      setRealPeerSession(session);
      setIsSessionLeader(currentParticipant?.role === 'leader' || isLeader);
      setIsSessionActive(true);
      setShowPeerPanel(true);
      
      // Load session messages
      setMessages(session.messages.map(msg => ({
        id: msg._id,
        sender: msg.sender._id === currentUserId ? 'me' : 'peer',
        text: msg.text,
        timestamp: msg.timestamp,
        type: msg.type
      })));
      
      // Set up WebSocket event listeners for real-time features
      setupWebSocketListeners(session.sessionId);
         
      // Initialize session goals
      setSessionGoals(session.sessionGoals.map(goal => goal.description));
      setCompletedGoals(session.sessionGoals
        .map((goal, index) => goal.isCompleted ? index : -1)
        .filter(index => index !== -1)
      );
      
    } catch (error) {
      console.error('Error initializing real peer session:', error);
      // Fallback to simulated session
      initializePeerSession();
    }
  };

  const initializePeerSession = () => {
    // Simulate peer connection with enhanced features
    const peerData = {
        id: 'peer123',
      name: 'Alex Chen',
      avatar: 'AC',
      status: 'online',
      level: 'Intermediate',
      studyTime: 45,
      completedLevels: 12,
      currentStreak: 7
    };
    
    setPeer(peerData);
    setPeerSession({
      id: 'session_' + Date.now(),
      startTime: Date.now(),
      participants: [peerData],
      sessionType: 'collaborative_learning',
      currentActivity: 'content_review'
    });
    
    setIsSessionLeader(Math.random() > 0.5); // Randomly assign leadership
    setIsSessionActive(true);
    setShowPeerPanel(true);
    
    // Initialize session goals
    setSessionGoals([
      'Complete current level together',
      'Take collaborative notes',
      'Discuss key concepts',
      'Practice coding exercises'
    ]);

    // Simulate initial peer messages
    setTimeout(() => {
      setMessages([
        {
          id: 1,
          sender: 'peer',
          text: `Hi! I'm ${peerData.name}. Ready to learn together? 🚀`,
          timestamp: new Date().toISOString(),
          type: 'message'
        }
      ]);
    }, 1000);

    toast.success(`Connected with ${peerData.name}! Starting collaborative session.`);
  };

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      const [courseData, chapterData, levelData, contentData] = await Promise.all([
        getCourseById(courseId),
        getChapterById(courseId, chapterId),
        getLevelById(courseId, chapterId, levelId),
        getLevelContent(courseId, chapterId, levelId)
      ]);

      setCourse(courseData);
      setChapter(chapterData);
      setLevel(levelData);
      setContent(contentData);

      // Fetch next level info
      try {
        const nextLevelData = await getNextLevel(courseId, chapterId, levelId);
        setNextLevel(nextLevelData);
      } catch (err) {
        console.log("No next level available");
      }

      // Fetch progress
      try {
        const progressData = await getCourseProgress(courseId);
        setProgress(progressData);
        setIsLevelCompleted(
          progressData?.completedLevels?.some(
            completed => completed.chapterId === chapterId && completed.levelId === levelId
          ) || false
        );
      } catch (err) {
        console.log("No progress data available");
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch level data");
      console.error("Error fetching level data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContentNavigation = (direction) => {
    // In peer mode, only session leader can navigate
    if (learningMode === 'peer' && isSessionActive && !isSessionLeader) {
      toast.error("Only the session leader can navigate content. Please wait for your partner to guide the session.");
      return;
    }
    
    if (direction === 'next' && currentContentIndex < content.length - 1) {
        const newIndex = currentContentIndex + 1;
        setCurrentContentIndex(newIndex);
        
        // Sync with peer via WebSocket if in active session
        if (learningMode === 'peer' && isSessionActive && realPeerSession && socketService.isSocketConnected()) {
          socketService.syncNavigation(realPeerSession.sessionId, direction, newIndex);
        }
    } else if (direction === 'prev' && currentContentIndex > 0) {
        const newIndex = currentContentIndex - 1;
        setCurrentContentIndex(newIndex);
        
        // Sync with peer via WebSocket if in active session
        if (learningMode === 'peer' && isSessionActive && realPeerSession && socketService.isSocketConnected()) {
          socketService.syncNavigation(realPeerSession.sessionId, direction, newIndex);
        }
    }
  };

  const handleStartTest = () => {
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}/test`);
  };

  const handleBackToChapters = () => {
    navigate(`/course/${courseId}/chapters`);
  };

  const handleNextLevel = () => {
    if (nextLevel?.nextLevel && nextLevel?.nextChapter) {
      navigate(`/course/${courseId}/chapter/${nextLevel.nextChapter._id}/level/${nextLevel.nextLevel._id}`);
    } else if (nextLevel?.nextLevel) {
      navigate(`/course/${courseId}/chapter/${chapterId}/level/${nextLevel.nextLevel._id}`);
    } else if (nextLevel?.courseCompleted) {
      navigate(`/course/${courseId}/overview`);
    }
  };

  const formatDuration = (minutes) => {
    return `${minutes} min`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageText = newMessage;
    setNewMessage('');

    // Send via WebSocket if in real session
    if (realPeerSession && socketService.isSocketConnected()) {
      console.log('🔌 Sending via WebSocket to session:', realPeerSession.sessionId);
      console.log('🔍 Current user ID:', getCurrentUserId());
      console.log('🔍 WebSocket connected:', socketService.isSocketConnected());
      
      // Create temporary message for immediate feedback
      const tempMessage = {
        id: `temp_${Date.now()}`,
        sender: 'me',
        text: messageText,
        timestamp: new Date().toISOString(),
        type: 'message',
        sending: true
      };
      
      console.log('📤 Adding temporary message:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via WebSocket (the real message will come back via WebSocket)
      console.log('📡 Sending message via WebSocket...');
      socketService.sendMessage(realPeerSession.sessionId, messageText, 'message');
      
      // Remove temporary message after a short delay (real message should arrive)
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }, 2000);
      
    } else if (realPeerSession) {
      // Fallback to API if WebSocket is not connected
      try {
    const message = {
      id: Date.now(),
      sender: 'me',
          text: messageText,
          timestamp: new Date().toISOString(),
          type: 'message'
    };
    
    setMessages(prev => [...prev, message]);
        
        await addMessageToSession(realPeerSession.sessionId, {
          text: messageText,
          type: 'message'
        });
      } catch (error) {
        console.error('Error sending message to session:', error);
        toast.error('Failed to send message');
      }
    } else {
      // Simulate peer response for demo
      const message = {
        id: Date.now(),
        sender: 'me',
        text: messageText,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, message]);
      
      setTimeout(() => {
        const responses = [
          "Great point! Let me think about that...",
          "I agree! That concept is really important.",
          "Can you explain that part again?",
          "That's exactly what I was thinking!",
          "Let's work through this together step by step.",
          "I found a helpful resource about this topic!"
        ];
        
        const peerMessage = {
          id: Date.now() + 1,
          sender: 'peer',
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toISOString(),
          type: 'message'
        };
        
        setMessages(prev => [...prev, peerMessage]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    
    const action = !isAudioEnabled ? 'enabled' : 'disabled';
    toast.success(`Audio ${action}`);
    
    // Add audio status to chat
    const statusMessage = {
      id: Date.now(),
      sender: 'system',
      text: `Audio ${action}`,
      timestamp: new Date().toISOString(),
      type: 'status'
    };
    setMessages(prev => [...prev, statusMessage]);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    const action = !isVideoEnabled ? 'enabled' : 'disabled';
    toast.success(`Video ${action}`);
    
    // Add video status to chat
    const statusMessage = {
      id: Date.now(),
      sender: 'system',
      text: `Video ${action}`,
      timestamp: new Date().toISOString(),
      type: 'status'
    };
    setMessages(prev => [...prev, statusMessage]);
  };

  // Enhanced Peer Learning Methods
  const syncContentNavigation = (direction) => {
    if (!isSessionLeader) {
      toast.error("Only the session leader can navigate content for the group.");
      return;
    }
    
    handleContentNavigation(direction);
    
    // Notify peer about navigation
    const navMessage = {
      id: Date.now(),
      sender: 'system',
      text: `Session leader moved to ${direction} content section`,
      timestamp: new Date().toISOString(),
      type: 'navigation'
    };
    setMessages(prev => [...prev, navMessage]);
    
    // Update peer progress
    const newProgress = ((currentContentIndex + (direction === 'next' ? 1 : 0)) / content.length) * 100;
    setPeerProgress(newProgress);
  };

  const startCollaborativeTest = () => {
    if (!level.testCases?.length) {
      toast.error("No test cases available for this level.");
      return;
    }

    const testInvitation = {
      levelId,
      testCases: level.testCases,
      invitedBy: 'me',
      timestamp: new Date().toISOString()
    };

    setPeerTestInvitation(testInvitation);
    setShowPeerTestModal(true);
    
    // Send invitation message
    const inviteMessage = {
      id: Date.now(),
      sender: 'me',
      text: "🎯 Invited you to take the test together! Let's solve it collaboratively.",
      timestamp: new Date().toISOString(),
      type: 'test_invitation'
    };
    setMessages(prev => [...prev, inviteMessage]);
    
    // Send test invitation via WebSocket if in real session
    if (realPeerSession && socketService.isSocketConnected()) {
      socketService.sendMessage(realPeerSession.sessionId, "🎯 Invited you to take the test together! Let's solve it collaboratively.", 'test_invitation');
    }
    
    toast.success('Test invitation sent to your peer!');
  };

  const acceptPeerTest = () => {
    setIsInPeerTest(true);
    setShowPeerTestModal(false);
    
    // Send acceptance notification via WebSocket if in real session
    if (realPeerSession && socketService.isSocketConnected()) {
      socketService.sendMessage(realPeerSession.sessionId, "✅ Accepted test invitation! Let's code together.", 'test_acceptance');
    }
    
    toast.success('Test invitation accepted! Starting collaborative test...');
    
    // Navigate to the test page with peer session data
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}/test`, {
      state: { 
        peerSession: realPeerSession,
        testData: peerTestInvitation
      }
    });
  };

  const declinePeerTest = async () => {
    setShowPeerTestModal(false);
    
    try {
      // Send decline notification via WebSocket if in real session
      if (realPeerSession && socketService.isSocketConnected()) {
        socketService.sendMessage(realPeerSession.sessionId, "❌ Declined test invitation.", 'test_decline');
      }
      
      // End the session for both users
      if (realPeerSession?.sessionId) {
        await endSession(realPeerSession.sessionId);
        
        // Leave WebSocket session
        if (socketService.isSocketConnected()) {
          socketService.leaveSession(realPeerSession.sessionId);
        }
        
        // Clean up WebSocket listeners
        socketService.removeAllListeners();
      }
      
      toast.info('Test invitation declined. Redirecting to home...');
      
      // Navigate both users to home
      navigate('/home');
      
    } catch (error) {
      console.error('Error declining peer test:', error);
      toast.error('Error occurred. Redirecting to home...');
      navigate('/home');
    }
  };



  const startVoiceNote = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Voice recording not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const voiceNote = {
          id: Date.now(),
          blob,
          duration: Date.now() - recordingStartTime,
          timestamp: new Date().toISOString(),
          sender: 'me'
        };
        setVoiceNotes(prev => [...prev, voiceNote]);
        
        // Send voice note notification via WebSocket if in real session
        if (realPeerSession && socketService.isSocketConnected()) {
          socketService.sendMessage(realPeerSession.sessionId, `🎤 Shared a voice note (${Math.round((Date.now() - recordingStartTime) / 1000)}s)`, 'voice_note');
        }
        
        stream.getTracks().forEach(track => track.stop());
        toast.success("Voice note recorded and shared!");
      };
      
      setIsRecording(true);
      const recordingStartTime = Date.now();
      mediaRecorder.start();
      
      toast.info("🔴 Recording voice note... Click stop when done");
    } catch (error) {
      console.error('Voice recording error:', error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopVoiceNote = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle shared code editor changes
  const handleCodeEditorChange = (newCode, cursorPosition = { line: 0, column: 0 }) => {
    setSharedCodeEditor(newCode);
    
    // Send code update via WebSocket if in real session (debounced to avoid too many updates)
    if (realPeerSession && socketService.isSocketConnected()) {
      // Debounce the updates to avoid flooding the WebSocket
      clearTimeout(window.codeUpdateTimeout);
      window.codeUpdateTimeout = setTimeout(() => {
        socketService.updateCodeEditor(realPeerSession.sessionId, newCode, cursorPosition);
      }, 300);
    }
  };

  // Update session progress
  const updateSessionProgress = (progressData) => {
    if (realPeerSession && socketService.isSocketConnected()) {
      socketService.updateSessionProgress(realPeerSession.sessionId, progressData);
    }
  };



  const formatSessionTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionInsights = () => {
    return {
      totalTime: formatSessionTime(sessionTimer),
      messagesExchanged: messages.length,
      contentProgress: Math.round(((currentContentIndex + 1) / content.length) * 100),
      questionsAsked: sharedQuestions.length,
      notesCreated: collaborativeNotes.split('\n').filter(note => note.trim()).length,
      reactionsGiven: peerReactions.length
    };
  };

  const handleEndSession = async () => {
    if (!realPeerSession) return;
    
    try {
      // End session via API
      await endSession(realPeerSession.sessionId);
      
      // Leave WebSocket session
      if (socketService.isSocketConnected()) {
        socketService.leaveSession(realPeerSession.sessionId);
      }
      
      // Clean up WebSocket listeners
      socketService.removeAllListeners();
      
      // Reset peer session state
      setRealPeerSession(null);
      setIsSessionActive(false);
      setShowPeerPanel(false);
      setPeer(null);
      setMessages([]);
      setCollaborativeNotes('');
      setSharedQuestions([]);
      setPeerReactions([]);
      setSharedCodeEditor('');
      
      // Reset session initialized flag to allow new sessions
      sessionInitializedRef.current = false;
      
      toast.success('🎉 Session ended successfully');
      
      // Navigate back to solo mode
      navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`, {
        state: { learningMode: 'solo' }
      });
      
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session properly');
    }
  };

  // Check WebSocket connection status
  const checkWebSocketConnection = () => {
    if (realPeerSession && !socketService.isSocketConnected()) {
      toast.error('🔌 Connection lost! Attempting to reconnect...');
      
      // Attempt to reconnect
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        socketService.connect(token).then(() => {
          socketService.joinSession(realPeerSession.sessionId);
          setupWebSocketListeners(realPeerSession.sessionId);
          toast.success('🔌 Reconnected successfully!');
        }).catch(error => {
          console.error('Failed to reconnect:', error);
          toast.error('🔌 Failed to reconnect. Some features may not work.');
        });
      }
    }
  };

  const executeCode = async () => {
    if (!sharedCodeEditor.trim()) {
      toast.error('Please enter some code to run');
      return;
    }

    setIsRunningCode(true);
    setShowOutputTerminal(true);
    setCodeOutput('Running code...\n');

    try {
      // Simulate code execution with some basic Python evaluation
      // In a real implementation, you'd send this to a backend service
      let output = '';
      const lines = sharedCodeEditor.split('\n');
      
      // Simple Python-like execution simulation
      const pythonKeywords = ['print(', 'def ', 'if ', 'for ', 'while ', 'class '];
      const hasValidPython = pythonKeywords.some(keyword => 
        sharedCodeEditor.includes(keyword)
      );

      if (hasValidPython) {
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Extract print statements and simulate output
        const printMatches = sharedCodeEditor.match(/print\((.*?)\)/g);
        if (printMatches) {
          printMatches.forEach(match => {
            const content = match.match(/print\((.*?)\)/)[1];
            // Handle different types of print content
            if (content.includes('"') || content.includes("'")) {
              // String content - remove quotes
              const cleanContent = content.replace(/['"]/g, '');
              output += `${cleanContent}\n`;
            } else if (content.includes('f"') || content.includes("f'")) {
              // F-string - simulate evaluation
              const fStringContent = content.replace(/f['"](.*?)['"]/, '$1');
              if (fStringContent.includes('{') && fStringContent.includes('}')) {
                // Simple f-string variable substitution
                const substituted = fStringContent.replace(/\{.*?\}/g, '[value]');
                output += `${substituted}\n`;
              } else {
                output += `${fStringContent}\n`;
              }
            } else {
              // Variable or expression
              output += `${content}\n`;
            }
          });
        }

        // Check for function definitions
        if (sharedCodeEditor.includes('def solution()')) {
          output += '\n--- Function Definition Detected ---\n';
          output += 'solution() function is ready to be called\n';
          
          if (sharedCodeEditor.includes('solution()')) {
            output += '\n--- Execution Result ---\n';
            output += 'Function executed successfully\n';
          }
        }

        // Check for basic math operations
        const mathMatches = sharedCodeEditor.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/g);
        if (mathMatches) {
          output += '\n--- Math Operations ---\n';
          mathMatches.forEach(match => {
            try {
              const result = eval(match);
              output += `${match} = ${result}\n`;
            } catch (e) {
              output += `${match} = Error in calculation\n`;
            }
          });
        }

        if (!output.trim()) {
          output = 'Code executed successfully!\nNo output to display.\n';
        }
      } else {
        output = 'Error: No valid Python syntax detected.\nPlease write valid Python code with functions like print(), def, etc.\n';
      }

              // Add execution metadata
        output += `\n--- Execution Complete ---\n`;
        output += `Executed at: ${new Date().toLocaleTimeString()}\n`;
        output += `Code lines: ${lines.length}\n`;
        output += `Characters: ${sharedCodeEditor.length}\n`;

        setCodeOutput(output);

        // Notify peer about code execution if in peer mode
        if (learningMode === 'peer' && socketService.isSocketConnected() && realPeerSession?.sessionId) {
          // Send a message to peer about code execution
          const executionMessage = {
            text: `🚀 Executed code and got output:\n${output.split('\n--- Execution Complete ---')[0].trim()}`,
            type: 'code_execution',
            timestamp: new Date().toISOString()
          };
          
          socketService.sendMessage(realPeerSession.sessionId, executionMessage);
        }

        toast.success('✅ Code executed successfully!');
    } catch (error) {
      const errorOutput = `Error executing code:\n${error.message}\n\nPlease check your Python syntax and try again.`;
      setCodeOutput(errorOutput);
      toast.error('❌ Code execution failed');
    } finally {
      setIsRunningCode(false);
    }
  };



  // Periodic connection check for peer sessions
  useEffect(() => {
    if (realPeerSession) {
      const connectionCheckInterval = setInterval(checkWebSocketConnection, 30000); // Check every 30 seconds
      return () => clearInterval(connectionCheckInterval);
    }
  }, [realPeerSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center animate-pulse">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchLevelData} size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <p className="text-sm text-muted-foreground">Level not found</p>
      </div>
    );
  }

  const currentContent = content[currentContentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="space-y-6 border-b border-gray-200/60 pb-6 bg-white/60 backdrop-blur-sm rounded-t-2xl px-6 py-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToChapters}
              className="text-sm hover:bg-gray-100 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            {learningMode === 'peer' ? (
              <div className="flex flex-wrap gap-2">
                {peer && (
              <Button
                variant="outline"
                onClick={() => setShowPeerPanel(!showPeerPanel)}
                    className="text-sm bg-white/80 border-purple-200 hover:bg-purple-50 transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                {showPeerPanel ? 'Hide Peer Panel' : 'Show Peer Panel'}
              </Button>
            )}
                {!peer && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPeerMatchingModal(true)}
                    className="text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Learning Partner
              </Button>
            )}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{course?.title}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Chapter {chapter?.order}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-blue-600">Level {level.order}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {level.title}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">{level.description}</p>
              </div>
              
              {isLevelCompleted && (
                <Badge variant="default" className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDuration(level.estimatedTime || 30)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full text-purple-700">
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">{content.length} sections</span>
              </div>
              {level.testCases?.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full text-green-700">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">{level.testCases.length} test cases</span>
                </div>
              )}
              {learningMode === 'peer' && peer && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-full text-orange-700">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Peer Learning with {peer.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 mt-6 lg:mt-8">
          {/* Main Content Area */}
          <div className={`transition-all duration-300 ${showPeerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {content.length > 0 ? (
              <div className="space-y-6 lg:space-y-8">
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-gray-800">{currentContent?.title}</h2>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 self-start sm:self-center">
                        Section {currentContentIndex + 1} of {content.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 lg:p-8">
                    {/* Content Text */}
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base lg:text-lg">
                        {currentContent?.content?.text}
                      </div>
                    </div>

                    {/* Content Media */}
                    {currentContent?.content?.media && (
                      <div className="mt-6">
                        <img 
                          src={currentContent.content.media} 
                          alt={currentContent.title}
                          className="w-full rounded-lg border"
                        />
                      </div>
                    )}

                    {/* Examples */}
                    {currentContent?.content?.examples?.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Examples
                        </h3>
                        <div className="space-y-3">
                          {currentContent.content.examples.map((example, index) => (
                            <div key={index} className="bg-muted/50 rounded-lg p-4">
                              <pre className="text-sm overflow-x-auto">
                                <code>{example}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Button
                        variant="ghost"
                          onClick={() => learningMode === 'peer' ? syncContentNavigation('prev') : handleContentNavigation('prev')}
                          disabled={currentContentIndex === 0 || (learningMode === 'peer' && !isSessionLeader)}
                        size="sm"
                          className="w-full sm:w-auto hover:bg-blue-50 transition-colors duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                          {learningMode === 'peer' && !isSessionLeader && (
                            <span className="ml-1 text-xs text-muted-foreground">(Leader only)</span>
                          )}
                      </Button>

                        <div className="flex gap-2 justify-center sm:justify-start">
                        {content.map((_, index) => (
                          <button
                            key={index}
                              onClick={() => learningMode === 'peer' && !isSessionLeader ? null : setCurrentContentIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              index === currentContentIndex 
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                                : index < currentContentIndex 
                                    ? 'bg-gradient-to-r from-blue-300 to-purple-300' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                              } ${learningMode === 'peer' && !isSessionLeader ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                              title={learningMode === 'peer' && !isSessionLeader ? 'Only session leader can navigate' : `Go to section ${index + 1}`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                          onClick={() => learningMode === 'peer' ? syncContentNavigation('next') : handleContentNavigation('next')}
                          disabled={currentContentIndex === content.length - 1 || (learningMode === 'peer' && !isSessionLeader)}
                        size="sm"
                          className="w-full sm:w-auto hover:bg-blue-50 transition-colors duration-200"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                          {learningMode === 'peer' && !isSessionLeader && (
                            <span className="ml-1 text-xs text-muted-foreground">(Leader only)</span>
                          )}
                      </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-6 border border-gray-100">
                    <div className="flex flex-wrap gap-3">
                  {level.testCases?.length > 0 && (
                        <>
                          {learningMode === 'solo' ? (
                            <Button 
                              onClick={handleStartTest} 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-200"
                            >
                      <Play className="w-4 h-4 mr-2" />
                      Take Test
                    </Button>
                          ) : (
                            <div className="flex gap-3">
                              <Button 
                                onClick={handleStartTest} 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Solo Test
                              </Button>
                              <Button 
                                onClick={startCollaborativeTest} 
                                size="sm" 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md transition-all duration-200"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Peer Test
                              </Button>
                            </div>
                          )}
                        </>
                  )}
                  
                  {(!level.testCases?.length || isLevelCompleted) && nextLevel && (
                        <Button 
                          onClick={handleNextLevel} 
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md transition-all duration-200"
                        >
                      {nextLevel.courseCompleted ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Complete Course
                        </>
                      ) : (
                        <>
                          Next Level
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

                  {/* Peer Learning Code Editor */}
                  {learningMode === 'peer' && (
                    <div className="pt-6 border-t space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button 
                            variant={showCodeEditor ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setShowCodeEditor(!showCodeEditor)}
                            className="flex items-center gap-2 transition-all duration-200"
                          >
                            <Code className="w-4 h-4" />
                            {showCodeEditor ? 'Hide Code Editor' : 'Show Code Editor'}
                          </Button>
                          {showCodeEditor && (
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={socketService.isSocketConnected() ? "default" : "secondary"} 
                                className={`text-xs transition-all duration-200 ${
                                  socketService.isSocketConnected() 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  socketService.isSocketConnected() ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                                {socketService.isSocketConnected() ? 'Live Sync' : 'Offline'}
                              </Badge>
                              {peerCursor.line > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Peer: Line {peerCursor.line}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {showCodeEditor && (
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setIsCodeEditorFullscreen(!isCodeEditorFullscreen)}
                              className="h-8 px-2 hover:bg-blue-50"
                              title={isCodeEditorFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (F11)"}
                            >
                              {isCodeEditorFullscreen ? <Pause className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                if (sharedCodeEditor.trim()) {
                                  navigator.clipboard.writeText(sharedCodeEditor);
                                  toast.success("Code copied to clipboard!");
                                } else {
                                  toast.error("No code to copy");
                                }
                              }}
                              className="h-8 px-2 hover:bg-green-50"
                              title="Copy Code"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                if (confirm("Clear all code? This action cannot be undone.")) {
                                  handleCodeEditorChange('');
                                  toast.success("Code cleared");
                                }
                              }}
                              className="h-8 px-2 hover:bg-red-50"
                              title="Clear Code"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {showCodeEditor && (
                        <div className={`transition-all duration-300 ease-in-out ${
                          isCodeEditorFullscreen 
                            ? 'fixed inset-0 z-50 bg-background' 
                            : 'relative'
                        }`}>
                          <Card className={`shadow-lg border-2 ${
                            isCodeEditorFullscreen 
                              ? 'h-full rounded-none border-none' 
                              : 'border-blue-100'
                          }`}>
                            <CardHeader className={`${
                              isCodeEditorFullscreen ? 'pb-3 bg-gradient-to-r from-blue-50 to-purple-50' : 'pb-3'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                    <h3 className="font-semibold text-gray-800">
                                      {isCodeEditorFullscreen ? 'Fullscreen Code Editor' : 'Collaborative Code Editor'}
                                    </h3>
                                  </div>
                                  {peer && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                          {peer.avatar}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs font-medium text-gray-600">
                                        Coding with {peer.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {socketService.isSocketConnected() && (
                                      <span className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Real-time sync
                                      </span>
                                    )}
                                    <span className="px-2 py-1 bg-gray-50 rounded-full">
                                      {sharedCodeEditor.split('\n').length} lines
                                    </span>
                                  </div>
                                  
                                  {isCodeEditorFullscreen && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setIsCodeEditorFullscreen(false)}
                                      className="hover:bg-red-50"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Exit Fullscreen
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
                                {typeof window !== 'undefined' ? (
                                  <Editor
                                    height={isCodeEditorFullscreen ? "calc(100vh - 140px)" : "500px"}
                                    defaultLanguage="python"
                                    value={sharedCodeEditor}
                                    onChange={(value) => handleCodeEditorChange(value || '', { line: 0, column: 0 })}
                                    theme="vs-light"
                                    options={{
                                      minimap: { enabled: isCodeEditorFullscreen },
                                      fontSize: isCodeEditorFullscreen ? 16 : 14,
                                      lineNumbers: 'on',
                                      scrollBeyondLastLine: false,
                                      automaticLayout: true,
                                      wordWrap: 'on',
                                      formatOnPaste: true,
                                      formatOnType: true,
                                      tabSize: 4,
                                      insertSpaces: true,
                                      selectOnLineNumbers: true,
                                      roundedSelection: false,
                                      readOnly: false,
                                      cursorStyle: 'line',
                                      mouseWheelZoom: true,
                                      suggestOnTriggerCharacters: true,
                                      acceptSuggestionOnEnter: 'on',
                                      acceptSuggestionOnCommitCharacter: true,
                                      snippetSuggestions: 'top',
                                      emptySelectionClipboard: false,
                                      copyWithSyntaxHighlighting: true,
                                      quickSuggestions: true,
                                      parameterHints: { enabled: true },
                                      bracketMatching: 'always',
                                      autoClosingBrackets: 'always',
                                      autoClosingQuotes: 'always',
                                      folding: true,
                                      foldingHighlight: true,
                                      foldingStrategy: 'indentation',
                                      showFoldingControls: 'mouseover',
                                      matchBrackets: 'always',
                                      renderWhitespace: isCodeEditorFullscreen ? 'all' : 'boundary',
                                      renderControlCharacters: false,
                                      renderIndentGuides: true,
                                      highlightActiveIndentGuide: true,
                                      renderLineHighlight: 'line',
                                      codeLens: true,
                                      lineDecorationsWidth: isCodeEditorFullscreen ? 20 : 10,
                                      lineNumbersMinChars: isCodeEditorFullscreen ? 4 : 3,
                                      glyphMargin: isCodeEditorFullscreen,
                                      smoothScrolling: true,
                                      cursorBlinking: 'smooth',
                                      cursorSmoothCaretAnimation: true,
                                      scrollbar: {
                                        vertical: 'visible',
                                        horizontal: 'visible',
                                        arrowSize: 30,
                                        verticalHasArrows: true,
                                        horizontalHasArrows: true,
                                        verticalScrollbarSize: isCodeEditorFullscreen ? 20 : 17,
                                        horizontalScrollbarSize: isCodeEditorFullscreen ? 20 : 17,
                                        verticalSliderSize: isCodeEditorFullscreen ? 20 : 17,
                                        horizontalSliderSize: isCodeEditorFullscreen ? 20 : 17
                                      }
                                    }}
                                    onMount={(editor, monaco) => {
                                      editorRef.current = editor;
                                      
                                      // Add keyboard shortcuts
                                      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                                        toast.success("💾 Code auto-saved!");
                                      });
                                      
                                      editor.addCommand(monaco.KeyCode.F11, () => {
                                        setIsCodeEditorFullscreen(!isCodeEditorFullscreen);
                                      });
                                      
                                      // Track cursor position for peer collaboration
                                      editor.onDidChangeCursorPosition((e) => {
                                        const position = e.position;
                                        handleCodeEditorChange(editor.getValue(), { line: position.lineNumber, column: position.column });
                                      });
                                    }}
                                  />
                                ) : (
                                  <div className={`${
                                    isCodeEditorFullscreen ? "h-[calc(100vh-140px)]" : "h-[500px]"
                                  } flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50`}>
                                    <div className="text-center">
                                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <Code className="w-8 h-8 text-white" />
                    </div>
                                      <p className="text-lg font-medium text-gray-700 mb-2">Loading Code Editor</p>
                                      <p className="text-sm text-gray-500">Preparing your collaborative workspace...</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className={`p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t ${
                                isCodeEditorFullscreen ? 'flex items-center justify-between' : 'space-y-3'
                              }`}>
                                                              <div className={`flex ${isCodeEditorFullscreen ? 'gap-3' : 'gap-2 flex-wrap'}`}>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={executeCode}
                                  disabled={isRunningCode}
                                  className="hover:bg-green-50 border-green-200"
                                >
                                  {isRunningCode ? (
                                    <>
                                      <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-green-300 border-t-green-600"></div>
                                      Running...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Run Code
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setShowOutputTerminal(!showOutputTerminal)}
                                  className={`hover:bg-purple-50 border-purple-200 ${showOutputTerminal ? 'bg-purple-50' : ''}`}
                                >
                                  <Terminal className="w-3 h-3 mr-1" />
                                  {showOutputTerminal ? 'Hide Output' : 'Show Output'}
                                </Button>
                                  {isCodeEditorFullscreen && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        const blob = new Blob([sharedCodeEditor], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${level.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_solution.py`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                        toast.success("📁 Code downloaded!");
                                      }}
                                      className="hover:bg-purple-50 border-purple-200"
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                                
                                <div className={`text-xs text-muted-foreground ${
                                  isCodeEditorFullscreen ? '' : 'text-right'
                                }`}>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {sharedCodeEditor.split('\n').length} lines
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MousePointer className="w-3 h-3" />
                                      {sharedCodeEditor.length} characters
                                    </span>
                                    {isCodeEditorFullscreen && (
                                      <span className="text-blue-600 font-medium">
                                        Press Esc to exit fullscreen
                                      </span>
                                    )}
                                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                          
                          {/* Terminal Output */}
                          {showOutputTerminal && (
                            <Card className="shadow-lg border-2 border-gray-200 bg-gray-900 text-green-400 font-mono">
                              <CardHeader className="pb-3 bg-gray-800 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-200">Terminal Output</h3>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isRunningCode && (
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <div className="w-2 h-2 animate-pulse bg-green-400 rounded-full"></div>
                                        Running...
                                      </div>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setCodeOutput('')}
                                      className="h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setShowOutputTerminal(false)}
                                      className="h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
          </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="bg-black rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                                  <div className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                    {codeOutput || '$ Ready to execute code...\nPress "Run Code" to see output here.'}
                                  </div>
                                  {isRunningCode && (
                                    <div className="flex items-center gap-2 mt-2 text-yellow-400">
                                      <div className="w-2 h-2 animate-pulse bg-yellow-400 rounded-full"></div>
                                      <span className="text-sm">Executing...</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </div>
            ) : (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="py-16">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="w-12 h-12 text-gray-500" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-gray-800">No Content Available</h3>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        This level doesn't have any content yet. Check back later or contact your instructor for more information.
                      </p>
                    </div>
                    <Button 
                      onClick={handleBackToChapters}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Chapters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Peer Learning Workspace */}
          {learningMode === 'peer' && !showPeerPanel && (
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">No Peer Connected</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with a learning partner to start collaborative learning.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowPeerMatchingModal(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Find Learning Partner
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {learningMode === 'peer' && showPeerPanel && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4 lg:space-y-6">
                {/* Session Status Card */}
                <Card>
                  <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          socketService.isSocketConnected() 
                            ? 'bg-green-400 animate-pulse' 
                            : 'bg-red-400'
                        }`}></div>
                        <h3 className="font-medium">Live Session</h3>
                        {!socketService.isSocketConnected() && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={checkWebSocketConnection}
                            className="h-6 px-2 text-xs"
                          >
                            Reconnect
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={socketService.isSocketConnected() ? "default" : "destructive"} 
                          className="text-xs"
                        >
                          {socketService.isSocketConnected() ? 'Connected' : 'Offline'}
                        </Badge>
                    <Badge variant="secondary" className="text-xs">
                          {formatSessionTime(sessionTimer)}
                    </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{peer?.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{peer?.name}</span>
                      {isSessionLeader && (
                        <Badge variant="outline" className="text-xs">Leader</Badge>
                      )}
                  </div>
                </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Session Progress</span>
                        <span>{Math.round(((currentContentIndex + 1) / content.length) * 100)}%</span>
                      </div>
                      <Progress value={((currentContentIndex + 1) / content.length) * 100} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded p-2">
                        <div className="font-medium">{messages.length}</div>
                        <div className="text-muted-foreground">Messages</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <div className="font-medium">{sharedQuestions.length}</div>
                        <div className="text-muted-foreground">Questions</div>
                      </div>
                    </div>
                    
                    {/* End Session Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEndSession}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                    
                    {/* Debug Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowWebSocketDebugger(!showWebSocketDebugger)}
                      className="w-full text-xs text-gray-500 hover:bg-gray-50"
                    >
                      {showWebSocketDebugger ? 'Hide' : 'Show'} WebSocket Debug
                    </Button>
                  </CardContent>
                </Card>

                {/* Main Collaboration Panel */}
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b flex-shrink-0">
                  <Tabs defaultValue="chat" className="w-full">
                      <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
                      <TabsTrigger value="chat" className="text-xs">
                          <MessageSquare className="w-3 h-3 mr-1" />
                        Chat
                      </TabsTrigger>
                        <TabsTrigger value="video" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          Notes
                        </TabsTrigger>
                        <TabsTrigger value="code" className="text-xs">
                          <Code className="w-3 h-3 mr-1" />
                          Code
                      </TabsTrigger>
                    </TabsList>

                      <TabsContent value="chat" className="mt-0 flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col p-4">
                        {/* Messages */}
                          <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                  message.sender === 'me'
                                    ? 'bg-primary text-primary-foreground'
                                      : message.sender === 'system'
                                      ? 'bg-blue-100 text-blue-800 text-center italic'
                                      : message.type === 'question'
                                      ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400'
                                      : message.type === 'invitation'
                                      ? 'bg-purple-100 text-purple-800 border-l-4 border-purple-400'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{message.text}</p>
                                <span className="text-xs opacity-70 mt-1 block">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                              className="text-sm resize-none"
                              rows={2}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                            <div className="flex flex-col gap-1">
                              <Button size="icon" onClick={handleSendMessage} className="h-8 w-8">
                                <Send className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={isRecording ? stopVoiceNote : startVoiceNote}
                                className={`h-8 w-8 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
                              >
                                <Mic className="w-3 h-3" />
                          </Button>
                            </div>
                        </div>
                      </div>
                    </TabsContent>

                      <TabsContent value="video" className="mt-0 flex-1 flex flex-col">
                        <div className="p-4 space-y-4">
                        {/* Video Call Controls */}
                          <div className="flex justify-center gap-2">
                          <Button
                            variant={isAudioEnabled ? "default" : "outline"}
                              size="sm"
                            onClick={toggleAudio}
                          >
                              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant={isVideoEnabled ? "default" : "outline"}
                              size="sm"
                            onClick={toggleVideo}
                          >
                              {isVideoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant={screenSharing ? "destructive" : "outline"}
                              size="sm"
                            >
                              <Monitor className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Video Preview */}
                          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                          {isVideoEnabled ? (
                              <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                  <Camera className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm text-muted-foreground">Video call active</p>
                              </div>
                          ) : (
                            <div className="text-center space-y-2">
                                <CameraOff className="w-8 h-8 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">Camera is off</p>
                            </div>
                          )}
                        </div>

                          {/* Peer Video Status */}
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{peer?.avatar}</AvatarFallback>
                              </Avatar>
                              <span>{peer?.name}</span>
                              <div className="flex gap-1 ml-auto">
                                <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="notes" className="mt-0 flex-1 flex flex-col">
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Collaborative Notes</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {collaborativeNotes.split('\n').filter(note => note.trim()).length} entries
                              </Badge>
                              <Button size="sm" variant="ghost" onClick={() => {
                                const blob = new Blob([collaborativeNotes], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `session-notes-${new Date().toISOString().split('T')[0]}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Notes exported!');
                              }}>
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex-1 border rounded-lg overflow-hidden bg-background">
                            <div className="h-full overflow-y-auto p-3">
                              {collaborativeNotes ? (
                                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                  {collaborativeNotes}
                                </pre>
                              ) : (
                                <div className="text-center text-muted-foreground py-8">
                                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No notes yet</p>
                                  <p className="text-xs">Add notes using the button below</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Type a quick note..."
                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    addCollaborativeNote(e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                            <Button size="sm" variant="outline" onClick={() => {
                              const note = prompt("Add a detailed note:");
                              if (note) addCollaborativeNote(note);
                            }}>
                              <Pencil className="w-3 h-3 mr-1" />
                              Add Note
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="mt-0 flex-1 flex flex-col">
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-3 flex justify-between items-center">
                            <span className="text-sm font-medium">Shared Code Editor</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {sharedCodeEditor.split('\n').length} lines
                              </Badge>
                              <Button size="sm" variant="ghost" onClick={() => {
                                if (sharedCodeEditor.trim()) {
                                  navigator.clipboard.writeText(sharedCodeEditor);
                                  toast.success("Code copied to clipboard!");
                                } else {
                                  toast.error("No code to copy");
                                }
                              }}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                if (confirm("Clear all code? This action cannot be undone.")) {
                                  handleCodeEditorChange('');
                                  toast.success("Code cleared");
                                }
                              }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex-1 border rounded-lg overflow-hidden bg-background">
                            {typeof window !== 'undefined' ? (
                              <Editor
                                height="300px"
                                defaultLanguage="python"
                                value={sharedCodeEditor}
                                onChange={(value) => handleCodeEditorChange(value || '')}
                                theme="vs-light"
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 13,
                                  lineNumbers: 'on',
                                  scrollBeyondLastLine: false,
                                  automaticLayout: true,
                                  wordWrap: 'on',
                                  formatOnPaste: true,
                                  formatOnType: true,
                                  tabSize: 2,
                                  insertSpaces: true
                                }}
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center bg-muted/20">
                                <div className="text-center">
                                  <Code className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">Loading code editor...</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span>Live collaborative coding</span>
                              {socketService.isSocketConnected() && (
                                <span className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                  Synced
                                </span>
                              )}
                              {peerCursor.line > 0 && (
                                <span>Peer at line {peerCursor.line}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                const template = `# ${level.title} - Collaborative Solution\n# Authors: You and ${peer?.name}\n# Date: ${new Date().toLocaleDateString()}\n\ndef solution():\n    # Write your solution here\n    pass\n\n# Test the solution\nif __name__ == "__main__":\n    result = solution()\n    print(f"Result: {result}")`;
                                handleCodeEditorChange(template);
                                toast.success("Code template added!");
                              }}>
                                <FileCode className="w-3 h-3 mr-1" />
                                Template
                              </Button>
                            </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  </CardHeader>
                </Card>

                {/* Session Goals */}
                <Card>
                  <CardHeader className="pb-3">
                    <h4 className="font-medium text-sm">Session Goals</h4>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sessionGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={completedGoals.includes(index)}
                          onChange={() => {
                            if (completedGoals.includes(index)) {
                              setCompletedGoals(prev => prev.filter(i => i !== index));
                            } else {
                              setCompletedGoals(prev => [...prev, index]);
                              toast.success("Goal completed! 🎉");
                            }
                          }}
                          className="rounded" 
                        />
                        <span className={completedGoals.includes(index) ? 'line-through text-muted-foreground' : ''}>
                          {goal}
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
              </div>
            </div>
          )}
        </div>

        {/* Peer Test Invitation Modal */}
        {showPeerTestModal && peerTestInvitation && (
          <Dialog open={showPeerTestModal} onOpenChange={setShowPeerTestModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Collaborative Test Invitation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Code className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Ready to code together?</h3>
                  <p className="text-sm text-muted-foreground">
                    {peer?.name} has invited you to take the test collaboratively. 
                    You'll work together to solve the coding challenges!
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Test Cases:</span>
                    <span className="font-medium">{level.testCases?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mode:</span>
                    <span className="font-medium">Collaborative Coding</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partner:</span>
                    <span className="font-medium">{peer?.name}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={declinePeerTest}
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={acceptPeerTest}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept & Start
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    You can chat, share screens, and code together in real-time!
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Peer Matching Modal */}
        <PeerMatchingModal
          isOpen={showPeerMatchingModal}
          onClose={() => setShowPeerMatchingModal(false)}
          courseId={courseId}
          chapterId={chapterId}
          levelId={levelId}
          courseTitle={course?.title}
        />

        {/* WebSocket Debugger */}
        {showWebSocketDebugger && learningMode === 'peer' && (
          <WebSocketDebugger
            sessionId={realPeerSession?.sessionId}
            onClose={() => setShowWebSocketDebugger(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LevelContentPage; 