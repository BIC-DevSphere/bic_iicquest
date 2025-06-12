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
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getProjectCollaboration,
  addProjectObjective,
  updateProjectObjective,
  addWeeklyGoals,
  updateWeeklyGoal,
  sendMessage,
  getMessages
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
  const messagesEndRef = useRef(null);

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

  const fetchCollaborationData = async () => {
    try {
      setLoading(true);
      const data = await getProjectCollaboration(projectId);
      setCollaborationData(data);
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      toast.error('Failed to load project collaboration data');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration workspace...</p>
        </div>
      </div>
    );
  }

  if (!collaborationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load collaboration data</p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const { project, groupChat, userRole } = collaborationData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">Project Collaboration</h1>
        <p>Collaboration features coming soon...</p>
      </div>
    </div>
  );
};

export default ProjectCollaborationPage; 