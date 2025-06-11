import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import CourseCard from "../components/CourseCard";
import SearchFilter from "../components/SearchFilter";

const courses = [
  {
    id: 1,
    title: "Complete React Development Bootcamp",
    description:
      "Master React from basics to advanced concepts. Build real-world projects with hooks, context, and modern patterns.",
    category: "Frontend Development",
    level: "Beginner",
    duration: "8 weeks",
    students: "245 students",
    price: "Free",
    isCollaborative: true,
    isFree: true,
  },
  {
    id: 2,
    title: "Node.js & Express API Mastery",
    description:
      "Build scalable REST APIs with Node.js, Express, and MongoDB. Learn authentication, testing, and deployment.",
    category: "Backend Development",
    level: "Intermediate",
    duration: "6 weeks",
    students: "189 students",
    price: "$49",
    isCollaborative: true,
    isFree: false,
  },
  {
    id: 3,
    title: "Python Programming Fundamentals",
    description:
      "Learn Python from scratch with hands-on projects. Perfect for beginners starting their programming journey.",
    category: "Programming",
    level: "Beginner",
    duration: "4 weeks",
    students: "312 students",
    price: "Free",
    isCollaborative: false,
    isFree: true,
  },
  {
    id: 4,
    title: "MERN Stack Project Workshop",
    description:
      "Build a complete social media app using MongoDB, Express, React, and Node.js with real-time features.",
    category: "Full Stack",
    level: "Advanced",
    duration: "12 weeks",
    students: "156 students",
    price: "$89",
    isCollaborative: true,
    isFree: false,
  },
  {
    id: 5,
    title: "React Native Mobile Apps",
    description:
      "Create cross-platform mobile applications with React Native. Build and deploy to both iOS and Android.",
    category: "Mobile Development",
    level: "Intermediate",
    duration: "10 weeks",
    students: "98 students",
    price: "$69",
    isCollaborative: false,
    isFree: false,
  },
  {
    id: 6,
    title: "Database Design & SQL Mastery",
    description:
      "Master database concepts, SQL queries, and database design principles with hands-on practice.",
    category: "Database",
    level: "Beginner",
    duration: "5 weeks",
    students: "203 students",
    price: "Free",
    isCollaborative: true,
    isFree: true,
  },
];

const CourseCatalogPage = () => {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="min-h-screen mt-10">
      <div>
        {/* Header Section */}

        {/* Search and Filter Section */}
        <div className="mb-8">
          <SearchFilter />
        </div>

        {/* Main Content */}
        <div className="">
          {/* Courses Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Courses</h2>
            <div className="flex bg-white/20 rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white/90 text-blue-600"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white/90 text-blue-600"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>

          {/* Load More Section */}
          <div className="text-center mt-12">
            <Button className="bg-white/95 backdrop-blur-sm text-blue-600 border-2 border-white/30 px-8 py-3 rounded-full font-semibold hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Load More Courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalogPage;
