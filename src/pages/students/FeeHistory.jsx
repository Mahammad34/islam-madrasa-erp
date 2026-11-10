import "../../App.css";
import Layout from "../../components/Layout";

function FeeHistory() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>📜 Fee History</h1>

        <div className="profile-card">

          <div className="profile-header">

            <div className="profile-avatar">
              💰
            </div>

            <div>
              <h1 className="profile-name">
                Abdul Rahman
              </h1>

              <p>
                Fee Summary
              </p>
            </div>

          </div>

          <div className="fee-stats">

            <div className="fee-box">
              <h2>₹1000</h2>
              <p>Monthly Fee</p>
            </div>

            <div className="fee-box">
              <h2>₹600</h2>
              <p>Paid Amount</p>
            </div>

            <div className="fee-box">
              <h2>₹400</h2>
              <p>Pending Amount</p>
            </div>

          </div>

          <div className="action-buttons">

            <button className="action-btn view-btn">
              📄 View Receipt
            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default FeeHistory;