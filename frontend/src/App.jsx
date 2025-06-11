import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";
import CourseCatalogPage from "./pages/CourseCatalogPage";
import MainLayout from "./Layouts/MainLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index path="/home" element={<HomePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/learn/courses" element={<CourseCatalogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
