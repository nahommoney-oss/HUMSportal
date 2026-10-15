const STUDENT_KEY = "humsStudents";
const LEGACY_STUDENT_KEYS = [
  "students",
  "studentData",
  "schoolStudents",
];
const DEMO_STUDENT_IDS = new Set(["HUMS9001", "HUMS1001"]);
const DEMO_STUDENT_PREFIXES = ["HUMS-2025-", "HUMS_2025_", "HUMS2025-"];

function isDemoStudent(student) {
  const studentId = String(student?.id ?? "").trim();

  if (DEMO_STUDENT_IDS.has(studentId.toUpperCase())) {
    return true;
  }

  return DEMO_STUDENT_PREFIXES.some((prefix) =>
    studentId.toUpperCase().startsWith(prefix.toUpperCase())
  );
}

export function readStudents() {
  const storageKey = [STUDENT_KEY, ...LEGACY_STUDENT_KEYS].find(
    (key) => localStorage.getItem(key) !== null
  );

  if (!storageKey) {
    return [];
  }

  try {
    const savedStudents = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(savedStudents)) {
      return [];
    }

    const students = savedStudents.filter((student) => !isDemoStudent(student));

    if (
      storageKey !== STUDENT_KEY ||
      students.length !== savedStudents.length
    ) {
      localStorage.setItem(STUDENT_KEY, JSON.stringify(students));
    }

    return students;
  } catch (error) {
    console.error("Unable to read saved student records.", error);
    return [];
  }
}

export function readLoggedInStudent() {
  const savedLogin = localStorage.getItem("humsStudent");
  if (!savedLogin) {
    return null;
  }

  try {
    const login = JSON.parse(savedLogin);
    const student = readStudents().find(
      (student) =>
        String(student.id) === String(login.id) &&
        String(student.grade) === String(login.grade)
    );

    return student &&
      String(student.status ?? "Active").toLowerCase() === "active"
      ? student
      : null;
  } catch (error) {
    console.error("Unable to read the active student session.", error);
    return null;
  }
}
