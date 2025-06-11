import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Clock } from "lucide-react";

const CourseCard = ({
  title = "Course Title",
  description = "Course Description",
  category = "Category",
  level = "Beginner",
  duration = "4 weeks",
  students = "0 students",
  price = "Free",
  isCollaborative = false,
  isFree = true,
}) => {
  return (
    <Card className="border shadow-sm bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700">
            {category}
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
          {level}
        </span>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{students}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span
            className={`font-bold ${isFree ? "text-green-600" : "text-gray-800"}`}
          >
            {price}
          </span>
          <Button size="sm">Enroll Now</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
