import { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import "../styles/BookAppointment.css";

const getLocalDateInputValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
};

const analyzeReason = (reason) => {
  const text = reason.toLowerCase();

  const emergencyWords = ["chest pain", "breathing", "unconscious", "stroke", "severe bleeding"];
  const urgentWords = ["fever", "vomiting", "dizziness", "infection", "high bp", "blood pressure"];
  const followUpWords = ["follow", "routine", "checkup", "report", "review"];

  if (emergencyWords.some((word) => text.includes(word))) {
    return {
      urgency: "Emergency",
      department: "Emergency Care",
      waitTime: "Immediate attention recommended",
      advice: "Please contact emergency services or visit emergency care now.",
    };
  }

  if (urgentWords.some((word) => text.includes(word))) {
    return {
      urgency: "Urgent",
      department: "General Medicine",
      waitTime: "Estimated 10-20 minutes",
      advice: "Keep previous reports ready and drink water unless advised otherwise.",
    };
  }

  if (followUpWords.some((word) => text.includes(word))) {
    return {
      urgency: "Normal",
      department: "General Medicine",
      waitTime: "Estimated 20-40 minutes",
      advice: "Bring your earlier prescription, reports, and medicine list.",
    };
  }

  return {
    urgency: "Normal",
    department: "General Medicine",
    waitTime: "Estimated 20-45 minutes",
    advice: "Share clear symptoms, duration, allergies, and current medicines with the doctor.",
  };
};

export default function Patient({
  currentUser,
  doctors,
  doctorsLoading,
  doctorLoadError,
  reloadDoctors,
  appointments,
  addAppointment,
  cancelAppointment,
  rescheduleAppointment,
  onLogout,
  setPage,
}) {
  const patientName = currentUser?.fullName || currentUser?.username || "Patient";
  const patientEmail = currentUser?.email || "NO EMAIL";
  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    department: "",
    date: getLocalDateInputValue(),
    time: "12:00",
    reason: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    if (doctors.length > 0) {
      const defaultDoctor = doctors[0];
      // Keep the first available doctor selected after the API response arrives.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => {
        const hasValidSelection = doctors.some(
          (doctor) =>
            String(doctor.id || doctor._id) === String(prev.doctorId) ||
            doctor.fullName === prev.doctorName
        );

        if (hasValidSelection) {
          return prev;
        }

        return {
          ...prev,
          doctorId: defaultDoctor.id || defaultDoctor._id,
          doctorName: defaultDoctor.fullName,
          department: defaultDoctor.department || "General Medicine",
          date: prev.date || getLocalDateInputValue(),
        };
      });
    }
  }, [doctors]);

  const myAppointments = appointments.filter((appointment) =>
    String(appointment.patientId) === String(currentUser?.id || currentUser?._id) ||
    appointment.patientName === patientName
  );
  const currentToken = myAppointments.find(
    (appointment) =>
      ["Pending", "Confirmed", "Waiting", "In Consultation"].includes(appointment.status)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "doctorName") {
      const selectedDoctor = doctors.find((doctor) => doctor.fullName === value);
      setForm({
        ...form,
        doctorId: selectedDoctor ? selectedDoctor.id || selectedDoctor._id : "",
        doctorName: value,
        department: selectedDoctor?.department || form.department,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleAiAnalyze = () => {
    if (!form.reason.trim()) {
      alert("Enter symptoms or reason first");
      return;
    }

    const suggestion = analyzeReason(form.reason);
    setAiSuggestion(suggestion);
    setForm({ ...form, department: suggestion.department });
  };

 const handleBookAppointment = async (event) => {
  event.preventDefault();

  if (isBooking) return;
  setBookingMessage("");

  const doctorName = form.doctorName?.trim();
  const date = form.date?.trim();
  const time = form.time?.trim();
  const reason = form.reason?.trim();

  if (!doctorName) {
    setBookingMessage(doctors.length === 0 ? "No doctors are available right now." : "Please select a doctor.");
    return;
  }

  if (!date || !time) {
    setBookingMessage("Please select an appointment date and time.");
    return;
  }

  const selectedDoctor = doctors.find(
    (doctor) =>
      String(doctor.id || doctor._id) === String(form.doctorId) ||
      doctor.fullName === doctorName
  );

  if (!selectedDoctor) {
    alert("Please select a valid doctor");
    return;
  }

  const appointmentData = {
    doctorName: doctorName,
    department: form.department,
    date: date,
    time: time,
    reason: reason,
    patientName: patientName,
    patientEmail: patientEmail,
    aiNote: aiSuggestion
      ? `${aiSuggestion.urgency} | ${aiSuggestion.waitTime} | ${aiSuggestion.advice}`
      : "Not analyzed",
  };

  try {
    setIsBooking(true);
    const createdAppointment = await addAppointment(appointmentData);
    if (!createdAppointment) {
      throw new Error("Unable to book appointment");
    }

    setForm((prev) => ({
      ...prev,
      reason: "",
    }));

    setAiSuggestion(null);
    setBookingMessage(`Appointment booked. Token number: ${createdAppointment.token}`);
  } catch (error) {
    console.error("Booking error:", error);
    setBookingMessage(error.message || "Failed to book appointment. Please try again.");
  } finally {
    setIsBooking(false);
  }
};
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
  <div>
    <p className="eyebrow">Patient Panel</p>
    <h1>Welcome, {patientName}</h1>
  </div>

  <div className="patient-email">
    {patientEmail}
  </div>

  <div className="header-actions">
          <button className="outline-btn" onClick={() => setPage("patient-history")}>
            📋 View History
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Your Token</span>
          <strong>{currentToken ? currentToken.token : "-"}</strong>
        </article>
        <article className="stat-card">
          <span>Status</span>
          <strong>{currentToken ? currentToken.status : "None"}</strong>
        </article>
        <article className="stat-card">
          <span>Total Visits</span>
          <strong>{myAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>Doctors</span>
          <strong>{doctors.length}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Book Appointment</h2>
            <p>Select doctor, time, and reason for visit.</p>
          </div>

          <form className="stacked-form" onSubmit={handleBookAppointment}>
            <select
              name="doctorName"
              value={form.doctorName}
              onChange={handleChange}
              disabled={doctorsLoading || doctors.length === 0}
              required
            >
              {doctorsLoading ? (
                <option value="">Loading doctors...</option>
              ) : doctors.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                [<option key="placeholder" value="">Select a doctor</option>, ...doctors.map((doctor) => (
                  <option key={doctor.id || doctor._id} value={doctor.fullName}>
                    {doctor.fullName}
                  </option>
                ))]
              )}
            </select>
            {doctorLoadError && (
              <div className="booking-message" role="alert">
                {doctorLoadError}
                <button type="button" className="secondary-action" onClick={reloadDoctors}>
                  Try Again
                </button>
              </div>
            )}
            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
            <textarea
              name="reason"
              placeholder="Reason for appointment"
              value={form.reason}
              onChange={handleChange}
            />
            <button className="secondary-action" type="button" onClick={handleAiAnalyze}>
              AI Analyze Symptoms
            </button>
            {aiSuggestion && (
              <div className="ai-box">
                <div className="ai-box-title">
                  <span>AI Visit Assistant</span>
                  <strong>{aiSuggestion.urgency}</strong>
                </div>
                <p>{aiSuggestion.waitTime}</p>
                <p>{aiSuggestion.advice}</p>
              </div>
            )}
            <button type="submit" disabled={isBooking}>
              {isBooking ? "Booking..." : "Book Appointment"}
            </button>
            {bookingMessage && <p className="booking-message" role="status">{bookingMessage}</p>}
          </form>
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>My Appointments</h2>
            <p>Track queue number and appointment status.</p>
          </div>

          {myAppointments.length === 0 ? (
            <div className="empty-state">No appointments booked yet.</div>
          ) : (
            <div className="queue-list">
              {myAppointments.map((appointment) => (
                <div className="queue-item" key={appointment.id}>
                  <div className="token-box">{appointment.token}</div>
                  <div className="queue-details">
                    <strong>{appointment.doctorName}</strong>
                    <span>{appointment.date} at {appointment.time}</span>
                    <span>{appointment.reason}</span>
                  </div>
                  <span className={`status-pill ${appointment.status.toLowerCase().replace(" ", "-")}`}>
                    {appointment.status}
                  </span>
                  {(appointment.status === "Waiting" || appointment.status === "In Consultation") && (
                    <div className="appointment-actions">
                      <button
                        className="btn-reschedule"
                        onClick={() => {
                          const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
                          if (newDate) {
                            const newTime = window.prompt("Enter new time (HH:MM):");
                            if (newTime) {
                              rescheduleAppointment(appointment.id, newDate, newTime);
                            }
                          }
                        }}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          if (window.confirm("Cancel this appointment?")) {
                            cancelAppointment(appointment.id);
                          }
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  );
}