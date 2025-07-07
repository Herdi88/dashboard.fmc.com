// src/components/ExcelComparison.js
import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelComparison = ({ appointments, currentUser }) => {
  const [excelData, setExcelData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Clean and filter based on user name if provided
      const filtered = currentUser?.displayName
        ? json.filter(
            (item) =>
              (item["Booked User"] || "").toLowerCase() ===
              currentUser.displayName.toLowerCase()
          )
        : json;

      setExcelData(filtered);
    };
    reader.readAsArrayBuffer(file);
  };

  const checkMatch = (excelEntry) => {
    return appointments.some((appt) => {
      const namesMatch =
        appt.patient?.toLowerCase().trim() ===
        (excelEntry["Patient Name"] || "").toLowerCase().trim();
      const dateMatch =
        appt.date === (excelEntry["Appointment Date"] || "").substring(0, 10); // date only
      return namesMatch && dateMatch;
    });
  };

  return (
    <div>
      <h4>📃 Excel Appointment Comparison</h4>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />

      {excelData.length > 0 && (
        <div>
          <h5>📅 Appointments & Excel Comparison</h5>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {excelData.map((entry, index) => {
                const match = checkMatch(entry);
                return (
                  <tr
                    key={index}
                    style={{ backgroundColor: match ? "#e8fff0" : "#ffeaea" }}
                  >
                    <td>{entry["Patient Name"] || "-"}</td>
                    <td>{entry["Contact Number"] || "-"}</td>
                    <td>{entry["Resource"] || "-"}</td>
                    <td>{entry["Appointment Date"] || "-"}</td>
                    <td>{entry["Start Time"] || "-"}</td>
                    <td>{entry["Booked User"] || "-"}</td>
                    <td style={{ color: match ? "green" : "red" }}>
                      {match ? "✔ Found" : "❌ Not Found"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelComparison;
