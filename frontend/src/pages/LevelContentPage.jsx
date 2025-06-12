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
  Lightbulb,
  Code,
  Users,
  MessageSquare,
  Video,
  Mic,
  Send,
  UserPlus,
  Sparkles
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
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center animate-pulse">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading content...</p>
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
              <Sparkles className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchLevelData} size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <p className="text-sm text-muted-foreground">Level not found</p>
      </div>
    );
  }

  const currentContent = content[currentContentIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="space-y-6 border-b pb-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToChapters}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Chapters
            </Button>

            {learningMode === 'peer' && peer && (
              <Button
                variant="outline"
                onClick={() => setShowPeerPanel(!showPeerPanel)}
                className="text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                {showPeerPanel ? 'Hide Peer Panel' : 'Show Peer Panel'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{course?.title}</span>
              <ChevronRight className="w-4 h-4" />
              <span>Chapter {chapter?.order}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium">Level {level.order}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{level.title}</h1>
                <p className="text-muted-foreground">{level.description}</p>
              </div>
              
              {isLevelCompleted && (
                <Badge variant="default" className="bg-emerald-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(level.estimatedTime || 30)}
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {content.length} sections
              </div>
              {level.testCases?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {level.testCases.length} test cases
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          {/* Main Content Area */}
          <div className={`${showPeerPanel ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {content.length > 0 ? (
              <div className="space-y-8">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">{currentContent?.title}</h2>
                      <Badge variant="secondary">
                        {currentContentIndex + 1} of {content.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Content Text */}
                    <div className="prose max-w-none">
                      <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {currentContent?.content?.text}
                      </div>
                    </div>

                    {/* Content Media */}
                    {currentContent?.content?.media && (
                      <div className="mt-6">
                        <img 
                          src={currentContent.content.media} 
                          alt={currentContent.title}
                          className="w-full rounded-lg border"
                        />
                      </div>
                    )}

                    {/* Examples */}
                    {currentContent?.content?.examples?.length > 0 && (
                      <div className="mt-8 space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Examples
                        </h3>
                        <div className="space-y-3">
                          {currentContent.content.examples.map((example, index) => (
                            <div key={index} className="bg-muted/50 rounded-lg p-4">
                              <pre className="text-sm overflow-x-auto">
                                <code>{example}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      <Button
                        variant="ghost"
                        onClick={() => handleContentNavigation('prev')}
                        disabled={currentContentIndex === 0}
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <div className="flex gap-2">
                        {content.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentContentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentContentIndex 
                                ? 'bg-primary' 
                                : index < currentContentIndex 
                                  ? 'bg-primary/30' 
                                  : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => handleContentNavigation('next')}
                        disabled={currentContentIndex === content.length - 1}
                        size="sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {level.testCases?.length > 0 && (
                    <Button onClick={handleStartTest} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Take Test
                    </Button>
                  )}
                  
                  {(!level.testCases?.length || isLevelCompleted) && nextLevel && (
                    <Button onClick={handleNextLevel} size="sm">
                      {nextLevel.courseCompleted ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Complete Course
                        </>
                      ) : (
                        <>
                          Next Level
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">No content available</h3>
                      <p className="text-sm text-muted-foreground">This level doesn't have any content yet.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Peer Learning Panel */}
          {learningMode === 'peer' && showPeerPanel && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Peer Learning</h3>
                    <Badge variant="secondary" className="text-xs">
                      <UserPlus className="w-3 h-3 mr-1" />
                      {peer.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                      <TabsTrigger value="chat" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="call" className="text-xs">
                        <Video className="w-3 h-3 mr-2" />
                        Call
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="p-4">
                      <div className="space-y-4">
                        {/* Messages */}
                        <div className="space-y-4 h-[400px] overflow-y-auto p-4 bg-muted/50 rounded-lg">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                  message.sender === 'me'
                                    ? 'bg-primary text-primary-foreground'
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
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="text-sm"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button size="icon" onClick={handleSendMessage}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="call" className="p-4">
                      <div className="space-y-4">
                        {/* Video Call Controls */}
                        <div className="flex justify-center gap-4">
                          <Button
                            variant={isAudioEnabled ? "default" : "outline"}
                            size="icon"
                            onClick={toggleAudio}
                          >
                            <Mic className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={isVideoEnabled ? "default" : "outline"}
                            size="icon"
                            onClick={toggleVideo}
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Video Preview */}
                        <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                          {isVideoEnabled ? (
                            <p className="text-sm text-muted-foreground">Video preview</p>
                          ) : (
                            <div className="text-center space-y-2">
                              <Video className="w-8 h-8 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">Camera is off</p>
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