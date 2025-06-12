import Project from '../models/Project.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import GroupChat from '../models/GroupChat.js';

// Check if user can create project (completed 2 courses)
const canCreateProject = async (userId) => {
  // const completedCourses = await UserProgress.find({
  //   user: userId,
  //   status: 'completed'
  // });
  // return completedCourses.length >= 2;
  return true;
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName')
      .sort('-createdAt');
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    // Check if user has completed 2 courses
    // const canCreate = await canCreateProject(req.user.id);
    // if (!canCreate) {
    //   return res.status(403).json({ 
    //     message: 'You need to complete at least 2 courses to create a project' 
    //   });
    // }

    const project = new Project({
      ...req.body,
      creator: req.user.id
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator
    if (project.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('creator', 'username fullName')
     .populate('collaborators.user', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Apply for role
export const applyForRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project creator (owner)
    if (project.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own project' });
    }

    const role = project.roles.id(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (!role.isOpen) {
      return res.status(400).json({ message: 'This role is no longer open' });
    }

    // Check if user is already a collaborator
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );
    if (isCollaborator) {
      return res.status(400).json({ message: 'You are already a collaborator on this project' });
    }

    // Check if user has required technologies with minimum proficiency
    const user = await User.findById(req.user.id);
    const missingTechnologies = [];

    for (const reqTech of role.requiredTechnologies) {
      const userTech = user.earnedTechnologies.find(t => t.name === reqTech.name);
      
      if (!userTech) {
        missingTechnologies.push(reqTech.name);
        continue;
      }

      const proficiencyLevels = ['beginner', 'intermediate', 'advanced'];
      const userProfIndex = proficiencyLevels.indexOf(userTech.proficiencyLevel);
      const requiredProfIndex = proficiencyLevels.indexOf(reqTech.minimumProficiency);

      if (userProfIndex < requiredProfIndex) {
        missingTechnologies.push(`${reqTech.name} (requires ${reqTech.minimumProficiency}, you have ${userTech.proficiencyLevel})`);
      }
    }

    if (missingTechnologies.length > 0) {
      return res.status(403).json({
        message: 'You do not meet the technology requirements for this role',
        missingTechnologies
      });
    }

    role.isOpen = false;
    role.assignedUser = req.user.id;
    project.collaborators.push({
      user: req.user.id,
      role: role.title
    });

    await project.save();
    
    const updatedProject = await Project.findById(req.params.id)
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get projects by technology
export const getProjectsByTechnology = async (req, res) => {
  try {
    const { technology } = req.params;
    const projects = await Project.find({ 
      technologies: { $in: [technology] } 
    })
    .populate('creator', 'username fullName')
    .populate('collaborators.user', 'username fullName')
    .sort('-createdAt');

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects by user (created or collaborated)
export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { creator: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    })
    .populate('creator', 'username fullName')
    .populate('collaborators.user', 'username fullName')
    .sort('-createdAt');

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator or collaborator
    const isCreator = project.creator.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to update project status' });
    }

    project.status = status;
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 

export const applyForProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { message } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the project creator (owner)
    if (project.creator.toString() === userId) {
      return res.status(400).json({ message: 'You cannot apply to your own project' });
    }

    // Check if user already applied
    const existingApplication = project.applications.find(
      app => app.userId.toString() === userId
    );
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }

    // Check if user is already a collaborator
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === userId
    );
    if (isCollaborator) {
      return res.status(400).json({ message: 'You are already a collaborator on this project' });
    }

    // Get user's earned technologies
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userTechnologies = user.earnedTechnologies.map(tech => ({ name: tech.name }));
    if (!userTechnologies.length) {
      return res.status(400).json({ message: 'You don\'t have enough skills' });
    }

    const application = {
      userId,
      message: message || '',
      technologies: userTechnologies,
      status: 'pending'
    };

    project.applications.push(application);
    await project.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const viewAllApplications = async (req, res) => {
  try {
    const projectId = req.params.id;
    if(!projectId) return res.status(400).json({ message: 'Project ID is required' });
    const foundProject = await Project.findById(projectId);
    if(!foundProject) return res.status(404).json({ message: 'Project not found' });

    const applications = foundProject.applications;
    res.status(200).json(applications);
  }catch (error) {
    res.status(400).json({ message: error.message });
  }
}


// Get project applications (for project owner)
export const getProjectApplications = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    const project = await Project.findById(projectId)
      .populate('applications.userId', 'username fullName email earnedTechnologies')
      .populate('creator', 'username fullName');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the project creator
    if (project.creator._id.toString() !== userId) {
      return res.status(403).json({ message: 'Only project owner can view applications' });
    }
    
    res.status(200).json({
      projectTitle: project.title,
      applications: project.applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept/Reject application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user.id;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the project creator
    if (project.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only project owner can update applications' });
    }
    
    const application = project.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = status;
    
    // If accepted, add user as collaborator and to group chat
    if (status === 'accepted') {
      project.collaborators.push({
        user: application.userId,
        role: 'General Contributor'
      });

      // Automatically add user to group chat if it exists or create one
      if (project.collaborationSettings?.autoCreateGroupChat !== false) {
        await ensureProjectGroupChat(project._id, project.creator, application.userId);
      }
    }
    
    await project.save();
    
    const updatedProject = await Project.findById(projectId)
      .populate('applications.userId', 'username fullName email')
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName');
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const createProjectGroupChat = async (req, res) => {
  try {
    const projectId = req.params.id;

    const foundProject = await Project.findById(projectId);
    if (!foundProject) return res.status(404).json({ message: 'Project not found' });

    const adminId = req.user.id;

    if (foundProject.creator.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Not authorized to create group chat' });
    }

    // Get members from request body
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Members array is required' });
    }

    // Validate each user exists
    for (const memberId of members) {
      const user = await User.findById(memberId);
      if (!user) return res.status(404).json({ message: `User not found: ${memberId}` });
    }

    // Add admin also to members if not included
    if (!members.includes(adminId)) {
      members.push(adminId);
    }

    const groupChat = await GroupChat.create({
      projectId: projectId,
      groupName: foundProject.title,
      adminId,
      members: members.map(memberId => ({ userId: memberId })),
      isActive: true
    });

    foundProject.groupChatId = groupChat._id;
    await foundProject.save();

    res.status(200).json(groupChat);
  } catch (error) {
    console.error(error);  // good for debugging
    res.status(400).json({ message: error.message });
  }
}

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { message } = req.body;
    const groupChatId = req.params.id;

    if (!groupChatId || !message) {
      return res.status(400).json({ message: 'Group chat ID and message are required' });
    }

    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Check if sender is a member
    const isMember = groupChat.members.some(member => member.userId.toString() === senderId.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group chat' });
    }

    // Create new message object
    const newMessage = {
      userId: senderId,
      message,
    };

    groupChat.messages.push(newMessage);
    await groupChat.save();

    res.status(200).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupChatId = req.params.groupChatId;
    const messageId = req.params.messageId;

    // Find group chat
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Find message
    const message = groupChat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check permissions: either sender or admin
    if (message.userId.toString() !== userId.toString() && groupChat.adminId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this message' });
    }

    // Remove message
    message.remove();
    await groupChat.save();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupChatId = req.params.groupChatId;
    const messageId = req.params.messageId;
    const { message: newMessageText } = req.body;

    // Find group chat
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    // Find message
    const message = groupChat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check permissions: only sender or admin can update
    if (message.userId.toString() !== userId.toString() && groupChat.adminId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this message' });
    }

    // Update message
    message.message = newMessageText;
    message.isEdited = true;
    message.updatedAt = Date.now();

    await groupChat.save();

    res.status(200).json({ message: 'Message updated successfully', updatedMessage: message });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const groupChatId = req.params.groupChatId;

    // Find group chat
    const groupChat = await GroupChat.findById(groupChatId).populate('messages.userId', 'username fullName');
    if (!groupChat) {
      return res.status(404).json({ message: 'Group chat not found' });
    }

    res.status(200).json(groupChat.messages);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Helper function to ensure project has a group chat
const ensureProjectGroupChat = async (projectId, creatorId, newMemberId = null) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return null;

    let groupChat;
    
    if (project.groupChatId) {
      // Group chat exists, add new member if provided
      groupChat = await GroupChat.findById(project.groupChatId);
      if (groupChat && newMemberId) {
        const isAlreadyMember = groupChat.members.some(member => 
          member.userId.toString() === newMemberId.toString()
        );
        
        if (!isAlreadyMember) {
          groupChat.members.push({
            userId: newMemberId,
            role: 'member'
          });
          await groupChat.save();
        }
      }
    } else {
      // Create new group chat
      const allMembers = [
        { userId: creatorId, role: 'admin' },
        ...project.collaborators.map(collab => ({ 
          userId: collab.user, 
          role: 'member' 
        }))
      ];

      if (newMemberId && !allMembers.some(m => m.userId.toString() === newMemberId.toString())) {
        allMembers.push({ userId: newMemberId, role: 'member' });
      }

      groupChat = await GroupChat.create({
        projectId: projectId,
        groupName: project.title,
        adminId: creatorId,
        members: allMembers,
        isActive: true
      });

      project.groupChatId = groupChat._id;
      await project.save();
    }

    return groupChat;
  } catch (error) {
    console.error('Error ensuring group chat:', error);
    return null;
  }
};

// Add project objective
export const addProjectObjective = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const isCreator = project.creator.toString() === userId;
    const isCollaborator = project.collaborators.some(collab => 
      collab.user.toString() === userId
    );
    const canAddObjectives = project.collaborationSettings?.allowMembersToAddObjectives || isCreator;

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    if (!canAddObjectives && !isCreator) {
      return res.status(403).json({ message: 'Only project creator can add objectives' });
    }

    const newObjective = {
      title,
      description,
      priority: priority || 'medium',
      assignedTo: assignedTo || [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: userId
    };

    project.objectives.push(newObjective);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('objectives.assignedTo', 'username fullName')
      .populate('objectives.createdBy', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project objective
export const updateProjectObjective = async (req, res) => {
  try {
    const { projectId, objectiveId } = req.params;
    const { status, ...updates } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const objective = project.objectives.id(objectiveId);
    if (!objective) {
      return res.status(404).json({ message: 'Objective not found' });
    }

    // Check permissions
    const isCreator = project.creator.toString() === userId;
    const isAssigned = objective.assignedTo.some(assigned => 
      assigned.toString() === userId
    );
    const isObjectiveCreator = objective.createdBy.toString() === userId;

    if (!isCreator && !isAssigned && !isObjectiveCreator) {
      return res.status(403).json({ message: 'Not authorized to update this objective' });
    }

    // Update objective fields
    Object.keys(updates).forEach(key => {
      if (key !== 'createdBy' && key !== 'createdAt') {
        objective[key] = updates[key];
      }
    });

    // Handle status change
    if (status && status !== objective.status) {
      objective.status = status;
      if (status === 'completed') {
        objective.completedAt = new Date();
      }
    }

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('objectives.assignedTo', 'username fullName')
      .populate('objectives.createdBy', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add weekly goals
export const addWeeklyGoals = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { weekStarting, goals, notes } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator
    if (project.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only project creator can set weekly goals' });
    }

    const weekStart = new Date(weekStarting);
    
    // Check if goals for this week already exist
    const existingWeek = project.weeklyGoals.find(week => {
      const existingWeekStart = new Date(week.weekStarting);
      return existingWeekStart.getTime() === weekStart.getTime();
    });

    if (existingWeek) {
      return res.status(400).json({ message: 'Goals for this week already exist' });
    }

    const newWeeklyGoals = {
      weekStarting: weekStart,
      goals: goals.map(goal => ({
        description: goal.description || goal,
        isCompleted: false
      })),
      notes: notes || '',
      createdBy: userId
    };

    project.weeklyGoals.push(newWeeklyGoals);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('weeklyGoals.createdBy', 'username fullName')
      .populate('weeklyGoals.goals.completedBy', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update weekly goal completion
export const updateWeeklyGoal = async (req, res) => {
  try {
    const { projectId, weeklyGoalId, goalId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator or collaborator
    const isCreator = project.creator.toString() === userId;
    const isCollaborator = project.collaborators.some(collab => 
      collab.user.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to update goals' });
    }

    const weeklyGoal = project.weeklyGoals.id(weeklyGoalId);
    if (!weeklyGoal) {
      return res.status(404).json({ message: 'Weekly goal not found' });
    }

    const goal = weeklyGoal.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.isCompleted = isCompleted;
    if (isCompleted) {
      goal.completedBy = userId;
      goal.completedAt = new Date();
    } else {
      goal.completedBy = undefined;
      goal.completedAt = undefined;
    }

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('weeklyGoals.createdBy', 'username fullName')
      .populate('weeklyGoals.goals.completedBy', 'username fullName');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get project collaboration data (objectives, goals, chat)
export const getProjectCollaboration = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId)
      .populate('creator', 'username fullName')
      .populate('collaborators.user', 'username fullName')
      .populate('objectives.assignedTo', 'username fullName')
      .populate('objectives.createdBy', 'username fullName')
      .populate('weeklyGoals.createdBy', 'username fullName')
      .populate('weeklyGoals.goals.completedBy', 'username fullName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const isCreator = project.creator._id.toString() === userId;
    const isCollaborator = project.collaborators.some(collab => 
      collab.user._id.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    // Get group chat if exists
    let groupChat = null;
    if (project.groupChatId) {
      groupChat = await GroupChat.findById(project.groupChatId)
        .populate('members.userId', 'username fullName')
        .populate('messages.userId', 'username fullName');
    }

    const collaborationData = {
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        status: project.status,
        creator: project.creator,
        collaborators: project.collaborators,
        objectives: project.objectives,
        weeklyGoals: project.weeklyGoals,
        projectTimeline: project.projectTimeline,
        collaborationSettings: project.collaborationSettings
      },
      groupChat,
      userRole: isCreator ? 'creator' : 'collaborator'
    };

    res.status(200).json(collaborationData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
