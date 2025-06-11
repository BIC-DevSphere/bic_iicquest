import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new course overview page
    navigate(`/course/${courseId}/overview`, { replace: true });
  }, [courseId, navigate]);

  return (
    <div className="min-h-screen mt-10 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to course overview...</p>
      </div>
    </div>
  );
};

export default CoursePage;
