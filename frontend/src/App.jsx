import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
