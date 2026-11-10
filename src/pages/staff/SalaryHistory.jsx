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

function SalaryHistory() {
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
  // SALARY DATABASE STATES
  // ============================================================

  const [
    salaryRecords,
    setSalaryRecords
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
    salaryMonthFilter,
    setSalaryMonthFilter
  ] = useState("");


  const [
    paymentMethodFilter,
    setPaymentMethodFilter
  ] = useState("All");


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
  // SALARY DETAILS STATES
  // ============================================================

  const [
    selectedSalaryRecord,
    setSelectedSalaryRecord
  ] = useState(null);


  const [
    showSalaryDetails,
    setShowSalaryDetails
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    salaryRecordToDelete,
    setSalaryRecordToDelete
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
        String(value).trim() === ""
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


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return salaryMonth;

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FORMAT PAYMENT DATE
  // ============================================================

  const formatPaymentDate =
    (
      paymentDate
    ) => {

      if (
        !paymentDate
      ) {

        return "Not Available";

      }


      const dateParts =
        String(
          paymentDate
        ).split("-");


      if (
        dateParts.length !== 3
      ) {

        return paymentDate;

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

        return paymentDate;

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
  // FETCH SALARY HISTORY
  // ============================================================

  const fetchSalaryHistory =
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

          const salarySnapshot =
  await getDocs(

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

            setSalaryRecords(
              salaryList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading salary history:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load salary history. Please check your connection and try again."
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
  // LOAD SALARY HISTORY
  // ============================================================

  useEffect(
    () => {

      fetchSalaryHistory();

    },
    [
      fetchSalaryHistory
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
            salaryRecords
              .map(
                (
                  record
                ) =>
                  record.department
              )
              .filter(Boolean)
          )
        ).sort();

      },
      [
        salaryRecords
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
            salaryRecords
              .map(
                (
                  record
                ) =>
                  record.position
              )
              .filter(Boolean)
          )
        ).sort();

      },
      [
        salaryRecords
      ]
    );


  // ============================================================
  // UNIQUE PAYMENT METHOD OPTIONS
  // ============================================================

  const paymentMethodOptions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            salaryRecords
              .map(
                (
                  record
                ) =>
                  record.paymentMethod
              )
              .filter(Boolean)
          )
        ).sort();

      },
      [
        salaryRecords
      ]
    );


  // ============================================================
  // FILTER AND SORT SALARY RECORDS
  // ============================================================

  const filteredSalaryRecords =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredRecords =
          salaryRecords.filter(
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

                  record.transactionReference,

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


              const matchesSalaryMonth =
                !salaryMonthFilter ||
                record.salaryMonth ===
                  salaryMonthFilter;


              const matchesPaymentMethod =
                paymentMethodFilter === "All" ||
                record.paymentMethod ===
                  paymentMethodFilter;


              return (

                matchesSearch &&

                matchesStatus &&

                matchesDepartment &&

                matchesPosition &&

                matchesSalaryMonth &&

                matchesPaymentMethod

              );

            }
          );


        return filteredRecords.sort(
          (
            firstRecord,
            secondRecord
          ) => {

            if (
              sortOption === "oldest"
            ) {

              return String(
                firstRecord.salaryMonth || ""
              ).localeCompare(
                String(
                  secondRecord.salaryMonth || ""
                )
              );

            }


            if (
              sortOption === "name-ascending"
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
              sortOption === "name-descending"
            ) {

              return normalizeSearchValue(
                secondRecord.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstRecord.staffName
                )
              );

            }


            if (
              sortOption === "amount-high"
            ) {

              return (
                Number(
                  secondRecord.salaryAmount || 0
                ) -
                Number(
                  firstRecord.salaryAmount || 0
                )
              );

            }


            if (
              sortOption === "amount-low"
            ) {

              return (
                Number(
                  firstRecord.salaryAmount || 0
                ) -
                Number(
                  secondRecord.salaryAmount || 0
                )
              );

            }


            return String(
              secondRecord.salaryMonth || ""
            ).localeCompare(
              String(
                firstRecord.salaryMonth || ""
              )
            );

          }
        );

      },
      [
        salaryRecords,
        searchTerm,
        statusFilter,
        departmentFilter,
        positionFilter,
        salaryMonthFilter,
        paymentMethodFilter,
        sortOption
      ]
    );


  // ============================================================
  // SALARY STATISTICS
  // ============================================================

  const salaryStatistics =
    useMemo(
      () => {

        const totalRecords =
          filteredSalaryRecords.length;


        const paidRecords =
          filteredSalaryRecords.filter(
            (
              record
            ) =>
              record.status === "Paid"
          );


        const pendingRecords =
          filteredSalaryRecords.filter(
            (
              record
            ) =>
              record.status === "Pending"
          );


        const totalSalaryAmount =
          filteredSalaryRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              Number(
                record.salaryAmount || 0
              ),
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
                record.salaryAmount || 0
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
                record.salaryAmount || 0
              ),
            0
          );


        return {

          totalRecords,

          paidRecords:
            paidRecords.length,

          pendingRecords:
            pendingRecords.length,

          totalSalaryAmount,

          totalPaidAmount,

          totalPendingAmount

        };

      },
      [
        filteredSalaryRecords
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

          salaryMonthFilter !== "" ||

          paymentMethodFilter !== "All" ||

          sortOption !== "newest"

        );

      },
      [
        searchTerm,
        statusFilter,
        departmentFilter,
        positionFilter,
        salaryMonthFilter,
        paymentMethodFilter,
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

      setSalaryMonthFilter("");

      setPaymentMethodFilter("All");

      setSortOption("newest");


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // OPEN SALARY DETAILS
  // ============================================================

  const openSalaryDetails =
    (
      salaryRecord
    ) => {

      setSelectedSalaryRecord(
        salaryRecord
      );

      setShowSalaryDetails(true);


      setTimeout(
        () => {

          document
            .getElementById(
              "salary-record-details"
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
  // CLOSE SALARY DETAILS
  // ============================================================

  const closeSalaryDetails =
    () => {

      setShowSalaryDetails(false);

      setSelectedSalaryRecord(null);

    };


  // ============================================================
  // REQUEST DELETE SALARY
  // ============================================================

  const requestDeleteSalary =
    (
      salaryRecord
    ) => {

      setSalaryRecordToDelete(
        salaryRecord
      );

      setShowDeleteConfirmation(true);

    };


  // ============================================================
  // CANCEL DELETE SALARY
  // ============================================================

  const cancelDeleteSalary =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setSalaryRecordToDelete(null);

      setShowDeleteConfirmation(false);

    };


  // ============================================================
  // CONFIRM DELETE SALARY
  // ============================================================

  const confirmDeleteSalary =
    async () => {

      if (
        !salaryRecordToDelete ||
        isDeleting
      ) {

        return;

      }


      setIsDeleting(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {
if (
  salaryRecordToDelete.madrasaId !==
  madrasaId
) {

  alert(
    "Access Denied"
  );

  return;

}
        await deleteDoc(
          doc(
            db,
            "staffSalary",
            salaryRecordToDelete.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setSalaryRecords(
            (
              previousRecords
            ) =>
              previousRecords.filter(
                (
                  record
                ) =>
                  record.id !==
                  salaryRecordToDelete.id
              )
          );


          if (
            selectedSalaryRecord?.id ===
            salaryRecordToDelete.id
          ) {

            closeSalaryDetails();

          }


          setSuccessMessage(
            `Salary record for ${
              displayValue(
                salaryRecordToDelete.staffName,
                "staff member"
              )
            } deleted successfully.`
          );


          setSalaryRecordToDelete(null);

          setShowDeleteConfirmation(false);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting salary record:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the salary record. Please try again."
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
  // REFRESH SALARY HISTORY
  // ============================================================

  const refreshSalaryHistory =
    async () => {

      await fetchSalaryHistory(true);

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
              📜 Salary History
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Search, review and manage all staff salary records.
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
                refreshSalaryHistory
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
              to="/add-salary"
              className="action-btn view-btn"
            >
              ➕ Add Salary
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
                  Loading Salary History...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while salary records are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            SALARY HISTORY CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  SALARY STATISTICS
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
                      "Total Records",
                      salaryStatistics.totalRecords,
                      "#475569"
                    ],

                    [
                      "✅",
                      "Paid Records",
                      salaryStatistics.paidRecords,
                      "#15803d"
                    ],

                    [
                      "⏳",
                      "Pending Records",
                      salaryStatistics.pendingRecords,
                      "#b45309"
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
                    💰 TOTAL SALARY AMOUNT
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
                    ✅ TOTAL PAID AMOUNT
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
                    ⏳ TOTAL PENDING AMOUNT
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
                      🔍 Search Salary History
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find salary records using staff details, salary month, payment status and other filters.
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
                    Search Salary Records
                  </label>


                  <input
                    ref={
                      searchInputRef
                    }
                    type="text"
                    placeholder="Search staff name, Staff ID, mobile, position, department, transaction ID or remarks..."
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
                    FILTER GRID
                ================================================ */}

                <div className="form-grid">

                  {/* ==============================================
                      SALARY MONTH FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Salary Month
                    </label>


                    <input
                      type="month"
                      value={
                        salaryMonthFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setSalaryMonthFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    />

                  </div>


                  {/* ==============================================
                      PAYMENT STATUS FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Payment Status
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

                      <option value="Paid">
                        Paid
                      </option>

                      <option value="Pending">
                        Pending
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
                      PAYMENT METHOD FILTER
                  ============================================== */}

                  <div>

                    <label>
                      Payment Method
                    </label>


                    <select
                      value={
                        paymentMethodFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setPaymentMethodFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isDeleting
                      }
                    >

                      <option value="All">
                        All Payment Methods
                      </option>


                      {
                        paymentMethodOptions.map(
                          (
                            paymentMethod
                          ) => (

                            <option
                              key={
                                paymentMethod
                              }
                              value={
                                paymentMethod
                              }
                            >
                              {paymentMethod}
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
                        Newest Month First
                      </option>

                      <option value="oldest">
                        Oldest Month First
                      </option>

                      <option value="name-ascending">
                        Staff Name A → Z
                      </option>

                      <option value="name-descending">
                        Staff Name Z → A
                      </option>

                      <option value="amount-high">
                        Highest Salary First
                      </option>

                      <option value="amount-low">
                        Lowest Salary First
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
                        filteredSalaryRecords.length
                      }
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {
                        salaryRecords.length
                      }
                    </strong>
                    {" "}
                    salary records
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
                salaryRecords.length === 0 &&
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
                        Salary history will appear after staff salary records are saved.
                      </p>


                      <Link
                        to="/add-salary"
                        className="action-btn view-btn"
                      >
                        ➕ Add Staff Salary
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS STATE
              ================================================== */}

              {
                salaryRecords.length > 0 &&
                filteredSalaryRecords.length === 0 && (

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
                        No Matching Salary Records
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        No salary records match your current search and filters.
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
                  SALARY RECORDS LIST
              ================================================== */}

              {
                filteredSalaryRecords.length > 0 && (

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
                          💰 Salary Records
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          View and manage staff salary payment records.
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
                          filteredSalaryRecords.length
                        }
                        {" "}
                        RECORDS
                      </span>

                    </div>


                    {/* ==============================================
                        SALARY RECORD CARDS
                    ============================================== */}

                    {
                      filteredSalaryRecords.map(
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

                            {/* ========================================
                                CARD HEADER
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
                                  gap: "16px",
                                  flex: 1,
                                  minWidth: 0
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
                                    flex: 1,
                                    minWidth: 0
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


                            {/* ========================================
                                SALARY INFORMATION GRID
                            ======================================== */}

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(170px, 1fr))",
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
                                    fontSize: "11px",
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
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  BASIC SALARY
                                </p>


                                <strong>
                                  {
                                    formatCurrency(
                                      record.basicSalary
                                    )
                                  }
                                </strong>

                              </div>


                              <div>

                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#64748b",
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  FINAL SALARY
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
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  PAYMENT METHOD
                                </p>


                                <strong>
                                  {
                                    record.status === "Paid"
                                      ?
                                      displayValue(
                                        record.paymentMethod
                                      )
                                      :
                                      "Not Paid Yet"
                                  }
                                </strong>

                              </div>

                            </div>


                            {/* ========================================
                                PAYMENT INFORMATION
                            ======================================== */}

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "14px",
                                flexWrap: "wrap",
                                marginTop: "18px",
                                padding: "14px",
                                borderRadius: "10px",
                                background:
                                  record.status === "Paid"
                                    ?
                                    "#f0fdf4"
                                    :
                                    "#fffbeb"
                              }}
                            >

                              <div>

                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#64748b",
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  PAYMENT INFORMATION
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
                                    record.status === "Paid"
                                      ?
                                      `Paid on ${formatPaymentDate(
                                        record.paymentDate
                                      )}`
                                      :
                                      "Salary payment is pending"
                                  }
                                </strong>

                              </div>


                              {
                                record.status === "Paid" && (

                                  <div
                                    style={{
                                      textAlign: "right"
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
                                      PAYMENT METHOD
                                    </p>


                                    <strong>
                                      {
                                        displayValue(
                                          record.paymentMethod
                                        )
                                      }
                                    </strong>

                                  </div>

                                )
                              }

                            </div>


                            {/* ========================================
                                CARD ACTION BUTTONS
                            ======================================== */}

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
                                    openSalaryDetails(
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
                                to="/add-salary"
                                className="action-btn edit-btn"
                              >
                                ✏ Update Salary
                              </Link>


                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={
                                  () =>
                                    requestDeleteSalary(
                                      record
                                    )
                                }
                                disabled={
                                  isDeleting
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
                  SELECTED SALARY DETAILS
              ================================================== */}

              {
                showSalaryDetails &&
                selectedSalaryRecord && (

                  <div
                    id="salary-record-details"
                    className="section-card"
                    style={{
                      marginTop: "28px",
                      marginBottom: "22px"
                    }}
                  >

                    {/* ================================================
                        DETAILS HEADER
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
                          👁 Salary Record Details
                        </h2>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete salary and payment information for the selected record.
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={
                          closeSalaryDetails
                        }
                        disabled={
                          isDeleting
                        }
                      >
                        ✖ Close Details
                      </button>

                    </div>


                    {/* ================================================
                        SELECTED STAFF HEADER
                    ================================================ */}

                    <div
                      className="student-card"
                      style={{
                        marginBottom: "20px"
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
                              width: "72px",
                              height: "72px",
                              minWidth: "72px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              background: "#f1f5f9",
                              fontSize: "34px"
                            }}
                          >
                            👳
                          </div>


                          <div>

                            <h2
                              style={{
                                margin: "0 0 8px"
                              }}
                            >
                              {
                                displayValue(
                                  selectedSalaryRecord.staffName,
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
                                    selectedSalaryRecord.staffId
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
                                  selectedSalaryRecord.position
                                )
                              }
                              {" • "}
                              {
                                displayValue(
                                  selectedSalaryRecord.department
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
                                  selectedSalaryRecord.mobileNumber
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
                              getSalaryStatusBackground(
                                selectedSalaryRecord.status
                              ),
                            color:
                              getSalaryStatusColor(
                                selectedSalaryRecord.status
                              ),
                            fontSize: "12px",
                            fontWeight: "800"
                          }}
                        >
                          {
                            getSalaryStatusIcon(
                              selectedSalaryRecord.status
                            )
                          }
                          {" "}
                          {
                            displayValue(
                              selectedSalaryRecord.status
                            )
                          }
                        </span>

                      </div>

                    </div>


                    {/* ================================================
                        COMPLETE SALARY BREAKDOWN
                    ================================================ */}

                    <div
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h3>
                        💰 Salary Breakdown
                      </h3>


                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(190px, 1fr))",
                          gap: "14px"
                        }}
                      >

                        {
                          [

                            [
                              "Salary Month",
                              formatSalaryMonth(
                                selectedSalaryRecord.salaryMonth
                              )
                            ],

                            [
                              "Basic Salary",
                              formatCurrency(
                                selectedSalaryRecord.basicSalary
                              )
                            ],

                            [
                              "Bonus Amount",
                              formatCurrency(
                                selectedSalaryRecord.bonusAmount
                              )
                            ],

                            [
                              "Deduction Amount",
                              formatCurrency(
                                selectedSalaryRecord.deductionAmount
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
                                  {
                                    label.toUpperCase()
                                  }
                                </p>


                                <strong>
                                  {value}
                                </strong>

                              </div>

                            )
                          )
                        }

                      </div>

                    </div>


                    {/* ================================================
                        FINAL SALARY HIGHLIGHT
                    ================================================ */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "14px",
                        flexWrap: "wrap",
                        padding: "18px",
                        marginBottom: "22px",
                        borderRadius: "10px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe"
                      }}
                    >

                      <div>

                        <p
                          style={{
                            margin: "0 0 5px",
                            color: "#1e40af",
                            fontSize: "12px",
                            fontWeight: "800"
                          }}
                        >
                          FINAL SALARY AMOUNT
                        </p>


                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Final salary after bonus and deductions
                        </p>

                      </div>


                      <h2
                        style={{
                          margin: 0,
                          color: "#2563eb",
                          fontSize: "32px"
                        }}
                      >
                        {
                          formatCurrency(
                            selectedSalaryRecord.salaryAmount
                          )
                        }
                      </h2>

                    </div>


                    {/* ================================================
                        PAYMENT DETAILS
                    ================================================ */}

                    <div
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h3>
                        💳 Payment Details
                      </h3>


                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(190px, 1fr))",
                          gap: "14px"
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            PAYMENT STATUS
                          </p>


                          <strong
                            style={{
                              color:
                                getSalaryStatusColor(
                                  selectedSalaryRecord.status
                                )
                            }}
                          >
                            {
                              getSalaryStatusIcon(
                                selectedSalaryRecord.status
                              )
                            }
                            {" "}
                            {
                              displayValue(
                                selectedSalaryRecord.status
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            PAYMENT DATE
                          </p>


                          <strong>
                            {
                              selectedSalaryRecord.status === "Paid"
                                ?
                                formatPaymentDate(
                                  selectedSalaryRecord.paymentDate
                                )
                                :
                                "Not Paid Yet"
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            PAYMENT METHOD
                          </p>


                          <strong>
                            {
                              selectedSalaryRecord.status === "Paid"
                                ?
                                displayValue(
                                  selectedSalaryRecord.paymentMethod
                                )
                                :
                                "Not Applicable"
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            TRANSACTION REFERENCE
                          </p>


                          <strong
                            style={{
                              wordBreak: "break-word"
                            }}
                          >
                            {
                              selectedSalaryRecord.status === "Paid"
                                ?
                                displayValue(
                                  selectedSalaryRecord.transactionReference
                                )
                                :
                                "Not Applicable"
                            }
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* ================================================
                        REMARKS
                    ================================================ */}

                    <div
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h3>
                        📝 Remarks
                      </h3>


                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f8fafc"
                        }}
                      >

                        <p
                          style={{
                            margin: 0,
                            color: "#475569",
                            lineHeight: "1.7",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                          }}
                        >
                          {
                            displayValue(
                              selectedSalaryRecord.remarks,
                              "No remarks added."
                            )
                          }
                        </p>

                      </div>

                    </div>


                    {/* ================================================
                        RECORD INFORMATION
                    ================================================ */}

                    <div>

                      <h3>
                        🕒 Record Information
                      </h3>


                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "14px"
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            CREATED AT
                          </p>


                          <strong>
                            {
                              formatTimestamp(
                                selectedSalaryRecord.createdAt
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
                              margin: "0 0 6px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            LAST UPDATED
                          </p>


                          <strong>
                            {
                              formatTimestamp(
                                selectedSalaryRecord.updatedAt
                              )
                            }
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* ================================================
                        DETAILS ACTIONS
                    ================================================ */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "22px",
                        paddingTop: "20px",
                        borderTop: "1px solid #e2e8f0"
                      }}
                    >

                      <button
                        type="button"
                        onClick={
                          closeSalaryDetails
                        }
                        disabled={
                          isDeleting
                        }
                      >
                        ✖ Close
                      </button>


                      <Link
                        to="/add-salary"
                        className="action-btn edit-btn"
                      >
                        ✏ Update Salary
                      </Link>


                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={
                          () =>
                            requestDeleteSalary(
                              selectedSalaryRecord
                            )
                        }
                        disabled={
                          isDeleting
                        }
                      >
                        🗑 Delete Salary
                      </button>

                    </div>

                  </div>

                )
              }

            </>

          )
        }
                {/* ======================================================
            DELETE CONFIRMATION POPUP
        ====================================================== */}

        {
          showDeleteConfirmation &&
          salaryRecordToDelete && (

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
                    Delete Salary Record?
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    This salary record will be permanently deleted from the database.
                  </p>

                </div>


                {/* ================================================
                    STAFF INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "16px",
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
                            salaryRecordToDelete.staffName,
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
                            salaryRecordToDelete.staffId
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
                            salaryRecordToDelete.position
                          )
                        }
                        {" • "}
                        {
                          displayValue(
                            salaryRecordToDelete.department
                          )
                        }
                      </p>

                    </div>


                    <span
                      style={{
                        padding: "7px 13px",
                        borderRadius: "999px",
                        background:
                          getSalaryStatusBackground(
                            salaryRecordToDelete.status
                          ),
                        color:
                          getSalaryStatusColor(
                            salaryRecordToDelete.status
                          ),
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                    >
                      {
                        getSalaryStatusIcon(
                          salaryRecordToDelete.status
                        )
                      }
                      {" "}
                      {
                        displayValue(
                          salaryRecordToDelete.status
                        )
                      }
                    </span>

                  </div>

                </div>


                {/* ================================================
                    SALARY INFORMATION
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
                      SALARY MONTH
                    </p>


                    <strong>
                      {
                        formatSalaryMonth(
                          salaryRecordToDelete.salaryMonth
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
                      FINAL SALARY
                    </p>


                    <strong
                      style={{
                        color: "#2563eb"
                      }}
                    >
                      {
                        formatCurrency(
                          salaryRecordToDelete.salaryAmount
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
                      PAYMENT STATUS
                    </p>


                    <strong
                      style={{
                        color:
                          getSalaryStatusColor(
                            salaryRecordToDelete.status
                          )
                      }}
                    >
                      {
                        getSalaryStatusIcon(
                          salaryRecordToDelete.status
                        )
                      }
                      {" "}
                      {
                        displayValue(
                          salaryRecordToDelete.status
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
                      PAYMENT METHOD
                    </p>


                    <strong>
                      {
                        salaryRecordToDelete.status === "Paid"
                          ?
                          displayValue(
                            salaryRecordToDelete.paymentMethod
                          )
                          :
                          "Not Applicable"
                      }
                    </strong>

                  </div>

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
                    Warning:
                  </strong>
                  {" "}
                  This action cannot be undone. The salary record for
                  {" "}
                  <strong>
                    {
                      displayValue(
                        salaryRecordToDelete.staffName
                      )
                    }
                  </strong>
                  {" "}
                  for
                  {" "}
                  <strong>
                    {
                      formatSalaryMonth(
                        salaryRecordToDelete.salaryMonth
                      )
                    }
                  </strong>
                  {" "}
                  will be permanently removed.
                </div>


                {/* ================================================
                    DELETE ACTION BUTTONS
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
                      cancelDeleteSalary
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
                      confirmDeleteSalary
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      minWidth: "200px"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting..."
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

export default SalaryHistory;