import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Play,
  CheckCircle,
  X,
  ArrowRight,
  Trophy,
  Lightbulb,
  Code,
  Terminal,
  Timer,
  Target,
  Loader2,
  Zap,
  Clock,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Settings,
  Users,
  MessageSquare,
  Send,
  Medal
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
import peerTestService from "@/services/peerTestService";
import PeerMatchingModal from "@/components/PeerMatchingModal";

const LevelTestPage = () => {
  const { courseId, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a peer test session
  const peerSessionData = location.state?.peerSession;
  const testData = location.state?.testData;
  
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [level, setLevel] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [progress, setProgress] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [testAttempts, setTestAttempts] = useState(0);
  const [maxAttempts] = useState(5);
  const [codeHistory, setCodeHistory] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState('python'); // Default language
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [runningTestIndex, setRunningTestIndex] = useState(-1);
  
  // Peer testing states
  const [isPeerTestMode, setIsPeerTestMode] = useState(false);
  const [peerTestSession, setPeerTestSession] = useState(null);
  const [showPeerInvite, setShowPeerInvite] = useState(false);
  const [peer, setPeer] = useState(null);
  const [peerTestResults, setPeerTestResults] = useState([]);
  const [peerCode, setPeerCode] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Competitive testing states
  const [myCompletionTime, setMyCompletionTime] = useState(null);
  const [peerCompletionTime, setPeerCompletionTime] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [myTestProgress, setMyTestProgress] = useState([]);
  const [peerTestProgress, setPeerTestProgress] = useState([]);
  const [competitionStartTime, setCompetitionStartTime] = useState(null);
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  
  const editorRef = useRef(null);

  useEffect(() => {
    fetchTestData();
    
    // Auto-start peer session if data is provided
    if (peerSessionData) {
      console.log('🎯 Starting peer test session with data:', peerSessionData);
      joinPeerTest(peerSessionData.sessionId);
    }
  }, [courseId, chapterId, levelId, peerSessionData]);

  // Cleanup peer test session on unmount
  useEffect(() => {
    return () => {
      if (peerTestService.isConnectedToTestSession()) {
        peerTestService.leaveSession();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && testStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - testStartTime);
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, testStartTime]);

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
      } catch (err) {
        console.log("No progress data available");
      }

      setTestStartTime(Date.now());
      setIsTimerRunning(true);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch test data");
      console.error("Error fetching test data:", err);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    // Check for empty code
    if (!userCode.trim()) {
      toast.error("Please write some code before running tests!");
      return;
    }

    // Check for code with only comments
    const codeWithoutComments = userCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*$|#.*$/gm, '').trim();
    if (!codeWithoutComments) {
      toast.error("Please write some executable code (not just comments) before running tests!");
      return;
    }

    if (testAttempts >= maxAttempts) {
      toast.error(`Maximum attempts (${maxAttempts}) reached. Please review your code carefully.`);
      return;
    }

    setIsTestRunning(true);
    setTestResults([]);
    setTestAttempts(prev => prev + 1);
    setCurrentTestIndex(0);

    // Update progress to mark level as in progress (first attempt only)
    if (testAttempts === 0) {
      try {
        await initializeProgress({ courseId });
        await updateLevelProgress({
          courseId,
          chapterId,
          levelId,
          timeSpent: Math.floor(elapsedTime / 60000) || 1
        });
      } catch (error) {
        console.log("Error updating level progress:", error);
      }
    }

    // Save code to history
    const codeSnapshot = {
      attempt: testAttempts + 1,
      code: userCode,
      timestamp: new Date()
    };
    setCodeHistory(prev => [...prev, codeSnapshot]);

    try {
      // Run tests individually
      await runTestsSequentially();
      
    } catch (error) {
      console.error("Error running tests:", error);
      toast.dismiss('execution');
      toast.error("Failed to execute code. Please try again.");
      setIsTestRunning(false);
    }
  };

  const runTestsSequentially = async () => {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      setRunningTestIndex(i);
      setCurrentTestIndex(i);
      
      toast.loading(`Running test ${i + 1} of ${testCases.length}...`, { id: 'execution' });
      
      try {
        const testStartTime = Date.now();
        const result = await runSingleTestCase(userCode, testCases[i], i, language);
        const testCompletionTime = Date.now() - testStartTime;
        
        results.push(result);
        setTestResults([...results]); // Update results incrementally
        
        // Track individual test progress
        const progressEntry = {
          testIndex: i,
          passed: result.passed,
          completionTime: testCompletionTime,
          timestamp: Date.now()
        };
        setMyTestProgress(prev => [...prev, progressEntry]);
        
        // Share test result and progress with peer if in peer test mode
        if (isPeerTestMode) {
          shareTestResult(i, result);
          peerTestService.shareTestProgress(i, result, testCompletionTime);
        }
        
        // Short delay to show progress
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
        setTestResults([...results]);
      }
    }
    
    setRunningTestIndex(-1);
    toast.dismiss('execution');
    
    const allPassed = results.every(result => result.passed);
    setAllTestsPassed(allPassed);
    setIsTestRunning(false);

    if (allPassed) {
      setIsTimerRunning(false);
      
      // Handle competitive peer testing
      if (isPeerTestMode && isCompetitionActive) {
        const completionTime = elapsedTime;
        setMyCompletionTime(completionTime);
        
        // Determine winner if peer has already completed
        if (peerCompletionTime) {
          if (completionTime < peerCompletionTime) {
            setWinner('me');
          } else {
            setWinner('peer');
          }
          setShowWinnerModal(true);
        } else {
          // Peer hasn't completed yet, just announce completion
          setWinner('me'); // Temporary - will be updated when peer completes
        }
        
        // Share completion with peer
        peerTestService.shareTestCompletion({
          completionTime: completionTime,
          score: 100,
          passedTests: results.length,
          totalTests: results.length
        });
        
        toast.success(`🏁 You completed in ${formatElapsedTime(completionTime)}! ${!peerCompletionTime ? 'Waiting for peer...' : ''}`);
      } else {
        setShowSubmitConfirm(true);
        toast.success("🎉 All tests passed! Ready to submit your solution.");
      }
    } else {
      const failedCount = results.filter(r => !r.passed).length;
      toast.error(`${failedCount} test${failedCount > 1 ? 's' : ''} failed. Check the results below.`);
    }
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    
    try {
      toast.loading("Submitting your solution...", { id: 'submit' });
      
      // Ensure progress is initialized first
      try {
        await initializeProgress({ courseId });
      } catch (initError) {
        console.log("Progress already initialized or error:", initError.message);
      }

      // Update progress - ensure the data structure matches backend expectations
      const timeSpent = Math.floor(elapsedTime / 60000); // Convert to minutes
      
      const submissionData = {
        courseId,
        chapterId,
        levelId,
        score: 100,
        timeSpent: timeSpent > 0 ? timeSpent : 1, // Ensure at least 1 minute
        code: userCode
      };

      console.log("Submitting solution with data:", submissionData);
      
      const result = await completeLevelTest(submissionData);
      console.log("Submission result:", result);
      
      setShowSubmitConfirm(false);
      toast.dismiss('submit');
      
      // Show success message
      toast.success("🎉 Solution submitted successfully! Level completed!", {
        duration: 4000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
        },
      });
      
      // Refresh progress data to reflect completion
      try {
        const updatedProgress = await getCourseProgress(courseId);
        setProgress(updatedProgress);
        console.log("Updated progress after completion:", updatedProgress);
      } catch (progressError) {
        console.log("Error fetching updated progress:", progressError);
      }

      // Small delay to let the backend process the completion
      setTimeout(() => {
        // Navigate based on next level availability
        if (nextLevel?.nextLevel || nextLevel?.courseCompleted) {
          handleNextLevel();
        } else {
          // Navigate back to content page to see the completed status
          handleBackToContent();
        }
      }, 2000); // Increased delay to ensure backend processing
      
    } catch (error) {
      console.error("Error submitting solution:", error);
      setShowSubmitConfirm(false);
      toast.dismiss('submit');
      
      // More specific error handling
      if (error.response?.data?.message) {
        toast.error(`Failed to submit: ${error.response.data.message}`);
      } else {
        toast.error("Failed to submit solution. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToContent = () => {
    console.log("Navigating back to content page");
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`);
  };

  const handleNextLevel = () => {
    console.log("Handling next level navigation", nextLevel);
    if (nextLevel?.nextLevel && nextLevel?.nextChapter) {
      console.log("Navigating to next chapter and level");
      navigate(`/course/${courseId}/chapter/${nextLevel.nextChapter._id}/level/${nextLevel.nextLevel._id}`);
    } else if (nextLevel?.nextLevel) {
      console.log("Navigating to next level in same chapter");
      navigate(`/course/${courseId}/chapter/${chapterId}/level/${nextLevel.nextLevel._id}`);
    } else if (nextLevel?.courseCompleted) {
      console.log("Course completed, navigating to overview");
      navigate(`/course/${courseId}/overview`);
    } else {
      console.log("No next level found, going back to content");
      handleBackToContent();
    }
  };

  const showNextHint = () => {
    if (currentHintIndex < level.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return "0ms";
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return seconds > 0 ? `${seconds}.${ms}s` : `${ms}ms`;
  };

  const formatElapsedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Editor helper functions
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runTests();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Prevent default save
      return;
    });
  };

  const resetCode = () => {
    setUserCode(level?.starterCode || '');
    toast.success('Code reset to starter template');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userCode);
    toast.success('Code copied to clipboard');
  };

  const downloadCode = () => {
    const fileExtensions = {
      python: 'py',
      javascript: 'js',
      java: 'java',
      cpp: 'cpp',
      c: 'c'
    };
    
    const extension = fileExtensions[language] || 'txt';
    const fileName = `${level?.title?.replace(/\s+/g, '_') || 'solution'}.${extension}`;
    
    const blob = new Blob([userCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Code downloaded as ${fileName}`);
  };

  const uploadCode = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserCode(e.target.result);
        toast.success('Code uploaded successfully');
      };
      reader.readAsText(file);
    }
  };

  // Monaco Editor language mapping
  const getMonacoLanguage = (lang) => {
    const mapping = {
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp',
      c: 'c'
    };
    return mapping[lang] || 'plaintext';
  };

  // Get starter code for different languages
  const getStarterCode = (lang) => {
    const starters = {
      python: `# Write your Python code here
# Example: Declare variables
name = "Your Name"
age = 25`,
      javascript: `// Write your JavaScript code here
// Example: Declare variables
let name = "Your Name";
let age = 25;`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Write your Java code here
        // Example: Declare variables
        String name = "Your Name";
        int age = 25;
    }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Write your C++ code here
    // Example: Declare variables
    string name = "Your Name";
    int age = 25;
    
    return 0;
}`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    // Write your C code here
    // Example: Declare variables
    char name[] = "Your Name";
    int age = 25;
    
    return 0;
}`
    };
    
    return level?.starterCode || starters[lang] || starters.python;
  };

  // Peer testing functions
  const startPeerTest = () => {
    setShowPeerInvite(true);
  };

  const handlePeerSessionStart = (sessionData) => {
    // This will be called when a peer session starts from the matching modal
    if (sessionData) {
      joinPeerTest(sessionData.sessionId);
    }
  };

  const joinPeerTest = async (sessionId) => {
    try {
      const session = await peerTestService.joinPeerTestSession(sessionId);
      setPeerTestSession(session);
      setIsPeerTestMode(true);
      setupPeerTestListeners();
      toast.success('Joined peer test session!');
    } catch (error) {
      console.error('Error joining peer test:', error);
      toast.error('Failed to join peer test session');
    }
  };

  const setupPeerTestListeners = () => {
    // Listen for peer code updates
    peerTestService.on('code-update', (data) => {
      setPeerCode(data.code);
    });

    // Listen for peer test updates
    peerTestService.on('test-update', (message) => {
      try {
        const messageData = JSON.parse(message.text);
        
        if (messageData.action === 'test_completed') {
          setPeerCompletionTime(messageData.completionTime);
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'peer',
            text: `🏁 Completed all tests in ${formatElapsedTime(messageData.completionTime)}!`,
            timestamp: message.timestamp,
            type: 'achievement'
          }]);
          
          // Determine winner and show modal if both have completed
          if (myCompletionTime) {
            if (myCompletionTime < messageData.completionTime) {
              setWinner('me');
            } else {
              setWinner('peer');
            }
            setShowWinnerModal(true);
          } else {
            // Peer finished first, but I haven't finished yet
            setWinner('peer');
          }
          
        } else if (messageData.action === 'test_progress') {
          setPeerTestProgress(prev => [...prev, {
            testIndex: messageData.testIndex,
            passed: messageData.passed,
            completionTime: messageData.completionTime,
            timestamp: messageData.timestamp
          }]);
          
        } else if (messageData.action === 'start_competition') {
          setCompetitionStartTime(messageData.timestamp);
          setIsCompetitionActive(true);
          toast.success('🏁 Competition started! Race to complete all tests!');
        }
      } catch (error) {
        // Handle regular text messages
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'peer',
          text: message.text,
          timestamp: message.timestamp,
          type: message.type
        }]);
      }
    });

    // Listen for peer joining
    peerTestService.on('peer-joined', (data) => {
      setPeer({
        id: data.userId,
        name: data.user.fullName,
        avatar: data.user.fullName.split(' ').map(n => n[0]).join(''),
        status: 'online'
      });
      
      // Start competition when both peers are ready
      if (!isCompetitionActive) {
        setTimeout(() => {
          peerTestService.startCompetition();
        }, 2000); // Give 2 seconds for both users to get ready
      }
    });

    // Listen for peer leaving
    peerTestService.on('peer-left', (data) => {
      setPeer(null);
      setIsPeerTestMode(false);
      setIsCompetitionActive(false);
      toast.error('Peer left the session - competition ended');
    });
  };

  const sendPeerMessage = () => {
    if (!newMessage.trim() || !peerTestSession) return;
    
    peerTestService.sendMessage(newMessage);
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    }]);
    setNewMessage('');
  };

  const syncCodeToPeer = (code) => {
    if (peerTestSession && isPeerTestMode) {
      peerTestService.syncCode(code);
    }
  };

  const shareTestResult = (testIndex, result) => {
    if (peerTestSession && isPeerTestMode) {
      peerTestService.shareTestResult(testIndex, result);
    }
  };

  const leavePeerTest = () => {
    if (peerTestService.isConnectedToTestSession()) {
      peerTestService.leaveSession();
    }
    setIsPeerTestMode(false);
    setPeerTestSession(null);
    setPeer(null);
    setMessages([]);
    toast.info('Left peer test session');
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={fetchTestData} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!level || !testCases.length) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tests Available</h3>
          <p className="text-gray-500 mb-4">This level doesn't have test cases yet.</p>
          <Button onClick={handleBackToContent}>Back to Content</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToContent}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Code Challenge: {level.title}</h1>
              <p className="text-gray-600">{level.description}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-lg font-semibold text-blue-800">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              
              {/* Attempts Counter */}
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-semibold">
                  {testAttempts}/{maxAttempts} attempts
                </span>
              </div>
              
              {testResults.length > 0 && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Terminal className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800 font-semibold">
                    {testResults.filter(r => r.passed).length}/{testResults.length} tests passing
                  </span>
                  {allTestsPassed && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              )}
              
              {/* Competitive Mode Display */}
              {isPeerTestMode && isCompetitionActive && (
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-semibold">
                    🏁 Racing against {peer?.name || 'Peer'}
                  </span>
                  {myCompletionTime && (
                    <span className="text-xs text-yellow-600">
                      (Completed in {formatElapsedTime(myCompletionTime)})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem & Tests */}
          <div className="space-y-6">
            {/* Problem Description */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Problem Description
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {level.description}
                </p>
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-green-600" />
                  Test Cases ({testCases.length})
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCases.map((testCase, index) => {
                    const isCurrentlyRunning = runningTestIndex === index;
                    const result = testResults.find(r => r.index === index);
                    
                    return (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 transition-all duration-300 ${
                          isCurrentlyRunning 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : result?.passed 
                              ? 'border-green-500 bg-green-50' 
                              : result?.passed === false 
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            Test Case {index + 1}
                            {isCurrentlyRunning && (
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            )}
                            {result?.passed && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {result?.passed === false && (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                          </h4>
                          
                          {isCurrentlyRunning && (
                            <span className="text-xs text-blue-600 font-medium animate-pulse">
                              RUNNING...
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-mono">
                            <span className="text-gray-600">Expected Output:</span><br />
                            <span className="text-green-600">{testCase.expectedOutput}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            {(testResults.length > 0 || isTestRunning) && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-600" />
                    Execution Results
                    {isTestRunning && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({currentTestIndex + 1} of {testCases.length})
                      </span>
                    )}
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Show placeholder for tests that haven't run yet */}
                    {testCases.map((testCase, index) => {
                      const result = testResults.find(r => r.index === index);
                      const isCurrentlyRunning = runningTestIndex === index;
                      const hasNotRun = !result && index > currentTestIndex;
                      
                      if (hasNotRun && !isTestRunning) return null;
                      
                      return (
                        <div 
                          key={`test-result-${index}`} 
                          className={`border rounded-lg p-4 ${
                            isCurrentlyRunning 
                              ? 'border-blue-500 bg-blue-50 animate-pulse' 
                              : result?.passed 
                                ? 'border-green-500 bg-green-50' 
                                : result?.passed === false 
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isCurrentlyRunning ? (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              ) : result?.passed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : result?.passed === false ? (
                                <X className="w-5 h-5 text-red-600" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={`font-medium ${
                                isCurrentlyRunning 
                                  ? 'text-blue-800' 
                                  : result?.passed 
                                    ? 'text-green-800' 
                                    : result?.passed === false 
                                      ? 'text-red-800'
                                      : 'text-gray-600'
                              }`}>
                                Test Case {index + 1}: {
                                  isCurrentlyRunning 
                                    ? 'RUNNING...' 
                                    : result?.passed 
                                      ? 'PASSED' 
                                      : result?.passed === false 
                                        ? 'FAILED'
                                        : 'PENDING'
                                }
                              </span>
                            </div>
                            
                            {/* Execution Metrics */}
                            {result?.executionTime && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  <span>{formatTime(result.executionTime * 1000)}</span>
                                </div>
                                {result.memoryUsage && (
                                  <div className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    <span>{result.memoryUsage} KB</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                          
                          {result && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Expected:</p>
                                  <div className="bg-white p-2 rounded border font-mono text-sm">
                                    {result.expected}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-1">Actual:</p>
                                  <div className={`p-2 rounded border font-mono text-sm ${
                                    result.passed ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {result.actual}
                                  </div>
                                </div>
                              </div>
                              
                              {result.error && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-red-700 mb-1">Error:</p>
                                  <div className="bg-red-100 p-2 rounded border text-sm text-red-800 font-mono">
                                    {result.error}
                                  </div>
                                </div>
                              )}
                              
                              {!result.passed && result.hint && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-yellow-700 mb-1">💡 Hint:</p>
                                  <div className="bg-yellow-100 p-2 rounded border text-sm text-yellow-800">
                                    {result.hint}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    {testResults.length === 0 && !isTestRunning && (
                      <p className="text-center text-gray-500 py-8">No test results yet. Click "Run Code" to see results.</p>
                    )}
                  </div>
                                 </CardContent>
               </Card>
             )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            {/* Code Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    Your Solution
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <select
                      value={language}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        // Only reset code if it's empty or still the default starter code
                        if (!userCode.trim() || userCode === getStarterCode(language)) {
                          setUserCode(getStarterCode(newLang));
                        } else {
                          // Ask user if they want to reset to new language template
                          if (window.confirm(`Switch to ${newLang}? This will reset your code to the template for ${newLang}.`)) {
                            setUserCode(getStarterCode(newLang));
                          }
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTestRunning}
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                    
                    {/* Settings Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium mb-3">Editor Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Theme:
                        </label>
                        <select
                          value={editorTheme}
                          onChange={(e) => setEditorTheme(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                          <option value="vs-dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="hc-black">High Contrast</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Font Size:
                        </label>
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        >
                          <option value="12">12px</option>
                          <option value="14">14px</option>
                          <option value="16">16px</option>
                          <option value="18">18px</option>
                          <option value="20">20px</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetCode}
                      className="flex items-center gap-1"
                      disabled={isTestRunning}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCode}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    
                    <label className="cursor-pointer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={isTestRunning}
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".py,.js,.java,.cpp,.c,.txt"
                        onChange={uploadCode}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Timer */}
                  {isTimerRunning && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Time: {formatElapsedTime(elapsedTime)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Monaco Editor */}
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={getMonacoLanguage(language)}
                    theme={editorTheme}
                    value={userCode}
                    onChange={(value) => {
                      setUserCode(value || '');
                      // Sync code with peer if in peer test mode
                      if (isPeerTestMode) {
                        syncCodeToPeer(value || '');
                      }
                    }}
                    onMount={handleEditorDidMount}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-gray-600">Loading code editor...</p>
                        </div>
                      </div>
                    }
                    options={{
                      fontSize: fontSize,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: language === 'python' ? 4 : 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: isTestRunning,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                      contextmenu: true,
                      folding: true,
                      foldingStrategy: 'indentation',
                      showFoldingControls: 'always',
                      unfoldOnClickAfterEndOfLine: false,
                      autoIndent: 'full',
                      formatOnType: true,
                      formatOnPaste: true,
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      tabCompletion: 'on',
                      wordBasedSuggestions: true,
                      parameterHints: { enabled: true },
                      quickSuggestions: true,
                      snippetSuggestions: 'inline',
                      bracketPairColorization: { enabled: true }
                    }}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={runTests} 
                      disabled={isTestRunning}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      {isTestRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Run Code (Ctrl+Enter)
                        </>
                      )}
                    </Button>

                    {!isPeerTestMode && (
                      <Button 
                        onClick={startPeerTest}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isTestRunning}
                      >
                        <Users className="w-4 h-4" />
                        Peer Test
                      </Button>
                    )}

                    {isPeerTestMode && (
                      <Button 
                        onClick={leavePeerTest}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Leave Session
                      </Button>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      Attempts: {testAttempts}/{maxAttempts}
                      {isPeerTestMode && peer && (
                        <div className="text-xs text-blue-600 mt-1">
                          Testing with {peer.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {level?.hints && level.hints.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2"
                      disabled={isTestRunning}
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </Button>
                  )}
                </div>
                
                {/* Keyboard Shortcuts Info */}
                <div className="mt-3 text-xs text-gray-500">
                  <p><strong>Shortcuts:</strong> Ctrl+Enter (Run Code) • Ctrl+S (Save) • Ctrl+/ (Comment)</p>
                </div>
              </CardContent>
            </Card>

            {/* Hints */}
            {level.hints?.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Hints
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHints(!showHints)}
                    >
                      {showHints ? 'Hide' : 'Show'} Hints
                    </Button>
                  </div>
                </CardHeader>
                {showHints && (
                  <CardContent>
                    <div className="space-y-3">
                      {level.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Hint {index + 1}:</strong> {hint}
                          </p>
                        </div>
                      ))}
                      
                      {currentHintIndex < level.hints.length - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={showNextHint}
                          className="w-full"
                        >
                          Show Next Hint ({currentHintIndex + 1}/{level.hints.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Solution Code (shown after completion) */}
            {allTestsPassed && level.solutionCode && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Reference Solution
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{level.solutionCode}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitive Progress Display */}
            {isPeerTestMode && isCompetitionActive && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Competition Progress
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* My Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-800">You</span>
                        {myCompletionTime && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✅ Completed: {formatElapsedTime(myCompletionTime)}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {testCases.map((_, index) => {
                          const progress = myTestProgress.find(p => p.testIndex === index);
                          const isCurrentlyRunning = runningTestIndex === index;
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                progress?.passed ? 'bg-green-500 border-green-500' :
                                progress?.passed === false ? 'bg-red-500 border-red-500' :
                                isCurrentlyRunning ? 'border-blue-500 bg-blue-100' :
                                'border-gray-300'
                              }`}>
                                {progress?.passed && <CheckCircle className="w-3 h-3 text-white" />}
                                {progress?.passed === false && <X className="w-3 h-3 text-white" />}
                                {isCurrentlyRunning && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
                              </div>
                              <span>Test {index + 1}</span>
                              {progress?.completionTime && (
                                <span className="text-xs text-gray-500">
                                  ({formatTime(progress.completionTime)})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Peer Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-purple-800">{peer?.name || 'Peer'}</span>
                        {peerCompletionTime && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✅ Completed: {formatElapsedTime(peerCompletionTime)}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {testCases.map((_, index) => {
                          const progress = peerTestProgress.find(p => p.testIndex === index);
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                progress?.passed ? 'bg-green-500 border-green-500' :
                                progress?.passed === false ? 'bg-red-500 border-red-500' :
                                'border-gray-300'
                              }`}>
                                {progress?.passed && <CheckCircle className="w-3 h-3 text-white" />}
                                {progress?.passed === false && <X className="w-3 h-3 text-white" />}
                              </div>
                              <span>Test {index + 1}</span>
                              {progress?.completionTime && (
                                <span className="text-xs text-gray-500">
                                  ({formatTime(progress.completionTime)})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Winner Display */}
                  {myCompletionTime && peerCompletionTime && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                        winner === 'me' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">
                          {winner === 'me' ? '🎉 You Won!' : `🏆 ${peer?.name || 'Peer'} Won!`}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Peer Test Chat Panel */}
            {isPeerTestMode && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Peer Chat
                      {peer && (
                        <span className="text-sm text-gray-500">- {peer.name}</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${peer ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {peer ? 'Connected' : 'Waiting for peer...'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center mt-8">
                          No messages yet. Start a conversation!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                  message.sender === 'me'
                                    ? 'bg-blue-600 text-white'
                                    : message.type === 'test_result'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : message.type === 'test_completion'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-white text-gray-800 border'
                                }`}
                              >
                                <p>{message.text}</p>
                                <span className="text-xs opacity-70 mt-1 block">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendPeerMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!peer}
                      />
                      <Button 
                        onClick={sendPeerMessage}
                        disabled={!newMessage.trim() || !peer}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {peer && (
                      <div className="text-xs text-gray-500">
                        You're collaborating with {peer.name} in real-time!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Peer Code Viewer */}
            {isPeerTestMode && peer && peerCode && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    {peer.name}'s Code
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto max-h-64">
                      <code>{peerCode}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Level Button */}
            {allTestsPassed && nextLevel && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You've successfully completed this level. Ready for the next challenge?
                    </p>
                    <Button onClick={handleNextLevel} size="lg" className="w-full">
                      {nextLevel.courseCompleted ? (
                        <>
                          <Trophy className="w-5 h-5 mr-2" />
                          Complete Course
                        </>
                      ) : (
                        <>
                          Continue to Next Level
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Peer Matching Modal for Test Session */}
        <PeerMatchingModal
          isOpen={showPeerInvite}
          onClose={() => setShowPeerInvite(false)}
          courseId={courseId}
          chapterId={chapterId}
          levelId={levelId}
          courseTitle={course?.title}
          sessionType="collaborative_test"
          onSessionStart={handlePeerSessionStart}
        />

        {/* Winner Modal for Competitive Testing */}
        {showWinnerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                {winner === 'me' ? (
                  <>
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-yellow-600 mb-2">🎉 You Won!</h3>
                    <p className="text-gray-600 mb-4">
                      Congratulations! You completed the test faster than your peer.
                    </p>
                  </>
                ) : (
                  <>
                    <Medal className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">Great Job!</h3>
                    <p className="text-gray-600 mb-4">
                      Your peer completed the test faster, but you both did great!
                    </p>
                  </>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">Your Time</p>
                      <p className="text-lg font-bold">
                        {myCompletionTime ? formatElapsedTime(myCompletionTime) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-purple-600">Peer's Time</p>
                      <p className="text-lg font-bold">
                        {peerCompletionTime ? formatElapsedTime(peerCompletionTime) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {myCompletionTime && peerCompletionTime && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <p className="text-sm text-gray-600">
                        Time Difference: {formatElapsedTime(Math.abs(myCompletionTime - peerCompletionTime))}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {allTestsPassed && (
                    <Button 
                      onClick={() => {
                        setShowWinnerModal(false);
                        setShowSubmitConfirm(true);
                      }}
                      className="flex-1"
                    >
                      Submit Solution
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowWinnerModal(false);
                      leavePeerTest();
                      navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`);
                    }}
                    className="flex-1"
                  >
                    Back to Level
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
                <p className="text-gray-600 mb-6">
                  All tests passed! Your solution is correct.
                  <br />
                  Time taken: {formatTime(elapsedTime)}
                  <br />
                  Attempts: {testAttempts}
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={submitSolution} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Solution"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Continue Testing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelTestPage; 