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

function Receipts() {

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
  // GENERATE RECEIPT NUMBER
  // ============================================================

  const getReceiptNumber =
    (
      donation
    ) => {

      if (
        donation.receiptNumber
      ) {

        return donation.receiptNumber;

      }


      const documentId =
        String(
          donation.id ||
          ""
        )
          .replace(
            /[^a-zA-Z0-9]/g,
            ""
          )
          .toUpperCase();


      return `REC-${documentId.slice(
        0,
        8
      )}`;

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
  // FETCH RECEIPTS
  // ============================================================

  const fetchReceipts =
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


        const receiptList =
          querySnapshot.docs.map(
            (
              donationDocument
            ) => ({

              id:
                donationDocument.id,

              ...donationDocument.data()

            })
          );


        receiptList.sort(
          (
            firstReceipt,
            secondReceipt
          ) =>

            String(
              getDonationDate(
                secondReceipt
              )
            ).localeCompare(

              String(
                getDonationDate(
                  firstReceipt
                )
              )

            )

        );


        setDonations(
          receiptList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading receipts:",
          error
        );


        setErrorMessage(
          "Unable to load donation receipts. Please try again."
        );

      }
      finally {

        setIsLoading(false);

        setIsRefreshing(false);

      }

    };


  // ============================================================
  // LOAD RECEIPTS
  // ============================================================

  useEffect(
    () => {

      fetchReceipts();

    },
    []
  );


  // ============================================================
  // PAYMENT METHOD OPTIONS
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
  // FILTER RECEIPTS
  // ============================================================

  const filteredReceipts =
    useMemo(
      () => {

        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();


        return donations.filter(
          (
            donation
          ) => {

            const searchableText =
              [

                getReceiptNumber(
                  donation
                ),

                getDonorName(
                  donation
                ),

                donation.mobileNumber,

                getDonationAmount(
                  donation
                ),

                donation.paymentMethod,

                donation.purpose

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


            const matchesSearch =

              !normalizedSearch ||

              searchableText.includes(
                normalizedSearch
              );


            const matchesDate =

              !dateFilter ||

              getDonationDate(
                donation
              ) ===
              dateFilter;


            const matchesPayment =

              paymentFilter === "All" ||

              donation.paymentMethod ===
              paymentFilter;


            return (

              matchesSearch &&

              matchesDate &&

              matchesPayment

            );

          }
        );

      },
      [
        donations,
        searchTerm,
        dateFilter,
        paymentFilter
      ]
    );


  // ============================================================
  // RECEIPT STATISTICS
  // ============================================================

  const receiptStatistics =
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
          filteredReceipts.reduce(
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


        return {

          totalReceipts:
            donations.length,

          totalAmount,

          filteredReceipts:
            filteredReceipts.length,

          filteredAmount

        };

      },
      [
        donations,
        filteredReceipts
      ]
    );


  // ============================================================
  // PRINT INDIVIDUAL RECEIPT
  // ============================================================

  const printReceipt =
    (
      donation
    ) => {

      const receiptNumber =
        getReceiptNumber(
          donation
        );


      const donorName =
        getDonorName(
          donation
        );


      const donationAmount =
        formatCurrency(
          getDonationAmount(
            donation
          )
        );


      const donationDate =
        formatDate(
          getDonationDate(
            donation
          )
        );


      const printWindow =
        window.open(
          "",
          "_blank",
          "width=800,height=700"
        );


      if (
        !printWindow
      ) {

        setErrorMessage(
          "Unable to open the receipt window. Please allow pop-ups and try again."
        );

        return;

      }


      printWindow.document.write(`
        <!DOCTYPE html>

        <html>

          <head>

            <title>${receiptNumber}</title>

            <style>

              body {
                margin: 0;
                padding: 40px;
                background: #f8fafc;
                color: #0f172a;
                font-family: Arial, sans-serif;
              }

              .receipt {
                max-width: 650px;
                margin: 0 auto;
                padding: 35px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
              }

              .header {
                text-align: center;
                padding-bottom: 22px;
                border-bottom: 2px solid #e2e8f0;
              }

              .header h1 {
                margin: 0 0 8px;
              }

              .header p {
                margin: 0;
                color: #64748b;
              }

              .receipt-number {
                margin: 24px 0;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
              }

              .details {
                display: grid;
                gap: 16px;
              }

              .detail-row {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e2e8f0;
              }

              .label {
                color: #64748b;
              }

              .amount {
                margin: 28px 0;
                padding: 22px;
                background: #f0fdf4;
                border-radius: 10px;
                text-align: center;
              }

              .amount h2 {
                margin: 5px 0 0;
                color: #15803d;
                font-size: 32px;
              }

              .footer {
                margin-top: 35px;
                padding-top: 20px;
                border-top: 2px solid #e2e8f0;
                text-align: center;
                color: #64748b;
              }

              @media print {

                body {
                  padding: 0;
                  background: #ffffff;
                }

                .receipt {
                  border: none;
                }

              }

            </style>

          </head>


          <body>

            <div class="receipt">

              <div class="header">

                <h1>🕌 Madrasa Donation Receipt</h1>

                <p>
                  Official acknowledgement of donation received
                </p>

              </div>


              <div class="receipt-number">
                Receipt Number: ${receiptNumber}
              </div>


              <div class="details">

                <div class="detail-row">

                  <span class="label">
                    Donor Name
                  </span>

                  <strong>
                    ${donorName}
                  </strong>

                </div>


                <div class="detail-row">

                  <span class="label">
                    Mobile Number
                  </span>

                  <strong>
                    ${donation.mobileNumber || "Not Available"}
                  </strong>

                </div>


                <div class="detail-row">

                  <span class="label">
                    Donation Date
                  </span>

                  <strong>
                    ${donationDate}
                  </strong>

                </div>


                <div class="detail-row">

                  <span class="label">
                    Payment Method
                  </span>

                  <strong>
                    ${donation.paymentMethod || "Not Available"}
                  </strong>

                </div>


                <div class="detail-row">

                  <span class="label">
                    Purpose
                  </span>

                  <strong>
                    ${donation.purpose || "General Donation"}
                  </strong>

                </div>

              </div>


              <div class="amount">

                <span class="label">
                  Donation Amount
                </span>

                <h2>
                  ${donationAmount}
                </h2>

              </div>


              <div class="footer">

                <p>
                  JazakAllahu Khairan for your generous contribution.
                </p>

                <p>
                  This is a computer-generated donation receipt.
                </p>

              </div>

            </div>


            <script>

              window.onload = function () {

                window.print();

              };

            </script>

          </body>

        </html>
      `);


      printWindow.document.close();

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setDateFilter("");

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

    paymentFilter !== "All";


  // ============================================================
  // REFRESH RECEIPTS
  // ============================================================

  const refreshReceipts =
    async () => {

      await fetchReceipts(
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
              🧾 Donation Receipts
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              View, search, and print receipts for Madrasa donations.
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
              onClick={refreshReceipts}
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
                  Loading Receipts...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while donation receipts are loaded.
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
                    {receiptStatistics.totalReceipts}
                  </h2>

                  <p>
                    🧾 Total Receipts
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        receiptStatistics.totalAmount
                      )
                    }
                  </h2>

                  <p>
                    ❤️ Total Received
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {receiptStatistics.filteredReceipts}
                  </h2>

                  <p>
                    🔍 Matching Receipts
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        receiptStatistics.filteredAmount
                      )
                    }
                  </h2>

                  <p>
                    💰 Filtered Amount
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
                      🔍 Search & Filter Receipts
                    </h2>

                    <p style={{ margin: 0, color: "#64748b" }}>
                      Find receipts using receipt number, donor, mobile number, payment method, or date.
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
                      Search Receipts
                    </label>

                    <input
                      type="text"
                      placeholder="Search receipt, donor, mobile or amount..."
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
                          (paymentMethod) => (

                            <option
                              key={paymentMethod}
                              value={paymentMethod}
                            >
                              {paymentMethod}
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
                    {receiptStatistics.filteredReceipts}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {receiptStatistics.totalReceipts}
                  </strong>{" "}
                  receipts.
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
                        🧾
                      </div>

                      <h2>
                        No Receipts Yet
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Donation receipts will automatically appear when donations are added.
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
                filteredReceipts.length === 0 && (

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
                        No Matching Receipts
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No donation receipts match your current filters.
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
                filteredReceipts.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gap: "18px"
                    }}
                  >

                    {
                      filteredReceipts.map(
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
                                  minWidth: "260px"
                                }}
                              >

                                <div
                                  style={{
                                    width: "58px",
                                    height: "58px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    borderRadius: "14px",
                                    background: "#ecfdf5",
                                    fontSize: "28px"
                                  }}
                                >
                                  🧾
                                </div>


                                <div>

                                  <p
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#64748b",
                                      fontSize: "12px",
                                      fontWeight: "700"
                                    }}
                                  >
                                    RECEIPT NUMBER
                                  </p>


                                  <h2
                                    style={{
                                      margin: "0 0 12px"
                                    }}
                                  >
                                    {
                                      getReceiptNumber(
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
                                      👤 Donor:{" "}
                                      <strong>
                                        {
                                          getDonorName(
                                            donation
                                          )
                                        }
                                      </strong>
                                    </span>


                                    <span>
                                      📞 Mobile:{" "}
                                      {
                                        donation.mobileNumber ||
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


                                    <span>
                                      💳 Payment:{" "}
                                      {
                                        donation.paymentMethod ||
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

                                  </div>

                                </div>

                              </div>


                              <div
                                style={{
                                  minWidth: "210px",
                                  textAlign: "right"
                                }}
                              >

                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  Donation Amount
                                </p>


                                <h2
                                  style={{
                                    margin: "0 0 16px",
                                    color: "#15803d"
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
                                  className="save-all-btn"
                                  onClick={() =>
                                    printReceipt(
                                      donation
                                    )
                                  }
                                >
                                  🖨 Print Receipt
                                </button>

                              </div>

                            </div>


                            {
                              donation.description && (

                                <div
                                  style={{
                                    marginTop: "18px",
                                    paddingTop: "16px",
                                    borderTop: "1px solid #e2e8f0"
                                  }}
                                >

                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#64748b",
                                      lineHeight: "1.6"
                                    }}
                                  >
                                    📝 {donation.description}
                                  </p>

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

              </div>

            </>

          )
        }


        <div style={{ height: "50px" }} />

      </div>

    </Layout>

  );

}

export default Receipts;