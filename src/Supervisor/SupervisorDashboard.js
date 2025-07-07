// ✅ Fully Updated SupervisorDashboard.js with Evaluation, Excel Display, PowerBI, and Voice Upload Features
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import * as XLSX from "xlsx";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import "./SupervisorDashboard.css";

const SupervisorDashboard = () => {
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [mismatches, setMismatches] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [docFile, setDocFile] = useState(null);
  const [leaveDates, setLeaveDates] = useState([]);
  const [policyScore, setPolicyScore] = useState("");
  const [callScore, setCallScore] = useState("");
  const [attendanceScore, setAttendanceScore] = useState("");
  const [supervisorNote, setSupervisorNote] = useState("");

  const [voiceFile, setVoiceFile] = useState(null);
  const [evaluationNotes, setEvaluationNotes] = useState("");
  const [uploadedVoices, setUploadedVoices] = useState([]);
  const [uploadedExcels, setUploadedExcels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const apSnap = await getDocs(collection(db, "appointments"));
      setAppointments(apSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFilteredAppointments(apSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const profSnap = await getDocs(collection(db, "users"));
      setStaffProfiles(profSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const excelList = await listAll(ref(storage, "excelUploads"));
      const excelUrls = await Promise.all(excelList.items.map(item => getDownloadURL(item)));
      setUploadedExcels(excelUrls);
    };
    fetchData();
  }, []);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);
      setExcelData(parsed);
      compareWithAppointments(parsed);
    };
    reader.readAsArrayBuffer(file);

    const storageRef = ref(storage, `excelUploads/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setUploadedExcels(prev => [...prev, url]);
  };

  const compareWithAppointments = (rows) => {
    const mismatched = rows.filter(row => {
      return !appointments.find(app =>
        app.patient?.toLowerCase() === row.Patient?.toLowerCase() &&
        app.phone === row.Phone &&
        app.date === row.Date &&
        app.time === row.Time &&
        app.bookedBy?.toLowerCase() === row["Booked By"]?.toLowerCase()
      );
    });
    setMismatches(mismatched);
  };

  const uploadDocument = async () => {
    if (!selectedProfile || !docFile) return;
    const refDoc = ref(storage, `documents/${selectedProfile.id}/${docFile.name}`);
    await uploadBytes(refDoc, docFile);
    const url = await getDownloadURL(refDoc);
    alert("Uploaded: " + url);
  };

  const saveManualScores = async () => {
    if (!selectedProfile) return;
    await updateDoc(doc(db, "users", selectedProfile.id), {
      policyScore,
      callScore,
      attendanceScore,
      supervisorNote,
      leaveDates,
    });
    alert("Saved scores and notes.");
  };

  const handleVoiceUpload = async () => {
    if (!selectedProfile || !voiceFile) return;
    const voiceRef = ref(storage, `voiceEvaluations/${selectedProfile.id}/${voiceFile.name}`);
    await uploadBytes(voiceRef, voiceFile);
    const url = await getDownloadURL(voiceRef);
    await addDoc(collection(db, "voiceEvaluations"), {
      staffId: selectedProfile.id,
      url,
      evaluationNotes,
      policyScore,
      callScore,
      attendanceScore,
      timestamp: serverTimestamp(),
    });
    setUploadedVoices(prev => [...prev, { url, fileName: voiceFile.name }]);
    alert("Voice uploaded.");
    setVoiceFile(null);
    setEvaluationNotes("");
  };

  return (
    <div className="supervisor-dashboard">
      <h2>🧑‍💼 Supervisor Dashboard</h2>
      <div className="tab-buttons">
        <button onClick={() => setTab("appointments")}>📋 Appointments</button>
        <button onClick={() => setTab("compare")}>📂 Compare Excel</button>
        <button onClick={() => setTab("profiles")}>👤 Staff Profiles</button>
        <button onClick={() => setTab("evaluate")}>🎧 Voice Evaluation</button>
      </div>

      {tab === "appointments" && (
        <table className="appointments-table">
          <thead>
            <tr><th>Patient</th><th>Phone</th><th>Doctor</th><th>Date</th><th>Time</th><th>Booked By</th></tr>
          </thead>
          <tbody>
            {filteredAppointments.map((app, i) => (
              <tr key={i}>
                <td>{app.patient}</td><td>{app.phone}</td><td>{app.doctor}</td><td>{app.date}</td><td>{app.time}</td><td>{app.bookedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "compare" && (
        <>
          <h3>Upload & Compare Excel</h3>
          <input type="file" onChange={handleExcelUpload} /><br /><br />
          <h4>Total Rows: {excelData.length}</h4>
          <h4>❌ Mismatches: {mismatches.length}</h4>
          <table className="appointments-table">
            <thead>
              <tr><th>Patient</th><th>Phone</th><th>Doctor</th><th>Date</th><th>Time</th><th>Booked By</th></tr>
            </thead>
            <tbody>
              {mismatches.map((row, i) => (
                <tr key={i}>
                  <td>{row.Patient}</td><td>{row.Phone}</td><td>{row.Doctor}</td><td>{row.Date}</td><td>{row.Time}</td><td>{row["Booked By"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>Uploaded Excel Files</h4>
          <ul>
            {uploadedExcels.map((url, i) => (
              <li key={i}><a href={url} target="_blank" rel="noreferrer">View File {i + 1}</a></li>
            ))}
          </ul>
        </>
      )}

      {tab === "profiles" && (
        <>
          <ul>
            {staffProfiles.map((staff) => (
              <li key={staff.id} onClick={() => setSelectedProfile(staff)} style={{ cursor: "pointer" }}>
                {staff.displayName || staff.email}
              </li>
            ))}
          </ul>

          {selectedProfile && (
            <div>
              <h4>Profile: {selectedProfile.displayName || selectedProfile.email}</h4>
              <label>Upload Staff Document:</label>
              <input type="file" onChange={(e) => setDocFile(e.target.files[0])} />
              <button onClick={uploadDocument}>Upload File</button>
              <br /><br />
              <label>Leave Dates (comma separated):</label>
              <input value={leaveDates} onChange={(e) => setLeaveDates(e.target.value.split(","))} /><br />
              <label>Policy Score:</label>
              <input value={policyScore} onChange={(e) => setPolicyScore(e.target.value)} /><br />
              <label>Call Score:</label>
              <input value={callScore} onChange={(e) => setCallScore(e.target.value)} /><br />
              <label>Attendance Score:</label>
              <input value={attendanceScore} onChange={(e) => setAttendanceScore(e.target.value)} /><br />
              <label>Supervisor Notes:</label>
              <textarea rows={3} value={supervisorNote} onChange={(e) => setSupervisorNote(e.target.value)} /><br />
              <button onClick={saveManualScores}>Save Scores</button>
            </div>
          )}
        </>
      )}

      {tab === "evaluate" && (
        <>
          <h3>Upload Voice File & Evaluate</h3>
          {selectedProfile ? (
            <>
              <input type="file" accept="audio/*" onChange={(e) => setVoiceFile(e.target.files[0])} /><br />
              <textarea placeholder="Evaluation Notes" value={evaluationNotes} onChange={(e) => setEvaluationNotes(e.target.value)} rows={3} cols={40} /><br />
              <button onClick={handleVoiceUpload}>Upload & Score</button><br /><br />
              <h4>Uploaded Voices:</h4>
              <ul>
                {uploadedVoices.map((v, i) => (
                  <li key={i}><audio controls src={v.url}></audio> - {v.fileName}</li>
                ))}
              </ul>
            </>
          ) : <p>Select a staff profile from "Profiles" tab first.</p>}

          <div style={{ marginTop: 40 }}>
            <h3>📊 Power BI Integration</h3>
            <iframe
              title="Power BI"
              width="100%"
              height="600"
              src="https://app.powerbi.com/view?r=YOUR_EMBED_LINK"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </>
      )}
    </div>
  );
};

export default SupervisorDashboard;