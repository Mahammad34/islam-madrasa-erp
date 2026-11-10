import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Notifications() {
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
  // NOTIFICATION DATA
  // ============================================================

  const [
    notifications,
    setNotifications
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


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
    searchText,
    setSearchText
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
    readStatusFilter,
    setReadStatusFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState("Newest");


  // ============================================================
  // SELECTED NOTIFICATION
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
  // SELECTED NOTIFICATIONS FOR BULK ACTIONS
  // ============================================================

  const [
    selectedNotificationIds,
    setSelectedNotificationIds
  ] = useState([]);


  // ============================================================
  // ACTION LOADING STATES
  // ============================================================

  const [
    actionNotificationId,
    setActionNotificationId
  ] = useState("");


  const [
    isUpdating,
    setIsUpdating
  ] = useState(false);


  const [
    isDeleting,
    setIsDeleting
  ] = useState(false);


  const [
    isBulkActionRunning,
    setIsBulkActionRunning
  ] = useState(false);


  const [
    isMarkingAllRead,
    setIsMarkingAllRead
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    notificationPendingDelete,
    setNotificationPendingDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


  // ============================================================
  // BULK DELETE CONFIRMATION
  // ============================================================

  const [
    showBulkDeleteConfirmation,
    setShowBulkDeleteConfirmation
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
  // FIRESTORE TIMESTAMP TO DATE
  // ============================================================

  const firestoreTimestampToDate =
    (
      timestamp
    ) => {

      if (
        !timestamp
      ) {

        return null;

      }


      if (
        typeof timestamp.toDate ===
        "function"
      ) {

        return timestamp.toDate();

      }


      if (
        timestamp.seconds
      ) {

        return new Date(
          timestamp.seconds *
          1000
        );

      }


      const convertedDate =
        new Date(
          timestamp
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
  // FETCH ALL STUDENT NOTIFICATIONS
  // ============================================================

  const fetchNotifications =
    useCallback(
      async () => {

        setLoading(
          true
        );


        setErrorMessage(
          ""
        );


        try {

          let notificationSnapshot;


          try {

            const notificationQuery =
  query(
    collection(
      db,
      "studentNotifications"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    ),
    orderBy(
      "createdAt",
      "desc"
    )
  );


            notificationSnapshot =
              await getDocs(
                notificationQuery
              );

          }
          catch (
            queryError
          ) {

            console.warn(
              "Ordered notification query failed. Using fallback query:",
              queryError
            );


            const fallbackQuery =
  query(
    collection(
      db,
      "studentNotifications"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    )
  );


notificationSnapshot =
  await getDocs(
    fallbackQuery
  );

          }


          const notificationList =
            notificationSnapshot.docs.map(
              (
                notificationDocument
              ) => {

                const notificationData =
                  notificationDocument.data();


                return {

                  id:
                    notificationDocument.id,

                  studentId:
                    notificationData.studentId ||
                    "",

                  studentName:
                    notificationData.studentName ||
                    "Unknown Student",

                  admissionNumber:
                    notificationData.admissionNumber ||
                    "",

                  studentClass:
                    notificationData.studentClass ||
                    "",

                  parentName:
                    notificationData.parentName ||
                    notificationData.fatherName ||
                    "",

                  parentMobile:
                    notificationData.parentMobile ||
                    notificationData.mobileNumber ||
                    "",

                  type:
                    notificationData.type ||
                    "General",

                  title:
                    notificationData.title ||
                    "Student Notification",

                  message:
                    notificationData.message ||
                    "",

                  priority:
                    notificationData.priority ||
                    "Normal",

                  isRead:
                    Boolean(
                      notificationData.isRead
                    ),

                  source:
                    notificationData.source ||
                    "Manual",

                  relatedRecordId:
                    notificationData.relatedRecordId ||
                    "",

                  actionUrl:
                    notificationData.actionUrl ||
                    "",

                  createdAt:
                    notificationData.createdAt ||
                    null,

                  updatedAt:
                    notificationData.updatedAt ||
                    null,

                  readAt:
                    notificationData.readAt ||
                    null,

                  ...notificationData

                };

              }
            );


          notificationList.sort(
            (
              firstNotification,
              secondNotification
            ) => {

              const firstDate =
                firestoreTimestampToDate(
                  firstNotification.createdAt
                );


              const secondDate =
                firestoreTimestampToDate(
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


            setSelectedNotificationIds(
              []
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error fetching student notifications:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load student notifications. Please try again."
            );

          }

        }
        finally {

          if (
            isMountedRef.current
          ) {

            setLoading(
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
  // LOAD NOTIFICATIONS WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchNotifications();

    },
    [
      fetchNotifications
    ]
  );


  // ============================================================
  // AVAILABLE NOTIFICATION TYPES
  // ============================================================

  const availableNotificationTypes =
    useMemo(
      () => {

        const notificationTypes =
          notifications
            .map(
              (
                notification
              ) =>
                notification.type
            )
            .filter(
              Boolean
            );


        return [
          ...new Set(
            notificationTypes
          )
        ].sort();

      },
      [
        notifications
      ]
    );


  // ============================================================
  // FILTER AND SORT NOTIFICATIONS
  // ============================================================

  const filteredNotifications =
    useMemo(
      () => {

        const normalizedSearch =
          searchText
            .trim()
            .toLowerCase();


        let filteredList =
          notifications.filter(
            (
              notification
            ) => {

              // ================================================
              // SEARCH MATCH
              // ================================================

              const searchableValues = [

                notification.studentName,

                notification.studentId,

                notification.admissionNumber,

                notification.studentClass,

                notification.title,

                notification.message,

                notification.type,

                notification.parentName,

                notification.parentMobile

              ];


              const matchesSearch =
                !normalizedSearch ||
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
                        normalizedSearch
                      )
                );


              // ================================================
              // TYPE MATCH
              // ================================================

              const matchesType =
                typeFilter ===
                  "All" ||
                notification.type ===
                  typeFilter;


              // ================================================
              // PRIORITY MATCH
              // ================================================

              const matchesPriority =
                priorityFilter ===
                  "All" ||
                notification.priority ===
                  priorityFilter;


              // ================================================
              // READ STATUS MATCH
              // ================================================

              const matchesReadStatus =

                readStatusFilter ===
                  "All"

                  ?

                  true

                  :

                readStatusFilter ===
                  "Read"

                  ?

                  notification.isRead

                  :

                readStatusFilter ===
                  "Unread"

                  ?

                  !notification.isRead

                  :

                  true;


              return (
                matchesSearch &&
                matchesType &&
                matchesPriority &&
                matchesReadStatus
              );

            }
          );


        // ======================================================
        // SORT NOTIFICATIONS
        // ======================================================

        filteredList.sort(
          (
            firstNotification,
            secondNotification
          ) => {

            if (
              sortOption ===
              "Oldest"
            ) {

              const firstDate =
                firestoreTimestampToDate(
                  firstNotification.createdAt
                );


              const secondDate =
                firestoreTimestampToDate(
                  secondNotification.createdAt
                );


              return (
                (
                  firstDate?.getTime() ||
                  0
                ) -
                (
                  secondDate?.getTime() ||
                  0
                )
              );

            }


            if (
              sortOption ===
              "Student Name"
            ) {

              return String(
                firstNotification.studentName ||
                ""
              ).localeCompare(
                String(
                  secondNotification.studentName ||
                  ""
                )
              );

            }


            if (
              sortOption ===
              "Priority"
            ) {

              const priorityOrder = {

                Critical:
                  4,

                High:
                  3,

                Normal:
                  2,

                Low:
                  1

              };


              return (
                (
                  priorityOrder[
                    secondNotification.priority
                  ] ||
                  0
                ) -
                (
                  priorityOrder[
                    firstNotification.priority
                  ] ||
                  0
                )
              );

            }


            // DEFAULT:
            // NEWEST FIRST

            const firstDate =
              firestoreTimestampToDate(
                firstNotification.createdAt
              );


            const secondDate =
              firestoreTimestampToDate(
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


        return filteredList;

      },
      [
        notifications,
        searchText,
        typeFilter,
        priorityFilter,
        readStatusFilter,
        sortOption
      ]
    );


  // ============================================================
  // NOTIFICATION STATISTICS
  // ============================================================

  const notificationStatistics =
    useMemo(
      () => {

        const totalNotifications =
          notifications.length;


        const unreadNotifications =
          notifications.filter(
            (
              notification
            ) =>
              !notification.isRead
          ).length;


        const attendanceAlerts =
          notifications.filter(
            (
              notification
            ) =>
              notification.type ===
              "Attendance"
          ).length;


        const highPriorityNotifications =
          notifications.filter(
            (
              notification
            ) =>
              notification.priority ===
                "High" ||
              notification.priority ===
                "Critical"
          ).length;


        return {

          totalNotifications,

          unreadNotifications,

          attendanceAlerts,

          highPriorityNotifications

        };

      },
      [
        notifications
      ]
    );
      // ============================================================
  // FORMAT NOTIFICATION DATE
  // ============================================================

  const formatNotificationDate =
    (
      dateValue
    ) => {

      const date =
        firestoreTimestampToDate(
          dateValue
        );


      if (
        !date
      ) {

        return "-";

      }


      return date.toLocaleDateString(
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
  // FORMAT NOTIFICATION DATE AND TIME
  // ============================================================

  const formatNotificationDateTime =
    (
      dateValue
    ) => {

      const date =
        firestoreTimestampToDate(
          dateValue
        );


      if (
        !date
      ) {

        return "-";

      }


      return date.toLocaleString(
        "en-IN",
        {

          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit"

        }
      );

    };


  // ============================================================
  // DISPLAY FALLBACK VALUE
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "-"
    ) => {

      if (
        value === null ||
        value === undefined ||
        String(
          value
        ).trim() ===
          ""
      ) {

        return fallback;

      }


      return value;

    };


  // ============================================================
  // GET NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon =
    (
      type
    ) => {

      const notificationIcons = {

        Attendance:
          "🚨",

        Fees:
          "💰",

        Fee:
          "💳",

        Health:
          "🏥",

        Medical:
          "🩺",

        Academic:
          "📚",

        Examination:
          "📝",

        Exam:
          "📝",

        Homework:
          "📖",

        Behaviour:
          "⚠️",

        Discipline:
          "⚠️",

        Transport:
          "🚌",

        Hostel:
          "🏠",

        Event:
          "📅",

        General:
          "🔔",

        Emergency:
          "🚑"

      };


      return (
        notificationIcons[
          type
        ] ||
        "🔔"
      );

    };


  // ============================================================
  // GET NOTIFICATION TYPE COLOR
  // ============================================================

  const getNotificationTypeColor =
    (
      type
    ) => {

      const typeColors = {

        Attendance:
          "#dc2626",

        Fees:
          "#b45309",

        Fee:
          "#b45309",

        Health:
          "#0891b2",

        Medical:
          "#0891b2",

        Academic:
          "#2563eb",

        Examination:
          "#7c3aed",

        Exam:
          "#7c3aed",

        Homework:
          "#4f46e5",

        Behaviour:
          "#ea580c",

        Discipline:
          "#ea580c",

        Transport:
          "#0284c7",

        Hostel:
          "#9333ea",

        Event:
          "#059669",

        Emergency:
          "#b91c1c",

        General:
          "#475569"

      };


      return (
        typeColors[
          type
        ] ||
        "#475569"
      );

    };


  // ============================================================
  // GET NOTIFICATION TYPE BACKGROUND
  // ============================================================

  const getNotificationTypeBackground =
    (
      type
    ) => {

      const typeBackgrounds = {

        Attendance:
          "#fee2e2",

        Fees:
          "#fef3c7",

        Fee:
          "#fef3c7",

        Health:
          "#cffafe",

        Medical:
          "#cffafe",

        Academic:
          "#dbeafe",

        Examination:
          "#ede9fe",

        Exam:
          "#ede9fe",

        Homework:
          "#e0e7ff",

        Behaviour:
          "#ffedd5",

        Discipline:
          "#ffedd5",

        Transport:
          "#e0f2fe",

        Hostel:
          "#f3e8ff",

        Event:
          "#d1fae5",

        Emergency:
          "#fee2e2",

        General:
          "#f1f5f9"

      };


      return (
        typeBackgrounds[
          type
        ] ||
        "#f1f5f9"
      );

    };


  // ============================================================
  // GET PRIORITY COLOR
  // ============================================================

  const getPriorityColor =
    (
      priority
    ) => {

      const priorityColors = {

        Critical:
          "#b91c1c",

        High:
          "#dc2626",

        Normal:
          "#2563eb",

        Low:
          "#64748b"

      };


      return (
        priorityColors[
          priority
        ] ||
        "#2563eb"
      );

    };


  // ============================================================
  // GET PRIORITY BACKGROUND
  // ============================================================

  const getPriorityBackground =
    (
      priority
    ) => {

      const priorityBackgrounds = {

        Critical:
          "#fee2e2",

        High:
          "#fee2e2",

        Normal:
          "#dbeafe",

        Low:
          "#f1f5f9"

      };


      return (
        priorityBackgrounds[
          priority
        ] ||
        "#dbeafe"
      );

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


      setShowNotificationDetails(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      // ========================================================
      // AUTOMATICALLY MARK AS READ WHEN OPENED
      // ========================================================

      if (
        !notification.isRead
      ) {

        try {

          await updateDoc(
            doc(
              db,
              "studentNotifications",
              notification.id
            ),
            {

              isRead:
                true,

              readAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp()

            }
          );


          setNotifications(
            (
              previousNotifications
            ) =>
              previousNotifications.map(
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

                    isRead:
                      true,

                    readAt:
                      new Date(),

                    updatedAt:
                      new Date()

                  };

                }
              )
          );


          setSelectedNotification(
            (
              previousSelectedNotification
            ) => {

              if (
                !previousSelectedNotification
              ) {

                return previousSelectedNotification;

              }


              return {

                ...previousSelectedNotification,

                isRead:
                  true,

                readAt:
                  new Date(),

                updatedAt:
                  new Date()

              };

            }
          );

        }
        catch (
          error
        ) {

          console.error(
            "Unable to automatically mark notification as read:",
            error
          );

        }

      }


      setTimeout(
        () => {

          window.scrollTo(
            {

              top:
                document.body.scrollHeight,

              behavior:
                "smooth"

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

      setSelectedNotification(
        null
      );


      setShowNotificationDetails(
        false
      );

    };


  // ============================================================
  // UPDATE SINGLE NOTIFICATION READ STATUS
  // ============================================================

  const updateNotificationReadStatus =
    async (
      notification,
      newReadStatus
    ) => {

      if (
        !notification?.id ||
        isUpdating
      ) {

        return;

      }


      setIsUpdating(
        true
      );


      setActionNotificationId(
        notification.id
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const updateData = {

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

        };


        await updateDoc(
          doc(
            db,
            "studentNotifications",
            notification.id
          ),
          updateData
        );


        // ======================================================
        // UPDATE LOCAL NOTIFICATION LIST
        // ======================================================

        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.map(
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

                  isRead:
                    newReadStatus,

                  readAt:
                    newReadStatus
                      ?
                      new Date()
                      :
                      null,

                  updatedAt:
                    new Date()

                };

              }
            )
        );


        // ======================================================
        // UPDATE OPEN NOTIFICATION DETAILS
        // ======================================================

        setSelectedNotification(
          (
            previousSelectedNotification
          ) => {

            if (
              !previousSelectedNotification ||
              previousSelectedNotification.id !==
              notification.id
            ) {

              return previousSelectedNotification;

            }


            return {

              ...previousSelectedNotification,

              isRead:
                newReadStatus,

              readAt:
                newReadStatus
                  ?
                  new Date()
                  :
                  null,

              updatedAt:
                new Date()

            };

          }
        );


        setSuccessMessage(
          newReadStatus
            ?
            "Notification marked as read."
            :
            "Notification marked as unread."
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error updating notification:",
          error
        );


        setErrorMessage(
          "Unable to update the notification."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsUpdating(
            false
          );


          setActionNotificationId(
            ""
          );

        }

      }

    };


  // ============================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ============================================================

  const markAllNotificationsAsRead =
    async () => {

      const unreadNotifications =
        notifications.filter(
          (
            notification
          ) =>
            !notification.isRead
        );


      if (
        unreadNotifications.length === 0 ||
        isMarkingAllRead
      ) {

        return;

      }


      const confirmed =
        window.confirm(
          `Mark all ${unreadNotifications.length} unread notifications as read?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      setIsMarkingAllRead(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const batch =
          writeBatch(
            db
          );


        unreadNotifications.forEach(
          (
            notification
          ) => {

            batch.update(
              doc(
                db,
                "studentNotifications",
                notification.id
              ),
              {

                isRead:
                  true,

                readAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp()

              }
            );

          }
        );


        await batch.commit();


        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.map(
              (
                notification
              ) => {

                if (
                  notification.isRead
                ) {

                  return notification;

                }


                return {

                  ...notification,

                  isRead:
                    true,

                  readAt:
                    new Date(),

                  updatedAt:
                    new Date()

                };

              }
            )
        );


        if (
          selectedNotification &&
          !selectedNotification.isRead
        ) {

          setSelectedNotification(
            (
              previousSelectedNotification
            ) => ({

              ...previousSelectedNotification,

              isRead:
                true,

              readAt:
                new Date(),

              updatedAt:
                new Date()

            })
          );

        }


        setSuccessMessage(
          `${unreadNotifications.length} notifications marked as read.`
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error marking all notifications as read:",
          error
        );


        setErrorMessage(
          "Unable to mark all notifications as read."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsMarkingAllRead(
            false
          );

        }

      }

    };


  // ============================================================
  // OPEN SINGLE DELETE CONFIRMATION
  // ============================================================

  const requestDeleteNotification =
    (
      notification
    ) => {

      setNotificationPendingDelete(
        notification
      );


      setShowDeleteConfirmation(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );

    };


  // ============================================================
  // CANCEL SINGLE DELETE
  // ============================================================

  const cancelDeleteNotification =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setNotificationPendingDelete(
        null
      );


      setShowDeleteConfirmation(
        false
      );

    };


  // ============================================================
  // CONFIRM SINGLE NOTIFICATION DELETE
  // ============================================================

  const confirmDeleteNotification =
    async () => {

      if (
        !notificationPendingDelete?.id ||
        isDeleting
      ) {

        return;

      }


      setIsDeleting(
        true
      );


      setActionNotificationId(
        notificationPendingDelete.id
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const deletedNotificationId =
          notificationPendingDelete.id;


        await deleteDoc(
          doc(
            db,
            "studentNotifications",
            deletedNotificationId
          )
        );


        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.filter(
              (
                notification
              ) =>
                notification.id !==
                deletedNotificationId
            )
        );


        setSelectedNotificationIds(
          (
            previousSelectedIds
          ) =>
            previousSelectedIds.filter(
              (
                notificationId
              ) =>
                notificationId !==
                deletedNotificationId
            )
        );


        if (
          selectedNotification?.id ===
          deletedNotificationId
        ) {

          setSelectedNotification(
            null
          );


          setShowNotificationDetails(
            false
          );

        }


        setNotificationPendingDelete(
          null
        );


        setShowDeleteConfirmation(
          false
        );


        setSuccessMessage(
          "Notification deleted successfully."
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting notification:",
          error
        );


        setErrorMessage(
          "Unable to delete the notification."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDeleting(
            false
          );


          setActionNotificationId(
            ""
          );

        }

      }

    };


  // ============================================================
  // TOGGLE SINGLE NOTIFICATION SELECTION
  // ============================================================

  const toggleNotificationSelection =
    (
      notificationId
    ) => {

      setSelectedNotificationIds(
        (
          previousSelectedIds
        ) => {

          if (
            previousSelectedIds.includes(
              notificationId
            )
          ) {

            return previousSelectedIds.filter(
              (
                selectedId
              ) =>
                selectedId !==
                notificationId
            );

          }


          return [

            ...previousSelectedIds,

            notificationId

          ];

        }
      );

    };


  // ============================================================
  // CHECK IF ALL FILTERED NOTIFICATIONS ARE SELECTED
  // ============================================================

  const allFilteredNotificationsSelected =
    useMemo(
      () => {

        if (
          filteredNotifications.length === 0
        ) {

          return false;

        }


        return filteredNotifications.every(
          (
            notification
          ) =>
            selectedNotificationIds.includes(
              notification.id
            )
        );

      },
      [
        filteredNotifications,
        selectedNotificationIds
      ]
    );


  // ============================================================
  // SELECT OR UNSELECT ALL FILTERED NOTIFICATIONS
  // ============================================================

  const toggleSelectAllFilteredNotifications =
    () => {

      const filteredIds =
        filteredNotifications.map(
          (
            notification
          ) =>
            notification.id
        );


      if (
        allFilteredNotificationsSelected
      ) {

        setSelectedNotificationIds(
          (
            previousSelectedIds
          ) =>
            previousSelectedIds.filter(
              (
                selectedId
              ) =>
                !filteredIds.includes(
                  selectedId
                )
            )
        );


        return;

      }


      setSelectedNotificationIds(
        (
          previousSelectedIds
        ) => [

          ...new Set(
            [

              ...previousSelectedIds,

              ...filteredIds

            ]
          )

        ]
      );

    };


  // ============================================================
  // CLEAR SELECTED NOTIFICATIONS
  // ============================================================

  const clearSelectedNotifications =
    () => {

      setSelectedNotificationIds(
        []
      );

    };


  // ============================================================
  // BULK UPDATE READ STATUS
  // ============================================================

  const bulkUpdateReadStatus =
    async (
      newReadStatus
    ) => {

      if (
        selectedNotificationIds.length === 0 ||
        isBulkActionRunning
      ) {

        return;

      }


      setIsBulkActionRunning(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const batch =
          writeBatch(
            db
          );


        selectedNotificationIds.forEach(
          (
            notificationId
          ) => {

            batch.update(
              doc(
                db,
                "studentNotifications",
                notificationId
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

          }
        );


        await batch.commit();


        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.map(
              (
                notification
              ) => {

                if (
                  !selectedNotificationIds.includes(
                    notification.id
                  )
                ) {

                  return notification;

                }


                return {

                  ...notification,

                  isRead:
                    newReadStatus,

                  readAt:
                    newReadStatus
                      ?
                      new Date()
                      :
                      null,

                  updatedAt:
                    new Date()

                };

              }
            )
        );


        if (
          selectedNotification &&
          selectedNotificationIds.includes(
            selectedNotification.id
          )
        ) {

          setSelectedNotification(
            (
              previousSelectedNotification
            ) => ({

              ...previousSelectedNotification,

              isRead:
                newReadStatus,

              readAt:
                newReadStatus
                  ?
                  new Date()
                  :
                  null,

              updatedAt:
                new Date()

            })
          );

        }


        setSuccessMessage(
          `${selectedNotificationIds.length} notifications marked as ${
            newReadStatus
              ?
              "read"
              :
              "unread"
          }.`
        );


        setSelectedNotificationIds(
          []
        );

      }
      catch (
        error
      ) {

        console.error(
          "Bulk notification update error:",
          error
        );


        setErrorMessage(
          "Unable to update the selected notifications."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsBulkActionRunning(
            false
          );

        }

      }

    };


  // ============================================================
  // REQUEST BULK DELETE
  // ============================================================

  const requestBulkDelete =
    () => {

      if (
        selectedNotificationIds.length === 0
      ) {

        return;

      }


      setShowBulkDeleteConfirmation(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );

    };


  // ============================================================
  // CANCEL BULK DELETE
  // ============================================================

  const cancelBulkDelete =
    () => {

      if (
        isBulkActionRunning
      ) {

        return;

      }


      setShowBulkDeleteConfirmation(
        false
      );

    };


  // ============================================================
  // CONFIRM BULK DELETE
  // ============================================================

  const confirmBulkDelete =
    async () => {

      if (
        selectedNotificationIds.length === 0 ||
        isBulkActionRunning
      ) {

        return;

      }


      setIsBulkActionRunning(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const idsToDelete = [
          ...selectedNotificationIds
        ];


        const batch =
          writeBatch(
            db
          );


        idsToDelete.forEach(
          (
            notificationId
          ) => {

            batch.delete(
              doc(
                db,
                "studentNotifications",
                notificationId
              )
            );

          }
        );


        await batch.commit();


        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.filter(
              (
                notification
              ) =>
                !idsToDelete.includes(
                  notification.id
                )
            )
        );


        if (
          selectedNotification &&
          idsToDelete.includes(
            selectedNotification.id
          )
        ) {

          setSelectedNotification(
            null
          );


          setShowNotificationDetails(
            false
          );

        }


        setSelectedNotificationIds(
          []
        );


        setShowBulkDeleteConfirmation(
          false
        );


        setSuccessMessage(
          `${idsToDelete.length} notifications deleted successfully.`
        );

      }
      catch (
        error
      ) {

        console.error(
          "Bulk notification delete error:",
          error
        );


        setErrorMessage(
          "Unable to delete the selected notifications."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsBulkActionRunning(
            false
          );

        }

      }

    };
      // ============================================================
  // CLEAR ALL FILTERS
  // ============================================================

  const clearAllFilters =
    () => {

      setSearchText(
        ""
      );

      setTypeFilter(
        "All"
      );

      setPriorityFilter(
        "All"
      );

      setReadStatusFilter(
        "All"
      );

      setSortOption(
        "Newest"
      );

    };


  // ============================================================
  // CHECK WHETHER FILTERS ARE ACTIVE
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchText ||
      typeFilter !== "All" ||
      priorityFilter !== "All" ||
      readStatusFilter !== "All" ||
      sortOption !== "Newest"
    );


  // ============================================================
  // CHECK WHETHER ANY ACTION IS RUNNING
  // ============================================================

  const isAnyActionRunning =
    Boolean(
      isUpdating ||
      isDeleting ||
      isBulkActionRunning ||
      isMarkingAllRead
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
              🔔 Student Notifications
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View and manage student attendance, fee, health, academic and general notifications.
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

            {
              notificationStatistics.unreadNotifications > 0 && (

                <button
                  type="button"
                  onClick={
                    markAllNotificationsAsRead
                  }
                  disabled={
                    isAnyActionRunning ||
                    loading
                  }
                >
                  {
                    isMarkingAllRead
                      ?
                      "⏳ Marking All..."
                      :
                      "✅ Mark All Read"
                  }
                </button>

              )
            }


            <button
              type="button"
              onClick={
                fetchNotifications
              }
              disabled={
                loading ||
                isAnyActionRunning
              }
            >
              {
                loading
                  ?
                  "⏳ Loading..."
                  :
                  "🔄 Refresh"
              }
            </button>

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
              ✅ {successMessage}
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
              ⚠️ {errorMessage}
            </div>

          )
        }


        {/* ======================================================
            NOTIFICATION STATISTICS
        ====================================================== */}

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              🔔
            </h2>

            <p>
              Total Notifications
            </p>

            <h3>
              {
                notificationStatistics.totalNotifications
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              📩
            </h2>

            <p>
              Unread
            </p>

            <h3>
              {
                notificationStatistics.unreadNotifications
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              🚨
            </h2>

            <p>
              Attendance Alerts
            </p>

            <h3>
              {
                notificationStatistics.attendanceAlerts
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              ⚠️
            </h2>

            <p>
              High Priority
            </p>

            <h3>
              {
                notificationStatistics.highPriorityNotifications
              }
            </h3>

          </div>

        </div>


        {/* ======================================================
            SEARCH AND FILTER SECTION
        ====================================================== */}

        <div
          className="form-card"
          style={{
            marginTop: "24px"
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
                🔎 Search & Filter
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Find notifications by student, message, type, class or parent information.
              </p>

            </div>


            {
              hasActiveFilters && (

                <button
                  type="button"
                  onClick={
                    clearAllFilters
                  }
                  disabled={
                    isAnyActionRunning
                  }
                >
                  ✖ Clear Filters
                </button>

              )
            }

          </div>


          {/* ====================================================
              SEARCH INPUT
          ==================================================== */}

          <div
            style={{
              marginBottom: "18px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "700"
              }}
            >
              Search Notifications
            </label>

            <input
              type="text"
              value={
                searchText
              }
              onChange={
                (
                  event
                ) =>
                  setSearchText(
                    event.target.value
                  )
              }
              placeholder="Search student, ID, class, title, message, mobile..."
              style={{
                width: "100%"
              }}
            />

          </div>


          {/* ====================================================
              FILTER CONTROLS
          ==================================================== */}

          <div className="form-grid">

            {/* ==================================================
                TYPE FILTER
            ================================================== */}

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

                {
                  availableNotificationTypes.map(
                    (
                      notificationType
                    ) => (

                      <option
                        key={
                          notificationType
                        }
                        value={
                          notificationType
                        }
                      >
                        {
                          notificationType
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==================================================
                PRIORITY FILTER
            ================================================== */}

            <div>

              <label>
                Priority
              </label>

              <select
                value={
                  priorityFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setPriorityFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Priorities
                </option>

                <option value="Critical">
                  Critical
                </option>

                <option value="High">
                  High
                </option>

                <option value="Normal">
                  Normal
                </option>

                <option value="Low">
                  Low
                </option>

              </select>

            </div>


            {/* ==================================================
                READ STATUS FILTER
            ================================================== */}

            <div>

              <label>
                Read Status
              </label>

              <select
                value={
                  readStatusFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setReadStatusFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Notifications
                </option>

                <option value="Unread">
                  Unread Only
                </option>

                <option value="Read">
                  Read Only
                </option>

              </select>

            </div>


            {/* ==================================================
                SORT OPTION
            ================================================== */}

            <div>

              <label>
                Sort Notifications
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

                <option value="Newest">
                  Newest First
                </option>

                <option value="Oldest">
                  Oldest First
                </option>

                <option value="Student Name">
                  Student Name
                </option>

                <option value="Priority">
                  Highest Priority
                </option>

              </select>

            </div>

          </div>


          {/* ====================================================
              RESULT COUNT
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
                color: "#475569",
                fontWeight: "600"
              }}
            >
              Showing
              {" "}
              {
                filteredNotifications.length
              }
              {" "}
              of
              {" "}
              {
                notifications.length
              }
              {" "}
              Notifications
            </p>


            {
              hasActiveFilters && (

                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "999px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  Filters Active
                </span>

              )
            }

          </div>

        </div>


        {/* ======================================================
            BULK ACTION TOOLBAR
        ====================================================== */}

        {
          !loading &&
          filteredNotifications.length > 0 && (

            <div
              className="section-card"
              style={{
                marginTop: "20px",
                padding: "16px"
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
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontWeight: "700"
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={
                        allFilteredNotificationsSelected
                      }
                      onChange={
                        toggleSelectAllFilteredNotifications
                      }
                      disabled={
                        isAnyActionRunning
                      }
                    />

                    Select All Visible

                  </label>


                  {
                    selectedNotificationIds.length > 0 && (

                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "999px",
                          background: "#e0e7ff",
                          color: "#4338ca",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          selectedNotificationIds.length
                        }
                        {" "}
                        Selected
                      </span>

                    )
                  }

                </div>


                {
                  selectedNotificationIds.length > 0 && (

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap"
                      }}
                    >

                      <button
                        type="button"
                        onClick={
                          () =>
                            bulkUpdateReadStatus(
                              true
                            )
                        }
                        disabled={
                          isAnyActionRunning
                        }
                      >
                        ✅ Mark Read
                      </button>


                      <button
                        type="button"
                        onClick={
                          () =>
                            bulkUpdateReadStatus(
                              false
                            )
                        }
                        disabled={
                          isAnyActionRunning
                        }
                      >
                        📩 Mark Unread
                      </button>


                      <button
                        type="button"
                        onClick={
                          clearSelectedNotifications
                        }
                        disabled={
                          isAnyActionRunning
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
                          isAnyActionRunning
                        }
                        style={{
                          background: "#dc2626",
                          color: "#ffffff"
                        }}
                      >
                        🗑 Delete Selected
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
          loading && (

            <div
              className="section-card"
              style={{
                marginTop: "24px",
                padding: "45px 20px",
                textAlign: "center"
              }}
            >

              <div
                style={{
                  fontSize: "44px",
                  marginBottom: "12px"
                }}
              >
                ⏳
              </div>

              <h2>
                Loading Student Notifications...
              </h2>

              <p
                style={{
                  color: "#64748b"
                }}
              >
                Please wait while notifications are loaded from Firestore.
              </p>

            </div>

          )
        }


        {/* ======================================================
            EMPTY DATABASE STATE
        ====================================================== */}

        {
          !loading &&
          notifications.length === 0 && (

            <div
              className="section-card"
              style={{
                marginTop: "24px",
                padding: "45px 20px",
                textAlign: "center"
              }}
            >

              <div
                style={{
                  fontSize: "52px",
                  marginBottom: "14px"
                }}
              >
                🔔
              </div>

              <h2>
                No Student Notifications Found
              </h2>

              <p
                style={{
                  maxWidth: "540px",
                  margin: "8px auto 0",
                  color: "#64748b",
                  lineHeight: "1.6"
                }}
              >
                Student notifications generated from attendance, fees, health and other modules will appear here.
              </p>

            </div>

          )
        }


        {/* ======================================================
            NO FILTER RESULTS
        ====================================================== */}

        {
          !loading &&
          notifications.length > 0 &&
          filteredNotifications.length === 0 && (

            <div
              className="section-card"
              style={{
                marginTop: "24px",
                padding: "40px 20px",
                textAlign: "center"
              }}
            >

              <div
                style={{
                  fontSize: "46px",
                  marginBottom: "12px"
                }}
              >
                🔍
              </div>

              <h2>
                No Matching Notifications
              </h2>

              <p
                style={{
                  color: "#64748b"
                }}
              >
                Try changing your search text or filters.
              </p>

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                style={{
                  marginTop: "12px"
                }}
              >
                ✖ Clear All Filters
              </button>

            </div>

          )
        }


        {/* ======================================================
            REAL NOTIFICATION LIST
        ====================================================== */}

        {
          !loading &&
          filteredNotifications.length > 0 && (

            <div
              style={{
                marginTop: "24px"
              }}
            >

              <div
                style={{
                  marginBottom: "16px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 5px"
                  }}
                >
                  📬 Student Notification Inbox
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Open any notification to view complete information and manage its status.
                </p>

              </div>


              <div
                style={{
                  display: "grid",
                  gap: "14px"
                }}
              >

                {
                  filteredNotifications.map(
                    (
                      notification
                    ) => {

                      const notificationIsBusy =
                        actionNotificationId ===
                        notification.id;


                      const notificationTypeColor =
                        getNotificationTypeColor(
                          notification.type
                        );


                      const notificationTypeBackground =
                        getNotificationTypeBackground(
                          notification.type
                        );


                      const priorityColor =
                        getPriorityColor(
                          notification.priority
                        );


                      const priorityBackground =
                        getPriorityBackground(
                          notification.priority
                        );


                      const isSelected =
                        selectedNotificationIds.includes(
                          notification.id
                        );


                      return (

                        <div
                          key={
                            notification.id
                          }
                          className="student-card"
                          style={{
                            margin: 0,
                            position: "relative",
                            overflow: "hidden",
                            border:
                              !notification.isRead
                                ?
                                "1px solid #93c5fd"
                                :
                                undefined,
                            background:
                              !notification.isRead
                                ?
                                "#f8fbff"
                                :
                                undefined
                          }}
                        >

                          {/* ======================================
                              UNREAD ACCENT
                          ====================================== */}

                          {
                            !notification.isRead && (

                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  width: "5px",
                                  background: "#2563eb"
                                }}
                              />

                            )
                          }


                          <div
                            style={{
                              display: "flex",
                              gap: "14px",
                              alignItems: "flex-start"
                            }}
                          >

                            {/* ====================================
                                SELECTION CHECKBOX
                            ==================================== */}

                            <input
                              type="checkbox"
                              checked={
                                isSelected
                              }
                              onChange={
                                () =>
                                  toggleNotificationSelection(
                                    notification.id
                                  )
                              }
                              disabled={
                                isAnyActionRunning
                              }
                              style={{
                                marginTop: "20px",
                                flexShrink: 0
                              }}
                            />


                            {/* ====================================
                                NOTIFICATION ICON
                            ==================================== */}

                            <div
                              style={{
                                width: "62px",
                                height: "62px",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                background:
                                  notificationTypeBackground,
                                color:
                                  notificationTypeColor,
                                fontSize: "28px"
                              }}
                            >
                              {
                                getNotificationIcon(
                                  notification.type
                                )
                              }
                            </div>


                            {/* ====================================
                                MAIN NOTIFICATION INFORMATION
                            ==================================== */}

                            <div
                              style={{
                                minWidth: 0,
                                flex: 1
                              }}
                            >

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                  flexWrap: "wrap"
                                }}
                              >

                                <div>

                                  <h3
                                    style={{
                                      margin: "0 0 5px",
                                      fontWeight:
                                        notification.isRead
                                          ?
                                          "700"
                                          :
                                          "900"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        notification.studentName,
                                        "Unknown Student"
                                      )
                                    }
                                  </h3>

                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >
                                    {
                                      displayValue(
                                        notification.studentId,
                                        "No Student ID"
                                      )
                                    }

                                    {
                                      notification.studentClass && (
                                        <>
                                          {" • "}
                                          {
                                            notification.studentClass
                                          }
                                        </>
                                      )
                                    }
                                  </p>

                                </div>


                                <div
                                  style={{
                                    display: "flex",
                                    gap: "7px",
                                    flexWrap: "wrap"
                                  }}
                                >

                                  <span
                                    style={{
                                      padding: "4px 9px",
                                      borderRadius: "999px",
                                      background:
                                        notificationTypeBackground,
                                      color:
                                        notificationTypeColor,
                                      fontSize: "11px",
                                      fontWeight: "800"
                                    }}
                                  >
                                    {
                                      notification.type
                                    }
                                  </span>


                                  <span
                                    style={{
                                      padding: "4px 9px",
                                      borderRadius: "999px",
                                      background:
                                        priorityBackground,
                                      color:
                                        priorityColor,
                                      fontSize: "11px",
                                      fontWeight: "800"
                                    }}
                                  >
                                    {
                                      notification.priority
                                    }
                                  </span>


                                  {
                                    !notification.isRead && (

                                      <span
                                        style={{
                                          padding: "4px 9px",
                                          borderRadius: "999px",
                                          background: "#dbeafe",
                                          color: "#1d4ed8",
                                          fontSize: "11px",
                                          fontWeight: "800"
                                        }}
                                      >
                                        New
                                      </span>

                                    )
                                  }

                                </div>

                              </div>


                              {/* ==================================
                                  TITLE
                              ================================== */}

                              <h4
                                style={{
                                  margin: "14px 0 6px",
                                  fontSize: "15px"
                                }}
                              >
                                {
                                  displayValue(
                                    notification.title,
                                    "Student Notification"
                                  )
                                }
                              </h4>


                              {/* ==================================
                                  MESSAGE
                              ================================== */}

                              <p
                                style={{
                                  margin: 0,
                                  color: "#475569",
                                  lineHeight: "1.6"
                                }}
                              >
                                {
                                  displayValue(
                                    notification.message,
                                    "No notification message."
                                  )
                                }
                              </p>


                              {/* ==================================
                                  DATE
                              ================================== */}

                              <p
                                style={{
                                  margin: "10px 0 0",
                                  color: "#94a3b8",
                                  fontSize: "12px"
                                }}
                              >
                                🕒
                                {" "}
                                {
                                  formatNotificationDateTime(
                                    notification.createdAt
                                  )
                                }
                              </p>


                              {/* ==================================
                                  ACTION BUTTONS
                              ================================== */}

                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                  marginTop: "14px"
                                }}
                              >

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      openNotificationDetails(
                                        notification
                                      )
                                  }
                                  disabled={
                                    isAnyActionRunning
                                  }
                                >
                                  👀 View Details
                                </button>


                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      updateNotificationReadStatus(
                                        notification,
                                        !notification.isRead
                                      )
                                  }
                                  disabled={
                                    isAnyActionRunning
                                  }
                                >
                                  {
                                    notificationIsBusy &&
                                    isUpdating
                                      ?
                                      "⏳ Updating..."
                                      :
                                    notification.isRead
                                      ?
                                      "📩 Mark Unread"
                                      :
                                      "✅ Mark Read"
                                  }
                                </button>


                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      requestDeleteNotification(
                                        notification
                                      )
                                  }
                                  disabled={
                                    isAnyActionRunning
                                  }
                                  style={{
                                    background: "#dc2626",
                                    color: "#ffffff"
                                  }}
                                >
                                  🗑 Delete
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>

                      );

                    }
                  )
                }

              </div>

            </div>

          )
        }
                {/* ======================================================
            FULL NOTIFICATION DETAILS SECTION
        ====================================================== */}

        {
          showNotificationDetails &&
          selectedNotification && (

            <div
              style={{
                marginTop: "36px"
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
                  marginBottom: "20px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: "0 0 6px"
                    }}
                  >
                    🔔 Notification Details
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    View complete student notification information and manage its status.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeNotificationDetails
                  }
                  disabled={
                    isAnyActionRunning
                  }
                >
                  ✖ Close Details
                </button>

              </div>


              {/* ==================================================
                  NOTIFICATION DETAILS CARD
              ================================================== */}

              <div
                style={{
                  maxWidth: "900px",
                  margin: "0 auto",
                  padding: "26px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 30px rgba(15, 23, 42, 0.08)"
                }}
              >

                {/* ==================================================
                    NOTIFICATION TOP SECTION
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

                  {/* ==================================================
                      LARGE NOTIFICATION ICON
                  ================================================== */}

                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background:
                        getNotificationTypeBackground(
                          selectedNotification.type
                        ),
                      color:
                        getNotificationTypeColor(
                          selectedNotification.type
                        ),
                      fontSize: "38px"
                    }}
                  >
                    {
                      getNotificationIcon(
                        selectedNotification.type
                      )
                    }
                  </div>


                  {/* ==================================================
                      NOTIFICATION MAIN INFORMATION
                  ================================================== */}

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
                        marginBottom: "10px"
                      }}
                    >

                      <span
                        style={{
                          padding: "5px 11px",
                          borderRadius: "999px",
                          background:
                            getNotificationTypeBackground(
                              selectedNotification.type
                            ),
                          color:
                            getNotificationTypeColor(
                              selectedNotification.type
                            ),
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          selectedNotification.type ||
                          "General"
                        }
                      </span>


                      <span
                        style={{
                          padding: "5px 11px",
                          borderRadius: "999px",
                          background:
                            getPriorityBackground(
                              selectedNotification.priority
                            ),
                          color:
                            getPriorityColor(
                              selectedNotification.priority
                            ),
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          selectedNotification.priority ||
                          "Normal"
                        }
                      </span>


                      <span
                        style={{
                          padding: "5px 11px",
                          borderRadius: "999px",
                          background:
                            selectedNotification.isRead
                              ?
                              "#dcfce7"
                              :
                              "#dbeafe",
                          color:
                            selectedNotification.isRead
                              ?
                              "#15803d"
                              :
                              "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          selectedNotification.isRead
                            ?
                            "Read"
                            :
                            "Unread"
                        }
                      </span>

                    </div>


                    <h2
                      style={{
                        margin: "0 0 10px",
                        fontSize: "24px",
                        lineHeight: "1.35"
                      }}
                    >
                      {
                        displayValue(
                          selectedNotification.title,
                          "Student Notification"
                        )
                      }
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        lineHeight: "1.75",
                        fontSize: "15px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word"
                      }}
                    >
                      {
                        displayValue(
                          selectedNotification.message,
                          "No notification message available."
                        )
                      }
                    </p>


                    <p
                      style={{
                        margin: "14px 0 0",
                        color: "#94a3b8",
                        fontSize: "13px"
                      }}
                    >
                      🕒 Created:
                      {" "}
                      {
                        formatNotificationDateTime(
                          selectedNotification.createdAt
                        )
                      }
                    </p>

                  </div>

                </div>


                {/* ==================================================
                    STUDENT INFORMATION HEADING
                ================================================== */}

                <div
                  style={{
                    marginTop: "24px"
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 16px"
                    }}
                  >
                    👨‍🎓 Student Information
                  </h3>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(190px, 1fr))",
                      gap: "16px"
                    }}
                  >

                    {/* ==============================================
                        STUDENT NAME
                    ============================================== */}

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Student Name
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.studentName
                          )
                        }
                      </p>

                    </div>


                    {/* ==============================================
                        STUDENT ID
                    ============================================== */}

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Student ID
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.studentId
                          )
                        }
                      </p>

                    </div>


                    {/* ==============================================
                        ADMISSION NUMBER
                    ============================================== */}

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Admission Number
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.admissionNumber
                          )
                        }
                      </p>

                    </div>


                    {/* ==============================================
                        STUDENT CLASS
                    ============================================== */}

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Class
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.studentClass
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ==================================================
                    PARENT INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "26px",
                    paddingTop: "22px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 16px"
                    }}
                  >
                    👪 Parent / Guardian Information
                  </h3>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px"
                    }}
                  >

                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Parent / Guardian Name
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.parentName
                          )
                        }
                      </p>

                    </div>


                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        background: "#f8fafc"
                      }}
                    >

                      <strong>
                        Parent Mobile Number
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.parentMobile
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ==================================================
                    SYSTEM / NOTIFICATION INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "26px",
                    paddingTop: "22px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <h3
                    style={{
                      margin: "0 0 16px"
                    }}
                  >
                    ⚙️ Notification Information
                  </h3>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(190px, 1fr))",
                      gap: "16px"
                    }}
                  >

                    <div>

                      <strong>
                        Notification Type
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.type,
                            "General"
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Priority
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.priority,
                            "Normal"
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Source
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          displayValue(
                            selectedNotification.source,
                            "Manual"
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Related Record ID
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
                            selectedNotification.relatedRecordId
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Created Date
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          formatNotificationDateTime(
                            selectedNotification.createdAt
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Last Updated
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          formatNotificationDateTime(
                            selectedNotification.updatedAt
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Read Status
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          selectedNotification.isRead
                            ?
                            "Read"
                            :
                            "Unread"
                        }
                      </p>

                    </div>


                    <div>

                      <strong>
                        Read Date
                      </strong>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b"
                        }}
                      >
                        {
                          selectedNotification.readAt
                            ?
                            formatNotificationDateTime(
                              selectedNotification.readAt
                            )
                            :
                            "Not Read Yet"
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ==================================================
                    ACTION URL INFORMATION
                ================================================== */}

                {
                  selectedNotification.actionUrl && (

                    <div
                      style={{
                        marginTop: "26px",
                        paddingTop: "22px",
                        borderTop: "1px solid #e2e8f0"
                      }}
                    >

                      <h3
                        style={{
                          margin: "0 0 12px"
                        }}
                      >
                        🔗 Related Action
                      </h3>


                      <p
                        style={{
                          margin: 0,
                          padding: "12px",
                          borderRadius: "8px",
                          background: "#f8fafc",
                          color: "#475569",
                          wordBreak: "break-word"
                        }}
                      >
                        {
                          selectedNotification.actionUrl
                        }
                      </p>

                    </div>

                  )
                }


                {/* ==================================================
                    DETAILS ACTION BUTTONS
                ================================================== */}

                <div
                  style={{
                    marginTop: "26px",
                    paddingTop: "22px",
                    borderTop: "1px solid #e2e8f0",
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
                        updateNotificationReadStatus(
                          selectedNotification,
                          !selectedNotification.isRead
                        )
                    }
                    disabled={
                      isAnyActionRunning
                    }
                  >
                    {
                      isUpdating &&
                      actionNotificationId ===
                        selectedNotification.id
                        ?
                        "⏳ Updating..."
                        :
                      selectedNotification.isRead
                        ?
                        "📩 Mark as Unread"
                        :
                        "✅ Mark as Read"
                    }
                  </button>


                  <button
                    type="button"
                    onClick={
                      () =>
                        requestDeleteNotification(
                          selectedNotification
                        )
                    }
                    disabled={
                      isAnyActionRunning
                    }
                    style={{
                      background: "#dc2626",
                      color: "#ffffff"
                    }}
                  >
                    🗑 Delete Notification
                  </button>


                  <button
                    type="button"
                    onClick={
                      closeNotificationDetails
                    }
                    disabled={
                      isAnyActionRunning
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
            SINGLE DELETE CONFIRMATION MODAL
        ====================================================== */}

        {
          showDeleteConfirmation &&
          notificationPendingDelete && (

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
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  padding: "26px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  boxShadow:
                    "0 24px 70px rgba(15, 23, 42, 0.35)"
                }}
              >

                {/* ==================================================
                    DELETE ICON
                ================================================== */}

                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    fontSize: "30px"
                  }}
                >
                  🗑
                </div>


                {/* ==================================================
                    DELETE TITLE
                ================================================== */}

                <h2
                  style={{
                    margin: "0 0 10px",
                    textAlign: "center"
                  }}
                >
                  Delete Notification?
                </h2>


                {/* ==================================================
                    DELETE DESCRIPTION
                ================================================== */}

                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  You are about to permanently delete this notification for
                  {" "}
                  <strong>
                    {
                      notificationPendingDelete.studentName ||
                      "this student"
                    }
                  </strong>
                  .
                </p>


                {/* ==================================================
                    NOTIFICATION INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 7px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Student:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        notificationPendingDelete.studentName
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 7px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Student ID:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        notificationPendingDelete.studentId
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 7px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Type:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        notificationPendingDelete.type,
                        "General"
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 7px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Title:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        notificationPendingDelete.title
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Created:
                    </strong>
                    {" "}
                    {
                      formatNotificationDateTime(
                        notificationPendingDelete.createdAt
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    DELETE WARNING
                ================================================== */}

                <p
                  style={{
                    margin: "16px 0 0",
                    textAlign: "center",
                    color: "#b91c1c",
                    fontSize: "13px",
                    fontWeight: "700"
                  }}
                >
                  ⚠️ This action cannot be undone.
                </p>


                {/* ==================================================
                    DELETE BUTTONS
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "22px"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      cancelDeleteNotification
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    ✖ Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      confirmDeleteNotification
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      background: "#dc2626",
                      color: "#ffffff"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting..."
                        :
                        "🗑 Yes, Delete Notification"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            BULK DELETE CONFIRMATION MODAL
        ====================================================== */}

        {
          showBulkDeleteConfirmation &&
          selectedNotificationIds.length > 0 && (

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
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  padding: "28px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  boxShadow:
                    "0 24px 70px rgba(15, 23, 42, 0.35)"
                }}
              >

                {/* ==================================================
                    BULK DELETE ICON
                ================================================== */}

                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    fontSize: "32px"
                  }}
                >
                  🗑
                </div>


                {/* ==================================================
                    BULK DELETE TITLE
                ================================================== */}

                <h2
                  style={{
                    margin: "0 0 10px",
                    textAlign: "center"
                  }}
                >
                  Delete Selected Notifications?
                </h2>


                {/* ==================================================
                    BULK DELETE DESCRIPTION
                ================================================== */}

                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  You are about to permanently delete
                  {" "}
                  <strong>
                    {
                      selectedNotificationIds.length
                    }
                  </strong>
                  {" "}
                  selected
                  {
                    selectedNotificationIds.length === 1
                      ?
                      " notification"
                      :
                      " notifications"
                  }
                  .
                </p>


                {/* ==================================================
                    BULK DELETE SUMMARY
                ================================================== */}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
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

                    <span
                      style={{
                        color: "#475569",
                        fontWeight: "700"
                      }}
                    >
                      Selected Notifications
                    </span>


                    <span
                      style={{
                        minWidth: "38px",
                        height: "38px",
                        padding: "0 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "999px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontWeight: "900"
                      }}
                    >
                      {
                        selectedNotificationIds.length
                      }
                    </span>

                  </div>


                  {/* ==================================================
                      SELECTED NOTIFICATION PREVIEW
                  ================================================== */}

                  <div
                    style={{
                      marginTop: "14px",
                      maxHeight: "180px",
                      overflowY: "auto"
                    }}
                  >

                    {
                      notifications
                        .filter(
                          (
                            notification
                          ) =>
                            selectedNotificationIds.includes(
                              notification.id
                            )
                        )
                        .map(
                          (
                            notification
                          ) => (

                            <div
                              key={
                                notification.id
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 0",
                                borderBottom:
                                  "1px solid #e2e8f0"
                              }}
                            >

                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "50%",
                                  background:
                                    getNotificationTypeBackground(
                                      notification.type
                                    ),
                                  fontSize: "18px"
                                }}
                              >
                                {
                                  getNotificationIcon(
                                    notification.type
                                  )
                                }
                              </div>


                              <div
                                style={{
                                  minWidth: 0,
                                  flex: 1
                                }}
                              >

                                <p
                                  style={{
                                    margin: "0 0 3px",
                                    fontSize: "13px",
                                    fontWeight: "800"
                                  }}
                                >
                                  {
                                    displayValue(
                                      notification.studentName,
                                      "Unknown Student"
                                    )
                                  }
                                </p>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "11px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {
                                    displayValue(
                                      notification.title,
                                      "Student Notification"
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                          )
                        )
                    }

                  </div>

                </div>


                {/* ==================================================
                    BULK DELETE WARNING
                ================================================== */}

                <p
                  style={{
                    margin: "17px 0 0",
                    textAlign: "center",
                    color: "#b91c1c",
                    fontSize: "13px",
                    fontWeight: "700",
                    lineHeight: "1.5"
                  }}
                >
                  ⚠️ All selected notifications will be permanently removed. This action cannot be undone.
                </p>


                {/* ==================================================
                    BULK DELETE BUTTONS
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "22px"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      cancelBulkDelete
                    }
                    disabled={
                      isBulkActionRunning
                    }
                  >
                    ✖ Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      confirmBulkDelete
                    }
                    disabled={
                      isBulkActionRunning
                    }
                    style={{
                      background: "#dc2626",
                      color: "#ffffff"
                    }}
                  >
                    {
                      isBulkActionRunning
                        ?
                        "⏳ Deleting Notifications..."
                        :
                        `🗑 Delete ${selectedNotificationIds.length} Notifications`
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

export default Notifications;