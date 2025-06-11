import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Initialize progress for a course
export const initializeProgress = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if progress already exists
    const existingProgress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    if (existingProgress) {
      return res.status(200).json(existingProgress);
    }

    // Create new progress
    const progress = new UserProgress({
      user: userId,
      course: courseId,
      status: 'in_progress',
      startedAt: new Date()
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course progress for current user
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({
      user: userId,
      course: courseId
    }).populate('course');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Calculate completed levels count
    let completedLevels = 0;
    progress.chapterProgress.forEach(chapter => {
      chapter.levelProgress.forEach(level => {
        if (level.status === 'completed') {
          completedLevels++;
        }
      });
    });

    // Add computed fields
    const progressWithStats = {
      ...progress.toObject(),
      completedLevelsCount: completedLevels,
      completedLevels: progress.chapterProgress.flatMap(chapter => 
        chapter.levelProgress
          .filter(level => level.status === 'completed')
          .map(level => ({
            chapterId: chapter.chapter,
            levelId: level.level
          }))
      )
    };

    res.status(200).json(progressWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update level progress
export const updateLevelProgress = async (req, res) => {
  try {
    const { courseId, chapterId, levelId, status, timeSpent } = req.body;
    const userId = req.user.id;

    let progress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    if (!progress) {
      // Initialize if doesn't exist
      progress = new UserProgress({
        user: userId,
        course: courseId,
        status: 'in_progress',
        startedAt: new Date()
      });
    }

    // Find or create chapter progress
    let chapterProgress = progress.chapterProgress.find(cp => 
      cp.chapter.toString() === chapterId
    );

    if (!chapterProgress) {
      chapterProgress = {
        chapter: chapterId,
        status: 'in_progress',
        startedAt: new Date(),
        levelProgress: []
      };
      progress.chapterProgress.push(chapterProgress);
    }

    // Find or create level progress
    let levelProgress = chapterProgress.levelProgress.find(lp => 
      lp.level.toString() === levelId
    );

    if (!levelProgress) {
      levelProgress = {
        level: levelId,
        status: 'not_started',
        testCaseProgress: []
      };
      chapterProgress.levelProgress.push(levelProgress);
    }

    // Update level progress
    if (status === 'content_completed' && levelProgress.status === 'not_started') {
      levelProgress.status = 'in_progress';
      levelProgress.startedAt = new Date();
    }

    if (timeSpent) {
      levelProgress.timeSpent = (levelProgress.timeSpent || 0) + timeSpent;
      progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpent;
    }

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete level test
export const completeLevelTest = async (req, res) => {
  try {
    const { courseId, chapterId, levelId, score, timeSpent, code } = req.body;
    const userId = req.user.id;

    let progress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Find chapter and level progress
    const chapterProgress = progress.chapterProgress.find(cp => 
      cp.chapter.toString() === chapterId
    );

    if (!chapterProgress) {
      return res.status(404).json({ message: 'Chapter progress not found' });
    }

    const levelProgress = chapterProgress.levelProgress.find(lp => 
      lp.level.toString() === levelId
    );

    if (!levelProgress) {
      return res.status(404).json({ message: 'Level progress not found' });
    }

    // Mark level as completed
    levelProgress.status = 'completed';
    levelProgress.completedAt = new Date();
    levelProgress.currentCode = code;

    if (timeSpent) {
      levelProgress.timeSpent = (levelProgress.timeSpent || 0) + timeSpent;
      progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpent;
    }

    // Check if chapter is completed
    const allLevelsCompleted = chapterProgress.levelProgress.every(lp => 
      lp.status === 'completed'
    );

    if (allLevelsCompleted) {
      chapterProgress.status = 'completed';
      chapterProgress.completedAt = new Date();
    }

    // Check if course is completed - validate against actual course structure
    const course = await Course.findById(courseId);
    if (course) {
      // Check if all chapters from the course exist in progress and are completed
      const allCourseChaptersCompleted = course.chapters.every(courseChapter => {
        const progressChapter = progress.chapterProgress.find(cp => 
          cp.chapter.toString() === courseChapter._id.toString()
        );
        return progressChapter && progressChapter.status === 'completed';
      });

      // Also check that all chapters in progress are completed
      const allProgressChaptersCompleted = progress.chapterProgress.every(cp => 
        cp.status === 'completed'
      );

      if (allCourseChaptersCompleted && allProgressChaptersCompleted && progress.chapterProgress.length === course.chapters.length) {
        progress.status = 'completed';
        progress.completedAt = new Date();
        
        // Award technology badges only when entire course is completed
        try {
          await awardTechnologyBadges(userId, courseId);
        } catch (err) {
          console.error('Error awarding badges:', err);
        }
      }
    }

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Award technology badges upon course completion
const awardTechnologyBadges = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) return;

    // Add earned technologies to user
    if (course.technologies && course.technologies.length > 0) {
      course.technologies.forEach(tech => {
        // Check if user already has this technology
        const existingTech = user.earnedTechnologies.find(et => 
          et.name === tech.name && et.proficiencyLevel === tech.proficiencyLevel
        );

        if (!existingTech) {
          user.earnedTechnologies.push({
            name: tech.name,
            proficiencyLevel: tech.proficiencyLevel,
            description: tech.description,
            earnedFrom: {
              course: courseId,
              earnedAt: new Date()
            }
          });
        }

        // Add technology badge for each technology
        const existingTechBadge = user.badges.find(badge => 
          badge.name === `${tech.name} ${tech.proficiencyLevel.charAt(0).toUpperCase() + tech.proficiencyLevel.slice(1)}` &&
          badge.category === 'achievement'
        );

        if (!existingTechBadge) {
          user.badges.push({
            name: `${tech.name} ${tech.proficiencyLevel.charAt(0).toUpperCase() + tech.proficiencyLevel.slice(1)}`,
            description: `Earned ${tech.proficiencyLevel} level proficiency in ${tech.name}`,
            icon: 'code',
            category: 'achievement',
            earnedAt: new Date()
          });
        }
      });
    }

    // Add course completion badge
    const existingCompletionBadge = user.badges.find(badge => 
      badge.name === `${course.title} Completion` && badge.category === 'course_completion'
    );

    if (!existingCompletionBadge) {
      user.badges.push({
        name: `${course.title} Completion`,
        description: `Successfully completed the ${course.title} course`,
        icon: 'trophy',
        category: 'course_completion',
        earnedAt: new Date()
      });
    }

    await user.save();
    console.log(`Awarded badges to user ${userId} for completing course ${course.title}`);
  } catch (error) {
    console.error('Error awarding technology badges:', error);
  }
};

// Get user's overall progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const allProgress = await UserProgress.find({ user: userId })
      .populate('course', 'title description category')
      .sort({ lastAccessedAt: -1 });

    res.status(200).json(allProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete chapter
export const completeChapter = async (req, res) => {
  try {
    const { courseId, chapterId } = req.body;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const chapterProgress = progress.chapterProgress.find(cp => 
      cp.chapter.toString() === chapterId
    );

    if (!chapterProgress) {
      return res.status(404).json({ message: 'Chapter progress not found' });
    }

    chapterProgress.status = 'completed';
    chapterProgress.completedAt = new Date();

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete course
export const completeCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const progress = await UserProgress.findOne({
      user: userId,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Validate that the entire course is actually completed
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if all chapters from the course exist in progress and are completed
    const allCourseChaptersCompleted = course.chapters.every(courseChapter => {
      const progressChapter = progress.chapterProgress.find(cp => 
        cp.chapter.toString() === courseChapter._id.toString()
      );
      if (!progressChapter || progressChapter.status !== 'completed') {
        return false;
      }
      
      // Also check if all levels in the chapter are completed
      return courseChapter.levels.every(courseLevel => {
        const levelProgress = progressChapter.levelProgress.find(lp =>
          lp.level.toString() === courseLevel._id.toString()
        );
        return levelProgress && levelProgress.status === 'completed';
      });
    });

    if (!allCourseChaptersCompleted) {
      return res.status(400).json({ 
        message: 'Cannot complete course. All chapters and levels must be completed first.' 
      });
    }

    progress.status = 'completed';
    progress.completedAt = new Date();

    // Award technology badges only after full validation
    await awardTechnologyBadges(userId, courseId);

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 