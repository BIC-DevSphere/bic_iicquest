import React from "react";
import { ArrowRight, BookOpen, Users, Trophy, Code, Lightbulb, Target, Zap, Play, Star, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const features = [
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: "Interactive Courses",
      description: "Learn programming through hands-on exercises and real-world projects with personalized guidance"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Collaborative Learning",
      description: "Connect with peers in real-time coding sessions and team-based project development"
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: "Achievement System",
      description: "Track your progress and earn badges as you master new skills and complete challenges"
    },
    {
      icon: <Code className="w-7 h-7" />,
      title: "Hands-on Practice",
      description: "Write and test code directly in the browser with instant feedback and code reviews"
    }
  ];

  const stats = [
    { number: "50+", label: "Interactive Courses", color: "from-blue-500 to-indigo-600" },
    { number: "10K+", label: "Active Learners", color: "from-purple-500 to-pink-600" },
    { number: "500+", label: "Projects Completed", color: "from-green-500 to-teal-600" },
    { number: "95%", label: "Success Rate", color: "from-orange-500 to-red-600" }
  ];

  const learningSteps = [
    { 
      step: "1", 
      title: "Choose Your Path", 
      description: "Select from our curated programming courses tailored to your skill level and goals", 
      icon: <Target className="w-7 h-7" />,
      color: "from-blue-500 to-indigo-600"
    },
    { 
      step: "2", 
      title: "Practice & Build", 
      description: "Code along with interactive exercises and build real-world projects with guidance", 
      icon: <Code className="w-7 h-7" />,
      color: "from-purple-500 to-pink-600"
    },
    { 
      step: "3", 
      title: "Connect & Grow", 
      description: "Collaborate with peers, join the community, and accelerate your learning journey", 
      icon: <Users className="w-7 h-7" />,
      color: "from-green-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with elegant background */}
      <section className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 section-bg-primary"></div>
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 pt-20 pb-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass-card-subtle px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-elegant">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-gradient">Welcome to the Future of Learning</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight prose-professional">
                Master <span className="text-gradient-warm">Programming</span>
                <br />Through <span className="text-gradient">Practice</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed prose-professional">
                Join thousands of learners mastering programming through interactive courses, 
                collaborative projects, and real-world challenges on UpTogether.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link 
                  to="/learn/courses"
                  className="inline-flex items-center gap-3 gradient-primary text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-professional hover:shadow-premium btn-hover-lift"
                >
                  <Play className="w-6 h-6" />
                  Start Learning
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <Link 
                  to="/pair-projects"
                  className="inline-flex items-center gap-3 glass-card text-card-foreground px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-elegant hover:shadow-professional"
                >
                  <Users className="w-6 h-6" />
                  Find Project Partners
                </Link>
              </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="group text-center">
                  <div className="glass-card rounded-3xl p-8 transition-all duration-300 group-hover:scale-105 shadow-elegant hover:shadow-professional">
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}>
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-semibold text-sm tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 section-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass-card-subtle px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-gradient">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 prose-professional">
              Why Choose <span className="text-gradient">UpTogether?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto prose-professional">
              Experience learning like never before with our innovative platform designed for modern developers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="glass-card rounded-3xl p-10 transition-all duration-300 group-hover:scale-[1.02] shadow-elegant hover:shadow-professional">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white mb-8 shadow-professional group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-4 prose-professional">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed prose-professional">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-24 px-8 section-bg-accent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass-card-subtle px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-gradient">Learning Journey</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 prose-professional">
              Your Path to <span className="text-gradient-warm">Mastery</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto prose-professional">
              Follow our structured learning paths designed to take you from beginner to expert
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {learningSteps.map((item, index) => (
              <div key={index} className="text-center group relative">
                <div className="glass-card rounded-3xl p-10 transition-all duration-300 group-hover:scale-105 shadow-elegant hover:shadow-professional">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${item.color} mx-auto mb-8 flex items-center justify-center text-white shadow-professional group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className={`text-sm font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-4 tracking-wide`}>
                    STEP {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-4 prose-professional">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground prose-professional">
                    {item.description}
                  </p>
                </div>
                
                {/* Connection line */}
                {index < learningSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-16 shadow-premium relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-transparent to-secondary"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-8 flex items-center justify-center shadow-premium animate-float">
                <Lightbulb className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-card-foreground mb-6 prose-professional">
                Ready to Transform Your <span className="text-gradient-warm">Career?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 prose-professional">
                Join our community of learners and start building the skills that matter in today's tech world.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  to="/learn/courses"
                  className="inline-flex items-center gap-3 gradient-primary text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-professional btn-hover-lift"
                >
                  <Star className="w-6 h-6" />
                  Explore Courses
                </Link>
                <Link 
                  to="/community"
                  className="inline-flex items-center gap-3 glass-card-subtle text-accent-foreground px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-elegant"
                >
                  <Users className="w-6 h-6" />
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
