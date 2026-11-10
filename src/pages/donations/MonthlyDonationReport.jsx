import {
  collection,
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

function MonthlyDonationReport() {

  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    donations,
    setDonations
  ] = useState([]);


  // ============================================================
  // FILTER STATE
  // ============================================================

  const [
    selectedMonth,
    setSelectedMonth
  ] = useState(() => {

    const currentDate =
      new Date();

    const year =
      currentDate.getFullYear();

    const month =
      String(
        currentDate.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}`;

  });


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
    errorMessage,
    setErrorMessage
  ] = useState("");


  // ============================================================
  // NUMBER HELPER
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
  // GET DONATION DATE
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
  // GET DONOR NAME
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
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      value
    ) => {

      return new Intl.NumberFormat(
        "en-IN",
        {
          style:
            "currency",

          currency:
            "INR",

          maximumFractionDigits:
            2
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
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "Not Available";

      }


      const convertedDate =
        new Date(
          `${dateValue}T00:00:00`
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return dateValue;

      }


      return convertedDate.toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric"
        }
      );

    };


  // ============================================================
  // FORMAT SELECTED MONTH
  // ============================================================

  const formattedSelectedMonth =
    useMemo(
      () => {

        if (
          !selectedMonth
        ) {

          return "All Months";

        }


        const [
          year,
          month
        ] =
          selectedMonth.split(
            "-"
          );


        const monthDate =
          new Date(
            Number(
              year
            ),
            Number(
              month
            ) - 1,
            1
          );


        return monthDate.toLocaleDateString(
          "en-IN",
          {
            month:
              "long",

            year:
              "numeric"
          }
        );

      },
      [
        selectedMonth
      ]
    );


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

        setIsRefreshing(
          true
        );

      }
      else {

        setIsLoading(
          true
        );

      }


      setErrorMessage(
        ""
      );


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


        setDonations(
          donationList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading monthly donation report:",
          error
        );


        setErrorMessage(
          "Unable to load donation report. Please try again."
        );

      }
      finally {

        setIsLoading(
          false
        );

        setIsRefreshing(
          false
        );

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
  // FILTER DONATIONS BY MONTH
  // ============================================================

  const monthlyDonations =
    useMemo(
      () => {

        if (
          !selectedMonth
        ) {

          return donations;

        }


        return donations.filter(
          (
            donation
          ) => {

            const donationDate =
              getDonationDate(
                donation
              );


            return (

              donationDate &&

              String(
                donationDate
              ).startsWith(
                selectedMonth
              )

            );

          }
        );

      },
      [
        donations,
        selectedMonth
      ]
    );


  // ============================================================
  // MONTHLY STATISTICS
  // ============================================================

  const monthlyStatistics =
    useMemo(
      () => {

        const totalAmount =
          monthlyDonations.reduce(
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


        const totalEntries =
          monthlyDonations.length;


        const averageDonation =

          totalEntries > 0

            ?

            totalAmount /
            totalEntries

            :

            0;


        const highestDonation =

          totalEntries > 0

            ?

            Math.max(

              ...monthlyDonations.map(
                (
                  donation
                ) =>

                  getDonationAmount(
                    donation
                  )

              )

            )

            :

            0;


        const uniqueDonors =
          new Set(

            monthlyDonations.map(
              (
                donation
              ) =>

                getDonorName(
                  donation
                )
                  .trim()
                  .toLowerCase()

            )

          ).size;


        return {

          totalAmount,

          totalEntries,

          averageDonation,

          highestDonation,

          uniqueDonors

        };

      },
      [
        monthlyDonations
      ]
    );


  // ============================================================
  // PAYMENT METHOD BREAKDOWN
  // ============================================================

  const paymentBreakdown =
    useMemo(
      () => {

        const paymentMap =
          {};


        monthlyDonations.forEach(
          (
            donation
          ) => {

            const paymentMethod =

              donation.paymentMethod ||

              "Not Specified";


            if (
              !paymentMap[
                paymentMethod
              ]
            ) {

              paymentMap[
                paymentMethod
              ] = {

                name:
                  paymentMethod,

                entries:
                  0,

                amount:
                  0

              };

            }


            paymentMap[
              paymentMethod
            ].entries += 1;


            paymentMap[
              paymentMethod
            ].amount +=

              getDonationAmount(
                donation
              );

          }
        );


        return Object.values(
          paymentMap
        ).sort(
          (
            firstPayment,
            secondPayment
          ) =>

            secondPayment.amount -

            firstPayment.amount

        );

      },
      [
        monthlyDonations
      ]
    );


  // ============================================================
  // PURPOSE BREAKDOWN
  // ============================================================

  const purposeBreakdown =
    useMemo(
      () => {

        const purposeMap =
          {};


        monthlyDonations.forEach(
          (
            donation
          ) => {

            const purpose =

              donation.purpose ||

              "General Donation";


            if (
              !purposeMap[
                purpose
              ]
            ) {

              purposeMap[
                purpose
              ] = {

                name:
                  purpose,

                entries:
                  0,

                amount:
                  0

              };

            }


            purposeMap[
              purpose
            ].entries += 1;


            purposeMap[
              purpose
            ].amount +=

              getDonationAmount(
                donation
              );

          }
        );


        return Object.values(
          purposeMap
        ).sort(
          (
            firstPurpose,
            secondPurpose
          ) =>

            secondPurpose.amount -

            firstPurpose.amount

        );

      },
      [
        monthlyDonations
      ]
    );


  // ============================================================
  // TOP DONORS
  // ============================================================

  const topDonors =
    useMemo(
      () => {

        const donorMap =
          {};


        monthlyDonations.forEach(
          (
            donation
          ) => {

            const donorName =
              getDonorName(
                donation
              );


            const donorKey =
              donorName
                .trim()
                .toLowerCase();


            if (
              !donorMap[
                donorKey
              ]
            ) {

              donorMap[
                donorKey
              ] = {

                donorName,

                entries:
                  0,

                amount:
                  0

              };

            }


            donorMap[
              donorKey
            ].entries += 1;


            donorMap[
              donorKey
            ].amount +=

              getDonationAmount(
                donation
              );

          }
        );


        return Object.values(
          donorMap
        )
          .sort(
            (
              firstDonor,
              secondDonor
            ) =>

              secondDonor.amount -

              firstDonor.amount

          )
          .slice(
            0,
            5
          );

      },
      [
        monthlyDonations
      ]
    );


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport =
    async () => {

      await fetchDonations(
        true
      );

    };


  // ============================================================
  // RESET TO CURRENT MONTH
  // ============================================================

  const resetToCurrentMonth =
    () => {

      const currentDate =
        new Date();


      const year =
        currentDate.getFullYear();


      const month =
        String(
          currentDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      setSelectedMonth(
        `${year}-${month}`
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
              📊 Monthly Donation Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              View monthly donation statistics, donors, purposes, and payment details.
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


            <button
              type="button"
              onClick={refreshReport}
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
                  Loading Monthly Report...
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

          ) : (

            <>

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
                    alignItems: "flex-end",
                    gap: "16px",
                    flexWrap: "wrap"
                  }}
                >

                  <div
                    style={{
                      flex: "1",
                      minWidth: "250px"
                    }}
                  >

                    <label>
                      Select Report Month
                    </label>

                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) =>
                        setSelectedMonth(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <button
                    type="button"
                    onClick={resetToCurrentMonth}
                  >
                    📅 Current Month
                  </button>

                </div>


                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <strong>
                    📊 Report Period:{" "}
                    {formattedSelectedMonth}
                  </strong>

                </div>

              </div>


              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        monthlyStatistics.totalAmount
                      )
                    }
                  </h2>

                  <p>
                    💰 Total Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {monthlyStatistics.totalEntries}
                  </h2>

                  <p>
                    ❤️ Donation Entries
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        monthlyStatistics.averageDonation
                      )
                    }
                  </h2>

                  <p>
                    📊 Average Donation
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        monthlyStatistics.highestDonation
                      )
                    }
                  </h2>

                  <p>
                    🏆 Highest Donation
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {monthlyStatistics.uniqueDonors}
                  </h2>

                  <p>
                    👥 Unique Donors
                  </p>

                </div>

              </div>


              {
                monthlyDonations.length === 0 ? (

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
                        📊
                      </div>

                      <h2>
                        No Donations Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No donation records were found for {formattedSelectedMonth}.
                      </p>


                      <Link
                        to="/add-donation"
                        className="action-btn view-btn"
                      >
                        ➕ Add Donation
                      </Link>

                    </div>

                  </div>

                ) : (

                  <>

                    <div
                      className="module-grid"
                      style={{
                        marginBottom: "24px"
                      }}
                    >

                      <div className="section-card">

                        <h2 style={{ marginTop: 0 }}>
                          💳 Payment Methods
                        </h2>

                        <p style={{ color: "#64748b" }}>
                          Donation collection by payment method.
                        </p>


                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                            marginTop: "20px"
                          }}
                        >

                          {
                            paymentBreakdown.map(
                              (payment) => (

                                <div
                                  key={payment.name}
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0"
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: "12px",
                                      flexWrap: "wrap"
                                    }}
                                  >

                                    <strong>
                                      {payment.name}
                                    </strong>

                                    <strong>
                                      {
                                        formatCurrency(
                                          payment.amount
                                        )
                                      }
                                    </strong>

                                  </div>


                                  <p
                                    style={{
                                      margin: "7px 0 0",
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >
                                    {payment.entries} donation(s)
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>


                      <div className="section-card">

                        <h2 style={{ marginTop: 0 }}>
                          🎯 Donation Purposes
                        </h2>

                        <p style={{ color: "#64748b" }}>
                          Donations grouped by their purpose.
                        </p>


                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                            marginTop: "20px"
                          }}
                        >

                          {
                            purposeBreakdown.map(
                              (purpose) => (

                                <div
                                  key={purpose.name}
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0"
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: "12px",
                                      flexWrap: "wrap"
                                    }}
                                  >

                                    <strong>
                                      {purpose.name}
                                    </strong>

                                    <strong>
                                      {
                                        formatCurrency(
                                          purpose.amount
                                        )
                                      }
                                    </strong>

                                  </div>


                                  <p
                                    style={{
                                      margin: "7px 0 0",
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >
                                    {purpose.entries} donation(s)
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>

                    </div>


                    <div
                      className="section-card"
                      style={{
                        marginBottom: "24px"
                      }}
                    >

                      <h2 style={{ marginTop: 0 }}>
                        🏆 Top Donors
                      </h2>

                      <p style={{ color: "#64748b" }}>
                        Highest contributors during {formattedSelectedMonth}.
                      </p>


                      <div
                        style={{
                          display: "grid",
                          gap: "12px",
                          marginTop: "20px"
                        }}
                      >

                        {
                          topDonors.map(
                            (
                              donor,
                              index
                            ) => (

                              <div
                                key={`${donor.donorName}-${index}`}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "16px",
                                  flexWrap: "wrap",
                                  padding: "15px",
                                  borderRadius: "10px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0"
                                }}
                              >

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px"
                                  }}
                                >

                                  <div
                                    style={{
                                      width: "42px",
                                      height: "42px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "50%",
                                      background: "#fef3c7",
                                      fontWeight: "800"
                                    }}
                                  >
                                    {index + 1}
                                  </div>


                                  <div>

                                    <strong>
                                      {donor.donorName}
                                    </strong>

                                    <p
                                      style={{
                                        margin: "4px 0 0",
                                        color: "#64748b",
                                        fontSize: "13px"
                                      }}
                                    >
                                      {donor.entries} donation(s)
                                    </p>

                                  </div>

                                </div>


                                <h3
                                  style={{
                                    margin: 0,
                                    color: "#15803d"
                                  }}
                                >
                                  {
                                    formatCurrency(
                                      donor.amount
                                    )
                                  }
                                </h3>

                              </div>

                            )
                          )
                        }

                      </div>

                    </div>


                    <div className="attendance-table-container">

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                          marginBottom: "20px"
                        }}
                      >

                        <div>

                          <h2 style={{ margin: "0 0 5px" }}>
                            📜 Monthly Donation Transactions
                          </h2>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            All donations received during {formattedSelectedMonth}.
                          </p>

                        </div>


                        <strong>
                          {monthlyDonations.length} Records
                        </strong>

                      </div>


                      <table className="attendance-table">

                        <thead>

                          <tr>

                            <th>
                              Donor
                            </th>

                            <th>
                              Amount
                            </th>

                            <th>
                              Payment
                            </th>

                            <th>
                              Purpose
                            </th>

                            <th>
                              Date
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          {
                            monthlyDonations.map(
                              (donation) => (

                                <tr key={donation.id}>

                                  <td>
                                    {
                                      getDonorName(
                                        donation
                                      )
                                    }
                                  </td>


                                  <td>
                                    <strong>
                                      {
                                        formatCurrency(
                                          getDonationAmount(
                                            donation
                                          )
                                        )
                                      }
                                    </strong>
                                  </td>


                                  <td>
                                    {
                                      donation.paymentMethod ||
                                      "Not Specified"
                                    }
                                  </td>


                                  <td>
                                    {
                                      donation.purpose ||
                                      "General Donation"
                                    }
                                  </td>


                                  <td>
                                    {
                                      formatDate(
                                        getDonationDate(
                                          donation
                                        )
                                      )
                                    }
                                  </td>

                                </tr>

                              )
                            )
                          }

                        </tbody>

                      </table>

                    </div>

                  </>

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
                  to="/donation-history"
                  className="action-btn view-btn"
                >
                  📜 Donation History
                </Link>


                <Link
                  to="/donors-list"
                  className="action-btn view-btn"
                >
                  👥 Donors List
                </Link>


                <Link
                  to="/receipts"
                  className="action-btn view-btn"
                >
                  🧾 Receipts
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

export default MonthlyDonationReport;