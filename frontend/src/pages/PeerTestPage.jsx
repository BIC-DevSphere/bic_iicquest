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
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Play,
  CheckCircle,
  X,
  ArrowRight,
  Trophy,
  Code,
  Terminal,
  Timer,
  Target,
  Loader2,
  Clock,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Settings,
  Users,
  MessageSquare,
  Video,
  Mic,
  Send,
  Sparkles,
  Share2,
  Eye,
  Pause,
  SkipForward,
  Monitor,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Lightbulb,
  ThumbsUp,
  Heart,
  FileText,
  Zap,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Flag,
  Flame
} from "lucide-react";
import {
  getCourseById,
  getChapterById,
  getLevelById,
  getLevelTestCases,
  getNextLevel
} from "@/services/courseService";
import { 
  getCourseProgress, 
  updateLevelProgress, 
  completeLevelTest,
  initializeProgress 
} from "@/services/userProgressService";
import { testCodeWithPiston, runSingleTestCase } from "@/services/codeExecutor";

const PeerTestPage = () => {
  const { courseId, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { peerSession, testData } = location.state || {};
  
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [level, setLevel] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [progress, setProgress] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [peerCode, setPeerCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [peerTestResults, setPeerTestResults] = useState([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isPeerTestRunning, setIsPeerTestRunning] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [peerAllTestsPassed, setPeerAllTestsPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [runningTestIndex, setRunningTestIndex] = useState(-1);
  const [language, setLanguage] = useState('python');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  
  // Peer collaboration states
  const [peer] = useState({
    id: 'peer123',
    name: 'Alex Chen',
    avatar: 'AC',
    status: 'online'
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [collaborationMode, setCollaborationMode] = useState('discuss');
  const [showPeerPanel, setShowPeerPanel] = useState(true);
  const [codeSync, setCodeSync] = useState(true);
  const [peerCursor, setPeerCursor] = useState({ line: 0, column: 0 });
  const [hints, setHints] = useState([]);
  const [currentHint, setCurrentHint] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [collaborativeNotes, setCollaborativeNotes] = useState('');
  const [testStrategy, setTestStrategy] = useState('');
  const [isLeader, setIsLeader] = useState(Math.random() > 0.5);

  // Leaderboard and Completion Tracking States
  const [leaderboard, setLeaderboard] = useState([]);
  const [myCompletionTime, setMyCompletionTime] = useState(null);
  const [peerCompletionTime, setPeerCompletionTime] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);
  const [myTestCaseCompletions, setMyTestCaseCompletions] = useState([]);
  const [peerTestCaseCompletions, setPeerTestCaseCompletions] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [competitiveMode, setCompetitiveMode] = useState(true);
  const [myScore, setMyScore] = useState(0);
  const [peerScore, setPeerScore] = useState(0);
  const [sessionPhase, setSessionPhase] = useState('preparation'); // preparation, testing, completed
  const [myRank, setMyRank] = useState(null);
  const [peerRank, setPeerRank] = useState(null);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [accuracyBonus, setAccuracyBonus] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winner, setWinner] = useState(null);

  // Refs
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    fetchTestData();
    initializePeerSession();
    initializeLeaderboard();
  }, [courseId, chapterId, levelId]);

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

  // Update leaderboard when completion times change
  useEffect(() => {
    updateLeaderboardRankings();
  }, [myCompletionTime, peerCompletionTime, myScore, peerScore]);

  const initializeLeaderboard = () => {
    const initialLeaderboard = [
      {
        id: 'me',
        name: 'You',
        avatar: 'YU',
        completionTime: null,
        score: 0,
        rank: null,
        status: 'preparing',
        testCaseCompletions: [],
        accuracy: 0,
        speedBonus: 0,
        accuracyBonus: 0
      },
      {
        id: peer.id,
        name: peer.name,
        avatar: peer.avatar,
        completionTime: null,
        score: 0,
        rank: null,
        status: 'preparing',
        testCaseCompletions: [],
        accuracy: 0,
        speedBonus: 0,
        accuracyBonus: 0
      }
    ];
    setLeaderboard(initialLeaderboard);
  };

  const updateLeaderboardRankings = () => {
    const participants = [
      {
        id: 'me',
        name: 'You',
        avatar: 'YU',
        completionTime: myCompletionTime,
        score: myScore,
        testCaseCompletions: myTestCaseCompletions,
        accuracy: myTestCaseCompletions.length > 0 ? 
          (myTestCaseCompletions.filter(t => t.passed).length / myTestCaseCompletions.length) * 100 : 0,
        speedBonus: speedBonus,
        accuracyBonus: accuracyBonus,
        status: allTestsPassed ? 'completed' : (isTestRunning ? 'testing' : 'preparing')
      },
      {
        id: peer.id,
        name: peer.name,
        avatar: peer.avatar,
        completionTime: peerCompletionTime,
        score: peerScore,
        testCaseCompletions: peerTestCaseCompletions,
        accuracy: peerTestCaseCompletions.length > 0 ? 
          (peerTestCaseCompletions.filter(t => t.passed).length / peerTestCaseCompletions.length) * 100 : 0,
        speedBonus: 0,
        accuracyBonus: 0,
        status: peerAllTestsPassed ? 'completed' : (isPeerTestRunning ? 'testing' : 'preparing')
      }
    ];

    // Sort by completion time (faster first), then by score
    participants.sort((a, b) => {
      if (a.completionTime && b.completionTime) {
        if (a.completionTime !== b.completionTime) {
          return a.completionTime - b.completionTime;
        }
        return b.score - a.score;
      }
      if (a.completionTime && !b.completionTime) return -1;
      if (!a.completionTime && b.completionTime) return 1;
      return b.score - a.score;
    });

    // Assign ranks
    participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    setLeaderboard(participants);
    
    const myEntry = participants.find(p => p.id === 'me');
    const peerEntry = participants.find(p => p.id === peer.id);
    
    setMyRank(myEntry?.rank);
    setPeerRank(peerEntry?.rank);
  };

  const calculateScore = (testResults, completionTime) => {
    if (!testResults || testResults.length === 0) return 0;
    
    const baseScore = testResults.filter(r => r.passed).length * 100;
    const accuracy = (testResults.filter(r => r.passed).length / testResults.length) * 100;
    
    let timeBonus = 0;
    if (completionTime) {
      // Bonus points for faster completion (max 200 points)
      const maxTime = 600; // 10 minutes
      timeBonus = Math.max(0, Math.floor((maxTime - completionTime) / maxTime * 200));
    }
    
    const accuracyBonus = accuracy === 100 ? 150 : Math.floor(accuracy * 1.5);
    
    return baseScore + timeBonus + accuracyBonus;
  };

  const simulatePeerProgress = () => {
    // Simulate peer making progress at random intervals
    const peerProgressInterval = setInterval(() => {
      if (peerAllTestsPassed || !isSessionActive) {
        clearInterval(peerProgressInterval);
        return;
      }

      if (Math.random() > 0.7 && peerTestCaseCompletions.length < testCases.length) {
        const nextTestIndex = peerTestCaseCompletions.length;
        const passed = Math.random() > 0.3; // 70% chance of passing
        
        const newCompletion = {
          index: nextTestIndex,
          passed: passed,
          completionTime: sessionTimer + Math.floor(Math.random() * 30),
          testCase: testCases[nextTestIndex]?.description || `Test ${nextTestIndex + 1}`
        };

        setPeerTestCaseCompletions(prev => [...prev, newCompletion]);
        
        const message = {
          id: Date.now(),
          sender: 'peer',
          text: passed ? 
            `✅ Passed test ${nextTestIndex + 1}! Moving to the next one.` :
            `❌ Failed test ${nextTestIndex + 1}. Let me debug this...`,
          timestamp: new Date().toISOString(),
          type: passed ? 'achievement' : 'message'
        };
        setMessages(prev => [...prev, message]);

        // Check if peer completed all tests
        if (peerTestCaseCompletions.length + 1 === testCases.length && passed) {
          const completionTime = sessionTimer + Math.floor(Math.random() * 30);
          setPeerCompletionTime(completionTime);
          setPeerAllTestsPassed(true);
          
          const allPeerResults = [...peerTestCaseCompletions, newCompletion];
          const score = calculateScore(allPeerResults, completionTime);
          setPeerScore(score);

          const congratsMessage = {
            id: Date.now() + 1,
            sender: 'peer',
            text: `🎉 All tests completed! Total time: ${formatTime(completionTime)}`,
            timestamp: new Date().toISOString(),
            type: 'achievement'
          };
          setMessages(prev => [...prev, congratsMessage]);
          
          // Check if peer won the competition
          if (!allTestsPassed) {
            setWinner('peer');
            setShowCelebration(true);
            
            const peerWinMessage = {
              id: Date.now() + 2,
              sender: 'system',
              text: `🏆 ${peer.name} won the competition! They completed in ${formatTime(completionTime)}!`,
              timestamp: new Date().toISOString(),
              type: 'achievement'
            };
            setMessages(prev => [...prev, peerWinMessage]);
          }
        }
      }
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    return () => clearInterval(peerProgressInterval);
  };

  const initializePeerSession = () => {
    setMessages([
      {
        id: 1,
        sender: 'system',
        text: '🚀 Collaborative test session started! Compete to see who completes faster.',
        timestamp: new Date().toISOString(),
        type: 'system'
      },
      {
        id: 2,
        sender: 'peer',
        text: `Hi! Ready for a friendly competition? Let's see who can solve these tests faster! 🏁`,
        timestamp: new Date().toISOString(),
        type: 'message'
      }
    ]);

    setHints([
      "Break down the problem into smaller steps",
      "Consider edge cases in your solution",
      "Think about the time complexity",
      "Test with simple examples first",
      "Review each other's approach before coding"
    ]);

    setSessionPhase('preparation');
    setTestStartTime(Date.now());
    
    // Start simulating peer progress
    setTimeout(simulatePeerProgress, 10000); // Start after 10 seconds

    toast.success(`Connected with ${peer.name}! Competitive mode enabled.`);
  };

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const [courseData, chapterData, levelData, testCasesData] = await Promise.all([
        getCourseById(courseId),
        getChapterById(courseId, chapterId),
        getLevelById(courseId, chapterId, levelId),
        getLevelTestCases(courseId, chapterId, levelId)
      ]);

      setCourse(courseData);
      setChapter(chapterData);
      setLevel(levelData);
      setTestCases(testCasesData);
      setUserCode(levelData.starterCode || getStarterCode(language));
      setPeerCode(levelData.starterCode || getStarterCode(language));

      try {
        const nextLevelData = await getNextLevel(courseId, chapterId, levelId);
        setNextLevel(nextLevelData);
      } catch (err) {
        console.log("No next level available");
      }

      try {
        const progressData = await getCourseProgress(courseId);
        setProgress(progressData);
      } catch (err) {
        console.log("No progress data available");
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch test data");
      console.error("Error fetching test data:", err);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async (codeToRun = userCode, isMyTest = true) => {
    if (!codeToRun.trim()) {
      toast.error("Please write some code before running tests!");
      return;
    }

    const setRunning = isMyTest ? setIsTestRunning : setIsPeerTestRunning;
    const setResults = isMyTest ? setTestResults : setPeerTestResults;
    const setAllPassed = isMyTest ? setAllTestsPassed : setPeerAllTestsPassed;

    setRunning(true);
    setResults([]);
    setCurrentTestIndex(0);
    
    if (isMyTest && sessionPhase === 'preparation') {
      setSessionPhase('testing');
      setTestStartTime(Date.now());
    }

    const startTime = Date.now();
    const testCompletions = [];

    try {
      const results = [];
      
      for (let i = 0; i < testCases.length; i++) {
        setRunningTestIndex(i);
        setCurrentTestIndex(i);
        
        const toastMsg = isMyTest ? 
          `Running your test ${i + 1} of ${testCases.length}...` :
          `Running ${peer.name}'s test ${i + 1} of ${testCases.length}...`;
        
        toast.loading(toastMsg, { id: 'execution' });
        
        try {
          const result = await runSingleTestCase(codeToRun, testCases[i], i, language);
          results.push(result);
          setResults([...results]);
          
          // Track individual test completion
          const completion = {
            index: i,
            passed: result.passed,
            completionTime: Math.floor((Date.now() - startTime) / 1000),
            testCase: testCases[i].description
          };
          testCompletions.push(completion);
          
          if (isMyTest) {
            setMyTestCaseCompletions(prev => [...prev, completion]);
            
            // Add real-time message for each test
            const message = {
              id: Date.now(),
              sender: 'me',
              text: result.passed ? 
                `✅ Passed test ${i + 1}!` :
                `❌ Failed test ${i + 1}. Debugging...`,
              timestamp: new Date().toISOString(),
              type: result.passed ? 'achievement' : 'message'
            };
            setMessages(prev => [...prev, message]);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error in test ${i + 1}:`, error);
          const errorResult = {
            testCase: testCases[i].description,
            expected: testCases[i].expectedOutput,
            actual: '',
            passed: false,
            error: error.message,
            hint: testCases[i].hint,
            index: i
          };
          results.push(errorResult);
          setResults([...results]);
          
          const completion = {
            index: i,
            passed: false,
            completionTime: Math.floor((Date.now() - startTime) / 1000),
            testCase: testCases[i].description
          };
          testCompletions.push(completion);
          
          if (isMyTest) {
            setMyTestCaseCompletions(prev => [...prev, completion]);
          }
        }
      }
      
      setRunningTestIndex(-1);
      toast.dismiss('execution');
      
      const allPassed = results.every(result => result.passed);
      setAllPassed(allPassed);
      setRunning(false);

      // Calculate completion time and score
      if (isMyTest && allPassed) {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        setMyCompletionTime(totalTime);
        
        const score = calculateScore(results, totalTime);
        setMyScore(score);
        
        // Calculate bonuses
        const timeBonus = Math.max(0, Math.floor((600 - totalTime) / 600 * 200));
        const accBonus = 150; // Perfect accuracy
        setSpeedBonus(timeBonus);
        setAccuracyBonus(accBonus);
        
        setSessionPhase('completed');
        
        const completionMessage = {
          id: Date.now(),
          sender: 'me',
          text: `🎉 All tests completed! Time: ${formatTime(totalTime)} | Score: ${score}`,
          timestamp: new Date().toISOString(),
          type: 'achievement'
        };
        setMessages(prev => [...prev, completionMessage]);
        
        toast.success(`🎉 All tests passed in ${formatTime(totalTime)}! Score: ${score}`);
        setShowLeaderboard(true);
        
        // Check if this is the first completion (winner)
        if (!peerAllTestsPassed) {
          setWinner('me');
          setShowCelebration(true);
          
          const winMessage = {
            id: Date.now() + 1,
            sender: 'system',
            text: `🏆 You won the competition! Completed in ${formatTime(totalTime)} with ${score} points!`,
            timestamp: new Date().toISOString(),
            type: 'achievement'
          };
          setMessages(prev => [...prev, winMessage]);
        }
      } else if (isMyTest) {
        const failedCount = results.filter(r => !r.passed).length;
        toast.error(`${failedCount} test${failedCount > 1 ? 's' : ''} failed. Keep trying!`);
      }

      if (!isMyTest && allPassed) {
        const successMsg = `🎉 ${peer.name}'s tests all passed!`;
        toast.success(successMsg);
        
        const message = {
          id: Date.now(),
          sender: 'peer',
          text: `✅ All tests passed! Great work!`,
          timestamp: new Date().toISOString(),
          type: 'achievement'
        };
        setMessages(prev => [...prev, message]);
      } else if (!isMyTest) {
        const failedCount = results.filter(r => !r.passed).length;
        const failMsg = `${peer.name} has ${failedCount} test${failedCount > 1 ? 's' : ''} failing.`;
        toast.error(failMsg);
      }
    } catch (error) {
      console.error("Error running tests:", error);
      toast.dismiss('execution');
      toast.error("Failed to execute code. Please try again.");
      setRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarterCode = (lang) => {
    const starters = {
      python: `# Collaborative Test - ${peer.name} & You
# Write your solution here
def solve():
    pass

# Test your solution
if __name__ == "__main__":
    print(solve())`,
      javascript: `// Collaborative Test - ${peer.name} & You
// Write your solution here
function solve() {
    
}

// Test your solution
console.log(solve());`
    };
    
    return starters[lang] || starters.python;
  };

  const handleBackToContent = () => {
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`, {
      state: { learningMode: 'peer' }
    });
  };

  const sendMessage = () => {
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
    
    // Simulate peer response after a delay
    setTimeout(() => {
      const responses = [
        "Good point! Let me think about that.",
        "I'm working on the same issue!",
        "Nice approach! Keep going!",
        "That's a clever solution!",
        "I'm stuck on this part too.",
        "Great progress! You're doing well!"
      ];
      
      const peerResponse = {
        id: Date.now() + 1,
        sender: 'peer',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      
      setMessages(prev => [...prev, peerResponse]);
    }, 1000 + Math.random() * 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 mx-auto flex items-center justify-center animate-pulse">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-muted-foreground">Loading collaborative test environment...</p>
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
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchTestData} size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="space-y-6 border-b pb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToContent}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">{formatTime(sessionTimer)}</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="text-sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowPeerPanel(!showPeerPanel)}
                className="text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                {showPeerPanel ? 'Hide' : 'Show'} Peer Panel
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{course?.title}</span>
              <ArrowRight className="w-4 h-4" />
              <span>Chapter {chapter?.order}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">Level {level?.order} - Collaborative Test</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{level?.title} - Peer Test</h1>
                <p className="text-muted-foreground">
                  Competitive mode with {peer.name} • {testCases.length} test cases
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Live Status Indicators */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">YU</AvatarFallback>
                    </Avatar>
                    <div className={`w-2 h-2 rounded-full ${
                      allTestsPassed ? 'bg-green-400' : 
                      isTestRunning ? 'bg-yellow-400 animate-pulse' : 
                      'bg-gray-400'
                    }`}></div>
                    {myRank && (
                      <Badge variant={myRank === 1 ? 'default' : 'secondary'} className="text-xs">
                        #{myRank}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-px h-6 bg-border"></div>
                  
                  <div className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{peer.avatar}</AvatarFallback>
                    </Avatar>
                    <div className={`w-2 h-2 rounded-full ${
                      peerAllTestsPassed ? 'bg-green-400' : 
                      isPeerTestRunning ? 'bg-yellow-400 animate-pulse' : 
                      'bg-gray-400'
                    }`}></div>
                    {peerRank && (
                      <Badge variant={peerRank === 1 ? 'default' : 'secondary'} className="text-xs">
                        #{peerRank}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Leaderboard */}
            {showLeaderboard && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-lg">Live Leaderboard</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sessionPhase === 'completed' ? 'Final Results' : 'Live'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboard.map((participant, index) => (
                    <div 
                      key={participant.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        participant.id === 'me' 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white border-gray-200'
                      } ${
                        participant.rank === 1 && participant.completionTime 
                          ? 'ring-2 ring-yellow-400 ring-opacity-50' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {participant.rank === 1 && participant.completionTime ? (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          ) : participant.rank === 2 && participant.completionTime ? (
                            <Medal className="w-5 h-5 text-gray-400" />
                          ) : participant.rank === 3 && participant.completionTime ? (
                            <Medal className="w-5 h-5 text-amber-600" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                              {participant.rank || '-'}
                            </div>
                          )}
                        </div>
                        
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">{participant.avatar}</AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{participant.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={`capitalize px-2 py-1 rounded text-xs ${
                              participant.status === 'completed' ? 'bg-green-100 text-green-700' :
                              participant.status === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {participant.status}
                            </span>
                            {participant.accuracy > 0 && (
                              <span>{Math.round(participant.accuracy)}% accuracy</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          {participant.completionTime ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-mono">
                                {formatTime(participant.completionTime)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">In progress...</span>
                          )}
                        </div>
                        
                        {participant.score > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-sm font-semibold">{participant.score}</span>
                          </div>
                        )}
                        
                        {participant.testCaseCompletions.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs">
                              {participant.testCaseCompletions.filter(t => t.passed).length}/{testCases.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {sessionPhase === 'completed' && myRank && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <div className="text-center space-y-2">
                        <h4 className="font-semibold text-sm">Your Performance</h4>
                        <div className="flex justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-500" />
                            <span>Speed Bonus: +{speedBonus}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-green-500" />
                            <span>Accuracy Bonus: +{accuracyBonus}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {myRank === 1 ? '🎉 Congratulations! You finished first!' :
                           myRank === 2 ? '🥈 Great job! Second place!' :
                           myRank === 3 ? '🥉 Well done! Third place!' :
                           `You finished in ${myRank}${myRank % 10 === 1 ? 'st' : myRank % 10 === 2 ? 'nd' : myRank % 10 === 3 ? 'rd' : 'th'} place!`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          {/* Main Test Area */}
          <div className={`${showPeerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Collaborative Code Editor</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => runTests(userCode, true)}
                        disabled={isTestRunning}
                      >
                        {isTestRunning ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        Run Tests
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Editor
                    height="400px"
                    defaultLanguage={language}
                    value={userCode}
                    onChange={(value) => setUserCode(value || '')}
                    theme={editorTheme}
                    options={{
                      minimap: { enabled: false },
                      fontSize: fontSize,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on'
                    }}
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                  />
                </CardContent>
              </Card>

              {/* Test Results */}
              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-medium">Test Results</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Test {index + 1}</span>
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.testCase}</p>
                        {!result.passed && result.error && (
                          <p className="text-sm text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {allTestsPassed && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Trophy className="w-4 h-4 mr-2" />
                    Submit Solution
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Peer Panel */}
          {showPeerPanel && (
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                {/* Competition Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Competition Status</h3>
                      <Badge variant="secondary" className="text-xs">
                        {sessionPhase}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {/* Your Status */}
                      <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">YU</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">You</span>
                          {myRank && <Badge variant="outline" className="text-xs">#{myRank}</Badge>}
                        </div>
                        <div className="text-right text-xs">
                          {allTestsPassed ? (
                            <div className="text-green-600 font-medium">✅ Completed</div>
                          ) : isTestRunning ? (
                            <div className="text-yellow-600 animate-pulse">🏃 Testing...</div>
                          ) : (
                            <div className="text-gray-500">⏳ Ready</div>
                          )}
                          {myCompletionTime && (
                            <div className="text-muted-foreground">{formatTime(myCompletionTime)}</div>
                          )}
                          {myScore > 0 && (
                            <div className="text-blue-600 font-semibold">{myScore} pts</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Peer Status */}
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{peer.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{peer.name}</span>
                          {peerRank && <Badge variant="outline" className="text-xs">#{peerRank}</Badge>}
                        </div>
                        <div className="text-right text-xs">
                          {peerAllTestsPassed ? (
                            <div className="text-green-600 font-medium">✅ Completed</div>
                          ) : isPeerTestRunning ? (
                            <div className="text-yellow-600 animate-pulse">🏃 Testing...</div>
                          ) : (
                            <div className="text-gray-500">⏳ Ready</div>
                          )}
                          {peerCompletionTime && (
                            <div className="text-muted-foreground">{formatTime(peerCompletionTime)}</div>
                          )}
                          {peerScore > 0 && (
                            <div className="text-blue-600 font-semibold">{peerScore} pts</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Overview */}
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      <div className="flex items-center justify-center gap-1">
                        <Timer className="w-3 h-3" />
                        Session: {formatTime(sessionTimer)}
                      </div>
                      {(myTestCaseCompletions.length > 0 || peerTestCaseCompletions.length > 0) && (
                        <div className="mt-1">
                          Tests: You {myTestCaseCompletions.filter(t => t.passed).length}/{testCases.length} • 
                          {peer.name} {peerTestCaseCompletions.filter(t => t.passed).length}/{testCases.length}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-96 flex flex-col">
                  <CardHeader className="border-b pb-3">
                    <h3 className="font-medium text-sm">Collaboration Chat</h3>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-2 rounded-lg text-sm ${
                              message.sender === 'me'
                                ? 'bg-primary text-primary-foreground'
                                : message.sender === 'system'
                                ? 'bg-blue-100 text-blue-800 text-center italic'
                                : message.type === 'achievement'
                                ? 'bg-green-100 text-green-800 border-l-4 border-green-400'
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

                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="text-sm resize-none"
                        rows={2}
                      />
                      <Button 
                        size="icon" 
                        className="h-16 w-12"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {winner === 'me' ? (
                <div className="space-y-2">
                  <div className="text-2xl">🏆</div>
                  <div className="text-xl text-yellow-600">Congratulations!</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl">🥈</div>
                  <div className="text-xl text-blue-600">Good Effort!</div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {winner === 'me' ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">You Won the Competition! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  You completed all tests first with a score of {myScore} points!
                </p>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Time: {myCompletionTime && formatTime(myCompletionTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Score: {myScore}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-blue-600">{peer.name} Won!</p>
                <p className="text-sm text-muted-foreground">
                  {peer.name} completed all tests first. Great effort though!
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep practicing to improve your speed and accuracy.
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCelebration(false)}
              >
                Continue Session
              </Button>
              <Button 
                size="sm"
                onClick={handleBackToContent}
              >
                Back to Learning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeerTestPage; 