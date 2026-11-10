import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
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

function StaffList() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const pageTopRef =
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


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


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
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    employmentTypeFilter,
    setEmploymentTypeFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState(
    "newest"
  );


  // ============================================================
  // SELECTION STATES
  // ============================================================

  const [
    selectedStaffIds,
    setSelectedStaffIds
  ] = useState([]);


  // ============================================================
  // STAFF DETAILS STATES
  // ============================================================

  const [
    selectedStaffMember,
    setSelectedStaffMember
  ] = useState(null);


  const [
    showStaffDetails,
    setShowStaffDetails
  ] = useState(false);


  // ============================================================
  // SINGLE DELETE STATES
  // ============================================================

  const [
    staffPendingDelete,
    setStaffPendingDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


  const [
    isDeleting,
    setIsDeleting
  ] = useState(false);


  const [
    deletingStaffId,
    setDeletingStaffId
  ] = useState("");


  // ============================================================
  // BULK DELETE STATES
  // ============================================================

  const [
    showBulkDeleteConfirmation,
    setShowBulkDeleteConfirmation
  ] = useState(false);


  const [
    isBulkDeleting,
    setIsBulkDeleting
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
  // FORMAT DISPLAY VALUE
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
  // FORMAT SALARY
  // ============================================================

  const formatSalary =
    (
      salary,
      salaryType = "Monthly"
    ) => {

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
  // CONVERT FIRESTORE TIMESTAMP TO DATE
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
  // GET STATUS COLORS
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
  // FETCH STAFF FROM FIRESTORE
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


            setSelectedStaffIds(
              (
                previousSelectedIds
              ) =>
                previousSelectedIds.filter(
                  (
                    selectedId
                  ) =>
                    staffList.some(
                      (
                        member
                      ) =>
                        member.id ===
                        selectedId
                    )
                )
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
  // FETCH STAFF WHEN PAGE OPENS
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
  // FILTER AND SORT STAFF
  // ============================================================

  const filteredStaff =
    useMemo(
      () => {

        const normalizedSearchTerm =
          searchTerm
            .trim()
            .toLowerCase();


        const filteredList =
          staff.filter(
            (
              member
            ) => {

              const searchableValues = [

                member.staffName,

                member.staffId,

                member.mobileNumber,

                member.emailAddress,

                member.position,

                member.department,

                member.city,

                member.aadhaarNumber

              ];


              const matchesSearch =
                !normalizedSearchTerm ||
                searchableValues.some(
                  (
                    value
                  ) =>
                    String(
                      value ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
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


              return (
                matchesSearch &&
                matchesDepartment &&
                matchesPosition &&
                matchesStatus &&
                matchesEmploymentType
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
              "name-ascending"
            ) {

              return String(
                firstStaff.staffName ||
                ""
              ).localeCompare(
                String(
                  secondStaff.staffName ||
                  ""
                )
              );

            }


            if (
              sortOption ===
              "name-descending"
            ) {

              return String(
                secondStaff.staffName ||
                ""
              ).localeCompare(
                String(
                  firstStaff.staffName ||
                  ""
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
              "oldest"
            ) {

              const firstDate =
                convertToDate(
                  firstStaff.createdAt
                )?.getTime() ||
                0;


              const secondDate =
                convertToDate(
                  secondStaff.createdAt
                )?.getTime() ||
                0;


              return (
                firstDate -
                secondDate
              );

            }


            const firstDate =
              convertToDate(
                firstStaff.createdAt
              )?.getTime() ||
              0;


            const secondDate =
              convertToDate(
                secondStaff.createdAt
              )?.getTime() ||
              0;


            return (
              secondDate -
              firstDate
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
        sortOption
      ]
    );
      // ============================================================
  // STAFF STATISTICS
  // ============================================================

  const staffStatistics =
    useMemo(
      () => {

        const totalStaff =
          staff.length;


        const activeStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Active"
          ).length;


        const inactiveStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Inactive"
          ).length;


        const onLeaveStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "On Leave"
          ).length;


        const suspendedStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Suspended"
          ).length;


        const resignedStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) ===
              "Resigned"
          ).length;


        const totalMonthlySalary =
          staff
            .filter(
              (
                member
              ) =>
                getStaffStatus(
                  member
                ) ===
                "Active"
            )
            .reduce(
              (
                total,
                member
              ) => {

                const numericSalary =
                  Number(
                    member.salary ||
                    0
                  );


                if (
                  Number.isNaN(
                    numericSalary
                  )
                ) {

                  return total;

                }


                return (
                  total +
                  numericSalary
                );

              },
              0
            );


        return {

          totalStaff,

          activeStaff,

          inactiveStaff,

          onLeaveStaff,

          suspendedStaff,

          resignedStaff,

          totalMonthlySalary

        };

      },
      [
        staff
      ]
    );


  // ============================================================
  // CHECK WHETHER STAFF MEMBER IS SELECTED
  // ============================================================

  const isStaffSelected =
    (
      staffId
    ) => {

      return selectedStaffIds.includes(
        staffId
      );

    };


  // ============================================================
  // TOGGLE SINGLE STAFF SELECTION
  // ============================================================

  const toggleStaffSelection =
    (
      staffId
    ) => {

      setSelectedStaffIds(
        (
          previousSelectedIds
        ) => {

          if (
            previousSelectedIds.includes(
              staffId
            )
          ) {

            return previousSelectedIds.filter(
              (
                selectedId
              ) =>
                selectedId !==
                staffId
            );

          }


          return [

            ...previousSelectedIds,

            staffId

          ];

        }
      );

    };


  // ============================================================
  // CHECK WHETHER ALL FILTERED STAFF ARE SELECTED
  // ============================================================

  const allFilteredStaffSelected =
    useMemo(
      () => {

        if (
          filteredStaff.length ===
          0
        ) {

          return false;

        }


        return filteredStaff.every(
          (
            member
          ) =>
            selectedStaffIds.includes(
              member.id
            )
        );

      },
      [
        filteredStaff,
        selectedStaffIds
      ]
    );


  // ============================================================
  // TOGGLE SELECT ALL FILTERED STAFF
  // ============================================================

  const toggleSelectAllFilteredStaff =
    () => {

      const filteredStaffIds =
        filteredStaff.map(
          (
            member
          ) =>
            member.id
        );


      if (
        allFilteredStaffSelected
      ) {

        setSelectedStaffIds(
          (
            previousSelectedIds
          ) =>
            previousSelectedIds.filter(
              (
                selectedId
              ) =>
                !filteredStaffIds.includes(
                  selectedId
                )
            )
        );


        return;

      }


      setSelectedStaffIds(
        (
          previousSelectedIds
        ) =>
          Array.from(
            new Set(
              [

                ...previousSelectedIds,

                ...filteredStaffIds

              ]
            )
          )
      );

    };


  // ============================================================
  // CLEAR SELECTED STAFF
  // ============================================================

  const clearSelectedStaff =
    () => {

      setSelectedStaffIds(
        []
      );

    };


  // ============================================================
  // RESET ALL FILTERS
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


      setSortOption(
        "newest"
      );

    };


  // ============================================================
  // CHECK WHETHER ANY FILTER IS ACTIVE
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !==
          "" ||

          departmentFilter !==
          "All" ||

          positionFilter !==
          "All" ||

          statusFilter !==
          "All" ||

          employmentTypeFilter !==
          "All" ||

          sortOption !==
          "newest"

        );

      },
      [
        searchTerm,
        departmentFilter,
        positionFilter,
        statusFilter,
        employmentTypeFilter,
        sortOption
      ]
    );


  // ============================================================
  // OPEN STAFF DETAILS
  // ============================================================

  const openStaffDetails =
    (
      member
    ) => {

      setSelectedStaffMember(
        member
      );


      setShowStaffDetails(
        true
      );


      setTimeout(
        () => {

          pageTopRef.current?.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "start"
            }
          );

        },
        100
      );

    };


  // ============================================================
  // CLOSE STAFF DETAILS
  // ============================================================

  const closeStaffDetails =
    () => {

      setShowStaffDetails(
        false
      );


      setSelectedStaffMember(
        null
      );

    };


  // ============================================================
  // REQUEST SINGLE STAFF DELETE
  // ============================================================

  const requestDeleteStaff =
    (
      member
    ) => {

      setStaffPendingDelete(
        member
      );


      setShowDeleteConfirmation(
        true
      );

    };


  // ============================================================
  // CANCEL SINGLE STAFF DELETE
  // ============================================================

  const cancelDeleteStaff =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setShowDeleteConfirmation(
        false
      );


      setStaffPendingDelete(
        null
      );

    };


  // ============================================================
  // CONFIRM SINGLE STAFF SOFT DELETE
  // ============================================================

  const confirmDeleteStaff =
    async () => {

      if (
        !staffPendingDelete ||
        isDeleting
      ) {

        return;

      }


      const staffMemberToDelete =
        staffPendingDelete;


      setIsDeleting(
        true
      );


      setDeletingStaffId(
        staffMemberToDelete.id
      );


      setErrorMessage(
        ""
      );


      setSuccessMessage(
        ""
      );


      try {

        await updateDoc(
          doc(
            db,
            "staff",
            staffMemberToDelete.id
          ),
          {

            isDeleted:
              true,

            isActive:
              false,

            deletedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        if (
          !isMountedRef.current
        ) {

          return;

        }


        setStaff(
          (
            previousStaff
          ) =>
            previousStaff.filter(
              (
                member
              ) =>
                member.id !==
                staffMemberToDelete.id
            )
        );


        setSelectedStaffIds(
          (
            previousSelectedIds
          ) =>
            previousSelectedIds.filter(
              (
                selectedId
              ) =>
                selectedId !==
                staffMemberToDelete.id
            )
        );


        if (
          selectedStaffMember?.id ===
          staffMemberToDelete.id
        ) {

          closeStaffDetails();

        }


        setSuccessMessage(
          `${displayValue(
            staffMemberToDelete.staffName,
            "Staff member"
          )} was removed from the active staff list successfully.`
        );


        setShowDeleteConfirmation(
          false
        );


        setStaffPendingDelete(
          null
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting staff:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to remove the staff member. Please check your connection and try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDeleting(
            false
          );


          setDeletingStaffId(
            ""
          );

        }

      }

    };


  // ============================================================
  // REQUEST BULK STAFF DELETE
  // ============================================================

  const requestBulkDelete =
    () => {

      if (
        selectedStaffIds.length ===
        0
      ) {

        return;

      }


      setShowBulkDeleteConfirmation(
        true
      );

    };


  // ============================================================
  // CANCEL BULK STAFF DELETE
  // ============================================================

  const cancelBulkDelete =
    () => {

      if (
        isBulkDeleting
      ) {

        return;

      }


      setShowBulkDeleteConfirmation(
        false
      );

    };


  // ============================================================
  // CONFIRM BULK STAFF SOFT DELETE
  // ============================================================

  const confirmBulkDelete =
    async () => {

      if (
        selectedStaffIds.length ===
        0 ||
        isBulkDeleting
      ) {

        return;

      }


      const staffIdsToDelete = [
        ...selectedStaffIds
      ];


      setIsBulkDeleting(
        true
      );


      setErrorMessage(
        ""
      );


      setSuccessMessage(
        ""
      );


      try {

        await Promise.all(
          staffIdsToDelete.map(
            (
              staffDocumentId
            ) =>
              updateDoc(
                doc(
                  db,
                  "staff",
                  staffDocumentId
                ),
                {

                  isDeleted:
                    true,

                  isActive:
                    false,

                  deletedAt:
                    serverTimestamp(),

                  updatedAt:
                    serverTimestamp()

                }
              )
          )
        );


        if (
          !isMountedRef.current
        ) {

          return;

        }


        setStaff(
          (
            previousStaff
          ) =>
            previousStaff.filter(
              (
                member
              ) =>
                !staffIdsToDelete.includes(
                  member.id
                )
            )
        );


        if (
          selectedStaffMember &&
          staffIdsToDelete.includes(
            selectedStaffMember.id
          )
        ) {

          closeStaffDetails();

        }


        setSelectedStaffIds(
          []
        );


        setShowBulkDeleteConfirmation(
          false
        );


        setSuccessMessage(
          `${staffIdsToDelete.length} ${
            staffIdsToDelete.length === 1
              ?
              "staff record was"
              :
              "staff records were"
          } removed from the active staff list successfully.`
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting selected staff:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to remove all selected staff records. Please refresh the page and verify the records before trying again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsBulkDeleting(
            false
          );

        }

      }

    };


  // ============================================================
  // REFRESH STAFF LIST
  // ============================================================

  const refreshStaffList =
    async () => {

      setSuccessMessage(
        ""
      );


      await fetchStaff(
        true
      );

    };


  // ============================================================
  // CLEAR PAGE MESSAGES
  // ============================================================

  const clearMessages =
    () => {

      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );

    };


  // ============================================================
  // CHECK WHETHER ANY DELETE ACTION IS RUNNING
  // ============================================================

  const isAnyDeleteActionRunning =
    isDeleting ||
    isBulkDeleting;


  // ============================================================
  // GET SELECTED STAFF RECORDS
  // ============================================================

  const selectedStaffRecords =
    useMemo(
      () => {

        return staff.filter(
          (
            member
          ) =>
            selectedStaffIds.includes(
              member.id
            )
        );

      },
      [
        staff,
        selectedStaffIds
      ]
    );
      // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <Layout>

      <div
        className="accounts-page"
        ref={
          pageTopRef
        }
      >

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
              👳 Staff List
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Search, filter, view and manage all Madrasa staff records.
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
                refreshStaffList
              }
              disabled={
                isRefreshing ||
                isLoading ||
                isAnyDeleteActionRunning
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
            SUCCESS MESSAGE
        ====================================================== */}

        {
          successMessage && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#ecfdf5",
                border: "1px solid #86efac",
                color: "#166534",
                fontWeight: "600"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >

                <span>
                  ✅ {successMessage}
                </span>


                <button
                  type="button"
                  onClick={
                    clearMessages
                  }
                  style={{
                    padding: "4px 8px"
                  }}
                >
                  ✖
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {
          errorMessage && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#b91c1c",
                fontWeight: "600"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >

                <span>
                  ⚠️ {errorMessage}
                </span>


                <button
                  type="button"
                  onClick={
                    clearMessages
                  }
                  style={{
                    padding: "4px 8px"
                  }}
                >
                  ✖
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            STAFF STATISTICS
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
                staffStatistics.totalStaff
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
                staffStatistics.activeStaff
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
                staffStatistics.inactiveStaff
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
                staffStatistics.onLeaveStaff
              }
            </h2>

          </div>


          {/* ====================================================
              SUSPENDED STAFF
          ==================================================== */}

          <div className="section-card">

            <p
              style={{
                margin: "0 0 8px",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              🚫 SUSPENDED
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#b91c1c"
              }}
            >
              {
                staffStatistics.suspendedStaff
              }
            </h2>

          </div>


          {/* ====================================================
              MONTHLY SALARY
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
              💰 ACTIVE STAFF SALARY
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "24px"
              }}
            >
              ₹
              {
                staffStatistics
                  .totalMonthlySalary
                  .toLocaleString(
                    "en-IN"
                  )
              }
            </h2>

          </div>

        </div>


        {/* ======================================================
            SEARCH AND FILTER SECTION
        ====================================================== */}

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
                  margin: "0 0 6px"
                }}
              >
                🔎 Search & Filter Staff
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Find staff members by name, ID, mobile, department, position or other information.
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
                    isAnyDeleteActionRunning
                  }
                >
                  ✖ Clear Filters
                </button>

              )
            }

          </div>


          {/* ====================================================
              SEARCH BOX
          ==================================================== */}

          <div
            style={{
              marginBottom: "18px"
            }}
          >

            <label>
              Search Staff
            </label>

            <input
              type="text"
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
              placeholder="Search by name, Staff ID, mobile, email, position, department, city or Aadhaar..."
              disabled={
                isAnyDeleteActionRunning
              }
            />

          </div>


          {/* ====================================================
              FILTER CONTROLS
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
                  isAnyDeleteActionRunning
                }
              >

                <option value="All">
                  All Departments
                </option>

                {
                  departmentOptions.map(
                    (
                      departmentOption
                    ) => (

                      <option
                        key={
                          departmentOption
                        }
                        value={
                          departmentOption
                        }
                      >
                        {
                          departmentOption
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
                  isAnyDeleteActionRunning
                }
              >

                <option value="All">
                  All Positions
                </option>

                {
                  positionOptions.map(
                    (
                      positionOption
                    ) => (

                      <option
                        key={
                          positionOption
                        }
                        value={
                          positionOption
                        }
                      >
                        {
                          positionOption
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
                  isAnyDeleteActionRunning
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
                  isAnyDeleteActionRunning
                }
              >

                <option value="All">
                  All Employment Types
                </option>

                {
                  employmentTypeOptions.map(
                    (
                      employmentTypeOption
                    ) => (

                      <option
                        key={
                          employmentTypeOption
                        }
                        value={
                          employmentTypeOption
                        }
                      >
                        {
                          employmentTypeOption
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==================================================
                SORT OPTION
            ================================================== */}

            <div>

              <label>
                Sort Staff
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
                  isAnyDeleteActionRunning
                }
              >

                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="name-ascending">
                  Name A → Z
                </option>

                <option value="name-descending">
                  Name Z → A
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
              FILTER RESULT SUMMARY
          ==================================================== */}

          <div
            style={{
              marginTop: "18px",
              paddingTop: "16px",
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
                  FILTERS ACTIVE
                </span>

              )
            }

          </div>

        </div>


        {/* ======================================================
            SELECTION AND BULK ACTION SECTION
        ====================================================== */}

        {
          !isLoading &&
          filteredStaff.length > 0 && (

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
                  flexWrap: "wrap"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}
                >

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      margin: 0
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={
                        allFilteredStaffSelected
                      }
                      onChange={
                        toggleSelectAllFilteredStaff
                      }
                      disabled={
                        isAnyDeleteActionRunning
                      }
                      style={{
                        width: "18px",
                        height: "18px"
                      }}
                    />

                    <span>
                      Select All Visible Staff
                    </span>

                  </label>


                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background:
                        selectedStaffIds.length > 0
                          ?
                          "#dbeafe"
                          :
                          "#f1f5f9",
                      color:
                        selectedStaffIds.length > 0
                          ?
                          "#1d4ed8"
                          :
                          "#64748b",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      selectedStaffIds.length
                    }
                    {" "}
                    SELECTED
                  </span>

                </div>


                {
                  selectedStaffIds.length > 0 && (

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
                          clearSelectedStaff
                        }
                        disabled={
                          isAnyDeleteActionRunning
                        }
                      >
                        ✖ Clear Selection
                      </button>


                      <button
                        type="button"
                        onClick={
                          requestBulkDelete
                        }
                        disabled={
                          isAnyDeleteActionRunning
                        }
                        style={{
                          background: "#dc2626",
                          color: "#ffffff"
                        }}
                      >
                        🗑 Remove Selected Staff
                      </button>

                    </div>

                  )
                }

              </div>

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
                    fontSize: "42px",
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
            EMPTY STAFF DATABASE STATE
        ====================================================== */}

        {
          !isLoading &&
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
                  No Staff Records Found
                </h2>

                <p
                  style={{
                    margin: "0 0 22px",
                    color: "#64748b"
                  }}
                >
                  No active staff members have been added yet.
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
            NO FILTER RESULTS STATE
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
                  🔎
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
                  No staff records match your current search and filter settings.
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >
                  ✖ Clear All Filters
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            STAFF RECORDS LIST
        ====================================================== */}

        {
          !isLoading &&
          filteredStaff.length > 0 && (

            <div>

              {/* ==================================================
                  STAFF LIST HEADER
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
                    👥 Staff Records
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    View and manage all available staff members.
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
                      "RECORD"
                      :
                      "RECORDS"
                  }
                </span>

              </div>


              {/* ==================================================
                  STAFF CARDS
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


                    const memberIsSelected =
                      isStaffSelected(
                        member.id
                      );


                    const memberIsDeleting =
                      isDeleting &&
                      deletingStaffId ===
                      member.id;


                    return (

                      <div
                        className="student-card"
                        key={
                          member.id
                        }
                        style={{
                          marginBottom: "18px",
                          border:
                            memberIsSelected
                              ?
                              "2px solid #2563eb"
                              :
                              "1px solid #e2e8f0",
                          background:
                            memberIsSelected
                              ?
                              "#eff6ff"
                              :
                              "#ffffff"
                        }}
                      >

                        {/* ==========================================
                            STAFF CARD TOP SECTION
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

                          {/* ========================================
                              STAFF BASIC INFORMATION
                          ======================================== */}

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
                                SELECTION CHECKBOX
                            ====================================== */}

                            <input
                              type="checkbox"
                              checked={
                                memberIsSelected
                              }
                              onChange={
                                () =>
                                  toggleStaffSelection(
                                    member.id
                                  )
                              }
                              disabled={
                                isAnyDeleteActionRunning
                              }
                              style={{
                                width: "19px",
                                height: "19px",
                                marginTop: "8px",
                                flexShrink: 0,
                                cursor: "pointer"
                              }}
                            />


                            {/* ======================================
                                STAFF AVATAR
                            ====================================== */}

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
                              {
                                member.gender === "Female"
                                  ?
                                  "👩"
                                  :
                                  "👳"
                              }
                            </div>


                            {/* ======================================
                                STAFF NAME AND IDENTIFICATION
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
                            STAFF QUICK INFORMATION
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

                          {/* ========================================
                              MOBILE NUMBER
                          ======================================== */}

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


                          {/* ========================================
                              SALARY
                          ======================================== */}

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


                          {/* ========================================
                              JOINING DATE
                          ======================================== */}

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


                          {/* ========================================
                              EXPERIENCE
                          ======================================== */}

                          <div>

                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#64748b",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              🎓 EXPERIENCE
                            </p>

                            <strong>
                              {
                                member.totalExperience !==
                                  undefined &&
                                member.totalExperience !==
                                  null &&
                                member.totalExperience !==
                                  ""
                                  ?
                                  `${member.totalExperience} Years`
                                  :
                                  "Not Available"
                              }
                            </strong>

                          </div>

                        </div>


                        {/* ==========================================
                            SECONDARY STAFF INFORMATION
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
                              EMAIL
                            </p>

                            <p
                              style={{
                                margin: 0,
                                wordBreak: "break-word"
                              }}
                            >
                              {
                                displayValue(
                                  member.emailAddress
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
                            STAFF CARD ACTIONS
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
                                openStaffDetails(
                                  member
                                )
                            }
                            disabled={
                              isAnyDeleteActionRunning
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
                            ✏ Edit
                          </Link>


                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={
                              () =>
                                requestDeleteStaff(
                                  member
                                )
                            }
                            disabled={
                              isAnyDeleteActionRunning
                            }
                          >
                            {
                              memberIsDeleting
                                ?
                                "⏳ Removing..."
                                :
                                "🗑 Remove"
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


        {/* ======================================================
            QUICK STAFF DETAILS SECTION
        ====================================================== */}

        {
          showStaffDetails &&
          selectedStaffMember && (

            <div
              style={{
                marginTop: "34px"
              }}
            >

              {/* ==================================================
                  DETAILS HEADER
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
                    Review important information about the selected staff member.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeStaffDetails
                  }
                  disabled={
                    isAnyDeleteActionRunning
                  }
                >
                  ✖ Close Details
                </button>

              </div>


              {/* ==================================================
                  DETAILS CARD
              ================================================== */}

              <div
                className="section-card"
                style={{
                  maxWidth: "1000px",
                  margin: "0 auto"
                }}
              >

                {/* ==================================================
                    STAFF DETAILS TOP
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

                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#f1f5f9",
                      fontSize: "40px"
                    }}
                  >
                    {
                      selectedStaffMember.gender ===
                      "Female"
                        ?
                        "👩"
                        :
                        "👳"
                    }
                  </div>


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
                          margin: 0
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
                      🪪
                      {" "}
                      {
                        displayValue(
                          selectedStaffMember.staffId
                        )
                      }
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
                          "Mobile",
                          selectedStaffMember.mobileNumber
                        ],

                        [
                          "Alternate Mobile",
                          selectedStaffMember.alternateMobileNumber
                        ],

                        [
                          "Email",
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


              {/* ==================================================
                  QUALIFICATION INFORMATION
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


              {/* ==================================================
                  EMERGENCY CONTACT
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
                            {label}
                          </strong>

                          <p
                            style={{
                              margin: "6px 0 0",
                              color: "#64748b"
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
                  NOTES
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
                  className="action-btn delete-btn"
                  onClick={
                    () =>
                      requestDeleteStaff(
                        selectedStaffMember
                      )
                  }
                  disabled={
                    isAnyDeleteActionRunning
                  }
                >
                  🗑 Remove Staff
                </button>


                <button
                  type="button"
                  onClick={
                    closeStaffDetails
                  }
                  disabled={
                    isAnyDeleteActionRunning
                  }
                >
                  ✖ Close
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            SINGLE DELETE CONFIRMATION
        ====================================================== */}

        {
          showDeleteConfirmation &&
          staffPendingDelete && (

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
                  maxWidth: "520px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                <div
                  style={{
                    textAlign: "center"
                  }}
                >

                  <div
                    style={{
                      fontSize: "52px",
                      marginBottom: "12px"
                    }}
                  >
                    ⚠️
                  </div>


                  <h2
                    style={{
                      margin: "0 0 10px"
                    }}
                  >
                    Remove Staff Member?
                  </h2>


                  <p
                    style={{
                      margin: "0 0 18px",
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Are you sure you want to remove
                    {" "}
                    <strong>
                      {
                        displayValue(
                          staffPendingDelete.staffName,
                          "this staff member"
                        )
                      }
                    </strong>
                    {" "}
                    from the active staff list?
                  </p>


                  <div
                    style={{
                      padding: "14px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      textAlign: "left"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      <strong>
                        Staff ID:
                      </strong>
                      {" "}
                      {
                        displayValue(
                          staffPendingDelete.staffId
                        )
                      }
                    </p>


                    <p
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      <strong>
                        Position:
                      </strong>
                      {" "}
                      {
                        displayValue(
                          staffPendingDelete.position
                        )
                      }
                    </p>


                    <p
                      style={{
                        margin: 0
                      }}
                    >
                      <strong>
                        Department:
                      </strong>
                      {" "}
                      {
                        displayValue(
                          staffPendingDelete.department
                        )
                      }
                    </p>

                  </div>


                  <p
                    style={{
                      margin: "0 0 20px",
                      color: "#b45309",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                  >
                    The record will be hidden from the active staff list instead of being permanently deleted.
                  </p>


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
                        cancelDeleteStaff
                      }
                      disabled={
                        isDeleting
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      onClick={
                        confirmDeleteStaff
                      }
                      disabled={
                        isDeleting
                      }
                      style={{
                        background: "#dc2626",
                        color: "#ffffff",
                        minWidth: "160px"
                      }}
                    >
                      {
                        isDeleting
                          ?
                          "⏳ Removing..."
                          :
                          "🗑 Yes, Remove Staff"
                      }
                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            BULK DELETE CONFIRMATION
        ====================================================== */}

        {
          showBulkDeleteConfirmation &&
          selectedStaffIds.length > 0 && (

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
                  maxWidth: "580px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                <div
                  style={{
                    textAlign: "center"
                  }}
                >

                  <div
                    style={{
                      fontSize: "52px",
                      marginBottom: "12px"
                    }}
                  >
                    🗑
                  </div>


                  <h2
                    style={{
                      margin: "0 0 10px"
                    }}
                  >
                    Remove Selected Staff?
                  </h2>


                  <p
                    style={{
                      margin: "0 0 18px",
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    You selected
                    {" "}
                    <strong>
                      {
                        selectedStaffIds.length
                      }
                    </strong>
                    {" "}
                    {
                      selectedStaffIds.length === 1
                        ?
                        "staff record"
                        :
                        "staff records"
                    }
                    {" "}
                    for removal.
                  </p>


                  {/* ==============================================
                      SELECTED STAFF PREVIEW
                  ============================================== */}

                  <div
                    style={{
                      maxHeight: "240px",
                      overflowY: "auto",
                      marginBottom: "20px",
                      textAlign: "left"
                    }}
                  >

                    {
                      selectedStaffRecords.map(
                        (
                          member
                        ) => (

                          <div
                            key={
                              member.id
                            }
                            style={{
                              padding: "12px",
                              marginBottom: "8px",
                              borderRadius: "10px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0"
                            }}
                          >

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
                                margin: "5px 0 0",
                                color: "#64748b",
                                fontSize: "13px"
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

                        )
                      )
                    }

                  </div>


                  <div
                    style={{
                      padding: "14px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      background: "#fef3c7",
                      color: "#92400e",
                      textAlign: "left"
                    }}
                  >
                    ⚠️ These records will be removed from the active staff list but will not be permanently deleted from the database.
                  </div>


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
                        cancelBulkDelete
                      }
                      disabled={
                        isBulkDeleting
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      onClick={
                        confirmBulkDelete
                      }
                      disabled={
                        isBulkDeleting
                      }
                      style={{
                        background: "#dc2626",
                        color: "#ffffff",
                        minWidth: "190px"
                      }}
                    >
                      {
                        isBulkDeleting
                          ?
                          "⏳ Removing Staff..."
                          :
                          `🗑 Remove ${selectedStaffIds.length} ${
                            selectedStaffIds.length === 1
                              ?
                              "Staff Record"
                              :
                              "Staff Records"
                          }`
                      }
                    </button>

                  </div>

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

export default StaffList;
        