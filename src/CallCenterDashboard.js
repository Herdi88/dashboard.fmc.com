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
  const { logout, currentUser } = useAuth();

  const [resources, setResources] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch doctor list
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

  // Filter doctors by specialty
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

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const snapshot = await getDocs(collection(db, "appointments"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

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
      bookedBy: currentUser?.displayName || currentUser?.email || "Unknown",
    };

    if (editId) {
      await updateDoc(doc(db, "appointments", editId), data);
      setEditId(null);
    } else {
      await addDoc(collection(db, "appointments"), data);
    }

    setPatientName("");
    setPhoneNumber("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedHour("");
    setSelectedMinute("");

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
        {/* Hour Dropdown: 08 to 19 */}
        <select
          value={selectedHour}
          onChange={(e) => setSelectedHour(e.target.value)}
        >
          <option value="">Hour</option>
          {[...Array(12)].map((_, i) => {
            const hour = (i + 8).toString().padStart(2, "0");
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            );
          })}
        </select>
        {/* Minute Dropdown: 00, 15, 30, 45 */}
        <select
          value={selectedMinute}
          onChange={(e) => setSelectedMinute(e.target.value)}
        >
          <option value="">Minute</option>
          {["00", "15", "30", "45"].map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
        <button onClick={handleBook}>Book</button>
      </div>

      <h4>📋 Appointments</h4>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Booked By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td>{appt.patientName}</td>
              <td>{appt.phoneNumber}</td>
              <td>{appt.doctor}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>{appt.bookedBy}</td>
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
