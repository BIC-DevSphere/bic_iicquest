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
  XIcon
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
  const [sharedCodeEditor, setSharedCodeEditor] = useState('');
  const [peerProgress, setPeerProgress] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [peerCursor, setPeerCursor] = useState({ line: 0, column: 0 });
  const [studyMode, setStudyMode] = useState('guided'); // 'guided', 'discussion', 'practice'
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
  
  // Refs for real-time features
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    fetchLevelData();
  }, [courseId, chapterId, levelId]);

  useEffect(() => {
    if (learningMode === 'peer') {
      // Check if we have a real session from state
      const sessionData = location.state?.peerSession;
      if (sessionData) {
        setRealPeerSession(sessionData);
        initializeRealPeerSession(sessionData);
      } else {
        initializePeerSession();
      }
    }
  }, [learningMode, location.state]);

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

  const initializeRealPeerSession = async (sessionData) => {
    try {
      // Fetch real session data from backend
      const response = await getSessionById(sessionData.sessionId);
      const session = response.session;
      
      // Set up real peer data
      const peerParticipant = session.participants.find(p => p.user._id !== 'currentUserId'); // Replace with actual user ID
      const peerData = {
        id: peerParticipant.user._id,
        name: peerParticipant.user.fullName,
        avatar: peerParticipant.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
        status: peerParticipant.isOnline ? 'online' : 'offline',
        level: 'Intermediate',
        studyTime: 45,
        completedLevels: 12,
        currentStreak: 7
      };
      
      setPeer(peerData);
      setRealPeerSession(session);
      setIsSessionLeader(peerParticipant.role === 'leader');
      setIsSessionActive(true);
      setShowPeerPanel(true);
      
      // Load session messages
      setMessages(session.messages.map(msg => ({
        id: msg._id,
        sender: msg.sender._id === 'currentUserId' ? 'me' : 'peer', // Replace with actual user ID check
        text: msg.text,
        timestamp: msg.timestamp,
        type: msg.type
      })));
      
      // Initialize session goals
      setSessionGoals(session.sessionGoals.map(goal => goal.description));
      setCompletedGoals(session.sessionGoals
        .map((goal, index) => goal.isCompleted ? index : -1)
        .filter(index => index !== -1)
      );
      
      toast.success(`Connected to real session with ${peerData.name}!`);
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
    if (direction === 'next' && currentContentIndex < content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (direction === 'prev' && currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
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
    
    const message = {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Send to real session if available
    if (realPeerSession) {
      try {
        await addMessageToSession(realPeerSession.sessionId, {
          text: newMessage,
          type: 'message'
        });
      } catch (error) {
        console.error('Error sending message to session:', error);
      }
    } else {
      // Simulate peer response for demo
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

    setPeerTestInvitation({
      levelId,
      testCases: level.testCases,
      invitedBy: 'me',
      timestamp: new Date().toISOString()
    });
    setShowPeerTestModal(true);
    
    // Send invitation message
    const inviteMessage = {
      id: Date.now(),
      sender: 'me',
      text: "🎯 Invited you to take the test together! Let's solve it collaboratively.",
      timestamp: new Date().toISOString(),
      type: 'invitation'
    };
    setMessages(prev => [...prev, inviteMessage]);
  };

  const acceptPeerTest = () => {
    setIsInPeerTest(true);
    setShowPeerTestModal(false);
    
    // Initialize collaborative test data
    setPeerTestData({
      currentQuestion: 0,
      answers: {},
      peerAnswers: {},
      startTime: Date.now(),
      isCollaborative: true
    });
    
    const acceptMessage = {
      id: Date.now(),
      sender: 'peer',
      text: "✅ Accepted test invitation! Let's code together.",
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setMessages(prev => [...prev, acceptMessage]);
    
    // Navigate to collaborative test mode
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}/peer-test`, {
      state: { 
        learningMode: 'peer',
        peerSession,
        testData: peerTestData
      }
    });
  };

  const addCollaborativeNote = (note) => {
    const timestamp = new Date().toISOString();
    const noteEntry = {
      id: Date.now(),
      author: 'me',
      content: note,
      timestamp,
      contentIndex: currentContentIndex
    };
    
    setCollaborativeNotes(prev => prev + `\n[${new Date().toLocaleTimeString()}] You: ${note}`);
    
    // Simulate peer adding to notes
    setTimeout(() => {
      const peerNote = "Great note! I'll add my thoughts too.";
      setCollaborativeNotes(prev => prev + `\n[${new Date().toLocaleTimeString()}] ${peer.name}: ${peerNote}`);
    }, 2000);
  };

  const createStudyQuestion = () => {
    const questions = [
      "What is the main concept being discussed in this section?",
      "How would you explain this to someone who's completely new?", 
      "What are some real-world applications of this concept?",
      "What challenges might we face when implementing this?",
      "How does this relate to what we learned previously?"
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const questionObj = {
      id: Date.now(),
      question: randomQuestion,
      askedBy: 'me',
      timestamp: new Date().toISOString(),
      contentIndex: currentContentIndex
    };
    
    setSharedQuestions(prev => [...prev, questionObj]);
    
    const questionMessage = {
      id: Date.now(),
      sender: 'me',
      text: `💡 Study Question: ${randomQuestion}`,
      timestamp: new Date().toISOString(),
      type: 'question'
    };
    setMessages(prev => [...prev, questionMessage]);
  };

  const addReaction = (emoji) => {
    const reaction = {
      id: Date.now(),
      emoji,
      sender: 'me',
      timestamp: new Date().toISOString(),
      contentIndex: currentContentIndex
    };
    
    setPeerReactions(prev => [...prev, reaction]);
    
    // Simulate peer reaction
    setTimeout(() => {
      const peerReaction = {
        id: Date.now() + 1,
        emoji: ['👍', '❤️', '🔥', '💯'][Math.floor(Math.random() * 4)],
        sender: 'peer',
        timestamp: new Date().toISOString(),
        contentIndex: currentContentIndex
      };
      setPeerReactions(prev => [...prev, peerReaction]);
    }, 1000);
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
        
        stream.getTracks().forEach(track => track.stop());
        toast.success("Voice note recorded!");
      };
      
      setIsRecording(true);
      const recordingStartTime = Date.now();
      mediaRecorder.start();
      
      toast.success("Recording voice note...");
    } catch (error) {
      toast.error("Could not access microphone.");
    }
  };

  const stopVoiceNote = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      setScreenSharing(true);
      
      const shareMessage = {
        id: Date.now(),
        sender: 'system',
        text: "Started screen sharing",
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      setMessages(prev => [...prev, shareMessage]);
      
      toast.success("Screen sharing started!");
      
      stream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        toast.info("Screen sharing ended.");
      };
    } catch (error) {
      toast.error("Could not start screen sharing.");
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="space-y-6 border-b pb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToChapters}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            {learningMode === 'peer' ? (
              <div className="flex gap-2">
                {peer && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPeerPanel(!showPeerPanel)}
                    className="text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {showPeerPanel ? 'Hide Peer Panel' : 'Show Peer Panel'}
                  </Button>
                )}
                {!peer && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPeerMatchingModal(true)}
                    className="text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Learning Partner
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{course?.title}</span>
              <ChevronRight className="w-4 h-4" />
              <span>Chapter {chapter?.order}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium">Level {level.order}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{level.title}</h1>
                <p className="text-muted-foreground">{level.description}</p>
              </div>
              
              {isLevelCompleted && (
                <Badge variant="default" className="bg-emerald-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(level.estimatedTime || 30)}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {content.length} sections
              </div>
              {level.testCases?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {level.testCases.length} test cases
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          {/* Main Content Area */}
          <div className={`${showPeerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {content.length > 0 ? (
              <div className="space-y-8">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">{currentContent?.title}</h2>
                      <Badge variant="secondary">
                        {currentContentIndex + 1} of {content.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Content Text */}
                    <div className="prose max-w-none">
                      <div className="text-foreground leading-relaxed whitespace-pre-wrap">
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
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => learningMode === 'peer' ? syncContentNavigation('prev') : handleContentNavigation('prev')}
                        disabled={currentContentIndex === 0 || (learningMode === 'peer' && !isSessionLeader)}
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                        {learningMode === 'peer' && !isSessionLeader && (
                          <span className="ml-1 text-xs text-muted-foreground">(Leader only)</span>
                        )}
                      </Button>

                      <div className="flex gap-2">
                        {content.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => learningMode === 'peer' && !isSessionLeader ? null : setCurrentContentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentContentIndex 
                                ? 'bg-primary' 
                                : index < currentContentIndex 
                                  ? 'bg-primary/30' 
                                  : 'bg-muted'
                            } ${learningMode === 'peer' && !isSessionLeader ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            title={learningMode === 'peer' && !isSessionLeader ? 'Only session leader can navigate' : `Go to section ${index + 1}`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => learningMode === 'peer' ? syncContentNavigation('next') : handleContentNavigation('next')}
                        disabled={currentContentIndex === content.length - 1 || (learningMode === 'peer' && !isSessionLeader)}
                        size="sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                        {learningMode === 'peer' && !isSessionLeader && (
                          <span className="ml-1 text-xs text-muted-foreground">(Leader only)</span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    {level.testCases?.length > 0 && (
                      <>
                        {learningMode === 'solo' ? (
                          <Button onClick={handleStartTest} size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Take Test
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button onClick={handleStartTest} variant="outline" size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Solo Test
                            </Button>
                            <Button onClick={startCollaborativeTest} size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Users className="w-4 h-4 mr-2" />
                              Peer Test
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {(!level.testCases?.length || isLevelCompleted) && nextLevel && (
                      <Button onClick={handleNextLevel} size="sm">
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

                  {/* Peer Learning Quick Actions */}
                  {learningMode === 'peer' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={createStudyQuestion}>
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Ask Question
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addReaction('👍')}>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const note = prompt("Add a collaborative note:");
                        if (note) addCollaborativeNote(note);
                      }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareScreen}>
                        <Monitor className="w-4 h-4 mr-2" />
                        Share Screen
                      </Button>
                    </div>
                  )}

                  {/* Peer Reactions Display */}
                  {learningMode === 'peer' && peerReactions.length > 0 && (
                    <div className="flex gap-2 items-center pt-2">
                      <span className="text-sm text-muted-foreground">Reactions:</span>
                      {peerReactions
                        .filter(r => r.contentIndex === currentContentIndex)
                        .slice(-5)
                        .map((reaction, index) => (
                          <span key={index} className="text-lg animate-bounce">
                            {reaction.emoji}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">No content available</h3>
                      <p className="text-sm text-muted-foreground">This level doesn't have any content yet.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Peer Learning Workspace */}
          {learningMode === 'peer' && showPeerPanel && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Session Status Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <h3 className="font-medium">Live Session</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {formatSessionTime(sessionTimer)}
                      </Badge>
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
                              onClick={shareScreen}
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
                          <div className="flex-1">
                            <Textarea
                              value={collaborativeNotes}
                              onChange={(e) => setCollaborativeNotes(e.target.value)}
                              placeholder="Collaborative notes will appear here as you and your peer add them..."
                              className="h-full resize-none text-sm"
                            />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              const note = prompt("Add a note:");
                              if (note) addCollaborativeNote(note);
                            }}>
                              <Pencil className="w-3 h-3 mr-1" />
                              Add Note
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code" className="mt-0 flex-1 flex flex-col">
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-2 flex justify-between items-center">
                            <span className="text-sm font-medium">Shared Code Editor</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => {
                                navigator.clipboard.writeText(sharedCodeEditor);
                                toast.success("Code copied!");
                              }}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 border rounded-lg overflow-hidden">
                            <Editor
                              height="300px"
                              defaultLanguage="python"
                              value={sharedCodeEditor}
                              onChange={(value) => setSharedCodeEditor(value || '')}
                              theme="vs-light"
                              options={{
                                minimap: { enabled: false },
                                fontSize: 12,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                              }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Live collaborative coding • Peer cursor: Line {peerCursor.line}
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
                    onClick={() => setShowPeerTestModal(false)}
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
      </div>
    </div>
  );
};

export default LevelContentPage; 