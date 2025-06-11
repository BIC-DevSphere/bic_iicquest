import React, {useEffect} from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {useNavigate, useParams} from "react-router-dom";
import dummyCourseDataResponse from "../data/dummyCourseDataResponse.json";

const CourseLessonsListPage = () => {
  const { courseId } = useParams();
  const [expandedChapters, setExpandedChapters] = useState({});
  const course = dummyCourseDataResponse;
  const navigate = useNavigate();

    useEffect(() => {

    }, []);
  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{course.title} - Course Content</h1>

      <div className="space-y-4">
        {course.chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="border rounded-lg overflow-hidden">
            {/* Chapter Header */}
            <div
              className="bg-white p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleChapter(chapterIndex)}
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Chapter {chapter.order}: {chapter.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
              </div>
              {expandedChapters[chapterIndex] ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Expanded Chapter Content */}
            {expandedChapters[chapterIndex] && (
              <div className="bg-gray-50 p-4 border-t">
                <div className="space-y-4">
                  {chapter.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="bg-white p-4 rounded-lg shadow-sm">
                      <button className="font-medium mb-2 hover:underline cursor-pointer"
                        onClick={()=>navigate(`/course/content/level/${courseId}`)}
                      >
                        Level {level.order}: {level.title}
                      </button>
                      <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>⏱️ {level.estimatedTime} minutes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseLessonsListPage;
