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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function DonationReport() {

  const [
    donations,
    setDonations
  ] = useState([]);

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

  const [
    sortOption,
    setSortOption
  ] = useState("newest");

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

  const getNumber = (value) => {

    const convertedValue =
      Number(value);

    return Number.isFinite(
      convertedValue
    )
      ? convertedValue
      : 0;

  };


  // ============================================================
  // CURRENCY FORMATTER
  // ============================================================

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    ).format(
      getNumber(value)
    );

  };


  // ============================================================
  // DATE HELPERS
  // ============================================================

  const convertToDate = (dateValue) => {

    if (!dateValue) {
      return null;
    }

    if (
      typeof dateValue === "object" &&
      typeof dateValue.toDate === "function"
    ) {

      return dateValue.toDate();

    }

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        String(dateValue)
      )
    ) {

      return new Date(
        `${dateValue}T00:00:00`
      );

    }

    const convertedDate =
      new Date(dateValue);

    return Number.isNaN(
      convertedDate.getTime()
    )
      ? null
      : convertedDate;

  };


  const getDateInputValue = (dateValue) => {

    const convertedDate =
      convertToDate(dateValue);

    if (!convertedDate) {
      return "";
    }

    const year =
      convertedDate.getFullYear();

    const month =
      String(
        convertedDate.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        convertedDate.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;

  };


  const formatDate = (dateValue) => {

    const convertedDate =
      convertToDate(dateValue);

    if (!convertedDate) {
      return "N/A";
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

  const fetchDonations = async (
    showRefreshLoader = false
  ) => {

    if (showRefreshLoader) {

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
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        );


      setDonations(
        donationList
      );

    }
    catch (error) {

      console.error(
        "Error loading donation report:",
        error
      );

      setErrorMessage(
        "Unable to load donation report. Please try again."
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

  useEffect(() => {

    fetchDonations();

  }, []);


  // ============================================================
  // NORMALIZED DONATIONS
  // ============================================================

  const normalizedDonations =
    useMemo(() => {

      return donations.map(
        (item) => ({

          id:
            item.id,

          donorName:
            item.donorName ||
            item.name ||
            "Unknown Donor",

          mobileNumber:
            item.mobileNumber ||
            "",

          amount:
            getNumber(
              item.donationAmount ??
              item.amount
            ),

          paymentMethod:
            item.paymentMethod ||
            "N/A",

          purpose:
            item.purpose ||
            "General Donation",

          date:
            item.donationDate ||
            item.date ||
            item.createdAt

        })
      );

    }, [
      donations
    ]);


  // ============================================================
  // PURPOSE OPTIONS
  // ============================================================

  const purposeOptions =
    useMemo(() => {

      return [
        ...new Set(
          normalizedDonations
            .map(
              (item) =>
                item.purpose
            )
            .filter(Boolean)
        )
      ].sort();

    }, [
      normalizedDonations
    ]);


  // ============================================================
  // PAYMENT OPTIONS
  // ============================================================

  const paymentOptions =
    useMemo(() => {

      return [
        ...new Set(
          normalizedDonations
            .map(
              (item) =>
                item.paymentMethod
            )
            .filter(Boolean)
        )
      ].sort();

    }, [
      normalizedDonations
    ]);


  // ============================================================
  // FILTER AND SORT DONATIONS
  // ============================================================

  const filteredDonations =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();


      const matchingDonations =
        normalizedDonations.filter(
          (donation) => {

            const searchableText =
              [

                donation.donorName,

                donation.mobileNumber,

                donation.purpose,

                donation.paymentMethod,

                donation.amount

              ]
                .map(
                  (value) =>
                    String(
                      value || ""
                    ).toLowerCase()
                )
                .join(" ");


            const matchesSearch =
              !normalizedSearch ||
              searchableText.includes(
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


            const donationDate =
              getDateInputValue(
                donation.date
              );


            const matchesStartDate =
              !startDate ||
              (
                donationDate &&
                donationDate >=
                  startDate
              );


            const matchesEndDate =
              !endDate ||
              (
                donationDate &&
                donationDate <=
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


      return [
        ...matchingDonations
      ].sort(
        (
          firstDonation,
          secondDonation
        ) => {

          if (
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  firstDonation.date
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  secondDonation.date
                )?.getTime() || 0
              )
            );

          }


          if (
            sortOption === "amount-high"
          ) {

            return (
              secondDonation.amount -
              firstDonation.amount
            );

          }


          if (
            sortOption === "amount-low"
          ) {

            return (
              firstDonation.amount -
              secondDonation.amount
            );

          }


          if (
            sortOption === "name"
          ) {

            return firstDonation.donorName
              .localeCompare(
                secondDonation.donorName
              );

          }


          return (
            (
              convertToDate(
                secondDonation.date
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                firstDonation.date
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      normalizedDonations,
      searchTerm,
      purposeFilter,
      paymentFilter,
      startDate,
      endDate,
      sortOption
    ]);


  // ============================================================
  // DONATION STATISTICS
  // ============================================================

  const donationStatistics =
    useMemo(() => {

      const totalAmount =
        normalizedDonations.reduce(
          (total, item) =>
            total +
            item.amount,
          0
        );


      const uniqueDonors =
        new Set(
          normalizedDonations.map(
            (item) =>
              item.mobileNumber ||
              item.donorName
                .trim()
                .toLowerCase()
          )
        );


      const totalDonors =
        uniqueDonors.size;


      const currentDate =
        new Date();

      const today =
        getDateInputValue(
          currentDate
        );


      const todayAmount =
        normalizedDonations
          .filter(
            (item) =>
              getDateInputValue(
                item.date
              ) === today
          )
          .reduce(
            (total, item) =>
              total +
              item.amount,
            0
          );


      const currentMonth =
        currentDate.getMonth();

      const currentYear =
        currentDate.getFullYear();


      const monthAmount =
        normalizedDonations
          .filter(
            (item) => {

              const donationDate =
                convertToDate(
                  item.date
                );

              if (!donationDate) {
                return false;
              }

              return (
                donationDate.getMonth() ===
                  currentMonth &&
                donationDate.getFullYear() ===
                  currentYear
              );

            }
          )
          .reduce(
            (total, item) =>
              total +
              item.amount,
            0
          );


      const averageDonation =
        normalizedDonations.length === 0
          ? 0
          : totalAmount /
            normalizedDonations.length;


      const donorTotals = {};


      normalizedDonations.forEach(
        (item) => {

          const donorKey =
            item.mobileNumber ||
            item.donorName
              .trim()
              .toLowerCase();


          if (!donorTotals[donorKey]) {

            donorTotals[donorKey] = {

              donorName:
                item.donorName,

              totalAmount:
                0

            };

          }


          donorTotals[
            donorKey
          ].totalAmount +=
            item.amount;

        }
      );


      const topDonorData =
        Object.values(
          donorTotals
        ).reduce(
          (
            currentTopDonor,
            donor
          ) => {

            if (
              !currentTopDonor ||
              donor.totalAmount >
                currentTopDonor.totalAmount
            ) {

              return donor;

            }

            return currentTopDonor;

          },
          null
        );


      return {

        totalAmount,

        totalDonors,

        todayAmount,

        monthAmount,

        averageDonation,

        topDonor:
          topDonorData
            ?.donorName ||
          "N/A",

        topDonorAmount:
          topDonorData
            ?.totalAmount ||
          0,

        totalEntries:
          normalizedDonations.length

      };

    }, [
      normalizedDonations
    ]);


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    purposeFilter !== "All" ||
    paymentFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {

    setSearchTerm("");

    setPurposeFilter("All");

    setPaymentFilter("All");

    setStartDate("");

    setEndDate("");

    setSortOption("newest");

  };


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport = async () => {

    await fetchDonations(
      true
    );

  };


  // ============================================================
  // EXPORT EXCEL
  // ============================================================

  const exportExcel = () => {

    if (
      filteredDonations.length === 0
    ) {

      alert(
        "There are no donation records to export."
      );

      return;

    }


    const excelData =
      filteredDonations.map(
        (donation) => ({

          "Donor Name":
            donation.donorName,

          "Mobile Number":
            donation.mobileNumber ||
            "N/A",

          Purpose:
            donation.purpose,

          "Payment Method":
            donation.paymentMethod,

          Amount:
            donation.amount,

          Date:
            formatDate(
              donation.date
            )

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Donation Report"
    );


    XLSX.writeFile(
      workbook,
      "Donation_Report.xlsx"
    );

  };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    if (
      filteredDonations.length === 0
    ) {

      alert(
        "There are no donation records to export."
      );

      return;

    }


    const pdfDocument =
      new jsPDF({
        orientation: "landscape"
      });


    pdfDocument.setFontSize(
      18
    );


    pdfDocument.text(
      "Donation Report",
      14,
      18
    );


    pdfDocument.setFontSize(
      10
    );


    pdfDocument.text(
      `Records: ${filteredDonations.length}`,
      14,
      26
    );


    const tableData =
      filteredDonations.map(
        (donation) => [

          donation.donorName,

          donation.mobileNumber ||
            "N/A",

          donation.purpose,

          donation.paymentMethod,

          `Rs. ${donation.amount}`,

          formatDate(
            donation.date
          )

        ]
      );


    autoTable(
      pdfDocument,
      {

        head: [[

          "Donor Name",

          "Mobile",

          "Purpose",

          "Payment",

          "Amount",

          "Date"

        ]],

        body:
          tableData,

        startY:
          32

      }
    );


    pdfDocument.save(
      "Donation_Report.pdf"
    );

  };


  // ============================================================
  // PRINT REPORT
  // ============================================================

  const printReport = () => {

    window.print();

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
              ❤️ Donation Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review donor records, donation collections, payment methods, and fundraising activity.
            </p>

          </div>

          <button
            type="button"
            onClick={refreshReport}
            disabled={isRefreshing}
          >
            {
              isRefreshing
                ? "⏳ Refreshing..."
                : "🔄 Refresh Report"
            }
          </button>

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
                  Loading Donation Report...
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
                    {
                      formatCurrency(
                        donationStatistics.totalAmount
                      )
                    }
                  </h2>

                  <p>
                    ❤️ Total Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      donationStatistics.totalDonors
                    }
                  </h2>

                  <p>
                    👥 Unique Donors
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      donationStatistics.totalEntries
                    }
                  </h2>

                  <p>
                    📄 Donation Entries
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.todayAmount
                      )
                    }
                  </h2>

                  <p>
                    📅 Today's Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.monthAmount
                      )
                    }
                  </h2>

                  <p>
                    📊 This Month
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.averageDonation
                      )
                    }
                  </h2>

                  <p>
                    📈 Average Donation
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      donationStatistics.topDonor
                    }
                  </h2>

                  <p>
                    🏆 Top Donor
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        donationStatistics.topDonorAmount
                      )
                    }
                  </h2>

                  <p>
                    💰 Top Donor Amount
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
                      Search donors and filter donation records by purpose, payment method, and date.
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
                      Search Donation
                    </label>

                    <input
                      type="text"
                      placeholder="Donor, mobile, purpose, amount..."
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


                  <div>

                    <label>
                      Date From
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Date To
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Sort Donations
                    </label>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value
                        )
                      }
                    >

                      <option value="newest">
                        Newest Donations
                      </option>

                      <option value="oldest">
                        Oldest Donations
                      </option>

                      <option value="amount-high">
                        Highest Amount
                      </option>

                      <option value="amount-low">
                        Lowest Amount
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
                    {filteredDonations.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {normalizedDonations.length}
                  </strong>{" "}
                  donation records.
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
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2 style={{ margin: "0 0 6px" }}>
                      📤 Export Donation Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the currently filtered donation records.
                    </p>

                  </div>


                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}
                  >

                    <button
                      type="button"
                      onClick={exportExcel}
                    >
                      📥 Export Excel
                    </button>


                    <button
                      type="button"
                      onClick={downloadPDF}
                    >
                      📄 Download PDF
                    </button>


                    <button
                      type="button"
                      onClick={printReport}
                    >
                      🖨 Print Report
                    </button>

                  </div>

                </div>

              </div>


              {
                filteredDonations.length === 0 ? (

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
                        ❤️
                      </div>

                      <h2>
                        No Donation Records Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          normalizedDonations.length === 0
                            ? "No donations have been recorded yet."
                            : "No donations match the selected filters."
                        }
                      </p>


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

                  </div>

                ) : (

                  <div className="attendance-table-container">

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                      }}
                    >

                      <div>

                        <h2 style={{ margin: "0 0 6px" }}>
                          ❤️ Donation Records
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete donor and donation transaction information.
                        </p>

                      </div>


                      <div
                        style={{
                          padding: "7px 12px",
                          borderRadius: "20px",
                          background: "#f1f5f9",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#475569"
                        }}
                      >
                        Showing {filteredDonations.length} Records
                      </div>

                    </div>


                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Donor Name
                          </th>

                          <th>
                            Mobile
                          </th>

                          <th>
                            Purpose
                          </th>

                          <th>
                            Payment
                          </th>

                          <th>
                            Amount
                          </th>

                          <th>
                            Date
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          filteredDonations.map(
                            (donation) => (

                              <tr key={donation.id}>

                                <td>

                                  <strong>
                                    {
                                      donation.donorName
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    donation.mobileNumber ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    donation.purpose
                                  }
                                </td>


                                <td>

                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "6px 10px",
                                      borderRadius: "20px",
                                      background: "#eff6ff",
                                      color: "#1d4ed8",
                                      fontSize: "12px",
                                      fontWeight: "700"
                                    }}
                                  >
                                    {
                                      donation.paymentMethod
                                    }
                                  </span>

                                </td>


                                <td>

                                  <strong>
                                    {
                                      formatCurrency(
                                        donation.amount
                                      )
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    formatDate(
                                      donation.date
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
                  to="/reports"
                  className="action-btn view-btn"
                >
                  📊 Reports Module
                </Link>


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

export default DonationReport;