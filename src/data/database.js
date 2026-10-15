import announcements from "./announcments.js";
import scheduleData from "./schedule.js";
import students from "./students.js";
import teachers from "./teachers.js";

const DATABASE_DEFAULTS = {
  humsStudents: students,
  humsTeachers: teachers,
  humsClasses: [
    {
      id: "class-9a",
      className: "Grade 9 NaturalA",
      grade: "9",
      stream: "Natural",
      section: "A",
      academicYear: "2026/2027",
      teacherId: "T-101",
    },
    {
      id: "class-10a",
      className: "Grade 10 ScienceA",
      grade: "10",
      stream: "Science",
      section: "A",
      academicYear: "2026/2027",
      teacherId: "T-102",
    },
    {
      id: "class-11n",
      className: "Grade 11 NaturalA",
      grade: "11",
      stream: "Natural",
      section: "A",
      academicYear: "2026/2027",
      teacherId: "T-103",
    },
  ],
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

  Object.entries(DATABASE_DEFAULTS).forEach(([key, value]) => {
    const currentValue = localStorage.getItem(key);

    if (key === "humsStudents") {
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
