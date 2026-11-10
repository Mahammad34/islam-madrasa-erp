import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function Staff() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>👳 Staff Module</h1>

        <div className="module-grid">

          <Link to="/add-staff" className="link">
            <div className="module-card">
              <div className="module-icon">➕</div>
              <h3>Add Staff</h3>
              <p>Register new staff member</p>
            </div>
          </Link>

          <Link to="/staff-list" className="link">
            <div className="module-card">
              <div className="module-icon">📋</div>
              <h3>Staff List</h3>
              <p>View all staff records</p>
            </div>
          </Link>

          <Link to="/search-staff" className="link">
            <div className="module-card">
              <div className="module-icon">🔍</div>
              <h3>Search Staff</h3>
              <p>Find staff information</p>
            </div>
          </Link>

          <Link to="/staff-attendance" className="link">
            <div className="module-card">
              <div className="module-icon">📅</div>
              <h3>Attendance</h3>
              <p>Manage attendance records</p>
            </div>
          </Link>

          <Link to="/staff-salary-page" className="link">
            <div className="module-card">
              <div className="module-icon">💰</div>
              <h3>Salary</h3>
              <p>Salary management</p>
            </div>
          </Link>

          <Link to="/roles" className="link">
            <div className="module-card">
              <div className="module-icon">🛡️</div>
              <h3>Roles</h3>
              <p>Manage staff roles</p>
            </div>
          </Link>

          <Link to="/leave-management" className="link">
            <div className="module-card">
              <div className="module-icon">🏖️</div>
              <h3>Leave Management</h3>
              <p>Track leave requests</p>
            </div>
          </Link>

          <Link to="/staff-notifications" className="link">
            <div className="module-card">
              <div className="module-icon">🔔</div>
              <h3>Notifications</h3>
              <p>Staff alerts and updates</p>
            </div>
          </Link>

        </div>

      </div>

    </Layout>
  );
}

export default Staff;