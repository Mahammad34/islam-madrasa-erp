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

function AccountsReport() {

  const [
    incomes,
    setIncomes
  ] = useState([]);

  const [
    expenses,
    setExpenses
  ] = useState([]);

  const [
    donations,
    setDonations
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter
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
  // FETCH ALL ACCOUNTS DATA
  // ============================================================

  const fetchReportData = async (
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

      const [
        incomeSnapshot,
        expenseSnapshot,
        donationSnapshot
      ] = await Promise.all([

        getDocs(
          collection(
            db,
            "income"
          )
        ),

        getDocs(
          collection(
            db,
            "expenses"
          )
        ),

        getDocs(
          collection(
            db,
            "donations"
          )
        )

      ]);


      const incomeList =
        incomeSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        );


      const expenseList =
        expenseSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        );


      const donationList =
        donationSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        );


      setIncomes(
        incomeList
      );

      setExpenses(
        expenseList
      );

      setDonations(
        donationList
      );

    }
    catch (error) {

      console.error(
        "Error loading accounts report:",
        error
      );

      setErrorMessage(
        "Unable to load accounts report. Please try again."
      );

    }
    finally {

      setIsLoading(false);

      setIsRefreshing(false);

    }

  };


  // ============================================================
  // LOAD REPORT DATA
  // ============================================================

  useEffect(() => {

    fetchReportData();

  }, []);


  // ============================================================
  // NORMALIZE ALL TRANSACTIONS
  // ============================================================

  const allTransactions =
    useMemo(() => {

      const incomeTransactions =
        incomes.map(
          (item) => ({

            id:
              `income-${item.id}`,

            type:
              "Income",

            title:
              item.source ||
              item.category ||
              item.description ||
              "Income",

            category:
              item.category ||
              item.source ||
              "General Income",

            amount:
              getNumber(
                item.amount
              ),

            date:
              item.date ||
              item.incomeDate ||
              item.createdAt,

            person:
              item.donorName ||
              item.receivedFrom ||
              ""

          })
        );


      const expenseTransactions =
        expenses.map(
          (item) => ({

            id:
              `expense-${item.id}`,

            type:
              "Expense",

            title:
              item.description ||
              item.category ||
              "Expense",

            category:
              item.category ||
              "General Expense",

            amount:
              getNumber(
                item.amount
              ),

            date:
              item.date ||
              item.expenseDate ||
              item.createdAt,

            person:
              item.paidTo ||
              ""

          })
        );


      const donationTransactions =
        donations.map(
          (item) => ({

            id:
              `donation-${item.id}`,

            type:
              "Donation",

            title:
              item.donorName ||
              "Donation",

            category:
              item.purpose ||
              "General Donation",

            amount:
              getNumber(
                item.donationAmount ??
                item.amount
              ),

            date:
              item.donationDate ||
              item.date ||
              item.createdAt,

            person:
              item.donorName ||
              ""

          })
        );


      return [

        ...incomeTransactions,

        ...expenseTransactions,

        ...donationTransactions

      ];

    }, [
      incomes,
      expenses,
      donations
    ]);


  // ============================================================
  // FILTER AND SORT TRANSACTIONS
  // ============================================================

  const filteredTransactions =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();


      const matchingTransactions =
        allTransactions.filter(
          (transaction) => {

            const searchableText =
              [

                transaction.type,

                transaction.title,

                transaction.category,

                transaction.person,

                transaction.amount

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


            const matchesType =
              typeFilter === "All" ||
              transaction.type ===
                typeFilter;


            const transactionDate =
              getDateInputValue(
                transaction.date
              );


            const matchesStartDate =
              !startDate ||
              (
                transactionDate &&
                transactionDate >=
                  startDate
              );


            const matchesEndDate =
              !endDate ||
              (
                transactionDate &&
                transactionDate <=
                  endDate
              );


            return (
              matchesSearch &&
              matchesType &&
              matchesStartDate &&
              matchesEndDate
            );

          }
        );


      return [
        ...matchingTransactions
      ].sort(
        (
          firstTransaction,
          secondTransaction
        ) => {

          if (
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  firstTransaction.date
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  secondTransaction.date
                )?.getTime() || 0
              )
            );

          }


          if (
            sortOption === "amount-high"
          ) {

            return (
              secondTransaction.amount -
              firstTransaction.amount
            );

          }


          if (
            sortOption === "amount-low"
          ) {

            return (
              firstTransaction.amount -
              secondTransaction.amount
            );

          }


          if (
            sortOption === "type"
          ) {

            return firstTransaction.type
              .localeCompare(
                secondTransaction.type
              );

          }


          return (
            (
              convertToDate(
                secondTransaction.date
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                firstTransaction.date
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      allTransactions,
      searchTerm,
      typeFilter,
      startDate,
      endDate,
      sortOption
    ]);


  // ============================================================
  // REPORT STATISTICS
  // ============================================================

  const reportStatistics =
    useMemo(() => {

      const totalIncome =
        incomes.reduce(
          (total, item) =>
            total +
            getNumber(
              item.amount
            ),
          0
        );


      const totalExpenses =
        expenses.reduce(
          (total, item) =>
            total +
            getNumber(
              item.amount
            ),
          0
        );


      const totalDonations =
        donations.reduce(
          (total, item) =>
            total +
            getNumber(
              item.donationAmount ??
              item.amount
            ),
          0
        );


      const currentBalance =
        totalIncome +
        totalDonations -
        totalExpenses;


      const currentDate =
        new Date();

      const currentMonth =
        currentDate.getMonth();

      const currentYear =
        currentDate.getFullYear();


      const isCurrentMonth =
        (dateValue) => {

          const convertedDate =
            convertToDate(
              dateValue
            );

          if (!convertedDate) {
            return false;
          }

          return (
            convertedDate.getMonth() ===
              currentMonth &&
            convertedDate.getFullYear() ===
              currentYear
          );

        };


      const monthIncome =
        incomes
          .filter(
            (item) =>
              isCurrentMonth(
                item.date ||
                item.incomeDate ||
                item.createdAt
              )
          )
          .reduce(
            (total, item) =>
              total +
              getNumber(
                item.amount
              ),
            0
          );


      const monthExpenses =
        expenses
          .filter(
            (item) =>
              isCurrentMonth(
                item.date ||
                item.expenseDate ||
                item.createdAt
              )
          )
          .reduce(
            (total, item) =>
              total +
              getNumber(
                item.amount
              ),
            0
          );


      const monthDonations =
        donations
          .filter(
            (item) =>
              isCurrentMonth(
                item.donationDate ||
                item.date ||
                item.createdAt
              )
          )
          .reduce(
            (total, item) =>
              total +
              getNumber(
                item.donationAmount ??
                item.amount
              ),
            0
          );


      return {

        totalIncome,

        totalExpenses,

        totalDonations,

        currentBalance,

        monthIncome,

        monthExpenses,

        monthDonations,

        totalTransactions:
          allTransactions.length

      };

    }, [
      incomes,
      expenses,
      donations,
      allTransactions
    ]);


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    typeFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {

    setSearchTerm("");

    setTypeFilter("All");

    setStartDate("");

    setEndDate("");

    setSortOption("newest");

  };


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport = async () => {

    await fetchReportData(
      true
    );

  };


  // ============================================================
  // EXPORT EXCEL
  // ============================================================

  const exportExcel = () => {

    if (
      filteredTransactions.length === 0
    ) {

      alert(
        "There are no account transactions to export."
      );

      return;

    }


    const excelData =
      filteredTransactions.map(
        (transaction) => ({

          Type:
            transaction.type,

          Title:
            transaction.title,

          Category:
            transaction.category,

          Person:
            transaction.person ||
            "N/A",

          Amount:
            transaction.amount,

          Date:
            formatDate(
              transaction.date
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
      "Accounts Report"
    );


    XLSX.writeFile(
      workbook,
      "Accounts_Report.xlsx"
    );

  };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    if (
      filteredTransactions.length === 0
    ) {

      alert(
        "There are no account transactions to export."
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
      "Accounts Report",
      14,
      18
    );


    pdfDocument.setFontSize(
      10
    );


    pdfDocument.text(
      `Transactions: ${filteredTransactions.length}`,
      14,
      26
    );


    const tableData =
      filteredTransactions.map(
        (transaction) => [

          transaction.type,

          transaction.title,

          transaction.category,

          transaction.person ||
            "N/A",

          `Rs. ${transaction.amount}`,

          formatDate(
            transaction.date
          )

        ]
      );


    autoTable(
      pdfDocument,
      {

        head: [[

          "Type",

          "Title",

          "Category",

          "Person",

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
      "Accounts_Report.pdf"
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
              💰 Accounts Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review Madrasa income, expenses, donations, balances, and financial transactions.
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
                  Loading Accounts Report...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while financial records are loaded.
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
                        reportStatistics.totalIncome
                      )
                    }
                  </h2>

                  <p>
                    💵 Total Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.totalExpenses
                      )
                    }
                  </h2>

                  <p>
                    💸 Total Expenses
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.totalDonations
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
                      formatCurrency(
                        reportStatistics.currentBalance
                      )
                    }
                  </h2>

                  <p>
                    🏦 Current Balance
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthIncome
                      )
                    }
                  </h2>

                  <p>
                    📈 This Month Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthExpenses
                      )
                    }
                  </h2>

                  <p>
                    📉 This Month Expenses
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthDonations
                      )
                    }
                  </h2>

                  <p>
                    💝 This Month Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      reportStatistics.totalTransactions
                    }
                  </h2>

                  <p>
                    📄 Total Transactions
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
                      🔍 Search & Filter Transactions
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search and filter financial transactions by type and date range.
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
                      Search Transaction
                    </label>

                    <input
                      type="text"
                      placeholder="Title, category, person, amount..."
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
                      Transaction Type
                    </label>

                    <select
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Transactions
                      </option>

                      <option value="Income">
                        Income
                      </option>

                      <option value="Expense">
                        Expense
                      </option>

                      <option value="Donation">
                        Donation
                      </option>

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
                      Sort Transactions
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
                        Newest Transactions
                      </option>

                      <option value="oldest">
                        Oldest Transactions
                      </option>

                      <option value="amount-high">
                        Highest Amount
                      </option>

                      <option value="amount-low">
                        Lowest Amount
                      </option>

                      <option value="type">
                        Transaction Type
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
                    {filteredTransactions.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {allTransactions.length}
                  </strong>{" "}
                  financial transactions.
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
                      📤 Export Accounts Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the currently filtered financial records.
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
                filteredTransactions.length === 0 ? (

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
                        💰
                      </div>

                      <h2>
                        No Financial Records Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          allTransactions.length === 0
                            ? "No financial transactions have been recorded yet."
                            : "No transactions match the selected filters."
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
                          📄 Financial Transactions
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete income, expense, and donation transaction records.
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
                        Showing {filteredTransactions.length} Records
                      </div>

                    </div>


                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Type
                          </th>

                          <th>
                            Transaction
                          </th>

                          <th>
                            Category
                          </th>

                          <th>
                            Person
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
                          filteredTransactions.map(
                            (transaction) => (

                              <tr key={transaction.id}>

                                <td>

                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "6px 10px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      background:
                                        transaction.type === "Income"
                                          ? "#dcfce7"
                                          : transaction.type === "Expense"
                                            ? "#fee2e2"
                                            : "#fff7ed",
                                      color:
                                        transaction.type === "Income"
                                          ? "#166534"
                                          : transaction.type === "Expense"
                                            ? "#991b1b"
                                            : "#c2410c"
                                    }}
                                  >
                                    {
                                      transaction.type === "Income"
                                        ? "💵 Income"
                                        : transaction.type === "Expense"
                                          ? "💸 Expense"
                                          : "❤️ Donation"
                                    }
                                  </span>

                                </td>


                                <td>

                                  <strong>
                                    {
                                      transaction.title ||
                                      "N/A"
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    transaction.category ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    transaction.person ||
                                    "N/A"
                                  }
                                </td>


                                <td>

                                  <strong>
                                    {
                                      formatCurrency(
                                        transaction.amount
                                      )
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    formatDate(
                                      transaction.date
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
                  to="/accounts"
                  className="action-btn view-btn"
                >
                  💰 Accounts Dashboard
                </Link>


                <Link
                  to="/quick-income"
                  className="action-btn view-btn"
                >
                  💵 Quick Income
                </Link>


                <Link
                  to="/quick-expense"
                  className="action-btn view-btn"
                >
                  💸 Quick Expense
                </Link>


                <Link
                  to="/donations"
                  className="action-btn view-btn"
                >
                  ❤️ Donations
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

export default AccountsReport;