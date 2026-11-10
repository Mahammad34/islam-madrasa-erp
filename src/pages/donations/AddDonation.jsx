import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function AddDonation() {

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigate =
    useNavigate();


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    donorName,
    setDonorName
  ] = useState("");


  const [
    mobileNumber,
    setMobileNumber
  ] = useState("");


  const [
    donationAmount,
    setDonationAmount
  ] = useState("");


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("Cash");


  const [
    purpose,
    setPurpose
  ] = useState("General Donation");


  const [
    donationDate,
    setDonationDate
  ] = useState(
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .split("T")[0];

    }
  );


  const [
    address,
    setAddress
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  // ============================================================
  // PAGE PROCESS STATES
  // ============================================================

  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // PAYMENT METHODS
  // ============================================================

  const paymentMethods = [

    "Cash",

    "UPI",

    "Bank Transfer",

    "Cheque"

  ];


  // ============================================================
  // DONATION PURPOSES
  // ============================================================

  const donationPurposes = [

    "General Donation",

    "Zakat",

    "Sadaqah",

    "Student Support",

    "Food",

    "Education",

    "Construction",

    "Maintenance",

    "Ramadan",

    "Other"

  ];


  // ============================================================
  // GET TODAY DATE
  // ============================================================

  const getTodayDate =
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .split("T")[0];

    };


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      value
    ) => {

      const convertedValue =
        Number(
          value
        );


      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        }
      ).format(

        Number.isFinite(
          convertedValue
        )
          ?
          convertedValue
          :
          0

      );

    };


  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm =
    () => {

      setDonorName("");

      setMobileNumber("");

      setDonationAmount("");

      setPaymentMethod("Cash");

      setPurpose("General Donation");

      setDonationDate(
        getTodayDate()
      );

      setAddress("");

      setDescription("");

      setErrorMessage("");

      setSuccessMessage("");

    };


  // ============================================================
  // VALIDATE MOBILE NUMBER
  // ============================================================

  const isValidMobileNumber =
    (
      mobile
    ) => {

      if (
        !mobile
      ) {

        return true;

      }


      return /^[0-9]{10}$/.test(
        mobile
      );

    };


  // ============================================================
  // SAVE DONATION
  // ============================================================

  const saveDonation =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const cleanDonorName =
        donorName.trim();


      const cleanMobileNumber =
        mobileNumber.trim();


      const cleanAddress =
        address.trim();


      const cleanDescription =
        description.trim();


      const convertedDonationAmount =
        Number(
          donationAmount
        );


      // ========================================================
      // VALIDATION
      // ========================================================

      if (
        !cleanDonorName
      ) {

        setErrorMessage(
          "Please enter the donor name."
        );

        return;

      }


      if (
        !isValidMobileNumber(
          cleanMobileNumber
        )
      ) {

        setErrorMessage(
          "Please enter a valid 10-digit mobile number."
        );

        return;

      }


      if (
        !Number.isFinite(
          convertedDonationAmount
        ) ||
        convertedDonationAmount <= 0
      ) {

        setErrorMessage(
          "Please enter a valid donation amount greater than zero."
        );

        return;

      }


      if (
        !paymentMethod
      ) {

        setErrorMessage(
          "Please select a payment method."
        );

        return;

      }


      if (
        !purpose
      ) {

        setErrorMessage(
          "Please select a donation purpose."
        );

        return;

      }


      if (
        !donationDate
      ) {

        setErrorMessage(
          "Please select the donation date."
        );

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await addDoc(
          collection(
            db,
            "donations"
          ),
          {

            // STANDARD DONATION FIELDS

            donorName:
              cleanDonorName,

            mobileNumber:
              cleanMobileNumber,

            amount:
              convertedDonationAmount,

            paymentMethod,

            purpose,

            donationDate,

            address:
              cleanAddress,

            description:
              cleanDescription,

            createdAt:
              serverTimestamp()

          }
        );


        setSuccessMessage(
          `Donation of ${formatCurrency(
            convertedDonationAmount
          )} from ${cleanDonorName} saved successfully.`
        );


        setDonorName("");

        setMobileNumber("");

        setDonationAmount("");

        setPaymentMethod("Cash");

        setPurpose("General Donation");

        setDonationDate(
          getTodayDate()
        );

        setAddress("");

        setDescription("");

      }
      catch (
        error
      ) {

        console.error(
          "Error saving donation:",
          error
        );


        setErrorMessage(
          "Unable to save the donation. Please check your connection and try again."
        );

      }
      finally {

        setIsSaving(false);

      }

    };


  // ============================================================
  // HANDLE FORM SUBMIT
  // ============================================================

  const handleSubmit =
    (
      event
    ) => {

      event.preventDefault();

      saveDonation();

    };
      // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <Layout>

      <div className="accounts-page">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >

          <div>

            <h1
              style={{
                margin: "0 0 6px"
              }}
            >
              ➕ Add Donation
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Record a new donation received by the Madrasa.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <Link
              to="/donations"
              className="action-btn view-btn"
            >
              ❤️ Donations Module
            </Link>


            <Link
              to="/donation-history"
              className="action-btn view-btn"
            >
              📜 Donation History
            </Link>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              🏠 Dashboard
            </button>

          </div>

        </div>


        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {
          errorMessage && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontWeight: "600"
              }}
            >
              ⚠️ {errorMessage}
            </div>

          )
        }


        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {
          successMessage && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                fontWeight: "600"
              }}
            >
              ✅ {successMessage}
            </div>

          )
        }


        {/* ======================================================
            MAIN CONTENT GRID
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "start"
          }}
        >

          {/* ====================================================
              DONATION FORM
          ==================================================== */}

          <div className="section-card">

            <div
              style={{
                marginBottom: "22px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                ❤️ Donation Information
              </h2>


              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  lineHeight: "1.6"
                }}
              >
                Enter donor and payment information to save the donation record.
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* ==============================================
                    DONOR NAME
                ============================================== */}

                <div>

                  <label>
                    Donor Name *
                  </label>


                  <input
                    type="text"
                    placeholder="Enter donor name"
                    value={donorName}
                    onChange={(event) =>
                      setDonorName(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />

                </div>


                {/* ==============================================
                    MOBILE NUMBER
                ============================================== */}

                <div>

                  <label>
                    Mobile Number
                  </label>


                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(event) => {

                      const mobileValue =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );


                      setMobileNumber(
                        mobileValue
                      );

                    }}
                    disabled={isSaving}
                  />

                </div>


                {/* ==============================================
                    DONATION AMOUNT
                ============================================== */}

                <div>

                  <label>
                    Donation Amount *
                  </label>


                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter donation amount"
                    value={donationAmount}
                    onChange={(event) =>
                      setDonationAmount(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />

                </div>


                {/* ==============================================
                    DONATION DATE
                ============================================== */}

                <div>

                  <label>
                    Donation Date *
                  </label>


                  <input
                    type="date"
                    value={donationDate}
                    onChange={(event) =>
                      setDonationDate(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />

                </div>


                {/* ==============================================
                    PAYMENT METHOD
                ============================================== */}

                <div>

                  <label>
                    Payment Method *
                  </label>


                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  >

                    {
                      paymentMethods.map(
                        (
                          method
                        ) => (

                          <option
                            key={method}
                            value={method}
                          >
                            {method}
                          </option>

                        )
                      )
                    }

                  </select>

                </div>


                {/* ==============================================
                    DONATION PURPOSE
                ============================================== */}

                <div>

                  <label>
                    Donation Purpose *
                  </label>


                  <select
                    value={purpose}
                    onChange={(event) =>
                      setPurpose(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  >

                    {
                      donationPurposes.map(
                        (
                          donationPurpose
                        ) => (

                          <option
                            key={donationPurpose}
                            value={donationPurpose}
                          >
                            {donationPurpose}
                          </option>

                        )
                      )
                    }

                  </select>

                </div>

              </div>


              {/* ================================================
                  ADDRESS
              ================================================ */}

              <div
                style={{
                  marginTop: "18px"
                }}
              >

                <label>
                  Donor Address
                </label>


                <input
                  type="text"
                  placeholder="Enter donor address"
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                />

              </div>


              {/* ================================================
                  DESCRIPTION
              ================================================ */}

              <div
                style={{
                  marginTop: "18px"
                }}
              >

                <label>
                  Description / Notes
                </label>


                <textarea
                  rows="4"
                  placeholder="Enter optional donation details..."
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                  style={{
                    width: "100%",
                    resize: "vertical"
                  }}
                />

              </div>


              {/* ================================================
                  FORM ACTIONS
              ================================================ */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "22px"
                }}
              >

                <button
                  type="submit"
                  className="save-all-btn"
                  disabled={isSaving}
                >
                  {
                    isSaving
                      ?
                      "⏳ Saving Donation..."
                      :
                      "💾 Save Donation"
                  }
                </button>


                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  ↻ Reset Form
                </button>

              </div>

            </form>

          </div>


          {/* ====================================================
              LIVE DONATION PREVIEW
          ==================================================== */}

          <div className="section-card">

            <div
              style={{
                marginBottom: "22px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                👁 Donation Preview
              </h2>


              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Review the donation details before saving.
              </p>

            </div>


            <div
              style={{
                padding: "22px",
                borderRadius: "14px",
                background: "#fdf2f8",
                border: "1px solid #fbcfe8"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "20px"
                }}
              >

                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "14px",
                    background: "#fce7f3",
                    fontSize: "28px",
                    flexShrink: 0
                  }}
                >
                  ❤️
                </div>


                <div>

                  <h3
                    style={{
                      margin: "0 0 5px"
                    }}
                  >
                    {
                      donorName.trim() ||
                      "Donor Name"
                    }
                  </h3>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    {
                      mobileNumber ||
                      "Mobile number not provided"
                    }
                  </p>

                </div>

              </div>


              <div
                style={{
                  padding: "18px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  textAlign: "center"
                }}
              >

                <p
                  style={{
                    margin: "0 0 7px",
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Donation Amount
                </p>


                <h1
                  style={{
                    margin: 0,
                    color: "#be185d"
                  }}
                >
                  {
                    formatCurrency(
                      donationAmount
                    )
                  }
                </h1>

              </div>


              <div
                style={{
                  display: "grid",
                  gap: "12px"
                }}
              >

                <div>
                  <strong>
                    🎯 Purpose:
                  </strong>
                  {" "}
                  {purpose}
                </div>


                <div>
                  <strong>
                    💳 Payment:
                  </strong>
                  {" "}
                  {paymentMethod}
                </div>


                <div>
                  <strong>
                    📅 Date:
                  </strong>
                  {" "}
                  {
                    donationDate ||
                    "Not Selected"
                  }
                </div>


                {
                  address && (

                    <div>
                      <strong>
                        📍 Address:
                      </strong>
                      {" "}
                      {address}
                    </div>

                  )
                }


                {
                  description && (

                    <div>
                      <strong>
                        📝 Notes:
                      </strong>
                      {" "}
                      {description}
                    </div>

                  )
                }

              </div>

            </div>


            {/* ==================================================
                QUICK NAVIGATION
            ================================================== */}

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "20px"
              }}
            >

              <Link
                to="/donation-history"
                className="action-btn view-btn"
              >
                📜 View Donation History
              </Link>


              <Link
                to="/donors-list"
                className="action-btn view-btn"
              >
                👥 View Donors
              </Link>


              <Link
                to="/monthly-donation-report"
                className="action-btn view-btn"
              >
                📊 Monthly Donation Report
              </Link>

            </div>

          </div>

        </div>


        {/* ======================================================
            PAGE INFORMATION
        ====================================================== */}

        <div
          style={{
            padding: "14px 16px",
            marginTop: "24px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            textAlign: "center",
            color: "#64748b",
            lineHeight: "1.7"
          }}
        >
          🕌 Add Donation records Madrasa contributions in Firebase so they can be used across donation history, donor management, reports, and the Accounts module.
        </div>


        {/* ======================================================
            BOTTOM SPACING
        ====================================================== */}

        <div
          style={{
            height: "50px"
          }}
        />

      </div>

    </Layout>

  );

}

export default AddDonation;