import { useState } from "react";
import "../styles/Login.css";
import "../styles/Register.css";

export default function Register({
  setPage,
  users,
  addUser,
}) {

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");

  const handleCreateAccount = () => {

    if (!newUsername || !newPassword || !newEmail || !newRole) {
      alert("Fill all fields");
      return;
    }

    const usernameExists = users.some((user) => user.username === newUsername);

    if (usernameExists) {
      alert("Username already exists");
      return;
    }

    const newUser = {
      username: newUsername,
      password: newPassword,
      email:newEmail,
      role: newRole,
      fullName: newUsername,
      department: newRole === "Doctor" ? "General Medicine" : newRole,
    };

    addUser(newUser);

    alert("Account Created Successfully");

    setPage("login");
  };

  return (
    <div className="login-page">

      <nav className="navbar">

        <h2>QueueCare</h2>

        <button
          className="login-btn"
          onClick={() => setPage("login")}
        >
          Go Back
        </button>

      </nav>

      <div className="login-container">

        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Create Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
  type="email"
  placeholder="Create Email"
  value={newEmail}
  onChange={(e) => setNewEmail(e.target.value)}
/>

        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option>Doctor</option>
          <option>Admin</option>
          <option>Patient</option>
        </select>

        <button onClick={handleCreateAccount}>
          Create Account
        </button>

      </div>

    </div>
  );
}
