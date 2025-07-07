// src/Supervisor/StaffProfiles.js
import React, { useState } from "react";
import "./StaffProfiles.css";
import StaffProfileDetails from "./StaffProfileDetails";

const mockStaff = [
  {
    id: "1926",
    name: "Mohammed Adnan Neamaht",
    imageUrl: "/images/staff/adnan.jpg",
  },
  {
    id: "1988",
    name: "Midya Ismael Mohammed",
    imageUrl: "/images/staff/midya.jpg",
  },
  {
    id: "2016",
    name: "Neamat Ghadhban Rahman",
    imageUrl: "/images/staff/neamat.jpg",
  },
  {
    id: "2068",
    name: "Zahraa Shamsaldeen Abdullah",
    imageUrl: "/images/staff/zahraa.jpg",
  },
  // Add more staff here
];

const StaffProfiles = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleOpenProfile = (staff) => {
    setSelectedStaff(staff);
  };

  const handleBack = () => {
    setSelectedStaff(null);
  };

  return (
    <div className="staff-profiles-container">
      <h3>👥 Staff Profiles</h3>

      {!selectedStaff ? (
        <div className="staff-grid">
          {mockStaff.map((staff) => (
            <div key={staff.id} className="staff-card">
              <img src={staff.imageUrl} alt={staff.name} />
              <h4>{staff.name}</h4>
              <p>ID #{staff.id}</p>
              <button onClick={() => handleOpenProfile(staff)}>
                Full Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <button onClick={handleBack} className="back-button">⬅ Back to List</button>
          <StaffProfileDetails staff={selectedStaff} />
        </>
      )}
    </div>
  );
};

export default StaffProfiles;
