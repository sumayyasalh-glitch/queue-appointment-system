import { useEffect, useRef, useState } from "react";

const welcomeMessage = {
  id: "welcome",
  sender: "bot",
  text: "Hi! I'm CareBot, your AI care assistant. I can help with appointments, queue tokens, and navigating QueueCare.",
};

const getReply = (message, { currentUser, appointments, setPage }) => {
  const question = message.toLowerCase();

  if (/book|appointment|schedule/.test(question)) {
    if (!currentUser) return "Please log in first, then choose Book Appointment from your patient dashboard.";
    if (currentUser.role === "Patient") {
      setPage("patient");
      return "I've opened your patient dashboard. Use the booking form to select a doctor, date, and time.";
    }
    return "Appointments are booked from a patient's dashboard. Patients can select a doctor, date, and available time there.";
  }

  if (/queue|token|wait/.test(question)) {
    if (!currentUser) {
      setPage("queue");
      return "I've opened the public queue page. Log in to see and manage your personal appointment details.";
    }
    const userAppointments = appointments.filter(
      (appointment) => appointment.patientEmail?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    const active = userAppointments.find((appointment) => !["Completed", "Cancelled"].includes(appointment.status));
    return active
      ? `Your active appointment token is ${active.token || "being assigned"}. Its status is ${active.status || "Pending"}.`
      : "You do not have an active appointment yet. You can book one from the patient dashboard.";
  }

  if (/cancel|resched|change/.test(question)) {
    return "Open your appointment history from the patient dashboard to cancel or reschedule an appointment.";
  }

  if (/hello|hi|help|what can you/.test(question)) {
    return "I can help you book an appointment, check your queue token, or explain how to cancel and reschedule.";
  }

  return "I can help with booking, queue tokens, cancellations, and rescheduling. Try asking “How do I book an appointment?”";
};

export default function ChatBot({ currentUser, appointments, setPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = (value = input) => {
    const text = value.trim();
    if (!text) return;

    const userMessage = { id: Date.now(), sender: "user", text };
    setMessages((previous) => [...previous, userMessage]);
    setInput("");

    window.setTimeout(() => {
      const reply = getReply(text, { currentUser, appointments, setPage });
      setMessages((previous) => [...previous, { id: Date.now() + 1, sender: "bot", text: reply }]);
    }, 350);
  };

  return (
    <aside className="chatbot" aria-label="QueueCare support chat">
      {isOpen && (
        <section className="chatbot-window" aria-live="polite">
          <header className="chatbot-header">
            <div><strong>CareBot</strong><span>QueueCare assistant</span></div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="chatbot-messages">
            {messages.map((message) => <p className={`chat-message ${message.sender}`} key={message.id}>{message.text}</p>)}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-prompts">
            <button type="button" onClick={() => sendMessage("How do I book an appointment?")}>Book appointment</button>
            <button type="button" onClick={() => sendMessage("Check my queue token")}>Check my token</button>
          </div>
          <form className="chatbot-form" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a message..." aria-label="Message CareBot" />
            <button type="submit" aria-label="Send message">Send</button>
          </form>
        </section>
      )}
      <button className="chatbot-toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <span aria-hidden="true">💬</span> {isOpen ? "Close" : "Need help?"}
      </button>
    </aside>
  );
}
