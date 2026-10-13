import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { readStudents } from "../data/studentRecords.js";
import "./Login.css";

function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("9");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!studentId || !password) {
      alert("Please enter your Student ID and Password.");
      return;
    }

    const student = readStudents().find(
      (item) =>
        String(item.id).trim().toLowerCase() ===
          studentId.trim().toLowerCase() &&
        item.password === password &&
        String(item.grade) === grade &&
        String(item.status ?? "Active").toLowerCase() === "active"
    );

    if (!student) {
      alert("Invalid Student ID, password, or grade.");
      return;
    }

    localStorage.setItem(
      "humsStudent",
      JSON.stringify({
        id: student.id,
        grade: String(student.grade),
      })
    );

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-background"></div>

      <div className="login-container">

        <div className="school-brand">

          <div className="school-logo">
            <img
              src="/hums-logo.jpg"
              alt="Haramaya University Model School Students Union"
            />
          </div>

          <h1>HUMS</h1>

          <p>
            Haramaya University Model School
          </p>

          <span>
            Student Academic Portal
          </span>

        </div>

        <div className="login-card">

          <div className="login-heading">
            <h2>Welcome Back</h2>

            <p>
              Sign in to access your student portal
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="input-group">

              <label>Student ID</label>

              <input
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />

            </div>

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>

            <div className="input-group">

              <label>Grade</label>

              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >

                {["9", "10", "11", "12"].map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}

              </select>

            </div>

            <button type="submit" className="login-button">
              Login
              <span>→</span>
            </button>

          </form>

          <div className="login-footer">

            <a href="/admin-login" className="admin-login-link">
              Admin Login
            </a>

            <p>
              © 2026 Haramaya University Model School
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;