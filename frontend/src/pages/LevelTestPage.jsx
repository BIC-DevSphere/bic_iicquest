import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Clock
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
import { testCodeWithPiston } from "@/services/codeExecutor";

const LevelTestPage = () => {
  const { courseId, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    fetchTestData();
  }, [courseId, chapterId, levelId]);

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
      setUserCode(levelData.starterCode || '');

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
      toast.loading("Executing code...", { id: 'execution' });
      
      // Execute tests using online code execution API
      const results = await testCodeWithPiston(userCode, testCases, language);
      
      setTestResults(results);
      
      const allPassed = results.every(result => result.passed);
      setAllTestsPassed(allPassed);

      toast.dismiss('execution');

      if (allPassed) {
        setIsTimerRunning(false);
        setShowSubmitConfirm(true);
        toast.success("🎉 All tests passed! Ready to submit your solution.");
      } else {
        const failedCount = results.filter(r => !r.passed).length;
        toast.error(`${failedCount} test${failedCount > 1 ? 's' : ''} failed. Check the results below.`);
      }
      
    } catch (error) {
      console.error("Error running tests:", error);
      toast.dismiss('execution');
      toast.error("Failed to execute code. Please try again.");
    } finally {
      setIsTestRunning(false);
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
                  {testCases.map((testCase, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                      <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-mono">
                          <span className="text-gray-600">Expected Output:</span><br />
                          <span className="text-green-600">{testCase.expectedOutput}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-600" />
                    Execution Results
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults && testResults.length > 0 ? testResults.map((result, index) => (
                      <div 
                        key={`test-result-${index}`} 
                        className={`border rounded-lg p-4 ${
                          result.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                              result.passed ? 'text-green-800' : 'text-red-800'
                            }`}>
                              Test Case {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          
                          {/* Execution Metrics */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {result.executionTime && (
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                <span>{formatTime(result.executionTime * 1000)}</span>
                              </div>
                            )}
                            {result.memoryUsage && (
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span>{result.memoryUsage} KB</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{result.testCase}</p>
                        
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
                      </div>
                    )) : (
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    Your Solution
                  </h3>
                  
                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="language" className="text-sm font-medium text-gray-700">
                      Language:
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTestRunning}
                    >
                      <option value="python">Python 3</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                    </select>
                  </div>
                </div>
                
                {/* Timer */}
                {isTimerRunning && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Time: {formatElapsedTime(elapsedTime)}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder={`Write your ${language} code here...`}
                  className="min-h-[300px] font-mono text-sm"
                  style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
                  disabled={isTestRunning}
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={runTests} 
                      disabled={isTestRunning}
                      className="flex items-center gap-2"
                    >
                      {isTestRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Run Code
                        </>
                      )}
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      Attempts: {testAttempts}/{maxAttempts}
                    </div>
                  </div>
                  
                  {level.hints && level.hints.length > 0 && (
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