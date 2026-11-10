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

function ManageCategories() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    incomeCategories,
    setIncomeCategories
  ] = useState([]);


  const [
    expenseCategories,
    setExpenseCategories
  ] = useState([]);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    newIncomeCategory,
    setNewIncomeCategory
  ] = useState("");


  const [
    newExpenseCategory,
    setNewExpenseCategory
  ] = useState("");


  // ============================================================
  // SEARCH STATES
  // ============================================================

  const [
    incomeSearchTerm,
    setIncomeSearchTerm
  ] = useState("");


  const [
    expenseSearchTerm,
    setExpenseSearchTerm
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
    isAddingIncome,
    setIsAddingIncome
  ] = useState(false);


  const [
    isAddingExpense,
    setIsAddingExpense
  ] = useState(false);


  const [
    deletingCategory,
    setDeletingCategory
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
  // SORT CATEGORIES
  // ============================================================

  const sortCategories =
    (
      categoryList
    ) => {

      return [

        ...categoryList

      ].sort(
        (
          firstCategory,
          secondCategory
        ) =>

          String(
            firstCategory.name ||
            ""
          ).localeCompare(

            String(
              secondCategory.name ||
              ""
            ),

            undefined,

            {
              sensitivity: "base"
            }

          )

      );

    };


  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

  const fetchCategories =
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
          expenseSnapshot
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
                "expenseCategories"
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


        if (
          isMountedRef.current
        ) {

          setIncomeCategories(
            sortCategories(
              incomeList
            )
          );


          setExpenseCategories(
            sortCategories(
              expenseList
            )
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading categories:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load categories. Please check your connection and try again."
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
  // LOAD CATEGORIES
  // ============================================================

  useEffect(
    () => {

      fetchCategories();

    },
    []
  );


  // ============================================================
  // CHECK DUPLICATE CATEGORY
  // ============================================================

  const categoryExists =
    (
      categoryList,
      categoryName
    ) => {

      const normalizedCategoryName =
        normalizeValue(
          categoryName
        );


      return categoryList.some(
        (
          category
        ) =>

          normalizeValue(
            category.name
          ) ===
          normalizedCategoryName

      );

    };


  // ============================================================
  // ADD INCOME CATEGORY
  // ============================================================

  const addIncomeCategory =
    async () => {

      if (
        isAddingIncome
      ) {

        return;

      }


      const categoryName =
        newIncomeCategory.trim();


      if (
        !categoryName
      ) {

        setErrorMessage(
          "Please enter an income category name."
        );

        return;

      }


      if (
        categoryExists(
          incomeCategories,
          categoryName
        )
      ) {

        setErrorMessage(
          "This income category already exists."
        );

        return;

      }


      setIsAddingIncome(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const categoryReference =
          await addDoc(
            collection(
              db,
              "incomeCategories"
            ),
            {

              name:
                categoryName,

              createdAt:
                serverTimestamp()

            }
          );


        const newCategory = {

          id:
            categoryReference.id,

          name:
            categoryName

        };


        if (
          isMountedRef.current
        ) {

          setIncomeCategories(
            (
              currentCategories
            ) =>

              sortCategories([

                ...currentCategories,

                newCategory

              ])
          );


          setNewIncomeCategory("");


          setSuccessMessage(
            `Income category "${categoryName}" added successfully.`
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error adding income category:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to add the income category. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsAddingIncome(false);

        }

      }

    };


  // ============================================================
  // ADD EXPENSE CATEGORY
  // ============================================================

  const addExpenseCategory =
    async () => {

      if (
        isAddingExpense
      ) {

        return;

      }


      const categoryName =
        newExpenseCategory.trim();


      if (
        !categoryName
      ) {

        setErrorMessage(
          "Please enter an expense category name."
        );

        return;

      }


      if (
        categoryExists(
          expenseCategories,
          categoryName
        )
      ) {

        setErrorMessage(
          "This expense category already exists."
        );

        return;

      }


      setIsAddingExpense(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const categoryReference =
          await addDoc(
            collection(
              db,
              "expenseCategories"
            ),
            {

              name:
                categoryName,

              createdAt:
                serverTimestamp()

            }
          );


        const newCategory = {

          id:
            categoryReference.id,

          name:
            categoryName

        };


        if (
          isMountedRef.current
        ) {

          setExpenseCategories(
            (
              currentCategories
            ) =>

              sortCategories([

                ...currentCategories,

                newCategory

              ])
          );


          setNewExpenseCategory("");


          setSuccessMessage(
            `Expense category "${categoryName}" added successfully.`
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error adding expense category:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to add the expense category. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsAddingExpense(false);

        }

      }

    };


  // ============================================================
  // DELETE CATEGORY
  // ============================================================

  const deleteCategory =
    async (
      category,
      categoryType
    ) => {

      if (
        deletingCategory
      ) {

        return;

      }


      const isIncomeCategory =
        categoryType ===
        "income";


      const collectionName =
        isIncomeCategory
          ?
          "incomeCategories"
          :
          "expenseCategories";


      const categoryLabel =
        isIncomeCategory
          ?
          "income"
          :
          "expense";


      const confirmDelete =
        window.confirm(
          `Delete the ${categoryLabel} category "${category.name}" permanently?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      const deletionKey =
        `${categoryType}-${category.id}`;


      setDeletingCategory(
        deletionKey
      );

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await deleteDoc(
          doc(
            db,
            collectionName,
            category.id
          )
        );


        if (
          isMountedRef.current
        ) {

          if (
            isIncomeCategory
          ) {

            setIncomeCategories(
              (
                currentCategories
              ) =>
                currentCategories.filter(
                  (
                    currentCategory
                  ) =>
                    currentCategory.id !==
                    category.id
                )
            );

          }
          else {

            setExpenseCategories(
              (
                currentCategories
              ) =>
                currentCategories.filter(
                  (
                    currentCategory
                  ) =>
                    currentCategory.id !==
                    category.id
                )
            );

          }


          setSuccessMessage(
            `${category.name} deleted successfully.`
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting category:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the category. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setDeletingCategory("");

        }

      }

    };


  // ============================================================
  // FILTER INCOME CATEGORIES
  // ============================================================

  const filteredIncomeCategories =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            incomeSearchTerm
          );


        if (
          !normalizedSearch
        ) {

          return incomeCategories;

        }


        return incomeCategories.filter(
          (
            category
          ) =>

            normalizeValue(
              category.name
            ).includes(
              normalizedSearch
            )

        );

      },
      [
        incomeCategories,
        incomeSearchTerm
      ]
    );


  // ============================================================
  // FILTER EXPENSE CATEGORIES
  // ============================================================

  const filteredExpenseCategories =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            expenseSearchTerm
          );


        if (
          !normalizedSearch
        ) {

          return expenseCategories;

        }


        return expenseCategories.filter(
          (
            category
          ) =>

            normalizeValue(
              category.name
            ).includes(
              normalizedSearch
            )

        );

      },
      [
        expenseCategories,
        expenseSearchTerm
      ]
    );


  // ============================================================
  // TOTAL CATEGORIES
  // ============================================================

  const totalCategories =

    incomeCategories.length +

    expenseCategories.length;


  // ============================================================
  // REFRESH CATEGORIES
  // ============================================================

  const refreshCategories =
    async () => {

      setSuccessMessage("");

      await fetchCategories(
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
              ⚙️ Manage Categories
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Create and manage income and expense categories used across Madrasa accounts.
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
              to="/monthly-report"
              className="action-btn"
            >
              📊 Monthly Report
            </Link>


            <button
              type="button"
              onClick={refreshCategories}
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
                  Loading Categories...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while income and expense categories are loaded.
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
                  CATEGORY SUMMARY CARDS
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
                    💵
                  </div>


                  <h2>
                    {
                      incomeCategories.length
                    }
                  </h2>


                  <p>
                    Income Categories
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
                      expenseCategories.length
                    }
                  </h2>


                  <p>
                    Expense Categories
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
                    {
                      totalCategories
                    }
                  </h2>


                  <p>
                    Total Categories
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
                      filteredIncomeCategories.length +
                      filteredExpenseCategories.length
                    }
                  </h2>


                  <p>
                    Visible Categories
                  </p>

                </div>

              </div>


              {/* ==================================================
                  ADD CATEGORY FORMS
              ================================================== */}

              <div
                className="module-grid"
                style={{
                  marginBottom: "30px"
                }}
              >

                {/* ================================================
                    ADD INCOME CATEGORY
                ================================================ */}

                <div className="module-card">

                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "10px"
                    }}
                  >
                    💵
                  </div>


                  <h2>
                    Add Income Category
                  </h2>


                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Create a category that can be used while recording Madrasa income.
                  </p>


                  <div
                    style={{
                      marginTop: "20px"
                    }}
                  >

                    <label>
                      Income Category Name *
                    </label>


                    <input
                      type="text"
                      placeholder="Example: Student Fees"
                      className="attendance-search"
                      value={newIncomeCategory}
                      onChange={(event) =>
                        setNewIncomeCategory(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter"
                        ) {

                          addIncomeCategory();

                        }

                      }}
                      disabled={isAddingIncome}
                    />

                  </div>


                  <button
                    type="button"
                    className="save-all-btn"
                    onClick={addIncomeCategory}
                    disabled={isAddingIncome}
                    style={{
                      marginTop: "16px"
                    }}
                  >
                    {
                      isAddingIncome
                        ?
                        "⏳ Adding Category..."
                        :
                        "➕ Add Income Category"
                    }
                  </button>

                </div>


                {/* ================================================
                    ADD EXPENSE CATEGORY
                ================================================ */}

                <div className="module-card">

                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "10px"
                    }}
                  >
                    💸
                  </div>


                  <h2>
                    Add Expense Category
                  </h2>


                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Create a category that can be used while recording Madrasa expenses.
                  </p>


                  <div
                    style={{
                      marginTop: "20px"
                    }}
                  >

                    <label>
                      Expense Category Name *
                    </label>


                    <input
                      type="text"
                      placeholder="Example: Electricity Bill"
                      className="attendance-search"
                      value={newExpenseCategory}
                      onChange={(event) =>
                        setNewExpenseCategory(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter"
                        ) {

                          addExpenseCategory();

                        }

                      }}
                      disabled={isAddingExpense}
                    />

                  </div>


                  <button
                    type="button"
                    className="save-all-btn"
                    onClick={addExpenseCategory}
                    disabled={isAddingExpense}
                    style={{
                      marginTop: "16px"
                    }}
                  >
                    {
                      isAddingExpense
                        ?
                        "⏳ Adding Category..."
                        :
                        "➕ Add Expense Category"
                    }
                  </button>

                </div>

              </div>


              {/* ==================================================
                  CATEGORY MANAGEMENT HEADER
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
                  📋 Category Management
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Search, review, and safely delete existing income and expense categories.
                </p>

              </div>


              {/* ==================================================
                  CATEGORY LIST GRID
              ================================================== */}

              <div className="module-grid">

                {/* ================================================
                    INCOME CATEGORY SECTION
                ================================================ */}

                <div
                  className="section-card"
                  style={{
                    margin: 0
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "18px"
                    }}
                  >

                    <div>

                      <h2
                        style={{
                          margin: "0 0 5px"
                        }}
                      >
                        💵 Income Categories
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "13px"
                        }}
                      >
                        Categories available for income transactions.
                      </p>

                    </div>


                    <span
                      style={{
                        padding: "6px 11px",
                        borderRadius: "999px",
                        background: "#dcfce7",
                        color: "#15803d",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      {
                        filteredIncomeCategories.length
                      } Records
                    </span>

                  </div>


                  {/* ============================================
                      INCOME SEARCH
                  ============================================ */}

                  <input
                    type="text"
                    placeholder="🔍 Search income categories..."
                    className="attendance-search"
                    value={incomeSearchTerm}
                    onChange={(event) =>
                      setIncomeSearchTerm(
                        event.target.value
                      )
                    }
                    style={{
                      marginBottom: "18px"
                    }}
                  />


                  {/* ============================================
                      NO INCOME CATEGORIES
                  ============================================ */}

                  {
                    incomeCategories.length === 0 && (

                      <div
                        style={{
                          padding: "35px 15px",
                          textAlign: "center"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "42px",
                            marginBottom: "10px"
                          }}
                        >
                          💵
                        </div>


                        <h3>
                          No Income Categories
                        </h3>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Add your first income category using the form above.
                        </p>

                      </div>

                    )
                  }


                  {/* ============================================
                      NO INCOME SEARCH RESULTS
                  ============================================ */}

                  {
                    incomeCategories.length > 0 &&
                    filteredIncomeCategories.length === 0 && (

                      <div
                        style={{
                          padding: "35px 15px",
                          textAlign: "center"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "42px",
                            marginBottom: "10px"
                          }}
                        >
                          🔍
                        </div>


                        <h3>
                          No Matching Categories
                        </h3>


                        <p
                          style={{
                            margin: "0 0 16px",
                            color: "#64748b"
                          }}
                        >
                          No income categories match your search.
                        </p>


                        <button
                          type="button"
                          onClick={() =>
                            setIncomeSearchTerm("")
                          }
                        >
                          ✖ Clear Search
                        </button>

                      </div>

                    )
                  }
                                    {/* ============================================
                      INCOME CATEGORY RECORDS
                  ============================================ */}

                  {
                    filteredIncomeCategories.length > 0 && (

                      <div>

                        {
                          filteredIncomeCategories.map(
                            (
                              category,
                              index
                            ) => {

                              const deletionKey =
                                `income-${category.id}`;


                              const isDeleting =
                                deletingCategory ===
                                deletionKey;


                              return (

                                <div
                                  key={category.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "14px",
                                    flexWrap: "wrap",
                                    padding: "15px 0",
                                    borderBottom:
                                      index ===
                                      filteredIncomeCategories.length - 1
                                        ?
                                        "none"
                                        :
                                        "1px solid #e2e8f0"
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      minWidth: "180px",
                                      flex: "1"
                                    }}
                                  >

                                    <div
                                      style={{
                                        width: "42px",
                                        height: "42px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "10px",
                                        background: "#dcfce7",
                                        fontSize: "20px",
                                        flexShrink: 0
                                      }}
                                    >
                                      💵
                                    </div>


                                    <div>

                                      <h3
                                        style={{
                                          margin: "0 0 4px"
                                        }}
                                      >
                                        {
                                          category.name ||
                                          "Unnamed Category"
                                        }
                                      </h3>


                                      <p
                                        style={{
                                          margin: 0,
                                          color: "#64748b",
                                          fontSize: "12px"
                                        }}
                                      >
                                        Income Category
                                      </p>

                                    </div>

                                  </div>


                                  <button
                                    type="button"
                                    className="action-btn delete-btn"
                                    disabled={
                                      isDeleting ||
                                      Boolean(
                                        deletingCategory
                                      )
                                    }
                                    onClick={
                                      () =>
                                        deleteCategory(
                                          category,
                                          "income"
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

                              );

                            }
                          )
                        }

                      </div>

                    )
                  }

                </div>


                {/* ================================================
                    EXPENSE CATEGORY SECTION
                ================================================ */}

                <div
                  className="section-card"
                  style={{
                    margin: 0
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "18px"
                    }}
                  >

                    <div>

                      <h2
                        style={{
                          margin: "0 0 5px"
                        }}
                      >
                        💸 Expense Categories
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "13px"
                        }}
                      >
                        Categories available for expense transactions.
                      </p>

                    </div>


                    <span
                      style={{
                        padding: "6px 11px",
                        borderRadius: "999px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      {
                        filteredExpenseCategories.length
                      } Records
                    </span>

                  </div>


                  {/* ============================================
                      EXPENSE SEARCH
                  ============================================ */}

                  <input
                    type="text"
                    placeholder="🔍 Search expense categories..."
                    className="attendance-search"
                    value={expenseSearchTerm}
                    onChange={(event) =>
                      setExpenseSearchTerm(
                        event.target.value
                      )
                    }
                    style={{
                      marginBottom: "18px"
                    }}
                  />


                  {/* ============================================
                      NO EXPENSE CATEGORIES
                  ============================================ */}

                  {
                    expenseCategories.length === 0 && (

                      <div
                        style={{
                          padding: "35px 15px",
                          textAlign: "center"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "42px",
                            marginBottom: "10px"
                          }}
                        >
                          💸
                        </div>


                        <h3>
                          No Expense Categories
                        </h3>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Add your first expense category using the form above.
                        </p>

                      </div>

                    )
                  }


                  {/* ============================================
                      NO EXPENSE SEARCH RESULTS
                  ============================================ */}

                  {
                    expenseCategories.length > 0 &&
                    filteredExpenseCategories.length === 0 && (

                      <div
                        style={{
                          padding: "35px 15px",
                          textAlign: "center"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "42px",
                            marginBottom: "10px"
                          }}
                        >
                          🔍
                        </div>


                        <h3>
                          No Matching Categories
                        </h3>


                        <p
                          style={{
                            margin: "0 0 16px",
                            color: "#64748b"
                          }}
                        >
                          No expense categories match your search.
                        </p>


                        <button
                          type="button"
                          onClick={() =>
                            setExpenseSearchTerm("")
                          }
                        >
                          ✖ Clear Search
                        </button>

                      </div>

                    )
                  }


                  {/* ============================================
                      EXPENSE CATEGORY RECORDS
                  ============================================ */}

                  {
                    filteredExpenseCategories.length > 0 && (

                      <div>

                        {
                          filteredExpenseCategories.map(
                            (
                              category,
                              index
                            ) => {

                              const deletionKey =
                                `expense-${category.id}`;


                              const isDeleting =
                                deletingCategory ===
                                deletionKey;


                              return (

                                <div
                                  key={category.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "14px",
                                    flexWrap: "wrap",
                                    padding: "15px 0",
                                    borderBottom:
                                      index ===
                                      filteredExpenseCategories.length - 1
                                        ?
                                        "none"
                                        :
                                        "1px solid #e2e8f0"
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      minWidth: "180px",
                                      flex: "1"
                                    }}
                                  >

                                    <div
                                      style={{
                                        width: "42px",
                                        height: "42px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "10px",
                                        background: "#fee2e2",
                                        fontSize: "20px",
                                        flexShrink: 0
                                      }}
                                    >
                                      💸
                                    </div>


                                    <div>

                                      <h3
                                        style={{
                                          margin: "0 0 4px"
                                        }}
                                      >
                                        {
                                          category.name ||
                                          "Unnamed Category"
                                        }
                                      </h3>


                                      <p
                                        style={{
                                          margin: 0,
                                          color: "#64748b",
                                          fontSize: "12px"
                                        }}
                                      >
                                        Expense Category
                                      </p>

                                    </div>

                                  </div>


                                  <button
                                    type="button"
                                    className="action-btn delete-btn"
                                    disabled={
                                      isDeleting ||
                                      Boolean(
                                        deletingCategory
                                      )
                                    }
                                    onClick={
                                      () =>
                                        deleteCategory(
                                          category,
                                          "expense"
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

                              );

                            }
                          )
                        }

                      </div>

                    )
                  }

                </div>

              </div>


              {/* ==================================================
                  CATEGORY INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginTop: "24px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 12px"
                  }}
                >
                  💡 Category Information
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: "1.8"
                  }}
                >
                  Income categories can be used while recording income transactions, while expense categories can be used for Madrasa expenses. Keeping categories organized makes financial reports easier to understand and manage.
                </p>

              </div>


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
  to="/monthly-report"
  className="action-btn view-btn"
>
  📊 Monthly Report
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
                🕌 Manage Categories keeps Madrasa financial records organized by providing reusable income and expense categories across the Accounts module.
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

export default ManageCategories;