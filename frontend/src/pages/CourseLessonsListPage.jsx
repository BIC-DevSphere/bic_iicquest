import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, CheckCircle, Lock, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCourseById, getCourseChapters } from "@/services/courseService";
import { getCourseProgress } from "@/services/userProgressService";

const CourseLessonsListPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, chaptersData] = await Promise.all([
        getCourseById(courseId),
        getCourseChapters(courseId)
      ]);
      
      setCourse(courseData);
      setChapters(chaptersData);

      // Try to fetch progress
      try {
        const progressData = await getCourseProgress(courseId);
        setProgress(progressData);
      } catch (progressError) {
        console.log("No progress data available");
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch course data");
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  const isLevelCompleted = (chapterId, levelId) => {
    if (!progress) return false;
    return progress.completedLevels.some(
      completed => completed.chapterId === chapterId && completed.levelId === levelId
    );
  };

  const isLevelUnlocked = (chapterIndex, levelIndex) => {
    if (!progress) return levelIndex === 0 && chapterIndex === 0; // First level is always unlocked
    
    // If it's the first level of first chapter, it's unlocked
    if (chapterIndex === 0 && levelIndex === 0) return true;
    
    // Check if previous level is completed
    if (levelIndex > 0) {
      const currentChapter = chapters[chapterIndex];
      const previousLevel = currentChapter.levels[levelIndex - 1];
      return isLevelCompleted(currentChapter._id, previousLevel._id);
    }
    
    // If it's the first level of a chapter, check if previous chapter is completed
    if (levelIndex === 0 && chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1];
      const lastLevelOfPreviousChapter = previousChapter.levels[previousChapter.levels.length - 1];
      return isLevelCompleted(previousChapter._id, lastLevelOfPreviousChapter._id);
    }
    
    return false;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleLevelClick = (chapterId, levelId) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={fetchCourseData} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!course || !chapters.length) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <p className="text-gray-600">Course content not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/course/${courseId}/overview`)}
            className="mb-4"
          >
            ← Back to Course Overview
          </Button>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">Course Content & Chapters</p>
          
          {/* Progress Summary */}
          {progress && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Your Progress</p>
                    <p className="font-semibold">
                      {progress.completedLevels.length} of {chapters.reduce((total, ch) => total + ch.levels.length, 0)} levels completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time Spent</p>
                    <p className="font-semibold">{formatDuration(progress.totalTimeSpent || 0)}</p>
                  </div>
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(progress.completedLevels.length / chapters.reduce((total, ch) => total + ch.levels.length, 0)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          {chapters.map((chapter, chapterIndex) => (
            <Card key={chapter._id} className="overflow-hidden">
              {/* Chapter Header */}
              <div
                className="bg-white p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChapter(chapterIndex)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">
                      Chapter {chapter.order}: {chapter.title}
                    </h2>
                    <Badge variant="outline">
                      {chapter.levels.length} levels
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{chapter.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(chapter.levels.reduce((total, level) => total + (level.estimatedTime || 0), 0))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Chapter Progress */}
                  {progress && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {chapter.levels.filter(level => isLevelCompleted(chapter._id, level._id)).length} / {chapter.levels.length}
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(chapter.levels.filter(level => isLevelCompleted(chapter._id, level._id)).length / chapter.levels.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {expandedChapters[chapterIndex] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Chapter Content */}
              {expandedChapters[chapterIndex] && (
                <div className="bg-gray-50 border-t">
                  <div className="p-6 space-y-4">
                    {chapter.levels.map((level, levelIndex) => {
                      const completed = isLevelCompleted(chapter._id, level._id);
                      const unlocked = isLevelUnlocked(chapterIndex, levelIndex);
                      
                      return (
                        <Card 
                          key={level._id} 
                          className={`transition-all ${
                            unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
                          } ${completed ? 'border-green-500 bg-green-50' : ''}`}
                          onClick={() => unlocked && handleLevelClick(chapter._id, level._id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                  {completed ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                  ) : unlocked ? (
                                    <Play className="w-6 h-6 text-blue-600" />
                                  ) : (
                                    <Lock className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className={`font-medium mb-1 ${
                                    unlocked ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    Level {level.order}: {level.title}
                                  </h3>
                                  <p className={`text-sm mb-2 ${
                                    unlocked ? 'text-gray-600' : 'text-gray-400'
                                  }`}>
                                    {level.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {level.estimatedTime || 30} minutes
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="w-4 h-4" />
                                      {level.content?.length || 0} sections
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Button */}
                              <div className="flex-shrink-0 ml-4">
                                {unlocked ? (
                                  <Button 
                                    size="sm" 
                                    variant={completed ? "outline" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLevelClick(chapter._id, level._id);
                                    }}
                                  >
                                    {completed ? "Review" : "Start"}
                                  </Button>
                                ) : (
                                  <Badge variant="secondary">Locked</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseLessonsListPage;
