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

function DonorsList() {

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
    sortOption,
    setSortOption
  ] = useState("highest");


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


        setDonations(
          donationList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading donors:",
          error
        );


        setErrorMessage(
          "Unable to load donor information. Please try again."
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
  // CREATE DONORS FROM DONATION RECORDS
  // ============================================================

  const donors =
    useMemo(
      () => {

        const donorMap =
          new Map();


        donations.forEach(
          (
            donation
          ) => {

            const donorName =
              getDonorName(
                donation
              ).trim();


            const mobileNumber =
              String(
                donation.mobileNumber ||
                ""
              ).trim();


            const normalizedName =
              donorName.toLowerCase();


            /*
              We use donor name + mobile number as the donor key.

              This prevents two people with the same name but
              different mobile numbers from automatically becoming
              one donor.
            */

            const donorKey =
              `${normalizedName}-${mobileNumber}`;


            const donationAmount =
              getDonationAmount(
                donation
              );


            const donationDate =
              getDonationDate(
                donation
              );


            if (
              !donorMap.has(
                donorKey
              )
            ) {

              donorMap.set(
                donorKey,
                {

                  id:
                    donorKey,

                  donorName,

                  mobileNumber,

                  address:
                    donation.address ||
                    "",

                  totalAmount:
                    donationAmount,

                  donationCount:
                    1,

                  latestDonationDate:
                    donationDate,

                  latestDonationAmount:
                    donationAmount,

                  purposes:
                    donation.purpose
                      ?
                      [
                        donation.purpose
                      ]
                      :
                      [],

                  paymentMethods:
                    donation.paymentMethod
                      ?
                      [
                        donation.paymentMethod
                      ]
                      :
                      []

                }
              );

            }
            else {

              const existingDonor =
                donorMap.get(
                  donorKey
                );


              existingDonor.totalAmount +=
                donationAmount;


              existingDonor.donationCount +=
                1;


              if (
                donation.purpose &&
                !existingDonor.purposes.includes(
                  donation.purpose
                )
              ) {

                existingDonor.purposes.push(
                  donation.purpose
                );

              }


              if (
                donation.paymentMethod &&
                !existingDonor.paymentMethods.includes(
                  donation.paymentMethod
                )
              ) {

                existingDonor.paymentMethods.push(
                  donation.paymentMethod
                );

              }


              if (
                String(
                  donationDate
                ) >
                String(
                  existingDonor.latestDonationDate
                )
              ) {

                existingDonor.latestDonationDate =
                  donationDate;


                existingDonor.latestDonationAmount =
                  donationAmount;

              }


              if (
                !existingDonor.address &&
                donation.address
              ) {

                existingDonor.address =
                  donation.address;

              }

            }

          }
        );


        return Array.from(
          donorMap.values()
        );

      },
      [
        donations
      ]
    );


  // ============================================================
  // SEARCH AND SORT DONORS
  // ============================================================

  const filteredDonors =
    useMemo(
      () => {

        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();


        const filteredList =
          donors.filter(
            (
              donor
            ) => {

              const searchableText =
                [

                  donor.donorName,

                  donor.mobileNumber,

                  donor.address,

                  donor.totalAmount,

                  ...donor.purposes,

                  ...donor.paymentMethods

                ]
                  .map(
                    (
                      value
                    ) =>

                      String(
                        value ||
                        ""
                      ).toLowerCase()

                  )
                  .join(" ");


              return (

                !normalizedSearch ||

                searchableText.includes(
                  normalizedSearch
                )

              );

            }
          );


        return filteredList.sort(
          (
            firstDonor,
            secondDonor
          ) => {

            switch (
              sortOption
            ) {

              case "lowest":

                return (

                  firstDonor.totalAmount -

                  secondDonor.totalAmount

                );


              case "most-donations":

                return (

                  secondDonor.donationCount -

                  firstDonor.donationCount

                );


              case "latest":

                return String(
                  secondDonor.latestDonationDate ||
                  ""
                ).localeCompare(
                  String(
                    firstDonor.latestDonationDate ||
                    ""
                  )
                );


              case "name":

                return firstDonor.donorName.localeCompare(
                  secondDonor.donorName
                );


              case "highest":

              default:

                return (

                  secondDonor.totalAmount -

                  firstDonor.totalAmount

                );

            }

          }
        );

      },
      [
        donors,
        searchTerm,
        sortOption
      ]
    );


  // ============================================================
  // DONOR STATISTICS
  // ============================================================

  const donorStatistics =
    useMemo(
      () => {

        const totalAmount =
          donors.reduce(
            (
              total,
              donor
            ) =>

              total +

              donor.totalAmount,

            0
          );


        const totalDonationCount =
          donors.reduce(
            (
              total,
              donor
            ) =>

              total +

              donor.donationCount,

            0
          );


        const averageDonation =
          totalDonationCount > 0
            ?
            totalAmount /
            totalDonationCount
            :
            0;


        const topDonor =
          donors.length > 0
            ?
            [...donors].sort(
              (
                firstDonor,
                secondDonor
              ) =>

                secondDonor.totalAmount -

                firstDonor.totalAmount

            )[0]
            :
            null;


        return {

          totalDonors:
            donors.length,

          totalAmount,

          totalDonationCount,

          averageDonation,

          topDonor

        };

      },
      [
        donors
      ]
    );


  // ============================================================
  // REFRESH DATA
  // ============================================================

  const refreshDonors =
    async () => {

      await fetchDonations(
        true
      );

    };


  // ============================================================
  // RESET SEARCH
  // ============================================================

  const resetSearch =
    () => {

      setSearchTerm("");

      setSortOption(
        "highest"
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
            justifyContent: "space-between",
            alignItems: "flex-start",
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
              👥 Donors List
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View donor information, contribution history, and donation statistics.
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
              onClick={refreshDonors}
              disabled={isRefreshing}
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
                  Loading Donors...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while donor information is loaded.
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* ==================================================
                  SUMMARY CARDS
              ================================================== */}

              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <h2>
                    {
                      donorStatistics.totalDonors
                    }
                  </h2>

                  <p>
                    👥 Total Donors
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donorStatistics.totalAmount
                      )
                    }
                  </h2>

                  <p>
                    ❤️ Total Donated
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      donorStatistics.totalDonationCount
                    }
                  </h2>

                  <p>
                    📜 Total Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donorStatistics.averageDonation
                      )
                    }
                  </h2>

                  <p>
                    📊 Average Donation
                  </p>

                </div>

              </div>


              {/* ==================================================
                  TOP DONOR
              ================================================== */}

              {
                donorStatistics.topDonor && (

                  <div
                    className="section-card"
                    style={{
                      marginBottom: "24px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "18px",
                        flexWrap: "wrap"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px"
                        }}
                      >

                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "16px",
                            background: "#fef3c7",
                            fontSize: "30px"
                          }}
                        >
                          🏆
                        </div>


                        <div>

                          <p
                            style={{
                              margin: "0 0 5px",
                              color: "#64748b",
                              fontSize: "13px"
                            }}
                          >
                            Top Donor
                          </p>

                          <h2
                            style={{
                              margin: "0 0 5px"
                            }}
                          >
                            {
                              donorStatistics.topDonor.donorName
                            }
                          </h2>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            {
                              donorStatistics.topDonor.donationCount
                            }
                            {" "}
                            donation(s)
                          </p>

                        </div>

                      </div>


                      <div
                        style={{
                          textAlign: "right"
                        }}
                      >

                        <h2
                          style={{
                            margin: "0 0 5px",
                            color: "#b45309"
                          }}
                        >
                          {
                            formatCurrency(
                              donorStatistics.topDonor.totalAmount
                            )
                          }
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          Total Contribution
                        </p>

                      </div>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  SEARCH AND SORT
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
                    justifyContent: "space-between",
                    alignItems: "flex-start",
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
                      🔍 Search & Sort Donors
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find donors and organize the list by contribution or activity.
                    </p>

                  </div>


                  {
                    (
                      searchTerm ||
                      sortOption !== "highest"
                    ) && (

                      <button
                        type="button"
                        onClick={resetSearch}
                      >
                        ✖ Reset
                      </button>

                    )
                  }

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Search Donors
                    </label>

                    <input
                      type="text"
                      placeholder="Search name, mobile, address, purpose..."
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
                      Sort Donors
                    </label>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value
                        )
                      }
                    >

                      <option value="highest">
                        Highest Contribution
                      </option>

                      <option value="lowest">
                        Lowest Contribution
                      </option>

                      <option value="most-donations">
                        Most Donations
                      </option>

                      <option value="latest">
                        Latest Donation
                      </option>

                      <option value="name">
                        Donor Name
                      </option>

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
                    {
                      filteredDonors.length
                    }
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {
                      donors.length
                    }
                  </strong>{" "}
                  donors.
                </div>

              </div>


              {/* ==================================================
                  NO DONORS
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
                          fontSize: "54px",
                          marginBottom: "14px"
                        }}
                      >
                        👥
                      </div>

                      <h2>
                        No Donors Yet
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Donors will automatically appear here when donation records are added.
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
                  NO SEARCH RESULTS
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
                        No Matching Donors
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No donors match your current search.
                      </p>

                      <button
                        type="button"
                        onClick={resetSearch}
                      >
                        ✖ Reset Search
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  DONOR CARDS
              ================================================== */}

              {
                filteredDonors.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gap: "16px"
                    }}
                  >

                    {
                      filteredDonors.map(
                        (
                          donor,
                          index
                        ) => (

                          <div
                            className="section-card"
                            key={donor.id}
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

                              {/* ================================
                                  DONOR DETAILS
                              ================================ */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "14px",
                                  flex: "1",
                                  minWidth: "260px"
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
                                    fontSize: "27px",
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
                                      marginBottom: "8px"
                                    }}
                                  >

                                    <h2
                                      style={{
                                        margin: 0
                                      }}
                                    >
                                      {
                                        donor.donorName
                                      }
                                    </h2>


                                    {
                                      index === 0 &&
                                      sortOption === "highest" && (

                                        <span
                                          style={{
                                            padding: "4px 9px",
                                            borderRadius: "999px",
                                            background: "#fef3c7",
                                            color: "#b45309",
                                            fontSize: "10px",
                                            fontWeight: "800"
                                          }}
                                        >
                                          🏆 TOP DONOR
                                        </span>

                                      )
                                    }

                                  </div>


                                  <div
                                    style={{
                                      display: "grid",
                                      gap: "7px",
                                      color: "#64748b",
                                      fontSize: "14px"
                                    }}
                                  >

                                    <span>
                                      📞 Mobile:{" "}
                                      {
                                        donor.mobileNumber ||
                                        "Not Available"
                                      }
                                    </span>

                                    {
                                      donor.address && (

                                        <span>
                                          📍 Address:{" "}
                                          {donor.address}
                                        </span>

                                      )
                                    }

                                    <span>
                                      ❤️ Donations:{" "}
                                      {
                                        donor.donationCount
                                      }
                                    </span>

                                    <span>
                                      📅 Latest Donation:{" "}
                                      {
                                        formatDate(
                                          donor.latestDonationDate
                                        )
                                      }
                                    </span>

                                    <span>
                                      💵 Latest Amount:{" "}
                                      {
                                        formatCurrency(
                                          donor.latestDonationAmount
                                        )
                                      }
                                    </span>

                                  </div>

                                </div>

                              </div>


                              {/* ================================
                                  DONOR STATISTICS
                              ================================ */}

                              <div
                                style={{
                                  minWidth: "210px",
                                  textAlign: "right"
                                }}
                              >

                                <h2
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#be185d"
                                  }}
                                >
                                  {
                                    formatCurrency(
                                      donor.totalAmount
                                    )
                                  }
                                </h2>

                                <p
                                  style={{
                                    margin: "0 0 12px",
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  Total Contribution
                                </p>


                                <div
                                  style={{
                                    padding: "9px 12px",
                                    borderRadius: "9px",
                                    background: "#f8fafc",
                                    fontSize: "13px",
                                    color: "#64748b"
                                  }}
                                >
                                  Average{" "}
                                  <strong>
                                    {
                                      formatCurrency(
                                        donor.totalAmount /
                                        donor.donationCount
                                      )
                                    }
                                  </strong>
                                </div>

                              </div>

                            </div>


                            {/* ================================
                                PURPOSES
                            ================================ */}

                            {
                              donor.purposes.length > 0 && (

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    flexWrap: "wrap",
                                    marginTop: "18px",
                                    paddingTop: "16px",
                                    borderTop: "1px solid #e2e8f0"
                                  }}
                                >

                                  <strong
                                    style={{
                                      fontSize: "13px"
                                    }}
                                  >
                                    🎯 Purposes:
                                  </strong>

                                  {
                                    donor.purposes.map(
                                      (
                                        purpose
                                      ) => (

                                        <span
                                          key={purpose}
                                          style={{
                                            padding: "5px 9px",
                                            borderRadius: "999px",
                                            background: "#fce7f3",
                                            color: "#be185d",
                                            fontSize: "11px",
                                            fontWeight: "700"
                                          }}
                                        >
                                          {purpose}
                                        </span>

                                      )
                                    )
                                  }

                                </div>

                              )
                            }


                            {/* ================================
                                PAYMENT METHODS
                            ================================ */}

                            {
                              donor.paymentMethods.length > 0 && (

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "7px",
                                    flexWrap: "wrap",
                                    marginTop: "12px"
                                  }}
                                >

                                  <strong
                                    style={{
                                      fontSize: "13px"
                                    }}
                                  >
                                    💳 Payments:
                                  </strong>

                                  {
                                    donor.paymentMethods.map(
                                      (
                                        method
                                      ) => (

                                        <span
                                          key={method}
                                          style={{
                                            padding: "5px 9px",
                                            borderRadius: "999px",
                                            background: "#eff6ff",
                                            color: "#1d4ed8",
                                            fontSize: "11px",
                                            fontWeight: "700"
                                          }}
                                        >
                                          {method}
                                        </span>

                                      )
                                    )
                                  }

                                </div>

                              )
                            }

                          </div>

                        )
                      )
                    }

                  </div>

                )
              }


              {/* ==================================================
                  NAVIGATION
              ================================================== */}

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
                  to="/donation-history"
                  className="action-btn view-btn"
                >
                  📜 Donation History
                </Link>

                <Link
                  to="/add-donation"
                  className="action-btn view-btn"
                >
                  ➕ Add Donation
                </Link>

              </div>

            </>

          )
        }


        <div
          style={{
            height: "50px"
          }}
        />

      </div>

    </Layout>

  );

}

export default DonorsList;