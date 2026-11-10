import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function Reports() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>📊 Reports Module</h1>

        <div className="module-grid">

          <Link
            to="/income-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📈
              </div>

              <h3>
                Income Report
              </h3>

              <p>
                Track income analytics
              </p>

            </div>
          </Link>

          <Link
            to="/expense-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                📉
              </div>

              <h3>
                Expense Report
              </h3>

              <p>
                Monitor expenses
              </p>

            </div>
          </Link>

          <Link
            to="/student-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                👨‍🎓
              </div>

              <h3>
                Student Report
              </h3>

              <p>
                Student statistics
              </p>

            </div>
          </Link>

          <Link
            to="/staff-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                👳
              </div>

              <h3>
                Staff Report
              </h3>

              <p>
                Staff performance data
              </p>

            </div>
          </Link>

          <Link
            to="/accounts-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                💰
              </div>

              <h3>
                Accounts Report
              </h3>

              <p>
                Income, Expenses,
                Donations & Balance
              </p>

            </div>
          </Link>

          <Link
            to="/donation-report"
            className="link"
          >
            <div className="module-card">

              <div className="module-icon">
                ❤️
              </div>

              <h3>
                Donation Report
              </h3>

              <p>
                Donation analytics
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
      Daily Closing Report
    </h3>

    <p>
      End of day summary
      and alerts
    </p>

  </div>
</Link>

        </div>

      </div>

    </Layout>
  );
}

export default Reports;