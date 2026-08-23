import "../styles/Dashboard.css";

export default function QueueDisplay({ appointments, currentDate }) {
  // Get today's appointments sorted by time
  const todayAppointments = appointments
    .filter((apt) => apt.date === currentDate && apt.status !== "Cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));

  // Separate by status for queue view
  const waitingQueue = todayAppointments.filter((apt) => apt.status === "Waiting");
  const inConsultation = todayAppointments.find((apt) => apt.status === "In Consultation");
  const completedToday = todayAppointments.filter((apt) => apt.status === "Completed");

  const nextInQueue = waitingQueue[0];

  return (
    <div className="queue-display-container">
      <div className="queue-status">
        <div className="queue-card current-serving">
          <div className="queue-card-title">Currently Serving</div>
          {inConsultation ? (
            <>
              <div className="queue-token-large">{inConsultation.token}</div>
              <p className="queue-patient">{inConsultation.patientName}</p>
              <p className="queue-doctor">{inConsultation.doctorName}</p>
            </>
          ) : (
            <p className="no-queue">No active consultation</p>
          )}
        </div>

        <div className="queue-card next-queue">
          <div className="queue-card-title">Next in Queue</div>
          {nextInQueue ? (
            <>
              <div className="queue-token-large">
                {nextInQueue.token}
              </div>
              <p className="queue-patient">{nextInQueue.patientName}</p>
              <p className="queue-time">
                Scheduled: {nextInQueue.time}
              </p>
            </>
          ) : (
            <p className="no-queue">No one waiting</p>
          )}
        </div>

        <div className="queue-card queue-stats">
          <div className="queue-card-title">Today's Queue</div>
          <div className="queue-numbers">
            <div className="queue-number">
              <span className="label">Total</span>
              <span className="count">{todayAppointments.length}</span>
            </div>
            <div className="queue-number">
              <span className="label">Waiting</span>
              <span className="count waiting">{waitingQueue.length}</span>
            </div>
            <div className="queue-number">
              <span className="label">Completed</span>
              <span className="count completed">{completedToday.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-list-section">
        <h3>📋 Full Queue for {currentDate}</h3>
        {todayAppointments.length === 0 ? (
          <p className="no-queue">No appointments for today</p>
        ) : (
          <div className="queue-full-list">
            {todayAppointments.map((apt, index) => (
              <div
                key={apt.id}
                className={`queue-full-item ${apt.status.toLowerCase().replace(" ", "-")}`}
              >
                <div className="queue-position">{index + 1}</div>
                <div className="queue-token">{apt.token}</div>
                <div className="queue-info">
                  <strong>{apt.patientName}</strong>
                  <span>{apt.doctorName} • {apt.department}</span>
                  <span className="queue-reason">{apt.reason}</span>
                </div>
                <div className="queue-time">{apt.time}</div>
                <div className={`queue-status-badge ${apt.status.toLowerCase().replace(" ", "-")}`}>
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
