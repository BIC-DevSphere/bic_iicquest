import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown } from "lucide-react";

const categories = [
  "All Categories",
  "Frontend Development",
  "Backend Development",
  "Full Stack",
  "Mobile Development",
  "Data Science",
  "DevOps",
];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const durations = [
  "Any Duration",
  "0-2 weeks",
  "2-4 weeks",
  "1-3 months",
  "3+ months",
];

const filterTags = [
  "All",
  "Free",
  "Collaborative",
  "Project-Based",
  "Trending",
];

const SearchFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState(levels[0]);
  const [duration, setDuration] = useState(durations[0]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow border-0">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search courses, technologies, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 text-base"
          />
        </div>
        <Button className="px-6 py-3 rounded-full font-semibold">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Category:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full flex items-center gap-2 min-w-[150px] justify-between"
              >
                {category}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => setCategory(cat)}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Level:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full flex items-center gap-2 min-w-[120px] justify-between"
              >
                {level}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {levels.map((lvl) => (
                <DropdownMenuItem key={lvl} onClick={() => setLevel(lvl)}>
                  {lvl}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Duration:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 rounded-full flex items-center gap-2 min-w-[120px] justify-between"
              >
                {duration}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {durations.map((dur) => (
                <DropdownMenuItem key={dur} onClick={() => setDuration(dur)}>
                  {dur}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 flex-wrap ml-auto">
          {filterTags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className={`px-3 py-1 rounded-full text-sm font-medium ${activeTag === tag ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
