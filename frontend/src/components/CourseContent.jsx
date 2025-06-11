import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CourseContent = ({ chapters }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  return (
    <div className="space-y-6">
      {chapters.map((chapter) => (
        <Card key={chapter._id} className="overflow-hidden">
          {/* Chapter Header */}
          <div 
            className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => toggleChapter(chapter._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{chapter.order}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3>
                  <p className="text-sm text-gray-600">{chapter.description}</p>
                </div>
              </div>
              {expandedChapters[chapter._id] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {/* Prerequisites */}
            {chapter.prerequisites && chapter.prerequisites.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Prerequisites:</span>
                <div className="flex gap-2">
                  {chapter.prerequisites.map((prereq, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chapter Content */}
          {expandedChapters[chapter._id] && (
            <div className="border-t">
              {chapter.levels.map((level) => (
                <div key={level._id} className="border-b last:border-b-0">
                  {/* Level Header */}
                  <div 
                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => toggleLevel(level._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">{level.order}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{level.title}</h4>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{level.estimatedTime} min</span>
                        </div>
                        {expandedLevels[level._id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Level Content */}
                  {expandedLevels[level._id] && (
                    <div className="p-4 bg-white">
                      {level.content.map((content) => (
                        <div key={content._id} className="mb-6 last:mb-0">
                          <h5 className="text-lg font-semibold text-gray-800 mb-3">
                            {content.title}
                          </h5>
                          
                          {/* Content Text */}
                          <div className="prose prose-sm max-w-none mb-4">
                            <p className="text-gray-600">{content.content.text}</p>
                          </div>

                          {/* Media */}
                          {content.content.media && (
                            <div className="mb-4">
                              <img 
                                src={content.content.media} 
                                alt={content.title}
                                className="rounded-lg shadow-sm max-w-full h-auto"
                              />
                            </div>
                          )}

                          {/* Examples */}
                          {content.content.examples && content.content.examples.length > 0 && (
                            <div className="mb-4">
                              <h6 className="text-sm font-semibold text-gray-700 mb-2">Examples:</h6>
                              <div className="bg-gray-50 rounded-lg p-4">
                                {content.content.examples.map((example, index) => (
                                  <pre key={index} className="text-sm text-gray-800 mb-2 last:mb-0">
                                    <code>{example}</code>
                                  </pre>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practice Section */}
                          {level.starterCode && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h6 className="text-sm font-semibold text-blue-800 mb-2">Practice Exercise</h6>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-blue-700 mb-1">Starter Code:</p>
                                  <pre className="bg-white p-3 rounded text-sm">
                                    <code>{level.starterCode}</code>
                                  </pre>
                                </div>
                                {level.hints && level.hints.length > 0 && (
                                  <div>
                                    <p className="text-sm text-blue-700 mb-1">Hints:</p>
                                    <ul className="list-disc list-inside text-sm text-blue-600">
                                      {level.hints.map((hint, index) => (
                                        <li key={index}>{hint}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CourseContent; 