import { Link } from "react-router-dom";
import "../../App.css";
import Layout from "../../components/Layout";

function Settings() {
  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          ⚙️ Settings
        </h1>

        <div className="module-grid">

          <Link
  to="/madrasa-profile"
  className="link"
>

  <div className="module-card">

    <div className="module-icon">
      🏫
    </div>

    <h3>
      Madrasa Profile
    </h3>

    <p>
      Name, address,
      contact details,
      logo and information
    </p>

  </div>

</Link>

          <Link
  to="/admin-profile"
  className="link"
>

  <div className="module-card">

    <div className="module-icon">
      👤
    </div>

    <h3>
      Admin Profile
    </h3>

    <p>
      Manage administrator
      information
    </p>

  </div>

</Link>

          <div className="module-card">

            <div className="module-icon">
              🔐
            </div>

            <h3>
              Change Password
            </h3>

            <p>
              Update account
              password securely
            </p>

          </div>

          <Link
  to="/backup-restore"
  className="link"
>

  <div className="module-card">

    <div className="module-icon">
      💾
    </div>

    <h3>
      Backup & Restore
    </h3>

    <p>
      Protect your data
    </p>

  </div>

</Link>

          <div className="module-card">

            <div className="module-icon">
              🌐
            </div>

            <h3>
              Language Settings
            </h3>

            <p>
              Configure application
              language preferences
            </p>

          </div>

          <div className="module-card">

            <div className="module-icon">
              ℹ️
            </div>

            <h3>
              App Information
            </h3>

            <p>
              Version, developer
              details and support
            </p>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Settings;