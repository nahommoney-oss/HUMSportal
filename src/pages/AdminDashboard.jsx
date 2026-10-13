import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readStudents } from "../data/studentRecords.js";
import "./AdminDashboard.css";

function readRecords(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(`Unable to read ${key} records.`, error);
    return [];
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(readStudents);
  const [teachers, setTeachers] = useState(() => readRecords("humsTeachers"));
  const [classes, setClasses] = useState(() => readRecords("humsClasses"));

  function refreshRecords() {
    setStudents(readStudents());
    setTeachers(readRecords("humsTeachers"));
    setClasses(readRecords("humsClasses"));
  }

  useEffect(() => {
    window.addEventListener("focus", refreshRecords);
    window.addEventListener("hums-records-updated", refreshRecords);
    return () => {
      window.removeEventListener("focus", refreshRecords);
      window.removeEventListener("hums-records-updated", refreshRecords);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("humsAdmin");
    navigate("/admin-login");
  };

  const subjectCount = new Set(
    teachers.map((teacher) => teacher.subject?.trim()).filter(Boolean)
  ).size;
  const recentStudents = [...students].slice(-5).reverse();

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img
            src="/hums-logo.jpg"
            alt="Haramaya University Model School Students Union"
          />
          <h2>HUMS</h2>
        </div>
        <p className="admin-title">ADMIN PANEL</p>

        <nav>
          <a href="/admin" className="active">Dashboard</a>
          <a href="/admin/students">Students</a>
          <a href="/admin/teachers">Teachers</a>
          <a href="/admin/classes">Classes</a>
          <a href="/admin/academics">Student Scores</a>
          <a href="/admin/schedule">Schedule</a>
          <a href="/admin/announcements">Announcements</a>
          <a href="/admin/reports">Reports</a>
        </nav>

        <button className="logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your school portal from here.</p>
          </div>

        </header>

        <section className="welcome-box">
          <div>
            <h2>Welcome back, Admin</h2>
            <p>Current counts are based on the records you have added.</p>
          </div>
        </section>

        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">ST</div>
            <div><p>Total Students</p><h2>{students.length}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">TE</div>
            <div><p>Total Teachers</p><h2>{teachers.length}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">CL</div>
            <div><p>Total Classes</p><h2>{classes.length}</h2></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">SB</div>
            <div><p>Subjects</p><h2>{subjectCount}</h2></div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-container">
            <button className="action-card" onClick={() => navigate("/admin/students")}>
              <strong>Add Student</strong>
              <small>Register a new student</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/teachers")}>
              <strong>Add Teacher</strong>
              <small>Add a new teacher</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/classes")}>
              <strong>Add Class</strong>
              <small>Create a new class</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/academics")}>
              <strong>Student Scores</strong>
              <small>Enter subject and assessment scores</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/announcements")}>
              <strong>Announcements</strong>
              <small>Publish updates for students</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/schedule")}>
              <strong>Manage Schedule</strong>
              <small>Update the student timetable</small>
            </button>
          </div>
        </section>

        <section className="recent-section">
          <div className="section-header">
            <h2>Recent Students</h2>
            <button onClick={() => navigate("/admin/students")}>View All</button>
          </div>

          <div className="student-table">
            <div className="table-header">
              <span>Student</span>
              <span>Grade</span>
              <span>Gender</span>
              <span>Status</span>
            </div>

            {recentStudents.map((student) => (
              <div className="table-row" key={student.id}>
                <span>{student.name}</span>
                <span>Grade {student.grade}</span>
                <span>{student.gender || "—"}</span>
                <span className="status active-status">{student.status || "Active"}</span>
              </div>
            ))}
            {recentStudents.length === 0 && (
              <p>No students have been added yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
