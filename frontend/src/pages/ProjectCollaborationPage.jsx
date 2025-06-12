import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Target,
  Calendar,
  Users,
  Plus,
  Send,
  Check,
  Clock,
  Flag,
  ArrowLeft,
  Settings,
  CheckCircle,
  AlertTriangle,
  User,
  Edit,
  Save,
  X,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getProjectCollaboration,
  addProjectObjective,
  updateProjectObjective,
  addWeeklyGoals,
  updateWeeklyGoal,
  sendMessage,
  getMessages,
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  getProjectActivity,
  inviteProjectMember,
  removeProjectMember,
  updateMemberRole
} from '@/services/projectService';

const ProjectCollaborationPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [collaborationData, setCollaborationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAddObjective, setShowAddObjective] = useState(false);
  const [showAddGoals, setShowAddGoals] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectActivity, setProjectActivity] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [fileUploadData, setFileUploadData] = useState({ file: null, description: '' });
  const [inviteData, setInviteData] = useState({ email: '', role: '' });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form states
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: ''
  });

  const [goalsForm, setGoalsForm] = useState({
    weekStarting: '',
    goals: [''],
    notes: ''
  });

  useEffect(() => {
    fetchCollaborationData();
  }, [projectId]);

  useEffect(() => {
    if (collaborationData?.groupChat) {
      fetchMessages();
    }
  }, [collaborationData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch tab-specific data when switching tabs
    if (activeTab === 'files') {
      fetchProjectFiles();
    } else if (activeTab === 'overview') {
      fetchProjectActivity();
    }
  }, [activeTab]);

  const fetchCollaborationData = async () => {
    try {
      setLoading(true);
      const data = await getProjectCollaboration(projectId);
      setCollaborationData(data);
      
      // Fetch additional data
      if (activeTab === 'files') {
        await fetchProjectFiles();
      }
      if (activeTab === 'overview') {
        await fetchProjectActivity();
      }
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      toast.error('Failed to load project collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFiles = async () => {
    try {
      const files = await getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (error) {
      console.error('Error fetching project files:', error);
    }
  };

  const fetchProjectActivity = async () => {
    try {
      const activity = await getProjectActivity(projectId);
      setProjectActivity(activity);
    } catch (error) {
      console.error('Error fetching project activity:', error);
    }
  };

  const fetchMessages = async () => {
    if (!collaborationData?.groupChat?._id) return;
    
    try {
      const messages = await getMessages(collaborationData.groupChat._id);
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !collaborationData?.groupChat?._id) return;

    try {
      const messageData = await sendMessage(collaborationData.groupChat._id, {
        message: newMessage
      });
      setMessages([...messages, messageData]);
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleAddObjective = async (e) => {
    e.preventDefault();
    if (!objectiveForm.title || !objectiveForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addProjectObjective(projectId, objectiveForm);
      toast.success('Objective added successfully!');
      setShowAddObjective(false);
      setObjectiveForm({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: [],
        dueDate: ''
      });
      fetchCollaborationData();
    } catch (error) {
      console.error('Error adding objective:', error);
      toast.error('Failed to add objective');
    }
  };

  const handleUpdateObjective = async (objectiveId, updates) => {
    try {
      await updateProjectObjective(projectId, objectiveId, updates);
      toast.success('Objective updated!');
      fetchCollaborationData();
    } catch (error) {
      console.error('Error updating objective:', error);
      toast.error('Failed to update objective');
    }
  };

  const handleAddWeeklyGoals = async (e) => {
    e.preventDefault();
    if (!goalsForm.weekStarting || goalsForm.goals.every(g => !g.trim())) {
      toast.error('Please set a week and add at least one goal');
      return;
    }

    try {
      const goalsData = {
        weekStarting: goalsForm.weekStarting,
        goals: goalsForm.goals.filter(g => g.trim()),
        notes: goalsForm.notes
      };
      
      await addWeeklyGoals(projectId, goalsData);
      toast.success('Weekly goals added successfully!');
      setShowAddGoals(false);
      setGoalsForm({
        weekStarting: '',
        goals: [''],
        notes: ''
      });
      fetchCollaborationData();
    } catch (error) {
      console.error('Error adding weekly goals:', error);
      toast.error('Failed to add weekly goals');
    }
  };

  const handleToggleGoal = async (weeklyGoalId, goalId, isCompleted) => {
    try {
      await updateWeeklyGoal(projectId, weeklyGoalId, goalId, { isCompleted: !isCompleted });
      fetchCollaborationData();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  const addGoalField = () => {
    setGoalsForm({
      ...goalsForm,
      goals: [...goalsForm.goals, '']
    });
  };

  const updateGoalField = (index, value) => {
    const updatedGoals = goalsForm.goals.map((goal, i) => 
      i === index ? value : goal
    );
    setGoalsForm({ ...goalsForm, goals: updatedGoals });
  };

  const removeGoalField = (index) => {
    if (goalsForm.goals.length > 1) {
      const updatedGoals = goalsForm.goals.filter((_, i) => i !== index);
      setGoalsForm({ ...goalsForm, goals: updatedGoals });
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileUploadData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await uploadProjectFile(projectId, fileUploadData);
      toast.success('File uploaded successfully!');
      setShowFileUpload(false);
      setFileUploadData({ file: null, description: '' });
      await fetchProjectFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteProjectFile(projectId, fileId);
      toast.success('File deleted successfully!');
      await fetchProjectFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.role) {
      toast.error('Please provide email and role');
      return;
    }

    try {
      await inviteProjectMember(projectId, inviteData);
      toast.success('Invitation sent successfully!');
      setShowInviteMember(false);
      setInviteData({ email: '', role: '' });
      await fetchCollaborationData();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeProjectMember(projectId, memberId);
      toast.success('Member removed successfully!');
      await fetchCollaborationData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getWeekString = (weekStarting) => {
    const start = new Date(weekStarting);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!collaborationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">Failed to load collaboration data</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const { project, groupChat, userRole } = collaborationData;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pair-projects')}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {project.collaborators?.length || 0} collaborators • {userRole || 'Member'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="capitalize">
                {project.status.replace('_', ' ')}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="max-w-[1600px] mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'objectives', label: 'Objectives', icon: Flag },
              { id: 'goals', label: 'Weekly Goals', icon: Calendar },
              { id: 'chat', label: 'Team Chat', icon: MessageSquare },
              { id: 'files', label: 'Files', icon: Users },
              { id: 'members', label: 'Members', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="leading-relaxed">{project.description}</p>
                  </div>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(project.githubRepo || project.liveDemo) && (
                    <div className="mt-6 space-y-4">
                      {project.githubRepo && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Repository</h4>
                          <a
                            href={project.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {project.githubRepo}
                          </a>
                        </div>
                      )}

                      {project.liveDemo && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Live Demo</h4>
                          <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {project.liveDemo}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {projectActivity.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    ) : (
                      projectActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {activity.type === 'objective_completed' && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                            {activity.type === 'message_posted' && (
                              <MessageSquare className="h-4 w-4 text-primary" />
                            )}
                            {activity.type === 'file_uploaded' && (
                              <Users className="h-4 w-4 text-primary" />
                            )}
                            {activity.type === 'member_joined' && (
                              <User className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user?.fullName || 'Someone'}</span>{' '}
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Progress Overview */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Objectives</span>
                        <span className="text-sm text-muted-foreground">
                          {project.objectives?.filter(obj => obj.status === 'completed').length || 0}/
                          {project.objectives?.length || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ 
                            width: `${project.objectives?.length ? 
                              (project.objectives.filter(obj => obj.status === 'completed').length / project.objectives.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">This Week's Goals</span>
                        <span className="text-sm text-muted-foreground">3/5</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <Badge variant="secondary">{project.collaborators?.length || 0}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {project.collaborators?.map((collaborator, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{collaborator.user?.fullName || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('objectives')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('goals')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Weekly Goals
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('chat')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Team Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Objectives</h2>
              <Button onClick={() => setShowAddObjective(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </Button>
            </div>

            {/* Add Objective Form */}
            {showAddObjective && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Objective</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddObjective} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input
                        value={objectiveForm.title}
                        onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                        placeholder="Enter objective title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={objectiveForm.description}
                        onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
                        placeholder="Describe the objective in detail"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                          value={objectiveForm.priority}
                          onChange={(e) => setObjectiveForm({ ...objectiveForm, priority: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <Input
                          type="date"
                          value={objectiveForm.dueDate}
                          onChange={(e) => setObjectiveForm({ ...objectiveForm, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Add Objective</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddObjective(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Objectives List */}
            <div className="grid gap-4">
              {project.objectives?.map((objective) => (
                <Card key={objective._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{objective.title}</h3>
                          <Badge className={getPriorityColor(objective.priority)}>
                            {objective.priority}
                          </Badge>
                          <Badge className={getStatusColor(objective.status)}>
                            {objective.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{objective.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {objective.dueDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {formatDate(objective.dueDate)}</span>
                            </span>
                          )}
                          {objective.assignedTo?.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{objective.assignedTo.length} assigned</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {objective.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateObjective(objective._id, { status: 'completed' })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Weekly Goals</h2>
              <Button onClick={() => setShowAddGoals(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Weekly Goals
              </Button>
            </div>

            {/* Add Goals Form */}
            {showAddGoals && (
              <Card>
                <CardHeader>
                  <CardTitle>Set Weekly Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddWeeklyGoals} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Week Starting</label>
                      <Input
                        type="date"
                        value={goalsForm.weekStarting}
                        onChange={(e) => setGoalsForm({ ...goalsForm, weekStarting: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Goals</label>
                      {goalsForm.goals.map((goal, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <Input
                            value={goal}
                            onChange={(e) => updateGoalField(index, e.target.value)}
                            placeholder={`Goal ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGoalField(index)}
                            disabled={goalsForm.goals.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGoalField}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <Textarea
                        value={goalsForm.notes}
                        onChange={(e) => setGoalsForm({ ...goalsForm, notes: e.target.value })}
                        placeholder="Additional notes for this week"
                        rows={2}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Set Goals</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddGoals(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Weekly Goals List */}
            <div className="space-y-4">
              {project.weeklyGoals?.map((weeklyGoal) => (
                <Card key={weeklyGoal._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Week of {getWeekString(weeklyGoal.weekStarting)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklyGoal.goals.map((goal, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleGoal(weeklyGoal._id, goal._id, goal.isCompleted)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              goal.isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {goal.isCompleted && <Check className="h-3 w-3" />}
                          </button>
                          <span className={goal.isCompleted ? 'line-through text-gray-500' : ''}>
                            {goal.description}
                          </span>
                          {goal.completedBy && (
                            <span className="text-xs text-gray-500">
                              by {goal.completedBy.fullName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {weeklyGoal.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{weeklyGoal.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Team Chat</span>
                    <Badge variant="secondary">{messages.length} messages</Badge>
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-0">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                      <div key={message._id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.sender?.fullName || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Chat Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Online Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.collaborators?.map((collaborator, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm">{collaborator.user?.fullName || 'Anonymous'}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chat Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📎 Share File
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🔗 Share Link
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📅 Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Files</h2>
              <Button onClick={() => setShowFileUpload(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>

            {/* File Upload Form */}
            {showFileUpload && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload File</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">File</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => setFileUploadData({ ...fileUploadData, file: e.target.files[0] })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                      <Textarea
                        value={fileUploadData.description}
                        onChange={(e) => setFileUploadData({ ...fileUploadData, description: e.target.value })}
                        placeholder="Describe the file..."
                        rows={2}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Upload File</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowFileUpload(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Files List */}
            {projectFiles.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files shared yet</h3>
                    <p className="text-gray-600 mb-4">Share files with your team to collaborate more effectively</p>
                    <Button onClick={() => setShowFileUpload(true)}>Upload your first file</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projectFiles.map((file) => (
                  <Card key={file._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {file.originalName?.split('.').pop()?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{file.originalName}</h3>
                            <p className="text-sm text-gray-600">{file.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Uploaded by {file.uploadedBy?.fullName}</span>
                              <span>{formatDate(file.uploadedAt)}</span>
                              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFile(file._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Button onClick={() => setShowInviteMember(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>

            {/* Invite Member Form */}
            {showInviteMember && (
              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <Input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        value={inviteData.role}
                        onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a role</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="QA Tester">QA Tester</option>
                        <option value="Data Scientist">Data Scientist</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Send Invitation</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowInviteMember(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {project.collaborators?.map((collaborator, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{collaborator.user?.fullName || 'Anonymous'}</h3>
                          <p className="text-sm text-gray-600">{collaborator.role}</p>
                          <p className="text-xs text-gray-500">
                            Joined {formatDate(collaborator.joinedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Online</span>
                        {userRole === 'creator' && collaborator.user?._id !== project.creator && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveMember(collaborator.user._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCollaborationPage; 