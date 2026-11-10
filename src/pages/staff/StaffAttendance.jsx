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

function StaffAttendance() {
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
  // PAGE STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  const [
    attendanceRecords,
    setAttendanceRecords
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
  // GET LOCAL DATE KEY
  // ============================================================

  const getLocalDateKey =
    (
      date = new Date()
    ) => {

      const year =
        date.getFullYear();


      const month =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}-${day}`;

    };


  // ============================================================
  // TODAY DATE KEY
  // ============================================================

  const todayDateKey =
    useMemo(
      () =>
        getLocalDateKey(),
      []
    );


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
  // FETCH ATTENDANCE DASHBOARD DATA
  // ============================================================

  const fetchAttendanceDashboardData =
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


        setErrorMessage(
          ""
        );


        try {

          const [
            staffSnapshot,
            attendanceSnapshot
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
      "staffAttendance"
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


          const attendanceList =
            attendanceSnapshot.docs
              .map(
                (
                  attendanceDocument
                ) => ({

                  id:
                    attendanceDocument.id,

                  ...attendanceDocument.data()

                })
              );


          if (
            isMountedRef.current
          ) {

            setStaff(
              staffList
            );


            setAttendanceRecords(
              attendanceList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff attendance dashboard:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff attendance information. Please check your connection and try again."
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

      fetchAttendanceDashboardData();

    },
    [
      fetchAttendanceDashboardData
    ]
  );


  // ============================================================
  // TODAY ATTENDANCE RECORDS
  // ============================================================

  const todayAttendanceRecords =
    useMemo(
      () => {

        return attendanceRecords.filter(
          (
            attendanceRecord
          ) =>
            attendanceRecord.attendanceDate ===
            todayDateKey
        );

      },
      [
        attendanceRecords,
        todayDateKey
      ]
    );


  // ============================================================
  // TODAY ATTENDANCE STATISTICS
  // ============================================================

  const attendanceStatistics =
    useMemo(
      () => {

        const totalActiveStaff =
          staff.length;


        const attendanceMarked =
          todayAttendanceRecords.length;


        const presentStaff =
          todayAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Present"
          ).length;


        const absentStaff =
          todayAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Absent"
          ).length;


        const leaveStaff =
          todayAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Leave"
          ).length;


        const halfDayStaff =
          todayAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Half Day"
          ).length;


        const attendancePending =
          Math.max(
            totalActiveStaff -
            attendanceMarked,
            0
          );


        const attendancePercentage =
          totalActiveStaff > 0
            ?
            Math.round(
              (
                presentStaff /
                totalActiveStaff
              ) *
              100
            )
            :
            0;


        return {

          totalActiveStaff,

          attendanceMarked,

          presentStaff,

          absentStaff,

          leaveStaff,

          halfDayStaff,

          attendancePending,

          attendancePercentage

        };

      },
      [
        staff,
        todayAttendanceRecords
      ]
    );


  // ============================================================
  // RECENT ATTENDANCE RECORDS
  // ============================================================

  const recentAttendanceRecords =
    useMemo(
      () => {

        return [
          ...attendanceRecords
        ]
          .sort(
            (
              firstRecord,
              secondRecord
            ) => {

              const firstDate =
                String(
                  firstRecord.attendanceDate ||
                  ""
                );


              const secondDate =
                String(
                  secondRecord.attendanceDate ||
                  ""
                );


              if (
                firstDate !==
                secondDate
              ) {

                return secondDate.localeCompare(
                  firstDate
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
        attendanceRecords
      ]
    );


  // ============================================================
  // REFRESH DASHBOARD
  // ============================================================

  const refreshDashboard =
    async () => {

      await fetchAttendanceDashboardData(
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
              📋 Staff Attendance
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Manage daily staff attendance and review attendance records.
            </p>

          </div>


          <button
            type="button"
            onClick={
              refreshDashboard
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
                  Loading Attendance Dashboard...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff attendance information is being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            DASHBOARD CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  TODAY INFORMATION
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
                    gap: "16px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "700"
                      }}
                    >
                      📅 TODAY'S ATTENDANCE
                    </p>

                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      {
                        new Date().toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          }
                        )
                      }
                    </h2>

                  </div>


                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      background:
                        attendanceStatistics.attendancePending === 0 &&
                        attendanceStatistics.totalActiveStaff > 0
                          ?
                          "#dcfce7"
                          :
                          "#fef3c7",
                      color:
                        attendanceStatistics.attendancePending === 0 &&
                        attendanceStatistics.totalActiveStaff > 0
                          ?
                          "#15803d"
                          :
                          "#b45309",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      attendanceStatistics.totalActiveStaff === 0
                        ?
                        "NO ACTIVE STAFF"
                        :
                        attendanceStatistics.attendancePending === 0
                          ?
                          "ATTENDANCE COMPLETED"
                          :
                          `${attendanceStatistics.attendancePending} PENDING`
                    }
                  </div>

                </div>

              </div>


              {/* ==================================================
                  ATTENDANCE STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px"
                }}
              >

                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    👥 ACTIVE STAFF
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px"
                    }}
                  >
                    {
                      attendanceStatistics.totalActiveStaff
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
                    ✅ PRESENT
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                      color: "#15803d"
                    }}
                  >
                    {
                      attendanceStatistics.presentStaff
                    }
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#b91c1c",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    ❌ ABSENT
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                      color: "#b91c1c"
                    }}
                  >
                    {
                      attendanceStatistics.absentStaff
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
                    🏖 LEAVE
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                      color: "#b45309"
                    }}
                  >
                    {
                      attendanceStatistics.leaveStaff
                    }
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#6d28d9",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    🕐 HALF DAY
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                      color: "#6d28d9"
                    }}
                  >
                    {
                      attendanceStatistics.halfDayStaff
                    }
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#2563eb",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    📝 MARKED
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
                      color: "#2563eb"
                    }}
                  >
                    {
                      attendanceStatistics.attendanceMarked
                    }
                  </h2>

                </div>

              </div>


              {/* ==================================================
                  ATTENDANCE PROGRESS
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
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
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
                      📊 Today's Attendance Progress
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      {
                        attendanceStatistics.attendanceMarked
                      }
                      {" "}
                      of
                      {" "}
                      {
                        attendanceStatistics.totalActiveStaff
                      }
                      {" "}
                      active staff attendance records marked.
                    </p>

                  </div>


                  <strong
                    style={{
                      fontSize: "22px"
                    }}
                  >
                    {
                      attendanceStatistics.totalActiveStaff > 0
                        ?
                        Math.round(
                          (
                            attendanceStatistics.attendanceMarked /
                            attendanceStatistics.totalActiveStaff
                          ) *
                          100
                        )
                        :
                        0
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
                        `${
                          attendanceStatistics.totalActiveStaff > 0
                            ?
                            Math.min(
                              Math.round(
                                (
                                  attendanceStatistics.attendanceMarked /
                                  attendanceStatistics.totalActiveStaff
                                ) *
                                100
                              ),
                              100
                            )
                            :
                            0
                        }%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "#2563eb",
                      transition: "width 0.3s ease"
                    }}
                  />

                </div>

              </div>


              {/* ==================================================
                  ATTENDANCE MODULE ACTIONS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "18px",
                  marginBottom: "26px"
                }}
              >

                {/* ================================================
                    MARK ATTENDANCE
                ================================================ */}

                <Link
                  to="/mark-staff-attendance"
                  className="link"
                >

                  <div
                    className="section-card"
                    style={{
                      height: "100%",
                      cursor: "pointer"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "42px",
                        marginBottom: "14px"
                      }}
                    >
                      ➕
                    </div>

                    <h2>
                      Mark Staff Attendance
                    </h2>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      Mark daily attendance for active staff members with Present,
                      Absent, Leave and Half Day status.
                    </p>

                    <strong>
                      Open Attendance Register →
                    </strong>

                  </div>

                </Link>


                {/* ================================================
                    ATTENDANCE HISTORY
                ================================================ */}

                <Link
                  to="/staff-attendance-history"
                  className="link"
                >

                  <div
                    className="section-card"
                    style={{
                      height: "100%",
                      cursor: "pointer"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "42px",
                        marginBottom: "14px"
                      }}
                    >
                      📜
                    </div>

                    <h2>
                      Attendance History
                    </h2>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      Search and review previous staff attendance records by date,
                      staff member and attendance status.
                    </p>

                    <strong>
                      View Attendance History →
                    </strong>

                  </div>

                </Link>

              </div>


              {/* ==================================================
                  NO ACTIVE STAFF STATE
              ================================================== */}

              {
                staff.length === 0 && (

                  <div
                    className="section-card"
                    style={{
                      marginBottom: "24px"
                    }}
                  >

                    <div
                      style={{
                        padding: "35px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "48px",
                          marginBottom: "14px"
                        }}
                      >
                        👳
                      </div>

                      <h2>
                        No Active Staff Available
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Add active staff members before marking staff attendance.
                      </p>

                      <Link
                        to="/add-staff"
                        className="action-btn view-btn"
                      >
                        ➕ Add Staff
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  RECENT ATTENDANCE
              ================================================== */}

              <div className="section-card">

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
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
                      🕒 Recent Attendance Records
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Latest staff attendance activity.
                    </p>

                  </div>


                  <Link
                    to="/staff-attendance-history"
                    className="action-btn view-btn"
                  >
                    View All History
                  </Link>

                </div>


                {/* ================================================
                    NO ATTENDANCE RECORDS
                ================================================ */}

                {
                  recentAttendanceRecords.length === 0 && (

                    <div
                      style={{
                        padding: "35px 20px",
                        textAlign: "center",
                        background: "#f8fafc",
                        borderRadius: "10px"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "42px",
                          marginBottom: "12px"
                        }}
                      >
                        📋
                      </div>

                      <h3>
                        No Attendance Records Yet
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Attendance records will appear here after attendance is marked.
                      </p>

                    </div>

                  )
                }


                {/* ================================================
                    RECENT ATTENDANCE RECORD LIST
                ================================================ */}

                {
                  recentAttendanceRecords.map(
                    (
                      record
                    ) => {

                      const status =
                        displayValue(
                          record.status
                        );


                      let statusBackground =
                        "#f1f5f9";


                      let statusColor =
                        "#475569";


                      if (
                        status === "Present"
                      ) {

                        statusBackground =
                          "#dcfce7";

                        statusColor =
                          "#15803d";

                      }
                      else if (
                        status === "Absent"
                      ) {

                        statusBackground =
                          "#fee2e2";

                        statusColor =
                          "#b91c1c";

                      }
                      else if (
                        status === "Leave"
                      ) {

                        statusBackground =
                          "#fef3c7";

                        statusColor =
                          "#b45309";

                      }
                      else if (
                        status === "Half Day"
                      ) {

                        statusBackground =
                          "#ede9fe";

                        statusColor =
                          "#6d28d9";

                      }


                      return (

                        <div
                          key={
                            record.id
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "14px",
                            flexWrap: "wrap",
                            padding: "14px",
                            marginBottom: "10px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                          }}
                        >

                          <div>

                            <h3
                              style={{
                                margin: "0 0 5px"
                              }}
                            >
                              {
                                displayValue(
                                  record.staffName,
                                  "Unnamed Staff"
                                )
                              }
                            </h3>

                            <p
                              style={{
                                margin: 0,
                                color: "#64748b"
                              }}
                            >
                              🪪
                              {" "}
                              {
                                displayValue(
                                  record.staffId
                                )
                              }
                              {" • "}
                              📅
                              {" "}
                              {
                                displayValue(
                                  record.attendanceDate
                                )
                              }
                            </p>

                          </div>


                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "999px",
                              background: statusBackground,
                              color: statusColor,
                              fontSize: "12px",
                              fontWeight: "800"
                            }}
                          >
                            {
                              status
                            }
                          </span>

                        </div>

                      );

                    }
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

export default StaffAttendance;