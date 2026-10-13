import Sidebar from "../components/Sidebar";
import teachers from "../data/teachers";
import "./Teachers.css";

function Teachers() {
  return (
    <div className="portal-layout">
      <Sidebar />

      <main className="teachers-page">
        <div className="teachers-header">
          <div>
            <p className="page-label">HUMS STUDENT PORTAL</p>
            <h1>Our Teachers 👨‍🏫</h1>
            <p>
              Find your teachers, subjects, classrooms and contact information.
            </p>
          </div>

          <div className="teacher-count">
            <strong>{teachers.length}</strong>
            <span>Teachers</span>
          </div>
        </div>

        <div className="teachers-grid">
          {teachers.map((teacher) => (
            <div className="teacher-card" key={teacher.id}>
              <div className="teacher-photo-wrapper">
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="teacher-photo"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=Teacher";
                  }}
                />
              </div>

              <div className="teacher-info">
                <h2>{teacher.name}</h2>

                <p className="teacher-subject">
                  {teacher.subject}
                </p>

                <div className="teacher-details">
                  <div>
                    <span>📞</span>
                    <span>{teacher.phone}</span>
                  </div>

                  <div>
                    <span>🏫</span>
                    <span>{teacher.room}</span>
                  </div>

                  <div>
                    <span>⭐</span>
                    <span>{teacher.experience}</span>
                  </div>
                </div>

                <a
                  href={`tel:${teacher.phone}`}
                  className="contact-teacher"
                >
                  📞 Contact Teacher
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Teachers;