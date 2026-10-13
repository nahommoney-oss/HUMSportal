import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function Admin() {
  const [activeSection, setActiveSection] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("humsAdmin") !== "true") {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("humsAdmin");
    navigate("/admin-login");
  };

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-box">H</div>
          <div>
            <h2>HUMS</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav>
          <button
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>

          <button
            className={activeSection === "students" ? "active" : ""}
            onClick={() => setActiveSection("students")}
          >
            Students
          </button>

          <button
            className={activeSection === "teachers" ? "active" : ""}
            onClick={() => setActiveSection("teachers")}
          >
            Teachers
          </button>

          <button
            className={activeSection === "announcements" ? "active" : ""}
            onClick={() => setActiveSection("announcements")}
          >
            Announcements
          </button>

          <button
            className={activeSection === "schedule" ? "active" : ""}
            onClick={() => setActiveSection("schedule")}
          >
            Schedule
          </button>
        </nav>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">

        <header className="admin-header">
          <div>
            <p>Haramaya University Model School</p>
            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>School Admin</span>
            </div>
          </div>
        </header>

        {/* Overview */}
        {activeSection === "overview" && (
          <section>
            <div className="welcome-box">
              <h2>Welcome, Administrator</h2>
              <p>
                Manage students, teachers, announcements and school schedules
                from one place.
              </p>
            </div>

            <div className="admin-stats">

              <div className="admin-stat-card">
                <span>ST</span>
                <div>
                  <p>Total Students</p>
                  <h2>80</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <span>TE</span>
                <div>
                  <p>Total Teachers</p>
                  <h2>8</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <span>G9</span>
                <div>
                  <p>Grade 9</p>
                  <h2>42</h2>
                </div>
              </div>

              <div className="admin-stat-card">
                <span>G10</span>
                <div>
                  <p>Grade 10</p>
                  <h2>38</h2>
                </div>
              </div>

            </div>

            <div className="admin-actions">
              <h2>Quick Actions</h2>

              <div className="action-grid">

                <button onClick={() => setActiveSection("students")}>
                  <strong>Add Student</strong>
                  <small>Register a new student</small>
                </button>

                <button onClick={() => setActiveSection("teachers")}>
                  <strong>Add Teacher</strong>
                  <small>Add teacher information</small>
                </button>

                <button onClick={() => setActiveSection("announcements")}>
                  <strong>Create Announcement</strong>
                  <small>Publish school news</small>
                </button>

                <button onClick={() => setActiveSection("schedule")}>
                  <strong>Manage Schedule</strong>
                  <small>Update class schedules</small>
                </button>

              </div>
            </div>
          </section>
        )}

        {/* Students */}
        {activeSection === "students" && (
          <section className="admin-section">
            <h2>Student Management</h2>
            <p>
              Add and manage students in Grades 9 through 12.
            </p>

            <button className="primary-button">
              Add New Student
            </button>
          </section>
        )}

        {/* Teachers */}
        {activeSection === "teachers" && (
          <section className="admin-section">
            <h2>Teacher Management</h2>
            <p>
              Add and manage HUMS teacher information.
            </p>

            <button className="primary-button">
              Add New Teacher
            </button>
          </section>
        )}

        {/* Announcements */}
        {activeSection === "announcements" && (
          <section className="admin-section">
            <h2>Announcements</h2>
            <p>
              Create and manage school announcements.
            </p>

            <button className="primary-button">
              Create Announcement
            </button>
          </section>
        )}

        {/* Schedule */}
        {activeSection === "schedule" && (
          <section className="admin-section">
            <h2>Schedule Management</h2>
            <p>
              Manage class schedules for Grades 9 through 12.
            </p>

            <button className="primary-button">
              Add Schedule
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

export default Admin;