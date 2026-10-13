import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("humsStudent");
    navigate("/");
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <img
          className="logo-box"
          src="/hums-logo.jpg"
          alt="Haramaya University Model School Students Union"
        />

        <div>
          <h2>HUMS</h2>
          <span>Student Portal</span>
        </div>
      </div>

      <div className="sidebar-menu">

        <p className="menu-title">MAIN MENU</p>

        <NavLink to="/dashboard" className="menu-link">
          Dashboard
        </NavLink>

        <NavLink to="/scores" className="menu-link">
          My Scores
        </NavLink>

        <NavLink to="/schedule" className="menu-link">
          Schedule
        </NavLink>

        <NavLink to="/announcements" className="menu-link">
          Announcements
        </NavLink>

        <p className="menu-title">SCHOOL</p>

        <NavLink to="/teachers" className="menu-link">
          Teachers
        </NavLink>

        <NavLink to="/profile" className="menu-link">
          My Profile
        </NavLink>

      </div>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;