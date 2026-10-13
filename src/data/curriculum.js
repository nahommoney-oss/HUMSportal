const GRADE_11_12_COMMON_SUBJECTS = [
  "Mathematics",
  "English",
  "Agriculture",
  "IT",
  "WDD/CHS",
  "Amharic / Afaan Oromo",
];

const NATURAL_SUBJECTS = [
  ...GRADE_11_12_COMMON_SUBJECTS.slice(0, 2),
  "Biology",
  "Physics",
  "Chemistry",
  ...GRADE_11_12_COMMON_SUBJECTS.slice(2),
];

const SOCIAL_SUBJECTS = [
  ...GRADE_11_12_COMMON_SUBJECTS.filter((subject) => subject !== "WDD/CHS"),
  "History",
  "Geography",
  "Economics",
];

export function getStudentSubjects(grade, stream) {
  if (!["11", "12"].includes(String(grade))) {
    return [];
  }

  if (stream === "Natural") {
    return NATURAL_SUBJECTS;
  }

  if (stream === "Social") {
    return SOCIAL_SUBJECTS;
  }

  return [];
}
