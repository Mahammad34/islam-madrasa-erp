import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp
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

function QuickIncome() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    amount,
    setAmount
  ] = useState("");


  const [
    category,
    setCategory
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("Cash");


  const [
    date,
    setDate
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    incomeCategories,
    setIncomeCategories
  ] = useState([]);


  const [
    incomes,
    setIncomes
  ] = useState([]);


  // ============================================================
  // SEARCH AND FILTER STATES
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
    isSaving,
    setIsSaving
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
  // GET FIREBASE DATE
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
  // FETCH QUICK INCOME DATA
  // ============================================================

  const fetchQuickIncomeData =
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
          categorySnapshot,
          incomeSnapshot
        ] =
          await Promise.all([

            getDocs(
              collection(
                db,
                "incomeCategories"
              )
            ),

            getDocs(
              collection(
                db,
                "income"
              )
            )

          ]);


        const categoryList =
          categorySnapshot.docs.map(
            (
              categoryDocument
            ) => ({

              id:
                categoryDocument.id,

              ...categoryDocument.data()

            })
          );


        categoryList.sort(
          (
            firstCategory,
            secondCategory
          ) =>
            String(
              firstCategory.name || ""
            ).localeCompare(
              String(
                secondCategory.name || ""
              )
            )
        );


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


        incomeList.sort(
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

          setIncomeCategories(
            categoryList
          );


          setIncomes(
            incomeList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading quick income data:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load income records. Please check your connection and try again."
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
  // LOAD QUICK INCOME DATA
  // ============================================================

  useEffect(
    () => {

      fetchQuickIncomeData();

    },
    []
  );


  // ============================================================
  // SAVE INCOME
  // ============================================================

  const saveIncome =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        isSaving
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");


      const incomeAmount =
        getNumber(
          amount
        );


      if (
        incomeAmount <= 0
      ) {

        setErrorMessage(
          "Please enter a valid income amount greater than zero."
        );

        return;

      }


      if (
        !category
      ) {

        setErrorMessage(
          "Please select an income category."
        );

        return;

      }


      if (
        !date
      ) {

        setErrorMessage(
          "Please select the income date."
        );

        return;

      }


      setIsSaving(true);


      try {

        await addDoc(
          collection(
            db,
            "income"
          ),
          {

            amount:
              incomeAmount,

            category,

            description:
              description.trim(),

            paymentMethod,

            date,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          setAmount("");

          setCategory("");

          setDescription("");

          setPaymentMethod(
            "Cash"
          );

          setDate(
            getTodayDate()
          );


          setSuccessMessage(
            "Income saved successfully."
          );


          await fetchQuickIncomeData();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving income:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the income record. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsSaving(false);

        }

      }

    };


  // ============================================================
  // DELETE INCOME
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

          setIncomes(
            (
              currentIncomes
            ) =>
              currentIncomes.filter(
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
          "Error deleting income:",
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
  // FILTER INCOME RECORDS
  // ============================================================

  const filteredIncomes =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return incomes.filter(
          (
            income
          ) => {

            const searchableValues =
              [

                income.category,

                income.description,

                income.paymentMethod,

                income.date,

                income.amount

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


            return (

              matchesSearch &&

              matchesCategory &&

              matchesPayment

            );

          }
        );

      },
      [
        incomes,
        searchTerm,
        categoryFilter,
        paymentFilter
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


        const todayIncome =
          incomes
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


        const cashIncome =
          incomes
            .filter(
              (
                income
              ) =>
                income.paymentMethod ===
                "Cash"
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


        return {

          todayIncome,

          totalIncome,

          cashIncome,

          totalRecords:
            incomes.length,

          totalCategories:
            incomeCategories.length

        };

      },
      [
        incomes,
        incomeCategories
      ]
    );


  // ============================================================
  // REFRESH DATA
  // ============================================================

  const refreshData =
    async () => {

      setSuccessMessage("");

      await fetchQuickIncomeData(
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

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    categoryFilter !== "All" ||

    paymentFilter !== "All";
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
              💰 Quick Income
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Record and manage Madrasa income transactions quickly and securely.
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
              onClick={refreshData}
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
                  Loading Income Records...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while income records and categories are loaded.
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
                  INCOME SUMMARY
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
                    💵
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        incomeStatistics.cashIncome
                      )
                    }
                  </h2>


                  <p>
                    Cash Income
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
                    Income Records
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📂
                  </div>


                  <h2>
                    {incomeStatistics.totalCategories}
                  </h2>


                  <p>
                    Categories
                  </p>

                </div>

              </div>


              {/* ==================================================
                  ADD INCOME FORM
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
                    marginBottom: "22px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      ➕ Add Income
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Enter the transaction details below to record new income.
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
                    💰 Income Entry
                  </span>

                </div>


                {/* ==================================================
                    NO CATEGORIES WARNING
                ================================================== */}

                {
                  incomeCategories.length === 0 && (

                    <div
                      style={{
                        padding: "14px 16px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#c2410c",
                        lineHeight: "1.7"
                      }}
                    >
                      ⚠️ No income categories are available. Create an income category from the Categories page before adding income.
                    </div>

                  )
                }


                <form
                  onSubmit={saveIncome}
                >

                  <div
                    className="form-grid"
                  >

                    {/* ============================================
                        AMOUNT
                    ============================================ */}

                    <div>

                      <label>
                        Income Amount *
                      </label>


                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        min="0"
                        step="0.01"
                        disabled={isSaving}
                        onChange={(event) =>
                          setAmount(
                            event.target.value
                          )
                        }
                      />

                    </div>


                    {/* ============================================
                        CATEGORY
                    ============================================ */}

                    <div>

                      <label>
                        Income Category *
                      </label>


                      <select
                        value={category}
                        disabled={
                          isSaving ||
                          incomeCategories.length === 0
                        }
                        onChange={(event) =>
                          setCategory(
                            event.target.value
                          )
                        }
                      >

                        <option value="">
                          Select Income Category
                        </option>


                        {
                          incomeCategories.map(
                            (
                              incomeCategory
                            ) => (

                              <option
                                key={incomeCategory.id}
                                value={incomeCategory.name}
                              >
                                {incomeCategory.name}
                              </option>

                            )
                          )
                        }

                      </select>

                    </div>


                    {/* ============================================
                        PAYMENT METHOD
                    ============================================ */}

                    <div>

                      <label>
                        Payment Method *
                      </label>


                      <select
                        value={paymentMethod}
                        disabled={isSaving}
                        onChange={(event) =>
                          setPaymentMethod(
                            event.target.value
                          )
                        }
                      >

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
                        DATE
                    ============================================ */}

                    <div>

                      <label>
                        Income Date *
                      </label>


                      <input
                        type="date"
                        value={date}
                        disabled={isSaving}
                        onChange={(event) =>
                          setDate(
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* ==============================================
                      DESCRIPTION
                  ============================================== */}

                  <div
                    style={{
                      marginTop: "16px"
                    }}
                  >

                    <label>
                      Description
                    </label>


                    <textarea
                      placeholder="Enter income description or notes..."
                      value={description}
                      rows="4"
                      disabled={isSaving}
                      onChange={(event) =>
                        setDescription(
                          event.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        resize: "vertical"
                      }}
                    />

                  </div>


                  {/* ==============================================
                      FORM ACTION
                  ============================================== */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "20px"
                    }}
                  >

                    <button
                      type="submit"
                      className="save-all-btn"
                      disabled={
                        isSaving ||
                        incomeCategories.length === 0
                      }
                    >
                      {
                        isSaving
                          ?
                          "⏳ Saving Income..."
                          :
                          "💾 Save Income"
                      }
                    </button>

                  </div>

                </form>

              </div>


              {/* ==================================================
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                      🔍 Search Income Records
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search and filter income transactions by category, description, amount, payment method, or date.
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
                      Search Income
                    </label>


                    <input
                      type="text"
                      placeholder="Search income records..."
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
                              key={incomeCategory.id}
                              value={incomeCategory.name}
                            >
                              {incomeCategory.name}
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

                </div>

              </div>


              {/* ==================================================
                  INCOME RECORDS HEADER
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
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
                    📄 Income Records
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {filteredIncomes.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {incomes.length}
                    </strong>
                    {" "}
                    income records
                  </p>

                </div>

              </div>
                            {/* ==================================================
                  NO INCOME RECORDS
              ================================================== */}

              {
                incomes.length === 0 && (

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
                        💰
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
                        Add your first income transaction using the form above to start tracking Madrasa income.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                incomes.length > 0 &&
                filteredIncomes.length === 0 && (

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
                          color: "#64748b"
                        }}
                      >
                        Try changing the search text or clearing the active filters.
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
                  INCOME RECORDS
              ================================================== */}

              {
                filteredIncomes.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredIncomes.map(
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
                                  filteredIncomes.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  INCOME LEFT SECTION
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

                                </div>

                              </div>


                              {/* ==================================
                                  INCOME AMOUNT
                              ================================== */}

                              <div
                                style={{
                                  minWidth: "150px",
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
                                  INCOME ACTIONS
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
                  INCOME HISTORY ACTION
              ================================================== */}

              {
                incomes.length > 0 && (

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px"
                    }}
                  >

                    <Link
                      to="/income-history"
                      className="action-btn view-btn"
                    >
                      📈 View Complete Income History
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
                🕌 Every income transaction recorded here is stored in the Madrasa accounts database and included in the Accounts Dashboard financial calculations.
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

export default QuickIncome;