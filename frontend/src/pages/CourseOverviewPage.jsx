import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PeerMatchingModal from "@/components/PeerMatchingModal";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  Lock,
  Star,
  Target,
  Zap,
  MessageSquare,
  Code,
  Send,
  UserPlus,
  UserCheck,
  Brain
} from "lucide-react";
import { getCourseById, getCourseChapters } from "@/services/courseService";
import { getCourseProgress, initializeProgress } from "@/services/userProgressService";

const CourseOverviewPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLearningModeDialog, setShowLearningModeDialog] = useState(false);
  const [selectedLearningMode, setSelectedLearningMode] = useState(null);
  const [peerMatchStatus, setPeerMatchStatus] = useState(null);
  const [showPeerMatchingModal, setShowPeerMatchingModal] = useState(false);

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

      // Try to fetch progress (will fail if user not authenticated)
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

  const handleStartCourse = async () => {
    setShowLearningModeDialog(true);
  };

  const handleLearningModeSelect = async (mode) => {
    setSelectedLearningMode(mode);
    
    if (mode === 'peer') {
      // Show peer matching modal
      setShowLearningModeDialog(false);
      setShowPeerMatchingModal(true);
    } else {
      // Start solo learning
      startLearning();
    }
  };

  const startLearning = async () => {
    try {
      // Initialize progress if not exists
      if (!progress) {
        await initializeProgress({ courseId });
      }
      
      // Navigate to first chapter, first level
      if (chapters.length > 0 && chapters[0].levels?.length > 0) {
        const firstChapter = chapters[0];
        const firstLevel = firstChapter.levels[0];
        navigate(`/course/${courseId}/chapter/${firstChapter._id}/level/${firstLevel._id}`, {
          state: { learningMode: selectedLearningMode }
        });
      } else {
        navigate(`/course/${courseId}/chapters`);
      }
    } catch (error) {
      console.error("Error starting course:", error);
      navigate(`/course/${courseId}/chapters`);
    }
  };

  const calculateTotalDuration = () => {
    return chapters.reduce((total, chapter) => {
      return total + chapter.levels.reduce((chapterTotal, level) => {
        return chapterTotal + (level.estimatedTime || 0);
      }, 0);
    }, 0);
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
          <p className="mt-4 text-gray-600">Loading course...</p>
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

  if (!course) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Info */}
            <div className="flex-1">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-4">
                  {course.category}
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    {formatDuration(calculateTotalDuration())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span className="text-sm">
                    {chapters.length} chapters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">
                    {chapters.reduce((total, ch) => total + ch.levels.length, 0)} levels
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="text-sm">
                    Hands-on
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleStartCourse}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {progress ? "Continue Learning" : "Start Course"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/course/${courseId}/chapters`)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  View Chapters
                </Button>
              </div>
            </div>

            {/* Progress Card */}
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Course Progress</h3>
                </CardHeader>
                <CardContent>
                  {progress ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{Math.round((progress.completedLevelsCount / chapters.reduce((total, ch) => total + ch.levels.length, 0)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(progress.completedLevelsCount / chapters.reduce((total, ch) => total + ch.levels.length, 0)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Completed</p>
                          <p className="font-semibold">{progress.completedLevelsCount} levels</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time Spent</p>
                          <p className="font-semibold">{formatDuration(progress.totalTimeSpent || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Start learning to track your progress</p>
                      <Button onClick={handleStartCourse} size="sm">
                        Begin Journey
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              What You'll Learn
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {course.learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{outcome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technologies */}
        {course.technologies && course.technologies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                Technologies You'll Master
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.technologies.map((tech, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={tech.proficiencyLevel === 'advanced' ? 'default' : 'secondary'}>
                        {tech.proficiencyLevel}
                      </Badge>
                      <h4 className="font-semibold">{tech.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-semibold">Requirements</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Course Structure Preview */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              Course Structure
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chapters.slice(0, 3).map((chapter, index) => (
                <div key={chapter._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      Chapter {chapter.order}: {chapter.title}
                    </h3>
                    <Badge variant="outline">
                      {chapter.levels.length} levels
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{chapter.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(chapter.levels.reduce((total, level) => total + (level.estimatedTime || 0), 0))}
                  </div>
                </div>
              ))}
              
              {chapters.length > 3 && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${courseId}/chapters`)}
                    className="flex items-center gap-2"
                  >
                    View All {chapters.length} Chapters
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Mode Selection Dialog */}
      <Dialog open={showLearningModeDialog} onOpenChange={setShowLearningModeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Choose Your Learning Mode</DialogTitle>
            <DialogDescription>
              Select how you want to learn this course. You can change this later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup
              value={selectedLearningMode}
              onValueChange={handleLearningModeSelect}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo" id="solo" />
                <label htmlFor="solo" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Solo Learning</div>
                    <div className="text-sm text-gray-500">
                      Learn at your own pace, independently
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="peer" id="peer" />
                <label htmlFor="peer" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold">Peer Learning</div>
                    <div className="text-sm text-gray-500">
                      Learn with a peer, discuss and solve problems together
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>

            {selectedLearningMode === 'peer' && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                {peerMatchStatus === 'searching' && (
                  <div className="flex items-center gap-3 text-purple-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span>Finding a learning partner...</span>
                  </div>
                )}
                {peerMatchStatus === 'matched' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <UserPlus className="w-5 h-5" />
                      <span>Peer matched! Ready to start learning together.</span>
                    </div>
                    <Button onClick={startLearning} className="w-full">
                      Start Learning
                    </Button>
                  </div>
                )}
                {peerMatchStatus === 'error' && (
                  <div className="text-red-600">
                    Failed to find a peer. Please try again or choose solo learning.
                  </div>
                )}
              </div>
            )}

            {selectedLearningMode === 'solo' && (
              <Button onClick={startLearning} className="w-full mt-6">
                Start Learning
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Peer Matching Modal */}
      <PeerMatchingModal
        isOpen={showPeerMatchingModal}
        onClose={() => setShowPeerMatchingModal(false)}
        courseId={courseId}
        chapterId={chapters[0]?._id}
        levelId={chapters[0]?.levels?.[0]?._id}
        courseTitle={course?.title}
      />
    </div>
  );
};

export default CourseOverviewPage; 