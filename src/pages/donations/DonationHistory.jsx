import {
  collection,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function DonationHistory() {

  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    donations,
    setDonations
  ] = useState([]);


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    dateFilter,
    setDateFilter
  ] = useState("");


  const [
    purposeFilter,
    setPurposeFilter
  ] = useState("All");


  const [
    paymentFilter,
    setPaymentFilter
  ] = useState("All");


  // ============================================================
  // PROCESS STATES
  // ============================================================

  const [
    isLoading,
    setIsLoading
  ] = useState(true);


  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);


  const [
    deletingId,
    setDeletingId
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
  // HELPER - NUMBER
  // ============================================================

  const getNumber =
    (
      value
    ) => {

      const number =
        Number(
          value
        );


      return Number.isFinite(
        number
      )
        ?
        number
        :
        0;

    };


  // ============================================================
  // HELPER - DONATION AMOUNT
  // SUPPORTS OLD AND NEW RECORDS
  // ============================================================

  const getDonationAmount =
    (
      donation
    ) => {

      return getNumber(

        donation.amount ??

        donation.donationAmount ??

        0

      );

    };


  // ============================================================
  // HELPER - DONOR NAME
  // ============================================================

  const getDonorName =
    (
      donation
    ) => {

      return (

        donation.donorName ||

        donation.name ||

        "Anonymous Donor"

      );

    };


  // ============================================================
  // HELPER - DONATION DATE
  // ============================================================

  const getDonationDate =
    (
      donation
    ) => {

      return (

        donation.donationDate ||

        donation.date ||

        ""

      );

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
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      date
    ) => {

      if (
        !date
      ) {

        return "Date Not Available";

      }


      const convertedDate =
        new Date(
          `${date}T00:00:00`
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return date;

      }


      return convertedDate.toLocaleDateString(
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

  const fetchDonations =
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

        const querySnapshot =
          await getDocs(
            collection(
              db,
              "donations"
            )
          );


        const donationList =
          querySnapshot.docs.map(
            (
              donationDocument
            ) => ({

              id:
                donationDocument.id,

              ...donationDocument.data()

            })
          );


        donationList.sort(
          (
            firstDonation,
            secondDonation
          ) =>

            String(
              getDonationDate(
                secondDonation
              )
            ).localeCompare(

              String(
                getDonationDate(
                  firstDonation
                )
              )

            )

        );


        setDonations(
          donationList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading donations:",
          error
        );


        setErrorMessage(
          "Unable to load donation history. Please try again."
        );

      }
      finally {

        setIsLoading(false);

        setIsRefreshing(false);

      }

    };


  // ============================================================
  // LOAD DONATIONS
  // ============================================================

  useEffect(
    () => {

      fetchDonations();

    },
    []
  );


  // ============================================================
  // UNIQUE PURPOSES
  // ============================================================

  const purposeOptions =
    useMemo(
      () => {

        return [

          ...new Set(

            donations

              .map(
                (
                  donation
                ) =>

                  donation.purpose

              )

              .filter(
                Boolean
              )

          )

        ].sort();

      },
      [
        donations
      ]
    );


  // ============================================================
  // UNIQUE PAYMENT METHODS
  // ============================================================

  const paymentOptions =
    useMemo(
      () => {

        return [

          ...new Set(

            donations

              .map(
                (
                  donation
                ) =>

                  donation.paymentMethod

              )

              .filter(
                Boolean
              )

          )

        ].sort();

      },
      [
        donations
      ]
    );


  // ============================================================
  // FILTER DONATIONS
  // ============================================================

  const filteredDonations =
    useMemo(
      () => {

        const searchValue =
          searchTerm
            .trim()
            .toLowerCase();


        return donations.filter(
          (
            donation
          ) => {

            const searchableText =
              [

                getDonorName(
                  donation
                ),

                donation.mobileNumber,

                getDonationAmount(
                  donation
                ),

                donation.paymentMethod,

                donation.purpose,

                donation.address,

                donation.description

              ]
                .map(
                  (
                    value
                  ) =>

                    String(
                      value || ""
                    )
                      .toLowerCase()

                )
                .join(" ");


            const matchesSearch =

              !searchValue ||

              searchableText.includes(
                searchValue
              );


            const matchesDate =

              !dateFilter ||

              getDonationDate(
                donation
              ) ===
              dateFilter;


            const matchesPurpose =

              purposeFilter === "All" ||

              donation.purpose ===
              purposeFilter;


            const matchesPayment =

              paymentFilter === "All" ||

              donation.paymentMethod ===
              paymentFilter;


            return (

              matchesSearch &&

              matchesDate &&

              matchesPurpose &&

              matchesPayment

            );

          }
        );

      },
      [
        donations,
        searchTerm,
        dateFilter,
        purposeFilter,
        paymentFilter
      ]
    );


  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics =
    useMemo(
      () => {

        const totalAmount =
          donations.reduce(
            (
              total,
              donation
            ) =>

              total +

              getDonationAmount(
                donation
              ),

            0
          );


        const filteredAmount =
          filteredDonations.reduce(
            (
              total,
              donation
            ) =>

              total +

              getDonationAmount(
                donation
              ),

            0
          );


        const donorNames =
          new Set(

            donations

              .map(
                (
                  donation
                ) =>

                  getDonorName(
                    donation
                  )
                    .trim()
                    .toLowerCase()

              )

              .filter(
                Boolean
              )

          );


        return {

          totalRecords:
            donations.length,

          totalAmount,

          totalDonors:
            donorNames.size,

          filteredRecords:
            filteredDonations.length,

          filteredAmount

        };

      },
      [
        donations,
        filteredDonations
      ]
    );


  // ============================================================
  // DELETE DONATION
  // ============================================================

  const deleteDonation =
    async (
      donation
    ) => {

      const confirmDelete =
        window.confirm(
          `Are you sure you want to delete the donation from ${getDonorName(
            donation
          )} for ${formatCurrency(
            getDonationAmount(
              donation
            )
          )}?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setDeletingId(
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


        setDonations(
          (
            currentDonations
          ) =>

            currentDonations.filter(
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
      catch (
        error
      ) {

        console.error(
          "Error deleting donation:",
          error
        );


        setErrorMessage(
          "Unable to delete the donation. Please try again."
        );

      }
      finally {

        setDeletingId("");

      }

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setDateFilter("");

      setPurposeFilter("All");

      setPaymentFilter("All");

    };


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    Boolean(
      dateFilter
    ) ||

    purposeFilter !== "All" ||

    paymentFilter !== "All";


  // ============================================================
  // REFRESH DATA
  // ============================================================

  const refreshDonations =
    async () => {

      setSuccessMessage("");

      await fetchDonations(
        true
      );

    };
      return (
    <Layout>

      <div className="accounts-page">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >

          <div>
            <h1 style={{ margin: "0 0 6px" }}>
              📜 Donation History
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Search, filter, review, and manage Madrasa donation records.
            </p>
          </div>

          <div
            style={{
              display: "flex",
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
              to="/add-donation"
              className="action-btn view-btn"
            >
              ➕ Add Donation
            </Link>

            <button
              type="button"
              onClick={refreshDonations}
              disabled={isRefreshing}
            >
              {
                isRefreshing
                  ? "⏳ Refreshing..."
                  : "🔄 Refresh"
              }
            </button>

          </div>

        </div>


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


        {
          isLoading ? (

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
                  Loading Donation History...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while donation records are loaded.
                </p>

              </div>

            </div>

          ) : (

            <>

              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">
                  <h2>
                    {statistics.totalRecords}
                  </h2>
                  <p>
                    📜 Total Records
                  </p>
                </div>

                <div className="summary-card">
                  <h2>
                    {
                      formatCurrency(
                        statistics.totalAmount
                      )
                    }
                  </h2>
                  <p>
                    ❤️ Total Donations
                  </p>
                </div>

                <div className="summary-card">
                  <h2>
                    {statistics.totalDonors}
                  </h2>
                  <p>
                    👥 Total Donors
                  </p>
                </div>

                <div className="summary-card">
                  <h2>
                    {
                      formatCurrency(
                        statistics.filteredAmount
                      )
                    }
                  </h2>
                  <p>
                    🔍 Filtered Amount
                  </p>
                </div>

              </div>


              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}
                >

                  <div>
                    <h2 style={{ margin: "0 0 6px" }}>
                      🔍 Search & Filter Donations
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find donation records by donor, mobile number, amount, purpose, payment method, or date.
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

                  <div>
                    <label>
                      Search Donations
                    </label>

                    <input
                      type="text"
                      placeholder="Search donor, mobile, amount or notes..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />
                  </div>


                  <div>
                    <label>
                      Donation Date
                    </label>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(event) =>
                        setDateFilter(
                          event.target.value
                        )
                      }
                    />
                  </div>


                  <div>
                    <label>
                      Purpose
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
                        purposeOptions.map(
                          (purpose) => (

                            <option
                              key={purpose}
                              value={purpose}
                            >
                              {purpose}
                            </option>

                          )
                        )
                      }

                    </select>
                  </div>


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
                        paymentOptions.map(
                          (payment) => (

                            <option
                              key={payment}
                              value={payment}
                            >
                              {payment}
                            </option>

                          )
                        )
                      }

                    </select>
                  </div>

                </div>


                <div
                  style={{
                    marginTop: "18px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b"
                  }}
                >
                  Showing{" "}
                  <strong>
                    {statistics.filteredRecords}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {statistics.totalRecords}
                  </strong>{" "}
                  records with a total value of{" "}
                  <strong>
                    {
                      formatCurrency(
                        statistics.filteredAmount
                      )
                    }
                  </strong>
                </div>

              </div>


              {
                donations.length === 0 && (

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
                        ❤️
                      </div>

                      <h2>
                        No Donations Yet
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No donation records have been saved yet.
                      </p>

                      <Link
                        to="/add-donation"
                        className="action-btn view-btn"
                      >
                        ➕ Add First Donation
                      </Link>

                    </div>

                  </div>

                )
              }


              {
                donations.length > 0 &&
                filteredDonations.length === 0 && (

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
                        No Matching Donations
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No donation records match your current filters.
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


              {
                filteredDonations.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gap: "16px"
                    }}
                  >

                    {
                      filteredDonations.map(
                        (donation) => (

                          <div
                            className="section-card"
                            key={donation.id}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "18px",
                                flexWrap: "wrap"
                              }}
                            >

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "14px",
                                  flex: "1",
                                  minWidth: "250px"
                                }}
                              >

                                <div
                                  style={{
                                    width: "54px",
                                    height: "54px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexShrink: 0,
                                    borderRadius: "14px",
                                    background: "#fce7f3",
                                    fontSize: "26px"
                                  }}
                                >
                                  ❤️
                                </div>


                                <div>

                                  <h2
                                    style={{
                                      margin: "0 0 10px"
                                    }}
                                  >
                                    {
                                      getDonorName(
                                        donation
                                      )
                                    }
                                  </h2>


                                  <div
                                    style={{
                                      display: "grid",
                                      gap: "8px",
                                      color: "#64748b",
                                      fontSize: "14px"
                                    }}
                                  >

                                    <span>
                                      📞 Mobile:{" "}
                                      {
                                        donation.mobileNumber ||
                                        "Not Available"
                                      }
                                    </span>

                                    <span>
                                      🎯 Purpose:{" "}
                                      {
                                        donation.purpose ||
                                        "General Donation"
                                      }
                                    </span>

                                    <span>
                                      💳 Payment:{" "}
                                      {
                                        donation.paymentMethod ||
                                        "Not Available"
                                      }
                                    </span>

                                    <span>
                                      📅 Date:{" "}
                                      {
                                        formatDate(
                                          getDonationDate(
                                            donation
                                          )
                                        )
                                      }
                                    </span>

                                    {
                                      donation.address && (

                                        <span>
                                          📍 Address:{" "}
                                          {donation.address}
                                        </span>

                                      )
                                    }

                                  </div>


                                  {
                                    donation.description && (

                                      <p
                                        style={{
                                          margin: "12px 0 0",
                                          color: "#64748b",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {donation.description}
                                      </p>

                                    )
                                  }

                                </div>

                              </div>


                              <div
                                style={{
                                  minWidth: "190px",
                                  textAlign: "right"
                                }}
                              >

                                <h2
                                  style={{
                                    margin: "0 0 14px",
                                    color: "#be185d"
                                  }}
                                >
                                  {
                                    formatCurrency(
                                      getDonationAmount(
                                        donation
                                      )
                                    )
                                  }
                                </h2>


                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  onClick={() =>
                                    deleteDonation(
                                      donation
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    donation.id
                                  }
                                >
                                  {
                                    deletingId ===
                                    donation.id
                                      ? "⏳ Deleting..."
                                      : "🗑 Delete"
                                  }
                                </button>

                              </div>

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
              }


              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "24px"
                }}
              >

                <Link
                  to="/donations"
                  className="action-btn view-btn"
                >
                  ❤️ Donations Module
                </Link>

                <Link
                  to="/add-donation"
                  className="action-btn view-btn"
                >
                  ➕ Add Donation
                </Link>

                <Link
                  to="/monthly-donation-report"
                  className="action-btn view-btn"
                >
                  📊 Monthly Report
                </Link>

              </div>

            </>

          )
        }


        <div style={{ height: "50px" }} />

      </div>

    </Layout>
  );

}

export default DonationHistory;