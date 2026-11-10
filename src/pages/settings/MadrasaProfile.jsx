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

function MadrasaProfile() {

  const [madrasaName,
    setMadrasaName] =
    useState("");

  const [arabicName,
    setArabicName] =
    useState("");

  const [address,
    setAddress] =
    useState("");

  const [city,
    setCity] =
    useState("");

  const [state,
    setState] =
    useState("");

  const [country,
    setCountry] =
    useState("India");

  const [phone,
    setPhone] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [website,
    setWebsite] =
    useState("");

  const [registrationNumber,
    setRegistrationNumber] =
    useState("");

  const [establishedYear,
    setEstablishedYear] =
    useState("");

  const [principalName,
    setPrincipalName] =
    useState("");

  const [logoUrl,
    setLogoUrl] =
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
          "madrasaProfile"
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

      setMadrasaName(
        data.madrasaName ||
        ""
      );

      setArabicName(
        data.arabicName ||
        ""
      );

      setAddress(
        data.address ||
        ""
      );

      setCity(
        data.city ||
        ""
      );

      setState(
        data.state ||
        ""
      );

      setCountry(
        data.country ||
        "India"
      );

      setPhone(
        data.phone ||
        ""
      );

      setEmail(
        data.email ||
        ""
      );

      setWebsite(
        data.website ||
        ""
      );

      setRegistrationNumber(
        data.registrationNumber ||
        ""
      );

      setEstablishedYear(
        data.establishedYear ||
        ""
      );

      setPrincipalName(
        data.principalName ||
        ""
      );

      setLogoUrl(
        data.logoUrl ||
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
          "madrasaProfile"
        ),
        {
          madrasaName,
          arabicName,
          address,
          city,
          state,
          country,
          phone,
          email,
          website,
          registrationNumber,
          establishedYear,
          principalName,
          logoUrl,
          updatedAt:
            Date.now()
        }
      );

      setSavedProfile(
        true
      );

      alert(
        "Profile Saved Successfully"
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
          🏫 Madrasa Profile
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
                madrasaName
                  ? "🏫"
                  : "❌"
              }
            </h2>

            <p>
              Madrasa Name
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {
                principalName
                  ? "👤"
                  : "❌"
              }
            </h2>

            <p>
              Principal
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
            Madrasa Information
          </h2>

          <input
            type="text"
            placeholder="Madrasa Name"
            className="attendance-search"
            value={madrasaName}
            onChange={(e) =>
              setMadrasaName(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Arabic Name"
            className="attendance-search"
            value={arabicName}
            onChange={(e) =>
              setArabicName(
                e.target.value
              )
            }
          />

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
            type="text"
            placeholder="City"
            className="attendance-search"
            value={city}
            onChange={(e) =>
              setCity(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="State"
            className="attendance-search"
            value={state}
            onChange={(e) =>
              setState(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Country"
            className="attendance-search"
            value={country}
            onChange={(e) =>
              setCountry(
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
            placeholder="Website"
            className="attendance-search"
            value={website}
            onChange={(e) =>
              setWebsite(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Registration Number"
            className="attendance-search"
            value={
              registrationNumber
            }
            onChange={(e) =>
              setRegistrationNumber(
                e.target.value
              )
            }
          />

          <input
            type="number"
            placeholder="Established Year"
            className="attendance-search"
            value={
              establishedYear
            }
            onChange={(e) =>
              setEstablishedYear(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Principal / Moulana Name"
            className="attendance-search"
            value={
              principalName
            }
            onChange={(e) =>
              setPrincipalName(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Logo Image URL"
            className="attendance-search"
            value={logoUrl}
            onChange={(e) =>
              setLogoUrl(
                e.target.value
              )
            }
          />

          {
            logoUrl && (

              <div
                style={{
                  marginTop:
                    "20px",
                  textAlign:
                    "center"
                }}
              >

                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    width:
                      "120px",
                    height:
                      "120px",
                    borderRadius:
                      "10px",
                    objectFit:
                      "cover",
                    border:
                      "1px solid #ddd"
                  }}
                />

              </div>

            )
          }

          <button
            className="save-all-btn"
            onClick={
              saveProfile
            }
          >
            💾 Save Profile
          </button>

        </div>

      </div>

    </Layout>
  );

}

export default MadrasaProfile;
