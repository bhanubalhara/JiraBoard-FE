import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import { AuthContext } from "./auth";

const App: React.FC = () => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  const isAuthed = !!token;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App; 