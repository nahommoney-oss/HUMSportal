import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboared.jsx";
import Scores from "./pages/Scores.jsx";
import Schedule from "./data/schedule.jsx";
import Announcements from "./data/announcements.jsx";
import Teachers from "./pages/Teachers.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageStudents from "./pages/ManageStudents.jsx";
import ManageTeachers from "./pages/ManageTeachers.jsx";
import ManageClasses from "./pages/ManageClasses.jsx";
import ManageReports from "./pages/ManageReports.jsx";
import ManageAcademics from "./pages/ManageAcademics.jsx";
import ManageAnnouncements from "./pages/ManageAnnouncements.jsx";
import ManageSchedule from "./pages/ManageSchedule.jsx";

function AdminRoute({ children }) {
  useLocation();
  const isAdmin = localStorage.getItem("humsAdmin") === "true";

  return isAdmin ? children : <Navigate to="/admin-login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <ManageStudents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <AdminRoute>
              <ManageTeachers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <AdminRoute>
              <ManageClasses />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ManageReports />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/academics"
          element={
            <AdminRoute>
              <ManageAcademics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <AdminRoute>
              <ManageAnnouncements />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <AdminRoute>
              <ManageSchedule />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;