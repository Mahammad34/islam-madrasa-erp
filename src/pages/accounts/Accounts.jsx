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

function Accounts() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

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
      amount
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
          amount
        )
      );

    };


  // ============================================================
  // GET FIREBASE DATE
  // ============================================================

  const getTransactionDate =
    (
      transaction
    ) => {

      const createdAt =
        transaction.createdAt;


      if (
        createdAt &&
        typeof createdAt.toDate ===
        "function"
      ) {

        return createdAt.toDate();

      }


      if (
        createdAt?.seconds
      ) {

        return new Date(
          createdAt.seconds * 1000
        );

      }


      if (
        transaction.date
      ) {

        const dateValue =
          new Date(
            `${transaction.date}T00:00:00`
          );


        if (
          !Number.isNaN(
            dateValue.getTime()
          )
        ) {

          return dateValue;

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
  // GET TRANSACTION TITLE
  // ============================================================

  const getTransactionTitle =
    (
      transaction
    ) => {

      return (

        transaction.description ||

        transaction.category ||

        transaction.donorName ||

        transaction.name ||

        `${transaction.type} Transaction`

      );

    };


  // ============================================================
  // FETCH ACCOUNTS DATA
  // ============================================================

  const fetchAccountsData =
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

              type:
                "Income",

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

              type:
                "Expense",

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

              type:
                "Donation",

              ...donationDocument.data()

            })
          );


        if (
          isMountedRef.current
        ) {

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

      }
      catch (
        error
      ) {

        console.error(
          "Error loading accounts dashboard:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load accounts data. Please check your connection and try again."
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
  // LOAD ACCOUNTS DATA
  // ============================================================

  useEffect(
    () => {

      fetchAccountsData();

    },
    []
  );


  // ============================================================
  // FINANCIAL STATISTICS
  // ============================================================

  const financialStatistics =
    useMemo(
      () => {

        const totalIncome =
          incomes.reduce(
            (
              total,
              income
            ) =>
              total +
              getNumber(
                income.amount
              ),
            0
          );


        const totalExpenses =
          expenses.reduce(
            (
              total,
              expense
            ) =>
              total +
              getNumber(
                expense.amount
              ),
            0
          );


        const totalDonations =
  donations.reduce(
    (
      total,
      donation
    ) =>
      total +
      getNumber(
  donation.donationAmount ??
  donation.amount
),
    0
  );


        const currentBalance =

          totalIncome +

          totalDonations -

          totalExpenses;


        return {

          totalIncome,

          totalExpenses,

          totalDonations,

          currentBalance

        };

      },
      [
        incomes,
        expenses,
        donations
      ]
    );


  // ============================================================
  // RECENT TRANSACTIONS
  // ============================================================

  const recentTransactions =
    useMemo(
      () => {

        return [

          ...incomes,

          ...expenses,

          ...donations

        ]
          .sort(
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

          )
          .slice(
            0,
            8
          );

      },
      [
        incomes,
        expenses,
        donations
      ]
    );


  // ============================================================
  // REFRESH ACCOUNTS DATA
  // ============================================================

  const refreshAccountsData =
    async () => {

      await fetchAccountsData(
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
              💰 Accounts Dashboard
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Manage Madrasa income, expenses, donations, salaries, categories, and financial reports.
            </p>

          </div>


          <button
            type="button"
            onClick={refreshAccountsData}
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
                "🔄 Refresh Dashboard"
            }
          </button>

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
                  Loading Accounts Dashboard...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the latest financial records are loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            MAIN DASHBOARD CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  FINANCIAL SUMMARY
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
                      fontSize: "30px",
                      marginBottom: "8px"
                    }}
                  >
                    💰
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        financialStatistics.totalIncome
                      )
                    }
                  </h2>


                  <p>
                    Total Income
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px"
                    }}
                  >
                    💸
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        financialStatistics.totalExpenses
                      )
                    }
                  </h2>


                  <p>
                    Total Expenses
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px"
                    }}
                  >
                    🏦
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        financialStatistics.currentBalance
                      )
                    }
                  </h2>


                  <p>
                    Current Balance
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px"
                    }}
                  >
                    ❤️
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        financialStatistics.totalDonations
                      )
                    }
                  </h2>


                  <p>
                    Total Donations
                  </p>

                </div>

              </div>


              {/* ==================================================
                  ACCOUNT HEALTH OVERVIEW
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
                    gap: "16px",
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
                      📊 Account Overview
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      A quick overview of the Madrasa's current financial records.
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: "999px",
                      background:
                        financialStatistics.currentBalance >= 0
                          ?
                          "#dcfce7"
                          :
                          "#fee2e2",
                      color:
                        financialStatistics.currentBalance >= 0
                          ?
                          "#15803d"
                          :
                          "#b91c1c",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    {
                      financialStatistics.currentBalance >= 0
                        ?
                        "✅ Positive Balance"
                        :
                        "⚠️ Negative Balance"
                    }
                  </span>

                </div>


                <div
                  style={{
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
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#15803d",
                        fontSize: "11px",
                        fontWeight: "800"
                      }}
                    >
                      INCOME RECORDS
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      {incomes.length}
                    </h2>

                  </div>


                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#b91c1c",
                        fontSize: "11px",
                        fontWeight: "800"
                      }}
                    >
                      EXPENSE RECORDS
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      {expenses.length}
                    </h2>

                  </div>


                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#c2410c",
                        fontSize: "11px",
                        fontWeight: "800"
                      }}
                    >
                      DONATION RECORDS
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      {donations.length}
                    </h2>

                  </div>


                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#1d4ed8",
                        fontSize: "11px",
                        fontWeight: "800"
                      }}
                    >
                      TOTAL TRANSACTIONS
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      {
                        incomes.length +
                        expenses.length +
                        donations.length
                      }
                    </h2>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  QUICK ACTIONS HEADER
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
                  ⚡ Quick Actions
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Access the main financial management tools.
                </p>

              </div>


              {/* ==================================================
                  QUICK ACTION MODULES
              ================================================== */}

              <div
                className="module-grid"
                style={{
                  marginBottom: "30px"
                }}
              >

                <Link
                  to="/quick-income"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      💵
                    </div>

                    <h3>
                      Quick Income
                    </h3>

                    <p>
                      Record new income transactions
                    </p>

                  </div>

                </Link>


                <Link
                  to="/quick-expense"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      💸
                    </div>

                    <h3>
                      Quick Expense
                    </h3>

                    <p>
                      Record Madrasa expenses
                    </p>

                  </div>

                </Link>


                <Link
                  to="/donors"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      ❤️
                    </div>

                    <h3>
                      Donors
                    </h3>

                    <p>
                      View and manage donor records
                    </p>

                  </div>

                </Link>


                <Link
                  to="/staff-salary"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      👳
                    </div>

                    <h3>
                      Staff Salary
                    </h3>

                    <p>
                      Manage staff salary records
                    </p>

                  </div>

                </Link>


                <Link
                  to="/income-history"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      📈
                    </div>

                    <h3>
                      Income History
                    </h3>

                    <p>
                      View complete income history
                    </p>

                  </div>

                </Link>


                <Link
                  to="/expense-history"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      📉
                    </div>

                    <h3>
                      Expense History
                    </h3>

                    <p>
                      View complete expense history
                    </p>

                  </div>

                </Link>


                <Link
                  to="/monthly-report"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      📊
                    </div>

                    <h3>
                      Monthly Report
                    </h3>

                    <p>
                      Review financial reports
                    </p>

                  </div>

                </Link>


                <Link
                  to="/manage-categories"
                  className="link"
                >

                  <div className="module-card">

                    <div className="module-icon">
                      ⚙️
                    </div>

                    <h3>
                      Categories
                    </h3>

                    <p>
                      Manage income and expense categories
                    </p>

                  </div>

                </Link>

              </div>
                            {/* ==================================================
                  RECENT TRANSACTIONS HEADER
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
                    📄 Recent Transactions
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Latest income, expense, and donation records.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  Showing {recentTransactions.length} Records
                </span>

              </div>


              {/* ==================================================
                  NO TRANSACTIONS EMPTY STATE
              ================================================== */}

              {
                recentTransactions.length === 0 && (

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
                        📄
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
                        Add an income, expense, or donation record to start tracking Madrasa finances.
                      </p>


                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                          flexWrap: "wrap"
                        }}
                      >

                        <Link
                          to="/quick-income"
                          className="action-btn view-btn"
                        >
                          💵 Add Income
                        </Link>


                        <Link
                          to="/quick-expense"
                          className="action-btn delete-btn"
                        >
                          💸 Add Expense
                        </Link>

                      </div>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  RECENT TRANSACTION RECORDS
              ================================================== */}

              {
                recentTransactions.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      recentTransactions.map(
                        (
                          transaction,
                          index
                        ) => {

                          const isIncome =
                            transaction.type ===
                            "Income";


                          const isExpense =
                            transaction.type ===
                            "Expense";


                          const isDonation =
                            transaction.type ===
                            "Donation";


                          return (

                            <div
                              key={
                                `${transaction.type}-${transaction.id}`
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "16px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  recentTransactions.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  TRANSACTION LEFT SECTION
                              ================================== */}

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
                                    width: "48px",
                                    height: "48px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "12px",
                                    background:
                                      isIncome
                                        ?
                                        "#dcfce7"
                                        :
                                        isExpense
                                          ?
                                          "#fee2e2"
                                          :
                                          "#fff7ed",
                                    fontSize: "23px",
                                    flexShrink: 0
                                  }}
                                >
                                  {
                                    isIncome
                                      ?
                                      "💵"
                                      :
                                      isExpense
                                        ?
                                        "💸"
                                        :
                                        "❤️"
                                  }
                                </div>


                                <div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap",
                                      marginBottom: "5px"
                                    }}
                                  >

                                    <h3
                                      style={{
                                        margin: 0
                                      }}
                                    >
                                      {
                                        getTransactionTitle(
                                          transaction
                                        )
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background:
                                          isIncome
                                            ?
                                            "#dcfce7"
                                            :
                                            isExpense
                                              ?
                                              "#fee2e2"
                                              :
                                              "#ffedd5",
                                        color:
                                          isIncome
                                            ?
                                            "#15803d"
                                            :
                                            isExpense
                                              ?
                                              "#b91c1c"
                                              :
                                              "#c2410c",
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      {transaction.type}
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

                                    {
                                      transaction.category && (

                                        <span>
                                          📂 {transaction.category}
                                        </span>

                                      )
                                    }


                                    {
                                      transaction.paymentMode && (

                                        <span>
                                          💳 {transaction.paymentMode}
                                        </span>

                                      )
                                    }


                                    {
                                      transaction.donorName && (

                                        <span>
                                          👤 {transaction.donorName}
                                        </span>

                                      )
                                    }


                                    <span>
                                      📅 {
                                        formatTransactionDate(
                                          transaction
                                        )
                                      }
                                    </span>

                                  </div>

                                </div>

                              </div>


                              {/* ==================================
                                  TRANSACTION AMOUNT
                              ================================== */}

                              <div
                                style={{
                                  textAlign: "right"
                                }}
                              >

                                <h3
                                  style={{
                                    margin: "0 0 5px",
                                    color:
                                      isIncome
                                        ?
                                        "#15803d"
                                        :
                                        isExpense
                                          ?
                                          "#b91c1c"
                                          :
                                          "#c2410c"
                                  }}
                                >
                                  {
                                    isExpense
                                      ?
                                      "-"
                                      :
                                      "+"
                                  }

                                 {
  formatCurrency(
    transaction.type === "Donation"
      ? (
          transaction.donationAmount ??
          transaction.amount
        )
      : transaction.amount
  )
}
                                </h3>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  {
                                    isIncome
                                      ?
                                      "Income Received"
                                      :
                                      isExpense
                                        ?
                                        "Expense Paid"
                                        :
                                        "Donation Received"
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
                  TRANSACTION HISTORY ACTIONS
              ================================================== */}

              {
                recentTransactions.length > 0 && (

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
                      📈 View Income History
                    </Link>


                    <Link
                      to="/expense-history"
                      className="action-btn delete-btn"
                    >
                      📉 View Expense History
                    </Link>


                    <Link
                      to="/monthly-report"
                      className="action-btn"
                    >
                      📊 View Monthly Report
                    </Link>

                  </div>

                )
              }


              {/* ==================================================
                  DASHBOARD INFORMATION
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
                🕌 The Accounts Dashboard provides a central overview of Madrasa income, expenses, donations, balances, and recent financial activity.
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

export default Accounts;