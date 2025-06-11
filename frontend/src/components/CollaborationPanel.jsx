import React from "react";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, UserPlus } from "lucide-react";

const CollaborationPanel = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0 h-fit">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Connect with Other Learners
        </h2>
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">
        Join a study group or find a partner to collaborate on projects! Learn
        together and build amazing things.
      </p>

      <div className="space-y-3">
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <UserPlus className="w-4 h-4 mr-2" />
          Find a Study Partner
        </Button>

        <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
          <MessageSquare className="w-4 h-4 mr-2" />
          Create a Study Group
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2">
          Active Study Groups
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>React Beginners</span>
            <span className="text-blue-600 font-medium">12 members</span>
          </div>
          <div className="flex justify-between">
            <span>MERN Stack Project</span>
            <span className="text-green-600 font-medium">8 members</span>
          </div>
          <div className="flex justify-between">
            <span>Python Study Circle</span>
            <span className="text-purple-600 font-medium">15 members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
