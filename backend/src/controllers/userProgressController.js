import UserProgress from '../models/UserProgress.js';
import Course from '../models/Course.js';

// Initialize user progress for a course
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
      return res.status(400).json({ 
        message: 'Progress already initialized for this course' 
      });
    }

    // Create new progress entry
    const progress = new UserProgress({
      user: userId,
      course: courseId,
      startedAt: Date.now()
    });

    const savedProgress = await progress.save();
    res.status(201).json(savedProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update test case progress
export const updateTestCaseProgress = async (req, res) => {
  try {
    const { courseId, chapterIndex, levelIndex, testCaseId, code, passed } = req.body;
    
    const progress = await UserProgress.findOne({
      user: req.user.id,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Find the specific test case in the nested structure
    const chapter = progress.chapterProgress[chapterIndex];
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter progress not found' });
    }

    const level = chapter.levelProgress[levelIndex];
    if (!level) {
      return res.status(404).json({ message: 'Level progress not found' });
    }

    const testCase = level.testCaseProgress.find(
      tcp => tcp.testCase.toString() === testCaseId
    );

    if (!testCase) {
      // Initialize test case progress if it doesn't exist
      level.testCaseProgress.push({
        testCase: testCaseId,
        passed,
        attempts: 1,
        lastAttemptedCode: code,
        lastAttemptDate: Date.now()
      });
    } else {
      // Update existing test case progress
      testCase.passed = passed;
      testCase.attempts += 1;
      testCase.lastAttemptedCode = code;
      testCase.lastAttemptDate = Date.now();
    }

    // Update level status if all test cases are passed
    if (level.testCaseProgress.every(tcp => tcp.passed)) {
      level.status = 'completed';
      level.completedAt = Date.now();
    } else {
      level.status = 'in_progress';
    }

    // Update chapter status
    if (chapter.levelProgress.every(lp => lp.status === 'completed')) {
      chapter.status = 'completed';
      chapter.completedAt = Date.now();
    } else {
      chapter.status = 'in_progress';
    }

    // Update overall progress
    const course = await Course.findById(courseId);
    const totalLevels = course.chapters.reduce(
      (sum, ch) => sum + ch.levels.length, 
      0
    );
    const completedLevels = progress.chapterProgress.reduce(
      (sum, ch) => sum + ch.levelProgress.filter(lp => lp.status === 'completed').length,
      0
    );
    
    progress.overallProgress = (completedLevels / totalLevels) * 100;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = new Date(progress.streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    if (today - lastActivity === 86400000) { // One day difference
      progress.streak.current += 1;
      progress.streak.longest = Math.max(progress.streak.current, progress.streak.longest);
    } else if (today - lastActivity > 86400000) { // More than one day
      progress.streak.current = 1;
    }
    progress.streak.lastActivityDate = Date.now();

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user progress for a course
export const getCourseProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course', 'title');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all progress for a user
export const getAllProgress = async (req, res) => {
  try {
    const progress = await UserProgress.find({
      user: req.user.id
    }).populate('course', 'title category');

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update time spent on level
export const updateTimeSpent = async (req, res) => {
  try {
    const { courseId, chapterIndex, levelIndex, timeSpent } = req.body;
    
    const progress = await UserProgress.findOne({
      user: req.user.id,
      course: courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    const chapter = progress.chapterProgress[chapterIndex];
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter progress not found' });
    }

    const level = chapter.levelProgress[levelIndex];
    if (!level) {
      return res.status(404).json({ message: 'Level progress not found' });
    }

    // Update time spent
    level.timeSpent += timeSpent;
    chapter.timeSpent += timeSpent;
    progress.totalTimeSpent += timeSpent;

    await progress.save();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Abandon a course
export const abandonCourse = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.status = 'abandoned';
    await progress.save();

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 