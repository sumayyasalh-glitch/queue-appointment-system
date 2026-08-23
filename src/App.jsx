import "./App.css";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";
import Patient from "./pages/Patient";
import PatientHistory from "./pages/PatientHistory";
import QueuePage from "./pages/QueuePage";
import Notifications from "./components/Notifications";
import api, { normalizeAppointment } from "./api/client";

const normalizeRole = (role = "patient") => {
  const value = String(role).toLowerCase();
  if (value === "admin") return "Admin";
  if (value === "doctor") return "Doctor";
  if (value === "staff") return "Staff";
  return "Patient";
};

const mapUser = (user = {}) => ({
  id: user.id || user._id,
  _id: user._id || user.id,
  fullName: user.fullName || user.username || "User",
  username: user.email ? user.email.split("@")[0] : user.username || "user",
  email: user.email || "",
  role: normalizeRole(user.role),
  department: user.department || (user.role === "doctor" ? "General Medicine" : ""),
});

function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const persistToken = (token) => {
    if (token) {
      localStorage.setItem("queuecare_token", token);
    } else {
      localStorage.removeItem("queuecare_token");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");
      setCurrentUser(mapUser(response.data.user));
    } catch (error) {
      setCurrentUser(null);
      persistToken(null);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await api.get("/users/doctors");
      const doctorList = (response.data.doctors || []).map(mapUser);
      setDoctors(doctorList);
      setUsers((prev) => [...prev.filter((u) => u.role !== "Doctor"), ...doctorList]);
    } catch (error) {
      console.error("Failed to load doctors", error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await api.get("/appointments");
      const result = (response.data.appointments || []).map(normalizeAppointment);
      setAppointments(result);
    } catch (error) {
      console.error("Failed to load appointments", error);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("queuecare_token");
    if (!savedToken) {
      setCurrentUser(null);
      return;
    }

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setAppointments([]);
      return;
    }

    loadDoctors();
    loadAppointments();
  }, [currentUser]);

  const handleLogin = async (email, password, selectedRole) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const authToken = response.data.token;
      const nextUser = mapUser(response.data.user);

      if (selectedRole && selectedRole !== "" && selectedRole.toLowerCase() !== nextUser.role.toLowerCase()) {
        alert(`This account is registered as ${nextUser.role}. Please select the correct role.`);
        return { success: false };
      }

      persistToken(authToken);
      setCurrentUser(nextUser);

      if (nextUser.role === "Doctor") setPage("doctor");
      else if (nextUser.role === "Admin") setPage("admin");
      else setPage("patient");

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      alert(message);
      return { success: false, message };
    }
  };

  const handleRegister = async (formData) => {
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase(),
      };

      const response = await api.post("/auth/register", payload);
      if (response.status === 201) {
        alert("Account created successfully");
        setPage("login");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      alert(message);
      return { success: false, message };
    }
  };

  const addUser = async (userPayload) => {
    try {
      const payload = {
        fullName: userPayload.fullName,
        email: userPayload.email,
        password: userPayload.password,
        role: String(userPayload.role || "patient").toLowerCase(),
      };

      const response = await api.post("/users", payload);
      const createdUser = mapUser(response.data.user);
      setUsers((prev) => [...prev, createdUser]);
      return createdUser;
    } catch (error) {
      const message = error.response?.data?.message || "Unable to create user";
      alert(message);
      return null;
    }
  };

  const addAppointment = async (appointment) => {
    const selectedDoctor = doctors.find((doctor) => doctor.fullName === appointment.doctorName);
    if (!selectedDoctor) {
      alert("Please select a valid doctor");
      return;
    }

    try {
      const response = await api.post("/appointments", {
        doctor: selectedDoctor.id || selectedDoctor._id,
        date: appointment.date,
        timeSlot: appointment.time,
        reason: appointment.reason,
      });

      const created = normalizeAppointment(response.data.appointment);
      setAppointments((prev) => [created, ...prev]);

      if (appointment.patientEmail) {
        sendEmailNotification(
          appointment.patientEmail,
          "Appointment Confirmation - QueueCare",
          `Your appointment with ${appointment.doctorName} has been confirmed.\nToken: ${created.token}\nDate: ${appointment.date}\nTime: ${appointment.time}`
        );
      }

      return created;
    } catch (error) {
      const message = error.response?.data?.message || "Unable to book appointment";
      alert(message);
      return null;
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    const appointment = appointments.find((app) => String(app.id) === String(id) || String(app._id) === String(id));
    if (!appointment) return;

    try {
      const response = await api.patch(`/appointments/${appointment._id || id}`, { status });
      const updated = normalizeAppointment(response.data.appointment);
      setAppointments((prev) =>
        prev.map((item) => {
          const itemId = item._id || item.id;
          const nextId = updated._id || updated.id;
          return String(itemId) === String(nextId) ? updated : item;
        })
      );

      if (appointment.patientEmail) {
        sendEmailNotification(
          appointment.patientEmail,
          `Appointment Status Update - ${status}`,
          `Your appointment status has been updated to: ${status}\nToken: ${appointment.token}\nDoctor: ${appointment.doctorName}`
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || "Unable to update appointment";
      alert(message);
    }
  };

  const cancelAppointment = async (id) => {
    const appointment = appointments.find((app) => String(app.id) === String(id) || String(app._id) === String(id));
    if (!appointment) return;

    try {
      const response = await api.patch(`/appointments/${appointment._id || id}`, { status: "Cancelled" });
      const updated = normalizeAppointment(response.data.appointment);
      setAppointments((prev) =>
        prev.map((item) => (String(item._id || item.id) === String(updated._id || updated.id) ? updated : item))
      );
      sendEmailNotification(
        appointment.patientEmail,
        "Appointment Cancelled",
        `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been cancelled.`
      );
    } catch (error) {
      const message = error.response?.data?.message || "Unable to cancel appointment";
      alert(message);
    }
  };

  const rescheduleAppointment = async (id, newDate, newTime) => {
    const appointment = appointments.find((app) => String(app.id) === String(id) || String(app._id) === String(id));
    if (!appointment) return;

    try {
      const response = await api.patch(`/appointments/${appointment._id || id}`, {
        date: newDate,
        timeSlot: newTime,
      });
      const updated = normalizeAppointment(response.data.appointment);
      setAppointments((prev) =>
        prev.map((item) => (String(item._id || item.id) === String(updated._id || updated.id) ? updated : item))
      );

      if (appointment.patientEmail) {
        sendEmailNotification(
          appointment.patientEmail,
          "Appointment Rescheduled",
          `Your appointment with ${appointment.doctorName} has been rescheduled.\nNew Date: ${newDate}\nNew Time: ${newTime}`
        );
      }
    } catch (error) {
      const message = error.response?.data?.message || "Unable to reschedule appointment";
      alert(message);
    }
  };

  const handleLogout = () => {
    persistToken(null);
    setCurrentUser(null);
    setAppointments([]);
    setDoctors([]);
    setPage("home");
  };

  const sendEmailNotification = (recipient, subject, message) => {
    const notification = {
      id: Date.now(),
      recipient,
      subject,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <div>
      {showNotifications && (
        <Notifications notifications={notifications} onClose={() => setShowNotifications(false)} />
      )}

      {page === "home" && <Home setPage={setPage} />}

      {page === "login" && (
        <Login setPage={setPage} onLogin={handleLogin} currentUser={currentUser} />
      )}

      {page === "register" && (
        <Register setPage={setPage} onRegister={handleRegister} />
      )}

      {page === "doctor" && currentUser && (
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

      {page === "admin" && currentUser && (
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

      {page === "patient" && currentUser && (
        <Patient
          currentUser={currentUser}
          doctors={doctors}
          appointments={appointments}
          addAppointment={addAppointment}
          cancelAppointment={cancelAppointment}
          rescheduleAppointment={rescheduleAppointment}
          onLogout={handleLogout}
          sendEmailNotification={sendEmailNotification}
          setPage={setPage}
        />
      )}

      {page === "patient-history" && currentUser && (
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
        <QueuePage appointments={appointments} setPage={setPage} />
      )}
    </div>
  );
}

export default App;
