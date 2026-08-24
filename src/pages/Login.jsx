import { useState } from "react";
import "../styles/Login.css";

export default function Login({ setPage, onLogin, currentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Patient");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    await onLogin(email, password, role);
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <h2>QueueCare</h2>
        <div className="navbar-email">{currentUser?.email || ""}</div>
        <button className="login-btn" onClick={() => setPage("home")}>
          Go Back
        </button>
      </nav>

      <div className="login-container">
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Patient">Patient</option>
          <option value="Doctor">Doctor</option>
          <option value="Admin">Admin</option>
        
        </select>

        <button onClick={handleLogin}>Login</button>

        <p className="new-user">
          New User?
          <button className="create-account-btn" onClick={() => setPage("register")}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}