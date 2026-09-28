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
  const emergencyWords = ["chest pain", "difficulty breathing", "shortness of breath", "unconscious", "severe bleeding", "heavy bleeding", "stroke", "seizure", "fainting", "severe allergic reaction"];
  const urgentWords = ["high fever", "vomiting", "dizziness", "infection", "severe pain", "severe headache", "persistent cough", "dehydration", "abdominal pain"];
  const departments = [
    { name: "ENT", terms: ["ear pain", "earache", "ear infection", "hearing", "tinnitus", "nose bleed", "sinus", "sore throat", "tonsil"] },
    { name: "Dental", terms: ["tooth", "toothache", "gum", "dental"] },
    { name: "Ophthalmology", terms: ["eye pain", "blurred vision", "red eye", "vision"] },
    { name: "Dermatology", terms: ["rash", "skin", "eczema", "acne", "itching"] },
    { name: "Orthopedics", terms: ["bone", "joint", "back pain", "fracture", "sprain", "knee pain"] },
    { name: "Cardiology", terms: ["palpitation", "heart", "blood pressure"] },
    { name: "Gastroenterology", terms: ["stomach", "gastric", "diarrhea", "constipation", "abdominal"] },
    { name: "Respiratory", terms: ["asthma", "wheezing", "cough", "breathing"] },
    { name: "Neurology", terms: ["migraine", "headache", "numbness"] },
    { name: "Pediatrics", terms: ["baby", "child", "infant"] },
    { name: "Gynecology", terms: ["pregnancy", "menstrual", "period pain"] },
    { name: "Urology", terms: ["urine", "urinary", "kidney"] },
  ];
  const recommended = departments.find(({ terms }) => terms.some((term) => text.includes(term)))?.name || "General Medicine";

  if (emergencyWords.some((word) => text.includes(word))) return { urgency: "Emergency", department: "Emergency Care", waitTime: "Immediate attention recommended", advice: "Please contact emergency services or go to the nearest emergency department now." };
  if (urgentWords.some((word) => text.includes(word))) return { urgency: "Urgent", department: recommended, waitTime: "Priority review recommended", advice: "Book the recommended department promptly and bring any previous reports." };
  return { urgency: "Normal", department: recommended, waitTime: "Standard appointment", advice: "Book the recommended department and share symptoms, duration, allergies, and current medicines." };
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
    bookingFor: "self",
    familyMemberName: "",
    familyMemberContact: "",
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
          department: defaultDoctor.department || "",
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
  const normalizedDepartment = suggestion.department.toLowerCase();
  const matchingDoctor = doctors.find((doctor) => doctor.department?.toLowerCase().includes(normalizedDepartment));
  setForm((previous) => ({
    ...previous,
    department: suggestion.department,
    doctorId: matchingDoctor ? matchingDoctor.id || matchingDoctor._id : previous.doctorId,
    doctorName: matchingDoctor ? matchingDoctor.fullName : previous.doctorName,
  }));
};

  const handleBookAppointment = async (event) => {
  event.preventDefault();

  if (isBooking) return;
  setBookingMessage("");

  const doctorName = form.doctorName?.trim();
  const date = form.date?.trim();
  const time = form.time?.trim();
  const reason = form.reason?.trim();

  if (form.bookingFor === "family" && (!form.familyMemberName.trim() || !form.familyMemberContact.trim())) {
    setBookingMessage("Enter the family member's username and email to continue.");
    return;
  }

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
    patientName: form.bookingFor === "family" ? form.familyMemberName.trim() : patientName,
    patientContact: form.bookingFor === "family" ? form.familyMemberContact.trim() : patientEmail,
    relationship: form.bookingFor === "family" ? "Family member" : "Self",
    paymentMethod: "Pay at Hospital",
    paymentStatus: "Pending",
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
    setBookingMessage(`Appointment booked. Token number: ${createdAppointment.token}. Payment: ${createdAppointment.paymentStatus}.`);
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
            <fieldset className="booking-for">
              <legend>Who is this appointment for?</legend>
              <div className="booking-choice-buttons">
                <button type="button" className={form.bookingFor === "self" ? "selected" : ""} onClick={() => setForm((previous) => ({ ...previous, bookingFor: "self", familyMemberName: "", familyMemberContact: "" }))}>
                  <span className="choice-title">Book for myself</span>
                  <span className="choice-subtitle">Use my registered account</span>
                </button>
                <button type="button" className={form.bookingFor === "family" ? "selected" : ""} onClick={() => setForm((previous) => ({ ...previous, bookingFor: "family" }))}>
                  <span className="choice-title">Book for a family member</span>
                  <span className="choice-subtitle">Add their details below</span>
                </button>
              </div>
              {form.bookingFor === "family" && (
                <div className="family-details">
                  <div className="family-banner">Family member appointment details</div>
                  <input name="familyMemberName" placeholder="Family member's username" value={form.familyMemberName} onChange={handleChange} required />
                  <input name="familyMemberContact" type="email" placeholder="Family member's email address" value={form.familyMemberContact} onChange={handleChange} required />
                </div>
              )}
            </fieldset>
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
            <div className="ai-feature-intro">
              <strong>AI Care Assistant</strong>
              <span>Describe your symptoms to receive visit-priority guidance before booking.</span>
            </div>
            <textarea
              name="reason"
              placeholder="Reason for appointment"
              value={form.reason}
              onChange={handleChange}
            />
            <div className="payment-options">
              <strong>Payment at hospital</strong>
              <p>Consultation fee: <b>Rs. 1,500</b></p>
              <span className="payment-note">Please pay at the hospital reception before your consultation. Your token will be marked payment pending.</span>
            </div>
            <button className="secondary-action" type="button" onClick={handleAiAnalyze}>
              Get AI Symptom Guidance
            </button>
            {aiSuggestion && (
              <div className="ai-box">
                <div className="ai-box-title">
                  <span>AI Care Assistant Result</span>
                  <strong>{aiSuggestion.urgency}</strong>
                </div>
                <p><strong>Recommended department: {aiSuggestion.department}</strong></p>
                <p>{aiSuggestion.waitTime}</p>
                <p>{aiSuggestion.advice}</p>
                <p className="ai-disclaimer">This guidance supports booking only and is not a medical diagnosis.</p>
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
                  <span className={`payment-pill ${appointment.paymentStatus.toLowerCase()}`}>{appointment.paymentStatus === "Paid" ? "Payment paid" : "Payment pending"}</span>
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
