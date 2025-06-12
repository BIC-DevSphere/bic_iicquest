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
  Zap
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

  // Refs
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionTimerRef = useRef(null);

  useEffect(() => {
    fetchTestData();
    initializePeerSession();
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

  const initializePeerSession = () => {
    setMessages([
      {
        id: 1,
        sender: 'system',
        text: '🚀 Collaborative test session started! Work together to solve the challenges.',
        timestamp: new Date().toISOString(),
        type: 'system'
      },
      {
        id: 2,
        sender: 'peer',
        text: `Hi! Ready to tackle this test together? I suggest we start by discussing the approach!`,
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

    toast.success(`Connected with ${peer.name}! Starting collaborative test session.`);
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
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error in test ${i + 1}:`, error);
          results.push({
            testCase: testCases[i].description,
            expected: testCases[i].expectedOutput,
            actual: '',
            passed: false,
            error: error.message,
            hint: testCases[i].hint,
            index: i
          });
          setResults([...results]);
        }
      }
      
      setRunningTestIndex(-1);
      toast.dismiss('execution');
      
      const allPassed = results.every(result => result.passed);
      setAllPassed(allPassed);
      setRunning(false);

      if (allPassed) {
        const successMsg = isMyTest ? 
          "🎉 All your tests passed!" :
          `🎉 ${peer.name}'s tests all passed!`;
        toast.success(successMsg);
        
        const message = {
          id: Date.now(),
          sender: isMyTest ? 'me' : 'peer',
          text: `✅ All tests passed! Great work!`,
          timestamp: new Date().toISOString(),
          type: 'achievement'
        };
        setMessages(prev => [...prev, message]);
      } else {
        const failedCount = results.filter(r => !r.passed).length;
        const failMsg = isMyTest ?
          `${failedCount} test${failedCount > 1 ? 's' : ''} failed. Check the results below.` :
          `${peer.name} has ${failedCount} test${failedCount > 1 ? 's' : ''} failing.`;
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
                  Working with {peer.name} • {testCases.length} test cases
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">{peer.avatar}</AvatarFallback>
                </Avatar>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
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
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Peer Session</h3>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{peer.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{peer.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      Working together for {formatTime(sessionTimer)}
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
                        placeholder="Type your message..."
                        className="text-sm resize-none"
                        rows={2}
                      />
                      <Button size="icon" className="h-16 w-12">
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
    </div>
  );
};

export default PeerTestPage; 