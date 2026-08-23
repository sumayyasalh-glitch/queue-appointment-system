import "./App.css";
import { useState, useRef,useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import Patient from "./pages/Patient";
import PatientHistory from "./pages/PatientHistory";
import QueuePage from "./pages/QueuePage";
import Notifications from "./components/Notifications";

function App() {
  const idCounterRef = useRef(0);

  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  
  const [users, setUsers] = useState(() => {
  const savedUsers = localStorage.getItem("users");

  return savedUsers
    ? JSON.parse(savedUsers)
    : [
        {
          username: "admin",
          password: "admin123",
          role: "Admin",
          fullName: "Admin",
        },
        {
          username: "doctor",
          password: "doctor123",
          role: "Doctor",
          fullName: "Dr. John",
        },
        {
          username: "patient",
          password: "patient123",
          role: "Patient",
          fullName: "Patient",
        },
      ];
});
useEffect(() => {
  localStorage.setItem("users", JSON.stringify(users));
}, [users]);
  const [appointments, setAppointments] = useState([
    {
      id: 101,
      patientName: "SHERIN",
      patientEmail: "sherin.patient@email.com",
      doctorName: "Dr. SURUMI",
      doctorEmail: "doctor.surumi@hospital.com",
      department: "General Medicine",
      date: "2026-05-20",
      time: "10:00",
      reason: "Fever and weakness",
      aiNote: "Urgent | Estimated 10-20 minutes | Keep previous reports ready and drink water unless advised otherwise.",
      status: "Waiting",
      token: "A001",
      emailSent: true,
    },
    {
      id: 102,
      patientName: "ANITA",
      patientEmail: "anita@email.com",
      doctorName: "Dr. SURUMI",
      doctorEmail: "doctor.surumi@hospital.com",
      department: "General Medicine",
      date: "2026-05-20",
      time: "10:30",
      reason: "Follow-up visit",
      aiNote: "Normal | Estimated 20-40 minutes | Bring your earlier prescription, reports, and medicine list.",
      status: "In Consultation",
      token: "A002",
      emailSent: true,
    },
    {
      id: 103,
      patientName: "SAFIYA",
      patientEmail: "safiya@email.com",
      doctorName: "Dr. SURUMI",
      doctorEmail: "doctor.surumi@hospital.com",
      department: "General Medicine",
      date: "2026-05-20",
      time: "11:00",
      reason: "Blood pressure check",
      aiNote: "Urgent | Estimated 10-20 minutes | Keep previous reports ready and drink water unless advised otherwise.",
      status: "Completed",
      token: "A003",
      emailSent: true,
    },
  ]);

  const addAppointment = (appointment) => {
    const nextNumber = appointments.length + 1;
    const token = `A${String(nextNumber).padStart(3, "0")}`;

    const newAppointment = {
      ...appointment,
      id: ++idCounterRef.current,
      token,
      status: "Waiting",
      emailSent: false,
    };

    setAppointments([...appointments, newAppointment]);

    // Send email notifications
    if (appointment.patientEmail) {
      sendEmailNotification(
        appointment.patientEmail,
        "Appointment Confirmation - QueueCare",
        `Your appointment with ${appointment.doctorName} has been confirmed.\nToken: ${token}\nDate: ${appointment.date}\nTime: ${appointment.time}`
      );
    }

    if (appointment.doctorEmail) {
      sendEmailNotification(
        appointment.doctorEmail,
        "New Appointment Scheduled",
        `New appointment scheduled with patient ${appointment.patientName}.\nToken: ${token}\nDate: ${appointment.date}\nTime: ${appointment.time}`
      );
    }
  };

  const updateAppointmentStatus = (id, status) => {
    const appointment = appointments.find((app) => app.id === id);
    if (!appointment) return;

    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status } : apt
      )
    );

    // Send email notification on status change
    if (appointment.patientEmail) {
      sendEmailNotification(
        appointment.patientEmail,
        `Appointment Status Update - ${status}`,
        `Your appointment status has been updated to: ${status}\nToken: ${appointment.token}\nDoctor: ${appointment.doctorName}`
      );
    }
  };

  const addUser = (user) => {
    setUsers([
      ...users,
      {
        ...user,
        id: ++idCounterRef.current,
      },
    ]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("home");
  };

  const sendEmailNotification = (recipient, subject, message) => {
    // Frontend simulation - logs to console and creates notification
    const notification = {
      id: ++idCounterRef.current,
      recipient,
      subject,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    setNotifications([notification, ...notifications]);
    console.log(`📧 EMAIL NOTIFICATION:`, { recipient, subject, message });
  };

  const cancelAppointment = (id) => {
    const appointment = appointments.find((apt) => apt.id === id);
    if (!appointment) return;

    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Cancelled" } : apt
      )
    );

    // Send cancellation notifications
    if (appointment.patientEmail) {
      sendEmailNotification(
        appointment.patientEmail,
        "Appointment Cancelled",
        `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been cancelled.`
      );
    }

    if (appointment.doctorEmail) {
      sendEmailNotification(
        appointment.doctorEmail,
        "Patient Appointment Cancelled",
        `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.time} has been cancelled.`
      );
    }
  };

  const rescheduleAppointment = (id, newDate, newTime) => {
    const appointment = appointments.find((apt) => apt.id === id);
    if (!appointment) return;

    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, date: newDate, time: newTime, status: "Waiting" } : apt
      )
    );

    // Send rescheduling notifications
    if (appointment.patientEmail) {
      sendEmailNotification(
        appointment.patientEmail,
        "Appointment Rescheduled",
        `Your appointment with ${appointment.doctorName} has been rescheduled.\nNew Date: ${newDate}\nNew Time: ${newTime}\nPrevious: ${appointment.date} at ${appointment.time}`
      );
    }

    if (appointment.doctorEmail) {
      sendEmailNotification(
        appointment.doctorEmail,
        "Patient Appointment Rescheduled",
        `Appointment with ${appointment.patientName} has been rescheduled.\nNew Date: ${newDate}\nNew Time: ${newTime}`
      );
    }
  };

  return (
    <div>
      
     

      {/* Notifications Panel */}
      {showNotifications && (
        <Notifications 
          notifications={notifications} 
          onClose={() => setShowNotifications(false)}
        />
      )}

      {page === "home" && (
        <Home setPage={setPage} />
      )}

      {page === "login" && (
        <Login
          setPage={setPage}
          users={users}
          setCurrentUser={setCurrentUser}
        />
      )}

      {page === "register" && (
        <Register
          setPage={setPage}
          users={users}
          addUser={addUser}
        />
      )}

      {page === "doctor" && (
        <Doctor
          currentUser={currentUser}
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
          cancelAppointment={cancelAppointment}
          rescheduleAppointment={rescheduleAppointment}
          onLogout={handleLogout}
          sendEmailNotification={sendEmailNotification}
        />
      )}

      {page === "admin" && (
        <Admin
          users={users}
          addUser={addUser}
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
          cancelAppointment={cancelAppointment}
          rescheduleAppointment={rescheduleAppointment}
          onLogout={handleLogout}
          sendEmailNotification={sendEmailNotification}
          setPage={setPage}
        />
      )}

      {page === "patient" && (
        <Patient
          currentUser={currentUser}
          doctors={users.filter((user) => user.role === "Doctor")}
          appointments={appointments}
          addAppointment={addAppointment}
          cancelAppointment={cancelAppointment}
          rescheduleAppointment={rescheduleAppointment}
          onLogout={handleLogout}
          sendEmailNotification={sendEmailNotification}
          setPage={setPage}
        />
      )}

      {page === "patient-history" && (
        <PatientHistory
          currentUser={currentUser}
          appointments={appointments}
          cancelAppointment={cancelAppointment}
          rescheduleAppointment={rescheduleAppointment}
          onLogout={handleLogout}
          setPage={setPage}
        />
      )}

      {page === "queue" && (
        <QueuePage
          appointments={appointments}
          setPage={setPage}
        />
      )}

    </div>
  );
}

export default App;
