import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Calendar,
  Star,
  Award,
  Briefcase,
  Code2,
  BookOpen,
  GitBranch,
  CheckCircle2,
  Users,
  Target,
  Zap,
  Clock,
  ChevronRight,
  ExternalLink,
  Loader2,
  Settings,
  Edit,
  Sparkles,
  GraduationCap,
  Trophy,
  FileCode2,
  Plus,
  Play,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/configs/apiConfigs";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [courseProgress, setCourseProgress] = useState({ active: [], completed: [] });
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showEditSkills, setShowEditSkills] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch user profile
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch user's progress for all courses
      const progressResponse = await axios.get(`${API_BASE_URL}/user-progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch user's projects
      const projectsResponse = await axios.get(`${API_BASE_URL}/projects/user/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(profileResponse.data);
      
      // Process course progress data
      const progressData = progressResponse.data || [];
      const activeCourses = progressData.filter(p => p.status === 'in_progress' && p.course);
      const completedCourses = progressData.filter(p => p.status === 'completed' && p.course);
      
      setCourseProgress({
        active: activeCourses,
        completed: completedCourses
      });
      
      setProjects(projectsResponse.data);

      // For now, we'll use dummy applied jobs data
      setAppliedJobs([
        {
          id: 1,
          title: "Senior Frontend Developer",
          company: "TechCorp Inc.",
          status: "Applied",
          appliedDate: "2024-03-15",
        },
        {
          id: 2,
          title: "Python Developer",
          company: "DataTech Solutions",
          status: "Interview Scheduled",
          appliedDate: "2024-03-16",
        },
      ]);

    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (progress) => {
    if (!progress || !progress.chapterProgress) return 0;

    const totalLevels = progress.chapterProgress.reduce((total, chapter) => {
      return total + (chapter.levelProgress?.length || 0);
    }, 0);

    const completedLevels = progress.chapterProgress.reduce((total, chapter) => {
      return total + (chapter.levelProgress?.filter(level => level.status === 'completed')?.length || 0);
    }, 0);

    if (totalLevels === 0) return 0;
    return Math.round((completedLevels / totalLevels) * 100);
  };

  const getCompletedLevelsCount = (progress) => {
    if (!progress || !progress.chapterProgress) return 0;
    
    return progress.chapterProgress.reduce((total, chapter) => {
      return total + (chapter.levelProgress?.filter(level => level.status === 'completed')?.length || 0);
    }, 0);
  };

  const getSkillLevelLabel = (percentage) => {
    if (percentage >= 90) return "Expert";
    if (percentage >= 70) return "Advanced";
    if (percentage >= 40) return "Intermediate";
    return "Beginner";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-purple-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 40) return "bg-green-500";
    return "bg-yellow-500";
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-32 w-32 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Picture */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{userData?.fullName}</h1>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{userData?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(userData?.createdAt || new Date())}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700">
                          {(courseProgress?.active?.length || 0) + (courseProgress?.completed?.length || 0)}
                        </p>
                        <p className="text-sm text-blue-600">Courses Taken</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <Code2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700">
                          {userData?.earnedTechnologies?.length || 0}
                        </p>
                        <p className="text-sm text-green-600">Technologies</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <GitBranch className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700">{projects.length}</p>
                        <p className="text-sm text-purple-600">Projects</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-md">
                      <CardContent className="p-4 text-center">
                        <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-700">
                          {userData?.badges?.length || 0}
                        </p>
                        <p className="text-sm text-yellow-600">Badges</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Skills and Technologies */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Technologies</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData?.earnedTechnologies?.map((tech, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{typeof tech === 'string' ? tech : tech.name}</span>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                            {tech.earnedFrom?.course?.title || 'Course'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">70%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: '70%' }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Earned on {tech.earnedFrom?.earnedAt ? formatDate(tech.earnedFrom.earnedAt) : 'N/A'}
                      </div>
                    </div>
                  ))}
                  {(!userData?.earnedTechnologies || userData.earnedTechnologies.length === 0) && (
                    <div className="col-span-2 text-center py-8">
                      <FileCode2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Technologies Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Complete courses to earn technology badges and showcase your skills.
                      </p>
                      <Button asChild>
                        <Link to="/learn/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badges and Achievements */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold">Badges & Achievements</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userData?.badges?.map((badge, index) => (
                    <Card key={index} className="border border-gray-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                            {badge.icon === 'trophy' ? (
                              <Trophy className="w-6 h-6 text-white" />
                            ) : (
                              <Code2 className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{badge.name}</h3>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Earned {formatDate(badge.earnedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Your Learning Journey</h2>
                </div>
              </CardHeader>
              <CardContent>
                {/* Active Courses */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-600" />
                    Active Courses
                  </h3>
                  <div className="space-y-4">
                    {courseProgress?.active?.length > 0 ? (
                      courseProgress.active.map((progress) => (
                        <Card key={progress._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{progress.course?.title || 'Untitled Course'}</h4>
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                                    {progress.course?.category || 'No Category'}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{progress.course?.description || 'No description available'}</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-medium">
                                      {calculateProgress(progress)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${calculateProgress(progress)}%`
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      {getCompletedLevelsCount(progress)} levels completed
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatDuration(progress.totalTimeSpent || 0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4"
                                onClick={() => navigate(`/course/${progress.course?._id}`)}
                                disabled={!progress.course?._id}
                              >
                                Continue
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Courses</h3>
                        <p className="text-gray-600 mb-4">
                          Start your learning journey by enrolling in a course.
                        </p>
                        <Button asChild>
                          <Link to="/learn/courses">Browse Courses</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Courses */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    Completed Courses
                  </h3>
                  <div className="space-y-4">
                    {courseProgress?.completed?.length > 0 ? (
                      courseProgress.completed.map((progress) => (
                        <Card key={progress._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{progress.course?.title || 'Untitled Course'}</h4>
                                  <Badge variant="secondary" className="bg-green-50 text-green-600">
                                    Completed
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{progress.course?.description || 'No description available'}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Completed on {formatDate(progress.completedAt)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(progress.totalTimeSpent || 0)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    100% Complete
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4"
                                onClick={() => navigate(`/course/${progress.course?._id}`)}
                                disabled={!progress.course?._id}
                              >
                                Review
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Courses</h3>
                        <p className="text-gray-600">
                          Keep learning and you'll earn your first course completion badge!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">Your Projects</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <Card key={index} className="border border-gray-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Array.isArray(project.technologies) && project.technologies.map((tech, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="bg-purple-50 text-purple-600"
                                >
                                  {typeof tech === 'string' ? tech : tech.name}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>
                                  {Array.isArray(project.collaborators) ? project.collaborators.length : 0} collaborators
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created {formatDate(project.createdAt)}</span>
                              </div>
                              {project.status && (
                                <Badge variant="outline" className={
                                  project.status === 'completed' ? 'text-green-600 bg-green-50' :
                                  project.status === 'in_progress' ? 'text-blue-600 bg-blue-50' :
                                  'text-yellow-600 bg-yellow-50'
                                }>
                                  {project.status.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {project.githubRepo && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={project.githubRepo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <GitBranch className="w-4 h-4" />
                                  GitHub
                                </a>
                              </Button>
                            )}
                            {project.liveDemo && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={project.liveDemo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Live Demo
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-12">
                      <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't created or joined any projects yet.
                      </p>
                      <Button asChild>
                        <a href="/pair-projects" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Start a New Project
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Applied Jobs</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appliedJobs.map((job, index) => (
                    <Card key={index} className="border border-gray-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium mb-2">{job.title}</h3>
                            <p className="text-gray-600 mb-4">{job.company}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Applied on {job.appliedDate}</span>
                              </div>
                              <Badge
                                variant={
                                  job.status === "Applied"
                                    ? "secondary"
                                    : job.status === "Interview Scheduled"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  job.status === "Applied"
                                    ? "bg-blue-50 text-blue-600"
                                    : job.status === "Interview Scheduled"
                                    ? "bg-green-50 text-green-600"
                                    : ""
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-blue-50"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage; 