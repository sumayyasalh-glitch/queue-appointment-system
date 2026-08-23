

import "../styles/Notifications.css";

export default function Notifications({ notifications, onClose }) {
  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>📧 Email Notifications ({notifications.length})</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="notification-item">
              <div className="notification-header">
                <strong>{notif.subject}</strong>
                <span className="notification-time">{notif.timestamp}</span>
              </div>
              <div className="notification-recipient">To: {notif.recipient}</div>
              <div className="notification-message">{notif.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
