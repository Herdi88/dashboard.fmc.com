import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import "./StaffProfileDetails.css";

const criteriaList = [
  "Greeting",
  "Tone of Voice",
  "Empathy",
  "Listening",
  "Accuracy",
  "Policy Adherence",
  "Clarity",
  "Confidence",
  "Closing the Call",
  "Language Use",
  "Handling Difficult Situations",
];

const StaffProfileDetails = ({ staff }) => {
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [average, setAverage] = useState(null);

  useEffect(() => {
    fetchEvaluationHistory();
  }, []);

  const fetchEvaluationHistory = async () => {
    const q = query(
      collection(db, "voiceEvaluations"),
      where("staffId", "==", staff.id),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    const evals = snapshot.docs.map((doc) => doc.data());
    setEvaluations(evals);

    if (evals.length > 0) {
      const avgTotal = evals
        .map((e) => e.score)
        .filter((s) => typeof s === "number");
      const avgScore = avgTotal.reduce((a, b) => a + b, 0) / avgTotal.length;
      setAverage(avgScore.toFixed(2));
    }
  };

  const handleScoreChange = (key, value) => {
    setScores({ ...scores, [key]: value });
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an audio file.");
    setUploading(true);

    try {
      const storageRef = ref(storage, `voiceCalls/${staff.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAudioURL(url);

      const numericScores = Object.values(scores)
        .filter((val) => val !== "" && !isNaN(val))
        .map(Number);
      const averageScore =
        numericScores.length > 0
          ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length
          : null;

      await addDoc(collection(db, "voiceEvaluations"), {
        staffId: staff.id,
        staffName: staff.name,
        audioUrl: url,
        score: averageScore,
        breakdown: scores,
        notes,
        timestamp: new Date(),
      });

      setFile(null);
      setScores({});
      setNotes("");
      fetchEvaluationHistory(); // Refresh table
    } catch (error) {
      alert("Upload failed: " + error.message);
    }

    setUploading(false);
  };

  return (
    <div className="staff-profile-page">
      {/* Header */}
      <div className="staff-header">
        <img
          src={staff.imageUrl || "https://via.placeholder.com/100"}
          alt={staff.name}
        />
        <div>
          <h2>{staff.name}</h2>
          <p>ID: {staff.id}</p>
          {average && <p>⭐ Average Score: {average}</p>}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-section">
        <h3>📊 Performance Metrics</h3>
        <ul>
          <li>🟢 Policy Adherence Score: 92%</li>
          <li>🟢 Appointment Accuracy: 95%</li>
          <li>🟢 Time Attendance: On-Time (22/23 days)</li>
          {/* Later: Pull from Firestore or Excel mismatch data */}
        </ul>
      </div>

      {/* Evaluation History */}
      <div className="history-section">
        <h3>📁 Voice Evaluation History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Audio</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e, index) => (
              <tr key={index}>
                <td>{new Date(e.timestamp.seconds * 1000).toLocaleString()}</td>
                <td>{e.score ? e.score.toFixed(2) : "N/A"}</td>
                <td>
                  <audio controls src={e.audioUrl}></audio>
                </td>
                <td>{e.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Evaluation Form */}
      <div className="evaluation-form">
        <h3>➕ Add New Voice Evaluation</h3>

        <div className="upload-box">
          <label>Upload Voice File:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="score-grid">
          {criteriaList.map((c) => (
            <div key={c} className="score-item">
              <label>{c}</label>
              <select
                value={scores[c] || ""}
                onChange={(e) => handleScoreChange(c, e.target.value)}
              >
                <option value="">N/A</option>
                {[1, 2, 3, 4, 5].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="notes-box">
          <label>Notes:</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Submit Evaluation"}
        </button>
      </div>
    </div>
  );
};

export default StaffProfileDetails;
