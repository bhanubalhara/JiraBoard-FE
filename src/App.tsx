import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  const isAuthed = !!localStorage.getItem("token");
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App; 