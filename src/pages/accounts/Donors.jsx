import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Donors() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    name,
    setName
  ] = useState("");


  const [
    phone,
    setPhone
  ] = useState("");


  const [
    address,
    setAddress
  ] = useState("");


  const [
    amount,
    setAmount
  ] = useState("");


  const [
    purpose,
    setPurpose
  ] = useState("");


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("Cash");


  const [
    description,
    setDescription
  ] = useState("");


  const [
    date,
    setDate
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


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    donors,
    setDonors
  ] = useState([]);


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    purposeFilter,
    setPurposeFilter
  ] = useState("All");


  const [
    paymentFilter,
    setPaymentFilter
  ] = useState("All");


  const [
    startDate,
    setStartDate
  ] = useState("");


  const [
    endDate,
    setEndDate
  ] = useState("");


  // ============================================================
  // PAGE PROCESS STATES
  // ============================================================

  const [
    isLoading,
    setIsLoading
  ] = useState(true);


  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);


  const [
    deletingDonationId,
    setDeletingDonationId
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // DONATION PURPOSES
  // ============================================================

  const donationPurposes = [

    "Zakat",

    "Sadaqah",

    "Building Fund",

    "Student Sponsorship",

    "Food Donation",

    "Ramadan Donation",

    "General Donation",

    "Other"

  ];


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
  // COMPONENT CLEANUP
  // ============================================================

  useEffect(
    () => {

      isMountedRef.current =
        true;


      return () => {

        isMountedRef.current =
          false;

      };

    },
    []
  );


  // ============================================================
  // NORMALIZE VALUE
  // ============================================================

  const normalizeValue =
    (
      value
    ) => {

      return String(
        value || ""
      )
        .trim()
        .toLowerCase();

    };


  // ============================================================
  // CONVERT VALUE TO NUMBER
  // ============================================================

  const getNumber =
    (
      value
    ) => {

      const convertedValue =
        Number(
          value
        );


      return Number.isFinite(
        convertedValue
      )
        ?
        convertedValue
        :
        0;

    };


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      value
    ) => {

      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        }
      ).format(
        getNumber(
          value
        )
      );

    };


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
  // GET DONATION DATE
  // ============================================================

  const getDonationDate =
    (
      donation
    ) => {

      if (
        donation.createdAt &&
        typeof donation.createdAt.toDate ===
        "function"
      ) {

        return donation.createdAt.toDate();

      }


      if (
        donation.createdAt?.seconds
      ) {

        return new Date(
          donation.createdAt.seconds *
          1000
        );

      }


      if (
        donation.date
      ) {

        const convertedDate =
          new Date(
            `${donation.date}T00:00:00`
          );


        if (
          !Number.isNaN(
            convertedDate.getTime()
          )
        ) {

          return convertedDate;

        }

      }


      return new Date(0);

    };


  // ============================================================
  // FORMAT DONATION DATE
  // ============================================================

  const formatDonationDate =
    (
      donation
    ) => {

      const donationDate =
        getDonationDate(
          donation
        );


      if (
        donationDate.getTime() === 0
      ) {

        return "Date Not Available";

      }


      return donationDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FETCH DONATIONS
  // ============================================================

  const fetchDonors =
    async (
      showRefreshLoader = false
    ) => {

      if (
        showRefreshLoader
      ) {

        setIsRefreshing(true);

      }
      else {

        setIsLoading(true);

      }


      setErrorMessage("");


      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "donations"
            )
          );


        const donationList =
          snapshot.docs.map(
            (
              donationDocument
            ) => ({

              id:
                donationDocument.id,

              ...donationDocument.data(),

              amount:
                getNumber(
                  donationDocument.data().amount
                )

            })
          );


        donationList.sort(
          (
            firstDonation,
            secondDonation
          ) =>

            getDonationDate(
              secondDonation
            ).getTime() -

            getDonationDate(
              firstDonation
            ).getTime()

        );


        if (
          isMountedRef.current
        ) {

          setDonors(
            donationList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading donations:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load donation records. Please check your connection and try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsLoading(false);

          setIsRefreshing(false);

        }

      }

    };


  // ============================================================
  // LOAD DONATIONS
  // ============================================================

  useEffect(
    () => {

      fetchDonors();

    },
    []
  );


  // ============================================================
  // RESET DONATION FORM
  // ============================================================

  const resetDonationForm =
    () => {

      setName("");

      setPhone("");

      setAddress("");

      setAmount("");

      setPurpose("");

      setPaymentMethod("Cash");

      setDescription("");

      setDate(
        getTodayDate()
      );

    };


  // ============================================================
  // SAVE DONATION
  // ============================================================

  const saveDonor =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const trimmedName =
        name.trim();


      const trimmedPhone =
        phone.trim();


      const trimmedAddress =
        address.trim();


      const trimmedDescription =
        description.trim();


      const donationAmount =
        getNumber(
          amount
        );


      if (
        !trimmedName
      ) {

        setErrorMessage(
          "Please enter the donor name."
        );

        return;

      }


      if (
        donationAmount <= 0
      ) {

        setErrorMessage(
          "Please enter a valid donation amount greater than zero."
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
        !date
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

            name:
              trimmedName,

            phone:
              trimmedPhone,

            address:
              trimmedAddress,

            amount:
              donationAmount,

            purpose,

            category:
              purpose,

            paymentMethod,

            description:
              trimmedDescription,

            date,

            createdAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          resetDonationForm();


          setSuccessMessage(
            "Donation saved successfully."
          );


          await fetchDonors();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving donation:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the donation. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsSaving(false);

        }

      }

    };


  // ============================================================
  // DELETE DONATION
  // ============================================================

  const deleteDonor =
    async (
      donation
    ) => {

      if (
        deletingDonationId
      ) {

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete the ${formatCurrency(
            donation.amount
          )} donation from ${
            donation.name ||
            "this donor"
          } permanently?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setDeletingDonationId(
        donation.id
      );

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await deleteDoc(
          doc(
            db,
            "donations",
            donation.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setDonors(
            (
              currentDonors
            ) =>
              currentDonors.filter(
                (
                  currentDonation
                ) =>
                  currentDonation.id !==
                  donation.id
              )
          );


          setSuccessMessage(
            "Donation deleted successfully."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting donation:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the donation. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setDeletingDonationId("");

        }

      }

    };


  // ============================================================
  // FILTER DONATIONS
  // ============================================================

  const filteredDonors =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return donors.filter(
          (
            donation
          ) => {

            const searchableValues =
              [

                donation.name,

                donation.phone,

                donation.address,

                donation.amount,

                donation.purpose,

                donation.paymentMethod,

                donation.description,

                donation.date

              ]
                .map(
                  normalizeValue
                )
                .join(" ");


            const matchesSearch =

              !normalizedSearch ||

              searchableValues.includes(
                normalizedSearch
              );


            const matchesPurpose =

              purposeFilter === "All" ||

              donation.purpose ===
                purposeFilter;


            const matchesPayment =

              paymentFilter === "All" ||

              donation.paymentMethod ===
                paymentFilter;


            const matchesStartDate =

              !startDate ||

              (
                donation.date &&
                donation.date >=
                  startDate
              );


            const matchesEndDate =

              !endDate ||

              (
                donation.date &&
                donation.date <=
                  endDate
              );


            return (

              matchesSearch &&

              matchesPurpose &&

              matchesPayment &&

              matchesStartDate &&

              matchesEndDate

            );

          }
        );

      },
      [
        donors,
        searchTerm,
        purposeFilter,
        paymentFilter,
        startDate,
        endDate
      ]
    );


  // ============================================================
  // DONATION STATISTICS
  // ============================================================

  const donationStatistics =
    useMemo(
      () => {

        const today =
          getTodayDate();


        const todayDonations =
          donors

            .filter(
              (
                donation
              ) =>
                donation.date ===
                today
            )

            .reduce(
              (
                total,
                donation
              ) =>
                total +
                getNumber(
                  donation.amount
                ),
              0
            );


        const totalDonations =
          donors.reduce(
            (
              total,
              donation
            ) =>
              total +
              getNumber(
                donation.amount
              ),
            0
          );


        const filteredTotal =
          filteredDonors.reduce(
            (
              total,
              donation
            ) =>
              total +
              getNumber(
                donation.amount
              ),
            0
          );


        const uniqueDonors =
          new Set(

            donors

              .map(
                (
                  donation
                ) =>
                  normalizeValue(
                    donation.name
                  )
              )

              .filter(
                Boolean
              )

          ).size;


        return {

          todayDonations,

          totalDonations,

          filteredTotal,

          totalRecords:
            donors.length,

          uniqueDonors,

          filteredRecords:
            filteredDonors.length

        };

      },
      [
        donors,
        filteredDonors
      ]
    );


  // ============================================================
  // REFRESH DONATIONS
  // ============================================================

  const refreshDonations =
    async () => {

      setSuccessMessage("");

      await fetchDonors(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setPurposeFilter("All");

      setPaymentFilter("All");

      setStartDate("");

      setEndDate("");

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    purposeFilter !== "All" ||

    paymentFilter !== "All" ||

    Boolean(
      startDate
    ) ||

    Boolean(
      endDate
    );
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
              ❤️ Donors Management
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Record, search, filter, and manage Madrasa donations and donor information.
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
              to="/accounts"
              className="action-btn"
            >
              💰 Accounts Dashboard
            </Link>


            <Link
              to="/monthly-report"
              className="action-btn"
            >
              📊 Monthly Report
            </Link>


            <button
              type="button"
              onClick={refreshDonations}
              disabled={
                isLoading ||
                isRefreshing
              }
            >
              {
                isRefreshing
                  ?
                  "⏳ Refreshing..."
                  :
                  "🔄 Refresh"
              }
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
            LOADING STATE
        ====================================================== */}

        {
          isLoading && (

            <div className="section-card">

              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "54px",
                    marginBottom: "14px"
                  }}
                >
                  ⏳
                </div>


                <h2>
                  Loading Donations...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the latest donation records are loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            MAIN PAGE CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  DONATION SUMMARY CARDS
              ================================================== */}

              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📅
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.todayDonations
                      )
                    }
                  </h2>


                  <p>
                    Today's Donations
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    ❤️
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.totalDonations
                      )
                    }
                  </h2>


                  <p>
                    Total Donations
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    👥
                  </div>


                  <h2>
                    {
                      donationStatistics.uniqueDonors
                    }
                  </h2>


                  <p>
                    Unique Donors
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📄
                  </div>


                  <h2>
                    {
                      donationStatistics.totalRecords
                    }
                  </h2>


                  <p>
                    Donation Records
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    🔍
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.filteredTotal
                      )
                    }
                  </h2>


                  <p>
                    Filtered Donations
                  </p>

                </div>

              </div>


              {/* ==================================================
                  ADD DONATION FORM
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "22px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      ➕ Add Donation
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Record a new donation and donor information.
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: "999px",
                      background: "#fce7f3",
                      color: "#be185d",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    Donation Entry
                  </span>

                </div>


                <div className="form-grid">

                  {/* ============================================
                      DONOR NAME
                  ============================================ */}

                  <div>

                    <label>
                      Donor Name *
                    </label>


                    <input
                      type="text"
                      placeholder="Enter donor name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>


                  {/* ============================================
                      PHONE NUMBER
                  ============================================ */}

                  <div>

                    <label>
                      Phone Number
                    </label>


                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>


                  {/* ============================================
                      ADDRESS
                  ============================================ */}

                  <div>

                    <label>
                      Address
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


                  {/* ============================================
                      DONATION AMOUNT
                  ============================================ */}

                  <div>

                    <label>
                      Donation Amount *
                    </label>


                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter donation amount"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>


                  {/* ============================================
                      DONATION PURPOSE
                  ============================================ */}

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

                      <option value="">
                        Select Purpose
                      </option>


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


                  {/* ============================================
                      PAYMENT METHOD
                  ============================================ */}

                  <div>

                    <label>
                      Payment Method
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


                  {/* ============================================
                      DONATION DATE
                  ============================================ */}

                  <div>

                    <label>
                      Donation Date *
                    </label>


                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>

                </div>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                <div
                  style={{
                    marginTop: "18px"
                  }}
                >

                  <label>
                    Description / Notes
                  </label>


                  <textarea
                    placeholder="Enter optional donation details or notes..."
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                    rows="4"
                    style={{
                      width: "100%",
                      resize: "vertical"
                    }}
                  />

                </div>


                {/* ==================================================
                    FORM ACTIONS
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px"
                  }}
                >

                  <button
                    type="button"
                    className="save-all-btn"
                    onClick={saveDonor}
                    disabled={isSaving}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Saving Donation..."
                        :
                        "❤️ Save Donation"
                    }
                  </button>


                  <button
                    type="button"
                    onClick={resetDonationForm}
                    disabled={isSaving}
                  >
                    ↻ Reset Form
                  </button>

                </div>

              </div>


              {/* ==================================================
                  DONATION RECORDS SECTION HEADER
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  marginBottom: "18px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: "0 0 6px"
                    }}
                  >
                    📄 Donation Records
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Search, filter, review, and manage all recorded Madrasa donations.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#fce7f3",
                    color: "#be185d",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {filteredDonors.length} Records
                </span>

              </div>
                            {/* ==================================================
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      🔍 Search & Filter Donations
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find donation records by donor, phone number, purpose, payment method, or date range.
                    </p>

                  </div>


                  {
                    hasActiveFilters && (

                      <button
                        type="button"
                        onClick={resetFilters}
                      >
                        ✖ Clear Filters
                      </button>

                    )
                  }

                </div>


                <div className="form-grid">

                  {/* ============================================
                      SEARCH
                  ============================================ */}

                  <div>

                    <label>
                      Search Donations
                    </label>


                    <input
                      type="text"
                      placeholder="Search donor, phone, amount or description..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* ============================================
                      PURPOSE FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Donation Purpose
                    </label>


                    <select
                      value={purposeFilter}
                      onChange={(event) =>
                        setPurposeFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Purposes
                      </option>


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


                  {/* ============================================
                      PAYMENT FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Payment Method
                    </label>


                    <select
                      value={paymentFilter}
                      onChange={(event) =>
                        setPaymentFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Payment Methods
                      </option>


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


                  {/* ============================================
                      START DATE
                  ============================================ */}

                  <div>

                    <label>
                      From Date
                    </label>


                    <input
                      type="date"
                      value={startDate}
                      max={
                        endDate ||
                        undefined
                      }
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* ============================================
                      END DATE
                  ============================================ */}

                  <div>

                    <label>
                      To Date
                    </label>


                    <input
                      type="date"
                      value={endDate}
                      min={
                        startDate ||
                        undefined
                      }
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                {/* ==================================================
                    FILTER RESULT INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "18px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    lineHeight: "1.7"
                  }}
                >
                  Showing
                  {" "}
                  <strong>
                    {
                      donationStatistics.filteredRecords
                    }
                  </strong>
                  {" "}
                  of
                  {" "}
                  <strong>
                    {
                      donationStatistics.totalRecords
                    }
                  </strong>
                  {" "}
                  donation records with a total value of
                  {" "}
                  <strong
                    style={{
                      color: "#be185d"
                    }}
                  >
                    {
                      formatCurrency(
                        donationStatistics.filteredTotal
                      )
                    }
                  </strong>
                </div>

              </div>


              {/* ==================================================
                  NO DONATION RECORDS
              ================================================== */}

              {
                donors.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "56px",
                          marginBottom: "14px"
                        }}
                      >
                        ❤️
                      </div>


                      <h2>
                        No Donation Records Yet
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No donations have been recorded yet. Use the Add Donation form above to record the first donation.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                donors.length > 0 &&
                filteredDonors.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "54px",
                          marginBottom: "14px"
                        }}
                      >
                        🔍
                      </div>


                      <h2>
                        No Matching Donations Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No donation records match your current search and filter settings.
                      </p>


                      <button
                        type="button"
                        onClick={resetFilters}
                      >
                        ✖ Clear Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  DONATION RECORDS
              ================================================== */}

              {
                filteredDonors.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredDonors.map(
                        (
                          donation,
                          index
                        ) => {

                          const isDeleting =
                            deletingDonationId ===
                            donation.id;


                          return (

                            <div
                              key={donation.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  filteredDonors.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  DONOR INFORMATION
                              ================================== */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "14px",
                                  flex: "1",
                                  minWidth: "280px"
                                }}
                              >

                                <div
                                  style={{
                                    width: "52px",
                                    height: "52px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "12px",
                                    background: "#fce7f3",
                                    fontSize: "25px",
                                    flexShrink: 0
                                  }}
                                >
                                  👤
                                </div>


                                <div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap",
                                      marginBottom: "7px"
                                    }}
                                  >

                                    <h3
                                      style={{
                                        margin: 0
                                      }}
                                    >
                                      {
                                        donation.name ||
                                        "Unknown Donor"
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background: "#fce7f3",
                                        color: "#be185d",
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      DONATION
                                    </span>

                                  </div>


                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      flexWrap: "wrap",
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >

                                    <span>
                                      🎯 {
                                        donation.purpose ||
                                        donation.category ||
                                        "General Donation"
                                      }
                                    </span>


                                    <span>
                                      💳 {
                                        donation.paymentMethod ||
                                        "Not Available"
                                      }
                                    </span>


                                    <span>
                                      📅 {
                                        formatDonationDate(
                                          donation
                                        )
                                      }
                                    </span>

                                  </div>


                                  {
                                    donation.phone && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px"
                                        }}
                                      >
                                        📞 {donation.phone}
                                      </p>

                                    )
                                  }


                                  {
                                    donation.address && (

                                      <p
                                        style={{
                                          margin: "7px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px"
                                        }}
                                      >
                                        📍 {donation.address}
                                      </p>

                                    )
                                  }


                                  {
                                    donation.description && (

                                      <p
                                        style={{
                                          margin: "7px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {
                                          donation.description
                                        }
                                      </p>

                                    )
                                  }

                                </div>

                              </div>


                              {/* ==================================
                                  DONATION AMOUNT
                              ================================== */}

                              <div
                                style={{
                                  minWidth: "170px",
                                  textAlign: "right"
                                }}
                              >

                                <h2
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#be185d"
                                  }}
                                >
                                  +{
                                    formatCurrency(
                                      donation.amount
                                    )
                                  }
                                </h2>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  Donation Received
                                </p>

                              </div>


                              {/* ==================================
                                  DONATION ACTIONS
                              ================================== */}

                              <div
                                className="student-actions"
                                style={{
                                  margin: 0
                                }}
                              >

                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  disabled={
                                    isDeleting ||
                                    Boolean(
                                      deletingDonationId
                                    )
                                  }
                                  onClick={
                                    () =>
                                      deleteDonor(
                                        donation
                                      )
                                  }
                                >
                                  {
                                    isDeleting
                                      ?
                                      "⏳ Deleting..."
                                      :
                                      "🗑 Delete"
                                  }
                                </button>

                              </div>

                            </div>

                          );

                        }
                      )
                    }

                  </div>

                )
              }


              {/* ==================================================
                  PAGE NAVIGATION ACTIONS
              ================================================== */}

              {
                donors.length > 0 && (

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "20px"
                    }}
                  >

                    <Link
                      to="/accounts"
                      className="action-btn"
                    >
                      💰 Accounts Dashboard
                    </Link>


                    <Link
                      to="/monthly-report"
                      className="action-btn view-btn"
                    >
                      📊 Monthly Report
                    </Link>


                    <Link
                      to="/income-history"
                      className="action-btn"
                    >
                      📈 Income History
                    </Link>


                    <Link
                      to="/expense-history"
                      className="action-btn"
                    >
                      📉 Expense History
                    </Link>

                  </div>

                )
              }


              {/* ==================================================
                  PAGE INFORMATION
              ================================================== */}

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
                🕌 Donors Management keeps a complete record of Madrasa donations and helps administrators track donors, donation purposes, payment methods, dates, and financial contributions.
              </div>

            </>

          )
        }


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

export default Donors;