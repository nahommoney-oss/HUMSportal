import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar.jsx";
import { readLoggedInStudent } from "../data/studentRecords.js";
import { readAnnouncements } from "../data/announcementsStore.js";

import "./Dashboared.css";

function Dashboard() {

  const navigate = useNavigate();

  const [student, setStudent] = useState(readLoggedInStudent);
  const [announcements, setAnnouncements] = useState(() => {
    try {
      return readAnnouncements();
    } catch (error) {
      console.error("Unable to load announcements.", error);
      return [];
    }
  });

  useEffect(() => {
    const refreshStudent = () => setStudent(readLoggedInStudent());
    const refreshAnnouncements = () => {
      try {
        setAnnouncements(readAnnouncements());
      } catch (error) {
        console.error("Unable to load announcements.", error);
      }
    };
    window.addEventListener("focus", refreshStudent);
    window.addEventListener("hums-records-updated", refreshStudent);
    window.addEventListener("storage", refreshStudent);
    window.addEventListener("focus", refreshAnnouncements);
    window.addEventListener("storage", refreshAnnouncements);
    window.addEventListener("hums-announcements-updated", refreshAnnouncements);
    if (!student) {
      navigate("/");
    }
    return () => {
      window.removeEventListener("focus", refreshStudent);
      window.removeEventListener("hums-records-updated", refreshStudent);
      window.removeEventListener("storage", refreshStudent);
      window.removeEventListener("focus", refreshAnnouncements);
      window.removeEventListener("storage", refreshAnnouncements);
      window.removeEventListener(
        "hums-announcements-updated",
        refreshAnnouncements
      );
    };
  }, [navigate, student]);


  if (!student) {
    return <div>Loading...</div>;
  }


  return (

    <div className="portal">

      <Sidebar />

      <main className="dashboard">

        {/* TOP BAR */}

        <header className="dashboard-header">

          <div>
            <p className="welcome-small">
              Student Dashboard
            </p>

            <h1>
              Good afternoon, {student.name.split(" ")[0]}
            </h1>
          </div>

          <div className="student-mini">

            <div className="student-avatar">
              {student.name.charAt(0)}
            </div>

            <div>
              <strong>{student.name}</strong>

              <span>
                Grade {student.grade}
                {student.stream ? ` · ${student.stream}` : ""}
                {` • Section ${student.section}`}
              </span>
            </div>

          </div>

        </header>


        {/* STATISTICS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">AVG</div>

            <div>
              <span>Average Score</span>
              <h2>{student.average ?? "—"}{student.average != null ? "%" : ""}</h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">RANK</div>

            <div>
              <span>Class Rank</span>

              <h2>
                {student.rank ?? "—"}
                {student.totalStudents != null && (
                  <small> / {student.totalStudents}</small>
                )}
              </h2>

            </div>

          </div>


        </section>


        {/* MAIN CONTENT */}

        <section className="dashboard-grid">


          {/* SCORES */}

          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>Recent Results</h2>
                <p>Your latest subject scores</p>
              </div>

              <button onClick={() => navigate("/scores")}>
                View All
              </button>

            </div>


            <div className="score-list">

              {(student.scores ?? []).map((subject) => (

                <div
                  className="score-row"
                  key={subject.subject}
                >

                  <div className="subject-info">

                    <strong>
                      {subject.subject}
                    </strong>

                    <div className="progress">

                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              subject.max
                                ? (Number(subject.score) / Number(subject.max)) * 100
                                : Number(subject.score)
                            )
                          )}%`
                        }}
                      ></div>
                    </div>

                    {(subject.assessments ?? []).length > 0 && (
                      <div className="dashboard-assessment-list">
                        {subject.assessments.map((assessment, index) => (
                          <div
                            className="dashboard-assessment"
                            key={`${subject.subject}-assessment-${index}`}
                          >
                            <span>{assessment.name}</span>
                            <strong>
                              {assessment.score} / {assessment.max}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <strong className="score-number">
                    {subject.score}
                    {subject.max ? `/${subject.max}` : ""}
                  </strong>

                </div>

              ))}
              {(student.scores ?? []).length === 0 && (
                <p>No academic results have been recorded yet.</p>
              )}

            </div>

          </div>


          {/* ANNOUNCEMENTS */}

          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>Announcements</h2>
                <p>Latest school updates</p>
              </div>

              <button onClick={() => navigate("/announcements")}>
                View All
              </button>

            </div>


            {announcements.slice(0, 3).map((announcement) => (
              <article className="dashboard-announcement" key={announcement.id}>
                <div className="dashboard-announcement-title">
                  <strong>{announcement.title}</strong>
                  {announcement.important && <span>Important</span>}
                </div>
                <p>{announcement.message}</p>
                <small>{announcement.date}</small>
              </article>
            ))}
            {announcements.length === 0 && (
              <p>No announcements have been published yet.</p>
            )}

          </div>

        </section>


        {/* SCHOOL INFO */}

        <section className="quick-info">

          <div>
            <span>Student ID</span>
            <strong>{student.id}</strong>
          </div>

          <div>
            <span>Grade</span>
            <strong>{student.grade}</strong>
          </div>

          <div>
            <span>Section</span>
            <strong>{student.section}</strong>
          </div>

          <div>
            <span>Roll Number</span>
            <strong>{student.rollNumber}</strong>
          </div>

        </section>

      </main>

    </div>

  );
}

export default Dashboard;