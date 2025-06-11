import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {

  const navigate = useNavigate();
  // Calculate total duration from chapters
  const totalDuration = course.chapters.reduce((total, chapter) => {
    return total + chapter.levels.reduce((chapterTotal, level) => {
      return chapterTotal + (level.estimatedTime || 0);
    }, 0);
  }, 0);

  // Format duration in hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="border shadow-sm bg-white hover:shadow-md transition-all duration-300">
      <div className="relative">
        {/* Course Thumbnail */}
        <div className="h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={course.thumbNail || "https://placehold.co/600x400"}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {course.category}
          </span>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="text-gray-500 text-xs">+{course.tags.length - 3} more</span>
          )}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>{course.chapters.length} chapters</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{course.learningOutcomes.length} outcomes</span>
          </div>
        </div>

        {/* Requirements Preview */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {course.requirements.slice(0, 2).map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {req}
                </li>
              ))}
              {course.requirements.length > 2 && (
                <li className="text-blue-600">+{course.requirements.length - 2} more requirements</li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${course.isPublished ? "text-green-600" : "text-orange-500"}`}>
              {course.isPublished ? "Available" : "Coming Soon"}
            </span>
            <span className="text-xs text-gray-500">
              Updated {new Date(course.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <Link to={`/course/${course._id}`}>
            <Button size="sm" className="flex items-center gap-2"
            >
              View Course
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
