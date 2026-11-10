import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function Students() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          👨‍🎓 Students Module
        </h1>

        <p className="page-subtitle">
          Manage student registrations,
          attendance, fees, health records
          and notifications.
        </p>

        <div className="module-grid">

          <Link
            to="/add-student"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                ➕
              </div>

              <h3>
                Add Student
              </h3>

              <p>
                Register new students
              </p>

            </div>
          </Link>


          <Link
            to="/student-list"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📋
              </div>

              <h3>
                Student List
              </h3>

              <p>
                View all students
              </p>

            </div>
          </Link>


          <Link
            to="/search-student"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                🔍
              </div>

              <h3>
                Search Student
              </h3>

              <p>
                Find student records
              </p>

            </div>
          </Link>


          <Link
            to="/student-attendance"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📅
              </div>

              <h3>
                Attendance
              </h3>

              <p>
                Manage daily attendance
              </p>

            </div>
          </Link>


          <Link
            to="/attendance-reports"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📊
              </div>

              <h3>
                Attendance Reports
              </h3>

              <p>
                View attendance history
              </p>

            </div>
          </Link>


          <Link
            to="/fees"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                💰
              </div>

              <h3>
                Fees
              </h3>

              <p>
                Fee management
              </p>

            </div>
          </Link>


          <Link
            to="/health-record"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                🏥
              </div>

              <h3>
                Health Record
              </h3>

              <p>
                Medical information
              </p>

            </div>
          </Link>


          <Link
            to="/id-card"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                🪪
              </div>

              <h3>
                ID Card
              </h3>

              <p>
                Generate student IDs
              </p>

            </div>
          </Link>


          <Link
            to="/student-notifications"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                🔔
              </div>

              <h3>
                Notifications
              </h3>

              <p>
                Student alerts
              </p>

            </div>
          </Link>

        </div>

      </div>

    </Layout>
  );
}

export default Students;