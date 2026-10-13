import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar.jsx";
import { readLoggedInStudent } from "../data/studentRecords.js";
import { getStudentSubjects } from "../data/curriculum.js";

import "./scores.css";

function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "C+";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getGradeClass(score) {
  if (score >= 85) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "average";
  return "poor";
}

function subjectPercentage(subject) {
  return subject.max
    ? (Number(subject.score) / Number(subject.max)) * 100
    : Number(subject.score);
}

function Scores() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(readLoggedInStudent);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    const refreshStudent = () => setStudent(readLoggedInStudent());
    window.addEventListener("focus", refreshStudent);
    window.addEventListener("storage", refreshStudent);
    window.addEventListener("hums-records-updated", refreshStudent);
    if (!student) {
      navigate("/");
    }
    return () => {
      window.removeEventListener("focus", refreshStudent);
      window.removeEventListener("storage", refreshStudent);
      window.removeEventListener("hums-records-updated", refreshStudent);
    };
  }, [navigate, student]);

  if (!student) {
    return <div className="loading">Loading...</div>;
  }

  const curriculumSubjects = getStudentSubjects(
    student.grade,
    student.stream
  );

  return (
    <div className="portal">
      <Sidebar />

      <main className="scores-page">

        {/* HEADER */}

        <div className="page-header">
          <div>
            <p>Academic Performance</p>
            <h1>My Scores</h1>
          </div>

          <div className="academic-info">
            <span>Grade {student.grade}</span>
            {student.stream && <span>{student.stream}</span>}
            <span>Section {student.section}</span>
          </div>
        </div>


        {/* SUMMARY */}

        <section className="score-summary">

          <div className="summary-card">
            <div className="summary-icon">AVG</div>

            <div>
              <span>Overall Average</span>
              <strong>{student.average ?? "—"}{student.average != null ? "%" : ""}</strong>
            </div>
          </div>


          <div className="summary-card">
            <div className="summary-icon">RANK</div>

            <div>
              <span>Class Rank</span>
              <strong>
                {student.rank ?? "—"}
                {student.totalStudents != null && (
                  <small> / {student.totalStudents}</small>
                )}
              </strong>
            </div>
          </div>


          <div className="summary-card">
            <div className="summary-icon">SUB</div>

            <div>
              <span>Subjects in Program</span>
              <strong>{curriculumSubjects.length || (student.scores ?? []).length}</strong>
            </div>
          </div>

        </section>

        {curriculumSubjects.length > 0 && (
          <section className="scores-card curriculum-card">
            <div className="section-heading">
              <div>
                <h2>Grade {student.grade} {student.stream} Subjects</h2>
                <p>Subjects in your assigned academic stream.</p>
              </div>
            </div>

            <ul className="curriculum-subjects">
              {curriculumSubjects.map((subject) => (
                <li key={subject}>{subject}</li>
              ))}
            </ul>
          </section>
        )}


        {/* SUBJECT PERFORMANCE */}

        <section className="scores-card">

          <div className="section-heading">
            <div>
              <h2>Subject Performance</h2>
              <p>Your current academic results</p>
            </div>
          </div>


          <div className="subject-list">

            {(student.scores ?? []).map((subject) => {

              const percentage = subjectPercentage(subject);
              const grade = getGrade(percentage);
              const gradeClass = getGradeClass(percentage);
              const assessments = subject.assessments ?? [];
              const isExpanded =
                expandedSubjects[subject.subject] ?? assessments.length > 0;

              return (
                <div className="subject-card" key={subject.subject}>
                  <div className="subject-top">
                    <div className="subject-name">
                      <button
                        type="button"
                        className="score-breakdown-toggle"
                        onClick={() =>
                          setExpandedSubjects((current) => ({
                            ...current,
                            [subject.subject]: !current[subject.subject],
                          }))
                        }
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Hide" : "Show"} ${subject.subject} assessment breakdown`}
                      >
                        {isExpanded ? "−" : "+"}
                      </button>
                      <div className={`subject-icon ${gradeClass}`}>
                        {subject.subject.charAt(0)}
                      </div>

                      <div>
                        <h3>{subject.subject}</h3>
                        <span>
                          {assessments.length
                            ? `${assessments.length} assessment${assessments.length === 1 ? "" : "s"} · Tap + to see details`
                            : "Tap + to view score breakdown"}
                        </span>
                      </div>
                    </div>
                    <div className="subject-result">
                      <strong>{subject.score}</strong>
                      <span>/ {subject.max}</span>
                      <div className={`grade-badge ${gradeClass}`}>
                        {grade}
                      </div>
                    </div>
                  </div>
                  <div className="score-progress">
                    <div
                      className={`score-progress-bar ${gradeClass}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, percentage))}%`,
                      }}
                    ></div>
                  </div>
                  {isExpanded && assessments.length > 0 && (
                    <div className="score-breakdown">
                      <h4>Score breakdown</h4>
                      {assessments.map((assessment, assessmentIndex) => (
                        <div
                          className="score-breakdown-row"
                          key={`${subject.subject}-${assessmentIndex}`}
                        >
                          <span>{assessment.name}</span>
                          <strong>
                            {assessment.score} / {assessment.max}
                          </strong>
                        </div>
                      ))}
                      <div className="score-breakdown-row score-breakdown-total">
                        <span>Total</span>
                        <strong>
                          {subject.score} / {subject.max}
                        </strong>
                      </div>
                    </div>
                  )}
                  {isExpanded && assessments.length === 0 && (
                    <div className="score-breakdown">
                      <p className="score-breakdown-empty">
                        Assessment details have not been added for this subject yet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {(student.scores ?? []).length === 0 && (
              <p className="empty-scores">
                No academic results have been recorded yet.
              </p>
            )}

          </div>

        </section>


        {/* REPORT TABLE */}

        <section className="report-card">

          <div className="section-heading">
            <div>
              <h2>Academic Report</h2>
              <p>Detailed subject results</p>
            </div>

            <button
              className="print-button"
              onClick={() => window.print()}
            >
              Print Report
            </button>
          </div>


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Performance</th>
                </tr>
              </thead>

              <tbody>

                {(student.scores ?? []).map((subject, index) => {

                  const percentage = subjectPercentage(subject);
                  const grade = getGrade(percentage);
                  const gradeClass = getGradeClass(percentage);

                  return (
                    <tr key={subject.subject}>

                      <td>{index + 1}</td>

                      <td className="table-subject">
                        {subject.subject}
                      </td>

                      <td>
                        <strong>
                          {subject.score}
                        </strong>
                        <span className="max-score">
                          / {subject.max}
                        </span>
                      </td>

                      <td>
                        {percentage.toFixed(1)}%
                      </td>

                      <td>
                        <span className={`table-grade ${gradeClass}`}>
                          {grade}
                        </span>
                      </td>

                      <td>
                        <span className={`performance ${gradeClass}`}>
                          {percentage >= 85
                            ? "Excellent"
                            : percentage >= 75
                            ? "Good"
                            : percentage >= 60
                            ? "Average"
                            : "Needs Improvement"}
                        </span>
                      </td>

                    </tr>
                  );
                })}
                {(student.scores ?? []).length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-scores">
                      No academic results have been recorded yet.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        <div className="print-score-sheet" aria-hidden="true">
          {(student.scores ?? []).map((subject) => (
            <div className="print-score-row" key={subject.subject}>
              <span>{subject.subject}</span>
              <strong>
                {Number(subjectPercentage(subject).toFixed(1))} / 100
              </strong>
            </div>
          ))}
        </div>

        {/* STUDENT INFORMATION */}

        <section className="student-result-info">

          <div>
            <span>Student</span>
            <strong>{student.name}</strong>
          </div>

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

        </section>

      </main>
    </div>
  );
}

export default Scores;