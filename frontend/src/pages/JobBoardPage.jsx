import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Code2
} from "lucide-react";

const JobBoardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Hardcoded user data
  const userData = {
    skills: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
    completedProjects: 3,
    experience: "2 years"
  };

  // Hardcoded job listings
  const dummyJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      description: "Looking for an experienced frontend developer to join our team...",
      requirements: ["React", "TypeScript", "Node.js", "5+ years experience"],
      postedDate: "2024-03-15",
      category: "Frontend",
      locationType: "On-site",
      skills: ["React", "TypeScript", "Node.js", "JavaScript"]
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "StartupX",
      location: "Remote",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      description: "Join our fast-growing startup as a full stack developer...",
      requirements: ["React", "Node.js", "MongoDB", "3+ years experience"],
      postedDate: "2024-03-14",
      category: "Full Stack",
      locationType: "Remote",
      skills: ["React", "Node.js", "MongoDB", "JavaScript"]
    },
    {
      id: 3,
      title: "Backend Developer",
      company: "Enterprise Solutions",
      location: "New York, NY",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      description: "Seeking a backend developer to work on our enterprise solutions...",
      requirements: ["Node.js", "MongoDB", "AWS", "4+ years experience"],
      postedDate: "2024-03-13",
      category: "Backend",
      locationType: "Hybrid",
      skills: ["Node.js", "MongoDB", "AWS", "JavaScript"]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Calculate match percentage for each job
      const jobsWithMatches = dummyJobs.map(job => ({
        ...job,
        matchPercentage: calculateSkillMatch(job.skills)
      }));
      setJobs(jobsWithMatches);
      setFilteredJobs(jobsWithMatches);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedCategory, selectedLocation]);

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter by location type
    if (selectedLocation !== "all") {
      filtered = filtered.filter(job => job.locationType === selectedLocation);
    }

    setFilteredJobs(filtered);
  };

  const calculateSkillMatch = (jobSkills) => {
    const matchingSkills = jobSkills.filter(skill => 
      userData.skills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (userData.completedProjects < 2) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Complete More Projects</h2>
            <p className="text-gray-600 mb-4">
              You need to complete at least 2 projects to view job listings.
              Current completed projects: {userData.completedProjects}
            </p>
            <Button onClick={() => window.location.href = "/projects"}>
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
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Your Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Button className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <Badge 
                        variant="outline" 
                        className={`${
                          job.matchPercentage >= 75 ? 'text-green-600' :
                          job.matchPercentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}
                      >
                        {job.matchPercentage}% Match
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
                  </div>

                  <div className="ml-6">
                    <Button className="w-full mb-2">Apply Now</Button>
                    <Button variant="outline" className="w-full">
                      Save Job
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