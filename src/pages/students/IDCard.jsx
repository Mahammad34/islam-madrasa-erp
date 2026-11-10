import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function IDCard() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>🪪 Student ID Cards</h1>

        <Link
          to="/generate-id-card"
          className="link"
        >
          <div className="section-card">
            ➕ Generate ID Card
          </div>
        </Link>

        <Link
          to="/view-id-cards"
          className="link"
        >
          <div className="section-card">
            👀 View ID Cards
          </div>
        </Link>

      </div>

    </Layout>
  );
}

export default IDCard;