import defaultSchedules from "./schedule.js";

export const SCHEDULE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const SCHEDULE_SLOTS = [
  { period: "Morning 1", time: "2:20–3:00" },
  { period: "Morning 2", time: "3:00–3:40" },
  { period: "Morning 3", time: "3:40–4:20" },
  { period: "Morning 4", time: "4:20–5:00" },
  { period: "Morning 5", time: "5:00–5:40" },
  { period: "Afternoon 1", time: "7:55–8:35" },
  { period: "Afternoon 2", time: "8:35–9:15" },
  { period: "Afternoon 3", time: "9:15–9:55" },
];

const SCHEDULE_KEY = "humsSchedule";

export function readScheduleData() {
  const savedSchedule = localStorage.getItem(SCHEDULE_KEY);
  if (savedSchedule === null) {
    return defaultSchedules;
  }

  const scheduleData = JSON.parse(savedSchedule);
  if (!scheduleData || typeof scheduleData !== "object" || Array.isArray(scheduleData)) {
    throw new Error("Saved schedule data must be an object.");
  }

  return scheduleData;
}

export function getScheduleLessons(scheduleData, grade, stream, day) {
  const gradeSchedule = scheduleData[String(grade)] ?? {};
  const isStreamGrade = ["11", "12"].includes(String(grade));
  const daySchedule = isStreamGrade
    ? gradeSchedule[stream] ?? {}
    : gradeSchedule;
  const lessons = daySchedule[day] ?? [];

  if (!Array.isArray(lessons)) {
    return [];
  }

  return SCHEDULE_SLOTS.map((slot, index) => ({
    ...(lessons[index] ?? {}),
    time: slot.time,
  }));
}

export function saveScheduleLessons(scheduleData, grade, stream, day, lessons) {
  const nextScheduleData = { ...scheduleData };
  const gradeKey = String(grade);
  const gradeSchedule = { ...(nextScheduleData[gradeKey] ?? {}) };

  if (["11", "12"].includes(gradeKey)) {
    const streamSchedule = { ...(gradeSchedule[stream] ?? {}) };
    streamSchedule[day] = SCHEDULE_SLOTS.map((slot, index) => ({
      ...lessons[index],
      time: slot.time,
    }));
    gradeSchedule[stream] = streamSchedule;
  } else {
    gradeSchedule[day] = SCHEDULE_SLOTS.map((slot, index) => ({
      ...lessons[index],
      time: slot.time,
    }));
  }

  nextScheduleData[gradeKey] = gradeSchedule;
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(nextScheduleData));
  window.dispatchEvent(new Event("hums-schedule-updated"));
  return nextScheduleData;
}
