import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import dummyCourseDataResponse from "../data/dummyCourseDataResponse.json";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "@/configs/apiConfigs.js";

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // const courseId = "68497561769d90b44f86367e";

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // const response = await axios.get(`${API_ENDPOINTS.getcoursesInfo}/${courseId}/chapters`);
        const response = await axios.get(`${API_ENDPOINTS.getCoursesInfo}/${courseId}`);
        // const data = dummyCourseDataResponse;
        console.log(response.data);
        setCourse(response.data);
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
                <button
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/course-lessons/${courseId}`)}
                >
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
                  <div
                    key={chapter._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      Chapter {index + 1}: {chapter.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{chapter.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {chapter.levels.length} levels
                      </span>
                      <Link
                        to={`/course/${courseId}/chapter/${chapter._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Chapter
                      </Link>
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
