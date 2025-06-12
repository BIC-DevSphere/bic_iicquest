import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Target
} from "lucide-react";
import {
  getCourseById,
  getChapterById,
  getLevelById,
  getLevelTestCases,
  getNextLevel,
  executeTestCases
} from "@/services/courseService";
import { 
  getCourseProgress, 
  updateLevelProgress, 
  completeLevelTest 
} from "@/services/userProgressService";

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

  useEffect(() => {
    fetchTestData();
  }, [courseId, chapterId, levelId]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Start timer when test data is loaded
  useEffect(() => {
    if (level && testCases.length > 0 && !isTimerRunning) {
      setIsTimerRunning(true);
      setTestStartTime(Date.now());
    }
  }, [level, testCases]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      alert("Please write some code before running tests!");
      return;
    }

    // Check for code with only comments
    const codeWithoutComments = userCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim();
    if (!codeWithoutComments) {
      alert("Please write some executable code (not just comments) before running tests!");
      return;
    }

    if (testAttempts >= maxAttempts) {
      alert(`Maximum attempts (${maxAttempts}) reached. Please review your code carefully.`);
      return;
    }

    setIsTestRunning(true);
    setTestResults([]);
    setTestAttempts(prev => prev + 1);

    // Save code to history
    const codeSnapshot = {
      attempt: testAttempts + 1,
      code: userCode,
      timestamp: new Date()
    };
    setCodeHistory(prev => [...prev, codeSnapshot]);

    try {
      // Execute tests on the backend
      const response = await executeTestCases(courseId, chapterId, levelId, userCode);
      const results = response.results;
      setTestResults(results);
      
      const allPassed = results.every(result => result.passed);
      setAllTestsPassed(allPassed);

      if (allPassed) {
        setIsTimerRunning(false);
        setShowSubmitConfirm(true);
      }
    } catch (error) {
      console.error("Error running tests:", error);
      const errorMessage = error.response?.data?.message || "Failed to run tests. Please try again.";
      alert(errorMessage);
    } finally {
      setIsTestRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      // Update progress
      const timeSpent = Math.floor(elapsedTime / 60); // minutes
      await completeLevelTest({
        courseId,
        chapterId,
        levelId,
        score: 100,
        timeSpent,
        code: userCode,
        attempts: testAttempts
      });
      
      setShowSubmitConfirm(false);
      
      // Show success message
      alert("Solution submitted successfully! You can now proceed to the next level.");
      
      // Optionally navigate to next level if available
      if (nextLevel?.nextLevel || nextLevel?.courseCompleted) {
        handleNextLevel();
      } else {
        // Navigate back to content page
        handleBackToContent();
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      alert("Failed to submit solution. Please try again.");
    }
  };



  const handleBackToContent = () => {
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`);
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

  const showNextHint = () => {
    if (currentHintIndex < level.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
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
                    Test Results
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
                        <div className="flex items-center gap-2 mb-2">
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
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Expected:</p>
                            <code className="text-green-600 font-mono block bg-gray-50 p-2 rounded">{result.expected}</code>
                          </div>
                          <div>
                            <p className="text-gray-600">Actual:</p>
                            <code className={`font-mono block p-2 rounded ${
                              result.passed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                            }`}>
                              {result.actual}
                            </code>
                          </div>
                        </div>
                        
                        {result.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Error:</strong> {result.error}
                            </p>
                          </div>
                        )}
                        
                        {!result.passed && result.hint && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <Lightbulb className="w-4 h-4 inline mr-1" />
                              Hint: {result.hint}
                            </p>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-8">
                        <Terminal className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>Run tests to see results here</p>
                      </div>
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
                    <Code className="w-5 h-5 text-purple-600" />
                    Your Solution
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={runTests}
                      disabled={isTestRunning}
                      className="flex items-center gap-2"
                    >
                      {isTestRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Tests
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUserCode(level.starterCode || '');
                        setTestResults([]);
                        setAllTestsPassed(false);
                        setTestAttempts(0);
                        setCurrentHintIndex(0);
                        setCodeHistory([]);
                      }}
                      disabled={isTestRunning}
                      className="flex items-center gap-2"
                    >
                      Reset Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="Write your solution here..."
                  className="font-mono text-sm min-h-[400px] resize-none"
                  disabled={isTestRunning}
                />
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
                  <Button onClick={submitSolution} className="flex-1">
                    Submit Solution
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSubmitConfirm(false)}
                    className="flex-1"
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