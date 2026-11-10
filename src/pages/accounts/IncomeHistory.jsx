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

function IncomeHistory() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    incomeList,
    setIncomeList
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
    deletingIncomeId,
    setDeletingIncomeId
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
  // GET INCOME DATE
  // ============================================================

  const getIncomeDate =
    (
      income
    ) => {

      if (
        income.createdAt &&
        typeof income.createdAt.toDate ===
        "function"
      ) {

        return income.createdAt.toDate();

      }


      if (
        income.createdAt?.seconds
      ) {

        return new Date(
          income.createdAt.seconds *
          1000
        );

      }


      if (
        income.date
      ) {

        const convertedDate =
          new Date(
            `${income.date}T00:00:00`
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
  // FORMAT INCOME DATE
  // ============================================================

  const formatIncomeDate =
    (
      income
    ) => {

      const incomeDate =
        getIncomeDate(
          income
        );


      if (
        incomeDate.getTime() === 0
      ) {

        return "Date Not Available";

      }


      return incomeDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FETCH INCOME HISTORY
  // ============================================================

  const fetchIncome =
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
              "income"
            )
          );


        const incomeData =
          querySnapshot.docs.map(
            (
              incomeDocument
            ) => ({

              id:
                incomeDocument.id,

              ...incomeDocument.data()

            })
          );


        incomeData.sort(
          (
            firstIncome,
            secondIncome
          ) =>

            getIncomeDate(
              secondIncome
            ).getTime() -

            getIncomeDate(
              firstIncome
            ).getTime()

        );


        if (
          isMountedRef.current
        ) {

          setIncomeList(
            incomeData
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading income history:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load income history. Please check your connection and try again."
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
  // LOAD INCOME HISTORY
  // ============================================================

  useEffect(
    () => {

      fetchIncome();

    },
    []
  );


  // ============================================================
  // DELETE INCOME RECORD
  // ============================================================

  const deleteIncome =
    async (
      income
    ) => {

      if (
        deletingIncomeId
      ) {

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete the ${formatCurrency(
            income.amount
          )} income record permanently?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setDeletingIncomeId(
        income.id
      );


      try {

        await deleteDoc(
          doc(
            db,
            "income",
            income.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setIncomeList(
            (
              currentIncomeList
            ) =>
              currentIncomeList.filter(
                (
                  currentIncome
                ) =>
                  currentIncome.id !==
                  income.id
              )
          );


          setSuccessMessage(
            "Income record deleted successfully."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting income record:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the income record. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setDeletingIncomeId("");

        }

      }

    };


  // ============================================================
  // UNIQUE CATEGORIES
  // ============================================================

  const incomeCategories =
    useMemo(
      () => {

        return [

          ...new Set(

            incomeList

              .map(
                (
                  income
                ) =>
                  income.category
              )

              .filter(
                Boolean
              )

          )

        ].sort();

      },
      [
        incomeList
      ]
    );


  // ============================================================
  // FILTER INCOME HISTORY
  // ============================================================

  const filteredIncomeList =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return incomeList.filter(
          (
            income
          ) => {

            const searchableValues =
              [

                income.amount,

                income.category,

                income.description,

                income.paymentMethod,

                income.date

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

              income.category ===
                categoryFilter;


            const matchesPayment =
              paymentFilter === "All" ||

              income.paymentMethod ===
                paymentFilter;


            const matchesStartDate =
              !startDate ||

              (
                income.date &&
                income.date >= startDate
              );


            const matchesEndDate =
              !endDate ||

              (
                income.date &&
                income.date <= endDate
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
        incomeList,
        searchTerm,
        categoryFilter,
        paymentFilter,
        startDate,
        endDate
      ]
    );


  // ============================================================
  // INCOME STATISTICS
  // ============================================================

  const incomeStatistics =
    useMemo(
      () => {

        const today =
          getTodayDate();


        const totalIncome =
          incomeList.reduce(
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


        const todayIncome =
          incomeList

            .filter(
              (
                income
              ) =>
                income.date ===
                today
            )

            .reduce(
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


        const filteredTotal =
          filteredIncomeList.reduce(
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


        return {

          totalIncome,

          todayIncome,

          filteredTotal,

          totalRecords:
            incomeList.length,

          filteredRecords:
            filteredIncomeList.length

        };

      },
      [
        incomeList,
        filteredIncomeList
      ]
    );


  // ============================================================
  // REFRESH INCOME HISTORY
  // ============================================================

  const refreshIncomeHistory =
    async () => {

      setSuccessMessage("");

      await fetchIncome(
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
              📈 Income History
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View, search, filter, and manage all Madrasa income transactions.
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
              to="/quick-income"
              className="action-btn view-btn"
            >
              ➕ Add Income
            </Link>


            <button
              type="button"
              onClick={refreshIncomeHistory}
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
                  Loading Income History...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the latest income records are loaded.
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
                  INCOME SUMMARY CARDS
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
                        incomeStatistics.totalIncome
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
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📅
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        incomeStatistics.todayIncome
                      )
                    }
                  </h2>


                  <p>
                    Today's Income
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
                    {incomeStatistics.totalRecords}
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
                        incomeStatistics.filteredTotal
                      )
                    }
                  </h2>


                  <p>
                    Filtered Income
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
                    {incomeStatistics.filteredRecords}
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
                      🔍 Search & Filter Income
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find income transactions by keyword, category, payment method, or date range.
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
                      Search Income
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
                        incomeCategories.map(
                          (
                            incomeCategory
                          ) => (

                            <option
                              key={incomeCategory}
                              value={incomeCategory}
                            >
                              {incomeCategory}
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
                    {filteredIncomeList.length}
                  </strong>
                  {" "}
                  of
                  {" "}
                  <strong>
                    {incomeList.length}
                  </strong>
                  {" "}
                  income records with a total value of
                  {" "}
                  <strong
                    style={{
                      color: "#15803d"
                    }}
                  >
                    {
                      formatCurrency(
                        incomeStatistics.filteredTotal
                      )
                    }
                  </strong>
                </div>

              </div>


              {/* ==================================================
                  INCOME RECORDS HEADER
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
                    📄 Income Transactions
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Complete history of recorded Madrasa income transactions.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#dcfce7",
                    color: "#15803d",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {filteredIncomeList.length} Records
                </span>

              </div>
                            {/* ==================================================
                  NO INCOME RECORDS
              ================================================== */}

              {
                incomeList.length === 0 && (

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
                        📈
                      </div>


                      <h2>
                        No Income Records Yet
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No income transactions have been recorded yet. Add your first income entry to start building the Madrasa financial history.
                      </p>


                      <Link
                        to="/quick-income"
                        className="action-btn view-btn"
                      >
                        ➕ Add First Income
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                incomeList.length > 0 &&
                filteredIncomeList.length === 0 && (

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
                        No Matching Income Records Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No income transactions match your current search and filter settings.
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
                  INCOME TRANSACTION RECORDS
              ================================================== */}

              {
                filteredIncomeList.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredIncomeList.map(
                        (
                          income,
                          index
                        ) => {

                          const isDeleting =
                            deletingIncomeId ===
                            income.id;


                          return (

                            <div
                              key={income.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  filteredIncomeList.length - 1
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
                                    background: "#dcfce7",
                                    fontSize: "24px",
                                    flexShrink: 0
                                  }}
                                >
                                  💵
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
                                        income.description ||
                                        income.category ||
                                        "Income Transaction"
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background: "#dcfce7",
                                        color: "#15803d",
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      INCOME
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
                                        income.category ||
                                        "No Category"
                                      }
                                    </span>


                                    <span>
                                      💳 {
                                        income.paymentMethod ||
                                        "Not Available"
                                      }
                                    </span>


                                    <span>
                                      📅 {
                                        formatIncomeDate(
                                          income
                                        )
                                      }
                                    </span>

                                  </div>


                                  {
                                    income.description && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {income.description}
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
                                    color: "#15803d"
                                  }}
                                >
                                  +{
                                    formatCurrency(
                                      income.amount
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
                                  Income Received
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
                                      deletingIncomeId
                                    )
                                  }
                                  onClick={
                                    () =>
                                      deleteIncome(
                                        income
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
                incomeList.length > 0 && (

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
                      to="/quick-income"
                      className="action-btn view-btn"
                    >
                      ➕ Add New Income
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
                🕌 Income History provides a complete record of Madrasa income transactions and helps administrators review financial activity using search, category, payment method, and date filters.
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

export default IncomeHistory;