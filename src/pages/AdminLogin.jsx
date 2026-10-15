import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo admin account
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("humsAdmin", "true");
      navigate("/admin");
    } else {
      alert("Invalid admin username or password.");
    }
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

        <form onSubmit={handleLogin}>

          <label>Admin Username</label>
          <input
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login to Admin Panel →
          </button>

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