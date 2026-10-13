import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar.jsx";
import { readLoggedInStudent } from "./studentRecords.js";
import {
  getScheduleLessons,
  readScheduleData,
  SCHEDULE_DAYS,
} from "./scheduleStore.js";

import "./schedule.css";

function Schedule() {
  const navigate = useNavigate();

  const [student] = useState(readLoggedInStudent);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [scheduleData, setScheduleData] = useState(() => {
    try {
      return readScheduleData();
    } catch (error) {
      console.error("Unable to load schedule data.", error);
      return {};
    }
  });

  useEffect(() => {
    function refreshSchedule() {
      try {
        setScheduleData(readScheduleData());
      } catch (error) {
        console.error("Unable to refresh schedule data.", error);
      }
    }
    window.addEventListener("focus", refreshSchedule);
    window.addEventListener("storage", refreshSchedule);
    window.addEventListener("hums-schedule-updated", refreshSchedule);
    if (!student) {
      navigate("/");
    }
    return () => {
      window.removeEventListener("focus", refreshSchedule);
      window.removeEventListener("storage", refreshSchedule);
      window.removeEventListener("hums-schedule-updated", refreshSchedule);
    };
  }, [navigate, student]);

  if (!student) {
    return <div className="loading">Loading...</div>;
  }

  const todaySchedule = getScheduleLessons(
    scheduleData,
    student.grade,
    student.stream,
    selectedDay
  ).filter((lesson) => String(lesson.subject ?? "").trim());

  return (
    <div className="portal">

      <Sidebar />

      <main className="schedule-page">

        {/* HEADER */}

        <div className="page-header">

          <div>
            <p>Academic Timetable</p>

            <h1>
              Class Schedule
            </h1>
          </div>

          <div className="grade-badge">
            Grade {student.grade}
            {student.stream ? ` · ${student.stream}` : ""}
            {` • Section ${student.section}`}
          </div>

        </div>


        {/* DAY SELECTOR */}

        <section className="day-selector">

          {SCHEDULE_DAYS.map((day) => (

            <button
              key={day}
              className={
                selectedDay === day
                  ? "day-button active"
                  : "day-button"
              }
              onClick={() => setSelectedDay(day)}
            >

              <span>
                {day.substring(0, 3)}
              </span>

              {day}

            </button>

          ))}

        </section>


        {/* SCHEDULE */}

        <section className="schedule-card">

          <div className="schedule-heading">

            <div>
              <h2>{selectedDay}</h2>

              <p>
                Grade {student.grade}
                {student.stream ? ` · ${student.stream}` : ""}
                {" • Section "}
                {student.section}
              </p>
            </div>

            <span className="lesson-count">
              {todaySchedule.length} Lessons
            </span>

          </div>


          <div className="lesson-list">

            {todaySchedule.length === 0 ? (
              <p className="empty-schedule">
                No timetable is available for this grade yet.
              </p>
            ) : todaySchedule.map((lesson, index) => (

              <div
                className="lesson"
                key={`${lesson.subject}-${index}`}
              >

                <div className="lesson-time">
                  <strong>{lesson.time}</strong>
                </div>


                <div className="lesson-line">
                  <div className="lesson-dot"></div>
                </div>


                <div className="lesson-content">

                  <div className="lesson-icon">
                    {lesson.subject.charAt(0)}
                  </div>

                  <div>

                    <h3>
                      {lesson.subject}
                    </h3>

                    <p>
                      Teacher: {lesson.teacher}
                    </p>

                    <span>
                      Room: {lesson.room}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* SCHOOL DAY INFO */}

        <section className="schedule-info">

          <div>
            <span>School</span>
            <strong>HUMS</strong>
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
            <span>Student ID</span>
            <strong>{student.id}</strong>
          </div>

        </section>

      </main>

    </div>
  );
}

export default Schedule;