import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List, BookOpen, Filter, Search, Sparkles, GraduationCap, TrendingUp, RefreshCw } from "lucide-react";
import CourseCard from "../components/CourseCard";
import SearchFilter from "../components/SearchFilter";
import { getAllCourses, getCoursesByCategory, searchCourses } from "@/services/courseService";

// const courses = [
//   {
//     id: 1,
//     title: "Complete React Development Bootcamp",
//     description:
//       "Master React from basics to advanced concepts. Build real-world projects with hooks, context, and modern patterns.",
//     category: "Frontend Development",
//     level: "Beginner",
//     duration: "8 weeks",
//     students: "245 students",
//     price: "Free",
//     isCollaborative: true,
//     isFree: true,
//   },
//   {
//     id: 2,
//     title: "Node.js & Express API Mastery",
//     description:
//       "Build scalable REST APIs with Node.js, Express, and MongoDB. Learn authentication, testing, and deployment.",
//     category: "Backend Development",
//     level: "Intermediate",
//     duration: "6 weeks",
//     students: "189 students",
//     price: "$49",
//     isCollaborative: true,
//     isFree: false,
//   },
//   {
//     id: 3,
//     title: "Python Programming Fundamentals",
//     description:
//       "Learn Python from scratch with hands-on projects. Perfect for beginners starting their programming journey.",
//     category: "Programming",
//     level: "Beginner",
//     duration: "4 weeks",
//     students: "312 students",
//     price: "Free",
//     isCollaborative: false,
//     isFree: true,
//   },
//   {
//     id: 4,
//     title: "MERN Stack Project Workshop",
//     description:
//       "Build a complete social media app using MongoDB, Express, React, and Node.js with real-time features.",
//     category: "Full Stack",
//     level: "Advanced",
//     duration: "12 weeks",
//     students: "156 students",
//     price: "$89",
//     isCollaborative: true,
//     isFree: false,
//   },
//   {
//     id: 5,
//     title: "React Native Mobile Apps",
//     description:
//       "Create cross-platform mobile applications with React Native. Build and deploy to both iOS and Android.",
//     category: "Mobile Development",
//     level: "Intermediate",
//     duration: "10 weeks",
//     students: "98 students",
//     price: "$69",
//     isCollaborative: false,
//     isFree: false,
//   },
//   {
//     id: 6,
//     title: "Database Design & SQL Mastery",
//     description:
//       "Master database concepts, SQL queries, and database design principles with hands-on practice.",
//     category: "Database",
//     level: "Beginner",
//     duration: "5 weeks",
//     students: "203 students",
//     price: "Free",
//     isCollaborative: true,
//     isFree: true,
//   },
// ];

const CourseCatalogPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let data;
        if (searchQuery) {
          data = await searchCourses(searchQuery);
        } else if (selectedCategory !== "all") {
          data = await getCoursesByCategory(selectedCategory);
        } else {
          data = await getAllCourses();
        }
        setCourses(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center animate-pulse">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Course Catalog</h1>
              <p className="text-muted-foreground text-sm mt-1">Discover and master new skills</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-6">
            <SearchFilter />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
            </h2>
            {(selectedCategory !== "all" || searchQuery) && (
              <p className="text-sm text-muted-foreground">
                {selectedCategory !== "all" && `Category: ${selectedCategory}`}
                {searchQuery && `Search: "${searchQuery}"`}
              </p>
            )}
          </div>
        </div>

        {/* Courses Grid/List */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Check back later for new courses"
                }
              </p>
              {(searchQuery || selectedCategory !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1 max-w-3xl mx-auto"
            }`}
          >
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Load More */}
        {courses.length > 0 && courses.length >= 6 && (
          <div className="text-center mt-12">
            <Button variant="outline">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalogPage;
