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
  Link,
  useSearchParams
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function GlobalSearch() {

  const [
    search,
    setSearch
  ] = useState("");

  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const [
    students,
    setStudents
  ] = useState([]);

  const [
    staff,
    setStaff
  ] = useState([]);

  const [
    parents,
    setParents
  ] = useState([]);

  const [
    donations,
    setDonations
  ] = useState([]);

  const [
    tasks,
    setTasks
  ] = useState([]);

  const [
    notices,
    setNotices
  ] = useState([]);

  const [
    incomes,
    setIncomes
  ] = useState([]);

  const [
    expenses,
    setExpenses
  ] = useState([]);

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
        style:
          "currency",

        currency:
          "INR",

        minimumFractionDigits:
          0,

        maximumFractionDigits:
          2
      }
    ).format(
      getNumber(value)
    );

  };


  // ============================================================
  // FETCH GLOBAL SEARCH DATA
  // ============================================================

  const fetchGlobalSearchData =
    async (
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
          studentsSnapshot,
          staffSnapshot,
          parentsSnapshot,
          donationsSnapshot,
          tasksSnapshot,
          noticesSnapshot,
          incomeSnapshot,
          expensesSnapshot
        ] = await Promise.all([

          getDocs(
            collection(
              db,
              "students"
            )
          ),

          getDocs(
            collection(
              db,
              "staff"
            )
          ),

          getDocs(
            collection(
              db,
              "parents"
            )
          ),

          getDocs(
            collection(
              db,
              "donations"
            )
          ),

          getDocs(
            collection(
              db,
              "tasks"
            )
          ),

          getDocs(
            collection(
              db,
              "notices"
            )
          ),

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
          )

        ]);


        setStudents(

          studentsSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setStaff(

          staffSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setParents(

          parentsSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setDonations(

          donationsSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setTasks(

          tasksSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setNotices(

          noticesSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setIncomes(

          incomeSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );


        setExpenses(

          expensesSnapshot.docs.map(
            (document) => ({

              id:
                document.id,

              ...document.data()

            })
          )

        );

      }
      catch (error) {

        console.error(
          "Error loading global search:",
          error
        );

        setErrorMessage(
          "Unable to load search data. Please try again."
        );

      }
      finally {

        setIsLoading(false);

        setIsRefreshing(false);

      }

    };


  // ============================================================
  // INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {

    fetchGlobalSearchData();

  }, []);


  // ============================================================
  // READ SEARCH QUERY FROM URL
  // ============================================================

  useEffect(() => {

    const query =
      searchParams.get(
        "q"
      );


    if (query) {

      setSearch(
        query
      );

    }

  }, [
    searchParams
  ]);


  // ============================================================
  // SEARCH CHANGE
  // ============================================================

  const handleSearchChange =
    (event) => {

      const value =
        event.target.value;


      setSearch(
        value
      );


      if (
        value.trim()
      ) {

        setSearchParams({
          q:
            value
        });

      }
      else {

        setSearchParams({});

      }

    };


  // ============================================================
  // SEARCH HELPER
  // ============================================================

  const matchesSearch =
    (
      item,
      fields,
      keyword
    ) => {

      if (!keyword) {

        return false;

      }


      return fields.some(
        (field) => {

          const value =
            item[field];


          if (
            value === undefined ||
            value === null
          ) {

            return false;

          }


          return String(value)
            .toLowerCase()
            .includes(
              keyword
            );

        }
      );

    };


  // ============================================================
  // FILTERED SEARCH RESULTS
  // ============================================================

  const searchResults =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {

        return {

          students:
            [],

          staff:
            [],

          parents:
            [],

          donations:
            [],

          tasks:
            [],

          notices:
            [],

          incomes:
            [],

          expenses:
            []

        };

      }


      const filteredStudents =
        students.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "studentName",
                "fatherName",
                "motherName",
                "mobileNumber",
                "studentClass",
                "studentId",
                "admissionNumber",
                "aadhaarNumber",
                "address",
                "bloodGroup"
              ],
              keyword
            )

        );


      const filteredStaff =
        staff.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "staffName",
                "name",
                "mobileNumber",
                "position",
                "designation",
                "role",
                "staffId",
                "address",
                "email"
              ],
              keyword
            )

        );


      const filteredParents =
        parents.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "parentName",
                "name",
                "fatherName",
                "motherName",
                "mobileNumber",
                "studentName",
                "email",
                "address"
              ],
              keyword
            )

        );


      const filteredDonations =
        donations.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "donorName",
                "mobileNumber",
                "donationAmount",
                "paymentMethod",
                "purpose",
                "donationDate"
              ],
              keyword
            )

        );


      const filteredTasks =
        tasks.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "title",
                "description",
                "status",
                "priority",
                "assignedTo"
              ],
              keyword
            )

        );


      const filteredNotices =
        notices.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "title",
                "description",
                "message",
                "category",
                "date"
              ],
              keyword
            )

        );


      const filteredIncomes =
        incomes.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "amount",
                "source",
                "category",
                "description",
                "donorName",
                "date"
              ],
              keyword
            )

        );


      const filteredExpenses =
        expenses.filter(
          (item) =>

            matchesSearch(
              item,
              [
                "amount",
                "category",
                "description",
                "paymentMethod",
                "date"
              ],
              keyword
            )

        );


      return {

        students:
          filteredStudents,

        staff:
          filteredStaff,

        parents:
          filteredParents,

        donations:
          filteredDonations,

        tasks:
          filteredTasks,

        notices:
          filteredNotices,

        incomes:
          filteredIncomes,

        expenses:
          filteredExpenses

      };

    }, [
      search,
      students,
      staff,
      parents,
      donations,
      tasks,
      notices,
      incomes,
      expenses
    ]);


  // ============================================================
  // TOTAL RESULTS
  // ============================================================

  const totalResults =

    searchResults.students.length +

    searchResults.staff.length +

    searchResults.parents.length +

    searchResults.donations.length +

    searchResults.tasks.length +

    searchResults.notices.length +

    searchResults.incomes.length +

    searchResults.expenses.length;


  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const clearSearch = () => {

    setSearch("");

    setSearchParams({});

  };


  // ============================================================
  // REFRESH SEARCH DATA
  // ============================================================

  const refreshSearchData =
    async () => {

      await fetchGlobalSearchData(
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
              🔍 Global Search
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Search across students, staff, parents, donations, tasks, notices, income, and expenses.
            </p>

          </div>


          <button
            type="button"
            onClick={refreshSearchData}
            disabled={isRefreshing}
          >
            {
              isRefreshing
                ? "⏳ Refreshing..."
                : "🔄 Refresh Data"
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
                  padding: "70px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "55px",
                    marginBottom: "15px"
                  }}
                >
                  ⏳
                </div>

                <h2>
                  Loading Global Search...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while searchable Madrasa data is loaded.
                </p>

              </div>

            </div>

          ) : (

            <>

              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <h2 style={{ marginTop: 0 }}>
                  🔎 Search Madrasa Records
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}
                >

                  <input
                    type="text"
                    placeholder="Search name, ID, mobile, amount, category..."
                    className="attendance-search"
                    value={search}
                    onChange={handleSearchChange}
                    style={{
                      flex: "1",
                      minWidth: "220px"
                    }}
                  />


                  {
                    search && (

                      <button
                        type="button"
                        onClick={clearSearch}
                      >
                        ✖ Clear
                      </button>

                    )
                  }

                </div>


                {
                  search.trim() && (

                    <p
                      style={{
                        margin: "16px 0 0",
                        color: "#64748b"
                      }}
                    >
                      Found{" "}
                      <strong>
                        {totalResults}
                      </strong>{" "}
                      result{totalResults === 1 ? "" : "s"} for{" "}
                      <strong>
                        "{search.trim()}"
                      </strong>
                    </p>

                  )
                }

              </div>


              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <h2>
                    {totalResults}
                  </h2>

                  <p>
                    🔍 Total Results
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.students.length}
                  </h2>

                  <p>
                    👨‍🎓 Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.staff.length}
                  </h2>

                  <p>
                    👳 Staff
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.parents.length}
                  </h2>

                  <p>
                    👨‍👩‍👧 Parents
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.donations.length}
                  </h2>

                  <p>
                    ❤️ Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.tasks.length}
                  </h2>

                  <p>
                    📋 Tasks
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.notices.length}
                  </h2>

                  <p>
                    📢 Notices
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.incomes.length}
                  </h2>

                  <p>
                    💵 Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {searchResults.expenses.length}
                  </h2>

                  <p>
                    💸 Expenses
                  </p>

                </div>

              </div>


              {
                !search.trim() ? (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "60px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "55px",
                          marginBottom: "14px"
                        }}
                      >
                        🔍
                      </div>

                      <h2>
                        Search Madrasa Records
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Enter a name, mobile number, student ID, amount, category, or other information to begin searching.
                      </p>

                    </div>

                  </div>

                ) : totalResults === 0 ? (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "60px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "55px",
                          marginBottom: "14px"
                        }}
                      >
                        📭
                      </div>

                      <h2>
                        No Results Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No Madrasa records match "{search.trim()}".
                      </p>

                      <button
                        type="button"
                        onClick={clearSearch}
                      >
                        ✖ Clear Search
                      </button>

                    </div>

                  </div>

                ) : (

                  <>


                    {
                      searchResults.students.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            👨‍🎓 Students ({searchResults.students.length})
                          </h2>


                          {
                            searchResults.students.map(
                              (item) => (

                                <Link
                                  to={`/student-profile/${item.id}`}
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      👨‍🎓 {item.studentName || "Student"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      🆔 {item.studentId || item.admissionNumber || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      📚 Class: {item.studentClass || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      📞 {item.mobileNumber || "N/A"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.staff.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            👳 Staff ({searchResults.staff.length})
                          </h2>


                          {
                            searchResults.staff.map(
                              (item) => (

                                <Link
                                  to="/staff"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      👳 {item.staffName || item.name || "Staff Member"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      💼 {item.position || item.designation || item.role || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      📞 {item.mobileNumber || "N/A"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.parents.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            👨‍👩‍👧 Parents ({searchResults.parents.length})
                          </h2>


                          {
                            searchResults.parents.map(
                              (item) => (

                                <Link
                                  to="/parents"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      👨‍👩‍👧 {item.parentName || item.name || "Parent"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      👨‍🎓 Student: {item.studentName || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      📞 {item.mobileNumber || "N/A"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.donations.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            ❤️ Donations ({searchResults.donations.length})
                          </h2>


                          {
                            searchResults.donations.map(
                              (item) => (

                                <Link
                                  to="/donation-history"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      ❤️ {item.donorName || "Anonymous Donor"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      💰 {formatCurrency(item.donationAmount ?? item.amount)}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      🎯 {item.purpose || "General Donation"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      💳 {item.paymentMethod || "N/A"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.tasks.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            📋 Tasks ({searchResults.tasks.length})
                          </h2>


                          {
                            searchResults.tasks.map(
                              (item) => (

                                <Link
                                  to="/tasks"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      📋 {item.title || "Task"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      {item.description || "No description"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      Status: {item.status || "N/A"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.notices.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            📢 Notices ({searchResults.notices.length})
                          </h2>


                          {
                            searchResults.notices.map(
                              (item) => (

                                <Link
                                  to="/notices"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      📢 {item.title || "Notice"}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      {item.description || item.message || "No description"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.incomes.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            💵 Income ({searchResults.incomes.length})
                          </h2>


                          {
                            searchResults.incomes.map(
                              (item) => (

                                <Link
                                  to="/income-history"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      💵 {formatCurrency(item.amount)}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      Source: {item.source || item.category || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      {item.description || "Income Entry"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }


                    {
                      searchResults.expenses.length > 0 && (

                        <div
                          className="section-card"
                          style={{
                            marginBottom: "24px"
                          }}
                        >

                          <h2 style={{ marginTop: 0 }}>
                            💸 Expenses ({searchResults.expenses.length})
                          </h2>


                          {
                            searchResults.expenses.map(
                              (item) => (

                                <Link
                                  to="/expense-history"
                                  className="link"
                                  key={item.id}
                                >

                                  <div
                                    style={{
                                      padding: "15px",
                                      marginTop: "10px",
                                      borderRadius: "10px",
                                      border: "1px solid #e2e8f0"
                                    }}
                                  >

                                    <h3 style={{ margin: "0 0 8px" }}>
                                      💸 {formatCurrency(item.amount)}
                                    </h3>

                                    <p style={{ margin: "4px 0" }}>
                                      Category: {item.category || "N/A"}
                                    </p>

                                    <p style={{ margin: "4px 0" }}>
                                      {item.description || "Expense Entry"}
                                    </p>

                                  </div>

                                </Link>

                              )
                            )
                          }

                        </div>

                      )
                    }

                  </>

                )
              }


              <div style={{ height: "50px" }} />

            </>

          )
        }

      </div>

    </Layout>

  );

}

export default GlobalSearch;