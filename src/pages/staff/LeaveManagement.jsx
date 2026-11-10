import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function LeaveManagement() {

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const searchInputRef =
    useRef(null);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  const [
    leaveRequests,
    setLeaveRequests
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
    leaveTypeFilter,
    setLeaveTypeFilter
  ] = useState("All");


  const [
    staffFilter,
    setStaffFilter
  ] = useState("All");


  const [
    monthFilter,
    setMonthFilter
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
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    isUpdatingStatus,
    setIsUpdatingStatus
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
  // LEAVE FORM STATES
  // ============================================================

  const [
    selectedStaffId,
    setSelectedStaffId
  ] = useState("");


  const [
    leaveType,
    setLeaveType
  ] = useState("Casual Leave");


  const [
    fromDate,
    setFromDate
  ] = useState("");


  const [
    toDate,
    setToDate
  ] = useState("");


  const [
    leaveReason,
    setLeaveReason
  ] = useState("");


  const [
    emergencyContact,
    setEmergencyContact
  ] = useState("");


  const [
    leaveStatus,
    setLeaveStatus
  ] = useState("Pending");


  // ============================================================
  // FORM / EDITOR STATES
  // ============================================================

  const [
    showLeaveForm,
    setShowLeaveForm
  ] = useState(false);


  const [
    editingLeaveRequest,
    setEditingLeaveRequest
  ] = useState(null);


  const [
    showSaveConfirmation,
    setShowSaveConfirmation
  ] = useState(false);


  // ============================================================
  // LEAVE DETAILS STATES
  // ============================================================

  const [
    selectedLeaveRequest,
    setSelectedLeaveRequest
  ] = useState(null);


  const [
    showLeaveDetails,
    setShowLeaveDetails
  ] = useState(false);


  // ============================================================
  // STATUS CONFIRMATION STATES
  // ============================================================

  const [
    leaveRequestForStatus,
    setLeaveRequestForStatus
  ] = useState(null);


  const [
    requestedStatus,
    setRequestedStatus
  ] = useState("");


  const [
    showStatusConfirmation,
    setShowStatusConfirmation
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    leaveRequestToDelete,
    setLeaveRequestToDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


  // ============================================================
  // LEAVE TYPES
  // ============================================================

  const leaveTypes =
    useMemo(
      () => [

        "Casual Leave",

        "Sick Leave",

        "Emergency Leave",

        "Annual Leave",

        "Medical Leave",

        "Maternity Leave",

        "Paternity Leave",

        "Unpaid Leave",

        "Other Leave"

      ],
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
  // ACTIVE STAFF
  // ============================================================

  const activeStaff =
    useMemo(
      () => {

        return staff
          .filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) === "Active"
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

      },
      [
        staff
      ]
    );


  // ============================================================
  // SELECTED STAFF
  // ============================================================

  const selectedStaff =
    useMemo(
      () => {

        return staff.find(
          (
            member
          ) =>
            member.id ===
            selectedStaffId
        ) || null;

      },
      [
        staff,
        selectedStaffId
      ]
    );


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "Not Available";

      }


      const dateParts =
        String(
          dateValue
        ).split("-");


      if (
        dateParts.length !== 3
      ) {

        return dateValue;

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

        return dateValue;

      }


      return date.toLocaleDateString(
        "en-IN",
        {
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
  // CALCULATE TOTAL LEAVE DAYS
  // ============================================================

  const calculateLeaveDays =
    (
      startDate,
      endDate
    ) => {

      if (
        !startDate ||
        !endDate
      ) {

        return 0;

      }


      const start =
        new Date(
          `${startDate}T00:00:00`
        );


      const end =
        new Date(
          `${endDate}T00:00:00`
        );


      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        ) ||
        end < start
      ) {

        return 0;

      }


      const difference =
        end.getTime() -
        start.getTime();


      return (
        Math.floor(
          difference /
          (
            1000 *
            60 *
            60 *
            24
          )
        ) + 1
      );

    };


  // ============================================================
  // TOTAL FORM LEAVE DAYS
  // ============================================================

  const totalLeaveDays =
    useMemo(
      () => {

        return calculateLeaveDays(
          fromDate,
          toDate
        );

      },
      [
        fromDate,
        toDate
      ]
    );


  // ============================================================
  // GET LEAVE STATUS BACKGROUND
  // ============================================================

  const getLeaveStatusBackground =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Approved":

          return "#dcfce7";


        case "Rejected":

          return "#fee2e2";


        case "Pending":

          return "#fef3c7";


        default:

          return "#f1f5f9";

      }

    };


  // ============================================================
  // GET LEAVE STATUS COLOR
  // ============================================================

  const getLeaveStatusColor =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Approved":

          return "#15803d";


        case "Rejected":

          return "#b91c1c";


        case "Pending":

          return "#b45309";


        default:

          return "#475569";

      }

    };


  // ============================================================
  // GET LEAVE STATUS ICON
  // ============================================================

  const getLeaveStatusIcon =
    (
      status
    ) => {

      switch (
        status
      ) {

        case "Approved":

          return "✅";


        case "Rejected":

          return "❌";


        case "Pending":

          return "⏳";


        default:

          return "⚪";

      }

    };


  // ============================================================
  // FETCH STAFF AND LEAVE REQUESTS
  // ============================================================

  const fetchLeaveManagementData =
    useCallback(
      async (
        showRefreshState = false
      ) => {

        if (
          showRefreshState
        ) {

          setIsRefreshing(true);

        }
        else {

          setIsLoading(true);

        }


        setErrorMessage("");


        try {

          const [
            staffSnapshot,
            leaveSnapshot
          ] =
            await Promise.all([

              getDocs(
                collection(
                  db,
                  "staff"
                )
              ),

              getDocs(
                collection(
                  db,
                  "staffLeaves"
                )
              )

            ]);


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
                  member.isDeleted !== true
              );


          const leaveList =
            leaveSnapshot.docs.map(
              (
                leaveDocument
              ) => ({

                id:
                  leaveDocument.id,

                ...leaveDocument.data()

              })
            );


          if (
            isMountedRef.current
          ) {

            setStaff(
              staffList
            );

            setLeaveRequests(
              leaveList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading leave management data:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load leave management data. Please check your connection and try again."
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
      []
    );


  // ============================================================
  // LOAD LEAVE MANAGEMENT DATA
  // ============================================================

  useEffect(
    () => {

      fetchLeaveManagementData();

    },
    [
      fetchLeaveManagementData
    ]
  );


  // ============================================================
  // FILTER AND SORT LEAVE REQUESTS
  // ============================================================

  const filteredLeaveRequests =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredRequests =
          leaveRequests.filter(
            (
              leaveRequest
            ) => {

              const matchesSearch =
                !normalizedSearchTerm ||
                [

                  leaveRequest.staffName,

                  leaveRequest.staffId,

                  leaveRequest.mobileNumber,

                  leaveRequest.position,

                  leaveRequest.department,

                  leaveRequest.leaveType,

                  leaveRequest.leaveReason,

                  leaveRequest.emergencyContact,

                  leaveRequest.status

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
                leaveRequest.status ===
                  statusFilter;


              const matchesLeaveType =
                leaveTypeFilter === "All" ||
                leaveRequest.leaveType ===
                  leaveTypeFilter;


              const matchesStaff =
                staffFilter === "All" ||
                leaveRequest.staffDocumentId ===
                  staffFilter;


              const matchesMonth =
                !monthFilter ||
                String(
                  leaveRequest.fromDate || ""
                ).startsWith(
                  monthFilter
                );


              return (

                matchesSearch &&

                matchesStatus &&

                matchesLeaveType &&

                matchesStaff &&

                matchesMonth

              );

            }
          );


        return filteredRequests.sort(
          (
            firstRequest,
            secondRequest
          ) => {

            if (
              sortOption === "oldest"
            ) {

              return String(
                firstRequest.fromDate || ""
              ).localeCompare(
                String(
                  secondRequest.fromDate || ""
                )
              );

            }


            if (
              sortOption === "name-ascending"
            ) {

              return normalizeSearchValue(
                firstRequest.staffName
              ).localeCompare(
                normalizeSearchValue(
                  secondRequest.staffName
                )
              );

            }


            if (
              sortOption === "name-descending"
            ) {

              return normalizeSearchValue(
                secondRequest.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstRequest.staffName
                )
              );

            }


            if (
              sortOption === "days-high"
            ) {

              return (
                Number(
                  secondRequest.totalLeaveDays || 0
                ) -
                Number(
                  firstRequest.totalLeaveDays || 0
                )
              );

            }


            if (
              sortOption === "days-low"
            ) {

              return (
                Number(
                  firstRequest.totalLeaveDays || 0
                ) -
                Number(
                  secondRequest.totalLeaveDays || 0
                )
              );

            }


            return String(
              secondRequest.fromDate || ""
            ).localeCompare(
              String(
                firstRequest.fromDate || ""
              )
            );

          }
        );

      },
      [
        leaveRequests,
        searchTerm,
        statusFilter,
        leaveTypeFilter,
        staffFilter,
        monthFilter,
        sortOption
      ]
    );


  // ============================================================
  // LEAVE STATISTICS
  // ============================================================

  const leaveStatistics =
    useMemo(
      () => {

        const pendingRequests =
          leaveRequests.filter(
            (
              request
            ) =>
              request.status === "Pending"
          );


        const approvedRequests =
          leaveRequests.filter(
            (
              request
            ) =>
              request.status === "Approved"
          );


        const rejectedRequests =
          leaveRequests.filter(
            (
              request
            ) =>
              request.status === "Rejected"
          );


        const approvedLeaveDays =
          approvedRequests.reduce(
            (
              total,
              request
            ) =>
              total +
              Number(
                request.totalLeaveDays || 0
              ),
            0
          );


        return {

          totalRequests:
            leaveRequests.length,

          pendingRequests:
            pendingRequests.length,

          approvedRequests:
            approvedRequests.length,

          rejectedRequests:
            rejectedRequests.length,

          approvedLeaveDays

        };

      },
      [
        leaveRequests
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

          leaveTypeFilter !== "All" ||

          staffFilter !== "All" ||

          monthFilter !== "" ||

          sortOption !== "newest"

        );

      },
      [
        searchTerm,
        statusFilter,
        leaveTypeFilter,
        staffFilter,
        monthFilter,
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

      setLeaveTypeFilter("All");

      setStaffFilter("All");

      setMonthFilter("");

      setSortOption("newest");


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // RESET LEAVE FORM
  // ============================================================

  const resetLeaveForm =
    () => {

      setSelectedStaffId("");

      setLeaveType(
        "Casual Leave"
      );

      setFromDate("");

      setToDate("");

      setLeaveReason("");

      setEmergencyContact("");

      setLeaveStatus("Pending");

      setEditingLeaveRequest(null);

      setShowSaveConfirmation(false);

    };


  // ============================================================
  // OPEN NEW LEAVE FORM
  // ============================================================

  const openNewLeaveForm =
    () => {

      resetLeaveForm();

      setErrorMessage("");

      setSuccessMessage("");

      setShowLeaveForm(true);

    };


  // ============================================================
  // CLOSE LEAVE FORM
  // ============================================================

  const closeLeaveForm =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      resetLeaveForm();

      setShowLeaveForm(false);

    };


  // ============================================================
  // OPEN EDIT LEAVE FORM
  // ============================================================

  const openEditLeaveForm =
    (
      leaveRequest
    ) => {

      if (
        leaveRequest.status !== "Pending"
      ) {

        setErrorMessage(
          "Only pending leave requests can be edited."
        );

        return;

      }


      setEditingLeaveRequest(
        leaveRequest
      );

      setSelectedStaffId(
        leaveRequest.staffDocumentId || ""
      );

      setLeaveType(
        leaveRequest.leaveType ||
        "Casual Leave"
      );

      setFromDate(
        leaveRequest.fromDate ||
        ""
      );

      setToDate(
        leaveRequest.toDate ||
        ""
      );

      setLeaveReason(
        leaveRequest.leaveReason ||
        ""
      );

      setEmergencyContact(
        leaveRequest.emergencyContact ||
        ""
      );

      setLeaveStatus(
        leaveRequest.status ||
        "Pending"
      );

      setErrorMessage("");

      setSuccessMessage("");

      setShowLeaveForm(true);

    };


  // ============================================================
  // REFRESH LEAVE MANAGEMENT
  // ============================================================

  const refreshLeaveManagement =
    async () => {

      await fetchLeaveManagementData(true);

    };
      // ============================================================
  // CHECK OVERLAPPING LEAVE REQUEST
  // ============================================================

  const hasOverlappingLeave =
    () => {

      if (
        !selectedStaffId ||
        !fromDate ||
        !toDate
      ) {

        return false;

      }


      const newStartDate =
        new Date(
          `${fromDate}T00:00:00`
        );


      const newEndDate =
        new Date(
          `${toDate}T00:00:00`
        );


      return leaveRequests.some(
        (
          request
        ) => {

          if (
            editingLeaveRequest &&
            request.id ===
              editingLeaveRequest.id
          ) {

            return false;

          }


          if (
            request.staffDocumentId !==
              selectedStaffId
          ) {

            return false;

          }


          if (
            request.status === "Rejected"
          ) {

            return false;

          }


          const existingStartDate =
            new Date(
              `${request.fromDate}T00:00:00`
            );


          const existingEndDate =
            new Date(
              `${request.toDate}T00:00:00`
            );


          return (

            newStartDate <=
              existingEndDate &&

            newEndDate >=
              existingStartDate

          );

        }
      );

    };


  // ============================================================
  // VALIDATE LEAVE FORM
  // ============================================================

  const validateLeaveForm =
    () => {

      if (
        !selectedStaffId
      ) {

        setErrorMessage(
          "Please select a staff member."
        );

        return false;

      }


      if (
        !selectedStaff
      ) {

        setErrorMessage(
          "The selected staff member could not be found."
        );

        return false;

      }


      if (
        !leaveType
      ) {

        setErrorMessage(
          "Please select a leave type."
        );

        return false;

      }


      if (
        !fromDate
      ) {

        setErrorMessage(
          "Please select the leave start date."
        );

        return false;

      }


      if (
        !toDate
      ) {

        setErrorMessage(
          "Please select the leave end date."
        );

        return false;

      }


      if (
        new Date(
          `${toDate}T00:00:00`
        ) <
        new Date(
          `${fromDate}T00:00:00`
        )
      ) {

        setErrorMessage(
          "Leave end date cannot be earlier than the start date."
        );

        return false;

      }


      if (
        totalLeaveDays <= 0
      ) {

        setErrorMessage(
          "Please select a valid leave date range."
        );

        return false;

      }


      if (
        leaveReason.trim().length < 5
      ) {

        setErrorMessage(
          "Please enter a clear leave reason of at least 5 characters."
        );

        return false;

      }


      if (
        hasOverlappingLeave()
      ) {

        setErrorMessage(
          "This staff member already has a pending or approved leave request that overlaps with the selected dates."
        );

        return false;

      }


      setErrorMessage("");

      return true;

    };


  // ============================================================
  // REQUEST SAVE LEAVE
  // ============================================================

  const requestSaveLeave =
    () => {

      if (
        !validateLeaveForm()
      ) {

        return;

      }


      setShowSaveConfirmation(true);

    };


  // ============================================================
  // CANCEL SAVE LEAVE
  // ============================================================

  const cancelSaveLeave =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setShowSaveConfirmation(false);

    };


  // ============================================================
  // SAVE LEAVE REQUEST TO FIREBASE
  // ============================================================

  const confirmSaveLeave =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      if (
        !validateLeaveForm()
      ) {

        setShowSaveConfirmation(false);

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const leaveData = {

          staffDocumentId:
            selectedStaff.id,

          staffName:
            selectedStaff.staffName || "",

          staffId:
            selectedStaff.staffId || "",

          mobileNumber:
            selectedStaff.mobileNumber || "",

          position:
            selectedStaff.position || "",

          department:
            selectedStaff.department || "",

          leaveType,

          fromDate,

          toDate,

          totalLeaveDays,

          leaveReason:
            leaveReason.trim(),

          emergencyContact:
            emergencyContact.trim(),

          status:
            editingLeaveRequest
              ?
              leaveStatus
              :
              "Pending",

          updatedAt:
            serverTimestamp()

        };


        if (
          editingLeaveRequest
        ) {

          await updateDoc(
            doc(
              db,
              "staffLeaves",
              editingLeaveRequest.id
            ),
            leaveData
          );


          if (
            isMountedRef.current
          ) {

            setSuccessMessage(
              `Leave request for ${selectedStaff.staffName} updated successfully.`
            );

          }

        }
        else {

          await addDoc(
            collection(
              db,
              "staffLeaves"
            ),
            {

              ...leaveData,

              createdAt:
                serverTimestamp()

            }
          );


          if (
            isMountedRef.current
          ) {

            setSuccessMessage(
              `Leave request for ${selectedStaff.staffName} created successfully.`
            );

          }

        }


        if (
          isMountedRef.current
        ) {

          setShowSaveConfirmation(false);

          setShowLeaveForm(false);

          resetLeaveForm();

        }


        await fetchLeaveManagementData();

      }
      catch (
        error
      ) {

        console.error(
          "Error saving leave request:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the leave request. Please check your connection and try again."
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
  // OPEN LEAVE DETAILS
  // ============================================================

  const openLeaveDetails =
    (
      leaveRequest
    ) => {

      setSelectedLeaveRequest(
        leaveRequest
      );

      setShowLeaveDetails(true);


      setTimeout(
        () => {

          document
            .getElementById(
              "leave-request-details"
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
  // CLOSE LEAVE DETAILS
  // ============================================================

  const closeLeaveDetails =
    () => {

      setSelectedLeaveRequest(null);

      setShowLeaveDetails(false);

    };


  // ============================================================
  // REQUEST LEAVE STATUS CHANGE
  // ============================================================

  const requestLeaveStatusChange =
    (
      leaveRequest,
      newStatus
    ) => {

      if (
        newStatus !== "Approved" &&
        newStatus !== "Rejected"
      ) {

        return;

      }


      setLeaveRequestForStatus(
        leaveRequest
      );

      setRequestedStatus(
        newStatus
      );

      setErrorMessage("");

      setSuccessMessage("");

      setShowStatusConfirmation(true);

    };


  // ============================================================
  // CANCEL LEAVE STATUS CHANGE
  // ============================================================

  const cancelLeaveStatusChange =
    () => {

      if (
        isUpdatingStatus
      ) {

        return;

      }


      setLeaveRequestForStatus(null);

      setRequestedStatus("");

      setShowStatusConfirmation(false);

    };


  // ============================================================
  // CONFIRM LEAVE STATUS CHANGE
  // ============================================================

  const confirmLeaveStatusChange =
    async () => {

      if (
        isUpdatingStatus ||
        !leaveRequestForStatus ||
        !requestedStatus
      ) {

        return;

      }


      setIsUpdatingStatus(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await updateDoc(
          doc(
            db,
            "staffLeaves",
            leaveRequestForStatus.id
          ),
          {

            status:
              requestedStatus,

            statusUpdatedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          setLeaveRequests(
            (
              previousRequests
            ) =>
              previousRequests.map(
                (
                  request
                ) => {

                  if (
                    request.id ===
                      leaveRequestForStatus.id
                  ) {

                    return {

                      ...request,

                      status:
                        requestedStatus

                    };

                  }


                  return request;

                }
              )
          );


          if (
            selectedLeaveRequest?.id ===
              leaveRequestForStatus.id
          ) {

            setSelectedLeaveRequest(
              (
                previousRequest
              ) => ({

                ...previousRequest,

                status:
                  requestedStatus

              })
            );

          }


          setSuccessMessage(
            `Leave request for ${leaveRequestForStatus.staffName} ${requestedStatus.toLowerCase()} successfully.`
          );


          setLeaveRequestForStatus(null);

          setRequestedStatus("");

          setShowStatusConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error updating leave status:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to update the leave request status. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsUpdatingStatus(false);

        }

      }

    };


  // ============================================================
  // REQUEST DELETE LEAVE
  // ============================================================

  const requestDeleteLeave =
    (
      leaveRequest
    ) => {

      setLeaveRequestToDelete(
        leaveRequest
      );

      setErrorMessage("");

      setSuccessMessage("");

      setShowDeleteConfirmation(true);

    };


  // ============================================================
  // CANCEL DELETE LEAVE
  // ============================================================

  const cancelDeleteLeave =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setLeaveRequestToDelete(null);

      setShowDeleteConfirmation(false);

    };


  // ============================================================
  // CONFIRM DELETE LEAVE
  // ============================================================

  const confirmDeleteLeave =
    async () => {

      if (
        isDeleting ||
        !leaveRequestToDelete
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
            "staffLeaves",
            leaveRequestToDelete.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setLeaveRequests(
            (
              previousRequests
            ) =>
              previousRequests.filter(
                (
                  request
                ) =>
                  request.id !==
                    leaveRequestToDelete.id
              )
          );


          if (
            selectedLeaveRequest?.id ===
              leaveRequestToDelete.id
          ) {

            setSelectedLeaveRequest(null);

            setShowLeaveDetails(false);

          }


          setSuccessMessage(
            `Leave request for ${leaveRequestToDelete.staffName} deleted successfully.`
          );


          setLeaveRequestToDelete(null);

          setShowDeleteConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting leave request:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the leave request. Please try again."
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
              📅 Staff Leave Management
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Create, review, approve and manage staff leave requests.
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
              onClick={
                refreshLeaveManagement
              }
              disabled={
                isLoading ||
                isRefreshing ||
                isSaving ||
                isUpdatingStatus ||
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


            <button
              type="button"
              className="action-btn view-btn"
              onClick={
                openNewLeaveForm
              }
              disabled={
                isLoading ||
                isSaving ||
                activeStaff.length === 0
              }
            >
              ➕ New Leave Request
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
                  padding: "50px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "14px"
                  }}
                >
                  ⏳
                </div>


                <h2>
                  Loading Leave Management...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff and leave requests are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            LEAVE MANAGEMENT CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  LEAVE STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                {
                  [

                    [
                      "📋",
                      "Total Requests",
                      leaveStatistics.totalRequests,
                      "#475569"
                    ],

                    [
                      "⏳",
                      "Pending",
                      leaveStatistics.pendingRequests,
                      "#b45309"
                    ],

                    [
                      "✅",
                      "Approved",
                      leaveStatistics.approvedRequests,
                      "#15803d"
                    ],

                    [
                      "❌",
                      "Rejected",
                      leaveStatistics.rejectedRequests,
                      "#b91c1c"
                    ],

                    [
                      "📅",
                      "Approved Days",
                      leaveStatistics.approvedLeaveDays,
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
                      🔍 Search & Filter Leave Requests
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find leave requests by staff, status, leave type and month.
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
                    Search Leave Requests
                  </label>

                  <input
                    ref={
                      searchInputRef
                    }
                    type="text"
                    placeholder="Search staff name, ID, position, department, leave type, reason or status..."
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
                  />

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Leave Status
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
                    >

                      <option value="All">
                        All Statuses
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                  </div>


                  <div>

                    <label>
                      Leave Type
                    </label>

                    <select
                      value={
                        leaveTypeFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setLeaveTypeFilter(
                            event.target.value
                          )
                      }
                    >

                      <option value="All">
                        All Leave Types
                      </option>

                      {
                        leaveTypes.map(
                          (
                            currentLeaveType
                          ) => (

                            <option
                              key={
                                currentLeaveType
                              }
                              value={
                                currentLeaveType
                              }
                            >
                              {currentLeaveType}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Staff Member
                    </label>

                    <select
                      value={
                        staffFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setStaffFilter(
                            event.target.value
                          )
                      }
                    >

                      <option value="All">
                        All Staff Members
                      </option>

                      {
                        staff.map(
                          (
                            member
                          ) => (

                            <option
                              key={
                                member.id
                              }
                              value={
                                member.id
                              }
                            >
                              {
                                displayValue(
                                  member.staffName,
                                  "Unnamed Staff"
                                )
                              }
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Leave Month
                    </label>

                    <input
                      type="month"
                      value={
                        monthFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setMonthFilter(
                            event.target.value
                          )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Sort Requests
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
                    >

                      <option value="newest">
                        Newest Leave First
                      </option>

                      <option value="oldest">
                        Oldest Leave First
                      </option>

                      <option value="name-ascending">
                        Staff Name A → Z
                      </option>

                      <option value="name-descending">
                        Staff Name Z → A
                      </option>

                      <option value="days-high">
                        Leave Days High → Low
                      </option>

                      <option value="days-low">
                        Leave Days Low → High
                      </option>

                    </select>

                  </div>

                </div>


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
                      {filteredLeaveRequests.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {leaveRequests.length}
                    </strong>
                    {" "}
                    leave requests
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
                leaveRequests.length === 0 &&
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
                        📅
                      </div>

                      <h2>
                        No Leave Requests Available
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Create the first staff leave request to start managing leaves.
                      </p>

                      {
                        activeStaff.length > 0 && (

                          <button
                            type="button"
                            className="action-btn view-btn"
                            onClick={
                              openNewLeaveForm
                            }
                          >
                            ➕ Create Leave Request
                          </button>

                        )
                      }

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                leaveRequests.length > 0 &&
                filteredLeaveRequests.length === 0 && (

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
                        No Matching Leave Requests
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No leave requests match your current search and filters.
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
                  LEAVE REQUEST LIST
              ================================================== */}

              {
                filteredLeaveRequests.length > 0 && (

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
                          📋 Staff Leave Requests
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Review and manage all staff leave applications.
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
                        {filteredLeaveRequests.length} REQUESTS
                      </span>

                    </div>


                    {
                      filteredLeaveRequests.map(
                        (
                          leaveRequest
                        ) => (

                          <div
                            className="student-card"
                            key={
                              leaveRequest.id
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
                                  📅
                                </div>

                                <div>

                                  <h2
                                    className="student-name"
                                    style={{
                                      margin: "0 0 7px"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        leaveRequest.staffName,
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
                                    {
                                      displayValue(
                                        leaveRequest.staffId
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
                                        leaveRequest.position
                                      )
                                    }
                                    {" • "}
                                    {
                                      displayValue(
                                        leaveRequest.department
                                      )
                                    }
                                  </p>

                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#64748b"
                                    }}
                                  >
                                    🏷
                                    {" "}
                                    {
                                      displayValue(
                                        leaveRequest.leaveType
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
                                    getLeaveStatusBackground(
                                      leaveRequest.status
                                    ),
                                  color:
                                    getLeaveStatusColor(
                                      leaveRequest.status
                                    ),
                                  fontSize: "12px",
                                  fontWeight: "800"
                                }}
                              >
                                {
                                  getLeaveStatusIcon(
                                    leaveRequest.status
                                  )
                                }
                                {" "}
                                {
                                  displayValue(
                                    leaveRequest.status
                                  )
                                }
                              </span>

                            </div>


                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: "12px",
                                marginTop: "18px"
                              }}
                            >

                              <div
                                style={{
                                  padding: "13px",
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
                                  FROM DATE
                                </p>

                                <strong>
                                  {
                                    formatDate(
                                      leaveRequest.fromDate
                                    )
                                  }
                                </strong>

                              </div>


                              <div
                                style={{
                                  padding: "13px",
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
                                  TO DATE
                                </p>

                                <strong>
                                  {
                                    formatDate(
                                      leaveRequest.toDate
                                    )
                                  }
                                </strong>

                              </div>


                              <div
                                style={{
                                  padding: "13px",
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
                                  TOTAL DAYS
                                </p>

                                <strong
                                  style={{
                                    color: "#2563eb"
                                  }}
                                >
                                  {
                                    Number(
                                      leaveRequest.totalLeaveDays || 0
                                    )
                                  }
                                  {" "}
                                  Days
                                </strong>

                              </div>

                            </div>


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
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                LEAVE REASON
                              </p>

                              <p
                                style={{
                                  margin: 0,
                                  lineHeight: "1.6"
                                }}
                              >
                                {
                                  displayValue(
                                    leaveRequest.leaveReason
                                  )
                                }
                              </p>

                            </div>


                            <div
                              className="student-actions"
                              style={{
                                marginTop: "18px"
                              }}
                            >

                              <button
                                type="button"
                                className="action-btn view-btn"
                                onClick={
                                  () =>
                                    openLeaveDetails(
                                      leaveRequest
                                    )
                                }
                              >
                                👁 View
                              </button>


                              {
                                leaveRequest.status === "Pending" && (

                                  <>

                                    <button
                                      type="button"
                                      className="action-btn edit-btn"
                                      onClick={
                                        () =>
                                          openEditLeaveForm(
                                            leaveRequest
                                          )
                                      }
                                    >
                                      ✏ Edit
                                    </button>


                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          requestLeaveStatusChange(
                                            leaveRequest,
                                            "Approved"
                                          )
                                      }
                                    >
                                      ✅ Approve
                                    </button>


                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          requestLeaveStatusChange(
                                            leaveRequest,
                                            "Rejected"
                                          )
                                      }
                                    >
                                      ❌ Reject
                                    </button>

                                  </>

                                )
                              }


                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={
                                  () =>
                                    requestDeleteLeave(
                                      leaveRequest
                                    )
                                }
                              >
                                🗑 Delete
                              </button>

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
              }


              {/* ==================================================
                  LEAVE DETAILS SECTION
              ================================================== */}

              {
                showLeaveDetails &&
                selectedLeaveRequest && (

                  <div
                    id="leave-request-details"
                    className="section-card"
                    style={{
                      marginTop: "24px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                        marginBottom: "22px"
                      }}
                    >

                      <div>

                        <h2
                          style={{
                            margin: "0 0 6px"
                          }}
                        >
                          👁 Leave Request Details
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete information for the selected leave request.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          closeLeaveDetails
                        }
                      >
                        ✖ Close Details
                      </button>

                    </div>


                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                        padding: "16px",
                        marginBottom: "18px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <div>

                        <h2
                          style={{
                            margin: "0 0 7px"
                          }}
                        >
                          {
                            displayValue(
                              selectedLeaveRequest.staffName,
                              "Unnamed Staff"
                            )
                          }
                        </h2>

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
                              selectedLeaveRequest.staffId
                            )
                          }
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          💼
                          {" "}
                          {
                            displayValue(
                              selectedLeaveRequest.position
                            )
                          }
                          {" • "}
                          {
                            displayValue(
                              selectedLeaveRequest.department
                            )
                          }
                        </p>

                      </div>


                      <span
                        style={{
                          padding: "7px 13px",
                          borderRadius: "999px",
                          background:
                            getLeaveStatusBackground(
                              selectedLeaveRequest.status
                            ),
                          color:
                            getLeaveStatusColor(
                              selectedLeaveRequest.status
                            ),
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          getLeaveStatusIcon(
                            selectedLeaveRequest.status
                          )
                        }
                        {" "}
                        {
                          selectedLeaveRequest.status
                        }
                      </span>

                    </div>


                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "12px",
                        marginBottom: "18px"
                      }}
                    >

                      {
                        [

                          [
                            "LEAVE TYPE",
                            selectedLeaveRequest.leaveType
                          ],

                          [
                            "FROM DATE",
                            formatDate(
                              selectedLeaveRequest.fromDate
                            )
                          ],

                          [
                            "TO DATE",
                            formatDate(
                              selectedLeaveRequest.toDate
                            )
                          ],

                          [
                            "TOTAL LEAVE DAYS",
                            `${selectedLeaveRequest.totalLeaveDays || 0} Days`
                          ],

                          [
                            "EMERGENCY CONTACT",
                            selectedLeaveRequest.emergencyContact
                          ],

                          [
                            "CREATED AT",
                            formatTimestamp(
                              selectedLeaveRequest.createdAt
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

                              <p
                                style={{
                                  margin: "0 0 6px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                {label}
                              </p>

                              <strong>
                                {
                                  displayValue(
                                    value
                                  )
                                }
                              </strong>

                            </div>

                          )
                        )
                      }

                    </div>


                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <p
                        style={{
                          margin: "0 0 7px",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}
                      >
                        COMPLETE LEAVE REASON
                      </p>

                      <p
                        style={{
                          margin: 0,
                          lineHeight: "1.7"
                        }}
                      >
                        {
                          displayValue(
                            selectedLeaveRequest.leaveReason
                          )
                        }
                      </p>

                    </div>

                  </div>

                )
              }

            </>

          )
        }
                {/* ======================================================
            NEW / EDIT LEAVE REQUEST POPUP
        ====================================================== */}

        {
          showLeaveForm && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9997,
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
                  maxWidth: "760px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                {/* ================================================
                    FORM HEADER
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "22px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      {
                        editingLeaveRequest
                          ?
                          "✏ Edit Leave Request"
                          :
                          "➕ New Leave Request"
                      }
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      {
                        editingLeaveRequest
                          ?
                          "Update the pending staff leave request."
                          :
                          "Create a new leave request for a staff member."
                      }
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={
                      closeLeaveForm
                    }
                    disabled={
                      isSaving
                    }
                  >
                    ✖ Close
                  </button>

                </div>


                {/* ================================================
                    STAFF SELECTION
                ================================================ */}

                <div
                  style={{
                    marginBottom: "20px"
                  }}
                >

                  <label>
                    Select Staff Member *
                  </label>


                  <select
                    value={
                      selectedStaffId
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setSelectedStaffId(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving ||
                      Boolean(
                        editingLeaveRequest
                      )
                    }
                  >

                    <option value="">
                      Select Staff Member
                    </option>


                    {
                      activeStaff.map(
                        (
                          member
                        ) => (

                          <option
                            key={
                              member.id
                            }
                            value={
                              member.id
                            }
                          >
                            {
                              displayValue(
                                member.staffName,
                                "Unnamed Staff"
                              )
                            }
                            {" — "}
                            {
                              displayValue(
                                member.staffId,
                                "No Staff ID"
                              )
                            }
                          </option>

                        )
                      )
                    }

                  </select>

                </div>


                {/* ================================================
                    SELECTED STAFF INFORMATION
                ================================================ */}

                {
                  selectedStaff && (

                    <div
                      style={{
                        padding: "16px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px"
                        }}
                      >

                        <div
                          style={{
                            width: "58px",
                            height: "58px",
                            minWidth: "58px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            background: "#e2e8f0",
                            fontSize: "28px"
                          }}
                        >
                          👳
                        </div>


                        <div>

                          <h3
                            style={{
                              margin: "0 0 6px"
                            }}
                          >
                            {
                              displayValue(
                                selectedStaff.staffName,
                                "Unnamed Staff"
                              )
                            }
                          </h3>


                          <p
                            style={{
                              margin: "0 0 4px",
                              color: "#64748b"
                            }}
                          >
                            🪪 Staff ID:
                            {" "}
                            {
                              displayValue(
                                selectedStaff.staffId
                              )
                            }
                          </p>


                          <p
                            style={{
                              margin: "0 0 4px",
                              color: "#64748b"
                            }}
                          >
                            💼
                            {" "}
                            {
                              displayValue(
                                selectedStaff.position
                              )
                            }
                            {" • "}
                            {
                              displayValue(
                                selectedStaff.department
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
                                selectedStaff.mobileNumber
                              )
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  )
                }


                {/* ================================================
                    LEAVE TYPE
                ================================================ */}

                <div
                  style={{
                    marginBottom: "20px"
                  }}
                >

                  <label>
                    Leave Type *
                  </label>


                  <select
                    value={
                      leaveType
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setLeaveType(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving
                    }
                  >

                    {
                      leaveTypes.map(
                        (
                          currentLeaveType
                        ) => (

                          <option
                            key={
                              currentLeaveType
                            }
                            value={
                              currentLeaveType
                            }
                          >
                            {currentLeaveType}
                          </option>

                        )
                      )
                    }

                  </select>

                </div>


                {/* ================================================
                    LEAVE DATE RANGE
                ================================================ */}

                <div className="form-grid">

                  <div>

                    <label>
                      From Date *
                    </label>


                    <input
                      type="date"
                      value={
                        fromDate
                      }
                      onChange={
                        (
                          event
                        ) => {

                          const newFromDate =
                            event.target.value;


                          setFromDate(
                            newFromDate
                          );


                          if (
                            toDate &&
                            new Date(
                              `${toDate}T00:00:00`
                            ) <
                            new Date(
                              `${newFromDate}T00:00:00`
                            )
                          ) {

                            setToDate("");

                          }

                        }
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>


                  <div>

                    <label>
                      To Date *
                    </label>


                    <input
                      type="date"
                      value={
                        toDate
                      }
                      min={
                        fromDate ||
                        undefined
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setToDate(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving ||
                        !fromDate
                      }
                    />

                  </div>

                </div>


                {/* ================================================
                    TOTAL LEAVE DAYS
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginTop: "18px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background:
                      totalLeaveDays > 0
                        ?
                        "#eff6ff"
                        :
                        "#f8fafc",
                    border:
                      totalLeaveDays > 0
                        ?
                        "1px solid #bfdbfe"
                        :
                        "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    TOTAL LEAVE DURATION
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color:
                        totalLeaveDays > 0
                          ?
                          "#2563eb"
                          :
                          "#64748b"
                    }}
                  >
                    📅
                    {" "}
                    {totalLeaveDays}
                    {" "}
                    {
                      totalLeaveDays === 1
                        ?
                        "Day"
                        :
                        "Days"
                    }
                  </h2>

                </div>


                {/* ================================================
                    LEAVE REASON
                ================================================ */}

                <div
                  style={{
                    marginBottom: "20px"
                  }}
                >

                  <label>
                    Leave Reason *
                  </label>


                  <textarea
                    placeholder="Enter the reason for requesting leave..."
                    value={
                      leaveReason
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setLeaveReason(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving
                    }
                    rows="5"
                    style={{
                      width: "100%",
                      resize: "vertical"
                    }}
                  />


                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b",
                      fontSize: "12px"
                    }}
                  >
                    Minimum 5 characters required.
                  </p>

                </div>


                {/* ================================================
                    EMERGENCY CONTACT
                ================================================ */}

                <div
                  style={{
                    marginBottom: "20px"
                  }}
                >

                  <label>
                    Emergency Contact
                  </label>


                  <input
                    type="text"
                    placeholder="Enter emergency contact number"
                    value={
                      emergencyContact
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setEmergencyContact(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving
                    }
                  />

                </div>


                {/* ================================================
                    EDITING STATUS INFORMATION
                ================================================ */}

                {
                  editingLeaveRequest && (

                    <div
                      style={{
                        padding: "14px 16px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        color: "#92400e",
                        lineHeight: "1.6"
                      }}
                    >
                      ℹ️
                      {" "}
                      This request currently has
                      {" "}
                      <strong>
                        {leaveStatus}
                      </strong>
                      {" "}
                      status. Only pending requests can be edited.
                    </div>

                  )
                }


                {/* ================================================
                    OVERLAP INFORMATION
                ================================================ */}

                {
                  selectedStaffId &&
                  fromDate &&
                  toDate &&
                  hasOverlappingLeave() && (

                    <div
                      style={{
                        padding: "14px 16px",
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
                      This staff member already has a pending or approved leave request overlapping with the selected dates.
                    </div>

                  )
                }


                {/* ================================================
                    FORM SUMMARY
                ================================================ */}

                {
                  selectedStaff &&
                  fromDate &&
                  toDate &&
                  totalLeaveDays > 0 && (

                    <div
                      style={{
                        padding: "16px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0"
                      }}
                    >

                      <h3
                        style={{
                          margin: "0 0 10px",
                          color: "#15803d"
                        }}
                      >
                        📋 Leave Request Summary
                      </h3>


                      <p
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        <strong>
                          Staff:
                        </strong>
                        {" "}
                        {
                          displayValue(
                            selectedStaff.staffName
                          )
                        }
                      </p>


                      <p
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        <strong>
                          Leave Type:
                        </strong>
                        {" "}
                        {leaveType}
                      </p>


                      <p
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        <strong>
                          Duration:
                        </strong>
                        {" "}
                        {
                          formatDate(
                            fromDate
                          )
                        }
                        {" → "}
                        {
                          formatDate(
                            toDate
                          )
                        }
                      </p>


                      <p
                        style={{
                          margin: 0
                        }}
                      >
                        <strong>
                          Total:
                        </strong>
                        {" "}
                        {totalLeaveDays}
                        {" "}
                        {
                          totalLeaveDays === 1
                            ?
                            "Day"
                            :
                            "Days"
                        }
                      </p>

                    </div>

                  )
                }


                {/* ================================================
                    FORM ACTIONS
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    paddingTop: "20px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    {
                      editingLeaveRequest
                        ?
                        "Review the updated leave details before saving."
                        :
                        "New leave requests are created with Pending status."
                    }
                  </p>


                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}
                  >

                    <button
                      type="button"
                      onClick={
                        closeLeaveForm
                      }
                      disabled={
                        isSaving
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      className="action-btn view-btn"
                      onClick={
                        requestSaveLeave
                      }
                      disabled={
                        isSaving ||
                        !selectedStaffId ||
                        !fromDate ||
                        !toDate ||
                        totalLeaveDays <= 0 ||
                        hasOverlappingLeave()
                      }
                    >
                      {
                        editingLeaveRequest
                          ?
                          "💾 Review Changes"
                          :
                          "💾 Review Leave Request"
                      }
                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        }
                {/* ======================================================
            SAVE CONFIRMATION POPUP
        ====================================================== */}

        {
          showSaveConfirmation &&
          selectedStaff && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.72)"
              }}
            >

              <div
                className="section-card"
                style={{
                  width: "100%",
                  maxWidth: "650px",
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
                    📅
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    {
                      editingLeaveRequest
                        ?
                        "Confirm Leave Changes"
                        :
                        "Confirm Leave Request"
                    }
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the leave information carefully before saving it to the database.
                  </p>

                </div>


                {/* ================================================
                    STAFF INFORMATION
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
                      alignItems: "center",
                      gap: "14px"
                    }}
                  >

                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        minWidth: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        fontSize: "30px"
                      }}
                    >
                      👳
                    </div>


                    <div>

                      <h3
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        {
                          displayValue(
                            selectedStaff.staffName,
                            "Unnamed Staff"
                          )
                        }
                      </h3>


                      <p
                        style={{
                          margin: "0 0 4px",
                          color: "#64748b"
                        }}
                      >
                        🪪 Staff ID:
                        {" "}
                        {
                          displayValue(
                            selectedStaff.staffId
                          )
                        }
                      </p>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        💼
                        {" "}
                        {
                          displayValue(
                            selectedStaff.position
                          )
                        }
                        {" • "}
                        {
                          displayValue(
                            selectedStaff.department
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ================================================
                    LEAVE SUMMARY
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
                      padding: "14px",
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
                      LEAVE TYPE
                    </p>


                    <strong>
                      {leaveType}
                    </strong>

                  </div>


                  <div
                    style={{
                      padding: "14px",
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
                      FROM DATE
                    </p>


                    <strong>
                      {
                        formatDate(
                          fromDate
                        )
                      }
                    </strong>

                  </div>


                  <div
                    style={{
                      padding: "14px",
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
                      TO DATE
                    </p>


                    <strong>
                      {
                        formatDate(
                          toDate
                        )
                      }
                    </strong>

                  </div>


                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#1d4ed8",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      TOTAL LEAVE DAYS
                    </p>


                    <strong
                      style={{
                        color: "#2563eb"
                      }}
                    >
                      📅
                      {" "}
                      {totalLeaveDays}
                      {" "}
                      {
                        totalLeaveDays === 1
                          ?
                          "Day"
                          :
                          "Days"
                      }
                    </strong>

                  </div>

                </div>


                {/* ================================================
                    LEAVE REASON
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    LEAVE REASON
                  </p>


                  <p
                    style={{
                      margin: 0,
                      lineHeight: "1.7"
                    }}
                  >
                    {
                      displayValue(
                        leaveReason
                      )
                    }
                  </p>

                </div>


                {/* ================================================
                    EMERGENCY CONTACT
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    EMERGENCY CONTACT
                  </p>


                  <strong>
                    {
                      displayValue(
                        emergencyContact
                      )
                    }
                  </strong>

                </div>


                {/* ================================================
                    STATUS INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    lineHeight: "1.6"
                  }}
                >
                  ℹ️
                  {" "}
                  {
                    editingLeaveRequest
                      ?
                      (
                        <>
                          This request will remain
                          {" "}
                          <strong>
                            {leaveStatus}
                          </strong>
                          {" "}
                          after the changes are saved.
                        </>
                      )
                      :
                      (
                        <>
                          This leave request will be created with
                          {" "}
                          <strong>
                            Pending
                          </strong>
                          {" "}
                          status and can be approved or rejected later.
                        </>
                      )
                  }
                </div>


                {/* ================================================
                    DATABASE INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1e40af",
                    lineHeight: "1.6"
                  }}
                >
                  🔥
                  {" "}
                  <strong>
                    Firebase Save:
                  </strong>
                  {" "}
                  {
                    editingLeaveRequest
                      ?
                      "The existing staff leave document will be updated."
                      :
                      "A new document will be created in the staffLeaves collection."
                  }
                </div>


                {/* ================================================
                    CONFIRMATION ACTIONS
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
                      cancelSaveLeave
                    }
                    disabled={
                      isSaving
                    }
                  >
                    ← Back to Edit
                  </button>


                  <button
                    type="button"
                    className="action-btn view-btn"
                    onClick={
                      confirmSaveLeave
                    }
                    disabled={
                      isSaving
                    }
                    style={{
                      minWidth: "220px"
                    }}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Saving Leave..."
                        :
                        editingLeaveRequest
                          ?
                          "💾 Confirm & Update"
                          :
                          "💾 Confirm & Create"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }
                {/* ======================================================
            APPROVE / REJECT CONFIRMATION POPUP
        ====================================================== */}

        {
          showStatusConfirmation &&
          leaveRequestForStatus &&
          requestedStatus && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.72)"
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
                    STATUS CONFIRMATION HEADER
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
                    {
                      requestedStatus === "Approved"
                        ?
                        "✅"
                        :
                        "❌"
                    }
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    {
                      requestedStatus === "Approved"
                        ?
                        "Approve Leave Request?"
                        :
                        "Reject Leave Request?"
                    }
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the leave request before confirming the status change.
                  </p>

                </div>


                {/* ================================================
                    STAFF INFORMATION
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

                  <h3
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    {
                      displayValue(
                        leaveRequestForStatus.staffName,
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
                        leaveRequestForStatus.staffId
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748b"
                    }}
                  >
                    🏷 Leave Type:
                    {" "}
                    {
                      displayValue(
                        leaveRequestForStatus.leaveType
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748b"
                    }}
                  >
                    📅
                    {" "}
                    {
                      formatDate(
                        leaveRequestForStatus.fromDate
                      )
                    }
                    {" → "}
                    {
                      formatDate(
                        leaveRequestForStatus.toDate
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    ⏱
                    {" "}
                    {
                      Number(
                        leaveRequestForStatus.totalLeaveDays || 0
                      )
                    }
                    {" "}
                    Days
                  </p>

                </div>


                {/* ================================================
                    STATUS CHANGE
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <span
                    style={{
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background:
                        getLeaveStatusBackground(
                          leaveRequestForStatus.status
                        ),
                      color:
                        getLeaveStatusColor(
                          leaveRequestForStatus.status
                        ),
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      getLeaveStatusIcon(
                        leaveRequestForStatus.status
                      )
                    }
                    {" "}
                    {
                      leaveRequestForStatus.status
                    }
                  </span>


                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "22px"
                    }}
                  >
                    →
                  </span>


                  <span
                    style={{
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background:
                        getLeaveStatusBackground(
                          requestedStatus
                        ),
                      color:
                        getLeaveStatusColor(
                          requestedStatus
                        ),
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      getLeaveStatusIcon(
                        requestedStatus
                      )
                    }
                    {" "}
                    {requestedStatus}
                  </span>

                </div>


                {/* ================================================
                    STATUS WARNING
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background:
                      requestedStatus === "Approved"
                        ?
                        "#f0fdf4"
                        :
                        "#fef2f2",
                    border:
                      requestedStatus === "Approved"
                        ?
                        "1px solid #bbf7d0"
                        :
                        "1px solid #fecaca",
                    color:
                      requestedStatus === "Approved"
                        ?
                        "#15803d"
                        :
                        "#b91c1c",
                    lineHeight: "1.6"
                  }}
                >
                  {
                    requestedStatus === "Approved"
                      ?
                      (
                        <>
                          ✅
                          {" "}
                          Confirming will approve this staff leave request.
                        </>
                      )
                      :
                      (
                        <>
                          ⚠️
                          {" "}
                          Confirming will reject this staff leave request.
                        </>
                      )
                  }
                </div>


                {/* ================================================
                    STATUS ACTIONS
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
                      cancelLeaveStatusChange
                    }
                    disabled={
                      isUpdatingStatus
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      confirmLeaveStatusChange
                    }
                    disabled={
                      isUpdatingStatus
                    }
                    style={{
                      minWidth: "210px"
                    }}
                  >
                    {
                      isUpdatingStatus
                        ?
                        "⏳ Updating Status..."
                        :
                        requestedStatus === "Approved"
                          ?
                          "✅ Confirm Approval"
                          :
                          "❌ Confirm Rejection"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            DELETE CONFIRMATION POPUP
        ====================================================== */}

        {
          showDeleteConfirmation &&
          leaveRequestToDelete && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.75)"
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

                {/* ================================================
                    DELETE HEADER
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
                    🗑️
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px",
                      color: "#b91c1c"
                    }}
                  >
                    Delete Leave Request?
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    This action will permanently remove the leave request from the database.
                  </p>

                </div>


                {/* ================================================
                    DELETE REQUEST INFORMATION
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

                  <h3
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    {
                      displayValue(
                        leaveRequestToDelete.staffName,
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
                        leaveRequestToDelete.staffId
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748b"
                    }}
                  >
                    🏷 Leave Type:
                    {" "}
                    {
                      displayValue(
                        leaveRequestToDelete.leaveType
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748b"
                    }}
                  >
                    📅
                    {" "}
                    {
                      formatDate(
                        leaveRequestToDelete.fromDate
                      )
                    }
                    {" → "}
                    {
                      formatDate(
                        leaveRequestToDelete.toDate
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Status:
                    {" "}
                    <strong
                      style={{
                        color:
                          getLeaveStatusColor(
                            leaveRequestToDelete.status
                          )
                      }}
                    >
                      {
                        getLeaveStatusIcon(
                          leaveRequestToDelete.status
                        )
                      }
                      {" "}
                      {
                        displayValue(
                          leaveRequestToDelete.status
                        )
                      }
                    </strong>
                  </p>

                </div>


                {/* ================================================
                    PERMANENT DELETE WARNING
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
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
                    Permanent Delete:
                  </strong>
                  {" "}
                  This leave request cannot be recovered after deletion.
                </div>


                {/* ================================================
                    DELETE ACTIONS
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
                      cancelDeleteLeave
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    Keep Request
                  </button>


                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={
                      confirmDeleteLeave
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      minWidth: "210px"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting Request..."
                        :
                        "🗑 Confirm Delete"
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

export default LeaveManagement;