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

function SearchStaff() {
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
  // SEARCH STATES
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
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    employmentTypeFilter,
    setEmploymentTypeFilter
  ] = useState("All");


  const [
    genderFilter,
    setGenderFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState("name-ascending");


  // ============================================================
  // QUICK DETAILS STATES
  // ============================================================

  const [
    selectedStaffMember,
    setSelectedStaffMember
  ] = useState(null);


  const [
    showQuickDetails,
    setShowQuickDetails
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
  // CONVERT VALUE TO DATE
  // ============================================================

  const convertToDate =
    (
      value
    ) => {

      if (
        !value
      ) {

        return null;

      }


      if (
        typeof value.toDate ===
        "function"
      ) {

        return value.toDate();

      }


      if (
        value.seconds
      ) {

        return new Date(
          value.seconds *
          1000
        );

      }


      const convertedDate =
        new Date(
          value
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return null;

      }


      return convertedDate;

    };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      value
    ) => {

      const convertedDate =
        convertToDate(
          value
        );


      if (
        !convertedDate
      ) {

        return "Not Available";

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
  // FORMAT SALARY
  // ============================================================

  const formatSalary =
    (
      salary,
      salaryType = "Monthly"
    ) => {

      if (
        salary === undefined ||
        salary === null ||
        salary === ""
      ) {

        return "Not Available";

      }


      const numericSalary =
        Number(
          salary
        );


      if (
        Number.isNaN(
          numericSalary
        )
      ) {

        return "Not Available";

      }


      return `₹${numericSalary.toLocaleString(
        "en-IN"
      )} / ${salaryType || "Monthly"}`;

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
  // GET STATUS BACKGROUND
  // ============================================================

  const getStatusBackground =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Active":

          return "#dcfce7";


        case "Inactive":

          return "#f1f5f9";


        case "On Leave":

          return "#fef3c7";


        case "Suspended":

          return "#fee2e2";


        case "Resigned":

          return "#e2e8f0";


        default:

          return "#f1f5f9";

      }

    };


  // ============================================================
  // GET STATUS TEXT COLOR
  // ============================================================

  const getStatusColor =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Active":

          return "#15803d";


        case "Inactive":

          return "#475569";


        case "On Leave":

          return "#b45309";


        case "Suspended":

          return "#b91c1c";


        case "Resigned":

          return "#334155";


        default:

          return "#475569";

      }

    };


  // ============================================================
  // FETCH STAFF
  // ============================================================

  const fetchStaff =
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

          if (!madrasaId) {

  setStaff([]);

  setIsLoading(false);

  return;

}

const staffQuery =
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
  );

const querySnapshot =
  await getDocs(
    staffQuery
  );


          const staffList =
            querySnapshot.docs
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
                  true
              );


          if (
            isMountedRef.current
          ) {

            setStaff(
              staffList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error fetching staff:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff records. Please check your connection and try again."
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
  // LOAD STAFF WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchStaff();

    },
    [
      fetchStaff
    ]
  );


  // ============================================================
  // FOCUS SEARCH INPUT WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      if (
        !isLoading
      ) {

        searchInputRef.current?.focus();

      }

    },
    [
      isLoading
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
  // UNIQUE EMPLOYMENT TYPE OPTIONS
  // ============================================================

  const employmentTypeOptions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            staff
              .map(
                (
                  member
                ) =>
                  member.employmentType
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
  // FILTER AND SORT STAFF
  // ============================================================

  const filteredStaff =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredList =
          staff.filter(
            (
              member
            ) => {

              const searchableValues = [

                member.staffName,

                member.staffId,

                member.mobileNumber,

                member.alternateMobileNumber,

                member.emailAddress,

                member.position,

                member.department,

                member.employmentType,

                member.workShift,

                member.highestQualification,

                member.specialization,

                member.previousInstitution,

                member.city,

                member.stateName,

                member.postalCode

              ];


              const matchesSearch =
                !normalizedSearchTerm ||
                searchableValues.some(
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


              const matchesStatus =
                statusFilter ===
                "All" ||
                getStaffStatus(
                  member
                ) ===
                statusFilter;


              const matchesEmploymentType =
                employmentTypeFilter ===
                "All" ||
                member.employmentType ===
                employmentTypeFilter;


              const matchesGender =
                genderFilter ===
                "All" ||
                member.gender ===
                genderFilter;


              return (

                matchesSearch &&

                matchesDepartment &&

                matchesPosition &&

                matchesStatus &&

                matchesEmploymentType &&

                matchesGender

              );

            }
          );


        return [
          ...filteredList
        ].sort(
          (
            firstStaff,
            secondStaff
          ) => {

            if (
              sortOption ===
              "name-descending"
            ) {

              return normalizeSearchValue(
                secondStaff.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstStaff.staffName
                )
              );

            }


            if (
              sortOption ===
              "salary-high-low"
            ) {

              return (
                Number(
                  secondStaff.salary ||
                  0
                ) -
                Number(
                  firstStaff.salary ||
                  0
                )
              );

            }


            if (
              sortOption ===
              "salary-low-high"
            ) {

              return (
                Number(
                  firstStaff.salary ||
                  0
                ) -
                Number(
                  secondStaff.salary ||
                  0
                )
              );

            }


            if (
              sortOption ===
              "newest"
            ) {

              return (

                (
                  convertToDate(
                    secondStaff.createdAt
                  )?.getTime() ||
                  0
                )

                -

                (
                  convertToDate(
                    firstStaff.createdAt
                  )?.getTime() ||
                  0
                )

              );

            }


            if (
              sortOption ===
              "oldest"
            ) {

              return (

                (
                  convertToDate(
                    firstStaff.createdAt
                  )?.getTime() ||
                  0
                )

                -

                (
                  convertToDate(
                    secondStaff.createdAt
                  )?.getTime() ||
                  0
                )

              );

            }


            return normalizeSearchValue(
              firstStaff.staffName
            ).localeCompare(
              normalizeSearchValue(
                secondStaff.staffName
              )
            );

          }
        );

      },
      [
        staff,
        searchTerm,
        departmentFilter,
        positionFilter,
        statusFilter,
        employmentTypeFilter,
        genderFilter,
        sortOption
      ]
    );
      // ============================================================
  // CHECK WHETHER FILTERS ARE ACTIVE
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !== "" ||

          departmentFilter !== "All" ||

          positionFilter !== "All" ||

          statusFilter !== "All" ||

          employmentTypeFilter !== "All" ||

          genderFilter !== "All" ||

          sortOption !== "name-ascending"

        );

      },
      [
        searchTerm,
        departmentFilter,
        positionFilter,
        statusFilter,
        employmentTypeFilter,
        genderFilter,
        sortOption
      ]
    );


  // ============================================================
  // RESET ALL SEARCH FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm(
        ""
      );


      setDepartmentFilter(
        "All"
      );


      setPositionFilter(
        "All"
      );


      setStatusFilter(
        "All"
      );


      setEmploymentTypeFilter(
        "All"
      );


      setGenderFilter(
        "All"
      );


      setSortOption(
        "name-ascending"
      );


      setSelectedStaffMember(
        null
      );


      setShowQuickDetails(
        false
      );


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // REFRESH STAFF RECORDS
  // ============================================================

  const refreshStaffRecords =
    async () => {

      setSelectedStaffMember(
        null
      );


      setShowQuickDetails(
        false
      );


      await fetchStaff(
        true
      );

    };


  // ============================================================
  // OPEN QUICK DETAILS
  // ============================================================

  const openQuickDetails =
    (
      member
    ) => {

      setSelectedStaffMember(
        member
      );


      setShowQuickDetails(
        true
      );


      setTimeout(
        () => {

          document
            .getElementById(
              "staff-quick-details"
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
  // CLOSE QUICK DETAILS
  // ============================================================

  const closeQuickDetails =
    () => {

      setSelectedStaffMember(
        null
      );


      setShowQuickDetails(
        false
      );

    };


  // ============================================================
  // SEARCH STATISTICS
  // ============================================================

  const searchStatistics =
    useMemo(
      () => {

        const totalStaff =
          staff.length;


        const matchingStaff =
          filteredStaff.length;


        const activeStaff =
          filteredStaff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Active"
          ).length;


        const inactiveStaff =
          filteredStaff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Inactive"
          ).length;


        const onLeaveStaff =
          filteredStaff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "On Leave"
          ).length;


        return {

          totalStaff,

          matchingStaff,

          activeStaff,

          inactiveStaff,

          onLeaveStaff

        };

      },
      [
        staff,
        filteredStaff
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
              🔍 Advanced Staff Search
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Find staff members using names, IDs, mobile numbers,
              departments, positions and other staff information.
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
                refreshStaffRecords
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


            <Link
              to="/add-staff"
              className="action-btn view-btn"
            >
              ➕ Add Staff
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
            SEARCH STATISTICS
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}
        >

          {/* ====================================================
              TOTAL STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              👥 TOTAL STAFF
            </p>


            <h2
              style={{
                margin: 0,
                fontSize: "30px"
              }}
            >
              {
                searchStatistics.totalStaff
              }
            </h2>

          </div>


          {/* ====================================================
              MATCHING STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              🔍 MATCHING RESULTS
            </p>


            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#2563eb"
              }}
            >
              {
                searchStatistics.matchingStaff
              }
            </h2>

          </div>


          {/* ====================================================
              ACTIVE STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#15803d",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              ✅ ACTIVE
            </p>


            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#15803d"
              }}
            >
              {
                searchStatistics.activeStaff
              }
            </h2>

          </div>


          {/* ====================================================
              INACTIVE STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              ⏸ INACTIVE
            </p>


            <h2
              style={{
                margin: 0,
                fontSize: "30px"
              }}
            >
              {
                searchStatistics.inactiveStaff
              }
            </h2>

          </div>


          {/* ====================================================
              ON LEAVE STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#b45309",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              🏖 ON LEAVE
            </p>


            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#b45309"
              }}
            >
              {
                searchStatistics.onLeaveStaff
              }
            </h2>

          </div>

        </div>


        {/* ======================================================
            ADVANCED SEARCH SECTION
        ====================================================== */}

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
                🔎 Search Staff Records
              </h2>


              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Enter staff information or use filters to narrow the results.
              </p>

            </div>


            {
              hasActiveFilters && (

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >
                  ✖ Reset Search
                </button>

              )
            }

          </div>


          {/* ====================================================
              MAIN SEARCH INPUT
          ==================================================== */}

          <div
            style={{
              marginBottom: "20px"
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
              placeholder="Search name, Staff ID, mobile, email, position, department, city..."
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
                isLoading
              }
            />

          </div>


          {/* ====================================================
              SEARCH FILTER GRID
          ==================================================== */}

          <div className="form-grid">

            {/* ==================================================
                DEPARTMENT FILTER
            ================================================== */}

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
                  isLoading
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
                        {
                          department
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==================================================
                POSITION FILTER
            ================================================== */}

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
                  isLoading
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
                        {
                          position
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==================================================
                STATUS FILTER
            ================================================== */}

            <div>

              <label>
                Staff Status
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
                  isLoading
                }
              >

                <option value="All">
                  All Statuses
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="On Leave">
                  On Leave
                </option>

                <option value="Suspended">
                  Suspended
                </option>

                <option value="Resigned">
                  Resigned
                </option>

              </select>

            </div>


            {/* ==================================================
                EMPLOYMENT TYPE FILTER
            ================================================== */}

            <div>

              <label>
                Employment Type
              </label>


              <select
                value={
                  employmentTypeFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setEmploymentTypeFilter(
                      event.target.value
                    )
                }
                disabled={
                  isLoading
                }
              >

                <option value="All">
                  All Employment Types
                </option>


                {
                  employmentTypeOptions.map(
                    (
                      employmentType
                    ) => (

                      <option
                        key={
                          employmentType
                        }
                        value={
                          employmentType
                        }
                      >
                        {
                          employmentType
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>
                        {/* ==================================================
                GENDER FILTER
            ================================================== */}

            <div>

              <label>
                Gender
              </label>

              <select
                value={
                  genderFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setGenderFilter(
                      event.target.value
                    )
                }
                disabled={
                  isLoading
                }
              >

                <option value="All">
                  All Genders
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* ==================================================
                SORT FILTER
            ================================================== */}

            <div>

              <label>
                Sort Results
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
                  isLoading
                }
              >

                <option value="name-ascending">
                  Name A → Z
                </option>

                <option value="name-descending">
                  Name Z → A
                </option>

                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="salary-high-low">
                  Salary High → Low
                </option>

                <option value="salary-low-high">
                  Salary Low → High
                </option>

              </select>

            </div>

          </div>


          {/* ====================================================
              SEARCH RESULT SUMMARY
          ==================================================== */}

          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap"
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
                  filteredStaff.length
                }
              </strong>
              {" "}
              of
              {" "}
              <strong>
                {
                  staff.length
                }
              </strong>
              {" "}
              staff records
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
                  SEARCH FILTERS ACTIVE
                </span>

              )
            }

          </div>

        </div>


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
                  Loading Staff Records...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff information is being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            NO STAFF DATABASE STATE
        ====================================================== */}

        {
          !isLoading &&
          staff.length === 0 &&
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
                  👳
                </div>


                <h2>
                  No Staff Records Available
                </h2>


                <p
                  style={{
                    margin: "0 0 22px",
                    color: "#64748b"
                  }}
                >
                  Add staff members before using Advanced Staff Search.
                </p>


                <Link
                  to="/add-staff"
                  className="action-btn view-btn"
                >
                  ➕ Add First Staff Member
                </Link>

              </div>

            </div>

          )
        }


        {/* ======================================================
            NO SEARCH RESULTS STATE
        ====================================================== */}

        {
          !isLoading &&
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
                  No staff records match the information you searched for.
                </p>


                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >
                  ✖ Reset Search
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            STAFF SEARCH RESULTS
        ====================================================== */}

        {
          !isLoading &&
          filteredStaff.length > 0 && (

            <div>

              {/* ==================================================
                  RESULTS HEADER
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
                      margin: "0 0 5px"
                    }}
                  >
                    🔎 Staff Search Results
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Review staff information or open a complete staff profile.
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
                      "RESULT"
                      :
                      "RESULTS"
                  }
                </span>

              </div>


              {/* ==================================================
                  RESULT CARDS
              ================================================== */}

              {
                filteredStaff.map(
                  (
                    member
                  ) => {

                    const currentStaffStatus =
                      getStaffStatus(
                        member
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

                        {/* ==========================================
                            RESULT CARD HEADER
                        ========================================== */}

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

                            {/* ======================================
                                STAFF AVATAR
                            ====================================== */}

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


                            {/* ======================================
                                BASIC STAFF INFORMATION
                            ====================================== */}

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


                                <span
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: "999px",
                                    background:
                                      getStatusBackground(
                                        currentStaffStatus
                                      ),
                                    color:
                                      getStatusColor(
                                        currentStaffStatus
                                      ),
                                    fontSize: "11px",
                                    fontWeight: "800"
                                  }}
                                >
                                  {
                                    currentStaffStatus
                                  }
                                </span>

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
                                💼 Position:
                                {" "}
                                <strong>
                                  {
                                    displayValue(
                                      member.position
                                    )
                                  }
                                </strong>
                              </p>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                🏢 Department:
                                {" "}
                                {
                                  displayValue(
                                    member.department
                                  )
                                }
                              </p>

                            </div>

                          </div>


                          {/* ========================================
                              EMPLOYMENT TYPE BADGE
                          ======================================== */}

                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "999px",
                              background: "#ede9fe",
                              color: "#6d28d9",
                              fontSize: "11px",
                              fontWeight: "800"
                            }}
                          >
                            {
                              displayValue(
                                member.employmentType,
                                "Employment Type N/A"
                              )
                            }
                          </span>

                        </div>


                        {/* ==========================================
                            PRIMARY RESULT INFORMATION
                        ========================================== */}

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
                              📞 MOBILE NUMBER
                            </p>


                            <strong>
                              {
                                displayValue(
                                  member.mobileNumber
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
                              ✉️ EMAIL ADDRESS
                            </p>


                            <strong
                              style={{
                                wordBreak: "break-word"
                              }}
                            >
                              {
                                displayValue(
                                  member.emailAddress
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
                              💰 SALARY
                            </p>


                            <strong>
                              {
                                formatSalary(
                                  member.salary,
                                  member.salaryType
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
                              📅 JOINING DATE
                            </p>


                            <strong>
                              {
                                member.joiningDate
                                  ?
                                  formatDate(
                                    member.joiningDate
                                  )
                                  :
                                  "Not Available"
                              }
                            </strong>

                          </div>

                        </div>


                        {/* ==========================================
                            SECONDARY RESULT INFORMATION
                        ========================================== */}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "14px",
                            marginTop: "16px",
                            padding: "14px",
                            borderRadius: "10px",
                            background: "#f8fafc"
                          }}
                        >

                          <div>

                            <p
                              style={{
                                margin: "0 0 4px",
                                color: "#64748b",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              WORK SHIFT
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  member.workShift
                                )
                              }
                            </p>

                          </div>


                          <div>

                            <p
                              style={{
                                margin: "0 0 4px",
                                color: "#64748b",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              QUALIFICATION
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  member.highestQualification
                                )
                              }
                            </p>

                          </div>


                          <div>

                            <p
                              style={{
                                margin: "0 0 4px",
                                color: "#64748b",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              GENDER
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  member.gender
                                )
                              }
                            </p>

                          </div>


                          <div>

                            <p
                              style={{
                                margin: "0 0 4px",
                                color: "#64748b",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              LOCATION
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  member.city
                                )
                              }
                            </p>

                          </div>

                        </div>


                        {/* ==========================================
                            RESULT ACTION BUTTONS
                        ========================================== */}

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
                                openQuickDetails(
                                  member
                                )
                            }
                          >
                            📋 Quick Details
                          </button>


                          <Link
                            to={
                              `/staff-profile/${member.id}`
                            }
                            className="action-btn view-btn"
                          >
                            👁 Full Profile
                          </Link>


                          <Link
                            to={
                              `/edit-staff/${member.id}`
                            }
                            className="action-btn edit-btn"
                          >
                            ✏ Edit Staff
                          </Link>

                        </div>

                      </div>

                    );

                  }
                )
              }

            </div>

          )
        }
                {/* ======================================================
            QUICK STAFF DETAILS SECTION
        ====================================================== */}

        {
          showQuickDetails &&
          selectedStaffMember && (

            <div
              id="staff-quick-details"
              style={{
                marginTop: "34px"
              }}
            >

              {/* ==================================================
                  QUICK DETAILS HEADER
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
                    📋 Staff Quick Details
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Complete overview of the selected staff member.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeQuickDetails
                  }
                >
                  ✖ Close Details
                </button>

              </div>


              {/* ==================================================
                  QUICK DETAILS CARD
              ================================================== */}

              <div className="section-card">

                {/* ==================================================
                    STAFF DETAILS TOP SECTION
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "18px",
                    flexWrap: "wrap",
                    paddingBottom: "22px",
                    borderBottom: "1px solid #e2e8f0"
                  }}
                >

                  {/* =================================================
                      STAFF AVATAR
                  ================================================= */}

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
                    {
                      selectedStaffMember.gender === "Female"
                        ?
                        "👩"
                        :
                        "👳"
                    }
                  </div>


                  {/* =================================================
                      STAFF BASIC DETAILS
                  ================================================= */}

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
                        gap: "9px",
                        flexWrap: "wrap",
                        marginBottom: "8px"
                      }}
                    >

                      <h2
                        style={{
                          margin: 0,
                          wordBreak: "break-word"
                        }}
                      >
                        {
                          displayValue(
                            selectedStaffMember.staffName,
                            "Unnamed Staff"
                          )
                        }
                      </h2>


                      <span
                        style={{
                          padding: "5px 11px",
                          borderRadius: "999px",
                          background:
                            getStatusBackground(
                              getStaffStatus(
                                selectedStaffMember
                              )
                            ),
                          color:
                            getStatusColor(
                              getStaffStatus(
                                selectedStaffMember
                              )
                            ),
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          getStaffStatus(
                            selectedStaffMember
                          )
                        }
                      </span>

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
                            selectedStaffMember.staffId
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
                          selectedStaffMember.position
                        )
                      }
                      {" • "}
                      {
                        displayValue(
                          selectedStaffMember.department
                        )
                      }
                    </p>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      📅 Joined:
                      {" "}
                      {
                        selectedStaffMember.joiningDate
                          ?
                          formatDate(
                            selectedStaffMember.joiningDate
                          )
                          :
                          "Not Available"
                      }
                    </p>

                  </div>


                  {/* =================================================
                      EMPLOYMENT TYPE
                  ================================================= */}

                  <span
                    style={{
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background: "#ede9fe",
                      color: "#6d28d9",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      displayValue(
                        selectedStaffMember.employmentType,
                        "Employment Type N/A"
                      )
                    }
                  </span>

                </div>


                {/* ==================================================
                    PERSONAL AND CONTACT INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>
                    👤 Personal & Contact Information
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
                          "Gender",
                          selectedStaffMember.gender
                        ],

                        [
                          "Date of Birth",
                          selectedStaffMember.dateOfBirth
                            ?
                            formatDate(
                              selectedStaffMember.dateOfBirth
                            )
                            :
                            null
                        ],

                        [
                          "Blood Group",
                          selectedStaffMember.bloodGroup
                        ],

                        [
                          "Mobile Number",
                          selectedStaffMember.mobileNumber
                        ],

                        [
                          "Alternate Mobile",
                          selectedStaffMember.alternateMobileNumber
                        ],

                        [
                          "Email Address",
                          selectedStaffMember.emailAddress
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
                              {
                                label
                              }
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


                {/* ==================================================
                    EMPLOYMENT AND SALARY INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>
                    💼 Employment & Salary Information
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
                          "Position",
                          selectedStaffMember.position
                        ],

                        [
                          "Department",
                          selectedStaffMember.department
                        ],

                        [
                          "Employment Type",
                          selectedStaffMember.employmentType
                        ],

                        [
                          "Work Shift",
                          selectedStaffMember.workShift
                        ],

                        [
                          "Salary",
                          formatSalary(
                            selectedStaffMember.salary,
                            selectedStaffMember.salaryType
                          )
                        ],

                        [
                          "Payment Method",
                          selectedStaffMember.paymentMethod
                        ],

                        [
                          "Joining Date",
                          selectedStaffMember.joiningDate
                            ?
                            formatDate(
                              selectedStaffMember.joiningDate
                            )
                            :
                            null
                        ],

                        [
                          "Staff Status",
                          getStaffStatus(
                            selectedStaffMember
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
                              {
                                label
                              }
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


                {/* ==================================================
                    QUALIFICATION AND EXPERIENCE
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>
                    🎓 Qualification & Experience
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
                          "Highest Qualification",
                          selectedStaffMember.highestQualification
                        ],

                        [
                          "Specialization",
                          selectedStaffMember.specialization
                        ],

                        [
                          "Total Experience",
                          selectedStaffMember.totalExperience !==
                            undefined &&
                          selectedStaffMember.totalExperience !==
                            null &&
                          selectedStaffMember.totalExperience !==
                            ""
                            ?
                            `${selectedStaffMember.totalExperience} Years`
                            :
                            null
                        ],

                        [
                          "Previous Institution",
                          selectedStaffMember.previousInstitution
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
                              {
                                label
                              }
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


                {/* ==================================================
                    ADDRESS INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>
                    📍 Address Information
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
                          "Full Address",
                          selectedStaffMember.address
                        ],

                        [
                          "City / Town / Village",
                          selectedStaffMember.city
                        ],

                        [
                          "State",
                          selectedStaffMember.stateName
                        ],

                        [
                          "Postal Code",
                          selectedStaffMember.postalCode
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
                              {
                                label
                              }
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


                {/* ==================================================
                    EMERGENCY CONTACT INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3>
                    🚨 Emergency Contact
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
                          "Contact Person",
                          selectedStaffMember.emergencyContactName
                        ],

                        [
                          "Relationship",
                          selectedStaffMember.emergencyContactRelation
                        ],

                        [
                          "Emergency Mobile",
                          selectedStaffMember.emergencyContactNumber
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
                              {
                                label
                              }
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


                {/* ==================================================
                    ADDITIONAL NOTES
                ================================================== */}

                {
                  selectedStaffMember.notes && (

                    <div
                      style={{
                        marginTop: "24px"
                      }}
                    >

                      <h3>
                        📝 Additional Notes
                      </h3>


                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word"
                        }}
                      >
                        {
                          selectedStaffMember.notes
                        }
                      </div>

                    </div>

                  )
                }


                {/* ==================================================
                    QUICK DETAILS ACTION BUTTONS
                ================================================== */}

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
                    to={
                      `/staff-profile/${selectedStaffMember.id}`
                    }
                    className="action-btn view-btn"
                  >
                    👁 Open Full Profile
                  </Link>


                  <Link
                    to={
                      `/edit-staff/${selectedStaffMember.id}`
                    }
                    className="action-btn edit-btn"
                  >
                    ✏ Edit Staff
                  </Link>


                  <button
                    type="button"
                    onClick={
                      closeQuickDetails
                    }
                  >
                    ✖ Close Details
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

export default SearchStaff;