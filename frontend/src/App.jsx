import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";
import CourseCatalogPage from "./pages/CourseCatalogPage";
import CommunityPage from "./pages/CommunityPage";
import MainLayout from "./Layouts/MainLayout";
import CourseLessonsListPage from "./pages/CourseLessonsListPage";
import ChapterContents from "./pages/ChapterContents";
import LevelContentPage from "./pages/LevelContentPage";
import LevelTestPage from "./pages/LevelTestPage";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import PairProjectsPage from "./pages/PairProjectsPage";
import ProjectCollaborationPage from "./pages/ProjectCollaborationPage";
import JobBoardPage from "./pages/JobBoardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage/>}/>
        <Route path="/auth/signup" element={<SignupPage/>}/>
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="learn/courses" element={<CourseCatalogPage />} />
          <Route path="pair-projects" element={<PairProjectsPage />} />
          <Route path="projects/:projectId/collaboration" element={<ProjectCollaborationPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="jobs" element={<JobBoardPage/>}/>
          <Route path="profile" element={<ProfilePage/>}/>
          {/* Course Learning Routes */}
          <Route path="course/:courseId" element={<CoursePage />} />
          <Route path="course/:courseId/overview" element={<CourseOverviewPage />} />
          <Route path="course/:courseId/chapters" element={<CourseLessonsListPage />} />
          <Route path="course/:courseId/chapter/:chapterId" element={<ChapterContents />} />
          <Route path="course/:courseId/chapter/:chapterId/level/:levelId" element={<LevelContentPage />} />
          <Route path="course/:courseId/chapter/:chapterId/level/:levelId/test" element={<LevelTestPage />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px) saturate(180%)',
            color: 'oklch(0.15 0.008 230)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(16, 185, 129, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2), 0 6px 12px rgba(16, 185, 129, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(16, 185, 129, 0.95)',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2), 0 6px 12px rgba(239, 68, 68, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(239, 68, 68, 0.95)',
            },
          },
          loading: {
            style: {
              background: 'rgba(99, 102, 241, 0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2), 0 6px 12px rgba(99, 102, 241, 0.1)',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgba(99, 102, 241, 0.95)',
            },
          },
        }}
      />
    </BrowserRouter>
  );
};

export default App;
