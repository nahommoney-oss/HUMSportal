import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import { readAnnouncements } from "./announcementsStore.js";
import "./announcments.css";

function loadAnnouncements() {
  try {
    return readAnnouncements();
  } catch (error) {
    console.error("Unable to load announcements.", error);
    return [];
  }
}

function Announcements() {
  const [announcements, setAnnouncements] = useState(loadAnnouncements);

  useEffect(() => {
    const refreshAnnouncements = () => setAnnouncements(loadAnnouncements());
    window.addEventListener("focus", refreshAnnouncements);
    window.addEventListener("hums-announcements-updated", refreshAnnouncements);
    window.addEventListener("storage", refreshAnnouncements);
    return () => {
      window.removeEventListener("focus", refreshAnnouncements);
      window.removeEventListener(
        "hums-announcements-updated",
        refreshAnnouncements
      );
      window.removeEventListener("storage", refreshAnnouncements);
    };
  }, []);

  return (
    <div className="portal-layout">
      <Sidebar />

      <main className="announcements-page">
        <div className="page-header">
          <div>
            <p className="page-label">HUMS STUDENT PORTAL</p>
            <h1>Announcements</h1>
            <p>Stay updated with the latest school information.</p>
          </div>
        </div>

        <div className="announcements-list">
          {announcements.length === 0 ? (
            <p>No announcements have been published yet.</p>
          ) : (
            announcements.map((announcement) => (
              <div
                className={`announcement-card ${
                  announcement.important ? "important" : ""
                }`}
                key={announcement.id}
              >
                <div className="announcement-icon">
                  {announcement.important ? "IMPORTANT" : announcement.type}
                </div>

                <div className="announcement-content">
                  <div className="announcement-top">
                    <span className="announcement-type">
                      {announcement.type}
                    </span>

                    {announcement.important && (
                      <span className="important-badge">IMPORTANT</span>
                    )}
                  </div>

                  <h2>{announcement.title}</h2>
                  <p>{announcement.message}</p>

                  <div className="announcement-date">
                    Date: {announcement.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Announcements;