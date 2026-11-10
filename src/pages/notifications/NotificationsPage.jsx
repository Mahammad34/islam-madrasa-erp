import { Link } from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";

function NotificationsPage() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>🔔 Notifications Dashboard</h1>

        <div className="attendance-summary">

          <div className="summary-card">
            <h2>3</h2>
            <p>Pending Tasks</p>
          </div>

          <div className="summary-card">
            <h2>2</h2>
            <p>Active Notices</p>
          </div>

          <div className="summary-card">
            <h2>1</h2>
            <p>Today's Alerts</p>
          </div>

          <div className="summary-card">
            <h2>🌙</h2>
            <p>Daily Closing Pending</p>
          </div>

        </div>

        <div className="module-grid">

          <Link
            to="/tasks"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📋
              </div>

              <h3>
                Tasks
              </h3>

              <p>
                Manage daily tasks
                and reminders
              </p>

            </div>
          </Link>

          <Link
            to="/notice-board"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📢
              </div>

              <h3>
                Notice Board
              </h3>

              <p>
                View important
                announcements
              </p>

            </div>
          </Link>

          <Link
            to="/daily-closing-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                🌙
              </div>

              <h3>
                Daily Closing
              </h3>

              <p>
                End of day report
                and alerts
              </p>

            </div>
          </Link>

        </div>

        <div className="section-card">

          <h2>
            Recent Activity
          </h2>

          <p>
            👨‍🎓 New student Ahmed Ali
            added
          </p>

          <p>
            ❤️ Donation received
            ₹5,000
          </p>

          <p>
            💰 Staff salary paid
          </p>

          <p>
            📋 Attendance updated
          </p>

          <p>
            📊 Monthly report
            generated
          </p>

        </div>

      </div>

    </Layout>
  );
}

export default NotificationsPage;