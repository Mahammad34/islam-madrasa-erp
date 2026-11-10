import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
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

function ParentNotifications() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    notifications,
    setNotifications
  ] = useState([]);


  const [
    parents,
    setParents
  ] = useState([]);


  const [
    students,
    setStudents
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
    statusFilter,
    setStatusFilter
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
    updatingNotificationId,
    setUpdatingNotificationId
  ] = useState("");


  const [
    deletingNotificationId,
    setDeletingNotificationId
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
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
  // NORMALIZE VALUE
  // ============================================================

  const normalizeValue =
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
  // DISPLAY VALUE
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "Not Available"
    ) => {

      const cleanedValue =
        String(
          value || ""
        ).trim();


      return cleanedValue ||
        fallback;

    };


  // ============================================================
  // GET PARENT NAME
  // ============================================================

  const getParentName =
    (
      parent
    ) => {

      if (
        !parent
      ) {

        return "Unknown Parent";

      }


      return (

        parent.primaryGuardianName ||

        parent.fatherName ||

        parent.motherName ||

        parent.guardianName ||

        "Unknown Parent"

      );

    };


  // ============================================================
  // GET STUDENT NAME
  // ============================================================

  const getStudentName =
    (
      student
    ) => {

      if (
        !student
      ) {

        return "Unknown Student";

      }


      return (

        student.studentName ||

        student.fullName ||

        student.name ||

        "Unknown Student"

      );

    };


  // ============================================================
  // GET NOTIFICATION TYPE ICON
  // ============================================================

  const getNotificationIcon =
    (
      notificationType
    ) => {

      switch (
        notificationType
      ) {

        case "Attendance":

          return "📋";


        case "Fees":

          return "💰";


        case "Health":

          return "🏥";


        case "Academic":

          return "📚";


        case "General":

          return "📢";


        case "Emergency":

          return "🚨";


        default:

          return "🔔";

      }

    };


  // ============================================================
  // GET FIREBASE DATE
  // ============================================================

  const getFirebaseDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return null;

      }


      if (
        typeof dateValue.toDate ===
        "function"
      ) {

        return dateValue.toDate();

      }


      if (
        dateValue.seconds
      ) {

        return new Date(
          dateValue.seconds * 1000
        );

      }


      const convertedDate =
        new Date(
          dateValue
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
  // FORMAT DATE AND TIME
  // ============================================================

  const formatDateTime =
    (
      dateValue
    ) => {

      const convertedDate =
        getFirebaseDate(
          dateValue
        );


      if (
        !convertedDate
      ) {

        return "Not Available";

      }


      return convertedDate.toLocaleString(
        "en-IN",
        {

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit"

        }
      );

    };


  // ============================================================
  // FETCH NOTIFICATION DATA
  // ============================================================

  const fetchNotificationData =
    async (
      showRefreshLoader = false
    ) => {

      if (
        showRefreshLoader
      ) {

        setIsRefreshing(true);

      }
      else {

        setIsLoading(true);

      }


      setErrorMessage("");


      try {

        const [
          notificationSnapshot,
          parentSnapshot,
          studentSnapshot
        ] =
          await Promise.all([

            getDocs(
              collection(
                db,
                "parentNotifications"
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
                "students"
              )
            )

          ]);


        const notificationList =
          notificationSnapshot.docs.map(
            (
              notificationDocument
            ) => ({

              id:
                notificationDocument.id,

              ...notificationDocument.data()

            })
          );


        const parentList =
          parentSnapshot.docs.map(
            (
              parentDocument
            ) => ({

              id:
                parentDocument.id,

              ...parentDocument.data()

            })
          );


        const studentList =
          studentSnapshot.docs.map(
            (
              studentDocument
            ) => ({

              id:
                studentDocument.id,

              ...studentDocument.data()

            })
          );


        notificationList.sort(
          (
            firstNotification,
            secondNotification
          ) => {

            const firstDate =
              getFirebaseDate(
                firstNotification.createdAt
              );


            const secondDate =
              getFirebaseDate(
                secondNotification.createdAt
              );


            return (

              (
                secondDate?.getTime() ||
                0
              ) -

              (
                firstDate?.getTime() ||
                0
              )

            );

          }
        );


        if (
          isMountedRef.current
        ) {

          setNotifications(
            notificationList
          );


          setParents(
            parentList
          );


          setStudents(
            studentList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading parent notifications:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load parent notifications. Please check your connection and try again."
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

    };


  // ============================================================
  // LOAD NOTIFICATION DATA
  // ============================================================

  useEffect(
    () => {

      fetchNotificationData();

    },
    []
  );


  // ============================================================
  // GET PARENT RECORD FOR NOTIFICATION
  // ============================================================

  const getNotificationParent =
    (
      notification
    ) => {

      return parents.find(
        (
          parent
        ) =>

          parent.id ===
            notification.parentDocumentId ||

          parent.parentId ===
            notification.parentId

      ) || null;

    };


  // ============================================================
  // GET STUDENT RECORD FOR NOTIFICATION
  // ============================================================

  const getNotificationStudent =
    (
      notification
    ) => {

      return students.find(
        (
          student
        ) =>

          student.id ===
            notification.studentDocumentId ||

          student.studentId ===
            notification.studentId

      ) || null;

    };


  // ============================================================
  // FILTER NOTIFICATIONS
  // ============================================================

  const filteredNotifications =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return notifications.filter(
          (
            notification
          ) => {

            const parent =
              getNotificationParent(
                notification
              );


            const student =
              getNotificationStudent(
                notification
              );


            const searchableValues =
              [

                notification.title,

                notification.message,

                notification.type,

                notification.parentName,

                notification.studentName,

                notification.parentId,

                notification.studentId,

                getParentName(
                  parent
                ),

                getStudentName(
                  student
                )

              ]
                .map(
                  normalizeValue
                )
                .join(" ");


            const matchesSearch =
              !normalizedSearch ||

              searchableValues.includes(
                normalizedSearch
              );


            const matchesType =
              typeFilter === "All" ||

              notification.type ===
                typeFilter;


            const notificationStatus =
              notification.status ||
              (
                notification.isRead === true
                  ?
                  "Read"
                  :
                  "Unread"
              );


            const matchesStatus =
              statusFilter === "All" ||

              notificationStatus ===
                statusFilter;


            return (

              matchesSearch &&

              matchesType &&

              matchesStatus

            );

          }
        );

      },
      [
        notifications,
        parents,
        students,
        searchTerm,
        typeFilter,
        statusFilter
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

              notification.status ===
                "Unread" ||

              (
                !notification.status &&
                notification.isRead !== true
              )

          ).length;


        const readNotifications =
          notifications.length -
          unreadNotifications;


        const attendanceNotifications =
          notifications.filter(
            (
              notification
            ) =>
              notification.type ===
              "Attendance"
          ).length;


        const feeNotifications =
          notifications.filter(
            (
              notification
            ) =>
              notification.type ===
              "Fees"
          ).length;


        return {

          total:
            notifications.length,

          unread:
            unreadNotifications,

          read:
            readNotifications,

          attendance:
            attendanceNotifications,

          fees:
            feeNotifications

        };

      },
      [
        notifications
      ]
    );
      // ============================================================
  // UPDATE NOTIFICATION STATUS
  // ============================================================

  const updateNotificationStatus =
    async (
      notification,
      newStatus
    ) => {

      if (
        updatingNotificationId
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setUpdatingNotificationId(
        notification.id
      );


      try {

        const notificationReference =
          doc(
            db,
            "parentNotifications",
            notification.id
          );


        await updateDoc(
          notificationReference,
          {

            status:
              newStatus,

            isRead:
              newStatus === "Read",

            readAt:
              newStatus === "Read"
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
              currentNotifications
            ) =>
              currentNotifications.map(
                (
                  currentNotification
                ) => {

                  if (
                    currentNotification.id !==
                    notification.id
                  ) {

                    return currentNotification;

                  }


                  return {

                    ...currentNotification,

                    status:
                      newStatus,

                    isRead:
                      newStatus === "Read"

                  };

                }
              )
          );


          setSuccessMessage(
            newStatus === "Read"
              ?
              "Notification marked as read."
              :
              "Notification marked as unread."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error updating notification status:",
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

          setUpdatingNotificationId("");

        }

      }

    };


  // ============================================================
  // DELETE NOTIFICATION
  // ============================================================

  const deleteNotification =
    async (
      notification
    ) => {

      if (
        deletingNotificationId
      ) {

        return;

      }


      const confirmDelete =
        window.confirm(
          `Delete "${displayValue(
            notification.title,
            "this notification"
          )}" permanently?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setDeletingNotificationId(
        notification.id
      );


      try {

        const notificationReference =
          doc(
            db,
            "parentNotifications",
            notification.id
          );


        await deleteDoc(
          notificationReference
        );


        if (
          isMountedRef.current
        ) {

          setNotifications(
            (
              currentNotifications
            ) =>
              currentNotifications.filter(
                (
                  currentNotification
                ) =>
                  currentNotification.id !==
                  notification.id
              )
          );


          setSuccessMessage(
            "Notification deleted successfully."
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting notification:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the notification. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setDeletingNotificationId("");

        }

      }

    };


  // ============================================================
  // REFRESH NOTIFICATIONS
  // ============================================================

  const refreshNotifications =
    async () => {

      setSuccessMessage("");

      await fetchNotificationData(
        true
      );

    };


  // ============================================================
  // RESET SEARCH AND FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setTypeFilter("All");

      setStatusFilter("All");

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    typeFilter !== "All" ||

    statusFilter !== "All";


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
            alignItems: "flex-start",
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
              🔔 Parent Notifications
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Manage attendance, fee, health, academic, emergency, and general alerts for parents.
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
              to="/parent-list"
              className="action-btn"
            >
              👨‍👩‍👧 Parent List
            </Link>


            <Link
              to="/student-mapping"
              className="action-btn view-btn"
            >
              👨‍🎓 Student Mapping
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
                  Loading Parent Notifications...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while notifications are loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            MAIN PAGE CONTENT
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
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "20px"
                }}
              >

                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    TOTAL NOTIFICATIONS
                  </p>


                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    {notificationStatistics.total}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    UNREAD
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#dc2626"
                    }}
                  >
                    {notificationStatistics.unread}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    READ
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#15803d"
                    }}
                  >
                    {notificationStatistics.read}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    ATTENDANCE ALERTS
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#2563eb"
                    }}
                  >
                    {notificationStatistics.attendance}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    FEE ALERTS
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#b45309"
                    }}
                  >
                    {notificationStatistics.fees}
                  </h2>

                </div>

              </div>


              {/* ==================================================
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
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
                      🔍 Search Notifications
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search and filter notifications by parent, student, type, message, or status.
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
                        ✖ Clear Filters
                      </button>

                    )
                  }

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Search Notifications
                    </label>


                    <input
                      type="text"
                      placeholder="Search parent, student, title, message..."
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


                  <div>

                    <label>
                      Notification Type
                    </label>


                    <select
                      value={
                        typeFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setTypeFilter(
                            event.target.value
                          )
                      }
                    >

                      <option value="All">
                        All Types
                      </option>

                      <option value="Attendance">
                        Attendance
                      </option>

                      <option value="Fees">
                        Fees
                      </option>

                      <option value="Health">
                        Health
                      </option>

                      <option value="Academic">
                        Academic
                      </option>

                      <option value="General">
                        General
                      </option>

                      <option value="Emergency">
                        Emergency
                      </option>

                    </select>

                  </div>


                  <div>

                    <label>
                      Read Status
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

                      <option value="Unread">
                        Unread
                      </option>

                      <option value="Read">
                        Read
                      </option>

                    </select>

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  NOTIFICATION RESULTS HEADER
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
                    📋 Notification Records
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {filteredNotifications.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {notifications.length}
                    </strong>
                    {" "}
                    notifications
                  </p>

                </div>

              </div>


              {/* ==================================================
                  NO NOTIFICATIONS AVAILABLE
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
                          fontSize: "56px",
                          marginBottom: "14px"
                        }}
                      >
                        🔔
                      </div>


                      <h2>
                        No Parent Notifications Yet
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Parent notifications will appear here when alerts and updates are created.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
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
                          fontSize: "54px",
                          marginBottom: "14px"
                        }}
                      >
                        🔍
                      </div>


                      <h2>
                        No Matching Notifications Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Try changing the search text or clearing the active filters.
                      </p>


                      <button
                        type="button"
                        onClick={resetFilters}
                      >
                        ✖ Clear Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NOTIFICATION CARDS
              ================================================== */}

              {
                filteredNotifications.length > 0 &&

                filteredNotifications.map(
                  (
                    notification
                  ) => {

                    const parent =
                      getNotificationParent(
                        notification
                      );


                    const student =
                      getNotificationStudent(
                        notification
                      );


                    const notificationStatus =
                      notification.status ||
                      (
                        notification.isRead === true
                          ?
                          "Read"
                          :
                          "Unread"
                      );


                    const isUnread =
                      notificationStatus ===
                      "Unread";


                    const isUpdating =
                      updatingNotificationId ===
                      notification.id;


                    const isDeleting =
                      deletingNotificationId ===
                      notification.id;


                    return (

                      <div
                        className="student-card"
                        key={notification.id}
                        style={{
                          marginBottom: "18px",
                          borderLeft: isUnread
                            ?
                            "5px solid #2563eb"
                            :
                            "5px solid #cbd5e1"
                        }}
                      >

                        {/* ========================================
                            NOTIFICATION HEADER
                        ======================================== */}

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
                              gap: "14px"
                            }}
                          >

                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "12px",
                                background: "#f1f5f9",
                                fontSize: "24px",
                                flexShrink: 0
                              }}
                            >
                              {
                                getNotificationIcon(
                                  notification.type
                                )
                              }
                            </div>


                            <div>

                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "800"
                                }}
                              >
                                {
                                  displayValue(
                                    notification.type,
                                    "GENERAL"
                                  ).toUpperCase()
                                }
                                {" "}
                                NOTIFICATION
                              </p>


                              <h2
                                style={{
                                  margin: "0 0 7px"
                                }}
                              >
                                {
                                  displayValue(
                                    notification.title,
                                    "Parent Notification"
                                  )
                                }
                              </h2>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b",
                                  fontSize: "13px"
                                }}
                              >
                                🕒
                                {" "}
                                {
                                  formatDateTime(
                                    notification.createdAt
                                  )
                                }
                              </p>

                            </div>

                          </div>


                          <span
                            style={{
                              padding: "7px 12px",
                              borderRadius: "999px",
                              background: isUnread
                                ?
                                "#dbeafe"
                                :
                                "#dcfce7",
                              color: isUnread
                                ?
                                "#1d4ed8"
                                :
                                "#15803d",
                              fontSize: "12px",
                              fontWeight: "700"
                            }}
                          >
                            {
                              isUnread
                                ?
                                "🔵 Unread"
                                :
                                "✅ Read"
                            }
                          </span>

                        </div>


                        {/* ========================================
                            NOTIFICATION MESSAGE
                        ======================================== */}

                        <div
                          style={{
                            padding: "16px",
                            marginTop: "18px",
                            borderRadius: "10px",
                            background: isUnread
                              ?
                              "#eff6ff"
                              :
                              "#f8fafc",
                            border: isUnread
                              ?
                              "1px solid #bfdbfe"
                              :
                              "1px solid #e2e8f0",
                            lineHeight: "1.8"
                          }}
                        >

                          <p
                            style={{
                              margin: 0
                            }}
                          >
                            {
                              displayValue(
                                notification.message,
                                "No notification message available."
                              )
                            }
                          </p>

                        </div>


                        {/* ========================================
                            PARENT AND STUDENT INFORMATION
                        ======================================== */}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "14px",
                            marginTop: "18px"
                          }}
                        >

                          {/* ======================================
                              PARENT INFORMATION
                          ====================================== */}

                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 10px",
                                color: "#1d4ed8",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              👨‍👩‍👧 PARENT INFORMATION
                            </p>


                            <h3
                              style={{
                                margin: "0 0 9px"
                              }}
                            >
                              {
                                parent
                                  ?
                                  getParentName(parent)
                                  :
                                  displayValue(
                                    notification.parentName,
                                    "Unknown Parent"
                                  )
                              }
                            </h3>


                            <p
                              style={{
                                margin: "0 0 6px"
                              }}
                            >
                              <strong>
                                Parent ID:
                              </strong>
                              {" "}
                              {
                                parent
                                  ?
                                  displayValue(
                                    parent.parentId,
                                    "Legacy Record"
                                  )
                                  :
                                  displayValue(
                                    notification.parentId
                                  )
                              }
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              <strong>
                                Mobile:
                              </strong>
                              {" "}
                              {
                                parent
                                  ?
                                  displayValue(
                                    parent.mobileNumber
                                  )
                                  :
                                  displayValue(
                                    notification.parentMobileNumber
                                  )
                              }
                            </p>

                          </div>


                          {/* ======================================
                              STUDENT INFORMATION
                          ====================================== */}

                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 10px",
                                color: "#15803d",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              👨‍🎓 STUDENT INFORMATION
                            </p>


                            <h3
                              style={{
                                margin: "0 0 9px"
                              }}
                            >
                              {
                                student
                                  ?
                                  getStudentName(student)
                                  :
                                  displayValue(
                                    notification.studentName,
                                    "No Student Linked"
                                  )
                              }
                            </h3>


                            <p
                              style={{
                                margin: "0 0 6px"
                              }}
                            >
                              <strong>
                                Student ID:
                              </strong>
                              {" "}
                              {
                                student
                                  ?
                                  displayValue(
                                    student.studentId ||
                                    student.admissionNumber ||
                                    student.rollNumber
                                  )
                                  :
                                  displayValue(
                                    notification.studentId
                                  )
                              }
                            </p>


                            <p
                              style={{
                                margin: 0
                              }}
                            >
                              <strong>
                                Class:
                              </strong>
                              {" "}
                              {
                                student
                                  ?
                                  displayValue(
                                    student.className ||
                                    student.studentClass ||
                                    student.class ||
                                    student.course
                                  )
                                  :
                                  displayValue(
                                    notification.studentClass
                                  )
                              }
                            </p>

                          </div>

                        </div>


                        {/* ========================================
                            NOTIFICATION ACTIONS
                        ======================================== */}

                        <div
                          className="student-actions"
                          style={{
                            marginTop: "20px"
                          }}
                        >

                          {
                            parent && (

                              <Link
                                to={
                                  `/parent-profile/${parent.id}`
                                }
                                className="action-btn view-btn"
                              >
                                👁 View Parent
                              </Link>

                            )
                          }


                          {
                            student && (

                              <Link
                                to={
                                  `/student-profile/${student.id}`
                                }
                                className="action-btn"
                              >
                                👨‍🎓 View Student
                              </Link>

                            )
                          }


                          <button
                            type="button"
                            className="action-btn"
                            disabled={
                              isUpdating ||
                              isDeleting
                            }
                            onClick={
                              () =>
                                updateNotificationStatus(
                                  notification,
                                  isUnread
                                    ?
                                    "Read"
                                    :
                                    "Unread"
                                )
                            }
                          >
                            {
                              isUpdating
                                ?
                                "⏳ Updating..."
                                :
                                isUnread
                                  ?
                                  "✅ Mark as Read"
                                  :
                                  "🔵 Mark as Unread"
                            }
                          </button>


                          <button
                            type="button"
                            className="action-btn delete-btn"
                            disabled={
                              isDeleting ||
                              isUpdating
                            }
                            onClick={
                              () =>
                                deleteNotification(
                                  notification
                                )
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

                    );

                  }
                )
              }


              {/* ==================================================
                  PAGE INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginTop: "20px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                🕌 Parent notifications help the Madrasa administration keep families informed about student attendance, fees, health, academics, emergencies, and important updates.
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

export default ParentNotifications;