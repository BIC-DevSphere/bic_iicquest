import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star, ChevronRight, Tag, CheckCircle, PlayCircle, Sparkles, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CourseCard = ({ course, viewMode = "grid" }) => {
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
  const images = {
    "Python Fundamentals": "https://cdn.springpeople.com/media/python%20logo.png",
    "Comprehensive Programming Course": "https://images-ext-1.discordapp.net/external/7J5G2E1jSgW1HFgIeiLLTXS7OChO6v6UAn3iFVK7-hA/%3Fq%3Dtbn%3AANd9GcTFmyJtI5JOzKaP9A5djVpooawZlQ_Y6PWbAw%26s/https/encrypted-tbn0.gstatic.com/images?format=webp",
    "Essential Computer Skills": "https://images-ext-1.discordapp.net/external/Etx8mYbBHr23CSQwFLruGYcXxngEvgbXh1O91VlUffs/https/onlineexammaker.com/kb/wp-content/uploads/2023/07/computer-skills-quiz.webp?format=webp&width=400&height=244"
  }

  const courseImage = images[course.title] || "https://placehold.co/600x400";

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-premium transition-all duration-300 hover:scale-[1.01] border-border/30">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Enhanced Thumbnail */}
            <div className="lg:w-56 h-40 lg:h-auto rounded-2xl overflow-hidden flex-shrink-0 relative group">
              <img
                src={courseImage}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-premium">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="glass-card-subtle text-primary px-4 py-2 rounded-full text-sm font-bold shadow-elegant">
                      {course.category}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold shadow-elegant ${
                      course.isPublished 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      {course.isPublished ? "Available Now" : "Coming Soon"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3 hover:text-primary transition-colors prose-professional">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed line-clamp-2 prose-professional">
                    {course.description}
                  </p>
                </div>
                
                <Link to={`/course/${course._id}`} className="ml-6">
                  <Button variant="gradient" size="lg" className="px-8">
                    <GraduationCap className="w-5 h-5" />
                    Start Learning
                  </Button>
                </Link>
              </div>

              {/* Enhanced Stats */}
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2 glass-card-subtle px-4 py-2 rounded-xl shadow-elegant">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2 glass-card-subtle px-4 py-2 rounded-xl shadow-elegant">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{course.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-2 glass-card-subtle px-4 py-2 rounded-xl shadow-elegant">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{course.learningOutcomes.length} outcomes</span>
                </div>
              </div>

              {/* Enhanced Tags */}
              <div className="flex flex-wrap gap-3">
                {course.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="section-bg-secondary text-secondary-foreground px-3 py-1 rounded-xl text-sm font-medium border border-border/30"
                  >
                    {tag}
                  </span>
                ))}
                {course.tags.length > 5 && (
                  <span className="text-muted-foreground text-sm font-medium">+{course.tags.length - 5} more</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default) with enhanced styling
  return (
    <Card className="hover:shadow-premium transition-all duration-300 group hover:scale-[1.02] border-border/30 overflow-hidden">
      <div className="relative overflow-hidden">
        {/* Enhanced Course Thumbnail */}
        <div className="h-56 w-full overflow-hidden relative">
          <img
            src={courseImage}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Enhanced Category Badge */}
        <div className="absolute top-6 left-6">
          <span className="glass-card text-primary px-4 py-2 rounded-full text-sm font-bold shadow-professional backdrop-blur-md">
            {course.category}
          </span>
        </div>

        {/* Enhanced Status Badge */}
        <div className="absolute top-6 right-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold shadow-professional backdrop-blur-md ${
            course.isPublished 
              ? "glass-card text-green-700 border border-green-200/50" 
              : "glass-card text-orange-700 border border-orange-200/50"
          }`}>
            <CheckCircle className="w-3 h-3" />
            {course.isPublished ? "Available" : "Soon"}
          </span>
        </div>

        {/* Enhanced Hover Overlay */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link to={`/course/${course._id}`}>
            <Button variant="elegant" size="lg" className="transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-premium">
              <PlayCircle className="w-6 h-6" />
              Start Learning
            </Button>
          </Link>
        </div>
      </div>

      <CardContent className="p-8 space-y-6">
        {/* Enhanced Title and Description */}
        <div>
          <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors prose-professional">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed prose-professional">
            {course.description}
          </p>
        </div>

        {/* Enhanced Course Stats */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center glass-card-subtle rounded-xl p-3 shadow-elegant">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-semibold text-muted-foreground">{formatDuration(totalDuration)}</div>
          </div>
          <div className="text-center glass-card-subtle rounded-xl p-3 shadow-elegant">
            <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-semibold text-muted-foreground">{course.chapters.length} chapters</div>
          </div>
          <div className="text-center glass-card-subtle rounded-xl p-3 shadow-elegant">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xs font-semibold text-muted-foreground">{course.learningOutcomes.length} outcomes</div>
          </div>
        </div>

        {/* Enhanced Tags */}
        <div className="flex flex-wrap gap-2">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="section-bg-secondary text-secondary-foreground px-3 py-1 rounded-xl text-xs font-medium border border-border/30"
            >
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className="text-muted-foreground text-xs font-medium">+{course.tags.length - 3} more</span>
          )}
        </div>

        {/* Enhanced Requirements Preview */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="border-t border-border/30 pt-6">
            <h4 className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Prerequisites:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              {course.requirements.slice(0, 2).map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  {req}
                </li>
              ))}
              {course.requirements.length > 2 && (
                <li className="text-primary font-semibold">+{course.requirements.length - 2} more requirements</li>
              )}
            </ul>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-border/30">
          <div className="text-xs text-muted-foreground font-medium">
            Updated {new Date(course.updatedAt).toLocaleDateString()}
          </div>
          <Link to={`/course/${course._id}`}>
            <Button size="sm" variant="elegant" className="group/btn">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
