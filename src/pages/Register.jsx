import { useState } from "react";
import "../styles/Login.css";
import "../styles/Register.css";

export default function Register({ setPage, onRegister }) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");

  const handleCreateAccount = async () => {
    if (!fullName || !password || !email) {
      alert("Fill all fields");
      return;
    }

    if (fullName.trim().length < 2) {
      alert("Name must be at least 2 characters");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    await onRegister({ fullName, password, email, role });
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <h2>QueueCare</h2>
        <button className="login-btn" onClick={() => setPage("login")}>
          Go Back
        </button>
      </nav>

      <div className="login-container">
        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="email"
          placeholder="Create Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleCreateAccount}>Create Account</button>
      </div>
    </div>
  );
}
