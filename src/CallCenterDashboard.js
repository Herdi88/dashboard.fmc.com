import React, { useState, useEffect } from "react";
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function CallCenterDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");
  const [editId, setEditId] = useState(null);

  // Load doctors and appointments
  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDocs(collection(db, "doctors"));
      setDoctors(docSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      await loadAppointments();
    };
    fetchData();
  }, []);

  const loadAppointments = async () => {
    const snapshot = await getDocs(collection(db, "appointments"));
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAppointments(docs);
  };

  const resetForm = () => {
    setPatientName("");
    setPhoneNumber("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedHour("");
    setSelectedMinute("");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !patientName ||
      !phoneNumber ||
      !selectedDoctor ||
      !selectedDate ||
      !selectedHour ||
      !selectedMinute
    ) {
      setStatus("Please fill all required fields.");
      return;
    }

    const fullTime = `${selectedHour}:${selectedMinute}`;

    try {
      if (editId) {
        const ref = doc(db, "appointments", editId);
        await updateDoc(ref, {
          patientName,
          phoneNumber,
          doctor: selectedDoctor,
          date: selectedDate,
          time: fullTime,
        });
        setStatus("Appointment updated.");
      } else {
        await addDoc(collection(db, "appointments"), {
          patientName,
          phoneNumber,
          doctor: selectedDoctor,
          date: selectedDate,
          time: fullTime,
        });
        setStatus("Appointment created.");
      }

      resetForm();
      await loadAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setStatus("Error occurred.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await deleteDoc(doc(db, "appointments", id));
      await loadAppointments();
      setStatus("Appointment deleted.");
    }
  };

  const handleEdit = (appt) => {
    setPatientName(appt.patientName);
    setPhoneNumber(appt.phoneNumber);
    setSelectedDoctor(appt.doctor);
    setSelectedDate(appt.date);
    const [hour, minute] = appt.time.split(":");
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setEditId(appt.id);
    setStatus("Editing appointment...");
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((appt) => {
    const dateMatch = searchDate ? appt.date === searchDate : true;
    const doctorMatch = searchDoctor ? appt.doctor === searchDoctor : true;
    return dateMatch && doctorMatch;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>📞 Call Center Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.name}>
              {doc.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div>
          <label>Time: </label>
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value)}
          >
            <option value="">Hour</option>
            {[...Array(24).keys()].map((h) => (
              <option key={h} value={String(h).padStart(2, "0")}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            value={selectedMinute}
            onChange={(e) => setSelectedMinute(e.target.value)}
          >
            <option value="">Minute</option>
            {["00", "15", "30", "45"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{editId ? "Update" : "Book"}</button>
        {editId && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <p>{status}</p>

      <h3>🔍 Filter Appointments</h3>
      <input
        type="date"
        value={searchDate}
        onChange={(e) => setSearchDate(e.target.value)}
      />
      <select
        value={searchDoctor}
        onChange={(e) => setSearchDoctor(e.target.value)}
      >
        <option value="">All Doctors</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.name}>
            {doc.name}
          </option>
        ))}
      </select>

      <h3>📋 Appointments</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map((appt) => (
            <tr
              key={appt.id}
              style={{
                backgroundColor: appt.date === today ? "#e6f7ff" : "white",
              }}
            >
              <td>{appt.patientName}</td>
              <td>{appt.phoneNumber}</td>
              <td>{appt.doctor}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>
                <button onClick={() => handleEdit(appt)}>Edit</button>{" "}
                <button onClick={() => handleDelete(appt.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
