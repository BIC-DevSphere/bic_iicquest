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