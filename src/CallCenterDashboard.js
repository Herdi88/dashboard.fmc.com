import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function CallCenterDashboard() {
  const { logout } = useAuth();

  const [resources, setResources] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [editId, setEditId] = useState(null);

  const [filterDate, setFilterDate] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");

  // Load doctors and specialties
  useEffect(() => {
    const fetchDoctors = async () => {
      const snapshot = await getDocs(collection(db, "resources"));
      const doctors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(doctors);

      const uniqueSpecialties = [
        ...new Set(doctors.map((doc) => doc.specialty)),
      ].sort();
      setSpecialties(uniqueSpecialties);
    };
    fetchDoctors();
  }, []);

  // Filter doctor list when specialty is selected
  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = resources.filter(
        (doc) => doc.specialty === selectedSpecialty
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty, resources]);

  // Load all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const snapshot = await getDocs(collection(db, "appointments"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
      setFilteredAppointments(data);
    };
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    let filtered = [...appointments];

    if (filterDate) {
      filtered = filtered.filter((appt) => appt.date === filterDate);
    }

    if (filterDoctor) {
      filtered = filtered.filter((appt) => appt.doctor === filterDoctor);
    }

    setFilteredAppointments(filtered);
  }, [filterDate, filterDoctor, appointments]);

  const handleBook = async () => {
    if (
      !patientName ||
      !phoneNumber ||
      !selectedDoctor ||
      !selectedDate ||
      !selectedHour ||
      !selectedMinute
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const time = `${selectedHour}:${selectedMinute}`;
    const data = {
      patientName,
      phoneNumber,
      doctor: selectedDoctor,
      date: selectedDate,
      time,
    };

    if (editId) {
      await updateDoc(doc(db, "appointments", editId), data);
      setEditId(null);
    } else {
      await addDoc(collection(db, "appointments"), data);
    }

    // Clear form
    setPatientName("");
    setPhoneNumber("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedHour("");
    setSelectedMinute("");

    // Refresh appointments
    const snapshot = await getDocs(collection(db, "appointments"));
    const dataList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAppointments(dataList);
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
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "appointments", id));
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  return (
    <div className="dashboard">
      <button onClick={logout} style={{ float: "right", margin: 10 }}>
        Logout
      </button>
      <h2>📞 Call Center Dashboard</h2>

      <div>
        <input
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          <option value="">Select Specialty</option>
          {specialties.map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {filteredDoctors.map((doc) => (
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
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(e.target.value)}
        >
          <option value="">Hour</option>
          {[...Array(24)].map((_, i) => (
            <option key={i} value={String(i).padStart(2, "0")}>
              {String(i).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          value={selectedMinute}
          onChange={(e) => setSelectedMinute(e.target.value)}
        >
          <option value="">Minute</option>
          {[...Array(60)].map((_, i) => (
            <option key={i} value={String(i).padStart(2, "0")}>
              {String(i).padStart(2, "0")}
            </option>
          ))}
        </select>
        <button onClick={handleBook}>Book</button>
      </div>

      {/* Search Filters */}
      <h4>🔎 Filter Appointments</h4>
      <div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          value={filterDoctor}
          onChange={(e) => setFilterDoctor(e.target.value)}
        >
          <option value="">All Doctors</option>
          {[...new Set(appointments.map((a) => a.doctor))].map((doc) => (
            <option key={doc} value={doc}>
              {doc}
            </option>
          ))}
        </select>
      </div>

      {/* Appointment List */}
      <h4>📋 Appointments</h4>
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
            <tr key={appt.id}>
              <td>{appt.patientName}</td>
              <td>{appt.phoneNumber}</td>
              <td>{appt.doctor}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>
                <button onClick={() => handleEdit(appt)}>Edit</button>
                <button onClick={() => handleDelete(appt.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
