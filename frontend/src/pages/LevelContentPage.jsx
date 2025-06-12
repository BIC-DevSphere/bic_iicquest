import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  Code,
  Users,
  MessageSquare,
  Video,
  Mic,
  Send,
  UserPlus
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

  useEffect(() => {
    fetchLevelData();
  }, [courseId, chapterId, levelId]);

  useEffect(() => {
    if (learningMode === 'peer') {
      // Simulate peer connection (replace with actual peer connection logic)
      setPeer({
        id: 'peer123',
        name: 'Learning Partner',
        avatar: '👤',
        status: 'online'
      });
    }
  }, [learningMode]);

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
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

            {learningMode === 'peer' && peer && (
              <Button
                variant="outline"
                onClick={() => setShowPeerPanel(!showPeerPanel)}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {showPeerPanel ? 'Hide Peer Panel' : 'Show Peer Panel'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className={`${showPeerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
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

          {/* Peer Learning Panel */}
          {learningMode === 'peer' && showPeerPanel && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Peer Learning</h3>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <UserPlus className="w-4 h-4" />
                      {peer.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="call" className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Call
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="mt-4">
                      <div className="space-y-4">
                        {/* Messages */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.sender === 'me'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                <p>{message.text}</p>
                                <span className="text-xs opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button onClick={handleSendMessage}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="call" className="mt-4">
                      <div className="space-y-4">
                        {/* Video Call Controls */}
                        <div className="flex justify-center gap-4">
                          <Button
                            variant={isAudioEnabled ? "default" : "outline"}
                            onClick={toggleAudio}
                            className="w-12 h-12 rounded-full"
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                          <Button
                            variant={isVideoEnabled ? "default" : "outline"}
                            onClick={toggleVideo}
                            className="w-12 h-12 rounded-full"
                          >
                            <Video className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Video Preview */}
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          {isVideoEnabled ? (
                            <div className="text-center">
                              <p className="text-gray-600">Video preview</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Camera is off</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelContentPage; 