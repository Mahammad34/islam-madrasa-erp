import "../../App.css";
import Layout from "../../components/Layout";

function ProfilePage() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>👤 Profile</h1>

        <div className="section-card">
          <h3>Name</h3>
          <p>Admin</p>
        </div>

        <div className="section-card">
          <h3>Role</h3>
          <p>Super Admin</p>
        </div>

        <div className="section-card">
          <h3>Email</h3>
          <p>admin@gmail.com</p>
        </div>

        <div className="section-card">
          <h3>Phone</h3>
          <p>9876543210</p>
        </div>

        <div className="section-card">
          <h3>Address</h3>
          <p>Kurnool, Andhra Pradesh</p>
        </div>

        <div className="section-card">
          ✏️ Edit Profile
        </div>

        <div className="section-card">
          🔒 Change Password
        </div>

        <div className="section-card">
          🚪 Logout
        </div>

      </div>

    </Layout>
  );
}

export default ProfilePage;