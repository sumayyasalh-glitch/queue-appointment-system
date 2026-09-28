import "../styles/Home.css";

export default function Home({ setPage }) {
  return <div className="home-container">
    <nav className="navbar">
      <button className="brand" type="button" onClick={() => setPage("home")} aria-label="QueueCare home"><span className="brand-mark">+</span><span>Queue<span>Care</span></span></button>
      <div className="nav-actions"><button className="nav-link" type="button" onClick={() => setPage("queue")}>Live queue</button><button className="login-btn" onClick={() => setPage("login")}>Sign in</button></div>
    </nav>
    <section className="hero-section">
      <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3" alt="Hospital" className="hospital-img" />
      <div className="overlay"><p className="hero-kicker"><span /> AI-ASSISTED APPOINTMENT MANAGEMENT</p><h1>Care that moves <em>at your pace.</em></h1><p>Book appointments, receive a token, and use the AI Care Assistant for symptom guidance and queue support.</p><div className="hero-actions"><button className="primary-cta" onClick={() => setPage("login")}>Book an appointment <span>→</span></button><button className="secondary-cta" onClick={() => setPage("queue")}>View live queue</button></div><div className="trust-row"><span>✓ AI symptom guidance</span><span>✓ Live queue updates</span><span>✓ CareBot support</span></div></div>
    </section>
    <section className="home-features" aria-label="QueueCare features"><article><span className="feature-icon">01</span><h2>Book in minutes</h2><p>Choose a doctor, date, and time without waiting on the phone.</p></article><article><span className="feature-icon">02</span><h2>AI Care Assistant</h2><p>Enter symptoms for urgency guidance and get prepared before your visit.</p></article><article><span className="feature-icon">03</span><h2>Know your place</h2><p>Track your token and consultation status as the queue progresses.</p></article></section>
  </div>;
}
