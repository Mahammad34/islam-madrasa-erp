import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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

function AddSalary() {
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
  // STAFF AND SALARY DATABASE STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  const [
    existingSalaryRecords,
    setExistingSalaryRecords
  ] = useState([]);


  // ============================================================
  // STAFF SELECTION STATES
  // ============================================================

  const [
    selectedStaffDocumentId,
    setSelectedStaffDocumentId
  ] = useState("");


  const [
    staffSearchTerm,
    setStaffSearchTerm
  ] = useState("");


  // ============================================================
  // SALARY FORM STATES
  // ============================================================

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


      const year =
        currentDate.getFullYear();


      const month =
        String(
          currentDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}`;

    }
  );


  const [
    paymentStatus,
    setPaymentStatus
  ] = useState("Paid");


  const [
    paymentDate,
    setPaymentDate
  ] = useState(
    () => {

      const currentDate =
        new Date();


      const year =
        currentDate.getFullYear();


      const month =
        String(
          currentDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          currentDate.getDate()
        ).padStart(
          2,
          "0"
        );


      return `${year}-${month}-${day}`;

    }
  );


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("Cash");


  const [
    transactionReference,
    setTransactionReference
  ] = useState("");


  const [
    bonusAmount,
    setBonusAmount
  ] = useState("");


  const [
    deductionAmount,
    setDeductionAmount
  ] = useState("");


  const [
    remarks,
    setRemarks
  ] = useState("");


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
  // CONFIRMATION POPUP STATE
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
      monthValue
    ) => {

      if (
        !monthValue
      ) {

        return "Not Available";

      }


      const [
        year,
        month
      ] =
        String(
          monthValue
        )
          .split("-")
          .map(
            Number
          );


      if (
        !year ||
        !month
      ) {

        return monthValue;

      }


      return new Date(
        year,
        month - 1,
        1
      ).toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric"
        }
      );

    };


  // ============================================================
  // FETCH STAFF AND EXISTING SALARY RECORDS
  // ============================================================

  const fetchSalaryFormData =
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
            salarySnapshot
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
      "staffSalary"
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
                  member.isDeleted !== true &&
                  getStaffStatus(member) === "Active"
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

            setStaff(staffList);

            setExistingSalaryRecords(
              salaryList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading salary form data:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff and salary information. Please check your connection and try again."
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
  // LOAD FORM DATA
  // ============================================================

  useEffect(
    () => {

      fetchSalaryFormData();

    },
    [
      fetchSalaryFormData
    ]
  );


  // ============================================================
  // SELECTED STAFF MEMBER
  // ============================================================

  const selectedStaff =
    useMemo(
      () => {

        return staff.find(
          (
            member
          ) =>
            member.id ===
            selectedStaffDocumentId
        ) || null;

      },
      [
        staff,
        selectedStaffDocumentId
      ]
    );


  // ============================================================
  // FILTER STAFF SEARCH RESULTS
  // ============================================================

  const filteredStaff =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            staffSearchTerm
          );


        if (
          !normalizedSearchTerm
        ) {

          return staff;

        }


        return staff.filter(
          (
            member
          ) => {

            return [

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

          }
        );

      },
      [
        staff,
        staffSearchTerm
      ]
    );


  // ============================================================
  // AUTO FILL SALARY WHEN STAFF CHANGES
  // ============================================================

  useEffect(
    () => {

      if (
        !selectedStaff
      ) {

        setSalaryAmount("");

        return;

      }


      const staffSalary =
        selectedStaff.salary ||
        selectedStaff.monthlySalary ||
        selectedStaff.salaryAmount ||
        "";


      setSalaryAmount(
        String(
          staffSalary
        )
      );


      setSuccessMessage("");

      setErrorMessage("");

    },
    [
      selectedStaff
    ]
  );


  // ============================================================
  // EXISTING SALARY RECORD FOR STAFF AND MONTH
  // ============================================================

  const existingSalaryRecord =
    useMemo(
      () => {

        if (
          !selectedStaffDocumentId ||
          !salaryMonth
        ) {

          return null;

        }


        return existingSalaryRecords.find(
          (
            record
          ) =>
            record.staffDocumentId ===
              selectedStaffDocumentId &&
            record.salaryMonth ===
              salaryMonth
        ) || null;

      },
      [
        existingSalaryRecords,
        selectedStaffDocumentId,
        salaryMonth
      ]
    );


  // ============================================================
  // LOAD EXISTING SALARY RECORD INTO FORM
  // ============================================================

  useEffect(
    () => {

      if (
        !existingSalaryRecord
      ) {

        return;

      }


      setSalaryAmount(
        String(
          existingSalaryRecord.salaryAmount ||
          ""
        )
      );


      setPaymentStatus(
        existingSalaryRecord.status ||
        "Pending"
      );


      setPaymentDate(
        existingSalaryRecord.paymentDate ||
        ""
      );


      setPaymentMethod(
        existingSalaryRecord.paymentMethod ||
        "Cash"
      );


      setTransactionReference(
        existingSalaryRecord.transactionReference ||
        ""
      );


      setBonusAmount(
        String(
          existingSalaryRecord.bonusAmount ||
          ""
        )
      );


      setDeductionAmount(
        String(
          existingSalaryRecord.deductionAmount ||
          ""
        )
      );


      setRemarks(
        existingSalaryRecord.remarks ||
        ""
      );

    },
    [
      existingSalaryRecord
    ]
  );


  // ============================================================
  // CALCULATE FINAL SALARY
  // ============================================================

  const finalSalaryAmount =
    useMemo(
      () => {

        const basicSalary =
          Number(
            salaryAmount ||
            0
          );


        const bonus =
          Number(
            bonusAmount ||
            0
          );


        const deduction =
          Number(
            deductionAmount ||
            0
          );


        return Math.max(
          basicSalary +
          bonus -
          deduction,
          0
        );

      },
      [
        salaryAmount,
        bonusAmount,
        deductionAmount
      ]
    );


  // ============================================================
  // CREATE SAFE SALARY DOCUMENT ID
  // ============================================================

  const createSalaryDocumentId =
    (
      staffDocumentId,
      monthValue
    ) => {

      const safeStaffDocumentId =
        String(
          staffDocumentId
        ).replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );


      const safeMonthValue =
        String(
          monthValue
        ).replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );


      return `${safeStaffDocumentId}_${safeMonthValue}`;

    };


  // ============================================================
  // VALIDATE SALARY FORM
  // ============================================================

  const validateSalaryForm =
    () => {

      if (
        !selectedStaff
      ) {

        setErrorMessage(
          "Please select a staff member."
        );

        return false;

      }


      if (
        !salaryMonth
      ) {

        setErrorMessage(
          "Please select the salary month."
        );

        return false;

      }


      if (
        salaryAmount === "" ||
        Number(salaryAmount) <= 0
      ) {

        setErrorMessage(
          "Please enter a valid salary amount."
        );

        return false;

      }


      if (
        Number(bonusAmount || 0) < 0
      ) {

        setErrorMessage(
          "Bonus amount cannot be negative."
        );

        return false;

      }


      if (
        Number(deductionAmount || 0) < 0
      ) {

        setErrorMessage(
          "Deduction amount cannot be negative."
        );

        return false;

      }


      if (
        paymentStatus === "Paid" &&
        !paymentDate
      ) {

        setErrorMessage(
          "Please select the payment date for a paid salary."
        );

        return false;

      }


      if (
        paymentStatus === "Paid" &&
        !paymentMethod
      ) {

        setErrorMessage(
          "Please select a payment method."
        );

        return false;

      }


      setErrorMessage("");

      return true;

    };


  // ============================================================
  // REQUEST SAVE SALARY
  // ============================================================

  const requestSaveSalary =
    () => {

      if (
        !validateSalaryForm()
      ) {

        return;

      }


      setShowSaveConfirmation(true);

    };


  // ============================================================
  // CANCEL SAVE SALARY
  // ============================================================

  const cancelSaveSalary =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setShowSaveConfirmation(false);

    };


  // ============================================================
  // REFRESH SALARY FORM
  // ============================================================

  const refreshSalaryForm =
    async () => {

      await fetchSalaryFormData(true);

    };
      // ============================================================
  // RESET SALARY FORM
  // ============================================================

  const resetSalaryForm =
    () => {

      setSelectedStaffDocumentId("");

      setStaffSearchTerm("");

      setSalaryAmount("");

      setPaymentStatus("Paid");

      setPaymentMethod("Cash");

      setTransactionReference("");

      setBonusAmount("");

      setDeductionAmount("");

      setRemarks("");

      setErrorMessage("");

      setSuccessMessage("");

      setShowSaveConfirmation(false);


      const currentDate =
        new Date();


      const year =
        currentDate.getFullYear();


      const month =
        String(
          currentDate.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          currentDate.getDate()
        ).padStart(
          2,
          "0"
        );


      setSalaryMonth(
        `${year}-${month}`
      );


      setPaymentDate(
        `${year}-${month}-${day}`
      );

    };


  // ============================================================
  // SELECT STAFF MEMBER
  // ============================================================

  const selectStaffMember =
    (
      staffDocumentId
    ) => {

      setSelectedStaffDocumentId(
        staffDocumentId
      );


      setStaffSearchTerm("");


      setSuccessMessage("");

      setErrorMessage("");

    };


  // ============================================================
  // CHANGE PAYMENT STATUS
  // ============================================================

  const changePaymentStatus =
    (
      status
    ) => {

      setPaymentStatus(
        status
      );


      if (
        status === "Pending"
      ) {

        setPaymentDate("");

        setTransactionReference("");

      }
      else if (
        status === "Paid" &&
        !paymentDate
      ) {

        const currentDate =
          new Date();


        const year =
          currentDate.getFullYear();


        const month =
          String(
            currentDate.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const day =
          String(
            currentDate.getDate()
          ).padStart(
            2,
            "0"
          );


        setPaymentDate(
          `${year}-${month}-${day}`
        );

      }


      setSuccessMessage("");

    };


  // ============================================================
  // SAVE OR UPDATE SALARY RECORD
  // ============================================================

  const confirmSaveSalary =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      if (
        !validateSalaryForm()
      ) {

        setShowSaveConfirmation(false);

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const salaryDocumentId =
          createSalaryDocumentId(
            selectedStaff.id,
            salaryMonth
          );


        const salaryDocumentReference =
          doc(
            db,
            "staffSalary",
            salaryDocumentId
          );


        const salaryRecord = {
          madrasaId,

          staffDocumentId:
            selectedStaff.id,

          staffId:
            selectedStaff.staffId ||
            "",

          staffName:
            selectedStaff.staffName ||
            "",

          mobileNumber:
            selectedStaff.mobileNumber ||
            "",

          position:
            selectedStaff.position ||
            "",

          department:
            selectedStaff.department ||
            "",

          employmentType:
            selectedStaff.employmentType ||
            "",

          basicSalary:
            Number(
              salaryAmount
            ),

          salaryAmount:
            Number(
              finalSalaryAmount
            ),

          bonusAmount:
            Number(
              bonusAmount ||
              0
            ),

          deductionAmount:
            Number(
              deductionAmount ||
              0
            ),

          salaryMonth,

          status:
            paymentStatus,

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

          transactionReference:
            paymentStatus === "Paid"
              ?
              transactionReference.trim()
              :
              "",

          remarks:
            remarks.trim(),

          updatedAt:
            serverTimestamp()

        };


        if (
          existingSalaryRecord?.createdAt
        ) {

          salaryRecord.createdAt =
            existingSalaryRecord.createdAt;

        }
        else {

          salaryRecord.createdAt =
            serverTimestamp();

        }


        await setDoc(
          salaryDocumentReference,
          salaryRecord,
          {
            merge: true
          }
        );


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            existingSalaryRecord
              ?
              `Salary record for ${selectedStaff.staffName} updated successfully.`
              :
              `Salary record for ${selectedStaff.staffName} saved successfully.`
          );


          setShowSaveConfirmation(false);

        }


        await fetchSalaryFormData(
          true
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error saving salary record:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the salary record. Please check your connection and try again."
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
              ➕ Add Staff Salary
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Create and manage monthly salary records for active staff members.
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
                refreshSalaryForm
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
              to="/salary-history"
              className="action-btn view-btn"
            >
              📜 Salary History
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
                  Loading Salary Form...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while active staff and salary records are being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            ADD SALARY CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

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
                        Add active staff members before creating salary records.
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
                  SALARY FORM
              ================================================== */}

              {
                staff.length > 0 && (

                  <>

                    {/* ==============================================
                        SELECT STAFF SECTION
                    ============================================== */}

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
                            👤 Select Staff Member
                          </h2>


                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            Search and select the staff member whose salary you want to manage.
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
                          {staff.length} ACTIVE STAFF
                        </span>

                      </div>


                      {/* ============================================
                          STAFF SEARCH
                      ============================================ */}

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
                          placeholder="Search name, Staff ID, mobile, position or department..."
                          value={
                            staffSearchTerm
                          }
                          onChange={
                            (
                              event
                            ) =>
                              setStaffSearchTerm(
                                event.target.value
                              )
                          }
                          disabled={
                            isSaving
                          }
                        />

                      </div>


                      {/* ============================================
                          STAFF SELECT DROPDOWN
                      ============================================ */}

                      <div>

                        <label>
                          Staff Member *
                        </label>


                        <select
                          value={
                            selectedStaffDocumentId
                          }
                          onChange={
                            (
                              event
                            ) =>
                              selectStaffMember(
                                event.target.value
                              )
                          }
                          disabled={
                            isSaving
                          }
                        >

                          <option value="">
                            Select Staff Member
                          </option>


                          {
                            filteredStaff.map(
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
                                      member.position
                                    )
                                  }
                                </option>

                              )
                            )
                          }

                        </select>

                      </div>


                      {/* ============================================
                          NO SEARCH RESULTS
                      ============================================ */}

                      {
                        filteredStaff.length === 0 && (

                          <div
                            style={{
                              marginTop: "16px",
                              padding: "14px",
                              borderRadius: "10px",
                              background: "#fffbeb",
                              border: "1px solid #fde68a",
                              color: "#92400e"
                            }}
                          >
                            🔍 No staff members match your search.
                          </div>

                        )
                      }

                    </div>


                    {/* ==============================================
                        SELECTED STAFF DETAILS
                    ============================================== */}

                    {
                      selectedStaff && (

                        <div
                          className="student-card"
                          style={{
                            marginBottom: "22px"
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
                                minWidth: 0,
                                flex: 1
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
                                {
                                  selectedStaff.gender === "Female"
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

                                <h2
                                  style={{
                                    margin: "0 0 8px"
                                  }}
                                >
                                  {
                                    displayValue(
                                      selectedStaff.staffName,
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
                                        selectedStaff.staffId
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


                            <span
                              style={{
                                padding: "7px 13px",
                                borderRadius: "999px",
                                background: "#dcfce7",
                                color: "#15803d",
                                fontSize: "12px",
                                fontWeight: "800"
                              }}
                            >
                              ACTIVE STAFF
                            </span>

                          </div>

                        </div>

                      )
                    }


                    {/* ==============================================
                        EXISTING SALARY RECORD NOTICE
                    ============================================== */}

                    {
                      existingSalaryRecord && (

                        <div
                          style={{
                            padding: "14px 16px",
                            marginBottom: "22px",
                            borderRadius: "10px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            color: "#1e40af",
                            lineHeight: "1.6"
                          }}
                        >
                          ℹ️ A salary record already exists for
                          {" "}
                          <strong>
                            {
                              displayValue(
                                selectedStaff?.staffName
                              )
                            }
                          </strong>
                          {" "}
                          for
                          {" "}
                          <strong>
                            {
                              formatSalaryMonth(
                                salaryMonth
                              )
                            }
                          </strong>.
                          {" "}
                          The existing record has been loaded into the form. Saving again will update it instead of creating a duplicate.
                        </div>

                      )
                    }


                    {/* ==============================================
                        SALARY DETAILS SECTION
                    ============================================== */}

                    <div
                      className="section-card"
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h2
                        style={{
                          margin: "0 0 5px"
                        }}
                      >
                        💰 Salary Details
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Enter the salary month, basic salary, bonus and deductions.
                      </p>


                      <div className="form-grid">

                        <div>

                          <label>
                            Salary Month *
                          </label>


                          <input
                            type="month"
                            value={
                              salaryMonth
                            }
                            onChange={
                              (
                                event
                              ) =>
                                setSalaryMonth(
                                  event.target.value
                                )
                            }
                            disabled={
                              isSaving
                            }
                          />

                        </div>


                        <div>

                          <label>
                            Basic Salary *
                          </label>


                          <input
                            type="number"
                            min="0"
                            placeholder="Enter Basic Salary"
                            value={
                              salaryAmount
                            }
                            onChange={
                              (
                                event
                              ) =>
                                setSalaryAmount(
                                  event.target.value
                                )
                            }
                            disabled={
                              isSaving
                            }
                          />

                        </div>


                        <div>

                          <label>
                            Bonus Amount
                          </label>


                          <input
                            type="number"
                            min="0"
                            placeholder="Enter Bonus Amount"
                            value={
                              bonusAmount
                            }
                            onChange={
                              (
                                event
                              ) =>
                                setBonusAmount(
                                  event.target.value
                                )
                            }
                            disabled={
                              isSaving
                            }
                          />

                        </div>


                        <div>

                          <label>
                            Deduction Amount
                          </label>


                          <input
                            type="number"
                            min="0"
                            placeholder="Enter Deduction Amount"
                            value={
                              deductionAmount
                            }
                            onChange={
                              (
                                event
                              ) =>
                                setDeductionAmount(
                                  event.target.value
                                )
                            }
                            disabled={
                              isSaving
                            }
                          />

                        </div>

                      </div>


                      {/* ============================================
                          FINAL SALARY CALCULATION
                      ============================================ */}

                      <div
                        style={{
                          marginTop: "20px",
                          padding: "18px",
                          borderRadius: "10px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe"
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

                          <div>

                            <p
                              style={{
                                margin: "0 0 5px",
                                color: "#1e40af",
                                fontSize: "12px",
                                fontWeight: "700"
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
                              Basic Salary + Bonus − Deduction
                            </p>

                          </div>


                          <h2
                            style={{
                              margin: 0,
                              color: "#2563eb",
                              fontSize: "30px"
                            }}
                          >
                            {
                              formatCurrency(
                                finalSalaryAmount
                              )
                            }
                          </h2>

                        </div>

                      </div>

                    </div>
                                        {/* ==============================================
                        PAYMENT DETAILS SECTION
                    ============================================== */}

                    <div
                      className="section-card"
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h2 style={{ margin: "0 0 5px" }}>
                        💳 Payment Details
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Select the payment status and enter payment information.
                      </p>


                      <div className="form-grid">

                        <div>

                          <label>
                            Payment Status *
                          </label>

                          <select
                            value={paymentStatus}
                            onChange={(event) =>
                              changePaymentStatus(
                                event.target.value
                              )
                            }
                            disabled={isSaving}
                          >
                            <option value="Paid">
                              Paid
                            </option>

                            <option value="Pending">
                              Pending
                            </option>
                          </select>

                        </div>


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
                                <option value="Cash">
                                  Cash
                                </option>

                                <option value="Bank Transfer">
                                  Bank Transfer
                                </option>

                                <option value="UPI">
                                  UPI
                                </option>

                                <option value="Cheque">
                                  Cheque
                                </option>

                                <option value="Other">
                                  Other
                                </option>
                              </select>

                            </div>

                          )
                        }


                        {
                          paymentStatus === "Paid" &&
                          paymentMethod !== "Cash" && (

                            <div>

                              <label>
                                Transaction Reference
                              </label>

                              <input
                                type="text"
                                placeholder="Transaction ID / Reference Number"
                                value={transactionReference}
                                onChange={(event) =>
                                  setTransactionReference(
                                    event.target.value
                                  )
                                }
                                disabled={isSaving}
                              />

                            </div>

                          )
                        }

                      </div>


                      {/* ============================================
                          PAYMENT STATUS INFORMATION
                      ============================================ */}

                      <div
                        style={{
                          marginTop: "20px",
                          padding: "14px 16px",
                          borderRadius: "10px",
                          background:
                            paymentStatus === "Paid"
                              ? "#f0fdf4"
                              : "#fffbeb",
                          border:
                            paymentStatus === "Paid"
                              ? "1px solid #bbf7d0"
                              : "1px solid #fde68a",
                          color:
                            paymentStatus === "Paid"
                              ? "#15803d"
                              : "#92400e",
                          lineHeight: "1.6"
                        }}
                      >
                        {
                          paymentStatus === "Paid"
                            ?
                            "✅ This salary will be recorded as paid."
                            :
                            "⏳ This salary will be recorded as pending payment."
                        }
                      </div>

                    </div>


                    {/* ==============================================
                        REMARKS SECTION
                    ============================================== */}

                    <div
                      className="section-card"
                      style={{
                        marginBottom: "22px"
                      }}
                    >

                      <h2 style={{ margin: "0 0 5px" }}>
                        📝 Salary Remarks
                      </h2>

                      <p
                        style={{
                          margin: "0 0 18px",
                          color: "#64748b"
                        }}
                      >
                        Add optional notes or additional information about this salary record.
                      </p>

                      <textarea
                        placeholder="Enter salary remarks..."
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(
                            event.target.value
                          )
                        }
                        disabled={isSaving}
                        rows="5"
                        style={{
                          width: "100%",
                          resize: "vertical"
                        }}
                      />

                    </div>


                    {/* ==============================================
                        SALARY SUMMARY
                    ============================================== */}

                    {
                      selectedStaff && (

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
                              marginBottom: "20px"
                            }}
                          >

                            <div>

                              <h2 style={{ margin: "0 0 5px" }}>
                                📋 Salary Summary
                              </h2>

                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                Review the salary information before saving.
                              </p>

                            </div>


                            <span
                              style={{
                                padding: "7px 13px",
                                borderRadius: "999px",
                                background:
                                  paymentStatus === "Paid"
                                    ? "#dcfce7"
                                    : "#fef3c7",
                                color:
                                  paymentStatus === "Paid"
                                    ? "#15803d"
                                    : "#b45309",
                                fontSize: "12px",
                                fontWeight: "800"
                              }}
                            >
                              {
                                paymentStatus === "Paid"
                                  ? "✅ PAID"
                                  : "⏳ PENDING"
                              }
                            </span>

                          </div>


                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                              gap: "14px"
                            }}
                          >

                            {
                              [
                                [
                                  "Staff Name",
                                  selectedStaff.staffName
                                ],

                                [
                                  "Staff ID",
                                  selectedStaff.staffId
                                ],

                                [
                                  "Position",
                                  selectedStaff.position
                                ],

                                [
                                  "Department",
                                  selectedStaff.department
                                ],

                                [
                                  "Salary Month",
                                  formatSalaryMonth(
                                    salaryMonth
                                  )
                                ],

                                [
                                  "Basic Salary",
                                  formatCurrency(
                                    salaryAmount
                                  )
                                ],

                                [
                                  "Bonus",
                                  formatCurrency(
                                    bonusAmount
                                  )
                                ],

                                [
                                  "Deduction",
                                  formatCurrency(
                                    deductionAmount
                                  )
                                ],

                                [
                                  "Final Salary",
                                  formatCurrency(
                                    finalSalaryAmount
                                  )
                                ],

                                [
                                  "Payment Status",
                                  paymentStatus
                                ],

                                [
                                  "Payment Date",
                                  paymentStatus === "Paid"
                                    ? displayValue(paymentDate)
                                    : "Not Paid Yet"
                                ],

                                [
                                  "Payment Method",
                                  paymentStatus === "Paid"
                                    ? displayValue(paymentMethod)
                                    : "Not Applicable"
                                ]

                              ].map(
                                ([label, value]) => (

                                  <div
                                    key={label}
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
                                        displayValue(value)
                                      }
                                    </p>

                                  </div>

                                )
                              )
                            }

                          </div>


                          {/* ========================================
                              FINAL SALARY HIGHLIGHT
                          ======================================== */}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "14px",
                              flexWrap: "wrap",
                              marginTop: "20px",
                              padding: "18px",
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
                                FINAL PAYABLE SALARY
                              </p>

                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                Amount after bonus and deductions
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
                                  finalSalaryAmount
                                )
                              }
                            </h2>

                          </div>

                        </div>

                      )
                    }


                    {/* ==============================================
                        FORM ACTION BUTTONS
                    ============================================== */}

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

                        <div>

                          <h3 style={{ margin: "0 0 5px" }}>
                            Ready to Save?
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            Review the information above before saving the salary record.
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
                            onClick={resetSalaryForm}
                            disabled={isSaving}
                          >
                            🔄 Reset Form
                          </button>


                          <button
                            type="button"
                            className="action-btn view-btn"
                            onClick={requestSaveSalary}
                            disabled={
                              isSaving ||
                              !selectedStaff
                            }
                          >
                            {
                              existingSalaryRecord
                                ?
                                "💾 Update Salary Record"
                                :
                                "💾 Save Salary Record"
                            }
                          </button>

                        </div>

                      </div>

                    </div>

                  </>

                )
              }

            </>

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
                  maxWidth: "600px",
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
                    💰
                  </div>


                  <h2 style={{ margin: "0 0 8px" }}>
                    {
                      existingSalaryRecord
                        ?
                        "Update Salary Record?"
                        :
                        "Save Salary Record?"
                    }
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the salary details before confirming.
                  </p>

                </div>


                {/* ================================================
                    STAFF SUMMARY
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

                      <h3 style={{ margin: "0 0 7px" }}>
                        {
                          displayValue(
                            selectedStaff.staffName,
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


                    <span
                      style={{
                        padding: "7px 13px",
                        borderRadius: "999px",
                        background:
                          paymentStatus === "Paid"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          paymentStatus === "Paid"
                            ? "#15803d"
                            : "#b45309",
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                    >
                      {
                        paymentStatus === "Paid"
                          ? "✅ PAID"
                          : "⏳ PENDING"
                      }
                    </span>

                  </div>

                </div>
                                {/* ================================================
                    SALARY BREAKDOWN
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

                  {
                    [

                      [
                        "Salary Month",
                        formatSalaryMonth(
                          salaryMonth
                        )
                      ],

                      [
                        "Basic Salary",
                        formatCurrency(
                          salaryAmount
                        )
                      ],

                      [
                        "Bonus Amount",
                        formatCurrency(
                          bonusAmount
                        )
                      ],

                      [
                        "Deduction Amount",
                        formatCurrency(
                          deductionAmount
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


                          <strong>
                            {value}
                          </strong>

                        </div>

                      )
                    )
                  }

                </div>


                {/* ================================================
                    FINAL SALARY AMOUNT
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    padding: "18px",
                    marginBottom: "18px",
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
                      FINAL PAYABLE SALARY
                    </p>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Basic Salary + Bonus − Deduction
                    </p>

                  </div>


                  <h2
                    style={{
                      margin: 0,
                      color: "#2563eb",
                      fontSize: "30px"
                    }}
                  >
                    {
                      formatCurrency(
                        finalSalaryAmount
                      )
                    }
                  </h2>

                </div>


                {/* ================================================
                    PAYMENT INFORMATION
                ================================================ */}

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <h3>
                    💳 Payment Information
                  </h3>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px"
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
                        PAYMENT STATUS
                      </p>


                      <strong>
                        {
                          paymentStatus === "Paid"
                            ?
                            "✅ Paid"
                            :
                            "⏳ Pending"
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
                        PAYMENT DATE
                      </p>


                      <strong>
                        {
                          paymentStatus === "Paid"
                            ?
                            displayValue(
                              paymentDate
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
                          paymentStatus === "Paid"
                            ?
                            displayValue(
                              paymentMethod
                            )
                            :
                            "Not Applicable"
                        }
                      </strong>

                    </div>


                    {
                      paymentStatus === "Paid" &&
                      paymentMethod !== "Cash" && (

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
                            TRANSACTION REFERENCE
                          </p>


                          <strong
                            style={{
                              wordBreak: "break-word"
                            }}
                          >
                            {
                              displayValue(
                                transactionReference
                              )
                            }
                          </strong>

                        </div>

                      )
                    }

                  </div>

                </div>


                {/* ================================================
                    REMARKS PREVIEW
                ================================================ */}

                {
                  remarks.trim() && (

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
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word"
                        }}
                      >
                        {remarks}
                      </p>

                    </div>

                  )
                }


                {/* ================================================
                    EXISTING RECORD UPDATE NOTICE
                ================================================ */}

                {
                  existingSalaryRecord && (

                    <div
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
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
                        Existing salary record detected.
                      </strong>
                      {" "}
                      Confirming will update the current salary record for
                      {" "}
                      {
                        formatSalaryMonth(
                          salaryMonth
                        )
                      }
                      {" "}
                      instead of creating a duplicate.
                    </div>

                  )
                }


                {/* ================================================
                    NEW RECORD NOTICE
                ================================================ */}

                {
                  !existingSalaryRecord && (

                    <div
                      style={{
                        padding: "14px",
                        marginBottom: "18px",
                        borderRadius: "10px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#15803d",
                        lineHeight: "1.6"
                      }}
                    >
                      ✅ A new salary record will be created for
                      {" "}
                      <strong>
                        {
                          displayValue(
                            selectedStaff.staffName
                          )
                        }
                      </strong>
                      {" "}
                      for
                      {" "}
                      <strong>
                        {
                          formatSalaryMonth(
                            salaryMonth
                          )
                        }
                      </strong>.
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
                      cancelSaveSalary
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
                      confirmSaveSalary
                    }
                    disabled={
                      isSaving
                    }
                    style={{
                      minWidth: "210px"
                    }}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Saving Salary..."
                        :
                        existingSalaryRecord
                          ?
                          "💾 Confirm Update"
                          :
                          "💾 Confirm Save"
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

export default AddSalary;