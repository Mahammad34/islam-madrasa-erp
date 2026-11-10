import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import {
  useCallback,
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

function StaffSalary() {

  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  const [
    salaryRecords,
    setSalaryRecords
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
  // DISPLAY FALLBACK VALUE
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "Not Available"
    ) => {

      if (
        value === undefined ||
        value === null ||
        String(
          value
        ).trim() === ""
      ) {

        return fallback;

      }


      return value;

    };


  // ============================================================
  // GET STAFF STATUS
  // ============================================================

  const getStaffStatus =
    (
      member
    ) => {

      if (
        member.staffStatus
      ) {

        return member.staffStatus;

      }


      if (
        member.isActive === false
      ) {

        return "Inactive";

      }


      return "Active";

    };


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      amount
    ) => {

      const numericAmount =
        Number(
          amount
        );


      if (
        Number.isNaN(
          numericAmount
        )
      ) {

        return "₹0";

      }


      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }
      ).format(
        numericAmount
      );

    };


  // ============================================================
  // GET CURRENT MONTH VALUE
  // ============================================================

  const getCurrentMonthValue =
    () => {

      const currentDate =
        new Date();


      const year =
        currentDate.getFullYear();


      const month =
        String(
          currentDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}`;

    };


  // ============================================================
  // FORMAT SALARY MONTH
  // ============================================================

  const formatSalaryMonth =
    (
      salaryMonth
    ) => {

      if (
        !salaryMonth
      ) {

        return "Not Available";

      }


      const [
        year,
        month
      ] =
        String(
          salaryMonth
        )
          .split("-")
          .map(
            Number
          );


      if (
        !year ||
        !month
      ) {

        return salaryMonth;

      }


      const date =
        new Date(
          year,
          month - 1,
          1
        );


      return date.toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FETCH STAFF AND SALARY RECORDS
  // ============================================================

  const fetchSalaryDashboardData =
    useCallback(
      async (
        showRefreshState = false
      ) => {

        if (
          showRefreshState
        ) {

          setIsRefreshing(
            true
          );

        }
        else {

          setIsLoading(
            true
          );

        }


        setErrorMessage("");


        try {

          const [
            staffSnapshot,
            salarySnapshot
          ] =
            await Promise.all(
              [

                getDocs(
                  query(
                    collection(
                      db,
                      "staff"
                    ),
                    where(
                      "madrasaId",
                      "==",
                      madrasaId
                    )
                  )
                ),

                getDocs(
                  query(
                    collection(
                      db,
                      "staffSalary"
                    ),
                    where(
                      "madrasaId",
                      "==",
                      madrasaId
                    )
                  )
                )

              ]
            );


          const staffList =
            staffSnapshot.docs
              .map(
                (
                  staffDocument
                ) => ({

                  id:
                    staffDocument.id,

                  ...staffDocument.data()

                })
              )
              .filter(
                (
                  member
                ) =>
                  member.isDeleted !==
                    true &&
                  getStaffStatus(
                    member
                  ) ===
                    "Active"
              );


          const salaryList =
            salarySnapshot.docs.map(
              (
                salaryDocument
              ) => ({

                id:
                  salaryDocument.id,

                ...salaryDocument.data()

              })
            );


          if (
            isMountedRef.current
          ) {

            setStaff(
              staffList
            );


            setSalaryRecords(
              salaryList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff salary dashboard:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff salary information. Please check your connection and try again."
            );

          }

        }
        finally {

          if (
            isMountedRef.current
          ) {

            setIsLoading(
              false
            );


            setIsRefreshing(
              false
            );

          }

        }

      },
      [
        madrasaId
      ]
    );


  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(
    () => {

      fetchSalaryDashboardData();

    },
    [
      fetchSalaryDashboardData
    ]
  );


  // ============================================================
  // CURRENT MONTH
  // ============================================================

  const currentMonth =
    useMemo(
      () =>
        getCurrentMonthValue(),
      []
    );


  // ============================================================
  // CURRENT MONTH SALARY RECORDS
  // ============================================================

  const currentMonthSalaryRecords =
    useMemo(
      () => {

        return salaryRecords.filter(
          (
            record
          ) =>
            record.salaryMonth ===
            currentMonth
        );

      },
      [
        salaryRecords,
        currentMonth
      ]
    );


  // ============================================================
  // SALARY DASHBOARD STATISTICS
  // ============================================================

  const salaryStatistics =
    useMemo(
      () => {

        const totalActiveStaff =
          staff.length;


        const totalSalaryRecords =
          currentMonthSalaryRecords.length;


        const paidRecords =
          currentMonthSalaryRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Paid"
          );


        const pendingRecords =
          currentMonthSalaryRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Pending"
          );


        const paidStaff =
          paidRecords.length;


        const pendingStaff =
          pendingRecords.length;


        const salaryNotAdded =
          Math.max(
            totalActiveStaff -
            totalSalaryRecords,
            0
          );


        const totalPaidAmount =
          paidRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              Number(
                record.salaryAmount ||
                0
              ),
            0
          );


        const totalPendingAmount =
          pendingRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              Number(
                record.salaryAmount ||
                0
              ),
            0
          );


        const totalSalaryAmount =
          currentMonthSalaryRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              Number(
                record.salaryAmount ||
                0
              ),
            0
          );


        const paymentCompletionPercentage =
          totalSalaryRecords > 0
            ?
            Math.round(
              (
                paidStaff /
                totalSalaryRecords
              ) *
              100
            )
            :
            0;


        return {

          totalActiveStaff,

          totalSalaryRecords,

          paidStaff,

          pendingStaff,

          salaryNotAdded,

          totalPaidAmount,

          totalPendingAmount,

          totalSalaryAmount,

          paymentCompletionPercentage

        };

      },
      [
        staff,
        currentMonthSalaryRecords
      ]
    );


  // ============================================================
  // RECENT SALARY RECORDS
  // ============================================================

  const recentSalaryRecords =
    useMemo(
      () => {

        return [
          ...salaryRecords
        ]
          .sort(
            (
              firstRecord,
              secondRecord
            ) => {

              const firstMonth =
                String(
                  firstRecord.salaryMonth ||
                  ""
                );


              const secondMonth =
                String(
                  secondRecord.salaryMonth ||
                  ""
                );


              if (
                secondMonth !==
                firstMonth
              ) {

                return secondMonth.localeCompare(
                  firstMonth
                );

              }


              const firstCreatedAt =
                firstRecord.createdAt?.seconds ||
                0;


              const secondCreatedAt =
                secondRecord.createdAt?.seconds ||
                0;


              return (
                secondCreatedAt -
                firstCreatedAt
              );

            }
          )
          .slice(
            0,
            5
          );

      },
      [
        salaryRecords
      ]
    );


  // ============================================================
  // GET SALARY STATUS BACKGROUND
  // ============================================================

  const getSalaryStatusBackground =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Paid":

          return "#dcfce7";


        case "Pending":

          return "#fef3c7";


        default:

          return "#f1f5f9";

      }

    };


  // ============================================================
  // GET SALARY STATUS COLOR
  // ============================================================

  const getSalaryStatusColor =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Paid":

          return "#15803d";


        case "Pending":

          return "#b45309";


        default:

          return "#475569";

      }

    };


  // ============================================================
  // GET SALARY STATUS ICON
  // ============================================================

  const getSalaryStatusIcon =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Paid":

          return "✅";


        case "Pending":

          return "⏳";


        default:

          return "⚪";

      }

    };


  // ============================================================
  // REFRESH SALARY DASHBOARD
  // ============================================================

  const refreshSalaryDashboard =
    async () => {

      await fetchSalaryDashboardData(
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
            alignItems: "center",
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
              💰 Staff Salary
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Manage monthly staff salaries, payments and salary records.
            </p>

          </div>


          <button
            type="button"
            onClick={
              refreshSalaryDashboard
            }
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
                  padding: "50px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "46px",
                    marginBottom: "14px"
                  }}
                >
                  ⏳
                </div>


                <h2>
                  Loading Salary Dashboard...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff and salary records are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            SALARY DASHBOARD CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  CURRENT MONTH BANNER
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
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

                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#64748b",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      CURRENT SALARY MONTH
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      📅 {formatSalaryMonth(currentMonth)}
                    </h2>

                  </div>


                  <span
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      background:
                        salaryStatistics.salaryNotAdded === 0 &&
                        salaryStatistics.pendingStaff === 0 &&
                        salaryStatistics.totalActiveStaff > 0
                          ?
                          "#dcfce7"
                          :
                          "#fef3c7",
                      color:
                        salaryStatistics.salaryNotAdded === 0 &&
                        salaryStatistics.pendingStaff === 0 &&
                        salaryStatistics.totalActiveStaff > 0
                          ?
                          "#15803d"
                          :
                          "#b45309",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      salaryStatistics.totalActiveStaff === 0
                        ?
                        "NO ACTIVE STAFF"
                        :
                        salaryStatistics.salaryNotAdded === 0 &&
                          salaryStatistics.pendingStaff === 0
                          ?
                          "ALL SALARIES COMPLETED"
                          :
                          "SALARY PROCESSING"
                    }
                  </span>

                </div>

              </div>


              {/* ==================================================
                  SALARY STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                {
                  [

                    [
                      "👥",
                      "Active Staff",
                      salaryStatistics.totalActiveStaff,
                      "#475569"
                    ],

                    [
                      "📋",
                      "Salary Records",
                      salaryStatistics.totalSalaryRecords,
                      "#2563eb"
                    ],

                    [
                      "✅",
                      "Paid",
                      salaryStatistics.paidStaff,
                      "#15803d"
                    ],

                    [
                      "⏳",
                      "Pending",
                      salaryStatistics.pendingStaff,
                      "#b45309"
                    ],

                    [
                      "⚪",
                      "Not Added",
                      salaryStatistics.salaryNotAdded,
                      "#6d28d9"
                    ]

                  ].map(
                    (
                      [
                        icon,
                        label,
                        value,
                        textColor
                      ]
                    ) => (

                      <div
                        className="section-card"
                        key={
                          label
                        }
                      >

                        <p
                          style={{
                            margin: "0 0 8px",
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          {icon} {label.toUpperCase()}
                        </p>


                        <h2
                          style={{
                            margin: 0,
                            fontSize: "30px",
                            color: textColor
                          }}
                        >
                          {value}
                        </h2>

                      </div>

                    )
                  )
                }

              </div>


              {/* ==================================================
                  SALARY AMOUNT STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#2563eb",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    💰 TOTAL SALARY
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#2563eb"
                    }}
                  >
                    {
                      formatCurrency(
                        salaryStatistics.totalSalaryAmount
                      )
                    }
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#15803d",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    ✅ TOTAL PAID
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#15803d"
                    }}
                  >
                    {
                      formatCurrency(
                        salaryStatistics.totalPaidAmount
                      )
                    }
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#b45309",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    ⏳ TOTAL PENDING
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#b45309"
                    }}
                  >
                    {
                      formatCurrency(
                        salaryStatistics.totalPendingAmount
                      )
                    }
                  </h2>

                </div>

              </div>


              {/* ==================================================
                  PAYMENT COMPLETION PROGRESS
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "14px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 5px"
                      }}
                    >
                      📊 Salary Payment Progress
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      {
                        salaryStatistics.paidStaff
                      }
                      {" "}
                      of
                      {" "}
                      {
                        salaryStatistics.totalSalaryRecords
                      }
                      {" "}
                      salary records are paid this month.
                    </p>

                  </div>


                  <strong
                    style={{
                      fontSize: "24px",
                      color: "#2563eb"
                    }}
                  >
                    {
                      salaryStatistics.paymentCompletionPercentage
                    }
                    %
                  </strong>

                </div>


                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "999px",
                    background: "#e2e8f0",
                    overflow: "hidden"
                  }}
                >

                  <div
                    style={{
                      width:
                        `${salaryStatistics.paymentCompletionPercentage}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "#2563eb",
                      transition: "width 0.3s ease"
                    }}
                  />

                </div>

              </div>


              {/* ==================================================
                  QUICK ACTIONS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "18px",
                  marginBottom: "28px"
                }}
              >

                <Link
                  to="/add-salary"
                  className="link"
                >

                  <div
                    className="section-card"
                    style={{
                      height: "100%"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "38px",
                        marginBottom: "12px"
                      }}
                    >
                      ➕
                    </div>


                    <h2>
                      Add Salary
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      Create or update monthly salary records for active staff members.
                    </p>

                  </div>

                </Link>


                <Link
                  to="/salary-history"
                  className="link"
                >

                  <div
                    className="section-card"
                    style={{
                      height: "100%"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "38px",
                        marginBottom: "12px"
                      }}
                    >
                      📜
                    </div>


                    <h2>
                      Salary History
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      Search, review and manage previous staff salary records.
                    </p>

                  </div>

                </Link>

              </div>


              {/* ==================================================
                  RECENT SALARY RECORDS
              ================================================== */}

              <div>

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
                        margin: "0 0 5px"
                      }}
                    >
                      🕒 Recent Salary Records
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Latest salary records added to the system.
                    </p>

                  </div>


                  {
                    salaryRecords.length > 0 && (

                      <Link
                        to="/salary-history"
                        className="action-btn view-btn"
                      >
                        View All Records
                      </Link>

                    )
                  }

                </div>


                {/* ================================================
                    NO SALARY RECORDS
                ================================================ */}

                {
                  recentSalaryRecords.length === 0 && (

                    <div className="section-card">

                      <div
                        style={{
                          padding: "45px 20px",
                          textAlign: "center"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "50px",
                            marginBottom: "14px"
                          }}
                        >
                          💰
                        </div>


                        <h2>
                          No Salary Records Available
                        </h2>


                        <p
                          style={{
                            margin: "0 0 22px",
                            color: "#64748b"
                          }}
                        >
                          Add your first staff salary record to start managing salary payments.
                        </p>


                        <Link
                          to="/add-salary"
                          className="action-btn view-btn"
                        >
                          ➕ Add Salary
                        </Link>

                      </div>

                    </div>

                  )
                }


                {/* ================================================
                    SALARY RECORD CARDS
                ================================================ */}

                {
                  recentSalaryRecords.map(
                    (
                      record
                    ) => (

                      <div
                        className="student-card"
                        key={
                          record.id
                        }
                        style={{
                          marginBottom: "16px"
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "16px",
                            flexWrap: "wrap"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "16px",
                              flex: 1,
                              minWidth: 0
                            }}
                          >

                            <div
                              className="student-avatar"
                              style={{
                                width: "64px",
                                height: "64px",
                                minWidth: "64px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background: "#f1f5f9",
                                fontSize: "30px"
                              }}
                            >
                              👳
                            </div>


                            <div
                              style={{
                                minWidth: 0,
                                flex: 1
                              }}
                            >

                              <h2
                                className="student-name"
                                style={{
                                  margin: "0 0 7px"
                                }}
                              >
                                {
                                  displayValue(
                                    record.staffName,
                                    "Unnamed Staff"
                                  )
                                }
                              </h2>


                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#475569"
                                }}
                              >
                                💼
                                {" "}
                                {
                                  displayValue(
                                    record.position
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                📅
                                {" "}
                                {
                                  formatSalaryMonth(
                                    record.salaryMonth
                                  )
                                }
                              </p>

                            </div>

                          </div>


                          <span
                            style={{
                              padding: "7px 13px",
                              borderRadius: "999px",
                              background:
                                getSalaryStatusBackground(
                                  record.status
                                ),
                              color:
                                getSalaryStatusColor(
                                  record.status
                                ),
                              fontSize: "12px",
                              fontWeight: "800"
                            }}
                          >
                            {
                              getSalaryStatusIcon(
                                record.status
                              )
                            }
                            {" "}
                            {
                              displayValue(
                                record.status
                              )
                            }
                          </span>

                        </div>


                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "14px",
                            marginTop: "18px",
                            paddingTop: "18px",
                            borderTop: "1px solid #e2e8f0"
                          }}
                        >

                          <div>

                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#64748b",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              SALARY AMOUNT
                            </p>


                            <strong
                              style={{
                                color: "#2563eb"
                              }}
                            >
                              {
                                formatCurrency(
                                  record.salaryAmount
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#64748b",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              SALARY MONTH
                            </p>


                            <strong>
                              {
                                formatSalaryMonth(
                                  record.salaryMonth
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#64748b",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              PAYMENT STATUS
                            </p>


                            <strong
                              style={{
                                color:
                                  getSalaryStatusColor(
                                    record.status
                                  )
                              }}
                            >
                              {
                                getSalaryStatusIcon(
                                  record.status
                                )
                              }
                              {" "}
                              {
                                displayValue(
                                  record.status
                                )
                              }
                            </strong>

                          </div>

                        </div>

                      </div>

                    )
                  )
                }

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

export default StaffSalary;