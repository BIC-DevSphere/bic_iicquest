import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  ArrowRight,
  Trophy,
  Target,
  Lightbulb,
  Code
} from "lucide-react";
import {
  getCourseById,
  getChapterById,
  getLevelById,
  getLevelContent,
  getNextLevel
} from "@/services/courseService";
import { getCourseProgress, updateLevelProgress } from "@/services/userProgressService";

const LevelContentPage = () => {
  const { courseId, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    fetchLevelData();
  }, [courseId, chapterId, levelId]);

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

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading level content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={fetchLevelData} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <p className="text-gray-600">Level not found</p>
      </div>
    );
  }

  const currentContent = content[currentContentIndex];

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={handleBackToChapters}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Chapters
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>{course?.title}</span>
            <ChevronRight className="w-4 h-4" />
            <span>Chapter {chapter?.order}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium">Level {level.order}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
              <p className="text-gray-600 mb-4">{level.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(level.estimatedTime || 30)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {content.length} sections
                </div>
                {level.testCases?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    {level.testCases.length} test cases
                  </div>
                )}
              </div>
            </div>
            
            {isLevelCompleted && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {content.length > 0 ? (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{currentContent?.title}</h2>
                    <Badge variant="outline">
                      {currentContentIndex + 1} of {content.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Content Text */}
                  <div className="prose max-w-none mb-6">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {currentContent?.content?.text}
                    </div>
                  </div>

                  {/* Content Media */}
                  {currentContent?.content?.media && (
                    <div className="mb-6">
                      <img 
                        src={currentContent.content.media} 
                        alt={currentContent.title}
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Examples */}
                  {currentContent?.content?.examples?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Examples
                      </h3>
                      <div className="space-y-3">
                        {currentContent.content.examples.map((example, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                              <code>{example}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleContentNavigation('prev')}
                      disabled={currentContentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Section
                    </Button>

                    <div className="flex gap-2">
                      {content.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentContentIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentContentIndex 
                              ? 'bg-blue-600' 
                              : index <= currentContentIndex 
                                ? 'bg-blue-300' 
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleContentNavigation('next')}
                      disabled={currentContentIndex === content.length - 1}
                    >
                      Next Section
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No content available</h3>
                  <p className="text-gray-500">This level doesn't have reading content yet.</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {level.testCases?.length > 0 && (
                <Button onClick={handleStartTest} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Take Quick Test
                </Button>
              )}
              
              {(!level.testCases?.length || isLevelCompleted) && nextLevel && (
                <Button onClick={handleNextLevel} size="lg">
                  {nextLevel.courseCompleted ? (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Complete Course
                    </>
                  ) : (
                    <>
                      Next Level
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Level Info */}
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold">Level Info</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="font-semibold">{formatDuration(level.estimatedTime || 30)}</p>
                </div>
                
                {level.hints?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Available Hints</p>
                    <Badge variant="secondary">{level.hints.length} hints</Badge>
                  </div>
                )}
                
                {content.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reading Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${((currentContentIndex + 1) / content.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentContentIndex + 1} of {content.length} sections
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hints */}
            {level.hints?.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Hints
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {level.hints.map((hint, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{hint}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelContentPage; 