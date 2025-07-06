// src/App.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import CallCenterDashboard from "./CallCenterDashboard";
import Login from "./Login";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import "./styles.css";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const [activeSection, setActiveSection] = useState("appointments");

  const renderContent = () => {
    switch (activeSection) {
      case "appointments":
        return <CallCenterDashboard />;
      case "dashboard":
        return (
          <div className="content-box">
            Welcome to the FMC Dashboard Overview!
          </div>
        );
      case "doctors":
        return (
          <div className="content-box">Doctor list and schedules go here.</div>
        );
      case "voice":
        return <div className="content-box">Voice inbox coming soon.</div>;
      case "analytics":
        return (
          <div className="content-box">
            Analytics reports and charts go here.
          </div>
        );
      case "settings":
        return <div className="content-box">Settings and admin tools.</div>;
      default:
        return <CallCenterDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar onSelect={setActiveSection} />
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
