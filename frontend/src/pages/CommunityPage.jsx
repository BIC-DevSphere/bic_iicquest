import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Users,
  Search,
  Plus,
  Eye,
  Calendar,
  User,
  Image as ImageIcon,
  Send,
  Filter,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  Hash,
  Loader2
} from "lucide-react";
import { getCommunityPosts, createCommunityPost, commentOnPost } from "@/services/communityService";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Loading states
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [commentingOnPost, setCommentingOnPost] = useState({});
  
  // New post form state
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    image: null
  });
  
  // Comment states
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch community posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setIsCreatingPost(true);
      await createCommunityPost(newPost);
      setNewPost({ title: "", body: "", image: null });
      setShowCreatePost(false);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleComment = async (postId) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    try {
      setCommentingOnPost({ ...commentingOnPost, [postId]: true });
      const response = await commentOnPost(postId, { body: commentText });
      setCommentTexts({ ...commentTexts, [postId]: "" });
      
      // Update the specific post in the state instead of refetching all
      if (response.post) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? response.post : post
          )
        );
      } else {
        // Fallback to refetching all posts
        fetchPosts();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentingOnPost({ ...commentingOnPost, [postId]: false });
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get comment count
  const getCommentCount = (post) => {
    return post.totalComments || post.comments?.length || 0;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-10 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-red-600 text-center">Error: {error}</p>
          <Button onClick={fetchPosts} className="mt-4 w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Community
              </h1>
              <p className="text-gray-600 mt-2">
                Ask questions, share knowledge, and collaborate with fellow learners
              </p>
            </div>
            <Button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={isCreatingPost}
            >
              <Plus className="w-4 h-4" />
              Ask Question
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "newest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("newest")}
                  className="flex items-center gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Newest
                </Button>
                <Button
                  variant={sortBy === "popular" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("popular")}
                  className="flex items-center gap-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Post Form */}
        {showCreatePost && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Ask a Question</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    placeholder="What's your programming question? Be specific."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                    disabled={isCreatingPost}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Provide details about your question. Include any error messages, code snippets, or what you've tried so far..."
                    value={newPost.body}
                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    rows={6}
                    required
                    disabled={isCreatingPost}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })}
                      className="flex-1"
                      disabled={isCreatingPost}
                    />
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                    disabled={isCreatingPost}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreatingPost}
                    className="flex items-center gap-2"
                  >
                    {isCreatingPost ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Question"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{posts.length}</p>
              <p className="text-sm text-gray-600">Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{new Set(posts.map(p => p.author?._id)).size}</p>
              <p className="text-sm text-gray-600">Contributors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ThumbsUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{posts.reduce((acc, p) => acc + (p.likes || 0), 0)}</p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{posts.reduce((acc, p) => acc + getCommentCount(p), 0)}</p>
              <p className="text-sm text-gray-600">Total Answers</p>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-4">Be the first to ask a question in our community!</p>
              <Button onClick={() => setShowCreatePost(true)}>
                Ask the First Question
              </Button>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                      <Button variant="ghost" size="sm" className="p-1">
                        <ArrowUp className="w-5 h-5" />
                      </Button>
                      <span className="text-lg font-semibold">{post.likes || 0}</span>
                      <Button variant="ghost" size="sm" className="p-1">
                        <ArrowDown className="w-5 h-5" />
                      </Button>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">{getCommentCount(post)}</div>
                        <div className="text-xs text-gray-400">answers</div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.createdAt)}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {post.body}
                      </p>

                      {post.image && (
                        <div className="mb-4">
                          <img
                            src={post.image}
                            alt="Post attachment"
                            className="max-w-md rounded-lg border"
                          />
                        </div>
                      )}

                      {/* Post Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {showComments[post._id] ? 'Hide' : 'Show'} Answers ({getCommentCount(post)})
                          </Button>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{post.likes || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{post.author?.name || post.author?.fullName || post.author?.username || 'Anonymous'}</span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {showComments[post._id] && (
                        <div className="mt-6 border-t pt-4">
                          {/* Comment Form */}
                          <div className="flex gap-3 mb-4">
                            <Input
                              placeholder="Write your answer..."
                              value={commentTexts[post._id] || ""}
                              onChange={(e) => setCommentTexts({
                                ...commentTexts,
                                [post._id]: e.target.value
                              })}
                              className="flex-1"
                              disabled={commentingOnPost[post._id]}
                            />
                            <Button
                              onClick={() => handleComment(post._id)}
                              size="sm"
                              disabled={!commentTexts[post._id]?.trim() || commentingOnPost[post._id]}
                              className="flex items-center gap-2"
                            >
                              {commentingOnPost[post._id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-3">
                            {post.comments?.map((comment, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                      {comment.author?.name || comment.author?.fullName || comment.author?.username || 'Anonymous'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comment.body}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 