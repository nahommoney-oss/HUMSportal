
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ManageReports.css";

const STUDENT_KEYS = [
  "humsStudents",
  "students",
  "studentData",
  "schoolStudents",
];

const TEACHER_KEY = "humsTeachers";
const CLASS_KEY = "humsClasses";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readStudents() {
  const key =
    STUDENT_KEYS.find((item) => localStorage.getItem(item) !== null) ||
    STUDENT_KEYS[0];

  return readArray(key);
}

function studentName(student) {
  return (
    student.name ||
    student.fullName ||
    [student.firstName, student.lastName].filter(Boolean).join(" ") ||
    "Unnamed student"
  );
}

function studentId(student) {
  return String(
    student.studentId ?? student.admissionNumber ?? student.id ?? "—"
  );
}

function studentGrade(student) {
  const raw =
    student.grade ?? student.gradeLevel ?? student.classGrade ?? "";

  const match = String(raw).match(/(?:grade\s*)?(9|10|11|12)/i);
  return match ? match[1] : "";
}

function studentSection(student) {
  return String(student.section ?? student.classSection ?? "").trim();
}

function teacherName(teacher) {
  return teacher?.name || teacher?.fullName || "Not assigned";
}

function classIdentifier(classItem) {
  return (
    classItem.className ||
    [
      `Grade ${classItem.grade}`,
      classItem.stream,
      classItem.section,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function downloadCSV(filename, rows) {
  if (!rows.length) {
    alert("There is no data to export.");
    return;
  }

  const csv = rows
    .map((row) =>
      row
        .map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ManageReports() {
  const [students, setStudents] = useState(readStudents);
  const [teachers, setTeachers] = useState(() =>
    readArray(TEACHER_KEY)
  );
  const [classes, setClasses] = useState(() =>
    readArray(CLASS_KEY)
  );

  const [reportType, setReportType] = useState("overview");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [search, setSearch] = useState("");

  function refreshReports() {
    setStudents(readStudents());
    setTeachers(readArray(TEACHER_KEY));
    setClasses(readArray(CLASS_KEY));
  }

  useEffect(() => {
    function handleFocus() {
      refreshReports();
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("hums-records-updated", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("hums-records-updated", handleFocus);
    };
  }, []);

  const teacherById = useMemo(
    () =>
      new Map(
        teachers.map((teacher) => [String(teacher.id), teacher])
      ),
    [teachers]
  );

  function getClassStudents(classItem) {
    return students.filter((student) => {
      if (student.classId != null && String(student.classId) !== "") {
        return String(student.classId) === String(classItem.id);
      }

      const grade = studentGrade(student);
      const section = studentSection(student);
      const studentClassName = String(
        student.className ?? student.class ?? ""
      ).trim();
      const classGrade = String(classItem.grade ?? "")
        .replace(/^grade\s*/i, "")
        .trim();
      const classStream = String(classItem.stream ?? "").trim();
      const matchesStream =
        !["11", "12"].includes(classGrade) ||
        (classStream !== "" &&
          String(student.stream ?? "").trim() === classStream);

      return (
        grade === classGrade &&
        matchesStream &&
        (section.toLowerCase() ===
          String(classItem.section ?? "").toLowerCase() ||
          studentClassName.toLowerCase() ===
            String(classItem.className ?? "").trim().toLowerCase())
      );
    });
  }

  const gradeCounts = ["9", "10", "11", "12"].map((grade) => ({
    grade,
    count: students.filter(
      (student) => studentGrade(student) === grade
    ).length,
  }));

  const assignedClasses = classes.filter(
    (item) => item.teacherId != null && String(item.teacherId) !== ""
  ).length;

  const assignedTeachers = new Set(
    classes
      .filter(
        (item) =>
          item.teacherId != null && String(item.teacherId) !== ""
      )
      .map((item) => String(item.teacherId))
  ).size;

  const filteredStudents = students.filter((student) => {
    const matchesGrade =
      gradeFilter === "all" || studentGrade(student) === gradeFilter;

    const text = [
      studentName(student),
      studentId(student),
      studentGrade(student),
      studentSection(student),
      student.stream,
      student.className,
      student.class,
    ]
      .join(" ")
      .toLowerCase();

    return matchesGrade && text.includes(search.toLowerCase());
  });

  const filteredTeachers = teachers.filter((teacher) =>
    [
      teacher.name,
      teacher.fullName,
      teacher.teacherId,
      teacher.subject,
      teacher.email,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredClasses = classes.filter((item) =>
    [
      classIdentifier(item),
      item.grade,
      item.stream,
      item.section,
      item.academicYear,
      teacherName(teacherById.get(String(item.teacherId))),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function exportCurrentReport() {
    if (reportType === "students") {
      downloadCSV(
        "hums-student-report.csv",
        [
          ["Student ID", "Student Name", "Grade", "Stream", "Section", "Class"],
          ...filteredStudents.map((student) => [
            studentId(student),
            studentName(student),
            studentGrade(student)
              ? `Grade ${studentGrade(student)}`
              : "Not recorded",
            student.stream || "Not applicable",
            studentSection(student) || "Not recorded",
            student.className || student.class || "Not recorded",
          ]),
        ]
      );
      return;
    }

    if (reportType === "teachers") {
      downloadCSV(
        "hums-teacher-report.csv",
        [
          ["Teacher ID", "Teacher Name", "Subject", "Email", "Phone", "Assigned Classes"],
          ...filteredTeachers.map((teacher) => [
            teacher.teacherId || teacher.id,
            teacherName(teacher),
            teacher.subject || "",
            teacher.email || "",
            teacher.phone || "",
            classes
              .filter(
                (item) => String(item.teacherId) === String(teacher.id)
              )
              .map((item) => item.className)
              .join("; ") || "None",
          ]),
        ]
      );
      return;
    }

    if (reportType === "classes") {
      downloadCSV(
        "hums-class-report.csv",
        [
          ["Class Identifier", "Grade", "Stream", "Section", "Academic Year", "Class Teacher", "Number of Students"],
          ...filteredClasses.map((item) => [
            classIdentifier(item),
            item.grade,
            item.stream || "",
            item.section,
            item.academicYear || "",
            teacherName(teacherById.get(String(item.teacherId))),
            getClassStudents(item).length,
          ]),
        ]
      );
      return;
    }

    downloadCSV(
      "hums-school-summary.csv",
      [
        ["Report", "Count"],
        ["Total Students", students.length],
        ...gradeCounts.map((item) => [
          `Grade ${item.grade} Students`,
          item.count,
        ]),
        ["Total Teachers", teachers.length],
        ["Teachers Assigned to Classes", assignedTeachers],
        ["Total Classes", classes.length],
        ["Classes with Assigned Teachers", assignedClasses],
      ]
    );
  }

  return (
    <main className="reports-page">
      <Link className="reports-back-link" to="/admin">
        ← Back to Dashboard
      </Link>

      <header className="reports-header">
        <div>
          <p className="reports-eyebrow">SCHOOL ADMINISTRATION</p>
          <h1>Reports & Analytics</h1>
          <p>
            Review school records and export administrative reports.
          </p>
        </div>

        <div className="reports-header-actions">
          <button
            className="reports-btn reports-btn-secondary"
            onClick={refreshReports}
          >
            Refresh Data
          </button>
          <button
            className="reports-btn reports-btn-primary"
            onClick={() => window.print()}
          >
            Print Report
          </button>
        </div>
      </header>

      <section className="reports-summary">
        <article className="reports-stat">
          <span>Total Students</span>
          <strong>{students.length}</strong>
          <small>Registered student records</small>
        </article>

        <article className="reports-stat">
          <span>Total Teachers</span>
          <strong>{teachers.length}</strong>
          <small>Registered teacher records</small>
        </article>

        <article className="reports-stat">
          <span>Total Classes</span>
          <strong>{classes.length}</strong>
          <small>Created class records</small>
        </article>

        <article className="reports-stat">
          <span>Teacher Assignments</span>
          <strong>{assignedClasses}</strong>
          <small>Classes with a teacher selected</small>
        </article>
      </section>

      <section className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Student Distribution</h2>
            <p>Registered students by grade level.</p>
          </div>
        </div>

        <div className="reports-grade-list">
          {gradeCounts.map((item) => {
            const percentage =
              students.length > 0
                ? (item.count / students.length) * 100
                : 0;

            return (
              <div className="reports-grade-row" key={item.grade}>
                <div className="reports-grade-label">
                  <span>Grade {item.grade}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="reports-bar-track">
                  <div
                    className="reports-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="reports-panel">
        <div className="reports-panel-heading reports-toolbar">
          <div>
            <h2>Detailed Reports</h2>
            <p>
              Select Class Report to view each class identifier and its student count.
            </p>
          </div>

          <button
            className="reports-btn reports-btn-primary"
            onClick={exportCurrentReport}
          >
            Export CSV
          </button>
        </div>

        <div className="reports-filters">
          <label>
            Report Type
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              <option value="overview">School Overview</option>
              <option value="students">Student Report</option>
              <option value="teachers">Teacher Report</option>
              <option value="classes">Class Report</option>
            </select>
          </label>

          {reportType === "students" && (
            <label>
              Grade
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </label>
          )}

          {reportType !== "overview" && (
            <label className="reports-search-label">
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
              />
            </label>
          )}
        </div>

        <div className="reports-table-wrap">
          {reportType === "overview" && (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report Category</th>
                  <th>Records</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Students</td>
                  <td>{students.length}</td>
                  <td>Grades 9–12 distribution available above</td>
                </tr>
                <tr>
                  <td>Teachers</td>
                  <td>{teachers.length}</td>
                  <td>{assignedTeachers} teacher(s) assigned to at least one class</td>
                </tr>
                <tr>
                  <td>Classes</td>
                  <td>{classes.length}</td>
                  <td>{assignedClasses} class(es) with an assigned teacher</td>
                </tr>
              </tbody>
            </table>
          )}

          {reportType === "students" && (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Stream</th>
                  <th>Section</th>
                  <th>Class Identifier</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id ?? student.studentId ?? index}>
                    <td>{studentId(student)}</td>
                    <td>{studentName(student)}</td>
                    <td>
                      {studentGrade(student)
                        ? `Grade ${studentGrade(student)}`
                        : "—"}
                    </td>
                    <td>{student.stream || "—"}</td>
                    <td>{studentSection(student) || "—"}</td>
                    <td>{student.className || student.class || "—"}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="reports-empty">
                      No matching student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {reportType === "teachers" && (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Assigned Classes</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher, index) => {
                  const teacherClasses = classes.filter(
                    (item) =>
                      String(item.teacherId) === String(teacher.id)
                  );

                  return (
                    <tr key={teacher.id ?? index}>
                      <td>{teacher.teacherId || teacher.id}</td>
                      <td>{teacherName(teacher)}</td>
                      <td>{teacher.subject || "—"}</td>
                      <td>
                        {teacherClasses.map((item) => item.className).join(", ") || "None"}
                      </td>
                      <td>{teacher.email || teacher.phone || "—"}</td>
                    </tr>
                  );
                })}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="reports-empty">
                      No matching teacher records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {reportType === "classes" && (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Class Identifier</th>
                  <th>Grade</th>
                  <th>Stream</th>
                  <th>Section</th>
                  <th>Class Teacher</th>
                  <th>Number of Students</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((item) => (
                  <tr key={item.id}>
                    <td>{classIdentifier(item)}</td>
                    <td>Grade {item.grade}</td>
                    <td>{item.stream || "—"}</td>
                    <td>{item.section}</td>
                    <td>
                      {teacherName(teacherById.get(String(item.teacherId)))}
                    </td>
                    <td>{getClassStudents(item).length}</td>
                  </tr>
                ))}
                {filteredClasses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="reports-empty">
                      No matching class records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <footer className="reports-footer">
        Reports reflect records currently saved in this browser.
        Academic marks are managed separately from roster reports.
      </footer>
    </main>
  );
}
