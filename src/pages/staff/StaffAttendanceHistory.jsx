import {
  collection,
  deleteDoc,
  doc,
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

function StaffAttendanceHistory() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const searchInputRef =
    useRef(null);


  // ============================================================
  // ATTENDANCE DATA STATES
  // ============================================================

  const [
    attendanceRecords,
    setAttendanceRecords
  ] = useState([]);


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    departmentFilter,
    setDepartmentFilter
  ] = useState("All");


  const [
    positionFilter,
    setPositionFilter
  ] = useState("All");


  const [
    startDate,
    setStartDate
  ] = useState("");


  const [
    endDate,
    setEndDate
  ] = useState("");


  const [
    sortOption,
    setSortOption
  ] = useState("newest");


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
    isDeleting,
    setIsDeleting
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // RECORD DETAILS STATES
  // ============================================================

  const [
    selectedAttendanceRecord,
    setSelectedAttendanceRecord
  ] = useState(null);


  const [
    showRecordDetails,
    setShowRecordDetails
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    recordToDelete,
    setRecordToDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


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
  // NORMALIZE SEARCH VALUE
  // ============================================================

  const normalizeSearchValue =
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
  // FORMAT ATTENDANCE DATE
  // ============================================================

  const formatAttendanceDate =
    (
      attendanceDate
    ) => {

      if (
        !attendanceDate
      ) {

        return "Not Available";

      }


      const dateParts =
        String(
          attendanceDate
        ).split("-");


      if (
        dateParts.length !== 3
      ) {

        return attendanceDate;

      }


      const [
        year,
        month,
        day
      ] =
        dateParts.map(
          Number
        );


      const date =
        new Date(
          year,
          month - 1,
          day
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return attendanceDate;

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FORMAT FIRESTORE TIMESTAMP
  // ============================================================

  const formatTimestamp =
    (
      timestamp
    ) => {

      if (
        !timestamp
      ) {

        return "Not Available";

      }


      try {

        let date;


        if (
          typeof timestamp.toDate ===
          "function"
        ) {

          date =
            timestamp.toDate();

        }
        else if (
          timestamp.seconds
        ) {

          date =
            new Date(
              timestamp.seconds *
              1000
            );

        }
        else {

          date =
            new Date(
              timestamp
            );

        }


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return "Not Available";

        }


        return date.toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }
        );

      }
      catch (
        error
      ) {

        return "Not Available";

      }

    };


  // ============================================================
  // GET ATTENDANCE STATUS BACKGROUND
  // ============================================================

  const getAttendanceStatusBackground =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Present":

          return "#dcfce7";


        case "Absent":

          return "#fee2e2";


        case "Leave":

          return "#fef3c7";


        case "Half Day":

          return "#ede9fe";


        default:

          return "#f1f5f9";

      }

    };


  // ============================================================
  // GET ATTENDANCE STATUS COLOR
  // ============================================================

  const getAttendanceStatusColor =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Present":

          return "#15803d";


        case "Absent":

          return "#b91c1c";


        case "Leave":

          return "#b45309";


        case "Half Day":

          return "#6d28d9";


        default:

          return "#475569";

      }

    };


  // ============================================================
  // GET ATTENDANCE STATUS ICON
  // ============================================================

  const getAttendanceStatusIcon =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Present":

          return "✅";


        case "Absent":

          return "❌";


        case "Leave":

          return "🏖";


        case "Half Day":

          return "🕐";


        default:

          return "⚪";

      }

    };


  // ============================================================
  // FETCH ATTENDANCE HISTORY
  // ============================================================

  const fetchAttendanceHistory =
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

          const attendanceQuery =
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
  );

const attendanceSnapshot =
  await getDocs(
    attendanceQuery
  );

          const attendanceList =
            attendanceSnapshot.docs.map(
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

            setAttendanceRecords(
              attendanceList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff attendance history:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff attendance history. Please check your connection and try again."
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

            },
      [
        madrasaId
      ]
    );


  // ============================================================
  // LOAD ATTENDANCE HISTORY
  // ============================================================

  useEffect(
    () => {

      fetchAttendanceHistory();

    },
    [
      fetchAttendanceHistory
    ]
  );


  // ============================================================
  // UNIQUE DEPARTMENT OPTIONS
  // ============================================================

  const departmentOptions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            attendanceRecords
              .map(
                (
                  record
                ) =>
                  record.department
              )
              .filter(
                Boolean
              )
          )
        ).sort();

      },
      [
        attendanceRecords
      ]
    );


  // ============================================================
  // UNIQUE POSITION OPTIONS
  // ============================================================

  const positionOptions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            attendanceRecords
              .map(
                (
                  record
                ) =>
                  record.position
              )
              .filter(
                Boolean
              )
          )
        ).sort();

      },
      [
        attendanceRecords
      ]
    );


  // ============================================================
  // FILTER AND SORT ATTENDANCE RECORDS
  // ============================================================

  const filteredAttendanceRecords =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredRecords =
          attendanceRecords.filter(
            (
              record
            ) => {

              const matchesSearch =
                !normalizedSearchTerm ||
                [

                  record.staffName,

                  record.staffId,

                  record.mobileNumber,

                  record.position,

                  record.department,

                  record.remarks

                ].some(
                  (
                    value
                  ) =>
                    normalizeSearchValue(
                      value
                    ).includes(
                      normalizedSearchTerm
                    )
                );


              const matchesStatus =
                statusFilter === "All" ||
                record.status ===
                  statusFilter;


              const matchesDepartment =
                departmentFilter === "All" ||
                record.department ===
                  departmentFilter;


              const matchesPosition =
                positionFilter === "All" ||
                record.position ===
                  positionFilter;


              const matchesStartDate =
                !startDate ||
                (
                  record.attendanceDate &&
                  record.attendanceDate >=
                    startDate
                );


              const matchesEndDate =
                !endDate ||
                (
                  record.attendanceDate &&
                  record.attendanceDate <=
                    endDate
                );


              return (

                matchesSearch &&

                matchesStatus &&

                matchesDepartment &&

                matchesPosition &&

                matchesStartDate &&

                matchesEndDate

              );

            }
          );


        return filteredRecords.sort(
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
              sortOption ===
              "oldest"
            ) {

              return firstDate.localeCompare(
                secondDate
              );

            }


            if (
              sortOption ===
              "name-ascending"
            ) {

              return normalizeSearchValue(
                firstRecord.staffName
              ).localeCompare(
                normalizeSearchValue(
                  secondRecord.staffName
                )
              );

            }


            if (
              sortOption ===
              "name-descending"
            ) {

              return normalizeSearchValue(
                secondRecord.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstRecord.staffName
                )
              );

            }


            return secondDate.localeCompare(
              firstDate
            );

          }
        );

      },
      [
        attendanceRecords,
        searchTerm,
        statusFilter,
        departmentFilter,
        positionFilter,
        startDate,
        endDate,
        sortOption
      ]
    );


  // ============================================================
  // ATTENDANCE STATISTICS
  // ============================================================

  const attendanceStatistics =
    useMemo(
      () => {

        const totalRecords =
          filteredAttendanceRecords.length;


        const presentRecords =
          filteredAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Present"
          ).length;


        const absentRecords =
          filteredAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Absent"
          ).length;


        const leaveRecords =
          filteredAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Leave"
          ).length;


        const halfDayRecords =
          filteredAttendanceRecords.filter(
            (
              record
            ) =>
              record.status ===
              "Half Day"
          ).length;


        const attendancePercentage =
          totalRecords > 0
            ?
            Math.round(
              (
                presentRecords /
                totalRecords
              ) *
              100
            )
            :
            0;


        return {

          totalRecords,

          presentRecords,

          absentRecords,

          leaveRecords,

          halfDayRecords,

          attendancePercentage

        };

      },
      [
        filteredAttendanceRecords
      ]
    );


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !== "" ||

          statusFilter !== "All" ||

          departmentFilter !== "All" ||

          positionFilter !== "All" ||

          startDate !== "" ||

          endDate !== "" ||

          sortOption !== "newest"

        );

      },
      [
        searchTerm,
        statusFilter,
        departmentFilter,
        positionFilter,
        startDate,
        endDate,
        sortOption
      ]
    );


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setStatusFilter("All");

      setDepartmentFilter("All");

      setPositionFilter("All");

      setStartDate("");

      setEndDate("");

      setSortOption("newest");


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // OPEN ATTENDANCE RECORD DETAILS
  // ============================================================

  const openRecordDetails =
    (
      record
    ) => {

      setSelectedAttendanceRecord(
        record
      );


      setShowRecordDetails(
        true
      );


      setTimeout(
        () => {

          document
            .getElementById(
              "attendance-record-details"
            )
            ?.scrollIntoView(
              {
                behavior: "smooth",
                block: "start"
              }
            );

        },
        100
      );

    };


  // ============================================================
  // CLOSE ATTENDANCE RECORD DETAILS
  // ============================================================

  const closeRecordDetails =
    () => {

      setShowRecordDetails(false);

      setSelectedAttendanceRecord(null);

    };


  // ============================================================
  // REQUEST DELETE RECORD
  // ============================================================

  const requestDeleteRecord =
    (
      record
    ) => {

      setRecordToDelete(
        record
      );


      setShowDeleteConfirmation(
        true
      );

    };


  // ============================================================
  // CANCEL DELETE RECORD
  // ============================================================

  const cancelDeleteRecord =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setRecordToDelete(null);

      setShowDeleteConfirmation(false);

    };


  // ============================================================
  // CONFIRM DELETE RECORD
  // ============================================================

  const confirmDeleteRecord =
    async () => {

      if (
        !recordToDelete ||
        isDeleting
      ) {

        return;

      }


      setIsDeleting(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await deleteDoc(
          doc(
            db,
            "staffAttendance",
            recordToDelete.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setAttendanceRecords(
            (
              previousRecords
            ) =>
              previousRecords.filter(
                (
                  record
                ) =>
                  record.id !==
                  recordToDelete.id
              )
          );


          if (
            selectedAttendanceRecord?.id ===
            recordToDelete.id
          ) {

            closeRecordDetails();

          }


          setSuccessMessage(
            `Attendance record for ${
              displayValue(
                recordToDelete.staffName,
                "staff member"
              )
            } deleted successfully.`
          );


          setRecordToDelete(null);

          setShowDeleteConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting attendance record:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the attendance record. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDeleting(false);

        }

      }

    };


  // ============================================================
  // REFRESH HISTORY
  // ============================================================

  const refreshAttendanceHistory =
    async () => {

      await fetchAttendanceHistory(
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
              📜 Staff Attendance History
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Search, review and manage previous staff attendance records.
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

            <button
              type="button"
              onClick={
                refreshAttendanceHistory
              }
              disabled={
                isLoading ||
                isRefreshing ||
                isDeleting
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


            <Link
              to="/mark-staff-attendance"
              className="action-btn view-btn"
            >
              ➕ Mark Attendance
            </Link>

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
                  Loading Attendance History...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff attendance records are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            ATTENDANCE HISTORY CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  ATTENDANCE STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                {
                  [

                    [
                      "📋",
                      "Total Records",
                      attendanceStatistics.totalRecords,
                      "#475569"
                    ],

                    [
                      "✅",
                      "Present",
                      attendanceStatistics.presentRecords,
                      "#15803d"
                    ],

                    [
                      "❌",
                      "Absent",
                      attendanceStatistics.absentRecords,
                      "#b91c1c"
                    ],

                    [
                      "🏖",
                      "Leave",
                      attendanceStatistics.leaveRecords,
                      "#b45309"
                    ],

                    [
                      "🕐",
                      "Half Day",
                      attendanceStatistics.halfDayRecords,
                      "#6d28d9"
                    ],

                    [
                      "📊",
                      "Present Rate",
                      `${attendanceStatistics.attendancePercentage}%`,
                      "#2563eb"
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
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
                }}
              >

                {/* ================================================
                    FILTER HEADER
                ================================================ */}

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
                      🔍 Search Attendance History
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find attendance records by staff details, date, status and department.
                    </p>

                  </div>


                  {
                    hasActiveFilters && (

                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                        disabled={
                          isDeleting
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    )
                  }

                </div>


                {/* ================================================
                    SEARCH INPUT
                ================================================ */}

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <label>
                    Search Staff Attendance
                  </label>


                  <input
                    ref={
                      searchInputRef
                    }
                    type="text"
                    placeholder="Search name, Staff ID, mobile, position, department or remarks..."
                    value={
                      searchTerm
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setSearchTerm(
                          event.target.value
                        )
                    }
                    disabled={
                      isDeleting
                    }
                  />

                </div>


                {/* ================================================
                    DATE FILTERS
                ================================================ */}

                <div
                  className="form-grid"
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <div>

                    <label>
                      Start Date
                    </label>


                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setStartDate(
                            event.target.value
                          )
                      }
                      max={
                        endDate ||
                        undefined
                      }
                      disabled={
                        isDeleting
                      }
                    />

                  </div>


                  <div>

                    <label>
                      End Date
                    </label>


                    <input
                      type="date"
                      value={
                        endDate
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setEndDate(
                            event.target.value
                          )
                      }
                      min={
                        startDate ||
                        undefined
                      }
                      disabled={
                        isDeleting
                      }
                    />

                  </div>

                </div>


                {/* ================================================
                    OTHER FILTERS
                ================================================ */}

                <div className="form-grid">

                  {/* ==============================================
                      STATUS FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Attendance Status
                    </label>


                    <select
                      value={
                        statusFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setStatusFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    >

                      <option value="All">
                        All Statuses
                      </option>

                      <option value="Present">
                        Present
                      </option>

                      <option value="Absent">
                        Absent
                      </option>

                      <option value="Leave">
                        Leave
                      </option>

                      <option value="Half Day">
                        Half Day
                      </option>

                    </select>

                  </div>


                  {/* ==============================================
                      DEPARTMENT FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Department
                    </label>


                    <select
                      value={
                        departmentFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setDepartmentFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    >

                      <option value="All">
                        All Departments
                      </option>


                      {
                        departmentOptions.map(
                          (
                            department
                          ) => (

                            <option
                              key={
                                department
                              }
                              value={
                                department
                              }
                            >
                              {department}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  {/* ==============================================
                      POSITION FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Position
                    </label>


                    <select
                      value={
                        positionFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setPositionFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    >

                      <option value="All">
                        All Positions
                      </option>


                      {
                        positionOptions.map(
                          (
                            position
                          ) => (

                            <option
                              key={
                                position
                              }
                              value={
                                position
                              }
                            >
                              {position}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  {/* ==============================================
                      SORT OPTION
                  ============================================== */}

                  <div>

                    <label>
                      Sort Records
                    </label>


                    <select
                      value={
                        sortOption
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setSortOption(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    >

                      <option value="newest">
                        Newest First
                      </option>

                      <option value="oldest">
                        Oldest First
                      </option>

                      <option value="name-ascending">
                        Staff Name A → Z
                      </option>

                      <option value="name-descending">
                        Staff Name Z → A
                      </option>

                    </select>

                  </div>

                </div>


                {/* ================================================
                    FILTER RESULT SUMMARY
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    paddingTop: "18px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {
                        filteredAttendanceRecords.length
                      }
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {
                        attendanceRecords.length
                      }
                    </strong>
                    {" "}
                    attendance records
                  </p>


                  {
                    hasActiveFilters && (

                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        FILTERS ACTIVE
                      </span>

                    )
                  }

                </div>

              </div>


              {/* ==================================================
                  EMPTY DATABASE STATE
              ================================================== */}

              {
                attendanceRecords.length === 0 &&
                !errorMessage && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "52px",
                          marginBottom: "16px"
                        }}
                      >
                        📋
                      </div>


                      <h2>
                        No Attendance Records Available
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        Staff attendance history will appear after attendance records are saved.
                      </p>


                      <Link
                        to="/mark-staff-attendance"
                        className="action-btn view-btn"
                      >
                        ➕ Mark Staff Attendance
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS STATE
              ================================================== */}

              {
                attendanceRecords.length > 0 &&
                filteredAttendanceRecords.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "52px",
                          marginBottom: "16px"
                        }}
                      >
                        🔍
                      </div>


                      <h2>
                        No Matching Attendance Records
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        No attendance records match your current search and filters.
                      </p>


                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    </div>

                  </div>

                )
              }
                            {/* ==================================================
                  ATTENDANCE HISTORY RECORDS
              ================================================== */}

              {
                filteredAttendanceRecords.length > 0 && (

                  <div>

                    {/* ==============================================
                        RECORDS HEADER
                    ============================================== */}

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
                          📋 Attendance Records
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Review individual staff attendance records and details.
                        </p>

                      </div>


                      <span
                        style={{
                          padding: "7px 13px",
                          borderRadius: "999px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          filteredAttendanceRecords.length
                        }
                        {" "}
                        {
                          filteredAttendanceRecords.length === 1
                            ?
                            "RECORD"
                            :
                            "RECORDS"
                        }
                      </span>

                    </div>


                    {/* ==============================================
                        ATTENDANCE RECORD CARDS
                    ============================================== */}

                    {
                      filteredAttendanceRecords.map(
                        (
                          record
                        ) => {

                          const attendanceStatus =
                            displayValue(
                              record.status,
                              "Not Available"
                            );


                          return (

                            <div
                              className="student-card"
                              key={
                                record.id
                              }
                              style={{
                                marginBottom: "18px"
                              }}
                            >

                              {/* ====================================
                                  RECORD HEADER
                              ==================================== */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "16px",
                                  flexWrap: "wrap"
                                }}
                              >

                                {/* ==================================
                                    STAFF INFORMATION
                                ================================== */}

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    minWidth: 0,
                                    flex: 1
                                  }}
                                >

                                  <div
                                    className="student-avatar"
                                    style={{
                                      width: "68px",
                                      height: "68px",
                                      minWidth: "68px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "50%",
                                      background: "#f1f5f9",
                                      fontSize: "32px"
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
                                        margin: "0 0 7px",
                                        wordBreak: "break-word"
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
                                      🪪 Staff ID:
                                      {" "}
                                      <strong>
                                        {
                                          displayValue(
                                            record.staffId
                                          )
                                        }
                                      </strong>
                                    </p>


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
                                      {" • "}
                                      {
                                        displayValue(
                                          record.department
                                        )
                                      }
                                    </p>


                                    <p
                                      style={{
                                        margin: 0,
                                        color: "#64748b"
                                      }}
                                    >
                                      📞
                                      {" "}
                                      {
                                        displayValue(
                                          record.mobileNumber
                                        )
                                      }
                                    </p>

                                  </div>

                                </div>


                                {/* ==================================
                                    ATTENDANCE STATUS
                                ================================== */}

                                <span
                                  style={{
                                    padding: "7px 13px",
                                    borderRadius: "999px",
                                    background:
                                      getAttendanceStatusBackground(
                                        attendanceStatus
                                      ),
                                    color:
                                      getAttendanceStatusColor(
                                        attendanceStatus
                                      ),
                                    fontSize: "12px",
                                    fontWeight: "800"
                                  }}
                                >
                                  {
                                    getAttendanceStatusIcon(
                                      attendanceStatus
                                    )
                                  }
                                  {" "}
                                  {attendanceStatus}
                                </span>

                              </div>


                              {/* ====================================
                                  RECORD INFORMATION GRID
                              ==================================== */}

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(180px, 1fr))",
                                  gap: "14px",
                                  marginTop: "20px",
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
                                    📅 ATTENDANCE DATE
                                  </p>


                                  <strong>
                                    {
                                      formatAttendanceDate(
                                        record.attendanceDate
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
                                    🏢 DEPARTMENT
                                  </p>


                                  <strong>
                                    {
                                      displayValue(
                                        record.department
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
                                    💼 POSITION
                                  </p>


                                  <strong>
                                    {
                                      displayValue(
                                        record.position
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
                                    🕒 LAST UPDATED
                                  </p>


                                  <strong>
                                    {
                                      formatTimestamp(
                                        record.updatedAt
                                      )
                                    }
                                  </strong>

                                </div>

                              </div>


                              {/* ====================================
                                  REMARKS
                              ==================================== */}

                              {
                                record.remarks && (

                                  <div
                                    style={{
                                      marginTop: "16px",
                                      padding: "14px",
                                      borderRadius: "10px",
                                      background: "#f8fafc"
                                    }}
                                  >

                                    <p
                                      style={{
                                        margin: "0 0 5px",
                                        color: "#64748b",
                                        fontSize: "12px",
                                        fontWeight: "700"
                                      }}
                                    >
                                      📝 REMARKS
                                    </p>


                                    <p
                                      style={{
                                        margin: 0,
                                        lineHeight: "1.6",
                                        wordBreak: "break-word"
                                      }}
                                    >
                                      {record.remarks}
                                    </p>

                                  </div>

                                )
                              }


                              {/* ====================================
                                  RECORD ACTION BUTTONS
                              ==================================== */}

                              <div
                                className="student-actions"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                  marginTop: "18px",
                                  paddingTop: "18px",
                                  borderTop: "1px solid #e2e8f0"
                                }}
                              >

                                <button
                                  type="button"
                                  className="action-btn view-btn"
                                  onClick={
                                    () =>
                                      openRecordDetails(
                                        record
                                      )
                                  }
                                  disabled={
                                    isDeleting
                                  }
                                >
                                  👁 View Details
                                </button>


                                <Link
                                  to="/mark-staff-attendance"
                                  className="action-btn edit-btn"
                                >
                                  ✏ Update Attendance
                                </Link>


                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  onClick={
                                    () =>
                                      requestDeleteRecord(
                                        record
                                      )
                                  }
                                  disabled={
                                    isDeleting
                                  }
                                >
                                  🗑 Delete Record
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
                  SELECTED ATTENDANCE RECORD DETAILS
              ================================================== */}

              {
                showRecordDetails &&
                selectedAttendanceRecord && (

                  <div
                    id="attendance-record-details"
                    style={{
                      marginTop: "34px"
                    }}
                  >

                    {/* ==============================================
                        DETAILS HEADER
                    ============================================== */}

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
                          👁 Attendance Record Details
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete information about the selected attendance record.
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={
                          closeRecordDetails
                        }
                        disabled={
                          isDeleting
                        }
                      >
                        ✖ Close Details
                      </button>

                    </div>


                    {/* ==============================================
                        DETAILS CARD
                    ============================================== */}

                    <div className="section-card">

                      {/* ============================================
                          DETAILS TOP SECTION
                      ============================================ */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "18px",
                          flexWrap: "wrap",
                          paddingBottom: "22px",
                          borderBottom: "1px solid #e2e8f0"
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "16px",
                            minWidth: 0,
                            flex: 1
                          }}
                        >

                          <div
                            style={{
                              width: "88px",
                              height: "88px",
                              minWidth: "88px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              background: "#f1f5f9",
                              fontSize: "42px"
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
                              style={{
                                margin: "0 0 8px",
                                wordBreak: "break-word"
                              }}
                            >
                              {
                                displayValue(
                                  selectedAttendanceRecord.staffName,
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
                              🪪 Staff ID:
                              {" "}
                              <strong>
                                {
                                  displayValue(
                                    selectedAttendanceRecord.staffId
                                  )
                                }
                              </strong>
                            </p>


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
                                  selectedAttendanceRecord.position
                                )
                              }
                              {" • "}
                              {
                                displayValue(
                                  selectedAttendanceRecord.department
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
                                formatAttendanceDate(
                                  selectedAttendanceRecord.attendanceDate
                                )
                              }
                            </p>

                          </div>

                        </div>


                        <span
                          style={{
                            padding: "8px 14px",
                            borderRadius: "999px",
                            background:
                              getAttendanceStatusBackground(
                                selectedAttendanceRecord.status
                              ),
                            color:
                              getAttendanceStatusColor(
                                selectedAttendanceRecord.status
                              ),
                            fontSize: "12px",
                            fontWeight: "800"
                          }}
                        >
                          {
                            getAttendanceStatusIcon(
                              selectedAttendanceRecord.status
                            )
                          }
                          {" "}
                          {
                            displayValue(
                              selectedAttendanceRecord.status
                            )
                          }
                        </span>

                      </div>


                      {/* ============================================
                          ATTENDANCE INFORMATION
                      ============================================ */}

                      <div
                        style={{
                          marginTop: "24px"
                        }}
                      >

                        <h3>
                          📋 Attendance Information
                        </h3>


                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "16px"
                          }}
                        >

                          {
                            [

                              [
                                "Attendance Date",
                                formatAttendanceDate(
                                  selectedAttendanceRecord.attendanceDate
                                )
                              ],

                              [
                                "Attendance Status",
                                selectedAttendanceRecord.status
                              ],

                              [
                                "Created At",
                                formatTimestamp(
                                  selectedAttendanceRecord.createdAt
                                )
                              ],

                              [
                                "Last Updated",
                                formatTimestamp(
                                  selectedAttendanceRecord.updatedAt
                                )
                              ]

                            ].map(
                              (
                                [
                                  label,
                                  value
                                ]
                              ) => (

                                <div
                                  key={
                                    label
                                  }
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >

                                  <strong>
                                    {label}
                                  </strong>


                                  <p
                                    style={{
                                      margin: "6px 0 0",
                                      color: "#64748b",
                                      wordBreak: "break-word"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        value
                                      )
                                    }
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>


                      {/* ============================================
                          STAFF INFORMATION
                      ============================================ */}

                      <div
                        style={{
                          marginTop: "24px"
                        }}
                      >

                        <h3>
                          👤 Staff Information
                        </h3>


                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "16px"
                          }}
                        >

                          {
                            [

                              [
                                "Staff Name",
                                selectedAttendanceRecord.staffName
                              ],

                              [
                                "Staff ID",
                                selectedAttendanceRecord.staffId
                              ],

                              [
                                "Mobile Number",
                                selectedAttendanceRecord.mobileNumber
                              ],

                              [
                                "Position",
                                selectedAttendanceRecord.position
                              ],

                              [
                                "Department",
                                selectedAttendanceRecord.department
                              ],

                              [
                                "Employment Type",
                                selectedAttendanceRecord.employmentType
                              ]

                            ].map(
                              (
                                [
                                  label,
                                  value
                                ]
                              ) => (

                                <div
                                  key={
                                    label
                                  }
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >

                                  <strong>
                                    {label}
                                  </strong>


                                  <p
                                    style={{
                                      margin: "6px 0 0",
                                      color: "#64748b",
                                      wordBreak: "break-word"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        value
                                      )
                                    }
                                  </p>

                                </div>

                              )
                            )
                          }

                        </div>

                      </div>


                      {/* ============================================
                          ATTENDANCE REMARKS
                      ============================================ */}

                      <div
                        style={{
                          marginTop: "24px"
                        }}
                      >

                        <h3>
                          📝 Attendance Remarks
                        </h3>


                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: "1.7"
                          }}
                        >
                          {
                            displayValue(
                              selectedAttendanceRecord.remarks,
                              "No remarks were added for this attendance record."
                            )
                          }
                        </div>

                      </div>


                      {/* ============================================
                          DETAILS ACTION BUTTONS
                      ============================================ */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "26px",
                          paddingTop: "20px",
                          borderTop: "1px solid #e2e8f0"
                        }}
                      >

                        <Link
                          to="/mark-staff-attendance"
                          className="action-btn edit-btn"
                        >
                          ✏ Update Attendance
                        </Link>


                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={
                            () =>
                              requestDeleteRecord(
                                selectedAttendanceRecord
                              )
                          }
                          disabled={
                            isDeleting
                          }
                        >
                          🗑 Delete Record
                        </button>


                        <button
                          type="button"
                          onClick={
                            closeRecordDetails
                          }
                          disabled={
                            isDeleting
                          }
                        >
                          ✖ Close Details
                        </button>

                      </div>

                    </div>

                  </div>

                )
              }
                          </>

          )
        }


        {/* ======================================================
            DELETE ATTENDANCE CONFIRMATION POPUP
        ====================================================== */}

        {
          showDeleteConfirmation &&
          recordToDelete && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.65)"
              }}
            >

              <div
                className="section-card"
                style={{
                  width: "100%",
                  maxWidth: "560px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                {/* ================================================
                    DELETE CONFIRMATION HEADER
                ================================================ */}

                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "22px"
                  }}
                >

                  <div
                    style={{
                      fontSize: "54px",
                      marginBottom: "12px"
                    }}
                  >
                    🗑
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    Delete Attendance Record?
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the attendance record before permanently deleting it.
                  </p>

                </div>


                {/* ================================================
                    STAFF RECORD SUMMARY
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "14px",
                      flexWrap: "wrap"
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin: "0 0 7px"
                        }}
                      >
                        {
                          displayValue(
                            recordToDelete.staffName,
                            "Unnamed Staff"
                          )
                        }
                      </h3>


                      <p
                        style={{
                          margin: "0 0 5px",
                          color: "#64748b"
                        }}
                      >
                        🪪 Staff ID:
                        {" "}
                        {
                          displayValue(
                            recordToDelete.staffId
                          )
                        }
                      </p>


                      <p
                        style={{
                          margin: "0 0 5px",
                          color: "#64748b"
                        }}
                      >
                        💼
                        {" "}
                        {
                          displayValue(
                            recordToDelete.position
                          )
                        }
                        {" • "}
                        {
                          displayValue(
                            recordToDelete.department
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
                          formatAttendanceDate(
                            recordToDelete.attendanceDate
                          )
                        }
                      </p>

                    </div>


                    <span
                      style={{
                        padding: "7px 13px",
                        borderRadius: "999px",
                        background:
                          getAttendanceStatusBackground(
                            recordToDelete.status
                          ),
                        color:
                          getAttendanceStatusColor(
                            recordToDelete.status
                          ),
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                    >
                      {
                        getAttendanceStatusIcon(
                          recordToDelete.status
                        )
                      }
                      {" "}
                      {
                        displayValue(
                          recordToDelete.status
                        )
                      }
                    </span>

                  </div>

                </div>


                {/* ================================================
                    RECORD INFORMATION
                ================================================ */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginBottom: "18px"
                  }}
                >

                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#f8fafc"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      ATTENDANCE DATE
                    </p>


                    <strong>
                      {
                        formatAttendanceDate(
                          recordToDelete.attendanceDate
                        )
                      }
                    </strong>

                  </div>


                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#f8fafc"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      ATTENDANCE STATUS
                    </p>


                    <strong>
                      {
                        displayValue(
                          recordToDelete.status
                        )
                      }
                    </strong>

                  </div>

                </div>


                {/* ================================================
                    REMARKS PREVIEW
                ================================================ */}

                {
                  recordToDelete.remarks && (

                    <div
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <p
                        style={{
                          margin: "0 0 6px",
                          color: "#64748b",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}
                      >
                        📝 REMARKS
                      </p>


                      <p
                        style={{
                          margin: 0,
                          lineHeight: "1.6",
                          wordBreak: "break-word"
                        }}
                      >
                        {
                          recordToDelete.remarks
                        }
                      </p>

                    </div>

                  )
                }


                {/* ================================================
                    PERMANENT DELETE WARNING
                ================================================ */}

                <div
                  style={{
                    padding: "14px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    lineHeight: "1.6"
                  }}
                >
                  ⚠️
                  {" "}
                  <strong>
                    This action cannot be undone.
                  </strong>
                  {" "}
                  The attendance record will be permanently removed from the database.
                </div>


                {/* ================================================
                    DELETE CONFIRMATION ACTIONS
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      cancelDeleteRecord
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={
                      confirmDeleteRecord
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      minWidth: "190px"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting Record..."
                        :
                        "🗑 Permanently Delete"
                    }
                  </button>

                </div>

              </div>

            </div>

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

export default StaffAttendanceHistory;