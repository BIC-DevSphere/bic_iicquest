import Project from '../models/Project.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

// Check if user can create project (completed 2 courses)
const canCreateProject = async (userId) => {
  const completedCourses = await UserProgress.find({
    user: userId,
    status: 'completed'
  });
  return completedCourses.length >= 2;
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
    const canCreate = await canCreateProject(req.user.id);
    if (!canCreate) {
      return res.status(403).json({ 
        message: 'You need to complete at least 2 courses to create a project' 
      });
    }

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
    
    const foundProject = await Project.findById(projectId);
    if(!foundProject) return res.status(404).json({ message: 'Project not found' });

    // Check if user is the project creator (owner)
    if (foundProject.creator.toString() === userId) {
      return res.status(400).json({ message: 'You cannot apply to your own project' });
    }

    // Check if user already applied
    const existingApplication = foundProject.applications.find(
      app => app.userId.toString() === userId
    );
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }

    // Check if user is already a collaborator
    const isCollaborator = foundProject.collaborators.some(
      collab => collab.user.toString() === userId
    );
    if (isCollaborator) {
      return res.status(400).json({ message: 'You are already a collaborator on this project' });
    }

    // Get user's earned technologies
    const user = await User.findById(userId);
    const userTechnologies = user.earnedTechnologies.map(tech => ({ name: tech.name }));

    const application = {
      userId,
      message: message || '',
      technologies: userTechnologies,
      status: 'pending'
    }

    foundProject.applications.push(application);
    await foundProject.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const projectGroupChat = async (req, res) => {
  try {
    const projectId = req.params.id;
    const foundProject = await Project.findById(projectId);
    if(!foundProject) return res.status(404).json({ message: 'Project not found' });

    const chat = foundProject.chat;
    res.status(200).json(chat);
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
    
    // If accepted, add user as collaborator
    if (status === 'accepted') {
      project.collaborators.push({
        user: application.userId,
        role: 'General Contributor'
      });
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
