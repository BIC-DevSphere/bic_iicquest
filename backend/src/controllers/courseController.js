import Course from '../models/Course.js';

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({ 
      category: req.params.category,
      isPublished: true 
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get published course count by category
export const getCourseCountByCategory = async (req, res) => {
  try {
    const courseCounts = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.status(200).json(courseCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get courses by learning outcome
export const getCoursesByLearningOutcome = async (req, res) => {
  try {
    const { outcome } = req.query;
    const courses = await Course.find({
      isPublished: true,
      learningOutcomes: { 
        $elemMatch: { 
          $regex: outcome, 
          $options: 'i' 
        } 
      }
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      isPublished: false
    });
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add chapter to course
export const addChapter = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { title, description, prerequisites, order } = req.body;
    course.chapters.push({
      title,
      description,
      prerequisites,
      order,
      levels: []
    });

    // Sort chapters by order
    course.chapters.sort((a, b) => a.order - b.order);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add level to chapter
export const addLevel = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const { title, description, order, estimatedTime, starterCode, solutionCode, hints } = req.body;
    chapter.levels.push({
      title,
      description,
      order,
      estimatedTime,
      starterCode,
      solutionCode,
      hints,
      content: [],
      testCases: []
    });

    // Sort levels by order
    chapter.levels.sort((a, b) => a.order - b.order);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add content to level
export const addContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const level = chapter.levels.id(req.params.levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const { title, content, order } = req.body;
    level.content.push({
      title,
      content,
      order
    });

    // Sort content by order
    level.content.sort((a, b) => a.order - b.order);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add test case to level
export const addTestCase = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const level = chapter.levels.id(req.params.levelId);
    if (!level) {
      return res.status(404).json({ message: 'Level not found' });
    }

    const { description, testCode, expectedOutput, hint } = req.body;
    level.testCases.push({
      description,
      testCode,
      expectedOutput,
      hint
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update course publish status
export const updateCourseStatus = async (req, res) => {
  try {
    const { isPublished } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { isPublished },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 