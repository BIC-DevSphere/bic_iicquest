import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";
import CourseCatalogPage from "./pages/CourseCatalogPage";
import MainLayout from "./Layouts/MainLayout";
import CourseLessonsListPage from "./pages/CourseLessonsListPage";
import ChapterContents from "./pages/ChapterContents";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index path="/home" element={<HomePage />} />
          <Route path="/learn/courses" element={<CourseCatalogPage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/course-lessons/:courseId" element={<CourseLessonsListPage/>}/>
          <Route path="/course/content/level/:courseId" element={<ChapterContents/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
