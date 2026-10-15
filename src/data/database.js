import announcements from "./announcments.js";
import scheduleData from "./schedule.js";
import students from "./students.js";
import teachers from "./teachers.js";

const DATABASE_DEFAULTS = {
  humsStudents: students,
  humsTeachers: teachers,
  humsClasses: [],
  humsAnnouncements: announcements,
  humsSchedule: scheduleData,
};

function shouldInitializeStorage(currentValue, defaultValue) {
  if (currentValue === null) {
    return true;
  }

  try {
    const parsed = JSON.parse(currentValue);

    if (Array.isArray(defaultValue) && Array.isArray(parsed)) {
      return parsed.length === 0 && defaultValue.length > 0;
    }

    if (
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue) &&
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return Object.keys(parsed).length === 0 && Object.keys(defaultValue).length > 0;
    }
  } catch {
    return true;
  }

  return false;
}

function sanitizeDemoStudents(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((student) => {
    const studentId = String(student?.id ?? "").trim();
    return !(
      studentId.toUpperCase() === "HUMS9001" ||
      studentId.toUpperCase() === "HUMS1001" ||
      studentId.toUpperCase().startsWith("HUMS-2025-") ||
      studentId.toUpperCase().startsWith("HUMS_2025_") ||
      studentId.toUpperCase().startsWith("HUMS2025-")
    );
  });
}

const DEMO_TEACHER_IDS = new Set(["t-101", "t-102", "t-103", "t-104", "t-105"]);
const DEMO_CLASS_IDS = new Set(["class-9a", "class-10a", "class-11n"]);
const DEMO_ANNOUNCEMENT_IDS = new Set(["ann-1", "ann-2", "ann-3"]);
const DEMO_SCHEDULE_TEACHERS = new Set([
  "mekdes tadesse",
  "daniel bekele",
  "sofonias haile",
  "aster kassa",
  "getachew bekele",
  "abraham fekadu",
  "berhanu taye",
  "tewodros assefa",
  "mesfin abebe",
  "yohannes tadesse",
  "martha diriba",
  "school mentor",
]);

function removeDemoRecords(key, demoIds) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) {
    return;
  }

  try {
    const records = JSON.parse(storedValue);
    if (!Array.isArray(records)) {
      return;
    }

    const remainingRecords = records.filter(
      (record) => !demoIds.has(String(record?.id ?? "").trim().toLowerCase())
    );
    if (remainingRecords.length !== records.length) {
      localStorage.setItem(key, JSON.stringify(remainingRecords));
    }
  } catch (error) {
    console.error(`Unable to remove demo records from ${key}.`, error);
  }
}

function removeDemoScheduleLessons(schedule) {
  if (Array.isArray(schedule)) {
    const retainedLessons = schedule.filter((lesson) => {
      const teacherName = String(lesson?.teacher ?? "").trim().toLowerCase();
      return !DEMO_SCHEDULE_TEACHERS.has(teacherName);
    });
    const cleanedLessons = retainedLessons
      .map(removeDemoScheduleLessons)
      .filter((lesson) => lesson !== undefined);

    if (cleanedLessons.length === 0) {
      return undefined;
    }

    const changed =
      cleanedLessons.length !== schedule.length ||
      cleanedLessons.some((lesson, index) => lesson !== schedule[index]);
    return changed ? cleanedLessons : schedule;
  }

  if (!schedule || typeof schedule !== "object") {
    return schedule;
  }

  const cleanedSchedule = {};
  let changed = false;
  Object.entries(schedule).forEach(([key, value]) => {
    const cleanedValue = removeDemoScheduleLessons(value);
    if (cleanedValue === undefined) {
      changed = true;
    } else {
      cleanedSchedule[key] = cleanedValue;
      changed ||= cleanedValue !== value;
    }
  });

  if (Object.keys(cleanedSchedule).length === 0) {
    return undefined;
  }
  return changed ? cleanedSchedule : schedule;
}

export function initializeDatabase() {
  if (typeof window === "undefined") {
    return;
  }

  const storedStudents = localStorage.getItem("humsStudents");
  if (storedStudents !== null) {
    try {
      const parsed = JSON.parse(storedStudents);
      if (Array.isArray(parsed)) {
        const sanitized = sanitizeDemoStudents(parsed);
        if (sanitized.length !== parsed.length) {
          localStorage.setItem("humsStudents", JSON.stringify(sanitized));
        }
      }
    } catch {
      localStorage.removeItem("humsStudents");
    }
  }

  if (localStorage.getItem("humsStudent") !== null) {
    localStorage.removeItem("humsStudent");
  }

  localStorage.removeItem("humsAdmin");
  removeDemoRecords("humsTeachers", DEMO_TEACHER_IDS);
  removeDemoRecords("humsClasses", DEMO_CLASS_IDS);
  removeDemoRecords("humsAnnouncements", DEMO_ANNOUNCEMENT_IDS);

  const storedSchedule = localStorage.getItem("humsSchedule");
  if (storedSchedule !== null) {
    try {
      const parsedSchedule = JSON.parse(storedSchedule);
      const cleanedSchedule = removeDemoScheduleLessons(parsedSchedule) ?? {};
      if (JSON.stringify(cleanedSchedule) !== JSON.stringify(parsedSchedule)) {
        localStorage.setItem(
          "humsSchedule",
          JSON.stringify(cleanedSchedule)
        );
      }
    } catch (error) {
      console.error("Unable to remove demo lessons from humsSchedule.", error);
    }
  }

  Object.entries(DATABASE_DEFAULTS).forEach(([key, value]) => {
    const currentValue = localStorage.getItem(key);

    if (key === "humsStudents" || Array.isArray(value) && value.length === 0) {
      if (currentValue === null) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return;
    }

    if (
      key === "humsSchedule" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      if (currentValue === null) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return;
    }

    if (shouldInitializeStorage(currentValue, value)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
}

export default DATABASE_DEFAULTS;
