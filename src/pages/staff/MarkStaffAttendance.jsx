import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch
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

function MarkStaffAttendance() {
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
  // STAFF DATA STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  const [
    existingAttendanceRecords,
    setExistingAttendanceRecords
  ] = useState([]);


  // ============================================================
  // ATTENDANCE FORM STATES
  // ============================================================

  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    () => {

      const today =
        new Date();


      const year =
        today.getFullYear();


      const month =
        String(
          today.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          today.getDate()
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}-${day}`;

    }
  );


  const [
    attendanceData,
    setAttendanceData
  ] = useState({});


  const [
    remarksData,
    setRemarksData
  ] = useState({});


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    departmentFilter,
    setDepartmentFilter
  ] = useState("All");


  const [
    positionFilter,
    setPositionFilter
  ] = useState("All");


  const [
    attendanceFilter,
    setAttendanceFilter
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
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // CONFIRMATION STATES
  // ============================================================

  const [
    showSaveConfirmation,
    setShowSaveConfirmation
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
  // LOAD STAFF AND ATTENDANCE RECORDS
  // ============================================================

  const fetchAttendanceData =
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
              )
              .sort(
                (
                  firstStaff,
                  secondStaff
                ) =>
                  normalizeSearchValue(
                    firstStaff.staffName
                  ).localeCompare(
                    normalizeSearchValue(
                      secondStaff.staffName
                    )
                  )
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


            setExistingAttendanceRecords(
              attendanceList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff attendance data:",
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
  // LOAD DATA WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchAttendanceData();

    },
    [
      fetchAttendanceData
    ]
  );


  // ============================================================
  // ATTENDANCE RECORDS FOR SELECTED DATE
  // ============================================================

  const selectedDateAttendanceRecords =
    useMemo(
      () => {

        return existingAttendanceRecords.filter(
          (
            record
          ) =>
            record.attendanceDate ===
            selectedDate
        );

      },
      [
        existingAttendanceRecords,
        selectedDate
      ]
    );


  // ============================================================
  // LOAD EXISTING ATTENDANCE INTO FORM
  // ============================================================

  useEffect(
    () => {

      const newAttendanceData = {};


      const newRemarksData = {};


      selectedDateAttendanceRecords.forEach(
        (
          record
        ) => {

          if (
            record.staffDocumentId
          ) {

            newAttendanceData[
              record.staffDocumentId
            ] =
              record.status ||
              "";


            newRemarksData[
              record.staffDocumentId
            ] =
              record.remarks ||
              "";

          }

        }
      );


      setAttendanceData(
        newAttendanceData
      );


      setRemarksData(
        newRemarksData
      );


      setSuccessMessage(
        ""
      );


      setShowSaveConfirmation(
        false
      );

    },
    [
      selectedDateAttendanceRecords
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
            staff
              .map(
                (
                  member
                ) =>
                  member.department
              )
              .filter(
                Boolean
              )
          )
        ).sort();

      },
      [
        staff
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
            staff
              .map(
                (
                  member
                ) =>
                  member.position
              )
              .filter(
                Boolean
              )
          )
        ).sort();

      },
      [
        staff
      ]
    );


  // ============================================================
  // FILTER STAFF
  // ============================================================

  const filteredStaff =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        return staff.filter(
          (
            member
          ) => {

            const matchesSearch =
              !normalizedSearchTerm ||
              [

                member.staffName,

                member.staffId,

                member.mobileNumber,

                member.position,

                member.department

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


            const matchesDepartment =
              departmentFilter ===
                "All" ||
              member.department ===
                departmentFilter;


            const matchesPosition =
              positionFilter ===
                "All" ||
              member.position ===
                positionFilter;


            const memberAttendanceStatus =
              attendanceData[
                member.id
              ] ||
              "Not Marked";


            const matchesAttendance =
              attendanceFilter ===
                "All" ||
              memberAttendanceStatus ===
                attendanceFilter;


            return (

              matchesSearch &&

              matchesDepartment &&

              matchesPosition &&

              matchesAttendance

            );

          }
        );

      },
      [
        staff,
        searchTerm,
        departmentFilter,
        positionFilter,
        attendanceFilter,
        attendanceData
      ]
    );


  // ============================================================
  // ATTENDANCE STATISTICS
  // ============================================================

  const attendanceStatistics =
    useMemo(
      () => {

        const totalStaff =
          staff.length;


        const presentStaff =
          staff.filter(
            (
              member
            ) =>
              attendanceData[
                member.id
              ] ===
              "Present"
          ).length;


        const absentStaff =
          staff.filter(
            (
              member
            ) =>
              attendanceData[
                member.id
              ] ===
              "Absent"
          ).length;


        const leaveStaff =
          staff.filter(
            (
              member
            ) =>
              attendanceData[
                member.id
              ] ===
              "Leave"
          ).length;


        const halfDayStaff =
          staff.filter(
            (
              member
            ) =>
              attendanceData[
                member.id
              ] ===
              "Half Day"
          ).length;


        const markedStaff =
          presentStaff +
          absentStaff +
          leaveStaff +
          halfDayStaff;


        const pendingStaff =
          Math.max(
            totalStaff -
            markedStaff,
            0
          );


        return {

          totalStaff,

          presentStaff,

          absentStaff,

          leaveStaff,

          halfDayStaff,

          markedStaff,

          pendingStaff

        };

      },
      [
        staff,
        attendanceData
      ]
    );


  // ============================================================
  // CHANGE SINGLE STAFF ATTENDANCE
  // ============================================================

  const changeStaffAttendance =
    (
      staffDocumentId,
      status
    ) => {

      setAttendanceData(
        (
          previousAttendanceData
        ) => ({

          ...previousAttendanceData,

          [
            staffDocumentId
          ]:
            status

        })
      );


      setSuccessMessage(
        ""
      );

    };


  // ============================================================
  // CHANGE STAFF REMARKS
  // ============================================================

  const changeStaffRemarks =
    (
      staffDocumentId,
      remarks
    ) => {

      setRemarksData(
        (
          previousRemarksData
        ) => ({

          ...previousRemarksData,

          [
            staffDocumentId
          ]:
            remarks

        })
      );

    };


  // ============================================================
  // MARK ALL FILTERED STAFF
  // ============================================================

  const markAllFilteredStaff =
    (
      status
    ) => {

      setAttendanceData(
        (
          previousAttendanceData
        ) => {

          const updatedAttendanceData = {

            ...previousAttendanceData

          };


          filteredStaff.forEach(
            (
              member
            ) => {

              updatedAttendanceData[
                member.id
              ] =
                status;

            }
          );


          return updatedAttendanceData;

        }
      );


      setSuccessMessage(
        ""
      );

    };


  // ============================================================
  // CLEAR ALL FILTERED ATTENDANCE
  // ============================================================

  const clearFilteredAttendance =
    () => {

      setAttendanceData(
        (
          previousAttendanceData
        ) => {

          const updatedAttendanceData = {

            ...previousAttendanceData

          };


          filteredStaff.forEach(
            (
              member
            ) => {

              delete updatedAttendanceData[
                member.id
              ];

            }
          );


          return updatedAttendanceData;

        }
      );


      setSuccessMessage(
        ""
      );

    };


  // ============================================================
  // REFRESH ATTENDANCE PAGE
  // ============================================================

  const refreshAttendancePage =
    async () => {

      await fetchAttendanceData(
        true
      );

    };
      // ============================================================
  // RESET SEARCH FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setDepartmentFilter("All");

      setPositionFilter("All");

      setAttendanceFilter("All");

      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // CHECK WHETHER SEARCH FILTERS ARE ACTIVE
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !== "" ||

          departmentFilter !== "All" ||

          positionFilter !== "All" ||

          attendanceFilter !== "All"

        );

      },
      [
        searchTerm,
        departmentFilter,
        positionFilter,
        attendanceFilter
      ]
    );


  // ============================================================
  // GET EXISTING ATTENDANCE RECORD
  // ============================================================

  const getExistingAttendanceRecord =
    (
      staffDocumentId
    ) => {

      return selectedDateAttendanceRecords.find(
        (
          record
        ) =>
          record.staffDocumentId ===
          staffDocumentId
      );

    };


  // ============================================================
  // CHECK IF ATTENDANCE CAN BE SAVED
  // ============================================================

  const validateAttendanceBeforeSave =
    () => {

      if (
        !selectedDate
      ) {

        setErrorMessage(
          "Please select an attendance date."
        );

        return false;

      }


      if (
        staff.length === 0
      ) {

        setErrorMessage(
          "There are no active staff members available for attendance."
        );

        return false;

      }


      if (
        attendanceStatistics.markedStaff === 0
      ) {

        setErrorMessage(
          "Please mark attendance for at least one staff member before saving."
        );

        return false;

      }


      setErrorMessage("");

      return true;

    };


  // ============================================================
  // REQUEST SAVE ATTENDANCE
  // ============================================================

  const requestSaveAttendance =
    () => {

      const isAttendanceValid =
        validateAttendanceBeforeSave();


      if (
        !isAttendanceValid
      ) {

        return;

      }


      setShowSaveConfirmation(true);

    };


  // ============================================================
  // CANCEL SAVE ATTENDANCE
  // ============================================================

  const cancelSaveAttendance =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setShowSaveConfirmation(false);

    };


  // ============================================================
  // CREATE SAFE ATTENDANCE DOCUMENT ID
  // ============================================================

  const createAttendanceDocumentId =
    (
      staffDocumentId,
      attendanceDate
    ) => {

      const safeStaffDocumentId =
        String(
          staffDocumentId
        )
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );


      const safeAttendanceDate =
        String(
          attendanceDate
        )
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );


      return `${safeStaffDocumentId}_${safeAttendanceDate}`;

    };


  // ============================================================
  // SAVE ATTENDANCE TO FIRESTORE
  // ============================================================

  const confirmSaveAttendance =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const isAttendanceValid =
        validateAttendanceBeforeSave();


      if (
        !isAttendanceValid
      ) {

        setShowSaveConfirmation(false);

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const batch =
          writeBatch(db);


        let savedRecordCount =
          0;


        staff.forEach(
          (
            member
          ) => {

            const attendanceStatus =
              attendanceData[
                member.id
              ];


            if (
              !attendanceStatus
            ) {

              return;

            }


            const attendanceDocumentId =
              createAttendanceDocumentId(
                member.id,
                selectedDate
              );


            const attendanceDocumentReference =
              doc(
                db,
                "staffAttendance",
                attendanceDocumentId
              );


            const existingRecord =
              getExistingAttendanceRecord(
                member.id
              );


            const attendanceRecord = {

              madrasaId,

              staffDocumentId:
                member.id,

              staffId:
                member.staffId ||
                "",

              staffName:
                member.staffName ||
                "",

              mobileNumber:
                member.mobileNumber ||
                "",

              position:
                member.position ||
                "",

              department:
                member.department ||
                "",

              employmentType:
                member.employmentType ||
                "",

              attendanceDate:
                selectedDate,

              status:
                attendanceStatus,

              remarks:
                remarksData[
                  member.id
                ] ||
                "",

              updatedAt:
                serverTimestamp()

            };


            if (
              existingRecord?.createdAt
            ) {

              attendanceRecord.createdAt =
                existingRecord.createdAt;

            }
            else {

              attendanceRecord.createdAt =
                serverTimestamp();

            }


            batch.set(
              attendanceDocumentReference,
              attendanceRecord,
              {
                merge: true
              }
            );


            savedRecordCount += 1;

          }
        );


        if (
          savedRecordCount === 0
        ) {

          throw new Error(
            "No attendance records are available to save."
          );

        }


        await batch.commit();


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            `${savedRecordCount} attendance ${
              savedRecordCount === 1
                ?
                "record"
                :
                "records"
            } saved successfully.`
          );


          setShowSaveConfirmation(false);

        }


        await fetchAttendanceData(
          true
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error saving staff attendance:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save staff attendance. Please check your connection and try again."
          );


          setShowSaveConfirmation(false);

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
  // FORMAT SELECTED DATE
  // ============================================================

  const formattedSelectedDate =
    useMemo(
      () => {

        if (
          !selectedDate
        ) {

          return "No Date Selected";

        }


        const [
          year,
          month,
          day
        ] =
          selectedDate
            .split("-")
            .map(Number);


        const date =
          new Date(
            year,
            month - 1,
            day
          );


        return date.toLocaleDateString(
          "en-IN",
          {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
          }
        );

      },
      [
        selectedDate
      ]
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
              ➕ Mark Staff Attendance
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Mark and manage daily attendance for active staff members.
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
                refreshAttendancePage
              }
              disabled={
                isLoading ||
                isRefreshing ||
                isSaving
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
              to="/staff-attendance-history"
              className="action-btn view-btn"
            >
              📜 Attendance History
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
                  Loading Staff Attendance...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while active staff records are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            ATTENDANCE PAGE CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  ATTENDANCE DATE SECTION
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
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "18px",
                    flexWrap: "wrap"
                  }}
                >

                  <div
                    style={{
                      flex: 1,
                      minWidth: "240px"
                    }}
                  >

                    <label>
                      Attendance Date
                    </label>


                    <input
                      type="date"
                      value={
                        selectedDate
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setSelectedDate(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>


                  <div
                    style={{
                      flex: 2,
                      minWidth: "260px"
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
                      SELECTED ATTENDANCE DATE
                    </p>


                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      📅 {formattedSelectedDate}
                    </h2>

                  </div>


                  <span
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      background:
                        attendanceStatistics.pendingStaff === 0 &&
                        attendanceStatistics.totalStaff > 0
                          ?
                          "#dcfce7"
                          :
                          "#fef3c7",
                      color:
                        attendanceStatistics.pendingStaff === 0 &&
                        attendanceStatistics.totalStaff > 0
                          ?
                          "#15803d"
                          :
                          "#b45309",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      attendanceStatistics.totalStaff === 0
                        ?
                        "NO ACTIVE STAFF"
                        :
                        attendanceStatistics.pendingStaff === 0
                          ?
                          "ALL ATTENDANCE MARKED"
                          :
                          `${attendanceStatistics.pendingStaff} PENDING`
                    }
                  </span>

                </div>

              </div>


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
                      "👥",
                      "Total Staff",
                      attendanceStatistics.totalStaff,
                      "#475569"
                    ],

                    [
                      "✅",
                      "Present",
                      attendanceStatistics.presentStaff,
                      "#15803d"
                    ],

                    [
                      "❌",
                      "Absent",
                      attendanceStatistics.absentStaff,
                      "#b91c1c"
                    ],

                    [
                      "🏖",
                      "Leave",
                      attendanceStatistics.leaveStaff,
                      "#b45309"
                    ],

                    [
                      "🕐",
                      "Half Day",
                      attendanceStatistics.halfDayStaff,
                      "#6d28d9"
                    ],

                    [
                      "⚪",
                      "Pending",
                      attendanceStatistics.pendingStaff,
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
                      🔍 Find Staff
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search and filter staff before marking attendance.
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
                          isSaving
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    )
                  }

                </div>


                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <label>
                    Search Staff
                  </label>


                  <input
                    ref={
                      searchInputRef
                    }
                    type="text"
                    placeholder="Search name, Staff ID, mobile, position or department..."
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
                      isSaving
                    }
                  />

                </div>


                <div className="form-grid">

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
                        isSaving
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
                        isSaving
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


                  <div>

                    <label>
                      Attendance Status
                    </label>


                    <select
                      value={
                        attendanceFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setAttendanceFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="All">
                        All Attendance
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

                      <option value="Not Marked">
                        Not Marked
                      </option>

                    </select>

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  BULK ATTENDANCE CONTROLS
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
                    marginBottom: "18px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 5px"
                      }}
                    >
                      ⚡ Quick Attendance Actions
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Apply an attendance status to all currently visible staff members.
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background: "#f1f5f9",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      filteredStaff.length
                    }
                    {" "}
                    {
                      filteredStaff.length === 1
                        ?
                        "VISIBLE STAFF"
                        :
                        "VISIBLE STAFF"
                    }
                  </span>

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
                      () =>
                        markAllFilteredStaff(
                          "Present"
                        )
                    }
                    disabled={
                      isSaving ||
                      filteredStaff.length === 0
                    }
                    style={{
                      background: "#15803d",
                      color: "#ffffff"
                    }}
                  >
                    ✅ Mark All Present
                  </button>


                  <button
                    type="button"
                    onClick={
                      () =>
                        markAllFilteredStaff(
                          "Absent"
                        )
                    }
                    disabled={
                      isSaving ||
                      filteredStaff.length === 0
                    }
                    style={{
                      background: "#b91c1c",
                      color: "#ffffff"
                    }}
                  >
                    ❌ Mark All Absent
                  </button>


                  <button
                    type="button"
                    onClick={
                      () =>
                        markAllFilteredStaff(
                          "Leave"
                        )
                    }
                    disabled={
                      isSaving ||
                      filteredStaff.length === 0
                    }
                    style={{
                      background: "#b45309",
                      color: "#ffffff"
                    }}
                  >
                    🏖 Mark All Leave
                  </button>


                  <button
                    type="button"
                    onClick={
                      () =>
                        markAllFilteredStaff(
                          "Half Day"
                        )
                    }
                    disabled={
                      isSaving ||
                      filteredStaff.length === 0
                    }
                    style={{
                      background: "#6d28d9",
                      color: "#ffffff"
                    }}
                  >
                    🕐 Mark All Half Day
                  </button>


                  <button
                    type="button"
                    onClick={
                      clearFilteredAttendance
                    }
                    disabled={
                      isSaving ||
                      filteredStaff.length === 0
                    }
                  >
                    🧹 Clear Visible Attendance
                  </button>

                </div>


                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: "1.6"
                  }}
                >
                  Note: Quick actions affect only the staff members currently shown by your search and filters.
                </p>

              </div>


              {/* ==================================================
                  ATTENDANCE COMPLETION PROGRESS
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
                      📊 Attendance Completion
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      {
                        attendanceStatistics.markedStaff
                      }
                      {" "}
                      of
                      {" "}
                      {
                        attendanceStatistics.totalStaff
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
                      attendanceStatistics.totalStaff > 0
                        ?
                        Math.round(
                          (
                            attendanceStatistics.markedStaff /
                            attendanceStatistics.totalStaff
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
                          attendanceStatistics.totalStaff > 0
                            ?
                            Math.min(
                              Math.round(
                                (
                                  attendanceStatistics.markedStaff /
                                  attendanceStatistics.totalStaff
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
                  NO ACTIVE STAFF STATE
              ================================================== */}

              {
                staff.length === 0 && (

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
                        👳
                      </div>


                      <h2>
                        No Active Staff Available
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
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
                  NO FILTER RESULTS STATE
              ================================================== */}

              {
                staff.length > 0 &&
                filteredStaff.length === 0 && (

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
                        No Matching Staff Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        No staff members match your current search and attendance filters.
                      </p>


                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                        disabled={
                          isSaving
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  STAFF ATTENDANCE REGISTER
              ================================================== */}

              {
                filteredStaff.length > 0 && (

                  <div>

                    {/* ==============================================
                        ATTENDANCE REGISTER HEADER
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
                          📋 Staff Attendance Register
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Select an attendance status and optionally enter remarks for each staff member.
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
                          filteredStaff.length
                        }
                        {" "}
                        {
                          filteredStaff.length === 1
                            ?
                            "STAFF RECORD"
                            :
                            "STAFF RECORDS"
                        }
                      </span>

                    </div>


                    {/* ==============================================
                        STAFF ATTENDANCE CARDS
                    ============================================== */}

                    {
                      filteredStaff.map(
                        (
                          member
                        ) => {

                          const currentAttendanceStatus =
                            attendanceData[
                              member.id
                            ] ||
                            "";


                          const existingRecord =
                            getExistingAttendanceRecord(
                              member.id
                            );


                          return (

                            <div
                              className="student-card"
                              key={
                                member.id
                              }
                              style={{
                                marginBottom: "18px"
                              }}
                            >

                              {/* ====================================
                                  STAFF INFORMATION HEADER
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

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    minWidth: 0,
                                    flex: 1
                                  }}
                                >

                                  {/* ==================================
                                      STAFF AVATAR
                                  ================================== */}

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
                                    {
                                      member.gender === "Female"
                                        ?
                                        "👩"
                                        :
                                        "👳"
                                    }
                                  </div>


                                  {/* ==================================
                                      STAFF BASIC INFORMATION
                                  ================================== */}

                                  <div
                                    style={{
                                      minWidth: 0,
                                      flex: 1
                                    }}
                                  >

                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                        marginBottom: "7px"
                                      }}
                                    >

                                      <h2
                                        className="student-name"
                                        style={{
                                          margin: 0,
                                          wordBreak: "break-word"
                                        }}
                                      >
                                        {
                                          displayValue(
                                            member.staffName,
                                            "Unnamed Staff"
                                          )
                                        }
                                      </h2>


                                      {
                                        existingRecord && (

                                          <span
                                            style={{
                                              padding: "5px 10px",
                                              borderRadius: "999px",
                                              background: "#dbeafe",
                                              color: "#1d4ed8",
                                              fontSize: "11px",
                                              fontWeight: "800"
                                            }}
                                          >
                                            SAVED EARLIER
                                          </span>

                                        )
                                      }

                                    </div>


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
                                            member.staffId
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
                                          member.position
                                        )
                                      }
                                      {" • "}
                                      {
                                        displayValue(
                                          member.department
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
                                          member.mobileNumber
                                        )
                                      }
                                    </p>

                                  </div>

                                </div>


                                {/* ==================================
                                    CURRENT STATUS BADGE
                                ================================== */}

                                <span
                                  style={{
                                    padding: "7px 13px",
                                    borderRadius: "999px",
                                    background:
                                      getAttendanceStatusBackground(
                                        currentAttendanceStatus
                                      ),
                                    color:
                                      getAttendanceStatusColor(
                                        currentAttendanceStatus
                                      ),
                                    fontSize: "12px",
                                    fontWeight: "800"
                                  }}
                                >
                                  {
                                    getAttendanceStatusIcon(
                                      currentAttendanceStatus
                                    )
                                  }
                                  {" "}
                                  {
                                    currentAttendanceStatus ||
                                    "Not Marked"
                                  }
                                </span>

                              </div>


                              {/* ====================================
                                  ATTENDANCE STATUS BUTTONS
                              ==================================== */}

                              <div
                                style={{
                                  marginTop: "20px",
                                  paddingTop: "18px",
                                  borderTop: "1px solid #e2e8f0"
                                }}
                              >

                                <p
                                  style={{
                                    margin: "0 0 12px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    color: "#475569"
                                  }}
                                >
                                  Select Attendance Status
                                </p>


                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap"
                                  }}
                                >

                                  {
                                    [

                                      [
                                        "Present",
                                        "✅",
                                        "#15803d"
                                      ],

                                      [
                                        "Absent",
                                        "❌",
                                        "#b91c1c"
                                      ],

                                      [
                                        "Leave",
                                        "🏖",
                                        "#b45309"
                                      ],

                                      [
                                        "Half Day",
                                        "🕐",
                                        "#6d28d9"
                                      ]

                                    ].map(
                                      (
                                        [
                                          status,
                                          icon,
                                          statusColor
                                        ]
                                      ) => {

                                        const isSelected =
                                          currentAttendanceStatus ===
                                          status;


                                        return (

                                          <button
                                            type="button"
                                            key={
                                              status
                                            }
                                            onClick={
                                              () =>
                                                changeStaffAttendance(
                                                  member.id,
                                                  status
                                                )
                                            }
                                            disabled={
                                              isSaving
                                            }
                                            style={{
                                              background:
                                                isSelected
                                                  ?
                                                  statusColor
                                                  :
                                                  "#ffffff",
                                              color:
                                                isSelected
                                                  ?
                                                  "#ffffff"
                                                  :
                                                  statusColor,
                                              border:
                                                `1px solid ${statusColor}`,
                                              fontWeight: "700"
                                            }}
                                          >
                                            {icon} {status}
                                          </button>

                                        );

                                      }
                                    )
                                  }

                                </div>

                              </div>


                              {/* ====================================
                                  STAFF ATTENDANCE REMARKS
                              ==================================== */}

                              <div
                                style={{
                                  marginTop: "18px"
                                }}
                              >

                                <label>
                                  Remarks
                                  {" "}
                                  <span
                                    style={{
                                      color: "#94a3b8",
                                      fontWeight: "400"
                                    }}
                                  >
                                    (Optional)
                                  </span>
                                </label>


                                <input
                                  type="text"
                                  placeholder="Enter attendance remarks..."
                                  value={
                                    remarksData[
                                      member.id
                                    ] ||
                                    ""
                                  }
                                  onChange={
                                    (
                                      event
                                    ) =>
                                      changeStaffRemarks(
                                        member.id,
                                        event.target.value
                                      )
                                  }
                                  disabled={
                                    isSaving
                                  }
                                />

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
                  SAVE ATTENDANCE SECTION
              ================================================== */}

              {
                staff.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      marginTop: "26px"
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

                        <h2
                          style={{
                            margin: "0 0 6px"
                          }}
                        >
                          💾 Save Staff Attendance
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            lineHeight: "1.6"
                          }}
                        >
                          Review the attendance summary before saving records for
                          {" "}
                          <strong>
                            {formattedSelectedDate}
                          </strong>.
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={
                          requestSaveAttendance
                        }
                        disabled={
                          isSaving ||
                          attendanceStatistics.markedStaff === 0
                        }
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          minWidth: "190px"
                        }}
                      >
                        {
                          isSaving
                            ?
                            "⏳ Saving Attendance..."
                            :
                            "💾 Save Attendance"
                        }
                      </button>

                    </div>


                    {/* ==============================================
                        SAVE SUMMARY
                    ============================================== */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "12px",
                        marginTop: "20px",
                        paddingTop: "20px",
                        borderTop: "1px solid #e2e8f0"
                      }}
                    >

                      {
                        [

                          [
                            "Marked",
                            attendanceStatistics.markedStaff,
                            "#2563eb"
                          ],

                          [
                            "Present",
                            attendanceStatistics.presentStaff,
                            "#15803d"
                          ],

                          [
                            "Absent",
                            attendanceStatistics.absentStaff,
                            "#b91c1c"
                          ],

                          [
                            "Leave",
                            attendanceStatistics.leaveStaff,
                            "#b45309"
                          ],

                          [
                            "Half Day",
                            attendanceStatistics.halfDayStaff,
                            "#6d28d9"
                          ],

                          [
                            "Pending",
                            attendanceStatistics.pendingStaff,
                            "#475569"
                          ]

                        ].map(
                          (
                            [
                              label,
                              value,
                              textColor
                            ]
                          ) => (

                            <div
                              key={
                                label
                              }
                              style={{
                                padding: "12px",
                                borderRadius: "10px",
                                background: "#f8fafc",
                                textAlign: "center"
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
                                {
                                  label.toUpperCase()
                                }
                              </p>


                              <strong
                                style={{
                                  color: textColor,
                                  fontSize: "22px"
                                }}
                              >
                                {value}
                              </strong>

                            </div>

                          )
                        )
                      }

                    </div>


                    {/* ==============================================
                        PENDING ATTENDANCE WARNING
                    ============================================== */}

                    {
                      attendanceStatistics.pendingStaff > 0 && (

                        <div
                          style={{
                            marginTop: "18px",
                            padding: "14px",
                            borderRadius: "10px",
                            background: "#fffbeb",
                            border: "1px solid #fde68a",
                            color: "#92400e",
                            lineHeight: "1.6"
                          }}
                        >
                          ⚠️
                          {" "}
                          <strong>
                            {
                              attendanceStatistics.pendingStaff
                            }
                          </strong>
                          {" "}
                          {
                            attendanceStatistics.pendingStaff === 1
                              ?
                              "staff member has"
                              :
                              "staff members have"
                          }
                          {" "}
                          not been marked. You can still save the completed attendance records.
                        </div>

                      )
                    }


                    {/* ==============================================
                        EXISTING RECORD INFORMATION
                    ============================================== */}

                    {
                      selectedDateAttendanceRecords.length > 0 && (

                        <div
                          style={{
                            marginTop: "14px",
                            padding: "14px",
                            borderRadius: "10px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#1e40af",
                            lineHeight: "1.6"
                          }}
                        >
                          ℹ️ Attendance was previously saved for
                          {" "}
                          <strong>
                            {
                              selectedDateAttendanceRecords.length
                            }
                          </strong>
                          {" "}
                          {
                            selectedDateAttendanceRecords.length === 1
                              ?
                              "staff member"
                              :
                              "staff members"
                          }
                          {" "}
                          on this date. Saving again will update those attendance records instead of creating duplicates.
                        </div>

                      )
                    }

                  </div>

                )
              }

            </>

          )
        }


        {/* ======================================================
            SAVE ATTENDANCE CONFIRMATION POPUP
        ====================================================== */}

        {
          showSaveConfirmation && (

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
                  maxWidth: "620px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                {/* ================================================
                    CONFIRMATION HEADER
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
                    📋
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    Confirm Staff Attendance
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the attendance summary before saving the records.
                  </p>

                </div>


                {/* ================================================
                    SELECTED DATE
                ================================================ */}

                <div
                  style={{
                    padding: "14px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    textAlign: "center"
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
                    ATTENDANCE DATE
                  </p>


                  <strong
                    style={{
                      fontSize: "18px"
                    }}
                  >
                    📅 {formattedSelectedDate}
                  </strong>

                </div>


                {/* ================================================
                    CONFIRMATION STATISTICS
                ================================================ */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "12px",
                    marginBottom: "18px"
                  }}
                >

                  {
                    [

                      [
                        "Marked",
                        attendanceStatistics.markedStaff,
                        "#2563eb"
                      ],

                      [
                        "Present",
                        attendanceStatistics.presentStaff,
                        "#15803d"
                      ],

                      [
                        "Absent",
                        attendanceStatistics.absentStaff,
                        "#b91c1c"
                      ],

                      [
                        "Leave",
                        attendanceStatistics.leaveStaff,
                        "#b45309"
                      ],

                      [
                        "Half Day",
                        attendanceStatistics.halfDayStaff,
                        "#6d28d9"
                      ],

                      [
                        "Pending",
                        attendanceStatistics.pendingStaff,
                        "#475569"
                      ]

                    ].map(
                      (
                        [
                          label,
                          value,
                          textColor
                        ]
                      ) => (

                        <div
                          key={
                            label
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            textAlign: "center"
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
                            {
                              label.toUpperCase()
                            }
                          </p>


                          <strong
                            style={{
                              color: textColor,
                              fontSize: "22px"
                            }}
                          >
                            {value}
                          </strong>

                        </div>

                      )
                    )
                  }

                </div>


                {/* ================================================
                    ATTENDANCE RECORD PREVIEW
                ================================================ */}

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 12px"
                    }}
                  >
                    👥 Attendance Records
                  </h3>


                  <div
                    style={{
                      maxHeight: "250px",
                      overflowY: "auto"
                    }}
                  >

                    {
                      staff
                        .filter(
                          (
                            member
                          ) =>
                            Boolean(
                              attendanceData[
                                member.id
                              ]
                            )
                        )
                        .map(
                          (
                            member
                          ) => {

                            const attendanceStatus =
                              attendanceData[
                                member.id
                              ];


                            return (

                              <div
                                key={
                                  member.id
                                }
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                  flexWrap: "wrap",
                                  padding: "12px",
                                  marginBottom: "8px",
                                  borderRadius: "10px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0"
                                }}
                              >

                                <div>

                                  <strong>
                                    {
                                      displayValue(
                                        member.staffName,
                                        "Unnamed Staff"
                                      )
                                    }
                                  </strong>


                                  <p
                                    style={{
                                      margin: "4px 0 0",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        member.staffId
                                      )
                                    }
                                    {" • "}
                                    {
                                      displayValue(
                                        member.position
                                      )
                                    }
                                  </p>

                                </div>


                                <span
                                  style={{
                                    padding: "6px 11px",
                                    borderRadius: "999px",
                                    background:
                                      getAttendanceStatusBackground(
                                        attendanceStatus
                                      ),
                                    color:
                                      getAttendanceStatusColor(
                                        attendanceStatus
                                      ),
                                    fontSize: "11px",
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

                            );

                          }
                        )
                    }

                  </div>

                </div>


                {/* ================================================
                    SAVE INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1e40af",
                    lineHeight: "1.6"
                  }}
                >
                  ℹ️ Saving attendance again for the same staff member and date will update the existing record instead of creating a duplicate attendance record.
                </div>


                {/* ================================================
                    PENDING WARNING
                ================================================ */}

                {
                  attendanceStatistics.pendingStaff > 0 && (

                    <div
                      style={{
                        padding: "14px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        color: "#92400e",
                        lineHeight: "1.6"
                      }}
                    >
                      ⚠️
                      {" "}
                      <strong>
                        {
                          attendanceStatistics.pendingStaff
                        }
                      </strong>
                      {" "}
                      {
                        attendanceStatistics.pendingStaff === 1
                          ?
                          "staff member is"
                          :
                          "staff members are"
                      }
                      {" "}
                      still pending. Only marked attendance records will be saved.
                    </div>

                  )
                }


                {/* ================================================
                    CONFIRMATION ACTION BUTTONS
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
                      cancelSaveAttendance
                    }
                    disabled={
                      isSaving
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      confirmSaveAttendance
                    }
                    disabled={
                      isSaving
                    }
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      minWidth: "200px"
                    }}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Saving Attendance..."
                        :
                        `💾 Save ${attendanceStatistics.markedStaff} ${
                          attendanceStatistics.markedStaff === 1
                            ?
                            "Record"
                            :
                            "Records"
                        }`
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

export default MarkStaffAttendance;