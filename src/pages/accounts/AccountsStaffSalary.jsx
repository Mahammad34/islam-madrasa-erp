import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp
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

function StaffSalary() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    staffList,
    setStaffList
  ] = useState([]);


  const [
    salaryRecords,
    setSalaryRecords
  ] = useState([]);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    selectedStaffId,
    setSelectedStaffId
  ] = useState("");


  const [
    salaryAmount,
    setSalaryAmount
  ] = useState("");


  const [
    salaryMonth,
    setSalaryMonth
  ] = useState(
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .slice(0, 7);

    }
  );


  const [
    paymentDate,
    setPaymentDate
  ] = useState(
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .split("T")[0];

    }
  );


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("Cash");


  const [
    paymentStatus,
    setPaymentStatus
  ] = useState("Paid");


  const [
    description,
    setDescription
  ] = useState("");


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    monthFilter,
    setMonthFilter
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    paymentMethodFilter,
    setPaymentMethodFilter
  ] = useState("All");


  // ============================================================
  // PAGE PROCESS STATES
  // ============================================================

  const [
    isLoading,
    setIsLoading
  ] = useState(true);


  const [
    isSaving,
    setIsSaving
  ] = useState(false);


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
  // PAYMENT METHODS
  // ============================================================

  const paymentMethods = [

    "Cash",

    "UPI",

    "Bank Transfer",

    "Cheque"

  ];


  // ============================================================
  // PAYMENT STATUSES
  // ============================================================

  const paymentStatuses = [

    "Paid",

    "Pending"

  ];


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
  // CONVERT VALUE TO NUMBER
  // ============================================================

  const getNumber =
    (
      value
    ) => {

      const convertedValue =
        Number(
          value
        );


      return Number.isFinite(
        convertedValue
      )
        ?
        convertedValue
        :
        0;

    };


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      value
    ) => {

      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        }
      ).format(
        getNumber(
          value
        )
      );

    };


  // ============================================================
  // GET TODAY DATE
  // ============================================================

  const getTodayDate =
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .split("T")[0];

    };


  // ============================================================
  // GET CURRENT MONTH
  // ============================================================

  const getCurrentMonth =
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .slice(0, 7);

    };


  // ============================================================
  // FORMAT SALARY MONTH
  // ============================================================

  const formatSalaryMonth =
    (
      monthValue
    ) => {

      if (
        !monthValue
      ) {

        return "Month Not Available";

      }


      const [
        year,
        month
      ] =
        monthValue.split("-");


      const monthDate =
        new Date(
          Number(year),
          Number(month) - 1,
          1
        );


      return monthDate.toLocaleDateString(
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
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "Date Not Available";

      }


      const convertedDate =
        new Date(
          `${dateValue}T00:00:00`
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return "Date Not Available";

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
  // GET STAFF NAME
  // ============================================================

  const getStaffName =
    (
      staff
    ) => {

      return (

        staff.name ||

        staff.staffName ||

        staff.fullName ||

        "Unnamed Staff"

      );

    };


  // ============================================================
  // GET STAFF POSITION
  // ============================================================

  const getStaffPosition =
    (
      staff
    ) => {

      return (

        staff.position ||

        staff.role ||

        staff.designation ||

        "Staff Member"

      );

    };


  // ============================================================
  // FETCH STAFF AND SALARY RECORDS
  // ============================================================

  const fetchSalaryData =
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
          staffSnapshot,
          salarySnapshot
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
                "staffSalaries"
              )
            )

          ]);


        const loadedStaff =
          staffSnapshot.docs.map(
            (
              staffDocument
            ) => ({

              id:
                staffDocument.id,

              ...staffDocument.data()

            })
          );


        const loadedSalaryRecords =
          salarySnapshot.docs.map(
            (
              salaryDocument
            ) => ({

              id:
                salaryDocument.id,

              ...salaryDocument.data(),

              amount:
                getNumber(
                  salaryDocument.data().amount
                )

            })
          );


        loadedStaff.sort(
          (
            firstStaff,
            secondStaff
          ) =>

            getStaffName(
              firstStaff
            ).localeCompare(
              getStaffName(
                secondStaff
              )
            )

        );


        loadedSalaryRecords.sort(
          (
            firstRecord,
            secondRecord
          ) => {

            const monthComparison =
              String(
                secondRecord.salaryMonth ||
                ""
              ).localeCompare(
                String(
                  firstRecord.salaryMonth ||
                  ""
                )
              );


            if (
              monthComparison !== 0
            ) {

              return monthComparison;

            }


            return String(
              secondRecord.paymentDate ||
              ""
            ).localeCompare(
              String(
                firstRecord.paymentDate ||
                ""
              )
            );

          }
        );


        if (
          isMountedRef.current
        ) {

          setStaffList(
            loadedStaff
          );


          setSalaryRecords(
            loadedSalaryRecords
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading staff salary data:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load staff salary records. Please check your connection and try again."
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
  // LOAD STAFF SALARY DATA
  // ============================================================

  useEffect(
    () => {

      fetchSalaryData();

    },
    []
  );


  // ============================================================
  // SELECTED STAFF
  // ============================================================

  const selectedStaff =
    useMemo(
      () => {

        return staffList.find(
          (
            staff
          ) =>
            staff.id ===
            selectedStaffId
        ) || null;

      },
      [
        staffList,
        selectedStaffId
      ]
    );


  // ============================================================
  // HANDLE STAFF SELECTION
  // ============================================================

  const handleStaffSelection =
    (
      staffId
    ) => {

      setSelectedStaffId(
        staffId
      );


      const staff =
        staffList.find(
          (
            staffMember
          ) =>
            staffMember.id ===
            staffId
        );


      if (
        staff
      ) {

        const defaultSalary =

          staff.salary ||

          staff.monthlySalary ||

          staff.basicSalary ||

          "";


        setSalaryAmount(
          defaultSalary
        );

      }
      else {

        setSalaryAmount("");

      }

    };


  // ============================================================
  // RESET SALARY FORM
  // ============================================================

  const resetSalaryForm =
    () => {

      setSelectedStaffId("");

      setSalaryAmount("");

      setSalaryMonth(
        getCurrentMonth()
      );

      setPaymentDate(
        getTodayDate()
      );

      setPaymentMethod("Cash");

      setPaymentStatus("Paid");

      setDescription("");

    };


  // ============================================================
  // SAVE SALARY RECORD
  // ============================================================

  const saveSalaryRecord =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      if (
        !selectedStaff
      ) {

        setErrorMessage(
          "Please select a staff member."
        );

        return;

      }


      const convertedSalaryAmount =
        getNumber(
          salaryAmount
        );


      if (
        convertedSalaryAmount <= 0
      ) {

        setErrorMessage(
          "Please enter a valid salary amount greater than zero."
        );

        return;

      }


      if (
        !salaryMonth
      ) {

        setErrorMessage(
          "Please select the salary month."
        );

        return;

      }


      if (
        paymentStatus === "Paid" &&
        !paymentDate
      ) {

        setErrorMessage(
          "Please select the payment date."
        );

        return;

      }


      const duplicateRecord =
        salaryRecords.some(
          (
            record
          ) =>

            record.staffId ===
              selectedStaff.id &&

            record.salaryMonth ===
              salaryMonth

        );


      if (
        duplicateRecord
      ) {

        setErrorMessage(
          `${getStaffName(
            selectedStaff
          )} already has a salary record for ${formatSalaryMonth(
            salaryMonth
          )}.`
        );

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await addDoc(
          collection(
            db,
            "staffSalaries"
          ),
          {

            staffId:
              selectedStaff.id,

            staffName:
              getStaffName(
                selectedStaff
              ),

            position:
              getStaffPosition(
                selectedStaff
              ),

            amount:
              convertedSalaryAmount,

            salaryMonth,

            paymentDate:
              paymentStatus === "Paid"
                ?
                paymentDate
                :
                "",

            paymentMethod:
              paymentStatus === "Paid"
                ?
                paymentMethod
                :
                "",

            status:
              paymentStatus,

            description:
              description.trim(),

            createdAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          resetSalaryForm();


          setSuccessMessage(
            "Staff salary record saved successfully."
          );


          await fetchSalaryData();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving staff salary:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the salary record. Please try again."
          );

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
  // FILTER SALARY RECORDS
  // ============================================================

  const filteredSalaryRecords =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return salaryRecords.filter(
          (
            record
          ) => {

            const searchableValues =
              [

                record.staffName,

                record.position,

                record.amount,

                record.salaryMonth,

                record.paymentDate,

                record.paymentMethod,

                record.status,

                record.description

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


            const matchesMonth =

              !monthFilter ||

              record.salaryMonth ===
                monthFilter;


            const matchesStatus =

              statusFilter === "All" ||

              record.status ===
                statusFilter;


            const matchesPaymentMethod =

              paymentMethodFilter === "All" ||

              record.paymentMethod ===
                paymentMethodFilter;


            return (

              matchesSearch &&

              matchesMonth &&

              matchesStatus &&

              matchesPaymentMethod

            );

          }
        );

      },
      [
        salaryRecords,
        searchTerm,
        monthFilter,
        statusFilter,
        paymentMethodFilter
      ]
    );


  // ============================================================
  // SALARY STATISTICS
  // ============================================================

  const salaryStatistics =
    useMemo(
      () => {

        const currentMonth =
          getCurrentMonth();


        const currentMonthRecords =
          salaryRecords.filter(
            (
              record
            ) =>
              record.salaryMonth ===
                currentMonth
          );


        const paidAmount =
          currentMonthRecords

            .filter(
              (
                record
              ) =>
                record.status ===
                  "Paid"
            )

            .reduce(
              (
                total,
                record
              ) =>
                total +
                getNumber(
                  record.amount
                ),
              0
            );


        const pendingAmount =
          currentMonthRecords

            .filter(
              (
                record
              ) =>
                record.status ===
                  "Pending"
            )

            .reduce(
              (
                total,
                record
              ) =>
                total +
                getNumber(
                  record.amount
                ),
              0
            );


        const filteredAmount =
          filteredSalaryRecords.reduce(
            (
              total,
              record
            ) =>
              total +
              getNumber(
                record.amount
              ),
            0
          );


        return {

          totalStaff:
            staffList.length,

          currentMonthRecords:
            currentMonthRecords.length,

          paidAmount,

          pendingAmount,

          totalRecords:
            salaryRecords.length,

          filteredRecords:
            filteredSalaryRecords.length,

          filteredAmount

        };

      },
      [
        staffList,
        salaryRecords,
        filteredSalaryRecords
      ]
    );


  // ============================================================
  // REFRESH SALARY DATA
  // ============================================================

  const refreshSalaryData =
    async () => {

      setSuccessMessage("");

      await fetchSalaryData(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setMonthFilter("");

      setStatusFilter("All");

      setPaymentMethodFilter("All");

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    Boolean(
      monthFilter
    ) ||

    statusFilter !== "All" ||

    paymentMethodFilter !== "All";
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
              👳 Staff Salary Management
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Record, track, and manage monthly salary payments for Madrasa staff members.
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

            <Link
              to="/accounts"
              className="action-btn view-btn"
            >
              💰 Accounts Dashboard
            </Link>


            <Link
              to="/staff"
              className="action-btn view-btn"
            >
              👳 Staff Module
            </Link>


            <button
              type="button"
              onClick={refreshSalaryData}
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
                  Loading Staff Salaries...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff and salary records are loaded.
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
                  SALARY SUMMARY CARDS
              ================================================== */}

              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    👥
                  </div>


                  <h2>
                    {
                      salaryStatistics.totalStaff
                    }
                  </h2>


                  <p>
                    Total Staff
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    📄
                  </div>


                  <h2>
                    {
                      salaryStatistics.currentMonthRecords
                    }
                  </h2>


                  <p>
                    Current Month Records
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    ✅
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        salaryStatistics.paidAmount
                      )
                    }
                  </h2>


                  <p>
                    Paid This Month
                  </p>

                </div>


                <div className="summary-card">

                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px"
                    }}
                  >
                    ⏳
                  </div>


                  <h2>
                    {
                      formatCurrency(
                        salaryStatistics.pendingAmount
                      )
                    }
                  </h2>


                  <p>
                    Pending This Month
                  </p>

                </div>

              </div>


              {/* ==================================================
                  SALARY ENTRY FORM
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
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "14px",
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
                      ➕ Add Salary Record
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Select a staff member and record the monthly salary payment details.
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: "999px",
                      background: "#ede9fe",
                      color: "#6d28d9",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}
                  >
                    Salary Entry
                  </span>

                </div>


                {/* ==================================================
                    NO STAFF AVAILABLE
                ================================================== */}

                {
                  staffList.length === 0 && (

                    <div
                      style={{
                        padding: "30px 20px",
                        marginBottom: "20px",
                        borderRadius: "12px",
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "42px",
                          marginBottom: "10px"
                        }}
                      >
                        👳
                      </div>


                      <h3>
                        No Staff Members Found
                      </h3>


                      <p
                        style={{
                          margin: "0 0 16px",
                          color: "#64748b"
                        }}
                      >
                        Add staff members before creating salary records.
                      </p>


                      <Link
                        to="/add-staff"
                        className="action-btn view-btn"
                      >
                        ➕ Add Staff Member
                      </Link>

                    </div>

                  )
                }


                {/* ==================================================
                    SALARY FORM
                ================================================== */}

                {
                  staffList.length > 0 && (

                    <>

                      <div className="form-grid">

                        {/* ========================================
                            SELECT STAFF
                        ======================================== */}

                        <div>

                          <label>
                            Staff Member *
                          </label>


                          <select
                            value={selectedStaffId}
                            onChange={(event) =>
                              handleStaffSelection(
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                          >

                            <option value="">
                              Select Staff Member
                            </option>


                            {
                              staffList.map(
                                (
                                  staff
                                ) => (

                                  <option
                                    key={staff.id}
                                    value={staff.id}
                                  >
                                    {
                                      getStaffName(
                                        staff
                                      )
                                    }
                                    {" - "}
                                    {
                                      getStaffPosition(
                                        staff
                                      )
                                    }
                                  </option>

                                )
                              )
                            }

                          </select>

                        </div>


                        {/* ========================================
                            SALARY AMOUNT
                        ======================================== */}

                        <div>

                          <label>
                            Salary Amount *
                          </label>


                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Enter salary amount"
                            value={salaryAmount}
                            onChange={(event) =>
                              setSalaryAmount(
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                          />

                        </div>


                        {/* ========================================
                            SALARY MONTH
                        ======================================== */}

                        <div>

                          <label>
                            Salary Month *
                          </label>


                          <input
                            type="month"
                            value={salaryMonth}
                            onChange={(event) =>
                              setSalaryMonth(
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                          />

                        </div>


                        {/* ========================================
                            PAYMENT STATUS
                        ======================================== */}

                        <div>

                          <label>
                            Payment Status *
                          </label>


                          <select
                            value={paymentStatus}
                            onChange={(event) =>
                              setPaymentStatus(
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                          >

                            {
                              paymentStatuses.map(
                                (
                                  status
                                ) => (

                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>

                                )
                              )
                            }

                          </select>

                        </div>


                        {/* ========================================
                            PAYMENT DATE
                        ======================================== */}

                        {
                          paymentStatus === "Paid" && (

                            <div>

                              <label>
                                Payment Date *
                              </label>


                              <input
                                type="date"
                                value={paymentDate}
                                onChange={(event) =>
                                  setPaymentDate(
                                    event.target.value
                                  )
                                }
                                disabled={isSaving}
                              />

                            </div>

                          )
                        }


                        {/* ========================================
                            PAYMENT METHOD
                        ======================================== */}

                        {
                          paymentStatus === "Paid" && (

                            <div>

                              <label>
                                Payment Method *
                              </label>


                              <select
                                value={paymentMethod}
                                onChange={(event) =>
                                  setPaymentMethod(
                                    event.target.value
                                  )
                                }
                                disabled={isSaving}
                              >

                                {
                                  paymentMethods.map(
                                    (
                                      method
                                    ) => (

                                      <option
                                        key={method}
                                        value={method}
                                      >
                                        {method}
                                      </option>

                                    )
                                  )
                                }

                              </select>

                            </div>

                          )
                        }

                      </div>


                      {/* ==========================================
                          SELECTED STAFF INFORMATION
                      ========================================== */}

                      {
                        selectedStaff && (

                          <div
                            style={{
                              marginTop: "20px",
                              padding: "16px",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                flexWrap: "wrap"
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
                                  background: "#ede9fe",
                                  fontSize: "24px"
                                }}
                              >
                                👳
                              </div>


                              <div>

                                <h3
                                  style={{
                                    margin: "0 0 5px"
                                  }}
                                >
                                  {
                                    getStaffName(
                                      selectedStaff
                                    )
                                  }
                                </h3>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b"
                                  }}
                                >
                                  {
                                    getStaffPosition(
                                      selectedStaff
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                          </div>

                        )
                      }


                      {/* ==========================================
                          DESCRIPTION
                      ========================================== */}

                      <div
                        style={{
                          marginTop: "18px"
                        }}
                      >

                        <label>
                          Description / Notes
                        </label>


                        <textarea
                          placeholder="Enter optional salary payment notes..."
                          value={description}
                          onChange={(event) =>
                            setDescription(
                              event.target.value
                            )
                          }
                          disabled={isSaving}
                          rows="4"
                          style={{
                            width: "100%",
                            resize: "vertical"
                          }}
                        />

                      </div>


                      {/* ==========================================
                          FORM ACTIONS
                      ========================================== */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "20px"
                        }}
                      >

                        <button
                          type="button"
                          className="save-all-btn"
                          onClick={saveSalaryRecord}
                          disabled={isSaving}
                        >
                          {
                            isSaving
                              ?
                              "⏳ Saving Salary..."
                              :
                              "💾 Save Salary Record"
                          }
                        </button>


                        <button
                          type="button"
                          onClick={resetSalaryForm}
                          disabled={isSaving}
                        >
                          ↻ Reset Form
                        </button>

                      </div>

                    </>

                  )
                }

              </div>


              {/* ==================================================
                  SALARY RECORDS HEADER
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
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
                    📄 Salary Records
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Search and filter monthly staff salary payment records.
                  </p>

                </div>


                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "#ede9fe",
                    color: "#6d28d9",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  {
                    salaryStatistics.filteredRecords
                  } Records
                </span>

              </div>
                            {/* ==================================================
                  SEARCH AND FILTER SECTION
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
                      🔍 Search & Filter Salaries
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find salary records by staff name, month, payment status, or payment method.
                    </p>

                  </div>


                  {
                    hasActiveFilters && (

                      <button
                        type="button"
                        onClick={resetFilters}
                      >
                        ✖ Clear Filters
                      </button>

                    )
                  }

                </div>


                <div className="form-grid">

                  {/* ============================================
                      SEARCH
                  ============================================ */}

                  <div>

                    <label>
                      Search Salary Records
                    </label>


                    <input
                      type="text"
                      placeholder="Search staff, position, amount or notes..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  {/* ============================================
                      MONTH FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Salary Month
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


                  {/* ============================================
                      STATUS FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Payment Status
                    </label>


                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Statuses
                      </option>


                      {
                        paymentStatuses.map(
                          (
                            status
                          ) => (

                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  {/* ============================================
                      PAYMENT METHOD FILTER
                  ============================================ */}

                  <div>

                    <label>
                      Payment Method
                    </label>


                    <select
                      value={paymentMethodFilter}
                      onChange={(event) =>
                        setPaymentMethodFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Payment Methods
                      </option>


                      {
                        paymentMethods.map(
                          (
                            method
                          ) => (

                            <option
                              key={method}
                              value={method}
                            >
                              {method}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>

                </div>


                {/* ==================================================
                    FILTER RESULTS INFORMATION
                ================================================== */}

                <div
                  style={{
                    marginTop: "18px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    lineHeight: "1.7"
                  }}
                >
                  Showing
                  {" "}
                  <strong>
                    {
                      salaryStatistics.filteredRecords
                    }
                  </strong>
                  {" "}
                  of
                  {" "}
                  <strong>
                    {
                      salaryStatistics.totalRecords
                    }
                  </strong>
                  {" "}
                  salary records with a total value of
                  {" "}
                  <strong
                    style={{
                      color: "#6d28d9"
                    }}
                  >
                    {
                      formatCurrency(
                        salaryStatistics.filteredAmount
                      )
                    }
                  </strong>
                </div>

              </div>


              {/* ==================================================
                  NO SALARY RECORDS
              ================================================== */}

              {
                salaryRecords.length === 0 && (

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
                        💼
                      </div>


                      <h2>
                        No Salary Records Yet
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No staff salary payments have been recorded yet. Use the salary entry form above to create the first record.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                salaryRecords.length > 0 &&
                filteredSalaryRecords.length === 0 && (

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
                        No Matching Salary Records
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        No salary records match your current search and filter settings.
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
                  SALARY RECORDS
              ================================================== */}

              {
                filteredSalaryRecords.length > 0 && (

                  <div
                    className="section-card"
                    style={{
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >

                    {
                      filteredSalaryRecords.map(
                        (
                          salaryRecord,
                          index
                        ) => {

                          const isPaid =
                            salaryRecord.status ===
                            "Paid";


                          return (

                            <div
                              key={salaryRecord.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "18px",
                                flexWrap: "wrap",
                                padding: "18px",
                                borderBottom:
                                  index ===
                                  filteredSalaryRecords.length - 1
                                    ?
                                    "none"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              {/* ==================================
                                  STAFF INFORMATION
                              ================================== */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "14px",
                                  flex: "1",
                                  minWidth: "260px"
                                }}
                              >

                                <div
                                  style={{
                                    width: "52px",
                                    height: "52px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "12px",
                                    background: "#ede9fe",
                                    fontSize: "25px",
                                    flexShrink: 0
                                  }}
                                >
                                  👳
                                </div>


                                <div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap",
                                      marginBottom: "7px"
                                    }}
                                  >

                                    <h3
                                      style={{
                                        margin: 0
                                      }}
                                    >
                                      {
                                        salaryRecord.staffName ||
                                        "Unknown Staff"
                                      }
                                    </h3>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "999px",
                                        background:
                                          isPaid
                                            ?
                                            "#dcfce7"
                                            :
                                            "#fef3c7",
                                        color:
                                          isPaid
                                            ?
                                            "#15803d"
                                            :
                                            "#b45309",
                                        fontSize: "10px",
                                        fontWeight: "800"
                                      }}
                                    >
                                      {
                                        salaryRecord.status ||
                                        "Unknown"
                                      }
                                    </span>

                                  </div>


                                  <p
                                    style={{
                                      margin: "0 0 7px",
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >
                                    💼 {
                                      salaryRecord.position ||
                                      "Staff Member"
                                    }
                                  </p>


                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                      flexWrap: "wrap",
                                      color: "#64748b",
                                      fontSize: "13px"
                                    }}
                                  >

                                    <span>
                                      📅 {
                                        formatSalaryMonth(
                                          salaryRecord.salaryMonth
                                        )
                                      }
                                    </span>


                                    {
                                      isPaid && (

                                        <span>
                                          💳 {
                                            salaryRecord.paymentMethod ||
                                            "Not Available"
                                          }
                                        </span>

                                      )
                                    }


                                    {
                                      isPaid && (

                                        <span>
                                          🗓 {
                                            formatPaymentDate(
                                              salaryRecord.paymentDate
                                            )
                                          }
                                        </span>

                                      )
                                    }

                                  </div>


                                  {
                                    salaryRecord.description && (

                                      <p
                                        style={{
                                          margin: "9px 0 0",
                                          color: "#64748b",
                                          fontSize: "13px",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        📝 {
                                          salaryRecord.description
                                        }
                                      </p>

                                    )
                                  }

                                </div>

                              </div>


                              {/* ==================================
                                  SALARY AMOUNT
                              ================================== */}

                              <div
                                style={{
                                  minWidth: "180px",
                                  textAlign: "right"
                                }}
                              >

                                <h2
                                  style={{
                                    margin: "0 0 5px",
                                    color:
                                      isPaid
                                        ?
                                        "#15803d"
                                        :
                                        "#b45309"
                                  }}
                                >
                                  {
                                    formatCurrency(
                                      salaryRecord.amount
                                    )
                                  }
                                </h2>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  {
                                    isPaid
                                      ?
                                      "Salary Paid"
                                      :
                                      "Payment Pending"
                                  }
                                </p>

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
                  PAGE NAVIGATION ACTIONS
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px"
                }}
              >

                <Link
                  to="/accounts"
                  className="action-btn view-btn"
                >
                  💰 Accounts Dashboard
                </Link>


                <Link
                  to="/staff"
                  className="action-btn view-btn"
                >
                  👳 Staff Module
                </Link>


                <Link
                  to="/monthly-report"
                  className="action-btn view-btn"
                >
                  📊 Monthly Report
                </Link>

              </div>


              {/* ==================================================
                  PAGE INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginTop: "24px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                🕌 Staff Salary Management helps Madrasa administrators maintain organized monthly salary records, track paid and pending salaries, and review staff payment history.
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

export default StaffSalary;