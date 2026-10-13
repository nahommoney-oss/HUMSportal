import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import "./Teachers.css";

function Teachers() {
  const [teachers, setTeachers] = useState(() => {
    try {
      const savedTeachers = JSON.parse(localStorage.getItem("humsTeachers"));
      return Array.isArray(savedTeachers) ? savedTeachers : [];
    } catch (error) {
      console.error("Unable to read saved teacher records.", error);
      return [];
    }
  });

  useEffect(() => {
    function refreshTeachers() {
      try {
        const savedTeachers = JSON.parse(
          localStorage.getItem("humsTeachers")
        );
        setTeachers(Array.isArray(savedTeachers) ? savedTeachers : []);
      } catch (error) {
        console.error("Unable to read saved teacher records.", error);
        setTeachers([]);
      }
    }

    window.addEventListener("focus", refreshTeachers);
    window.addEventListener("hums-records-updated", refreshTeachers);
    return () => {
      window.removeEventListener("focus", refreshTeachers);
      window.removeEventListener("hums-records-updated", refreshTeachers);
    };
  }, []);

  return (
    <div className="portal-layout">
      <Sidebar />

      <main className="teachers-page">
        <header className="teachers-header">
          <div>
            <p className="page-label">HUMS STUDENT PORTAL</p>
            <h1>Our Teachers</h1>
            <p>Find teachers, subjects, classrooms, and contact information.</p>
          </div>

          <div className="teacher-count">
            <strong>{teachers.length}</strong>
            <span>Teachers</span>
          </div>
        </header>

        <section className="teachers-grid" aria-label="Teachers">
          {teachers.map((teacher) => (
            <article className="teacher-card" key={teacher.id}>
              <div className="teacher-photo-wrapper">
                {teacher.photo ? (
                  <>
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="teacher-photo"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextElementSibling.style.display = "grid";
                      }}
                    />
                    <span className="teacher-initial">
                      {teacher.name.charAt(0)}
                    </span>
                  </>
                ) : (
                  <span className="teacher-initial" style={{ display: "grid" }}>
                    {teacher.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="teacher-info">
                <h2>{teacher.name}</h2>
                <p className="teacher-subject">{teacher.subject}</p>

                <div className="teacher-details">
                  {teacher.phone && <span>Phone: {teacher.phone}</span>}
                  {teacher.assignedClass && (
                    <span>Class: {teacher.assignedClass}</span>
                  )}
                  {teacher.email && <span>Email: {teacher.email}</span>}
                </div>
              </div>
            </article>
          ))}
          {teachers.length === 0 && (
            <p className="teachers-empty">
              No teachers have been added by the school yet.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Teachers;
