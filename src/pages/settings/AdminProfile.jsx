import {
    useEffect,
    useState
} from "react";

import {
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function AdminProfile() {

  const [fullName,
    setFullName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [photoUrl,
    setPhotoUrl] =
    useState("");

  const [designation,
    setDesignation] =
    useState("");

  const [role,
    setRole] =
    useState(
      "Super Admin"
    );

  const [address,
    setAddress] =
    useState("");

  const [joinedDate,
    setJoinedDate] =
    useState("");

  const [savedProfile,
    setSavedProfile] =
    useState(false);
      useEffect(() => {

    fetchProfile();

  }, []);
    const fetchProfile =
    async () => {

      try {

        const profileRef =
          doc(
            db,
            "settings",
            "adminProfile"
          );

        const profileSnap =
          await getDoc(
            profileRef
          );

        if (
          !profileSnap.exists()
        ) {

          return;

        }

        const data =
          profileSnap.data();

        setFullName(
          data.fullName ||
          ""
        );

        setEmail(
          data.email ||
          ""
        );

        setPhone(
          data.phone ||
          ""
        );

        setPhotoUrl(
          data.photoUrl ||
          ""
        );

        setDesignation(
          data.designation ||
          ""
        );

        setRole(
          data.role ||
          "Super Admin"
        );

        setAddress(
          data.address ||
          ""
        );

        setJoinedDate(
          data.joinedDate ||
          ""
        );

        setSavedProfile(
          true
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const saveProfile =
    async () => {

      try {

        await setDoc(
          doc(
            db,
            "settings",
            "adminProfile"
          ),
          {
            fullName,
            email,
            phone,
            photoUrl,
            designation,
            role,
            address,
            joinedDate,
            updatedAt:
              Date.now()
          }
        );

        setSavedProfile(
          true
        );

        alert(
          "Admin Profile Saved Successfully"
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
    

  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          👤 Admin Profile
        </h1>

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              {
                savedProfile
                  ? "✅"
                  : "⚠️"
              }
            </h2>

            <p>
              {
                savedProfile
                  ? "Profile Saved"
                  : "Profile Not Saved"
              }
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {
                fullName
                  ? "👤"
                  : "❌"
              }
            </h2>

            <p>
              Full Name
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {
                role
                  ? "🕌"
                  : "❌"
              }
            </h2>

            <p>
              Role
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {
                phone
                  ? "📞"
                  : "❌"
              }
            </h2>

            <p>
              Contact
            </p>

          </div>

        </div>

        <div className="module-card">

          <h2>
            Administrator Information
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            className="attendance-search"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            className="attendance-search"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="attendance-search"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Designation"
            className="attendance-search"
            value={designation}
            onChange={(e) =>
              setDesignation(
                e.target.value
              )
            }
          />

          <select
            className="attendance-search"
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
          >

            <option>
              Super Admin
            </option>

            <option>
              Admin
            </option>

            <option>
              Accountant
            </option>

            <option>
              Teacher
            </option>

            <option>
              Data Entry Operator
            </option>

          </select>

          <textarea
            placeholder="Address"
            className="attendance-search"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
            rows="3"
          />

          <input
            type="date"
            className="attendance-search"
            value={joinedDate}
            onChange={(e) =>
              setJoinedDate(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Profile Photo URL"
            className="attendance-search"
            value={photoUrl}
            onChange={(e) =>
              setPhotoUrl(
                e.target.value
              )
            }
          />

          {
            photoUrl && (

              <div
                style={{
                  textAlign:
                    "center",
                  marginTop:
                    "20px"
                }}
              >

                <img
                  src={photoUrl}
                  alt="Admin"
                  style={{
                    width:
                      "120px",
                    height:
                      "120px",
                    borderRadius:
                      "50%",
                    objectFit:
                      "cover",
                    border:
                      "2px solid #ddd"
                  }}
                />

              </div>

            )
          }

                    <button
            className="save-all-btn"
            onClick={saveProfile}
          >
            💾 Save Profile
          </button>

        </div>

      </div>

    </Layout>
  );

}

export default AdminProfile;