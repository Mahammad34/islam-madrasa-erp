import {
  collection,
  getDocs
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

function Donations() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    donations,
    setDonations
  ] = useState([]);


  // ============================================================
  // PAGE PROCESS STATES
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
    errorMessage,
    setErrorMessage
  ] = useState("");


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
  // GET CURRENT DATE
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
  // GET CURRENT MONTH
  // ============================================================

  const getCurrentMonth =
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
        .slice(0, 7);

    };


  // ============================================================
  // GET DONATION AMOUNT
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
  // GET DONOR NAME
  // SUPPORTS OLD AND NEW RECORDS
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
  // GET DONATION DATE
  // SUPPORTS OLD AND NEW RECORDS
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

        const donationSnapshot =
          await getDocs(
            collection(
              db,
              "donations"
            )
          );


        const donationList =
          donationSnapshot.docs.map(
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


        if (
          isMountedRef.current
        ) {

          setDonations(
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
            "Unable to load donation information. Please check your connection and try again."
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

      fetchDonations();

    },
    []
  );


  // ============================================================
  // DONATION STATISTICS
  // ============================================================

  const donationStatistics =
    useMemo(
      () => {

        const todayDate =
          getTodayDate();


        const currentMonth =
          getCurrentMonth();


        const totalDonations =
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


        const todayDonations =
          donations

            .filter(
              (
                donation
              ) =>

                getDonationDate(
                  donation
                ) ===
                todayDate

            )

            .reduce(
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


        const monthlyDonations =
          donations

            .filter(
              (
                donation
              ) =>

                getDonationDate(
                  donation
                )
                  .slice(
                    0,
                    7
                  ) ===
                currentMonth

            )

            .reduce(
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


        const uniqueDonors =
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

          ).size;


        return {

          totalDonations,

          todayDonations,

          monthlyDonations,

          uniqueDonors,

          totalRecords:
            donations.length

        };

      },
      [
        donations
      ]
    );


  // ============================================================
  // RECENT DONATIONS
  // ============================================================

  const recentDonations =
    useMemo(
      () => {

        return donations.slice(
          0,
          5
        );

      },
      [
        donations
      ]
    );


  // ============================================================
  // REFRESH DONATIONS
  // ============================================================

  const refreshDonations =
    async () => {

      await fetchDonations(
        true
      );

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
              ❤️ Donations Module
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Manage Madrasa donations, donors, campaigns, receipts, and donation reports.
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
              to="/dashboard"
              className="action-btn view-btn"
            >
              🏠 Dashboard
            </Link>


            <Link
              to="/accounts"
              className="action-btn view-btn"
            >
              💰 Accounts
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
                  Please wait while donation information is loaded.
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
                  marginBottom: "28px"
                }}
              >

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
                    📊
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.monthlyDonations
                      )
                    }
                  </h2>


                  <p>
                    This Month
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

              </div>


              {/* ==================================================
                  DONATIONS MODULE HEADER
              ================================================== */}

              <div
                style={{
                  marginBottom: "18px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 6px"
                  }}
                >
                  ⚡ Donation Management
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Access donation records, donor information, campaigns, receipts, and reports.
                </p>

              </div>


              {/* ==================================================
                  MODULE CARDS
              ================================================== */}

              <div className="module-grid">

                <Link
                  to="/add-donation"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      ➕
                    </div>


                    <h3>
                      Add Donation
                    </h3>


                    <p>
                      Record new donation payments
                    </p>

                  </div>

                </Link>


                <Link
                  to="/donation-history"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      📜
                    </div>


                    <h3>
                      Donation History
                    </h3>


                    <p>
                      Search and review donation records
                    </p>

                  </div>

                </Link>


                <Link
                  to="/donors-list"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      👥
                    </div>


                    <h3>
                      Donors List
                    </h3>


                    <p>
                      View and manage donor information
                    </p>

                  </div>

                </Link>


                <Link
                  to="/campaigns"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      🎯
                    </div>


                    <h3>
                      Campaigns
                    </h3>


                    <p>
                      Manage Madrasa fundraising campaigns
                    </p>

                  </div>

                </Link>


                <Link
                  to="/receipts"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      🧾
                    </div>


                    <h3>
                      Receipts
                    </h3>


                    <p>
                      View and generate donation receipts
                    </p>

                  </div>

                </Link>


                <Link
                  to="/monthly-donation-report"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      📊
                    </div>


                    <h3>
                      Monthly Reports
                    </h3>


                    <p>
                      Review donation totals and analytics
                    </p>

                  </div>

                </Link>

              </div>


              {/* ==================================================
                  RECENT DONATIONS HEADER
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  marginTop: "36px",
                  marginBottom: "18px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: "0 0 6px"
                    }}
                  >
                    🕒 Recent Donations
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Latest donation records received by the Madrasa.
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
                  {
                    donationStatistics.totalRecords
                  } Records
                </span>

              </div>


              {/* ==================================================
                  NO DONATIONS
              ================================================== */}

              {
                recentDonations.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
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
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No donation records are available yet. Record the first donation to begin tracking Madrasa contributions.
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


              {/* ==================================================
                  RECENT DONATION RECORDS
              ================================================== */}

              {
                recentDonations.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      recentDonations.map(
                        (
                          donation,
                          index
                        ) => (

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
                                recentDonations.length - 1
                                  ?
                                  "none"
                                  :
                                  "1px solid #e2e8f0"
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
                                  width: "50px",
                                  height: "50px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "12px",
                                  background: "#fce7f3",
                                  fontSize: "24px",
                                  flexShrink: 0
                                }}
                              >
                                ❤️
                              </div>


                              <div>

                                <h3
                                  style={{
                                    margin: "0 0 7px"
                                  }}
                                >
                                  {
                                    getDonorName(
                                      donation
                                    )
                                  }
                                </h3>


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
                                      getDonationDate(
                                        donation
                                      ) ||
                                      "Date Not Available"
                                    }
                                  </span>

                                </div>

                              </div>

                            </div>


                            <div
                              style={{
                                minWidth: "160px",
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
                                    getDonationAmount(
                                      donation
                                    )
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

                          </div>

                        )
                      )
                    }

                  </div>

                )
              }


              {/* ==================================================
                  VIEW ALL DONATIONS
              ================================================== */}

              {
                donationStatistics.totalRecords > 5 && (

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px"
                    }}
                  >

                    <Link
                      to="/donation-history"
                      className="action-btn view-btn"
                    >
                      📜 View All Donations
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
                🕌 Donations Management helps Madrasa administrators record contributions, manage donors and fundraising campaigns, generate receipts, and review donation reports.
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

export default Donations;