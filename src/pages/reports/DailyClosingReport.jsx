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

function DailyClosingReport() {

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
    studentAttendance,
    setStudentAttendance
  ] = useState([]);

  const [
    staffAttendance,
    setStaffAttendance
  ] = useState([]);

  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [
    lastUpdated,
    setLastUpdated
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
  // FETCH COMPLETE CLOSING REPORT DATA
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
        donationSnapshot,
        studentAttendanceSnapshot,
        staffAttendanceSnapshot
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
        ),

        getDocs(
          collection(
            db,
            "studentAttendance"
          )
        ),

        getDocs(
          collection(
            db,
            "staffAttendance"
          )
        )

      ]);


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

        expenseSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        )

      );


      setDonations(

        donationSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        )

      );


      setStudentAttendance(

        studentAttendanceSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        )

      );


      setStaffAttendance(

        staffAttendanceSnapshot.docs.map(
          (document) => ({

            id:
              document.id,

            ...document.data()

          })
        )

      );


      setLastUpdated(
        new Date()
      );

    }
    catch (error) {

      console.error(
        "Error loading daily closing report:",
        error
      );

      setErrorMessage(
        "Unable to load daily closing report. Please try again."
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
  // SELECTED DATE FINANCIAL DATA
  // ============================================================

  const dailyFinancialData =
    useMemo(() => {

      const dailyIncomes =
        incomes.filter(
          (item) =>

            getDateInputValue(
              item.date ||
              item.incomeDate ||
              item.createdAt
            ) === selectedDate

        );


      const dailyExpenses =
        expenses.filter(
          (item) =>

            getDateInputValue(
              item.date ||
              item.expenseDate ||
              item.createdAt
            ) === selectedDate

        );


      const dailyDonations =
        donations.filter(
          (item) =>

            getDateInputValue(
              item.donationDate ||
              item.date ||
              item.createdAt
            ) === selectedDate

        );


      const totalIncome =
        dailyIncomes.reduce(
          (total, item) =>
            total +
            getNumber(
              item.amount
            ),
          0
        );


      const totalExpenses =
        dailyExpenses.reduce(
          (total, item) =>
            total +
            getNumber(
              item.amount
            ),
          0
        );


      const totalDonations =
        dailyDonations.reduce(
          (total, item) =>
            total +
            getNumber(
              item.donationAmount ??
              item.amount
            ),
          0
        );


      const closingBalance =
        totalIncome +
        totalDonations -
        totalExpenses;


      return {

        dailyIncomes,

        dailyExpenses,

        dailyDonations,

        totalIncome,

        totalExpenses,

        totalDonations,

        closingBalance,

        totalTransactions:
          dailyIncomes.length +
          dailyExpenses.length +
          dailyDonations.length

      };

    }, [
      incomes,
      expenses,
      donations,
      selectedDate
    ]);


  // ============================================================
  // SELECTED DATE ATTENDANCE DATA
  // ============================================================

  const dailyAttendanceData =
    useMemo(() => {

      const dailyStudentAttendance =
        studentAttendance.filter(
          (item) =>

            getDateInputValue(
              item.date
            ) === selectedDate

        );


      const dailyStaffAttendance =
        staffAttendance.filter(
          (item) =>

            getDateInputValue(
              item.date
            ) === selectedDate

        );


      const studentsPresent =
        dailyStudentAttendance.filter(
          (item) =>
            item.status ===
            "Present"
        ).length;


      const studentsAbsent =
        dailyStudentAttendance.filter(
          (item) =>
            item.status ===
            "Absent"
        ).length;


      const staffPresent =
        dailyStaffAttendance.filter(
          (item) =>
            item.status ===
            "Present"
        ).length;


      const staffAbsent =
        dailyStaffAttendance.filter(
          (item) =>
            item.status ===
            "Absent"
        ).length;


      return {

        dailyStudentAttendance,

        dailyStaffAttendance,

        studentsPresent,

        studentsAbsent,

        staffPresent,

        staffAbsent,

        studentAttendanceCompleted:
          dailyStudentAttendance.length > 0,

        staffAttendanceCompleted:
          dailyStaffAttendance.length > 0

      };

    }, [
      studentAttendance,
      staffAttendance,
      selectedDate
    ]);


  // ============================================================
  // DAILY ALERTS
  // ============================================================

  const alerts =
    useMemo(() => {

      const closingAlerts = [];


      if (
        dailyFinancialData.totalIncome === 0
      ) {

        closingAlerts.push({
          type:
            "Income",

          message:
            "No income was recorded for this date."
        });

      }


      if (
        dailyFinancialData.totalExpenses === 0
      ) {

        closingAlerts.push({
          type:
            "Expense",

          message:
            "No expenses were recorded for this date."
        });

      }


      if (
        dailyFinancialData.totalDonations === 0
      ) {

        closingAlerts.push({
          type:
            "Donation",

          message:
            "No donations were recorded for this date."
        });

      }


      if (
        !dailyAttendanceData
          .studentAttendanceCompleted
      ) {

        closingAlerts.push({
          type:
            "Student Attendance",

          message:
            "Student attendance has not been completed."
        });

      }


      if (
        !dailyAttendanceData
          .staffAttendanceCompleted
      ) {

        closingAlerts.push({
          type:
            "Staff Attendance",

          message:
            "Staff attendance has not been completed."
        });

      }


      return closingAlerts;

    }, [
      dailyFinancialData,
      dailyAttendanceData
    ]);


  // ============================================================
  // DAY STATUS
  // ============================================================

  const dayStatus =
    alerts.length === 0
      ? "Completed"
      : "Pending";


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

    const summaryData = [

      {
        Category:
          "Income",

        Value:
          dailyFinancialData.totalIncome
      },

      {
        Category:
          "Expenses",

        Value:
          dailyFinancialData.totalExpenses
      },

      {
        Category:
          "Donations",

        Value:
          dailyFinancialData.totalDonations
      },

      {
        Category:
          "Closing Balance",

        Value:
          dailyFinancialData.closingBalance
      },

      {
        Category:
          "Students Present",

        Value:
          dailyAttendanceData.studentsPresent
      },

      {
        Category:
          "Students Absent",

        Value:
          dailyAttendanceData.studentsAbsent
      },

      {
        Category:
          "Staff Present",

        Value:
          dailyAttendanceData.staffPresent
      },

      {
        Category:
          "Staff Absent",

        Value:
          dailyAttendanceData.staffAbsent
      },

      {
        Category:
          "Closing Status",

        Value:
          dayStatus
      }

    ];


    const worksheet =
      XLSX.utils.json_to_sheet(
        summaryData
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Daily Closing"
    );


    XLSX.writeFile(
      workbook,
      `Daily_Closing_${selectedDate}.xlsx`
    );

  };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    const pdfDocument =
      new jsPDF();


    pdfDocument.setFontSize(
      18
    );


    pdfDocument.text(
      "Daily Closing Report",
      14,
      18
    );


    pdfDocument.setFontSize(
      10
    );


    pdfDocument.text(
      `Date: ${formatDate(selectedDate)}`,
      14,
      26
    );


    pdfDocument.text(
      `Status: ${dayStatus}`,
      14,
      32
    );


    const summaryTable = [

      [
        "Income",
        `Rs. ${dailyFinancialData.totalIncome}`
      ],

      [
        "Expenses",
        `Rs. ${dailyFinancialData.totalExpenses}`
      ],

      [
        "Donations",
        `Rs. ${dailyFinancialData.totalDonations}`
      ],

      [
        "Closing Balance",
        `Rs. ${dailyFinancialData.closingBalance}`
      ],

      [
        "Students Present",
        dailyAttendanceData.studentsPresent
      ],

      [
        "Students Absent",
        dailyAttendanceData.studentsAbsent
      ],

      [
        "Staff Present",
        dailyAttendanceData.staffPresent
      ],

      [
        "Staff Absent",
        dailyAttendanceData.staffAbsent
      ]

    ];


    autoTable(
      pdfDocument,
      {

        head: [[
          "Daily Summary",
          "Value"
        ]],

        body:
          summaryTable,

        startY:
          40

      }
    );


    if (
      alerts.length > 0
    ) {

      const alertTable =
        alerts.map(
          (alert) => [

            alert.type,

            alert.message

          ]
        );


      autoTable(
        pdfDocument,
        {

          head: [[
            "Pending Item",
            "Message"
          ]],

          body:
            alertTable,

          startY:
            pdfDocument
              .lastAutoTable
              .finalY + 10

        }
      );

    }


    pdfDocument.save(
      `Daily_Closing_${selectedDate}.pdf`
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
              🌙 Daily Closing Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review daily finances, attendance, pending entries, and closing status.
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
                  Loading Daily Closing Report...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while today's records are loaded.
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

                <div className="form-grid">

                  <div>

                    <label>
                      📅 Closing Report Date
                    </label>

                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) =>
                        setSelectedDate(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      🕒 Last Updated
                    </label>

                    <input
                      type="text"
                      value={
                        lastUpdated.toLocaleString(
                          "en-IN"
                        )
                      }
                      readOnly
                    />

                  </div>

                </div>

              </div>


              <div
                className="section-card"
                style={{
                  marginBottom: "24px",
                  border:
                    dayStatus === "Completed"
                      ? "1px solid #bbf7d0"
                      : "1px solid #fde68a",
                  background:
                    dayStatus === "Completed"
                      ? "#f0fdf4"
                      : "#fffbeb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2 style={{ margin: "0 0 6px" }}>

                      {
                        dayStatus === "Completed"
                          ? "✅ Daily Closing Completed"
                          : "⚠️ Daily Closing Pending"
                      }

                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >

                      {
                        dayStatus === "Completed"
                          ? "All required financial and attendance entries are available."
                          : `${alerts.length} pending item${alerts.length === 1 ? "" : "s"} require attention.`
                      }

                    </p>

                  </div>


                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: "20px",
                      background:
                        dayStatus === "Completed"
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        dayStatus === "Completed"
                          ? "#166534"
                          : "#92400e",
                      fontWeight: "700"
                    }}
                  >
                    {
                      dayStatus === "Completed"
                        ? "CLOSED"
                        : "PENDING"
                    }
                  </div>

                </div>

              </div>


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
                        dailyFinancialData.totalIncome
                      )
                    }
                  </h2>

                  <p>
                    💵 Daily Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dailyFinancialData.totalExpenses
                      )
                    }
                  </h2>

                  <p>
                    💸 Daily Expenses
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dailyFinancialData.totalDonations
                      )
                    }
                  </h2>

                  <p>
                    ❤️ Daily Donations
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        dailyFinancialData.closingBalance
                      )
                    }
                  </h2>

                  <p>
                    🏦 Closing Balance
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      dailyFinancialData.totalTransactions
                    }
                  </h2>

                  <p>
                    📄 Transactions
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      dailyAttendanceData.studentsPresent
                    }
                  </h2>

                  <p>
                    👨‍🎓 Students Present
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      dailyAttendanceData.studentsAbsent
                    }
                  </h2>

                  <p>
                    🚫 Students Absent
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      dailyAttendanceData.staffPresent
                    }
                  </h2>

                  <p>
                    👳 Staff Present
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      dailyAttendanceData.staffAbsent
                    }
                  </h2>

                  <p>
                    🚫 Staff Absent
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      alerts.length
                    }
                  </h2>

                  <p>
                    ⚠️ Pending Items
                  </p>

                </div>

              </div>


              {
                alerts.length > 0 ? (

                  <div
                    className="section-card"
                    style={{
                      marginBottom: "24px"
                    }}
                  >

                    <h2 style={{ marginTop: 0 }}>
                      ⚠️ Pending Closing Items
                    </h2>

                    <p
                      style={{
                        color: "#64748b"
                      }}
                    >
                      Complete or review these entries before considering the day fully closed.
                    </p>


                    {
                      alerts.map(
                        (alert, index) => (

                          <div
                            key={`${alert.type}-${index}`}
                            style={{
                              padding: "14px 16px",
                              marginTop: "12px",
                              borderRadius: "10px",
                              background: "#fffbeb",
                              border: "1px solid #fde68a"
                            }}
                          >

                            <strong>
                              ⚠️ {alert.type}
                            </strong>

                            <p
                              style={{
                                margin: "5px 0 0",
                                color: "#64748b"
                              }}
                            >
                              {alert.message}
                            </p>

                          </div>

                        )
                      )
                    }

                  </div>

                ) : (

                  <div
                    className="section-card"
                    style={{
                      marginBottom: "24px",
                      textAlign: "center",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "48px",
                        marginBottom: "10px"
                      }}
                    >
                      ✅
                    </div>

                    <h2>
                      All Daily Entries Completed
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      No pending closing items were detected for this date.
                    </p>

                  </div>

                )
              }


              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <h2 style={{ marginTop: 0 }}>
                  💰 Daily Financial Summary
                </h2>

                <div className="attendance-table-container">

                  <table className="attendance-table">

                    <thead>

                      <tr>

                        <th>
                          Category
                        </th>

                        <th>
                          Entries
                        </th>

                        <th>
                          Amount
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      <tr>

                        <td>
                          💵 Income
                        </td>

                        <td>
                          {
                            dailyFinancialData
                              .dailyIncomes
                              .length
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              formatCurrency(
                                dailyFinancialData.totalIncome
                              )
                            }
                          </strong>
                        </td>

                      </tr>


                      <tr>

                        <td>
                          💸 Expenses
                        </td>

                        <td>
                          {
                            dailyFinancialData
                              .dailyExpenses
                              .length
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              formatCurrency(
                                dailyFinancialData.totalExpenses
                              )
                            }
                          </strong>
                        </td>

                      </tr>


                      <tr>

                        <td>
                          ❤️ Donations
                        </td>

                        <td>
                          {
                            dailyFinancialData
                              .dailyDonations
                              .length
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              formatCurrency(
                                dailyFinancialData.totalDonations
                              )
                            }
                          </strong>
                        </td>

                      </tr>


                      <tr>

                        <td>
                          🏦 Closing Balance
                        </td>

                        <td>
                          {
                            dailyFinancialData.totalTransactions
                          }
                        </td>

                        <td>
                          <strong>
                            {
                              formatCurrency(
                                dailyFinancialData.closingBalance
                              )
                            }
                          </strong>
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>


              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <h2 style={{ marginTop: 0 }}>
                  📋 Daily Attendance Summary
                </h2>

                <div className="attendance-table-container">

                  <table className="attendance-table">

                    <thead>

                      <tr>

                        <th>
                          Attendance Type
                        </th>

                        <th>
                          Present
                        </th>

                        <th>
                          Absent
                        </th>

                        <th>
                          Total Records
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      <tr>

                        <td>
                          👨‍🎓 Student Attendance
                        </td>

                        <td>
                          {
                            dailyAttendanceData.studentsPresent
                          }
                        </td>

                        <td>
                          {
                            dailyAttendanceData.studentsAbsent
                          }
                        </td>

                        <td>
                          {
                            dailyAttendanceData
                              .dailyStudentAttendance
                              .length
                          }
                        </td>

                        <td>

                          {
                            dailyAttendanceData
                              .studentAttendanceCompleted
                              ? "✅ Completed"
                              : "⚠️ Pending"
                          }

                        </td>

                      </tr>


                      <tr>

                        <td>
                          👳 Staff Attendance
                        </td>

                        <td>
                          {
                            dailyAttendanceData.staffPresent
                          }
                        </td>

                        <td>
                          {
                            dailyAttendanceData.staffAbsent
                          }
                        </td>

                        <td>
                          {
                            dailyAttendanceData
                              .dailyStaffAttendance
                              .length
                          }
                        </td>

                        <td>

                          {
                            dailyAttendanceData
                              .staffAttendanceCompleted
                              ? "✅ Completed"
                              : "⚠️ Pending"
                          }

                        </td>

                      </tr>

                    </tbody>

                  </table>

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
                      📤 Export Daily Closing Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the complete closing summary for the selected date.
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
                  💰 Accounts
                </Link>


                <Link
                  to="/attendance"
                  className="action-btn view-btn"
                >
                  👨‍🎓 Student Attendance
                </Link>


                <Link
                  to="/staff-attendance"
                  className="action-btn view-btn"
                >
                  👳 Staff Attendance
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

export default DailyClosingReport;