import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  GitBranch,
  ExternalLink,
  User,
  Clock,
  Star,
  Code,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  XCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import {
  getAllProjects,
  createProject,
  applyForRole,
  getUserProjects,
  getProjectsByTechnology,
  applyForProject,
  getProjectApplications,
  updateApplicationStatus
} from "@/services/projectService";
import { getUserProfile } from "@/services/userService";

const PairProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProjectsLoading, setUserProjectsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProjectsError, setUserProjectsError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, my-projects, create
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [expandedProject, setExpandedProject] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [applicationModalProject, setApplicationModalProject] = useState(null);
  const [applicationsModalProject, setApplicationsModalProject] = useState(null);
  const [projectApplications, setProjectApplications] = useState([]);
  
  // Loading states for specific actions
  const [creatingProject, setCreatingProject] = useState(false);
  const [applyingToProject, setApplyingToProject] = useState(null);
  const [applyingToRole, setApplyingToRole] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Professional notification states
  const [notification, setNotification] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ title: "", message: "", type: "error" });

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [],
    roles: [],
    isOpenForCollaboration: true,
    githubRepo: "",
    liveDemo: "",
    totalCollaboratorRequired: 1
  });

  const [newRole, setNewRole] = useState({
    title: "",
    description: "",
    skills: [],
    requiredTechnologies: []
  });

  const [applicationData, setApplicationData] = useState({
    message: ""
  });

  const technologies = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB", 
    "Express", "Vue.js", "Angular", "Django", "Flask", "PostgreSQL", 
    "MySQL", "Docker", "AWS", "Firebase", "GraphQL", "Redux"
  ];

  const statusColors = {
    planning: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    abandoned: "bg-red-100 text-red-800"
  };

  useEffect(() => {
    fetchProjects();
    fetchUserProjects();
    fetchCurrentUser();
  }, []);

  const fetchProjects = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      
      // More specific error messages
      let errorMessage = "Failed to fetch projects";
      if (err.response?.status === 404) {
        errorMessage = "No projects found";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later";
      } else if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = "Network error. Please check your connection";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      setUserProjectsLoading(true);
      setUserProjectsError(null);
      
      const data = await getUserProjects();
      setUserProjects(data);
    } catch (err) {
      console.error("Error fetching user projects:", err);
      
      let errorMessage = "Failed to fetch your projects";
      if (err.response?.status === 401) {
        errorMessage = "Please log in to view your projects";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to view projects";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setUserProjectsError(errorMessage);
    } finally {
      setUserProjectsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const data = await getUserProfile();
      setCurrentUser(data);
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to fetch user profile");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!newProject.title.trim()) {
      displayErrorModal("Missing Project Title", "Please enter a title for your project.", "warning");
      return;
    }
    
    if (!newProject.description.trim()) {
      displayErrorModal("Missing Description", "Please provide a description for your project.", "warning");
      return;
    }
    
    if (newProject.roles.length === 0) {
      displayErrorModal("No Roles Defined", "Please add at least one role to help others understand how they can contribute to your project.", "warning");
      return;
    }

    try {
      setCreatingProject(true);
      
      const projectData = {
        ...newProject,
        title: newProject.title.trim(),
        description: newProject.description.trim(),
        technologies: newProject.technologies.map(tech => ({ name: tech }))
      };

      await createProject(projectData);
      
      // Reset form
      setNewProject({
        title: "",
        description: "",
        technologies: [],
        roles: [],
        isOpenForCollaboration: true,
        githubRepo: "",
        liveDemo: "",
        totalCollaboratorRequired: 1
      });
      
      // Switch to All Projects tab to show the new project
      setActiveTab("all");
      
      // Refresh data
      await Promise.all([fetchProjects(), fetchUserProjects()]);
      
      showNotification("Your project has been created successfully and is now live!", "success", "Project Created");
    } catch (err) {
      console.error("Error creating project:", err);
      
      let title = "Project Creation Failed";
      let message = "Failed to create project";
      let type = "error";
      
      if (err.response?.status === 403) {
        title = "Course Completion Required";
        message = "To create projects, you need to complete at least 2 courses first. This ensures you have enough experience to lead collaborative projects.";
        type = "warning";
      } else if (err.response?.status === 400) {
        title = "Invalid Project Data";
        message = err.response.data?.message || "Please check your project information and try again.";
      } else if (err.response?.status === 401) {
        title = "Authentication Required";
        message = "Please log in to create a project.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      
      displayErrorModal(title, message, type);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleApplyForProject = async (projectId) => {
    try {
      setApplyingToProject(projectId);
      
      await applyForProject(projectId, applicationData);
      
      setApplicationModalProject(null);
      setApplicationData({ message: "" });
      
      // Refresh projects to show updated application status
      await fetchProjects();
      
      showNotification("Your application has been submitted successfully!", "success", "Application Submitted");
    } catch (err) {
      console.error("Error applying to project:", err);
      
      let title = "Application Failed";
      let message = "Failed to submit application";
      
      if (err.response?.status === 400) {
        title = "Application Already Submitted";
        message = err.response.data?.message || "You have already applied to this project. Please wait for the project owner's response.";
      } else if (err.response?.status === 401) {
        title = "Authentication Required";
        message = "Please log in to apply for projects.";
      } else if (err.response?.status === 403) {
        title = "Requirements Not Met";
        message = "You don't have the required skills for this project. Complete more courses to unlock additional opportunities.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      
      displayErrorModal(title, message, "error");
    } finally {
      setApplyingToProject(null);
    }
  };

  const handleApplyForRole = async (projectId, roleId) => {
    try {
      setApplyingToRole(roleId);
      
      await applyForRole(projectId, { roleId });
      
      // Refresh projects to show updated role status
      await fetchProjects();
      
      showNotification("You've successfully applied for the role!", "success", "Role Application Submitted");
    } catch (err) {
      console.error("Error applying for role:", err);
      
      let title = "Role Application Failed";
      let message = "Failed to apply for role";
      
      if (err.response?.status === 400) {
        title = "Role Unavailable";
        message = err.response.data?.message || "This role is no longer available. It may have been filled by another applicant.";
      } else if (err.response?.status === 401) {
        title = "Authentication Required";
        message = "Please log in to apply for roles.";
      } else if (err.response?.status === 403) {
        title = "Requirements Not Met";
        message = err.response.data?.message || "You don't meet the technical requirements for this role. Consider completing more courses to build the necessary skills.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      
      displayErrorModal(title, message, "error");
    } finally {
      setApplyingToRole(null);
    }
  };

  const addRole = () => {
    if (newRole.title && newRole.description) {
      setNewProject({
        ...newProject,
        roles: [...newProject.roles, { ...newRole }]
      });
      setNewRole({
        title: "",
        description: "",
        skills: [],
        requiredTechnologies: []
      });
    }
  };

  const handleViewApplications = async (projectId) => {
    try {
      const data = await getProjectApplications(projectId);
      setProjectApplications(data.applications);
      setApplicationsModalProject({ ...data, projectId });
    } catch (error) {
      console.error("Error fetching applications:", error);
      displayErrorModal("Error", "Failed to fetch project applications", "error");
    }
  };

  const handleApplicationAction = async (projectId, applicationId, status) => {
    try {
      await updateApplicationStatus(projectId, applicationId, status);
      // Refresh applications
      await handleViewApplications(projectId);
      // Refresh projects to show updated collaborator list
      await fetchProjects();
      
      showNotification(
        `Application ${status} successfully!`, 
        "success", 
        "Application Updated"
      );
    } catch (error) {
      console.error("Error updating application:", error);
      displayErrorModal("Error", `Failed to ${status} application`, "error");
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTechnology = !selectedTechnology || 
                             project.technologies.some(tech => tech.name === selectedTechnology);
    return matchesSearch && matchesTechnology;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Enhanced loading component
  const LoadingSpinner = ({ size = "large", message = "Loading..." }) => (
    <div className={`flex items-center justify-center ${size === "large" ? "min-h-screen mt-10" : "py-8"}`}>
      <div className="text-center">
        <Loader2 className={`animate-spin mx-auto text-blue-600 ${size === "large" ? "h-12 w-12" : "h-8 w-8"}`} />
        <p className={`mt-2 text-gray-600 ${size === "large" ? "text-lg" : "text-sm"}`}>{message}</p>
      </div>
    </div>
  );

  // Enhanced error component
  const ErrorDisplay = ({ error, onRetry, showRetry = true }) => (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {showRetry && onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Professional notification toast
  const NotificationToast = ({ notification, onClose }) => {
    if (!notification) return null;

    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'error':
          return <XCircle className="h-5 w-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        default:
          return <Info className="h-5 w-5 text-blue-600" />;
      }
    };

    const getBackgroundColor = () => {
      switch (notification.type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        default:
          return 'bg-blue-50 border-blue-200';
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1">
              {notification.title && (
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
              )}
              <p className="text-sm text-gray-700">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Professional error modal
  const ErrorModal = ({ show, onClose, title, message, type = "error" }) => {
    if (!show) return null;

    const getIcon = () => {
      switch (type) {
        case 'warning':
          return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
        case 'info':
          return <Info className="h-12 w-12 text-blue-500" />;
        default:
          return <XCircle className="h-12 w-12 text-red-500" />;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="mx-auto mb-4">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Button onClick={onClose} className="w-full">
              Got it
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Utility function to show notifications
  const showNotification = (message, type = 'info', title = null) => {
    setNotification({ message, type, title });
    setTimeout(() => setNotification(null), 5000); // Auto-dismiss after 5 seconds
  };

  // Utility function to show error modal
  const displayErrorModal = (title, message, type = 'error') => {
    setErrorModalData({ title, message, type });
    setShowErrorModal(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pair Projects</h1>
              <p className="text-gray-600">
                Collaborate with other learners on exciting projects. Build together, learn together.
              </p>
            </div>
            <Button
              onClick={() => fetchProjects(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Network status indicator */}
          {!navigator.onLine && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-red-700">You're offline. Some features may not work properly.</span>
            </div>
          )}

          {/* Global error display */}
          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={() => fetchProjects()} 
              showRetry={true}
            />
          )}

          {/* Tabs */}
          {!error && (
            <div className="flex space-x-4 mb-6">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                All Projects
              </Button>
              <Button
                variant={activeTab === "my-projects" ? "default" : "outline"}
                onClick={() => setActiveTab("my-projects")}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                My Projects
              </Button>
              <Button
                variant={activeTab === "create" ? "default" : "outline"}
                onClick={() => setActiveTab("create")}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            </div>
          )}
        </div>

        {/* All Projects Tab */}
        {activeTab === "all" && !error && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedTechnology}
                onChange={(e) => setSelectedTechnology(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Technologies</option>
                {technologies.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Badge className={statusColors[project.status]}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Technologies */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech.name}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        Created by {project.creator?.fullName || project.creator?.username}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {project.collaborators.length}/{project.totalCollaboratorRequired} collaborators
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created {formatDate(project.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedProject(
                          expandedProject === project._id ? null : project._id
                        )}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                        {expandedProject === project._id ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </Button>
                      
                      {/* Show different buttons based on ownership */}
                      {currentUser && project.creator._id === currentUser._id ? (
                        // Owner can view applications
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplications(project._id)}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          View Applications ({project.applications?.length || 0})
                        </Button>
                      ) : (
                        // Non-owners can apply if project is open
                        project.isOpenForCollaboration && (
                          <Button
                            size="sm"
                            onClick={() => setApplicationModalProject(project)}
                            disabled={applyingToProject === project._id}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            {applyingToProject === project._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            {applyingToProject === project._id ? 'Applying...' : 'Apply to Join'}
                          </Button>
                        )
                      )}
                    </div>

                    {/* External Links */}
                    <div className="mt-4 flex gap-2">
                      {project.githubRepo && (
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <GitBranch className="w-4 h-4 mr-1" />
                          GitHub
                        </a>
                      )}
                      {project.liveDemo && (
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Live Demo
                        </a>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {expandedProject === project._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold mb-2">Available Roles:</h4>
                        <div className="space-y-2">
                          {project.roles.filter(role => role.isOpen).map((role, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{role.title}</h5>
                                {role.isOpen && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApplyForRole(project._id, role._id)}
                                    disabled={applyingToRole === role._id}
                                  >
                                    {applyingToRole === role._id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      'Apply'
                                    )}
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                              {role.requiredTechnologies.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {role.requiredTechnologies.map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="secondary" className="text-xs">
                                      {tech.name} ({tech.minimumProficiency})
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {project.roles.filter(role => role.isOpen).length === 0 && (
                            <p className="text-sm text-gray-500">No open roles available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No projects found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* My Projects Tab */}
        {activeTab === "my-projects" && !error && (
          <div>
            {userProjectsLoading ? (
              <LoadingSpinner size="medium" message="Loading your projects..." />
            ) : userProjectsError ? (
              <ErrorDisplay 
                error={userProjectsError} 
                onRetry={fetchUserProjects} 
                showRetry={true}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((project) => (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Badge className={statusColors[project.status]}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {project.collaborators.length} collaborators
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created {formatDate(project.createdAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {project.githubRepo && (
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:underline"
                        >
                          <GitBranch className="w-4 h-4 mr-1" />
                          GitHub
                        </a>
                      )}
                      {project.liveDemo && (
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Demo
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
                {userProjects.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't created or joined any projects yet.</p>
                    <Button
                      className="mt-4"
                      onClick={() => setActiveTab("create")}
                    >
                      Create Your First Project
                    </Button>
                  </div>
                )}
            </div>
          )}
        {/* Create Project Tab */}
        {activeTab === "create" && !error && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Create New Project</h2>
                <p className="text-gray-600">
                  Note: You need to complete at least 2 courses to create a project.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Technologies</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newProject.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button
                            type="button"
                            onClick={() => setNewProject({
                              ...newProject,
                              technologies: newProject.technologies.filter((_, i) => i !== index)
                            })}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value && !newProject.technologies.includes(e.target.value)) {
                          setNewProject({
                            ...newProject,
                            technologies: [...newProject.technologies, e.target.value]
                          });
                        }
                        e.target.value = "";
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select technologies...</option>
                      {technologies.map(tech => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Collaborators Needed</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newProject.totalCollaboratorRequired}
                      onChange={(e) => setNewProject({...newProject, totalCollaboratorRequired: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub Repository (optional)</label>
                    <input
                      type="url"
                      value={newProject.githubRepo}
                      onChange={(e) => setNewProject({...newProject, githubRepo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Live Demo (optional)</label>
                    <input
                      type="url"
                      value={newProject.liveDemo}
                      onChange={(e) => setNewProject({...newProject, liveDemo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://your-demo.com"
                    />
                  </div>

                  {/* Roles Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Project Roles</h3>
                    
                    {/* Existing Roles */}
                    {newProject.roles.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {newProject.roles.map((role, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{role.title}</h4>
                                <p className="text-sm text-gray-600">{role.description}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewProject({
                                  ...newProject,
                                  roles: newProject.roles.filter((_, i) => i !== index)
                                })}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Role */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-medium">Add New Role</h4>
                      <div>
                        <input
                          type="text"
                          value={newRole.title}
                          onChange={(e) => setNewRole({...newRole, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Role title (e.g., Frontend Developer)"
                        />
                      </div>
                      <div>
                        <textarea
                          rows={2}
                          value={newRole.description}
                          onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Role description"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={addRole}
                        variant="outline"
                        size="sm"
                      >
                        Add Role
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={creatingProject}
                  >
                    {creatingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating Project...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Modal */}
        {applicationModalProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Apply to: {applicationModalProject.title}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Application Message (optional)
                </label>
                <textarea
                  rows={4}
                  value={applicationData.message}
                  onChange={(e) => setApplicationData({...applicationData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell them why you'd like to join this project..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApplyForProject(applicationModalProject._id)}
                  className="flex-1"
                  disabled={applyingToProject === applicationModalProject._id}
                >
                  {applyingToProject === applicationModalProject._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setApplicationModalProject(null)}
                  className="flex-1"
                  disabled={applyingToProject === applicationModalProject._id}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Applications Management Modal */}
        {applicationsModalProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Applications for: {applicationsModalProject.projectTitle}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setApplicationsModalProject(null);
                    setProjectApplications([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {projectApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectApplications.map((application) => (
                    <div key={application._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {application.userId.fullName} (@{application.userId.username})
                          </h4>
                          <p className="text-sm text-gray-600">{application.userId.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'pending' ? 'secondary' :
                            application.status === 'accepted' ? 'default' : 'destructive'
                          }
                          className={
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                      
                      {application.message && (
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <p className="text-sm font-medium mb-1">Application Message:</p>
                          <p className="text-sm text-gray-700">{application.message}</p>
                        </div>
                      )}
                      
                      {application.technologies && application.technologies.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Technologies:</p>
                          <div className="flex flex-wrap gap-1">
                            {application.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {application.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleApplicationAction(
                              applicationsModalProject.projectId, 
                              application._id, 
                              'accepted'
                            )}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicationAction(
                              applicationsModalProject.projectId, 
                              application._id, 
                              'rejected'
                            )}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification Toast */}
        <NotificationToast 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />

        {/* Error Modal */}
        <ErrorModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title={errorModalData.title}
          message={errorModalData.message}
          type={errorModalData.type}
        />
      </div>
    </div>
  );
};

export default PairProjectsPage; 