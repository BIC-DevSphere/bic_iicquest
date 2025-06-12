import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  Filter,
  Star,
  Users,
  Code2,
  BookmarkPlus,
  BookmarkCheck,
  Send,
  Loader2,
  SlidersHorizontal,
  Percent
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "@/configs/apiConfigs";

const JobBoardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resume: null,
    jobId: null
  });
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Enhanced job listings with more details
  const dummyJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      description: "Looking for an experienced frontend developer to join our team...",
      requirements: ["React", "TypeScript", "Python"],
      postedDate: "2024-03-15",
      category: "Frontend",
      locationType: "On-site",
      skills: ["React", "TypeScript", "Python"],
      skillWeights: {
        "React": 1,
        "TypeScript": 0.9,
        "Python": 0.8
      },
      preferredBadges: ["Python Technology", "React Mastery"],
      minimumProjects: 1
    },
    {
      id: 2,
      title: "Python Developer",
      company: "DataTech Solutions",
      location: "Remote",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      description: "Join our team as a Python developer working on data processing and analytics solutions...",
      requirements: ["Python", "Data Analysis", "SQL"],
      postedDate: "2024-03-16",
      category: "Backend",
      locationType: "Remote",
      skills: ["Python", "SQL", "Data Analysis"],
      skillWeights: {
        "Python": 1,
        "SQL": 0.8,
        "Data Analysis": 0.7
      },
      preferredBadges: ["Python Technology"],
      minimumProjects: 0
    },
    {
      id: 3,
      title: "Full Stack Python Developer",
      company: "Tech Innovators",
      location: "New York, NY",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      description: "Looking for a full stack developer with strong Python skills...",
      requirements: ["Python", "React", "Django"],
      postedDate: "2024-03-17",
      category: "Full Stack",
      locationType: "Hybrid",
      skills: ["Python", "React", "Django"],
      skillWeights: {
        "Python": 1,
        "React": 0.9,
        "Django": 0.8
      },
      preferredBadges: ["Python Technology", "Full Stack Master"],
      minimumProjects: 2
    },
    {
      id: 4,
      title: "Junior Python Developer",
      company: "StartupX",
      location: "Remote",
      type: "Full-time",
      salary: "$70,000 - $90,000",
      description: "Great opportunity for Python developers starting their career...",
      requirements: ["Python", "Basic Web Development"],
      postedDate: "2024-03-18",
      category: "Backend",
      locationType: "Remote",
      skills: ["Python", "HTML", "CSS"],
      skillWeights: {
        "Python": 1,
        "HTML": 0.6,
        "CSS": 0.6
      },
      preferredBadges: ["Python Technology"],
      minimumProjects: 0
    }
  ];

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Assuming you store the token in localStorage
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const profileData = response.data;
        setUserData({
          id: profileData._id,
          name: profileData.fullName,
          email: profileData.email,
          skills: profileData.earnedTechnologies.map(tech => tech.name),
          badges: profileData.badges,
          completedProjects: 0, // This will need to be added to the backend
          experience: '0 years', // This will need to be added to the backend
          skillLevels: profileData.earnedTechnologies.reduce((acc, tech) => {
            // For now, we'll set a default skill level of 0.7 for earned technologies
            acc[tech.name] = 0.7;
            return acc;
          }, {})
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
        setError('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Only load jobs after user profile is loaded
    if (userData) {
      // Simulate API call
      setTimeout(() => {
        const jobsWithMatches = dummyJobs.map(job => ({
          ...job,
          matchPercentage: calculateEnhancedSkillMatch(job)
        }));
        setJobs(jobsWithMatches);
        setFilteredJobs(jobsWithMatches);
        setLoading(false);
      }, 1000);
    }
  }, [userData]);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedCategory, selectedLocation]);

  // Enhanced skill matching algorithm
  const calculateEnhancedSkillMatch = (job) => {
    if (!userData) return 0;
    
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Calculate weighted score based on skill importance and user's earned technologies
    Object.entries(job.skillWeights || {}).forEach(([skill, weight]) => {
      maxPossibleScore += weight;
      
      const hasSkill = userData.skills.some(
        userSkill => userSkill.toLowerCase() === skill.toLowerCase()
      );
      
      if (hasSkill) {
        totalScore += weight;
      }
    });

    // Add bonus points for matching badges
    const badgeBonus = 0.2; // 20% bonus for each matching badge
    job.preferredBadges?.forEach(badge => {
      if (userData.badges.some(userBadge => userBadge.name === badge)) {
        totalScore += maxPossibleScore * badgeBonus;
      }
    });

    // Project requirements impact
    const projectScore = userData.completedProjects >= (job.minimumProjects || 0) ? 1 : 0.5;
    totalScore *= projectScore;

    // Calculate final percentage
    const finalScore = Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));
    return finalScore;
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(job => job.locationType === selectedLocation);
    }

    // Always sort by match percentage in descending order
    filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);

    setFilteredJobs(filtered);
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
        toast({
          title: "Job Removed",
          description: "Job removed from saved jobs",
        });
      } else {
        newSaved.add(jobId);
        toast({
          title: "Job Saved",
          description: "Job added to saved jobs",
        });
      }
      return newSaved;
    });
  };

  const handleApplyJob = async (jobId) => {
    if (!applicationData.coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppliedJobs(prev => new Set([...prev, jobId]));
      setApplicationData({ coverLetter: "", resume: null, jobId: null });
      
      // Get the job details for the success message
      const job = jobs.find(j => j.id === jobId);
      
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Application Submitted Successfully!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your application for {job?.title} at {job?.company} has been submitted. We'll notify you of any updates.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: "top-center"
      });

    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update job card to show match details
  const renderMatchDetails = (job) => {
    const matchingSkills = job.skills.filter(skill => 
      userData.skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    );
    
    const matchingBadges = job.preferredBadges?.filter(badge =>
      userData.badges.some(userBadge => userBadge.name === badge)
    ) || [];

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Match Details:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-500" />
            <span>Matching Skills: {matchingSkills.length}/{job.skills.length}</span>
          </li>
          <li className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Relevant Badges: {matchingBadges.length}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span>Projects: {userData.completedProjects}/{job.minimumProjects || 0} Required</span>
          </li>
        </ul>
      </div>
    );
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    return "Partial Match";
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-32 w-32 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!userData ) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Complete More Projects</h2>
            <p className="text-gray-600 mb-4">
              You need to complete at least 2 projects to view job listings.
              Current completed projects: {userData?.completedProjects}
            </p>
            <Button onClick={() => window.location.href = "/learn/courses"}>
              View Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Board</h1>
          <p className="text-gray-600">
            Find opportunities that match your skills and experience
          </p>
          {userData && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Skills:</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill, index) => (
                    <Badge key={index} variant="default">
                      {skill}
                      {userData.skillLevels[skill] && (
                        <span className="ml-1 text-xs">
                          ({Math.round(userData.skillLevels[skill] * 100)}%)
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Your Badges:</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.badges.map((badge, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {badge.icon === 'trophy' ? (
                        <Star className="w-4 h-4" />
                      ) : (
                        <Code2 className="w-4 h-4" />
                      )}
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md p-2"
              >
                <option value="all">All Categories</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Full Stack">Full Stack</option>
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border rounded-md p-2"
              >
                <option value="all">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Match Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Excellent Match (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Good Match (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Partial Match (60%)</span>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className={`hover:shadow-lg transition-shadow ${
                job.matchPercentage >= 80 ? 'border-l-4 border-l-green-500 border-t border-r border-b border-green-200' :
                job.matchPercentage >= 60 ? 'border-l-4 border-l-yellow-500 border-t border-r border-b border-yellow-200' :
                'border-l-4 border-l-red-500 border-t border-r border-b border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getMatchColor(job.matchPercentage)}`}
                      >
                        <Percent className="w-3 h-3" />
                        {job.matchPercentage}% - {getMatchLabel(job.matchPercentage)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{job.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant={userData.skills.some(userSkill => 
                                userSkill.toLowerCase() === skill.toLowerCase()
                              ) ? "default" : "outline"}
                              className="flex items-center gap-1"
                            >
                              {skill}
                              {userData.skills.some(userSkill => 
                                userSkill.toLowerCase() === skill.toLowerCase()
                              ) && (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>Posted {job.postedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{job.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Code2 className="w-4 h-4" />
                          <span>{job.locationType}</span>
                        </div>
                      </div>
                    </div>

                    {userData && renderMatchDetails(job)}
                  </div>

                  <div className="ml-6 space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          disabled={appliedJobs.has(job.id)}
                        >
                          {appliedJobs.has(job.id) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Applied
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Apply Now
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to {job.title}</DialogTitle>
                          <DialogDescription>
                            Submit your application for {job.company}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Cover Letter
                            </label>
                            <Textarea
                              placeholder="Write your cover letter..."
                              value={applicationData.coverLetter}
                              onChange={(e) => setApplicationData(prev => ({
                                ...prev,
                                coverLetter: e.target.value
                              }))}
                              rows={6}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Resume
                            </label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setApplicationData(prev => ({
                                ...prev,
                                resume: e.target.files[0]
                              }))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleApplyJob(job.id)}
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit Application"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSaveJob(job.id)}
                    >
                      {savedJobs.has(job.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-4 h-4 mr-2" />
                          Save Job
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredJobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No jobs found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoardPage; 