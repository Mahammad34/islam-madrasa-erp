import {
  collection,
  deleteDoc,
  doc,
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

function ExpenseHistory() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    expenseList,
    setExpenseList
  ] = useState([]);


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    categoryFilter,
    setCategoryFilter
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
    isRefreshing,
    setIsRefreshing
  ] = useState(false);


  const [
    deletingExpenseId,
    setDeletingExpenseId
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
  // GET EXPENSE DATE
  // ============================================================

  const getExpenseDate =
    (
      expense
    ) => {

      if (
        expense.createdAt &&
        typeof expense.createdAt.toDate ===
        "function"
      ) {

        return expense.createdAt.toDate();

      }


      if (
        expense.createdAt?.seconds
      ) {

        return new Date(
          expense.createdAt.seconds *
          1000
        );

      }


      if (
        expense.date
      ) {

        const convertedDate =
          new Date(
            `${expense.date}T00:00:00`
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
  // FORMAT EXPENSE DATE
  // ============================================================

  const formatExpenseDate =
    (
      expense
    ) => {

      const expenseDate =
        getExpenseDate(
          expense
        );


      if (
        expenseDate.getTime() === 0
      ) {

        return "Date Not Available";

      }


      return expenseDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FETCH EXPENSE HISTORY
  // ============================================================

  const fetchExpenses =
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
              "expenses"
            )
          );


        const expenseData =
          querySnapshot.docs.map(
            (
              expenseDocument
            ) => ({

              id:
                expenseDocument.id,

              ...expenseDocument.data()

            })
          );


        expenseData.sort(
          (
            firstExpense,
            secondExpense
          ) =>

            getExpenseDate(
              secondExpense
            ).getTime() -

            getExpenseDate(
              firstExpense
            ).getTime()

        );


        if (
          isMountedRef.current
        ) {

          setExpenseList(
            expenseData
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading expense history:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load expense history. Please check your connection and try again."
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
  // LOAD EXPENSE HISTORY
  // ============================================================

  useEffect(
    () => {

      fetchExpenses();

    },
    []
  );


  // ============================================================
  // DELETE EXPENSE RECORD
  // ============================================================

  const deleteExpense =
    async (
      expense
    ) => {

      if (
        deletingExpenseId
      ) {

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete the ${formatCurrency(
            expense.amount
          )} expense record permanently?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setDeletingExpenseId(
        expense.id
      );


      try {

        await deleteDoc(
          doc(
            db,
            "expenses",
            expense.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setExpenseList(
            (
              currentExpenseList
            ) =>
              currentExpenseList.filter(
                (
                  currentExpense
                ) =>
                  currentExpense.id !==
                  expense.id
              )
          );


          setSuccessMessage(
            "Expense record deleted successfully."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting expense record:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the expense record. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setDeletingExpenseId("");

        }

      }

    };


  // ============================================================
  // UNIQUE EXPENSE CATEGORIES
  // ============================================================

  const expenseCategories =
    useMemo(
      () => {

        return [

          ...new Set(

            expenseList

              .map(
                (
                  expense
                ) =>
                  expense.category
              )

              .filter(
                Boolean
              )

          )

        ].sort();

      },
      [
        expenseList
      ]
    );


  // ============================================================
  // FILTER EXPENSE HISTORY
  // ============================================================

  const filteredExpenseList =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return expenseList.filter(
          (
            expense
          ) => {

            const searchableValues =
              [

                expense.amount,

                expense.category,

                expense.description,

                expense.paymentMethod,

                expense.date

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


            const matchesCategory =
              categoryFilter === "All" ||

              expense.category ===
                categoryFilter;


            const matchesPayment =
              paymentFilter === "All" ||

              expense.paymentMethod ===
                paymentFilter;


            const matchesStartDate =
              !startDate ||

              (
                expense.date &&
                expense.date >= startDate
              );


            const matchesEndDate =
              !endDate ||

              (
                expense.date &&
                expense.date <= endDate
              );


            return (

              matchesSearch &&

              matchesCategory &&

              matchesPayment &&

              matchesStartDate &&

              matchesEndDate

            );

          }
        );

      },
      [
        expenseList,
        searchTerm,
        categoryFilter,
        paymentFilter,
        startDate,
        endDate
      ]
    );


  // ============================================================
  // EXPENSE STATISTICS
  // ============================================================

  const expenseStatistics =
    useMemo(
      () => {

        const today =
          getTodayDate();


        const totalExpenses =
          expenseList.reduce(
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


        const todayExpenses =
          expenseList

            .filter(
              (
                expense
              ) =>
                expense.date ===
                today
            )

            .reduce(
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


        const filteredTotal =
          filteredExpenseList.reduce(
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


        return {

          totalExpenses,

          todayExpenses,

          filteredTotal,

          totalRecords:
            expenseList.length,

          filteredRecords:
            filteredExpenseList.length

        };

      },
      [
        expenseList,
        filteredExpenseList
      ]
    );


  // ============================================================
  // REFRESH EXPENSE HISTORY
  // ============================================================

  const refreshExpenseHistory =
    async () => {

      setSuccessMessage("");

      await fetchExpenses(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setCategoryFilter("All");

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

    categoryFilter !== "All" ||

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
              📉 Expense History
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View, search, filter, and manage all Madrasa expense transactions.
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
              to="/quick-expense"
              className="action-btn view-btn"
            >
              ➕ Add Expense
            </Link>


            <button
              type="button"
              onClick={refreshExpenseHistory}
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
                  Loading Expense History...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the latest expense records are loaded.
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
                  EXPENSE SUMMARY CARDS
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
                    💸
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        expenseStatistics.totalExpenses
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
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📅
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        expenseStatistics.todayExpenses
                      )
                    }
                  </h2>


                  <p>
                    Today's Expenses
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
                    {expenseStatistics.totalRecords}
                  </h2>


                  <p>
                    Total Records
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
                        expenseStatistics.filteredTotal
                      )
                    }
                  </h2>


                  <p>
                    Filtered Expenses
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
                    {expenseStatistics.filteredRecords}
                  </h2>


                  <p>
                    Matching Records
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
                      🔍 Search & Filter Expenses
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find expense transactions by keyword, category, payment method, or date range.
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
                      Search Expense
                    </label>


                    <input
                      type="text"
                      placeholder="Search amount, category or description..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* ============================================
                      CATEGORY FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Category
                    </label>


                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Categories
                      </option>


                      {
                        expenseCategories.map(
                          (
                            expenseCategory
                          ) => (

                            <option
                              key={expenseCategory}
                              value={expenseCategory}
                            >
                              {expenseCategory}
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

                      <option value="Cash">
                        Cash
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>

                      <option value="Cheque">
                        Cheque
                      </option>

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
                    color: "#64748b"
                  }}
                >
                  Showing
                  {" "}
                  <strong>
                    {filteredExpenseList.length}
                  </strong>
                  {" "}
                  of
                  {" "}
                  <strong>
                    {expenseList.length}
                  </strong>
                  {" "}
                  expense records with a total value of
                  {" "}
                  <strong
                    style={{
                      color: "#b91c1c"
                    }}
                  >
                    {
                      formatCurrency(
                        expenseStatistics.filteredTotal
                      )
                    }
                  </strong>
                </div>

              </div>


              {/* ==================================================
                  EXPENSE RECORDS HEADER
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
                    📄 Expense Transactions
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Complete history of recorded Madrasa expense transactions.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {filteredExpenseList.length} Records
                </span>

              </div>
                            {/* ==================================================
                  NO EXPENSE RECORDS
              ================================================== */}

              {
                expenseList.length === 0 && (

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
                        📉
                      </div>


                      <h2>
                        No Expense Records Yet
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No expense transactions have been recorded yet. Add your first expense entry to start building the Madrasa financial history.
                      </p>


                      <Link
                        to="/quick-expense"
                        className="action-btn view-btn"
                      >
                        ➕ Add First Expense
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                expenseList.length > 0 &&
                filteredExpenseList.length === 0 && (

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
                        No Matching Expense Records Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No expense transactions match your current search and filter settings.
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
                  EXPENSE TRANSACTION RECORDS
              ================================================== */}

              {
                filteredExpenseList.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredExpenseList.map(
                        (
                          expense,
                          index
                        ) => {

                          const isDeleting =
                            deletingExpenseId ===
                            expense.id;


                          return (

                            <div
                              key={expense.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  filteredExpenseList.length - 1
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
                                    background: "#fee2e2",
                                    fontSize: "24px",
                                    flexShrink: 0
                                  }}
                                >
                                  💸
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
                                        expense.description ||
                                        expense.category ||
                                        "Expense Transaction"
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background: "#fee2e2",
                                        color: "#b91c1c",
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      EXPENSE
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
                                        expense.category ||
                                        "No Category"
                                      }
                                    </span>


                                    <span>
                                      💳 {
                                        expense.paymentMethod ||
                                        "Not Available"
                                      }
                                    </span>


                                    <span>
                                      📅 {
                                        formatExpenseDate(
                                          expense
                                        )
                                      }
                                    </span>

                                  </div>


                                  {
                                    expense.description && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {expense.description}
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
                                  minWidth: "160px",
                                  textAlign: "right"
                                }}
                              >

                                <h2
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#b91c1c"
                                  }}
                                >
                                  -{
                                    formatCurrency(
                                      expense.amount
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
                                  Expense Paid
                                </p>

                              </div>


                              {/* ==================================
                                  TRANSACTION ACTIONS
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
                                      deletingExpenseId
                                    )
                                  }
                                  onClick={
                                    () =>
                                      deleteExpense(
                                        expense
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
                expenseList.length > 0 && (

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
                      to="/quick-expense"
                      className="action-btn view-btn"
                    >
                      ➕ Add New Expense
                    </Link>


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
                🕌 Expense History provides a complete record of Madrasa expense transactions and helps administrators review spending using search, category, payment method, and date filters.
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

export default ExpenseHistory;