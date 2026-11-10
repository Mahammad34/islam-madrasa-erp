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

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Dashboard() {

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
    incomes,
    setIncomes
  ] = useState([]);

  const [
    expenses,
    setExpenses
  ] = useState([]);

  const [
    currentTime,
    setCurrentTime
  ] = useState(
    new Date()
  );

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
  // DATE HELPER
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


  // ============================================================
  // FETCH DASHBOARD DATA
  // ============================================================

  const fetchDashboardData = async (
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
        "Error loading dashboard:",
        error
      );

      setErrorMessage(
        "Unable to load dashboard data. Please try again."
      );

    }
    finally {

      setIsLoading(false);

      setIsRefreshing(false);

    }

  };


  // ============================================================
  // INITIAL LOAD AND LIVE CLOCK
  // ============================================================

  useEffect(() => {

    fetchDashboardData();


    const timer =
  setInterval(
    () => {
      setCurrentTime(
        new Date()
      );
    },
    1000
  );


    return () =>
      clearInterval(
        timer
      );

  }, []);


  // ============================================================
  // GREETING
  // ============================================================

  const hour =
    currentTime.getHours();


  let greeting =
    "🌙 Good Evening";


  if (hour < 12) {

    greeting =
      "🌅 Good Morning";

  }
  else if (hour < 17) {

    greeting =
      "☀️ Good Afternoon";

  }


  // ============================================================
  // CURRENT DATE AND TIME
  // ============================================================

  const today =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        weekday:
          "long",

        day:
          "numeric",

        month:
          "long",

        year:
          "numeric"
      }
    );


  const liveTime =
  currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        true
    }
  );


  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const dashboardStatistics =
    useMemo(() => {

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


      const currentBalance =
        totalIncome +
        totalDonations -
        totalExpenses;


      const currentMonth =
        currentTime.getMonth();


      const currentYear =
        currentTime.getFullYear();


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


      const monthlyIncome =
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


      const monthlyExpenses =
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


      const monthlyDonations =
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


      const monthlyBalance =
        monthlyIncome +
        monthlyDonations -
        monthlyExpenses;


      return {

        studentCount:
          students.length,

        staffCount:
          staff.length,

        parentCount:
          parents.length,

        totalDonations,

        currentBalance,

        monthlyIncome,

        monthlyExpenses,

        monthlyDonations,

        monthlyBalance

      };

    }, [
      students,
      staff,
      parents,
      donations,
      incomes,
      expenses,
      currentTime
    ]);
      // ============================================================
  // TODAY DATE VALUE
  // ============================================================

  

  // ============================================================
  // TODAY STATISTICS
  // ============================================================

  const todayStatistics =
    useMemo(() => {

      const isToday =
        (dateValue) => {

          const convertedDate =
            convertToDate(
              dateValue
            );


          if (!convertedDate) {

            return false;

          }


          return (

            convertedDate.getFullYear() ===
              currentTime.getFullYear() &&

            convertedDate.getMonth() ===
              currentTime.getMonth() &&

            convertedDate.getDate() ===
              currentTime.getDate()

          );

        };


      const studentsAddedToday =
        students.filter(
          (item) =>

            isToday(

              item.joiningDate ||
              item.admissionDate ||
              item.createdAt

            )
        ).length;


      const staffAddedToday =
        staff.filter(
          (item) =>

            isToday(

              item.joiningDate ||
              item.createdAt

            )
        ).length;


      const donationsToday =
        donations.filter(
          (item) =>

            isToday(

              item.donationDate ||
              item.date ||
              item.createdAt

            )
        );


      const donationAmountToday =
        donationsToday.reduce(
          (total, item) =>

            total +
            getNumber(

              item.donationAmount ??
              item.amount

            ),

          0
        );


      const incomeToday =
        incomes

          .filter(
            (item) =>

              isToday(

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


      const expensesToday =
        expenses

          .filter(
            (item) =>

              isToday(

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


      return {

        studentsAddedToday,

        staffAddedToday,

        donationsToday:
          donationsToday.length,

        donationAmountToday,

        incomeToday,

        expensesToday

      };

    }, [
      students,
      staff,
      donations,
      incomes,
      expenses,
      currentTime
    ]);


  // ============================================================
  // RECENT ACTIVITIES
  // ============================================================

  const recentActivities =
    useMemo(() => {

      const studentActivities =
        students.map(
          (item) => ({

            id:
              `student-${item.id}`,

            type:
              "Student",

            icon:
              "👨‍🎓",

            title:
              `${item.studentName || "Student"} registered`,

            description:
              item.studentClass
                ? `Class: ${item.studentClass}`
                : "New student registration",

            date:
              item.createdAt ||
              item.joiningDate ||
              item.admissionDate,

            link:
              `/student-profile/${item.id}`

          })
        );


      const staffActivities =
        staff.map(
          (item) => ({

            id:
              `staff-${item.id}`,

            type:
              "Staff",

            icon:
              "👳",

            title:
              `${item.staffName || item.name || "Staff member"} added`,

            description:
              item.position ||
              item.designation ||
              item.role ||
              "New staff registration",

            date:
              item.createdAt ||
              item.joiningDate,

            link:
              "/staff"

          })
        );


      const donationActivities =
        donations.map(
          (item) => ({

            id:
              `donation-${item.id}`,

            type:
              "Donation",

            icon:
              "❤️",

            title:
              `${formatCurrency(
                item.donationAmount ??
                item.amount
              )} donation received`,

            description:
              item.donorName
                ? `From ${item.donorName}`
                : "Donation received",

            date:
              item.createdAt ||
              item.donationDate ||
              item.date,

            link:
              "/donation-history"

          })
        );


      const incomeActivities =
        incomes.map(
          (item) => ({

            id:
              `income-${item.id}`,

            type:
              "Income",

            icon:
              "💵",

            title:
              `${formatCurrency(
                item.amount
              )} income recorded`,

            description:
              item.source ||
              item.category ||
              item.description ||
              "Income entry",

            date:
              item.createdAt ||
              item.date ||
              item.incomeDate,

            link:
              "/income-history"

          })
        );


      const expenseActivities =
        expenses.map(
          (item) => ({

            id:
              `expense-${item.id}`,

            type:
              "Expense",

            icon:
              "💸",

            title:
              `${formatCurrency(
                item.amount
              )} expense recorded`,

            description:
              item.category ||
              item.description ||
              "Expense entry",

            date:
              item.createdAt ||
              item.date ||
              item.expenseDate,

            link:
              "/expense-history"

          })
        );


      return [

        ...studentActivities,

        ...staffActivities,

        ...donationActivities,

        ...incomeActivities,

        ...expenseActivities

      ]

        .filter(
          (activity) =>
            convertToDate(
              activity.date
            )
        )

        .sort(
          (
            firstActivity,
            secondActivity
          ) =>

            (
              convertToDate(
                secondActivity.date
              )?.getTime() || 0
            ) -

            (
              convertToDate(
                firstActivity.date
              )?.getTime() || 0
            )

        )

        .slice(
          0,
          8
        );

    }, [
      students,
      staff,
      donations,
      incomes,
      expenses
    ]);


  // ============================================================
  // FORMAT ACTIVITY TIME
  // ============================================================

  const formatActivityTime =
    (dateValue) => {

      const activityDate =
        convertToDate(
          dateValue
        );


      if (!activityDate) {

        return "Unknown date";

      }


      const difference =
        currentTime.getTime() -
        activityDate.getTime();


      const minutes =
        Math.floor(
          difference /
          (1000 * 60)
        );


      const hours =
        Math.floor(
          difference /
          (1000 * 60 * 60)
        );


      const days =
        Math.floor(
          difference /
          (1000 * 60 * 60 * 24)
        );


      if (minutes < 1) {

        return "Just now";

      }


      if (minutes < 60) {

        return `${minutes} min ago`;

      }


      if (hours < 24) {

        return `${hours} hr ago`;

      }


      if (days < 7) {

        return `${days} day${days === 1 ? "" : "s"} ago`;

      }


      return activityDate.toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric"
        }
      );

    };


  // ============================================================
  // REFRESH DASHBOARD
  // ============================================================

  const refreshDashboard =
    async () => {

      await fetchDashboardData(
        true
      );

    };
      return (

    <Layout>

      <div className="dashboard">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >

          <div>

            <h1 style={{ margin: "0 0 5px" }}>
              📊 Dashboard
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Madrasa management overview and latest activity.
            </p>

          </div>


          <button
            type="button"
            onClick={refreshDashboard}
            disabled={isRefreshing}
          >
            {
              isRefreshing
                ? "⏳ Refreshing..."
                : "🔄 Refresh Dashboard"
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
                  Loading Dashboard...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while Madrasa information is loaded.
                </p>

              </div>

            </div>

          ) : (

            <>

              <div className="hero-banner">

                <p className="hero-greeting">
                  {greeting}, Admin 👋
                </p>

                <h1>
                  Assalamu Alaikum
                </h1>

                <p className="hero-date">
                  {today}
                </p>

                <p className="hero-date">
                  🕒 {liveTime}
                </p>


                <div className="hero-stats">

                  <div>
                    👨‍🎓 {
                      dashboardStatistics.studentCount
                    } Students
                  </div>

                  <div>
                    👳 {
                      dashboardStatistics.staffCount
                    } Staff
                  </div>

                  <div>
                    👨‍👩‍👧 {
                      dashboardStatistics.parentCount
                    } Parents
                  </div>

                </div>

              </div>


              <h2 className="dashboard-heading">
                📊 Madrasa Overview
              </h2>


              <div className="cards">

                <Link
                  to="/students"
                  className="link"
                >

                  <div className="card students-card">

                    <h1>
                      {
                        dashboardStatistics.studentCount
                      }
                    </h1>

                    <h3>
                      👨‍🎓 Students
                    </h3>

                    <p>
                      Total Registered Students
                    </p>

                  </div>

                </Link>


                <Link
                  to="/staff"
                  className="link"
                >

                  <div className="card staff-card">

                    <h1>
                      {
                        dashboardStatistics.staffCount
                      }
                    </h1>

                    <h3>
                      👳 Staff
                    </h3>

                    <p>
                      Total Staff Members
                    </p>

                  </div>

                </Link>


                <Link
                  to="/parents"
                  className="link"
                >

                  <div className="card parents-card">

                    <h1>
                      {
                        dashboardStatistics.parentCount
                      }
                    </h1>

                    <h3>
                      👨‍👩‍👧 Parents
                    </h3>

                    <p>
                      Total Parent Accounts
                    </p>

                  </div>

                </Link>


                <Link
                  to="/donations"
                  className="link"
                >

                  <div className="card donation-card">

                    <h1>
                      {
                        formatCurrency(
                          dashboardStatistics.totalDonations
                        )
                      }
                    </h1>

                    <h3>
                      ❤️ Donations
                    </h3>

                    <p>
                      Total Donations Received
                    </p>

                  </div>

                </Link>


                <Link
                  to="/accounts"
                  className="link"
                >

                  <div className="card balance-card">

                    <h1>
                      {
                        formatCurrency(
                          dashboardStatistics.currentBalance
                        )
                      }
                    </h1>

                    <h3>
                      💰 Balance
                    </h3>

                    <p>
                      Current Madrasa Balance
                    </p>

                  </div>

                </Link>

              </div>


              <h2 className="dashboard-heading">
                📅 Today's Overview
              </h2>


              <div className="attendance-summary">

                <div className="summary-card">

                  <h2>
                    {
                      todayStatistics.studentsAddedToday
                    }
                  </h2>

                  <p>
                    👨‍🎓 New Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      todayStatistics.staffAddedToday
                    }
                  </h2>

                  <p>
                    👳 New Staff
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      todayStatistics.donationsToday
                    }
                  </h2>

                  <p>
                    ❤️ Donations Received
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        todayStatistics.donationAmountToday
                      )
                    }
                  </h2>

                  <p>
                    💝 Donation Amount
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        todayStatistics.incomeToday
                      )
                    }
                  </h2>

                  <p>
                    💵 Today's Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        todayStatistics.expensesToday
                      )
                    }
                  </h2>

                  <p>
                    💸 Today's Expenses
                  </p>

                </div>

              </div>


              <h2 className="dashboard-heading">
                ⚡ Quick Actions
              </h2>


              <div className="quick-actions">

                <Link
                  to="/add-student"
                  className="link"
                >

                  <div className="action-card">

                    ➕

                    <p>
                      Add Student
                    </p>

                  </div>

                </Link>


                <Link
                  to="/add-staff"
                  className="link"
                >

                  <div className="action-card">

                    👳

                    <p>
                      Add Staff
                    </p>

                  </div>

                </Link>


                <Link
                  to="/add-donation"
                  className="link"
                >

                  <div className="action-card">

                    ❤️

                    <p>
                      Add Donation
                    </p>

                  </div>

                </Link>


                <Link
                  to="/quick-income"
                  className="link"
                >

                  <div className="action-card">

                    💵

                    <p>
                      Add Income
                    </p>

                  </div>

                </Link>


                <Link
                  to="/quick-expense"
                  className="link"
                >

                  <div className="action-card">

                    💸

                    <p>
                      Add Expense
                    </p>

                  </div>

                </Link>


                <Link
                  to="/attendance"
                  className="link"
                >

                  <div className="action-card">

                    📋

                    <p>
                      Attendance
                    </p>

                  </div>

                </Link>

              </div>


              <h2 className="dashboard-heading">
                📊 Monthly Financial Overview
              </h2>


              <div className="attendance-summary">

                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dashboardStatistics.monthlyIncome
                      )
                    }
                  </h2>

                  <p>
                    💵 Monthly Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dashboardStatistics.monthlyExpenses
                      )
                    }
                  </h2>

                  <p>
                    💸 Monthly Expenses
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dashboardStatistics.monthlyDonations
                      )
                    }
                  </h2>

                  <p>
                    ❤️ Monthly Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dashboardStatistics.monthlyBalance
                      )
                    }
                  </h2>

                  <p>
                    🏦 Monthly Balance
                  </p>

                </div>

              </div>


              <h2 className="dashboard-heading">
                📋 Recent Activities
              </h2>


              {
                recentActivities.length === 0 ? (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "50px",
                          marginBottom: "12px"
                        }}
                      >
                        📭
                      </div>

                      <h2>
                        No Recent Activities
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        New student, staff, donation, income, and expense activities will appear here.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="section-card">

                    {
                      recentActivities.map(
                        (activity, index) => (

                          <Link
                            to={activity.link}
                            className="link"
                            key={activity.id}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px",
                                padding: "16px 5px",
                                borderBottom:
                                  index ===
                                  recentActivities.length - 1
                                    ? "none"
                                    : "1px solid #e2e8f0"
                              }}
                            >

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "14px",
                                  minWidth: 0
                                }}
                              >

                                <div
                                  style={{
                                    width: "46px",
                                    height: "46px",
                                    borderRadius: "12px",
                                    background: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "23px",
                                    flexShrink: 0
                                  }}
                                >
                                  {activity.icon}
                                </div>


                                <div style={{ minWidth: 0 }}>

                                  <h3
                                    style={{
                                      margin: "0 0 5px"
                                    }}
                                  >
                                    {activity.title}
                                  </h3>

                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#64748b"
                                    }}
                                  >
                                    {activity.description}
                                  </p>

                                </div>

                              </div>


                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: "13px",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {
                                  formatActivityTime(
                                    activity.date
                                  )
                                }
                              </div>

                            </div>

                          </Link>

                        )
                      )
                    }

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
                  📊 View Reports
                </Link>


                <Link
                  to="/accounts"
                  className="action-btn view-btn"
                >
                  💰 Accounts
                </Link>


                <Link
                  to="/daily-closing-report"
                  className="action-btn view-btn"
                >
                  🌙 Daily Closing
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

export default Dashboard;