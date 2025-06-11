import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index path="/home" element={<HomePage />} />
          <Route path="/learn/courses" element={<CourseCatalogPage />} />
          <Route path="/community" element={<CommunityPage />} />
          
          {/* Course Learning Routes */}
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/course/:courseId/overview" element={<CourseOverviewPage />} />
          <Route path="/course/:courseId/chapters" element={<CourseLessonsListPage />} />
          <Route path="/course/:courseId/chapter/:chapterId" element={<ChapterContents />} />
          <Route path="/course/:courseId/chapter/:chapterId/level/:levelId" element={<LevelContentPage />} />
          <Route path="/course/:courseId/chapter/:chapterId/level/:levelId/test" element={<LevelTestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
