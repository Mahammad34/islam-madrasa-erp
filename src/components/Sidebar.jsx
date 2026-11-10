import { NavLink } from "react-router-dom";
import "../App.css";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="sidebar-logo">

        <div className="logo-icon">
          🕌
        </div>

        <div className="logo-text">
          <h3>MA - MADRASA</h3>
          <p>ERP MANAGEMENT</p>
        </div>

      </div>

      <NavLink to="/dashboard">
        🏠 Dashboard
      </NavLink>

      <NavLink to="/students">
        👨‍🎓 Students
      </NavLink>

      <NavLink to="/staff">
        👳 Staff
      </NavLink>

      <NavLink to="/parents">
        👨‍👩‍👧 Parents
      </NavLink>

      <NavLink to="/accounts">
        💰 Accounts
      </NavLink>

      <NavLink to="/payment-history">
        💳 Payment History
      </NavLink>

      <NavLink to="/donations">
        ❤️ Donations
      </NavLink>

      <NavLink to="/reports">
        📊 Reports
      </NavLink>

      <NavLink to="/settings">
        ⚙️ Settings
      </NavLink>

    </div>
  );
}

export default Sidebar;