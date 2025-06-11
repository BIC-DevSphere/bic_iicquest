import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dummyCourseDataResponse from "../data/dummyCourseDataResponse.json";
import { Link } from "react-router-dom";

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // const response = await fetch(`/api/courses/${courseId}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch course details');
        // }
        // const data = await response.json();
        const data = dummyCourseDataResponse;
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Course not found</div>
      </div>
    );
  }

  return (
    <div className="course-page-container mx-auto px-4 py-8">

        {/* {Breadcrumb} */}
      <div className="course-page-breadcrumbs">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/learn/courses" className="hover:text-blue-600 transition-colors">
            Learn
          </Link>
          <span className="text-gray-400">/</span>
          <Link to={`/course/${courseId}`} className="text-blue-600 font-medium">
            {course.title}
          </Link>
        </nav>
      </div>

      <div className="course-page-content">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {course.category}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {course.estimatedHours} hours
                </span>
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Learning Outcomes</h2>
                <ul className="list-disc list-inside space-y-1">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="text-gray-600">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:w-1/3">
            <img src={course.thumbNail} alt={course.title} />
              <div className="p-4 border rounded-lg">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Start Learning
                </button>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Last updated {new Date(course.updatedAt).toLocaleDateString()} {}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="text-gray-600">
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Chapters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.chapters.map((chapter, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">
                        Chapter {chapter.order}: {chapter.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{chapter.description}</p>

                    {/* Chapter Prerequisites */}
                    {chapter.prerequisites && chapter.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Prerequisites:</h4>
                        <div className="flex flex-wrap gap-2">
                          {chapter.prerequisites.map((prereq, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                            >
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapter Levels */}
                    <div className="space-y-3">
                      {chapter.levels.map((level, levelIndex) => (
                        <div key={levelIndex} className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              Level {level.order}: {level.title}
                            </h4>
                            <span className="text-sm text-gray-500">{level.estimatedTime} min</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{level.description}</p>

                          {/* Level Content */}
                          <div className="space-y-2">
                            {level.content.map((content, contentIndex) => (
                              <div key={contentIndex} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">▶</span>
                                  <span>{content.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-700">Category</h3>
                  <p className="text-gray-600">{course.category}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Estimated Time</h3>
                  <p className="text-gray-600">{course.estimatedHours} hours</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Last Updated</h3>
                  <p className="text-gray-600">{new Date(course.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
