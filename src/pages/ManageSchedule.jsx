import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getScheduleLessons,
  readScheduleData,
  saveScheduleLessons,
  SCHEDULE_DAYS,
  SCHEDULE_SLOTS,
} from "../data/scheduleStore.js";
import "./ManageSchedule.css";

const EMPTY_LESSON = { subject: "", teacher: "", room: "" };

function readInitialSchedule() {
  try {
    return { schedule: readScheduleData(), error: "" };
  } catch (error) {
    console.error("Unable to load schedule data.", error);
    return { schedule: {}, error: "Could not load the saved schedule." };
  }
}

function loadFixedLessons(data, selectedGrade, selectedStream, selectedDay) {
  const savedLessons = getScheduleLessons(
    data,
    selectedGrade,
    selectedStream,
    selectedDay
  );
  return SCHEDULE_SLOTS.map((slot, index) => ({
    ...EMPTY_LESSON,
    ...(savedLessons[index] ?? {}),
    time: slot.time,
  }));
}

function ManageSchedule() {
  const [initialState] = useState(readInitialSchedule);
  const [scheduleData, setScheduleData] = useState(initialState.schedule);
  const [grade, setGrade] = useState("9");
  const [stream, setStream] = useState("Natural");
  const [day, setDay] = useState("Monday");
  const [lessons, setLessons] = useState(() =>
    loadFixedLessons(initialState.schedule, "9", "", "Monday")
  );
  const [message, setMessage] = useState(initialState.error);

  const activeStream = ["11", "12"].includes(grade) ? stream : "";

  function loadLessons(data, selectedGrade, selectedStream, selectedDay) {
    setLessons(
      loadFixedLessons(data, selectedGrade, selectedStream, selectedDay)
    );
  }

  useEffect(() => {
    function refreshSchedule() {
      try {
        const currentSchedule = readScheduleData();
        setScheduleData(currentSchedule);
        loadLessons(currentSchedule, grade, activeStream, day);
        setMessage("");
      } catch (error) {
        console.error("Unable to refresh schedule data.", error);
        setMessage("Could not load the saved schedule.");
      }
    }
    window.addEventListener("focus", refreshSchedule);
    window.addEventListener("storage", refreshSchedule);
    window.addEventListener("hums-schedule-updated", refreshSchedule);
    return () => {
      window.removeEventListener("focus", refreshSchedule);
      window.removeEventListener("storage", refreshSchedule);
      window.removeEventListener("hums-schedule-updated", refreshSchedule);
    };
  }, [grade, activeStream, day]);

  function changeSelection(field, value) {
    const nextGrade = field === "grade" ? value : grade;
    const nextStream = field === "stream" ? value : stream;
    const nextDay = field === "day" ? value : day;
    if (field === "grade") setGrade(value);
    if (field === "stream") setStream(value);
    if (field === "day") setDay(value);
    loadLessons(scheduleData, nextGrade, nextStream, nextDay);
    setMessage("");
  }

  function updateLesson(index, field, value) {
    setLessons((current) =>
      current.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [field]: value } : lesson
      )
    );
  }

  function saveLessons(event) {
    event.preventDefault();
    setMessage("");

    const savedLessons = SCHEDULE_SLOTS.map((slot, index) => {
      const lesson = lessons[index];
      return {
        time: slot.time,
        subject: lesson.subject.trim(),
        teacher: lesson.teacher.trim() || "Not assigned",
        room: lesson.room.trim() || "Not assigned",
      };
    });

    try {
      const updatedData = saveScheduleLessons(
        scheduleData,
        grade,
        activeStream,
        day,
        savedLessons
      );
      setScheduleData(updatedData);
      setLessons(savedLessons);
      setMessage("Schedule saved and published to the student portal.");
    } catch (error) {
      console.error("Unable to save schedule.", error);
      setMessage("Could not save the schedule. Check browser storage space.");
    }
  }

  return (
    <main className="manage-schedule-page">
      <Link className="manage-schedule-back" to="/admin">
        ← Back to Dashboard
      </Link>
      <header className="manage-schedule-header">
        <p>SCHOOL ADMINISTRATION</p>
        <h1>Manage Class Schedule</h1>
        <span>Create and update the timetable students see in their portal.</span>
      </header>

      <form className="manage-schedule-card" onSubmit={saveLessons}>
        <div className="schedule-selection">
          <label>
            Grade
            <select
              value={grade}
              onChange={(event) => changeSelection("grade", event.target.value)}
            >
              {["9", "10", "11", "12"].map((item) => (
                <option key={item} value={item}>
                  Grade {item}
                </option>
              ))}
            </select>
          </label>
          {["11", "12"].includes(grade) && (
            <label>
              Stream
              <select
                value={stream}
                onChange={(event) =>
                  changeSelection("stream", event.target.value)
                }
              >
                <option value="Natural">Natural</option>
                <option value="Social">Social</option>
              </select>
            </label>
          )}
          <label>
            Day
            <select
              value={day}
              onChange={(event) => changeSelection("day", event.target.value)}
            >
              {SCHEDULE_DAYS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="manage-schedule-lessons-heading">
          <div>
            <h2>
              Grade {grade}
              {activeStream ? ` · ${activeStream}` : ""} · {day}
            </h2>
            <p>
              Each period is fixed at 40 minutes. Choose a subject for each
              period.
            </p>
          </div>
        </div>

        <div className="manage-schedule-lessons">
          {lessons.map((lesson, index) => (
            <div key={`slot-${index}`}>
              {index === 5 && (
                <div className="schedule-break">
                  <strong>15-minute break · 5:40–5:55</strong>
                  <span>Afternoon periods begin at 7:55</span>
                </div>
              )}
              <div className="manage-schedule-lesson">
                <div className="schedule-fixed-time">
                  <span>{SCHEDULE_SLOTS[index].period}</span>
                  <strong>{SCHEDULE_SLOTS[index].time}</strong>
                </div>
                <label>
                  Subject
                  <input
                    value={lesson.subject}
                    onChange={(event) =>
                      updateLesson(index, "subject", event.target.value)
                    }
                    placeholder="e.g. Mathematics"
                  />
                </label>
                <label>
                  Teacher
                  <input
                    value={lesson.teacher}
                    onChange={(event) =>
                      updateLesson(index, "teacher", event.target.value)
                    }
                    placeholder="Teacher name"
                  />
                </label>
                <label>
                  Room
                  <input
                    value={lesson.room}
                    onChange={(event) =>
                      updateLesson(index, "room", event.target.value)
                    }
                    placeholder="Room number"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <p className="manage-schedule-message" role="status">
            {message}
          </p>
        )}
        <div className="manage-schedule-actions">
          <button className="schedule-save-button" type="submit">
            Save Schedule
          </button>
        </div>
      </form>
    </main>
  );
}

export default ManageSchedule;
