import { useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/Doctor.css";

const today = () => new Date().toISOString().slice(0, 10);
const queueStatuses = ["Pending", "Confirmed", "Waiting"];
const statusOptions = ["All", "Pending", "Confirmed", "Waiting", "In Consultation", "Completed", "No Show"];

export default function Doctor({ currentUser, appointments, updateAppointmentStatus, callNextPatient, refreshAppointments, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const doctorName = currentUser?.fullName || "Doctor";
  const doctorAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.doctorId === currentUser?.id || appointment.doctorName === doctorName),
    [appointments, currentUser?.id, doctorName]
  );
  const selectedAppointments = useMemo(
    () => doctorAppointments.filter((appointment) => appointment.date === selectedDate),
    [doctorAppointments, selectedDate]
  );
  const visibleAppointments = statusFilter === "All" ? selectedAppointments : selectedAppointments.filter((appointment) => appointment.status === statusFilter);
  const waitingAppointments = selectedAppointments.filter((appointment) => queueStatuses.includes(appointment.status));
  const activeAppointment = selectedAppointments.find((appointment) => appointment.status === "In Consultation");
  const completedCount = selectedAppointments.filter((appointment) => appointment.status === "Completed").length;

  const runAction = async (action, successMessage) => {
    setBusy(true);
    setNotice("");

    try {
      await action();
      setNotice(successMessage);
    } catch (error) {
      setNotice(error.message || "The appointment could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  const callNext = () => runAction(() => callNextPatient(selectedDate), "Next patient called successfully.");
  const refresh = () => runAction(refreshAppointments, "Appointments refreshed.");

  return (
    <main className="dashboard-shell doctor-page">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Doctor Panel</p>
          <h1>{doctorName}</h1>
        </div>

        <div className="doctor-header-actions">
          <button className="ghost-btn" onClick={refresh} disabled={busy}>
            Refresh
          </button>
          <button className="outline-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="doctor-toolbar" aria-label="Appointment filters">
        <div className="toolbar-field">
          <label htmlFor="doctor-date">Schedule date</label>
          <input
            id="doctor-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

        <div className="toolbar-field">
          <label htmlFor="doctor-status">Status</label>
          <select
            id="doctor-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          className="primary-btn"
          onClick={callNext}
          disabled={busy || Boolean(activeAppointment) || !waitingAppointments.length}
        >
          {activeAppointment ? "Consultation in progress" : "Call next patient"}
        </button>
      </section>

      {notice && (
        <p className="doctor-notice" role="status">
          {notice}
        </p>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Appointments</span>
          <strong>{selectedAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>Waiting</span>
          <strong>{waitingAppointments.length}</strong>
        </article>
        <article className="stat-card">
          <span>In Consultation</span>
          <strong>{activeAppointment ? activeAppointment.token : "—"}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Current patient</h2>
            <p>{activeAppointment ? "Consultation in progress" : "Waiting for the next patient call"}</p>
          </div>

          {activeAppointment ? (
            <div className="current-token">
              <div className="token-wrapper">
                <span>{activeAppointment.token}</span>
              </div>

              <div className="patient-identity">
                <h3>{activeAppointment.patientName}</h3>
                <p>
                  {activeAppointment.time} · {activeAppointment.reason || "No reason provided."}
                </p>
              </div>

              <div className="info-list">
                <p>
                  <strong>Email:</strong> {activeAppointment.patientEmail || "Not provided"}
                </p>
                <p>
                  <strong>Booking:</strong> {activeAppointment.relationship || "Self"}
                </p>
              </div>

              <button
                disabled={busy}
                onClick={() => runAction(() => updateAppointmentStatus(activeAppointment.id, "Completed"), "Consultation marked as completed.")}
              >
                Mark as completed
              </button>
            </div>
          ) : (
            <div className="empty-state">No active consultation. Call the next waiting patient when ready.</div>
          )}
        </div>

        <div className="panel wide-panel">
          <div className="panel-heading">
            <h2>Patient queue</h2>
            <p>
              {selectedDate} · {visibleAppointments.length} appointment{visibleAppointments.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="queue-list">
            {visibleAppointments.length ? (
              visibleAppointments.map((appointment) => {
                const statusClass = appointment.status.toLowerCase().replaceAll(" ", "-");
                const canUpdateQueue = queueStatuses.includes(appointment.status);

                return (
                  <div className="queue-item" key={appointment.id}>
                    <div className="token-box">{appointment.token}</div>

                    <div className="queue-details">
                      <div className="patient-header">
                        <strong>{appointment.patientName}</strong>
                        <span className={`status-pill ${statusClass}`}>{appointment.status}</span>
                      </div>

                      <span>
                        {appointment.time} · {appointment.reason || "No reason provided"}
                      </span>

                      <details>
                        <summary>Patient details</summary>
                        <div className="details-body">
                          <p>Email: {appointment.patientEmail || "Not provided"}</p>
                          <p>Booking: {appointment.relationship || "Self"}</p>
                        </div>
                      </details>
                    </div>

                    <div className="action-row">
                      {canUpdateQueue && (
                        <button disabled={busy || Boolean(activeAppointment)} onClick={callNext}>
                          Call patient
                        </button>
                      )}

                      {appointment.status === "In Consultation" && (
                        <button
                          disabled={busy}
                          onClick={() => runAction(() => updateAppointmentStatus(appointment.id, "Completed"), "Consultation marked as completed.")}
                        >
                          Complete
                        </button>
                      )}

                      {canUpdateQueue && (
                        <button
                          className="ghost-btn"
                          disabled={busy}
                          onClick={() => runAction(() => updateAppointmentStatus(appointment.id, "No Show"), "Patient marked as no show.")}
                        >
                          No Show
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No appointments match this date and filter.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

