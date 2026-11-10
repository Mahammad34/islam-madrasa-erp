import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch
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

function StaffNotifications() {

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
    notifications,
    setNotifications
  ] = useState([]);


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    typeFilter,
    setTypeFilter
  ] = useState("All");


  const [
    priorityFilter,
    setPriorityFilter
  ] = useState("All");


  const [
    readFilter,
    setReadFilter
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
    isUpdating,
    setIsUpdating
  ] = useState(false);


  const [
    isDeleting,
    setIsDeleting
  ] = useState(false);


  const [
    isMarkingAll,
    setIsMarkingAll
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
  // NOTIFICATION DETAILS STATES
  // ============================================================

  const [
    selectedNotification,
    setSelectedNotification
  ] = useState(null);


  const [
    showNotificationDetails,
    setShowNotificationDetails
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    notificationToDelete,
    setNotificationToDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


  // ============================================================
  // MARK ALL READ CONFIRMATION STATE
  // ============================================================

  const [
    showMarkAllConfirmation,
    setShowMarkAllConfirmation
  ] = useState(false);


  // ============================================================
  // NOTIFICATION TYPES
  // ============================================================

  const notificationTypes =
    useMemo(
      () => [

        "Salary",

        "Leave",

        "Attendance",

        "Role",

        "Staff",

        "General"

      ],
      []
    );


  // ============================================================
  // PRIORITY OPTIONS
  // ============================================================

  const priorityOptions =
    useMemo(
      () => [

        "Low",

        "Normal",

        "High",

        "Urgent"

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
  // GET NOTIFICATION TYPE
  // ============================================================

  const getNotificationType =
    (
      notification
    ) => {

      return (
        notification.type ||
        notification.notificationType ||
        "General"
      );

    };


  // ============================================================
  // GET NOTIFICATION PRIORITY
  // ============================================================

  const getNotificationPriority =
    (
      notification
    ) => {

      return (
        notification.priority ||
        "Normal"
      );

    };


  // ============================================================
  // CHECK NOTIFICATION READ STATUS
  // ============================================================

  const isNotificationRead =
    (
      notification
    ) => {

      return (
        notification.isRead === true ||
        notification.read === true
      );

    };


  // ============================================================
  // GET NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon =
    (
      type
    ) => {

      switch (
        type
      ) {

        case "Salary":

          return "💰";


        case "Leave":

          return "📅";


        case "Attendance":

          return "📋";


        case "Role":

          return "🛡️";


        case "Staff":

          return "👳";


        case "General":

          return "📢";


        default:

          return "🔔";

      }

    };


  // ============================================================
  // GET PRIORITY ICON
  // ============================================================

  const getPriorityIcon =
    (
      priority
    ) => {

      switch (
        priority
      ) {

        case "Urgent":

          return "🚨";


        case "High":

          return "⚠️";


        case "Normal":

          return "🔵";


        case "Low":

          return "⚪";


        default:

          return "🔵";

      }

    };


  // ============================================================
  // GET PRIORITY BACKGROUND
  // ============================================================

  const getPriorityBackground =
    (
      priority
    ) => {

      switch (
        priority
      ) {

        case "Urgent":

          return "#fee2e2";


        case "High":

          return "#fef3c7";


        case "Normal":

          return "#dbeafe";


        case "Low":

          return "#f1f5f9";


        default:

          return "#f1f5f9";

      }

    };


  // ============================================================
  // GET PRIORITY COLOR
  // ============================================================

  const getPriorityColor =
    (
      priority
    ) => {

      switch (
        priority
      ) {

        case "Urgent":

          return "#b91c1c";


        case "High":

          return "#b45309";


        case "Normal":

          return "#1d4ed8";


        case "Low":

          return "#475569";


        default:

          return "#475569";

      }

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
  // GET TIMESTAMP MILLISECONDS
  // ============================================================

  const getTimestampMilliseconds =
    (
      timestamp
    ) => {

      if (
        !timestamp
      ) {

        return 0;

      }


      try {

        if (
          typeof timestamp.toMillis ===
          "function"
        ) {

          return timestamp.toMillis();

        }


        if (
          typeof timestamp.toDate ===
          "function"
        ) {

          return timestamp
            .toDate()
            .getTime();

        }


        if (
          timestamp.seconds
        ) {

          return (
            timestamp.seconds *
            1000
          );

        }


        const date =
          new Date(
            timestamp
          );


        return Number.isNaN(
          date.getTime()
        )
          ?
          0
          :
          date.getTime();

      }
      catch (
        error
      ) {

        return 0;

      }

    };


  // ============================================================
  // GET NOTIFICATION DATE VALUE
  // ============================================================

  const getNotificationDateValue =
    (
      notification
    ) => {

      return (

        notification.createdAt ||

        notification.timestamp ||

        notification.updatedAt ||

        null

      );

    };


  // ============================================================
  // GET NOTIFICATION MONTH
  // ============================================================

  const getNotificationMonth =
    (
      notification
    ) => {

      const timestamp =
        getNotificationDateValue(
          notification
        );


      if (
        !timestamp
      ) {

        return "";

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

          return "";

        }


        const year =
          date.getFullYear();


        const month =
          String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        return `${year}-${month}`;

      }
      catch (
        error
      ) {

        return "";

      }

    };


  // ============================================================
  // FETCH STAFF NOTIFICATIONS
  // ============================================================

  const fetchStaffNotifications =
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

          const querySnapshot =
            await getDocs(
              collection(
                db,
                "staffNotifications"
              )
            );


          const notificationList =
            querySnapshot.docs
              .map(
                (
                  notificationDocument
                ) => ({

                  id:
                    notificationDocument.id,

                  ...notificationDocument.data()

                })
              )
              .filter(
                (
                  notification
                ) =>
                  notification.isDeleted !== true
              );


          if (
            isMountedRef.current
          ) {

            setNotifications(
              notificationList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff notifications:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff notifications. Please check your connection and try again."
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
  // LOAD STAFF NOTIFICATIONS
  // ============================================================

  useEffect(
    () => {

      fetchStaffNotifications();

    },
    [
      fetchStaffNotifications
    ]
  );


  // ============================================================
  // FILTER AND SORT NOTIFICATIONS
  // ============================================================

  const filteredNotifications =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredList =
          notifications.filter(
            (
              notification
            ) => {

              const notificationType =
                getNotificationType(
                  notification
                );


              const notificationPriority =
                getNotificationPriority(
                  notification
                );


              const notificationRead =
                isNotificationRead(
                  notification
                );


              const matchesSearch =
                !normalizedSearchTerm ||
                [

                  notification.staffName,

                  notification.staffId,

                  notification.title,

                  notification.message,

                  notification.description,

                  notificationType,

                  notificationPriority

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


              const matchesType =
                typeFilter === "All" ||
                notificationType ===
                  typeFilter;


              const matchesPriority =
                priorityFilter === "All" ||
                notificationPriority ===
                  priorityFilter;


              const matchesReadStatus =
                readFilter === "All" ||

                (
                  readFilter === "Read" &&
                  notificationRead
                ) ||

                (
                  readFilter === "Unread" &&
                  !notificationRead
                );


              const matchesMonth =
                !monthFilter ||
                getNotificationMonth(
                  notification
                ) === monthFilter;


              return (

                matchesSearch &&

                matchesType &&

                matchesPriority &&

                matchesReadStatus &&

                matchesMonth

              );

            }
          );


        return filteredList.sort(
          (
            firstNotification,
            secondNotification
          ) => {

            const firstTime =
              getTimestampMilliseconds(
                getNotificationDateValue(
                  firstNotification
                )
              );


            const secondTime =
              getTimestampMilliseconds(
                getNotificationDateValue(
                  secondNotification
                )
              );


            if (
              sortOption === "oldest"
            ) {

              return (
                firstTime -
                secondTime
              );

            }


            if (
              sortOption === "staff-ascending"
            ) {

              return normalizeSearchValue(
                firstNotification.staffName
              ).localeCompare(
                normalizeSearchValue(
                  secondNotification.staffName
                )
              );

            }


            if (
              sortOption === "staff-descending"
            ) {

              return normalizeSearchValue(
                secondNotification.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstNotification.staffName
                )
              );

            }


            if (
              sortOption === "priority-high"
            ) {

              const priorityOrder = {

                Urgent: 4,

                High: 3,

                Normal: 2,

                Low: 1

              };


              return (

                (
                  priorityOrder[
                    getNotificationPriority(
                      secondNotification
                    )
                  ] || 0
                ) -

                (
                  priorityOrder[
                    getNotificationPriority(
                      firstNotification
                    )
                  ] || 0
                )

              );

            }


            return (
              secondTime -
              firstTime
            );

          }
        );

      },
      [
        notifications,
        searchTerm,
        typeFilter,
        priorityFilter,
        readFilter,
        monthFilter,
        sortOption
      ]
    );


  // ============================================================
  // NOTIFICATION STATISTICS
  // ============================================================

  const notificationStatistics =
    useMemo(
      () => {

        const unreadNotifications =
          notifications.filter(
            (
              notification
            ) =>
              !isNotificationRead(
                notification
              )
          );


        const urgentNotifications =
          notifications.filter(
            (
              notification
            ) =>
              getNotificationPriority(
                notification
              ) === "Urgent"
          );


        const salaryNotifications =
          notifications.filter(
            (
              notification
            ) =>
              getNotificationType(
                notification
              ) === "Salary"
          );


        const leaveNotifications =
          notifications.filter(
            (
              notification
            ) =>
              getNotificationType(
                notification
              ) === "Leave"
          );


        return {

          total:
            notifications.length,

          unread:
            unreadNotifications.length,

          read:
            notifications.length -
            unreadNotifications.length,

          urgent:
            urgentNotifications.length,

          salary:
            salaryNotifications.length,

          leave:
            leaveNotifications.length

        };

      },
      [
        notifications
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

          typeFilter !== "All" ||

          priorityFilter !== "All" ||

          readFilter !== "All" ||

          monthFilter !== "" ||

          sortOption !== "newest"

        );

      },
      [
        searchTerm,
        typeFilter,
        priorityFilter,
        readFilter,
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

      setTypeFilter("All");

      setPriorityFilter("All");

      setReadFilter("All");

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
  // REFRESH NOTIFICATIONS
  // ============================================================

  const refreshNotifications =
    async () => {

      await fetchStaffNotifications(true);

    };
      // ============================================================
  // OPEN NOTIFICATION DETAILS
  // ============================================================

  const openNotificationDetails =
    async (
      notification
    ) => {

      setSelectedNotification(
        notification
      );

      setShowNotificationDetails(true);

      setErrorMessage("");

      setSuccessMessage("");


      // Automatically mark unread notification as read
      if (
        !isNotificationRead(
          notification
        )
      ) {

        try {

          await updateDoc(
            doc(
              db,
              "staffNotifications",
              notification.id
            ),
            {

              isRead: true,

              readAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp()

            }
          );


          if (
            isMountedRef.current
          ) {

            setNotifications(
              (
                previousNotifications
              ) =>
                previousNotifications.map(
                  (
                    currentNotification
                  ) => {

                    if (
                      currentNotification.id ===
                      notification.id
                    ) {

                      return {

                        ...currentNotification,

                        isRead: true

                      };

                    }


                    return currentNotification;

                  }
                )
            );


            setSelectedNotification(
              (
                previousNotification
              ) => ({

                ...previousNotification,

                isRead: true

              })
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error automatically marking notification as read:",
            error
          );

        }

      }


      setTimeout(
        () => {

          document
            .getElementById(
              "staff-notification-details"
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
  // CLOSE NOTIFICATION DETAILS
  // ============================================================

  const closeNotificationDetails =
    () => {

      setSelectedNotification(null);

      setShowNotificationDetails(false);

    };


  // ============================================================
  // TOGGLE READ / UNREAD STATUS
  // ============================================================

  const toggleNotificationReadStatus =
    async (
      notification
    ) => {

      if (
        isUpdating
      ) {

        return;

      }


      const newReadStatus =
        !isNotificationRead(
          notification
        );


      setIsUpdating(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await updateDoc(
          doc(
            db,
            "staffNotifications",
            notification.id
          ),
          {

            isRead:
              newReadStatus,

            readAt:
              newReadStatus
                ?
                serverTimestamp()
                :
                null,

            updatedAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.map(
                (
                  currentNotification
                ) => {

                  if (
                    currentNotification.id ===
                    notification.id
                  ) {

                    return {

                      ...currentNotification,

                      isRead:
                        newReadStatus

                    };

                  }


                  return currentNotification;

                }
              )
          );


          if (
            selectedNotification?.id ===
              notification.id
          ) {

            setSelectedNotification(
              (
                previousNotification
              ) => ({

                ...previousNotification,

                isRead:
                  newReadStatus

              })
            );

          }


          setSuccessMessage(
            newReadStatus
              ?
              "Notification marked as read successfully."
              :
              "Notification marked as unread successfully."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error updating notification read status:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to update the notification status. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsUpdating(false);

        }

      }

    };


  // ============================================================
  // REQUEST MARK ALL AS READ
  // ============================================================

  const requestMarkAllAsRead =
    () => {

      if (
        notificationStatistics.unread === 0
      ) {

        setSuccessMessage(
          "All staff notifications are already marked as read."
        );

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setShowMarkAllConfirmation(true);

    };


  // ============================================================
  // CANCEL MARK ALL AS READ
  // ============================================================

  const cancelMarkAllAsRead =
    () => {

      if (
        isMarkingAll
      ) {

        return;

      }


      setShowMarkAllConfirmation(false);

    };


  // ============================================================
  // CONFIRM MARK ALL AS READ
  // ============================================================

  const confirmMarkAllAsRead =
    async () => {

      if (
        isMarkingAll
      ) {

        return;

      }


      const unreadNotifications =
        notifications.filter(
          (
            notification
          ) =>
            !isNotificationRead(
              notification
            )
        );


      if (
        unreadNotifications.length === 0
      ) {

        setShowMarkAllConfirmation(false);

        return;

      }


      setIsMarkingAll(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const batch =
          writeBatch(
            db
          );


        unreadNotifications.forEach(
          (
            notification
          ) => {

            const notificationReference =
              doc(
                db,
                "staffNotifications",
                notification.id
              );


            batch.update(
              notificationReference,
              {

                isRead: true,

                readAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp()

              }
            );

          }
        );


        await batch.commit();


        if (
          isMountedRef.current
        ) {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.map(
                (
                  notification
                ) => ({

                  ...notification,

                  isRead: true

                })
              )
          );


          if (
            selectedNotification
          ) {

            setSelectedNotification(
              (
                previousNotification
              ) => ({

                ...previousNotification,

                isRead: true

              })
            );

          }


          setSuccessMessage(
            `${unreadNotifications.length} notifications marked as read successfully.`
          );

          setShowMarkAllConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error marking all notifications as read:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to mark all notifications as read. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsMarkingAll(false);

        }

      }

    };


  // ============================================================
  // REQUEST DELETE NOTIFICATION
  // ============================================================

  const requestDeleteNotification =
    (
      notification
    ) => {

      setNotificationToDelete(
        notification
      );

      setErrorMessage("");

      setSuccessMessage("");

      setShowDeleteConfirmation(true);

    };


  // ============================================================
  // CANCEL DELETE NOTIFICATION
  // ============================================================

  const cancelDeleteNotification =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setNotificationToDelete(null);

      setShowDeleteConfirmation(false);

    };


  // ============================================================
  // CONFIRM DELETE NOTIFICATION
  // ============================================================

  const confirmDeleteNotification =
    async () => {

      if (
        isDeleting ||
        !notificationToDelete
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
            "staffNotifications",
            notificationToDelete.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.filter(
                (
                  notification
                ) =>
                  notification.id !==
                    notificationToDelete.id
              )
          );


          if (
            selectedNotification?.id ===
              notificationToDelete.id
          ) {

            setSelectedNotification(null);

            setShowNotificationDetails(false);

          }


          setSuccessMessage(
            "Staff notification deleted successfully."
          );

          setNotificationToDelete(null);

          setShowDeleteConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting staff notification:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the staff notification. Please try again."
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
              🔔 Staff Notifications
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Review salary, leave, attendance, role and general staff alerts.
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
                refreshNotifications
              }
              disabled={
                isLoading ||
                isRefreshing ||
                isUpdating ||
                isDeleting ||
                isMarkingAll
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
                requestMarkAllAsRead
              }
              disabled={
                isLoading ||
                notificationStatistics.unread === 0 ||
                isUpdating ||
                isDeleting ||
                isMarkingAll
              }
            >
              ✓ Mark All as Read
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
                  Loading Staff Notifications...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while notifications are being loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            NOTIFICATIONS CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  NOTIFICATION STATISTICS
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
                      "🔔",
                      "Total",
                      notificationStatistics.total,
                      "#475569"
                    ],

                    [
                      "📩",
                      "Unread",
                      notificationStatistics.unread,
                      "#2563eb"
                    ],

                    [
                      "✓",
                      "Read",
                      notificationStatistics.read,
                      "#15803d"
                    ],

                    [
                      "🚨",
                      "Urgent",
                      notificationStatistics.urgent,
                      "#b91c1c"
                    ],

                    [
                      "💰",
                      "Salary",
                      notificationStatistics.salary,
                      "#b45309"
                    ],

                    [
                      "📅",
                      "Leave",
                      notificationStatistics.leave,
                      "#7c3aed"
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
                  SEARCH & FILTER SECTION
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
                    justifyContent: "space-between",
                    alignItems: "center",
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
                      🔍 Search & Filter Notifications
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Quickly find staff notifications.
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

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by staff name, title, message..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

                <br />
                <br />

                <div className="form-grid">

                  <div>

                    <label>
                      Notification Type
                    </label>

                    <select
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Types
                      </option>

                      {
                        notificationTypes.map(
                          (type) => (

                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>

                  <div>

                    <label>
                      Priority
                    </label>

                    <select
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Priorities
                      </option>

                      {
                        priorityOptions.map(
                          (priority) => (

                            <option
                              key={priority}
                              value={priority}
                            >
                              {priority}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>

                  <div>

                    <label>
                      Read Status
                    </label>

                    <select
                      value={readFilter}
                      onChange={(event) =>
                        setReadFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All
                      </option>

                      <option value="Unread">
                        Unread
                      </option>

                      <option value="Read">
                        Read
                      </option>

                    </select>

                  </div>

                  <div>

                    <label>
                      Month
                    </label>

                    <input
                      type="month"
                      value={monthFilter}
                      onChange={(event) =>
                        setMonthFilter(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <label>
                      Sort
                    </label>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value
                        )
                      }
                    >

                      <option value="newest">
                        Newest First
                      </option>

                      <option value="oldest">
                        Oldest First
                      </option>

                      <option value="staff-ascending">
                        Staff A → Z
                      </option>

                      <option value="staff-descending">
                        Staff Z → A
                      </option>

                      <option value="priority-high">
                        Priority High → Low
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  EMPTY DATABASE
              ================================================== */}

              {
                notifications.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "54px",
                          marginBottom: "16px"
                        }}
                      >
                        🔔
                      </div>

                      <h2>
                        No Notifications
                      </h2>

                      <p
                        style={{
                          color: "#64748b",
                          margin: 0
                        }}
                      >
                        No staff notifications have been created yet.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO SEARCH RESULTS
              ================================================== */}

              {
                notifications.length > 0 &&
                filteredNotifications.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
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
                        No Matching Notifications
                      </h2>

                      <p
                        style={{
                          marginBottom: "20px",
                          color: "#64748b"
                        }}
                      >
                        Try changing the search filters.
                      </p>

                      <button
                        onClick={
                          resetFilters
                        }
                      >
                        Reset Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NOTIFICATION LIST
              ================================================== */}

              {
                filteredNotifications.length > 0 && (

                  filteredNotifications.map(
                    (
                      notification
                    ) => {

                      const type =
                        getNotificationType(
                          notification
                        );

                      const priority =
                        getNotificationPriority(
                          notification
                        );

                      const read =
                        isNotificationRead(
                          notification
                        );

                      return (

                        <div
                          key={notification.id}
                          className="student-card"
                          style={{
                            marginBottom: "18px",
                            opacity:
                              read
                                ? 0.9
                                : 1
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "16px",
                              flexWrap: "wrap"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                gap: "16px",
                                flex: 1
                              }}
                            >

                              <div
                                className="student-avatar"
                              >
                                {
                                  getNotificationIcon(
                                    type
                                  )
                                }
                              </div>

                              <div>

                                <h2
                                  className="student-name"
                                  style={{
                                    margin:
                                      "0 0 6px"
                                  }}
                                >
                                  {
                                    displayValue(
                                      notification.title,
                                      "Notification"
                                    )
                                  }
                                </h2>

                                <p>
                                  👳
                                  {" "}
                                  {
                                    displayValue(
                                      notification.staffName
                                    )
                                  }
                                </p>

                                <p>
                                  {
                                    displayValue(
                                      notification.message
                                    )
                                  }
                                </p>

                                <p
                                  style={{
                                    color:
                                      "#64748b"
                                  }}
                                >
                                  🕒
                                  {" "}
                                  {
                                    formatTimestamp(
                                      getNotificationDateValue(
                                        notification
                                      )
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                            <div
                              style={{
                                textAlign: "right"
                              }}
                            >

                              <span
                                style={{
                                  padding:
                                    "6px 12px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    getPriorityBackground(
                                      priority
                                    ),
                                  color:
                                    getPriorityColor(
                                      priority
                                    ),
                                  fontWeight:
                                    "700",
                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  getPriorityIcon(
                                    priority
                                  )
                                }
                                {" "}
                                {priority}
                              </span>

                              <br />
                              <br />

                              <span
                                style={{
                                  padding:
                                    "6px 12px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    read
                                      ? "#dcfce7"
                                      : "#dbeafe",
                                  color:
                                    read
                                      ? "#15803d"
                                      : "#2563eb",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "700"
                                }}
                              >
                                {
                                  read
                                    ? "✓ Read"
                                    : "📩 Unread"
                                }
                              </span>

                            </div>

                          </div>

                          <div
                            className="student-actions"
                            style={{
                              marginTop: "18px"
                            }}
                          >

                            <button
                              className="action-btn view-btn"
                              onClick={() =>
                                openNotificationDetails(
                                  notification
                                )
                              }
                            >
                              👁 View
                            </button>

                            <button
                              className="action-btn edit-btn"
                              onClick={() =>
                                toggleNotificationReadStatus(
                                  notification
                                )
                              }
                            >
                              {
                                read
                                  ? "📩 Mark Unread"
                                  : "✓ Mark Read"
                              }
                            </button>

                            <button
                              className="action-btn delete-btn"
                              onClick={() =>
                                requestDeleteNotification(
                                  notification
                                )
                              }
                            >
                              🗑 Delete
                            </button>

                          </div>

                        </div>

                      );

                    }
                  )

                )
              }
                            {/* ==================================================
                  NOTIFICATION DETAILS
              ================================================== */}

              {
                showNotificationDetails &&
                selectedNotification && (

                  <div
                    id="staff-notification-details"
                    className="section-card"
                    style={{
                      marginTop: "24px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
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
                          👁 Notification Details
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete notification information.
                        </p>

                      </div>

                      <button
                        onClick={
                          closeNotificationDetails
                        }
                      >
                        ✖ Close
                      </button>

                    </div>


                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        marginBottom: "20px"
                      }}
                    >

                      <h2
                        style={{
                          margin: "0 0 10px"
                        }}
                      >
                        {
                          getNotificationIcon(
                            getNotificationType(
                              selectedNotification
                            )
                          )
                        }
                        {" "}
                        {
                          displayValue(
                            selectedNotification.title,
                            "Notification"
                          )
                        }
                      </h2>

                      <p>
                        <strong>
                          Staff :
                        </strong>
                        {" "}
                        {
                          displayValue(
                            selectedNotification.staffName
                          )
                        }
                      </p>

                      <p>
                        <strong>
                          Staff ID :
                        </strong>
                        {" "}
                        {
                          displayValue(
                            selectedNotification.staffId
                          )
                        }
                      </p>

                      <p>
                        <strong>
                          Type :
                        </strong>
                        {" "}
                        {
                          getNotificationType(
                            selectedNotification
                          )
                        }
                      </p>

                      <p>
                        <strong>
                          Priority :
                        </strong>
                        {" "}
                        {
                          getPriorityIcon(
                            getNotificationPriority(
                              selectedNotification
                            )
                          )
                        }
                        {" "}
                        {
                          getNotificationPriority(
                            selectedNotification
                          )
                        }
                      </p>

                      <p>
                        <strong>
                          Created :
                        </strong>
                        {" "}
                        {
                          formatTimestamp(
                            getNotificationDateValue(
                              selectedNotification
                            )
                          )
                        }
                      </p>

                    </div>


                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        marginBottom: "20px"
                      }}
                    >

                      <h3
                        style={{
                          marginTop: 0
                        }}
                      >
                        📝 Message
                      </h3>

                      <p
                        style={{
                          lineHeight: "1.8",
                          marginBottom: 0
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.message
                          )
                        }
                      </p>

                    </div>


                    {
                      selectedNotification.description && (

                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "12px",
                            background: "#f8fafc"
                          }}
                        >

                          <h3
                            style={{
                              marginTop: 0
                            }}
                          >
                            📄 Description
                          </h3>

                          <p
                            style={{
                              lineHeight: "1.8",
                              marginBottom: 0
                            }}
                          >
                            {
                              selectedNotification.description
                            }
                          </p>

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
            MARK ALL READ CONFIRMATION
        ====================================================== */}

        {
          showMarkAllConfirmation && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.65)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9998
              }}
            >

              <div
                className="section-card"
                style={{
                  maxWidth: "500px",
                  width: "95%"
                }}
              >

                <h2>
                  ✓ Mark All Notifications as Read
                </h2>

                <p
                  style={{
                    lineHeight: "1.8",
                    color: "#64748b"
                  }}
                >
                  This will mark every unread notification as
                  read. You can still mark any notification
                  as unread later.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "25px"
                  }}
                >

                  <button
                    onClick={
                      cancelMarkAllAsRead
                    }
                    disabled={
                      isMarkingAll
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="action-btn view-btn"
                    onClick={
                      confirmMarkAllAsRead
                    }
                    disabled={
                      isMarkingAll
                    }
                  >
                    {
                      isMarkingAll
                        ?
                        "⏳ Marking..."
                        :
                        "✓ Confirm"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            DELETE CONFIRMATION
        ====================================================== */}

        {
          showDeleteConfirmation &&
          notificationToDelete && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.65)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
              }}
            >

              <div
                className="section-card"
                style={{
                  maxWidth: "520px",
                  width: "95%"
                }}
              >

                <div
                  style={{
                    textAlign: "center"
                  }}
                >

                  <div
                    style={{
                      fontSize: "55px",
                      marginBottom: "10px"
                    }}
                  >
                    🗑
                  </div>

                  <h2>
                    Delete Notification?
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: "1.8"
                    }}
                  >
                    This notification will be permanently removed
                    from Firebase.
                  </p>

                </div>


                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <h3
                    style={{
                      marginTop: 0
                    }}
                  >
                    {
                      displayValue(
                        notificationToDelete.title,
                        "Notification"
                      )
                    }
                  </h3>

                  <p>
                    👳
                    {" "}
                    {
                      displayValue(
                        notificationToDelete.staffName
                      )
                    }
                  </p>

                  <p>
                    {
                      displayValue(
                        notificationToDelete.message
                      )
                    }
                  </p>

                </div>


                <div
                  style={{
                    marginTop: "25px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px"
                  }}
                >

                  <button
                    onClick={
                      cancelDeleteNotification
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={
                      confirmDeleteNotification
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting..."
                        :
                        "🗑 Delete"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            BOTTOM SPACE
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

export default StaffNotifications;