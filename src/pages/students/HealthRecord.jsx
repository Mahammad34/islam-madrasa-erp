import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function HealthRecord() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>❤️ Health Records</h1>

        <Link to="/add-health-record" className="link">
          <div className="section-card">
            ➕ Add Health Record
          </div>
        </Link>

        <Link to="/health-history" className="link">
          <div className="section-card">
            📋 Health History
          </div>
        </Link>

      </div>

    </Layout>
  );
}

export default HealthRecord;