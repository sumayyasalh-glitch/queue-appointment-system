import "../styles/Dashboard.css";
import "../styles/PatientHistory.css";

export default function PatientHistory({
  currentUser,
  appointments,
  cancelAppointment,
  rescheduleAppointment,
  onLogout,
  setPage
}) {
  const patientName = currentUser?.fullName || currentUser?.username || "Patient";

  // Get all appointments for this patient
  const myAppointments = appointments.filter(
    (appointment) => appointment.patientName === patientName
  );

  // Separate by status
  const completedAppointments = myAppointments.filter(
    (apt) => apt.status === "Completed"
  );
  const upcomingAppointments = myAppointments.filter(
    (apt) => apt.status === "Waiting" || apt.status === "In Consultation"
  );
  const cancelledAppointments = myAppointments.filter(
    (apt) => apt.status === "Cancelled"
  );

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelAppointment(appointmentId);
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    const newDate = window.prompt("Enter new date (YYYY-MM-DD):");
    if (!newDate) return;

    const newTime = window.prompt("Enter new time (HH:MM):");
    if (!newTime) return;

    rescheduleAppointment(appointmentId, newDate, newTime);
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Patient History</p>
          <h1>Your Appointment History</h1>
        </div>
        <button className="back-patient-btn" onClick={() => setPage("patient")}>
  ← Back to Patient
</button>
      </header>

      <section className="dashboard-content">
        <div className="history-section">
          <h2>📅 Upcoming Appointments ({upcomingAppointments.length})</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="no-data">No upcoming appointments</p>
          ) : (
            <div className="appointment-grid">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card upcoming">
                  <div className="appointment-header">
                    <h3>{apt.doctorName}</h3>
                    <span className="status-badge status-waiting">{apt.status}</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Date:</strong> {apt.date}</p>
                    <p><strong>Time:</strong> {apt.time}</p>
                    <p><strong>Department:</strong> {apt.department}</p>
                    <p><strong>Token:</strong> {apt.token}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                  </div>
                  <div className="appointment-actions">
                    <button
                      className="btn-reschedule"
                      onClick={() => handleRescheduleAppointment(apt.id)}
                    >
                      Reschedule
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelAppointment(apt.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="history-section">
          <h2>✅ Completed Appointments ({completedAppointments.length})</h2>
          {completedAppointments.length === 0 ? (
            <p className="no-data">No completed appointments</p>
          ) : (
            <div className="appointment-grid">
              {completedAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card completed">
                  <div className="appointment-header">
                    <h3>{apt.doctorName}</h3>
                    <span className="status-badge status-completed">✓ Completed</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Date:</strong> {apt.date}</p>
                    <p><strong>Time:</strong> {apt.time}</p>
                    <p><strong>Department:</strong> {apt.department}</p>
                    <p><strong>Token:</strong> {apt.token}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cancelledAppointments.length > 0 && (
          <div className="history-section">
            <h2>❌ Cancelled Appointments ({cancelledAppointments.length})</h2>
            <div className="appointment-grid">
              {cancelledAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card cancelled">
                  <div className="appointment-header">
                    <h3>{apt.doctorName}</h3>
                    <span className="status-badge status-cancelled">Cancelled</span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Date:</strong> {apt.date}</p>
                    <p><strong>Time:</strong> {apt.time}</p>
                    <p><strong>Department:</strong> {apt.department}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="history-stats">
          <div className="stat-card">
            <h4>Total Appointments</h4>
            <p className="stat-number">{myAppointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <p className="stat-number">{completedAppointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Upcoming</h4>
            <p className="stat-number">{upcomingAppointments.length}</p>
          </div>
          <div className="stat-card">
            <h4>Cancelled</h4>
            <p className="stat-number">{cancelledAppointments.length}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
