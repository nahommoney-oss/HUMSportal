import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAdminCredentials } from "../data/adminCredentials.js";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!verifyAdminCredentials(username, password)) {
      setError("Invalid admin username or password.");
      return;
    }
    localStorage.setItem("humsAdmin", "true");
    navigate("/admin");
  };

  const goToStudentLogin = () => {
    navigate("/");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-logo">
          <img
            src="/hums-logo.jpg"
            alt="Haramaya University Model School Students Union"
          />
        </div>

        <h1>HUMS</h1>
        <p className="school-name">
          Haramaya University Model School
        </p>

        <div className="admin-title">
          <h2>Admin Login</h2>
          <p>Sign in to manage the school portal</p>
        </div>

        <p className="auth-message auth-warning" role="note">
          Demo login: username <strong>admin</strong>, password{" "}
          <strong>admin123</strong>. This browser-only login is not secure for
          production use.
        </p>

        {error && (
          <p className="auth-message auth-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-username">Admin Username</label>
          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login to Admin Panel →</button>
        </form>

        <button
          className="back-student"
          onClick={goToStudentLogin}
        >
          ← Back to Student Login
        </button>

      </div>
    </div>
  );
}

export default AdminLogin;
