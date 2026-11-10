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

function MonthlyReport() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    income,
    setIncome
  ] = useState([]);


  const [
    expenses,
    setExpenses
  ] = useState([]);


  const [
    donations,
    setDonations
  ] = useState([]);


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    selectedMonth,
    setSelectedMonth
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
        .slice(0, 7);

    }
  );


  const [
    transactionTypeFilter,
    setTransactionTypeFilter
  ] = useState("All");


  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


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


  const [
    successMessage,
    setSuccessMessage
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
  // GET TRANSACTION DATE
  // ============================================================

  const getTransactionDate =
    (
      transaction
    ) => {

      if (
        transaction.createdAt &&
        typeof transaction.createdAt.toDate ===
        "function"
      ) {

        return transaction.createdAt.toDate();

      }


      if (
        transaction.createdAt?.seconds
      ) {

        return new Date(
          transaction.createdAt.seconds *
          1000
        );

      }


      if (
        transaction.date
      ) {

        const convertedDate =
          new Date(
            `${transaction.date}T00:00:00`
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
  // FORMAT TRANSACTION DATE
  // ============================================================

  const formatTransactionDate =
    (
      transaction
    ) => {

      const transactionDate =
        getTransactionDate(
          transaction
        );


      if (
        transactionDate.getTime() === 0
      ) {

        return "Date Not Available";

      }


      return transactionDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // GET TRANSACTION MONTH
  // ============================================================

  const getTransactionMonth =
    (
      transaction
    ) => {

      if (
        transaction.date &&
        /^\d{4}-\d{2}/.test(
          transaction.date
        )
      ) {

        return transaction.date.slice(
          0,
          7
        );

      }


      const transactionDate =
        getTransactionDate(
          transaction
        );


      if (
        transactionDate.getTime() === 0
      ) {

        return "";

      }


      const year =
        transactionDate.getFullYear();


      const month =
        String(
          transactionDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}`;

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

          return "All Time";

        }


        const [
          year,
          month
        ] =
          selectedMonth.split("-");


        const monthDate =
          new Date(
            Number(year),
            Number(month) - 1,
            1
          );


        return monthDate.toLocaleDateString(
          "en-IN",
          {
            month: "long",
            year: "numeric"
          }
        );

      },
      [
        selectedMonth
      ]
    );


  // ============================================================
  // FETCH MONTHLY REPORT DATA
  // ============================================================

  const fetchMonthlyReportData =
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

        const [
          incomeSnapshot,
          expenseSnapshot,
          donationSnapshot
        ] =
          await Promise.all([

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
            (
              incomeDocument
            ) => ({

              id:
                incomeDocument.id,

              ...incomeDocument.data()

            })
          );


        const expenseList =
          expenseSnapshot.docs.map(
            (
              expenseDocument
            ) => ({

              id:
                expenseDocument.id,

              ...expenseDocument.data()

            })
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


        if (
          isMountedRef.current
        ) {

          setIncome(
            incomeList
          );


          setExpenses(
            expenseList
          );


          setDonations(
            donationList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading monthly report:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load the financial report. Please check your connection and try again."
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
  // LOAD MONTHLY REPORT DATA
  // ============================================================

  useEffect(
    () => {

      fetchMonthlyReportData();

    },
    []
  );


  // ============================================================
  // CREATE ALL TRANSACTIONS
  // ============================================================

  const allTransactions =
    useMemo(
      () => {

        const incomeTransactions =
          income.map(
            (
              item
            ) => ({

              ...item,

              transactionId:
                `income-${item.id}`,

              type:
                "Income"

            })
          );


        const expenseTransactions =
          expenses.map(
            (
              item
            ) => ({

              ...item,

              transactionId:
                `expense-${item.id}`,

              type:
                "Expense"

            })
          );


        const donationTransactions =
          donations.map(
            (
              item
            ) => ({

              ...item,

              transactionId:
                `donation-${item.id}`,

              type:
                "Donation"

            })
          );


        return [

          ...incomeTransactions,

          ...expenseTransactions,

          ...donationTransactions

        ].sort(
          (
            firstTransaction,
            secondTransaction
          ) =>

            getTransactionDate(
              secondTransaction
            ).getTime() -

            getTransactionDate(
              firstTransaction
            ).getTime()

        );

      },
      [
        income,
        expenses,
        donations
      ]
    );


  // ============================================================
  // MONTH TRANSACTIONS
  // ============================================================

  const monthlyTransactions =
    useMemo(
      () => {

        if (
          !selectedMonth
        ) {

          return allTransactions;

        }


        return allTransactions.filter(
          (
            transaction
          ) =>

            getTransactionMonth(
              transaction
            ) ===
            selectedMonth

        );

      },
      [
        allTransactions,
        selectedMonth
      ]
    );


  // ============================================================
  // FILTER REPORT TRANSACTIONS
  // ============================================================

  const filteredTransactions =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return monthlyTransactions.filter(
          (
            transaction
          ) => {

            const matchesType =

              transactionTypeFilter ===
                "All" ||

              transaction.type ===
                transactionTypeFilter;


            const searchableValues =
              [

                transaction.type,

                transaction.amount,

                transaction.category,

                transaction.description,

                transaction.paymentMethod,

                transaction.donorName,

                transaction.date

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


            return (

              matchesType &&

              matchesSearch

            );

          }
        );

      },
      [
        monthlyTransactions,
        transactionTypeFilter,
        searchTerm
      ]
    );


  // ============================================================
  // MONTHLY REPORT STATISTICS
  // ============================================================

  const reportStatistics =
    useMemo(
      () => {

        const monthlyIncome =
          monthlyTransactions

            .filter(
              (
                transaction
              ) =>
                transaction.type ===
                "Income"
            )

            .reduce(
              (
                total,
                transaction
              ) =>
                total +
                getNumber(
                  transaction.amount
                ),
              0
            );


        const monthlyExpenses =
          monthlyTransactions

            .filter(
              (
                transaction
              ) =>
                transaction.type ===
                "Expense"
            )

            .reduce(
              (
                total,
                transaction
              ) =>
                total +
                getNumber(
                  transaction.amount
                ),
              0
            );


        const monthlyDonations =
          monthlyTransactions

            .filter(
              (
                transaction
              ) =>
                transaction.type ===
                "Donation"
            )

            .reduce(
              (
                total,
                transaction
              ) =>
                total +
                getNumber(
                  transaction.amount
                ),
              0
            );


        const monthlyBalance =

          monthlyIncome +

          monthlyDonations -

          monthlyExpenses;


        const filteredValue =
          filteredTransactions.reduce(
            (
              total,
              transaction
            ) => {

              const transactionAmount =
                getNumber(
                  transaction.amount
                );


              if (
                transaction.type ===
                "Expense"
              ) {

                return total -
                  transactionAmount;

              }


              return total +
                transactionAmount;

            },
            0
          );


        return {

          monthlyIncome,

          monthlyExpenses,

          monthlyDonations,

          monthlyBalance,

          totalTransactions:
            monthlyTransactions.length,

          filteredTransactions:
            filteredTransactions.length,

          filteredValue

        };

      },
      [
        monthlyTransactions,
        filteredTransactions
      ]
    );


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport =
    async () => {

      setSuccessMessage("");

      await fetchMonthlyReportData(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setTransactionTypeFilter(
        "All"
      );

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    transactionTypeFilter !==
      "All";
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
              📊 Monthly Report
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Review Madrasa income, expenses, donations, and financial balance by month.
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


            <button
              type="button"
              onClick={refreshReport}
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
                  Loading Financial Report...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while income, expenses, and donation records are loaded.
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
                  REPORT MONTH SELECTOR
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
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "18px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      📅 Report Period
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Select a month to view the financial report for that period.
                    </p>

                  </div>


                  <div
                    style={{
                      minWidth: "240px"
                    }}
                  >

                    <label>
                      Select Month
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
                  📊 Currently viewing the financial report for
                  {" "}
                  <strong>
                    {formattedSelectedMonth}
                  </strong>
                </div>

              </div>


              {/* ==================================================
                  FINANCIAL SUMMARY CARDS
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
                    💰
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthlyIncome
                      )
                    }
                  </h2>


                  <p>
                    Monthly Income
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    💸
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthlyExpenses
                      )
                    }
                  </h2>


                  <p>
                    Monthly Expenses
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
                        reportStatistics.monthlyDonations
                      )
                    }
                  </h2>


                  <p>
                    Monthly Donations
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    🏦
                  </div>


                  <h2
                    style={{
                      color:
                        reportStatistics.monthlyBalance >= 0
                          ?
                          "#15803d"
                          :
                          "#b91c1c"
                    }}
                  >
                    {
                      formatCurrency(
                        reportStatistics.monthlyBalance
                      )
                    }
                  </h2>


                  <p>
                    Monthly Balance
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
                      reportStatistics.totalTransactions
                    }
                  </h2>


                  <p>
                    Transactions
                  </p>

                </div>

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
                      🔍 Search Report Transactions
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search the selected month's transactions or filter them by transaction type.
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
                      Search Transactions
                    </label>


                    <input
                      type="text"
                      placeholder="Search amount, category, description or donor..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* ============================================
                      TRANSACTION TYPE
                  ============================================ */}

                  <div>

                    <label>
                      Transaction Type
                    </label>


                    <select
                      value={transactionTypeFilter}
                      onChange={(event) =>
                        setTransactionTypeFilter(
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
                      reportStatistics.filteredTransactions
                    }
                  </strong>
                  {" "}
                  of
                  {" "}
                  <strong>
                    {
                      reportStatistics.totalTransactions
                    }
                  </strong>
                  {" "}
                  transactions for
                  {" "}
                  <strong>
                    {formattedSelectedMonth}
                  </strong>
                  .
                </div>

              </div>


              {/* ==================================================
                  TRANSACTION RECORDS HEADER
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
                    📄 Financial Transactions
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Income, expense, and donation transactions recorded during the selected report period.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {filteredTransactions.length} Records
                </span>

              </div>
                            {/* ==================================================
                  NO TRANSACTIONS FOR SELECTED MONTH
              ================================================== */}

              {
                monthlyTransactions.length === 0 && (

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
                        📊
                      </div>


                      <h2>
                        No Transactions Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No income, expense, or donation transactions were recorded for {formattedSelectedMonth}.
                      </p>


                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          flexWrap: "wrap"
                        }}
                      >

                        <Link
                          to="/quick-income"
                          className="action-btn view-btn"
                        >
                          ➕ Add Income
                        </Link>


                        <Link
                          to="/quick-expense"
                          className="action-btn"
                        >
                          ➕ Add Expense
                        </Link>

                      </div>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                monthlyTransactions.length > 0 &&
                filteredTransactions.length === 0 && (

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
                        No Matching Transactions Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No financial transactions match your current search and transaction type filters.
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
                  FINANCIAL TRANSACTION RECORDS
              ================================================== */}

              {
                filteredTransactions.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredTransactions.map(
                        (
                          transaction,
                          index
                        ) => {

                          const isExpense =
                            transaction.type ===
                            "Expense";


                          const isDonation =
                            transaction.type ===
                            "Donation";


                          const transactionIcon =
                            isExpense
                              ?
                              "💸"
                              :
                              isDonation
                                ?
                                "❤️"
                                :
                                "💵";


                          const transactionBackground =
                            isExpense
                              ?
                              "#fee2e2"
                              :
                              isDonation
                                ?
                                "#fce7f3"
                                :
                                "#dcfce7";


                          const transactionColor =
                            isExpense
                              ?
                              "#b91c1c"
                              :
                              isDonation
                                ?
                                "#be185d"
                                :
                                "#15803d";


                          const amountPrefix =
                            isExpense
                              ?
                              "-"
                              :
                              "+";


                          return (

                            <div
                              key={
                                transaction.transactionId
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  filteredTransactions.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  TRANSACTION INFORMATION
                              ================================== */}

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
                                    width: "50px",
                                    height: "50px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "12px",
                                    background:
                                      transactionBackground,
                                    fontSize: "24px",
                                    flexShrink: 0
                                  }}
                                >
                                  {transactionIcon}
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
                                        transaction.description ||

                                        transaction.donorName ||

                                        transaction.category ||

                                        `${transaction.type} Transaction`
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background:
                                          transactionBackground,
                                        color:
                                          transactionColor,
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      {
                                        transaction.type.toUpperCase()
                                      }
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
                                      📂 {
                                        transaction.category ||
                                        (
                                          isDonation
                                            ?
                                            "Donation"
                                            :
                                            "No Category"
                                        )
                                      }
                                    </span>


                                    <span>
                                      💳 {
                                        transaction.paymentMethod ||
                                        "Not Available"
                                      }
                                    </span>


                                    <span>
                                      📅 {
                                        formatTransactionDate(
                                          transaction
                                        )
                                      }
                                    </span>

                                  </div>


                                  {
                                    isDonation &&
                                    transaction.donorName && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px"
                                        }}
                                      >
                                        👤 Donor : {
                                          transaction.donorName
                                        }
                                      </p>

                                    )
                                  }


                                  {
                                    transaction.description && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {
                                          transaction.description
                                        }
                                      </p>

                                    )
                                  }

                                </div>

                              </div>


                              {/* ==================================
                                  TRANSACTION AMOUNT
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
                                    color:
                                      transactionColor
                                  }}
                                >
                                  {amountPrefix}
                                  {
                                    formatCurrency(
                                      transaction.amount
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
                                  {
                                    isExpense
                                      ?
                                      "Expense Paid"
                                      :
                                      isDonation
                                        ?
                                        "Donation Received"
                                        :
                                        "Income Received"
                                  }
                                </p>

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
                  REPORT SUMMARY
              ================================================== */}

              {
                monthlyTransactions.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      marginTop: "24px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "18px",
                        flexWrap: "wrap"
                      }}
                    >

                      <div>

                        <h2
                          style={{
                            margin: "0 0 6px"
                          }}
                        >
                          🧾 Report Summary
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Financial summary for {formattedSelectedMonth}.
                        </p>

                      </div>


                      <span
                        style={{
                          padding: "7px 12px",
                          borderRadius: "999px",
                          background:
                            reportStatistics.monthlyBalance >= 0
                              ?
                              "#dcfce7"
                              :
                              "#fee2e2",
                          color:
                            reportStatistics.monthlyBalance >= 0
                              ?
                              "#15803d"
                              :
                              "#b91c1c",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}
                      >
                        {
                          reportStatistics.monthlyBalance >= 0
                            ?
                            "Positive Balance"
                            :
                            "Negative Balance"
                        }
                      </span>

                    </div>


                    <div
                      style={{
                        marginTop: "20px",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "14px"
                      }}
                    >

                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          Total Income
                        </p>

                        <strong
                          style={{
                            color: "#15803d"
                          }}
                        >
                          {
                            formatCurrency(
                              reportStatistics.monthlyIncome
                            )
                          }
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          Total Donations
                        </p>

                        <strong
                          style={{
                            color: "#be185d"
                          }}
                        >
                          {
                            formatCurrency(
                              reportStatistics.monthlyDonations
                            )
                          }
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          Total Expenses
                        </p>

                        <strong
                          style={{
                            color: "#b91c1c"
                          }}
                        >
                          {
                            formatCurrency(
                              reportStatistics.monthlyExpenses
                            )
                          }
                        </strong>
                      </div>


                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          Final Balance
                        </p>

                        <strong
                          style={{
                            color:
                              reportStatistics.monthlyBalance >= 0
                                ?
                                "#15803d"
                                :
                                "#b91c1c"
                          }}
                        >
                          {
                            formatCurrency(
                              reportStatistics.monthlyBalance
                            )
                          }
                        </strong>
                      </div>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  PAGE NAVIGATION ACTIONS
              ================================================== */}

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
                  to="/income-history"
                  className="action-btn view-btn"
                >
                  📈 Income History
                </Link>


                <Link
                  to="/expense-history"
                  className="action-btn"
                >
                  📉 Expense History
                </Link>


                <Link
                  to="/donors"
                  className="action-btn"
                >
                  ❤️ Donors
                </Link>


                <Link
                  to="/accounts"
                  className="action-btn"
                >
                  💰 Accounts Dashboard
                </Link>

              </div>


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
                🕌 Monthly Report combines Madrasa income, expenses, and donations to provide a clear financial overview for the selected month.
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

export default MonthlyReport;