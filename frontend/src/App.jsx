import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CourseCatalogPage from "./pages/CourseCatalogPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/course-catalog" element={<CourseCatalogPage />} />
        <Route path="/coursecatalog" element={<CourseCatalogPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
