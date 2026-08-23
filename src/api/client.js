import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("queuecare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const normalizeAppointment = (appointment) => {
  const patient = appointment.patient || {};
  const doctor = appointment.doctor || {};

  return {
    id: appointment._id || appointment.id,
    _id: appointment._id || appointment.id,
    patientId: patient._id || patient.id || null,
    doctorId: doctor._id || doctor.id || null,
    patientName: patient.fullName || "Patient",
    patientEmail: patient.email || "",
    doctorName: doctor.fullName || "Doctor",
    doctorEmail: doctor.email || "",
    date: appointment.date
      ? new Date(appointment.date).toISOString().split("T")[0]
      : "",
    time: appointment.timeSlot || appointment.time || "",
    reason: appointment.reason || "",
    status: appointment.status || "Pending",
    token: appointment.tokenNumber ?? appointment.token ?? "-",
    aiNote: appointment.aiNote || "",
    emailSent: appointment.emailSent ?? false,
    raw: appointment,
  };
};

export default api;
