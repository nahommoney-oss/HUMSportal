import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStudentSubjects } from "../data/curriculum.js";
import { readStudents } from "../data/studentRecords.js";
import "./ManageAcademics.css";

function averageFor(scores) {
  const completedScores = scores
    .filter((score) => score.subject.trim())
    .map((score) => {
      if (!score.assessments?.length) {
        return {
          score: Number(score.score),
          max: Number(score.max),
          complete:
            score.score !== "" &&
            Number.isFinite(Number(score.score)) &&
            Number(score.max) > 0,
        };
      }

      const completedAssessments = score.assessments.filter(
        (assessment) =>
          assessment.name.trim() &&
          assessment.score !== "" &&
          Number.isFinite(Number(assessment.score)) &&
          Number(assessment.max) > 0 &&
          Number(assessment.score) >= 0 &&
          Number(assessment.score) <= Number(assessment.max)
      );
      const totals = completedAssessments.reduce(
        (result, assessment) => ({
          score: result.score + Number(assessment.score),
          max: result.max + Number(assessment.max),
        }),
        { score: 0, max: 0 }
      );
      return {
        ...totals,
        complete: completedAssessments.length > 0,
      };
    })
    .filter(
      (score) =>
        score.complete &&
        Number.isFinite(score.score) &&
        score.max > 0 &&
        score.score >= 0
    );

  if (completedScores.length === 0) {
    return null;
  }

  const average =
    completedScores.reduce(
      (total, score) =>
        total + (Number(score.score) / Number(score.max)) * 100,
      0
    ) / completedScores.length;

  return Math.round(average * 10) / 10;
}

function scoresToForm(scores = []) {
  return scores.map((score) => ({
    subject: score.subject ?? "",
    score: score.score ?? "",
    max: score.max ?? 100,
    assessments: (score.assessments ?? []).map((assessment) => ({
      name: assessment.name ?? "",
      score: assessment.score ?? "",
      max: assessment.max ?? 10,
    })),
  }));
}

function scoreTotals(score) {
  if (!score.assessments?.length) {
    return {
      score: Number(score.score),
      max: Number(score.max),
    };
  }

  return score.assessments.reduce(
    (totals, assessment) => ({
      score: totals.score + Number(assessment.score || 0),
      max: totals.max + Number(assessment.max || 0),
    }),
    { score: 0, max: 0 }
  );
}

function ManageAcademics() {
  const [students, setStudents] = useState(() => {
    try {
      return readStudents();
    } catch (error) {
      console.error("Unable to load student records.", error);
      return [];
    }
  });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");

  const selectedStudent = students.find(
    (student) => String(student.id) === selectedStudentId
  );
  const filteredStudents =
    gradeFilter === "all"
      ? students
      : students.filter((student) => String(student.grade) === gradeFilter);
  const calculatedAverage = useMemo(() => averageFor(scores), [scores]);
  const curriculum = selectedStudent
    ? getStudentSubjects(selectedStudent.grade, selectedStudent.stream)
    : [];

  function selectStudent(studentId) {
    const student = students.find(
      (item) => String(item.id) === String(studentId)
    );
    setSelectedStudentId(studentId);
    setScores(scoresToForm(student?.scores));
    setMessage("");
  }

  function filterByGrade(value) {
    setGradeFilter(value);
    if (
      selectedStudent &&
      value !== "all" &&
      String(selectedStudent.grade) !== value
    ) {
      setSelectedStudentId("");
      setScores([]);
      setMessage("");
    }
  }

  function updateScore(index, field, value) {
    setScores((current) =>
      current.map((score, scoreIndex) =>
        scoreIndex === index ? { ...score, [field]: value } : score
      )
    );
  }

  function updateAssessment(scoreIndex, assessmentIndex, field, value) {
    setScores((current) =>
      current.map((score, currentScoreIndex) =>
        currentScoreIndex === scoreIndex
          ? {
              ...score,
              assessments: score.assessments.map((assessment, currentIndex) =>
                currentIndex === assessmentIndex
                  ? { ...assessment, [field]: value }
                  : assessment
              ),
            }
          : score
      )
    );
  }

  function addAssessment(scoreIndex) {
    setScores((current) =>
      current.map((score, currentScoreIndex) =>
        currentScoreIndex === scoreIndex
          ? {
              ...score,
              assessments: [
                ...score.assessments,
                { name: "Assignment", score: "", max: 10 },
              ],
            }
          : score
      )
    );
  }

  function addSubject(subject = "") {
    setScores((current) => [
      ...current,
      { subject, score: "", max: 100, assessments: [] },
    ]);
  }

  function saveAcademicRecord(event) {
    event.preventDefault();
    setMessage("");

    const completedScores = [];
    const seenSubjects = new Set();

    for (const score of scores) {
      const subject = score.subject.trim();
      const hasAssessmentValues = score.assessments.some(
        (assessment) =>
          assessment.name.trim() ||
          assessment.score !== "" ||
          assessment.max !== ""
      );
      const hasDirectScore = score.score !== "";
      if (!subject && !hasDirectScore && !hasAssessmentValues) {
        continue;
      }
      if (!subject) {
        setMessage("Add a subject name to each score row.");
        return;
      }

      let storedAssessments = [];
      let numericScore;
      let maximum;

      if (hasAssessmentValues) {
        storedAssessments = [];
        for (const assessment of score.assessments) {
          const name = assessment.name.trim();
          const assessmentEmpty =
            !name && assessment.score === "" && assessment.max === "";
          if (assessmentEmpty) {
            continue;
          }
          if (!name || assessment.score === "" || assessment.max === "") {
            setMessage(`Complete or remove each ${subject} assessment row.`);
            return;
          }

          const assessmentScore = Number(assessment.score);
          const assessmentMax = Number(assessment.max);
          if (
            !Number.isFinite(assessmentScore) ||
            !Number.isFinite(assessmentMax) ||
            assessmentMax <= 0 ||
            assessmentScore < 0 ||
            assessmentScore > assessmentMax
          ) {
            setMessage(
              `${name} score must be between 0 and its maximum value.`
            );
            return;
          }

          storedAssessments.push({
            name,
            score: assessmentScore,
            max: assessmentMax,
          });
        }

        if (storedAssessments.length === 0) {
          setMessage(`Add a completed assessment for ${subject}.`);
          return;
        }
        numericScore = storedAssessments.reduce(
          (total, assessment) => total + assessment.score,
          0
        );
        maximum = storedAssessments.reduce(
          (total, assessment) => total + assessment.max,
          0
        );
      } else {
        if (!hasDirectScore || score.max === "") {
          setMessage("Complete or remove each subject row before saving.");
          return;
        }
        numericScore = Number(score.score);
        maximum = Number(score.max);
        if (
          !Number.isFinite(numericScore) ||
          !Number.isFinite(maximum) ||
          maximum <= 0 ||
          numericScore < 0 ||
          numericScore > maximum
        ) {
          setMessage("Scores must be between 0 and their maximum value.");
          return;
        }
      }

      const normalizedSubject = subject.toLowerCase();
      if (seenSubjects.has(normalizedSubject)) {
        setMessage(`"${subject}" is listed more than once.`);
        return;
      }
      seenSubjects.add(normalizedSubject);
      completedScores.push({
        subject,
        score: numericScore,
        max: maximum,
        ...(storedAssessments.length > 0
          ? { assessments: storedAssessments }
          : {}),
      });
    }

    const average = averageFor(completedScores);
    const updatedStudents = students.map((student) =>
      String(student.id) === selectedStudentId
        ? {
            ...student,
            scores: completedScores,
            average,
          }
        : student
    );

    try {
      localStorage.setItem("humsStudents", JSON.stringify(updatedStudents));
      window.dispatchEvent(new Event("hums-records-updated"));
      setStudents(updatedStudents);
      setScores(scoresToForm(completedScores));
      setMessage("Scores saved.");
    } catch (error) {
      console.error("Unable to save academic results.", error);
      setMessage("Could not save the record. Check browser storage space.");
    }
  }

  return (
    <main className="academics-page">
      <Link className="academics-back-link" to="/admin">
        ← Back to Dashboard
      </Link>
      <header className="academics-header">
        <p className="academics-eyebrow">SCHOOL ADMINISTRATION</p>
        <h1>Student Scores</h1>
        <p>Enter and update subject scores and assessment results.</p>
      </header>

      <section className="academics-card">
        <div className="academics-student-filters">
          <label className="academics-grade-filter">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              focusable="false"
              className="academics-filter-icon"
            >
              <path
                d="M4 5h16l-6.2 7.1v5.3l-3.6 1.8v-7.1L4 5Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            Filter students by grade
            <select
              value={gradeFilter}
              onChange={(event) => filterByGrade(event.target.value)}
            >
              <option value="all">All Grades</option>
              {["9", "10", "11", "12"].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </label>
        <label className="academics-student-select">
          Select Student
          <select
            value={selectedStudentId}
            onChange={(event) => selectStudent(event.target.value)}
          >
            <option value="">Choose a student</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={String(student.id)}>
                {student.name} · {student.id} · Grade {student.grade}
                {student.stream ? ` ${student.stream}` : ""}
              </option>
            ))}
          </select>
        </label>
        </div>

        {!selectedStudent && (
          <p className="academics-empty">
            {students.length
              ? filteredStudents.length
                ? "Select a student to manage their academic record."
                : `No students are registered in Grade ${gradeFilter}.`
              : "Add students before entering scores."}
          </p>
        )}
      </section>

      {selectedStudent && (
        <form className="academics-card" onSubmit={saveAcademicRecord}>
          <div className="academics-student-heading">
            <div>
              <h2>{selectedStudent.name}</h2>
              <p>
                {selectedStudent.id} · Grade {selectedStudent.grade}
                {selectedStudent.stream ? ` · ${selectedStudent.stream}` : ""}
                {selectedStudent.section ? ` · Section ${selectedStudent.section}` : ""}
              </p>
            </div>
            <div className="academics-average">
              <span>Calculated Average</span>
              <strong>
                {calculatedAverage == null ? "—" : `${calculatedAverage}%`}
              </strong>
            </div>
          </div>

          {curriculum.length > 0 && (
            <div className="academics-curriculum">
              <p>Curriculum subjects for this stream</p>
              <div>
                {curriculum.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className="academics-chip"
                    onClick={() => addSubject(subject)}
                    disabled={scores.some(
                      (score) =>
                        score.subject.trim().toLowerCase() ===
                        subject.toLowerCase()
                    )}
                  >
                    + {subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="academics-section-title">
            <div>
              <h2>Subject Scores</h2>
              <p>Add assessments like assignments or quizzes; the subject total and average update automatically.</p>
            </div>
            <button
              className="academics-secondary"
              type="button"
              onClick={() => addSubject()}
            >
              Add Subject
            </button>
          </div>

          <div className="academics-score-list">
            {scores.map((score, index) => {
              const hasAssessments = score.assessments.length > 0;
              const totals = scoreTotals(score);
              return (
                <div className="academics-score-row" key={`score-${index}`}>
                  <div className="academics-score-main">
                    <label>
                      Subject
                      <input
                        value={score.subject}
                        onChange={(event) =>
                          updateScore(index, "subject", event.target.value)
                        }
                        placeholder="Subject name"
                      />
                    </label>
                    {hasAssessments ? (
                      <div className="academics-calculated-total">
                        <span>Assessment total</span>
                        <strong>
                          {totals.score} / {totals.max}
                        </strong>
                      </div>
                    ) : (
                      <>
                        <label>
                          Score
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={score.score}
                            onChange={(event) =>
                              updateScore(index, "score", event.target.value)
                            }
                            placeholder="e.g. 85"
                          />
                        </label>
                        <label>
                          Out of
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={score.max}
                            onChange={(event) =>
                              updateScore(index, "max", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}
                    <button
                      type="button"
                      className="academics-secondary"
                      onClick={() => addAssessment(index)}
                    >
                      Add Assessment
                    </button>
                    <button
                      type="button"
                      className="academics-remove"
                      onClick={() =>
                        setScores((current) =>
                          current.filter((_, scoreIndex) => scoreIndex !== index)
                        )
                      }
                      aria-label={`Remove ${score.subject || "subject"} row`}
                    >
                      Remove Subject
                    </button>
                  </div>
                  {hasAssessments && (
                    <div className="academics-assessment-list">
                      {score.assessments.map((assessment, assessmentIndex) => (
                        <div
                          className="academics-assessment-row"
                          key={`assessment-${index}-${assessmentIndex}`}
                        >
                          <label>
                            Assessment
                            <input
                              value={assessment.name}
                              onChange={(event) =>
                                updateAssessment(
                                  index,
                                  assessmentIndex,
                                  "name",
                                  event.target.value
                                )
                              }
                              placeholder="e.g. Assignment"
                            />
                          </label>
                          <label>
                            Score
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={assessment.score}
                              onChange={(event) =>
                                updateAssessment(
                                  index,
                                  assessmentIndex,
                                  "score",
                                  event.target.value
                                )
                              }
                              placeholder="e.g. 5"
                            />
                          </label>
                          <label>
                            Out of
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={assessment.max}
                              onChange={(event) =>
                                updateAssessment(
                                  index,
                                  assessmentIndex,
                                  "max",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="academics-remove"
                            onClick={() =>
                              setScores((current) =>
                                current.map((currentScore, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...currentScore,
                                        assessments:
                                          currentScore.assessments.filter(
                                            (_, itemIndex) =>
                                              itemIndex !== assessmentIndex
                                          ),
                                      }
                                    : currentScore
                                )
                              )
                            }
                            aria-label={`Remove ${assessment.name || "assessment"}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {scores.length === 0 && (
              <p className="academics-empty">
                No subjects added. Choose curriculum subjects above or add one.
              </p>
            )}
          </div>

          {message && (
            <p className="academics-message" role="status">
              {message}
            </p>
          )}

          <div className="academics-save-row">
            <button className="academics-primary" type="submit">
              Save Scores
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default ManageAcademics;
