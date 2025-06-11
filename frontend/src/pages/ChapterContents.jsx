import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play,
  ArrowRight
} from "lucide-react";
import { 
  getCourseById, 
  getChapterById, 
  getChapterLevels 
} from "@/services/courseService";
import { getCourseProgress } from "@/services/userProgressService";

const ChapterContents = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChapterData();
  }, [courseId, chapterId]);

  const fetchChapterData = async () => {
    try {
      setLoading(true);
      const [courseData, chapterData, levelsData] = await Promise.all([
        getCourseById(courseId),
        getChapterById(courseId, chapterId),
        getChapterLevels(courseId, chapterId)
      ]);

      setCourse(courseData);
      setChapter(chapterData);
      setLevels(levelsData);

      // Try to fetch progress
      try {
        const progressData = await getCourseProgress(courseId);
        setProgress(progressData);
      } catch (progressError) {
        console.log("No progress data available");
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch chapter data");
      console.error("Error fetching chapter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isLevelCompleted = (levelId) => {
    if (!progress) return false;
    return progress.completedLevels.some(
      completed => completed.chapterId === chapterId && completed.levelId === levelId
    );
  };

  const isLevelUnlocked = (levelIndex) => {
    if (!progress) return levelIndex === 0; // First level is always unlocked
    
    // If it's the first level, it's unlocked
    if (levelIndex === 0) return true;
    
    // Check if previous level is completed
    const previousLevel = levels[levelIndex - 1];
    return isLevelCompleted(previousLevel._id);
  };

  const handleLevelClick = (levelId) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/level/${levelId}`);
  };

  const handleBackToChapters = () => {
    navigate(`/course/${courseId}/chapters`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chapter content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={fetchChapterData} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!chapter || !levels.length) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <p className="text-gray-600">Chapter content not found</p>
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
            onClick={handleBackToChapters}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to All Chapters
          </Button>
          
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">
              Chapter {chapter.order}: {chapter.title}
            </h1>
            <p className="text-gray-600 mb-4">{chapter.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {levels.length} levels
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(levels.reduce((total, level) => total + (level.estimatedTime || 0), 0))}
              </div>
            </div>
          </div>

          {/* Chapter Progress */}
          {progress && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chapter Progress</p>
                    <p className="font-semibold">
                      {levels.filter(level => isLevelCompleted(level._id)).length} of {levels.length} levels completed
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(levels.filter(level => isLevelCompleted(level._id)).length / levels.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Levels */}
        <div className="space-y-4">
          {levels.map((level, levelIndex) => {
            const completed = isLevelCompleted(level._id);
            const unlocked = isLevelUnlocked(levelIndex);
            
            return (
              <Card 
                key={level._id} 
                className={`transition-all ${
                  unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
                } ${completed ? 'border-green-500 bg-green-50' : ''}`}
                onClick={() => unlocked && handleLevelClick(level._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : unlocked ? (
                          <Play className="w-8 h-8 text-blue-600" />
                        ) : (
                          <Lock className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold mb-2 ${
                          unlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Level {level.order}: {level.title}
                        </h3>
                        <p className={`text-gray-600 mb-3 ${
                          unlocked ? '' : 'text-gray-400'
                        }`}>
                          {level.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {level.estimatedTime || 30} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {level.content?.length || 0} sections
                          </div>
                          {level.testCases?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>🧪</span>
                              {level.testCases.length} test cases
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0 ml-4">
                      {unlocked ? (
                        <Button 
                          size="lg" 
                          variant={completed ? "outline" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLevelClick(level._id);
                          }}
                          className="flex items-center gap-2"
                        >
                          {completed ? (
                            <>
                              Review
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Start
                              <Play className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="px-4 py-2">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChapterContents;