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

function QuickExpense() {

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

    }
  );


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    expenseCategories,
    setExpenseCategories
  ] = useState([]);


  const [
    expenses,
    setExpenses
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
  // FETCH QUICK EXPENSE DATA
  // ============================================================

  const fetchQuickExpenseData =
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
          expenseSnapshot
        ] =
          await Promise.all([

            getDocs(
              collection(
                db,
                "expenseCategories"
              )
            ),

            getDocs(
              collection(
                db,
                "expenses"
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


        expenseList.sort(
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

          setExpenseCategories(
            categoryList
          );


          setExpenses(
            expenseList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading quick expense data:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load expense records. Please check your connection and try again."
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
  // LOAD QUICK EXPENSE DATA
  // ============================================================

  useEffect(
    () => {

      fetchQuickExpenseData();

    },
    []
  );


  // ============================================================
  // SAVE EXPENSE
  // ============================================================

  const saveExpense =
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


      const expenseAmount =
        getNumber(
          amount
        );


      if (
        expenseAmount <= 0
      ) {

        setErrorMessage(
          "Please enter a valid expense amount greater than zero."
        );

        return;

      }


      if (
        !category
      ) {

        setErrorMessage(
          "Please select an expense category."
        );

        return;

      }


      if (
        !date
      ) {

        setErrorMessage(
          "Please select the expense date."
        );

        return;

      }


      setIsSaving(true);


      try {

        await addDoc(
          collection(
            db,
            "expenses"
          ),
          {

            amount:
              expenseAmount,

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
            "Expense saved successfully."
          );


          await fetchQuickExpenseData();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving expense:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the expense record. Please try again."
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
  // DELETE EXPENSE
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

          setExpenses(
            (
              currentExpenses
            ) =>
              currentExpenses.filter(
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
          "Error deleting expense:",
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
  // FILTER EXPENSE RECORDS
  // ============================================================

  const filteredExpenses =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return expenses.filter(
          (
            expense
          ) => {

            const searchableValues =
              [

                expense.category,

                expense.description,

                expense.paymentMethod,

                expense.date,

                expense.amount

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


            return (

              matchesSearch &&

              matchesCategory &&

              matchesPayment

            );

          }
        );

      },
      [
        expenses,
        searchTerm,
        categoryFilter,
        paymentFilter
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


        const todayExpense =
          expenses
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


        const cashExpenses =
          expenses
            .filter(
              (
                expense
              ) =>
                expense.paymentMethod ===
                "Cash"
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


        return {

          todayExpense,

          totalExpenses,

          cashExpenses,

          totalRecords:
            expenses.length,

          totalCategories:
            expenseCategories.length

        };

      },
      [
        expenses,
        expenseCategories
      ]
    );


  // ============================================================
  // REFRESH DATA
  // ============================================================

  const refreshData =
    async () => {

      setSuccessMessage("");

      await fetchQuickExpenseData(
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
              💸 Quick Expense
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Record and manage Madrasa expense transactions quickly and securely.
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
                  Loading Expense Records...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while expense records and categories are loaded.
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
                  EXPENSE SUMMARY
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
                        expenseStatistics.todayExpense
                      )
                    }
                  </h2>


                  <p>
                    Today's Expense
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
                    💵
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        expenseStatistics.cashExpenses
                      )
                    }
                  </h2>


                  <p>
                    Cash Expenses
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
                    Expense Records
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
                    {expenseStatistics.totalCategories}
                  </h2>


                  <p>
                    Categories
                  </p>

                </div>

              </div>


              {/* ==================================================
                  ADD EXPENSE FORM
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
                      ➕ Add Expense
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Enter the transaction details below to record a new Madrasa expense.
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
                    💸 Expense Entry
                  </span>

                </div>


                {/* ==================================================
                    NO CATEGORIES WARNING
                ================================================== */}

                {
                  expenseCategories.length === 0 && (

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
                      ⚠️ No expense categories are available. Create an expense category from the Categories page before adding an expense.
                    </div>

                  )
                }


                <form
                  onSubmit={saveExpense}
                >

                  <div className="form-grid">

                    {/* ============================================
                        AMOUNT
                    ============================================ */}

                    <div>

                      <label>
                        Expense Amount *
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
                        Expense Category *
                      </label>


                      <select
                        value={category}
                        disabled={
                          isSaving ||
                          expenseCategories.length === 0
                        }
                        onChange={(event) =>
                          setCategory(
                            event.target.value
                          )
                        }
                      >

                        <option value="">
                          Select Expense Category
                        </option>


                        {
                          expenseCategories.map(
                            (
                              expenseCategory
                            ) => (

                              <option
                                key={expenseCategory.id}
                                value={expenseCategory.name}
                              >
                                {expenseCategory.name}
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
                        Expense Date *
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
                      placeholder="Enter expense description or notes..."
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
                        expenseCategories.length === 0
                      }
                    >
                      {
                        isSaving
                          ?
                          "⏳ Saving Expense..."
                          :
                          "💾 Save Expense"
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
                      🔍 Search Expense Records
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search and filter expenses by category, description, amount, payment method, or date.
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
                      Search Expense
                    </label>


                    <input
                      type="text"
                      placeholder="Search expense records..."
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
                        expenseCategories.map(
                          (
                            expenseCategory
                          ) => (

                            <option
                              key={expenseCategory.id}
                              value={expenseCategory.name}
                            >
                              {expenseCategory.name}
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
                  EXPENSE RECORDS HEADER
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
                    📄 Expense Records
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
                      {filteredExpenses.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {expenses.length}
                    </strong>
                    {" "}
                    expense records
                  </p>

                </div>

              </div>
                            {/* ==================================================
                  NO EXPENSE RECORDS
              ================================================== */}

              {
                expenses.length === 0 && (

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
                        💸
                      </div>


                      <h2>
                        No Expense Records Yet
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Add your first expense transaction using the form above to start tracking Madrasa expenses.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                expenses.length > 0 &&
                filteredExpenses.length === 0 && (

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
                  EXPENSE RECORDS
              ================================================== */}

              {
                filteredExpenses.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredExpenses.map(
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
                                  filteredExpenses.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  EXPENSE LEFT SECTION
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

                                </div>

                              </div>


                              {/* ==================================
                                  EXPENSE AMOUNT
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
                                  EXPENSE ACTIONS
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
                  EXPENSE HISTORY ACTION
              ================================================== */}

              {
                expenses.length > 0 && (

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px"
                    }}
                  >

                    <Link
                      to="/expense-history"
                      className="action-btn view-btn"
                    >
                      📉 View Complete Expense History
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
                🕌 Every expense transaction recorded here is stored in the Madrasa accounts database and included in the Accounts Dashboard financial calculations.
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

export default QuickExpense;