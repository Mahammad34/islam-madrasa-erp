import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function Parents() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>👨‍👩‍👧 Parents Module</h1>

        <div className="module-grid">

          <Link to="/add-parent" className="link">
            <div className="module-card">
              <div className="module-icon">➕</div>
              <h3>Add Parent</h3>
              <p>Register parent details</p>
            </div>
          </Link>

          <Link to="/parent-list" className="link">
            <div className="module-card">
              <div className="module-icon">📋</div>
              <h3>Parent List</h3>
              <p>View all parent records</p>
            </div>
          </Link>

          <Link to="/search-parent" className="link">
            <div className="module-card">
              <div className="module-icon">🔍</div>
              <h3>Search Parent</h3>
              <p>Find parent information</p>
            </div>
          </Link>

          <Link to="/student-mapping" className="link">
            <div className="module-card">
              <div className="module-icon">👨‍🎓</div>
              <h3>Student Mapping</h3>
              <p>Link students to parents</p>
            </div>
          </Link>

          <Link to="/parent-notifications" className="link">
            <div className="module-card">
              <div className="module-icon">🔔</div>
              <h3>Notifications</h3>
              <p>Parent alerts and updates</p>
            </div>
          </Link>

          <Link to="/contact-details" className="link">
            <div className="module-card">
              <div className="module-icon">📞</div>
              <h3>Contact Details</h3>
              <p>Parent contact information</p>
            </div>
          </Link>
<Link
  to="/parent-accounts"
  className="link"
>
  <div className="module-card">
    <div className="module-icon">
      👤
    </div>

    <h3>
      Parent Accounts
    </h3>

    <p>
      Create parent login accounts
    </p>
  </div>
</Link>
        </div>

      </div>

    </Layout>
  );
}

export default Parents;