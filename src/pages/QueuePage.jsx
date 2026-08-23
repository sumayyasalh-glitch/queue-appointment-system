import { useState } from "react";
import QueueDisplay from "../components/QueueDisplay";
import "../styles/Dashboard.css";
import "../styles/QueuePage.css";

export default function QueuePage({ appointments, setPage }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">Live Queue System</p>
          <h1>Real-time Queue Management</h1>
        </div>
        <button className="outline-btn" onClick={() => setPage("admin")}>
          Back to Admin
        </button>
      </header>

      <section className="dashboard-content">
        <div className="date-selector">
          <label htmlFor="queue-date">Select Date:</label>
          <input
            id="queue-date"
            type="date"
            value={currentDate}
            onChange={handleDateChange}
          />
        </div>

        <QueueDisplay appointments={appointments} currentDate={currentDate} />
      </section>
    </main>
  );
}
