const ANNOUNCEMENTS_KEY = "humsAnnouncements";

export function readAnnouncements() {
  const savedAnnouncements = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!savedAnnouncements) {
    return [];
  }

  const announcements = JSON.parse(savedAnnouncements);
  if (!Array.isArray(announcements)) {
    throw new Error("Saved announcements must be a list.");
  }

  return announcements;
}

export function saveAnnouncements(announcements) {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  window.dispatchEvent(new Event("hums-announcements-updated"));
}
