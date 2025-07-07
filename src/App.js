import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import CallCenterDashboard from "./CallCenterDashboard";
import SupervisorDashboard from "./Supervisor/SupervisorDashboard";
import Login from "./Login";
import StaffProfileDetails from "./Supervisor/StaffProfileDetails";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import "./styles.css";

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  const [activeSection, setActiveSection] = useState("appointments");
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect supervisor to their dashboard if trying to access root
    if (userData?.role === "supervisor" && location.pathname === "/") {
      navigate("/supervisor");
    }
  }, [userData, location.pathname, navigate]);

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

          {/* Allow callcenter and staff roles for the default dashboard */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={["staff", "callcenter"]}>
                <AppRoutes />
              </ProtectedRoute>
            }
          />

          {/* Supervisor dashboard */}
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute allowedRoles={["supervisor"]}>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/supervisor/profile/:id"
            element={
              <ProtectedRoute allowedRoles={["supervisor"]}>
                <StaffProfileDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
