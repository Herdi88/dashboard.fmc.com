import React from "react";
import "./styles.css";

const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">📊 FMC Dashboard</h2>
      <ul className="sidebar-menu">
        <li onClick={() => onSelect("dashboard")}>🏠 Dashboard</li>
        <li onClick={() => onSelect("appointments")}>📅 Appointments</li>
        <li onClick={() => onSelect("doctors")}>🩺 Doctors</li>
        <li onClick={() => onSelect("voice")}>🔊 Voice Inbox</li>
        <li onClick={() => onSelect("analytics")}>📈 Analytics</li>
        <li onClick={() => onSelect("settings")}>⚙️ Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
