import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where
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

function AddStaff() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const formTopRef =
    useRef(null);


  // ============================================================
  // BASIC STAFF INFORMATION
  // ============================================================

  const [
    staffName,
    setStaffName
  ] = useState("");


  const [
    staffId,
    setStaffId
  ] = useState("");


  const [
    gender,
    setGender
  ] = useState("");


  const [
    dateOfBirth,
    setDateOfBirth
  ] = useState("");


  const [
    bloodGroup,
    setBloodGroup
  ] = useState("");


  const [
    maritalStatus,
    setMaritalStatus
  ] = useState("");


  const [
    nationality,
    setNationality
  ] = useState("Indian");


  // ============================================================
  // CONTACT INFORMATION
  // ============================================================

  const [
    mobileNumber,
    setMobileNumber
  ] = useState("");


  const [
    alternateMobileNumber,
    setAlternateMobileNumber
  ] = useState("");


  const [
    emailAddress,
    setEmailAddress
  ] = useState("");


  // ============================================================
  // EMPLOYMENT INFORMATION
  // ============================================================

  const [
    position,
    setPosition
  ] = useState("");


  const [
    department,
    setDepartment
  ] = useState("");


  const [
    employmentType,
    setEmploymentType
  ] = useState("Full Time");


  const [
    joiningDate,
    setJoiningDate
  ] = useState("");


  const [
    staffStatus,
    setStaffStatus
  ] = useState("Active");


  const [
    workShift,
    setWorkShift
  ] = useState("");


  // ============================================================
  // QUALIFICATION AND EXPERIENCE
  // ============================================================

  const [
    highestQualification,
    setHighestQualification
  ] = useState("");


  const [
    specialization,
    setSpecialization
  ] = useState("");


  const [
    totalExperience,
    setTotalExperience
  ] = useState("");


  const [
    previousInstitution,
    setPreviousInstitution
  ] = useState("");


  // ============================================================
  // SALARY INFORMATION
  // ============================================================

  const [
    salary,
    setSalary
  ] = useState("");


  const [
    salaryType,
    setSalaryType
  ] = useState("Monthly");


  const [
    paymentMethod,
    setPaymentMethod
  ] = useState("");


  // ============================================================
  // BANK INFORMATION
  // ============================================================

  const [
    accountHolderName,
    setAccountHolderName
  ] = useState("");


  const [
    bankName,
    setBankName
  ] = useState("");


  const [
    accountNumber,
    setAccountNumber
  ] = useState("");


  const [
    ifscCode,
    setIfscCode
  ] = useState("");


  // ============================================================
  // IDENTITY INFORMATION
  // ============================================================

  const [
    aadhaarNumber,
    setAadhaarNumber
  ] = useState("");


  const [
    panNumber,
    setPanNumber
  ] = useState("");


  // ============================================================
  // ADDRESS INFORMATION
  // ============================================================

  const [
    address,
    setAddress
  ] = useState("");


  const [
    city,
    setCity
  ] = useState("");


  const [
    stateName,
    setStateName
  ] = useState("");


  const [
    postalCode,
    setPostalCode
  ] = useState("");


  // ============================================================
  // EMERGENCY CONTACT INFORMATION
  // ============================================================

  const [
    emergencyContactName,
    setEmergencyContactName
  ] = useState("");


  const [
    emergencyContactRelation,
    setEmergencyContactRelation
  ] = useState("");


  const [
    emergencyContactNumber,
    setEmergencyContactNumber
  ] = useState("");


  // ============================================================
  // ADDITIONAL INFORMATION
  // ============================================================

  const [
    notes,
    setNotes
  ] = useState("");


  // ============================================================
  // FORM PROCESS STATES
  // ============================================================

  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    isGeneratingStaffId,
    setIsGeneratingStaffId
  ] = useState(false);


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    fieldErrors,
    setFieldErrors
  ] = useState({});


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
  // POSITION OPTIONS
  // ============================================================

  const positionOptions =
    useMemo(
      () => [

        "Principal",

        "Head Teacher",

        "Teacher",

        "Hifz Teacher",

        "Nazra Teacher",

        "Quran Teacher",

        "Arabic Teacher",

        "Islamic Studies Teacher",

        "Urdu Teacher",

        "Accountant",

        "Administrator",

        "Office Staff",

        "Hostel Warden",

        "Cook",

        "Driver",

        "Security",

        "Cleaner",

        "Other"

      ],
      []
    );


  // ============================================================
  // DEPARTMENT OPTIONS
  // ============================================================

  const departmentOptions =
    useMemo(
      () => [

        "Administration",

        "Academics",

        "Hifz",

        "Nazra",

        "Quran",

        "Arabic",

        "Islamic Studies",

        "Accounts",

        "Hostel",

        "Transport",

        "Kitchen",

        "Security",

        "Maintenance",

        "Other"

      ],
      []
    );


  // ============================================================
  // BLOOD GROUP OPTIONS
  // ============================================================

  const bloodGroupOptions =
    useMemo(
      () => [

        "A+",

        "A-",

        "B+",

        "B-",

        "AB+",

        "AB-",

        "O+",

        "O-",

        "Unknown"

      ],
      []
    );


  // ============================================================
  // GENERATE STAFF ID
  // ============================================================

  const generateStaffId =
    useCallback(
      async () => {

        if (
          isGeneratingStaffId
        ) {

          return;

        }


        setIsGeneratingStaffId(
          true
        );


        setErrorMessage(
          ""
        );


        try {

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

const staffSnapshot =
  await getDocs(
    staffQuery
  );


          let highestStaffNumber =
            0;


          staffSnapshot.docs.forEach(
            (
              staffDocument
            ) => {

              const staffData =
                staffDocument.data();


              const existingStaffId =
                String(
                  staffData.staffId ||
                  ""
                );


              const numberMatch =
                existingStaffId.match(
                  /(\d+)$/
                );


              if (
                numberMatch
              ) {

                const staffNumber =
                  Number(
                    numberMatch[1]
                  );


                if (
                  staffNumber >
                  highestStaffNumber
                ) {

                  highestStaffNumber =
                    staffNumber;

                }

              }

            }
          );


          const nextStaffNumber =
            highestStaffNumber +
            1;


          const generatedStaffId =
            `STF${String(
              nextStaffNumber
            ).padStart(
              4,
              "0"
            )}`;


          if (
            isMountedRef.current
          ) {

            setStaffId(
              generatedStaffId
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error generating staff ID:",
            error
          );


          if (
            isMountedRef.current
          ) {

            const fallbackStaffId =
              `STF${Date.now()
                .toString()
                .slice(
                  -6
                )}`;


            setStaffId(
              fallbackStaffId
            );


            setErrorMessage(
              "Automatic sequence generation failed. A temporary unique staff ID was generated."
            );

          }

        }
        finally {

          if (
            isMountedRef.current
          ) {

            setIsGeneratingStaffId(
              false
            );

          }

        }

      },
      [
        isGeneratingStaffId
      ]
    );


  // ============================================================
  // AUTOMATICALLY GENERATE STAFF ID WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      generateStaffId();

    },
    []
  );


  // ============================================================
  // CLEAN MOBILE NUMBER
  // ============================================================

  const cleanMobileNumber =
    (
      value
    ) => {

      return value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          10
        );

    };


  // ============================================================
  // CLEAN AADHAAR NUMBER
  // ============================================================

  const cleanAadhaarNumber =
    (
      value
    ) => {

      return value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          12
        );

    };


  // ============================================================
  // CLEAN POSTAL CODE
  // ============================================================

  const cleanPostalCode =
    (
      value
    ) => {

      return value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );

    };


  // ============================================================
  // NORMALIZE PAN NUMBER
  // ============================================================

  const normalizePanNumber =
    (
      value
    ) => {

      return value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        )
        .slice(
          0,
          10
        );

    };


  // ============================================================
  // NORMALIZE IFSC CODE
  // ============================================================

  const normalizeIfscCode =
    (
      value
    ) => {

      return value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        )
        .slice(
          0,
          11
        );

    };


  // ============================================================
  // NORMALIZE ACCOUNT NUMBER
  // ============================================================

  const normalizeAccountNumber =
    (
      value
    ) => {

      return value
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          20
        );

    };
      // ============================================================
  // CALCULATE AGE FROM DATE OF BIRTH
  // ============================================================

  const calculateAge =
    (
      birthDate
    ) => {

      if (
        !birthDate
      ) {

        return null;

      }


      const today =
        new Date();


      const birth =
        new Date(
          birthDate
        );


      if (
        Number.isNaN(
          birth.getTime()
        )
      ) {

        return null;

      }


      let age =
        today.getFullYear() -
        birth.getFullYear();


      const monthDifference =
        today.getMonth() -
        birth.getMonth();


      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
          birth.getDate()
        )
      ) {

        age -= 1;

      }


      return age;

    };


  // ============================================================
  // VALIDATE EMAIL ADDRESS
  // ============================================================

  const isValidEmail =
    (
      email
    ) => {

      if (
        !email
      ) {

        return true;

      }


      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );

    };


  // ============================================================
  // VALIDATE PAN NUMBER
  // ============================================================

  const isValidPanNumber =
    (
      pan
    ) => {

      if (
        !pan
      ) {

        return true;

      }


      return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
        pan
      );

    };


  // ============================================================
  // VALIDATE IFSC CODE
  // ============================================================

  const isValidIfscCode =
    (
      ifsc
    ) => {

      if (
        !ifsc
      ) {

        return true;

      }


      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(
        ifsc
      );

    };


  // ============================================================
  // VALIDATE COMPLETE STAFF FORM
  // ============================================================

  const validateStaffForm =
    () => {

      const errors = {};


      const normalizedStaffName =
        staffName.trim();


      const normalizedStaffId =
        staffId.trim();


      const normalizedMobileNumber =
        mobileNumber.trim();


      const normalizedAlternateMobileNumber =
        alternateMobileNumber.trim();


      const normalizedEmailAddress =
        emailAddress.trim();


      const normalizedSalary =
        String(
          salary
        ).trim();


      const normalizedAadhaarNumber =
        aadhaarNumber.trim();


      const normalizedPanNumber =
        panNumber.trim();


      const normalizedIfscCode =
        ifscCode.trim();


      const normalizedAccountNumber =
        accountNumber.trim();


      const normalizedPostalCode =
        postalCode.trim();


      // ========================================================
      // STAFF NAME VALIDATION
      // ========================================================

      if (
        !normalizedStaffName
      ) {

        errors.staffName =
          "Staff name is required.";

      }
      else if (
        normalizedStaffName.length < 2
      ) {

        errors.staffName =
          "Staff name must contain at least 2 characters.";

      }


      // ========================================================
      // STAFF ID VALIDATION
      // ========================================================

      if (
        !normalizedStaffId
      ) {

        errors.staffId =
          "Staff ID is required.";

      }


      // ========================================================
      // GENDER VALIDATION
      // ========================================================

      if (
        !gender
      ) {

        errors.gender =
          "Please select gender.";

      }


      // ========================================================
      // DATE OF BIRTH VALIDATION
      // ========================================================

      if (
        dateOfBirth
      ) {

        const birthDate =
          new Date(
            dateOfBirth
          );


        const today =
          new Date();


        if (
          birthDate >
          today
        ) {

          errors.dateOfBirth =
            "Date of birth cannot be in the future.";

        }


        const calculatedAge =
          calculateAge(
            dateOfBirth
          );


        if (
          calculatedAge !== null &&
          calculatedAge < 15
        ) {

          errors.dateOfBirth =
            "Staff age appears too low. Please verify the date of birth.";

        }

      }


      // ========================================================
      // MOBILE NUMBER VALIDATION
      // ========================================================

      if (
        !normalizedMobileNumber
      ) {

        errors.mobileNumber =
          "Mobile number is required.";

      }
      else if (
        !/^[6-9]\d{9}$/.test(
          normalizedMobileNumber
        )
      ) {

        errors.mobileNumber =
          "Enter a valid 10-digit Indian mobile number.";

      }


      // ========================================================
      // ALTERNATE MOBILE VALIDATION
      // ========================================================

      if (
        normalizedAlternateMobileNumber &&
        !/^[6-9]\d{9}$/.test(
          normalizedAlternateMobileNumber
        )
      ) {

        errors.alternateMobileNumber =
          "Enter a valid alternate mobile number.";

      }


      if (
        normalizedAlternateMobileNumber &&
        normalizedAlternateMobileNumber ===
        normalizedMobileNumber
      ) {

        errors.alternateMobileNumber =
          "Alternate mobile number must be different from the primary mobile number.";

      }


      // ========================================================
      // EMAIL VALIDATION
      // ========================================================

      if (
        !isValidEmail(
          normalizedEmailAddress
        )
      ) {

        errors.emailAddress =
          "Enter a valid email address.";

      }


      // ========================================================
      // POSITION VALIDATION
      // ========================================================

      if (
        !position
      ) {

        errors.position =
          "Please select a staff position.";

      }


      // ========================================================
      // DEPARTMENT VALIDATION
      // ========================================================

      if (
        !department
      ) {

        errors.department =
          "Please select a department.";

      }


      // ========================================================
      // JOINING DATE VALIDATION
      // ========================================================

      if (
        !joiningDate
      ) {

        errors.joiningDate =
          "Joining date is required.";

      }


      // ========================================================
      // SALARY VALIDATION
      // ========================================================

      if (
        !normalizedSalary
      ) {

        errors.salary =
          "Salary is required.";

      }
      else if (
        Number(
          normalizedSalary
        ) < 0
      ) {

        errors.salary =
          "Salary cannot be negative.";

      }


      // ========================================================
      // AADHAAR VALIDATION
      // ========================================================

      if (
        normalizedAadhaarNumber &&
        !/^\d{12}$/.test(
          normalizedAadhaarNumber
        )
      ) {

        errors.aadhaarNumber =
          "Aadhaar number must contain exactly 12 digits.";

      }


      // ========================================================
      // PAN VALIDATION
      // ========================================================

      if (
        !isValidPanNumber(
          normalizedPanNumber
        )
      ) {

        errors.panNumber =
          "Enter a valid PAN number.";

      }


      // ========================================================
      // POSTAL CODE VALIDATION
      // ========================================================

      if (
        normalizedPostalCode &&
        !/^\d{6}$/.test(
          normalizedPostalCode
        )
      ) {

        errors.postalCode =
          "Postal code must contain exactly 6 digits.";

      }


      // ========================================================
      // EMERGENCY CONTACT VALIDATION
      // ========================================================

      if (
        emergencyContactNumber &&
        !/^[6-9]\d{9}$/.test(
          emergencyContactNumber
        )
      ) {

        errors.emergencyContactNumber =
          "Enter a valid emergency contact number.";

      }


      // ========================================================
      // BANK ACCOUNT VALIDATION
      // ========================================================

      if (
        normalizedAccountNumber &&
        normalizedAccountNumber.length < 8
      ) {

        errors.accountNumber =
          "Enter a valid bank account number.";

      }


      if (
        !isValidIfscCode(
          normalizedIfscCode
        )
      ) {

        errors.ifscCode =
          "Enter a valid IFSC code.";

      }


      // ========================================================
      // SET VALIDATION ERRORS
      // ========================================================

      setFieldErrors(
        errors
      );


      return (
        Object.keys(
          errors
        ).length === 0
      );

    };


  // ============================================================
  // CLEAR FIELD ERROR WHEN USER EDITS A FIELD
  // ============================================================

  const clearFieldError =
    (
      fieldName
    ) => {

      setFieldErrors(
        (
          previousErrors
        ) => {

          if (
            !previousErrors[
              fieldName
            ]
          ) {

            return previousErrors;

          }


          const updatedErrors = {
            ...previousErrors
          };


          delete updatedErrors[
            fieldName
          ];


          return updatedErrors;

        }
      );

    };


  // ============================================================
  // CHECK WHETHER STAFF ID ALREADY EXISTS
  // ============================================================

  const checkDuplicateStaffId =
    async () => {

      const staffIdQuery =
        query(
  collection(
    db,
    "staff"
  ),

  where(
    "madrasaId",
    "==",
    madrasaId
  ),
          where(
            "staffId",
            "==",
            staffId.trim()
          ),
          limit(
            1
          )
        );


      const staffIdSnapshot =
        await getDocs(
          staffIdQuery
        );


      return (
        !staffIdSnapshot.empty
      );

    };


  // ============================================================
  // CHECK WHETHER MOBILE NUMBER ALREADY EXISTS
  // ============================================================

  const checkDuplicateMobileNumber =
    async () => {

      const mobileQuery =
        query(
          collection(
            db,
            "staff"
          ),
          where(
  "madrasaId",
  "==",
  madrasaId
),
          where(
            "mobileNumber",
            "==",
            mobileNumber.trim()
          ),
          limit(
            1
          )
        );


      const mobileSnapshot =
        await getDocs(
          mobileQuery
        );


      return (
        !mobileSnapshot.empty
      );

    };


  // ============================================================
  // CHECK WHETHER AADHAAR NUMBER ALREADY EXISTS
  // ============================================================

  const checkDuplicateAadhaarNumber =
    async () => {

      if (
        !aadhaarNumber.trim()
      ) {

        return false;

      }


      const aadhaarQuery =
        query(
          collection(
            db,
            "staff"
          ),
          where(
  "madrasaId",
  "==",
  madrasaId
),
          where(
            "aadhaarNumber",
            "==",
            aadhaarNumber.trim()
          ),
          limit(
            1
          )
        );


      const aadhaarSnapshot =
        await getDocs(
          aadhaarQuery
        );


      return (
        !aadhaarSnapshot.empty
      );

    };


  // ============================================================
  // RESET COMPLETE STAFF FORM
  // ============================================================

  const resetStaffForm =
    async () => {

      setStaffName(
        ""
      );

      setStaffId(
        ""
      );

      setGender(
        ""
      );

      setDateOfBirth(
        ""
      );

      setBloodGroup(
        ""
      );

      setMaritalStatus(
        ""
      );

      setNationality(
        "Indian"
      );

      setMobileNumber(
        ""
      );

      setAlternateMobileNumber(
        ""
      );

      setEmailAddress(
        ""
      );

      setPosition(
        ""
      );

      setDepartment(
        ""
      );

      setEmploymentType(
        "Full Time"
      );

      setJoiningDate(
        ""
      );

      setStaffStatus(
        "Active"
      );

      setWorkShift(
        ""
      );

      setHighestQualification(
        ""
      );

      setSpecialization(
        ""
      );

      setTotalExperience(
        ""
      );

      setPreviousInstitution(
        ""
      );

      setSalary(
        ""
      );

      setSalaryType(
        "Monthly"
      );

      setPaymentMethod(
        ""
      );

      setAccountHolderName(
        ""
      );

      setBankName(
        ""
      );

      setAccountNumber(
        ""
      );

      setIfscCode(
        ""
      );

      setAadhaarNumber(
        ""
      );

      setPanNumber(
        ""
      );

      setAddress(
        ""
      );

      setCity(
        ""
      );

      setStateName(
        ""
      );

      setPostalCode(
        ""
      );

      setEmergencyContactName(
        ""
      );

      setEmergencyContactRelation(
        ""
      );

      setEmergencyContactNumber(
        ""
      );

      setNotes(
        ""
      );

      setFieldErrors(
        {}
      );

      setErrorMessage(
        ""
      );


      await generateStaffId();


      setTimeout(
        () => {

          formTopRef.current?.scrollIntoView(
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
  // SAVE STAFF TO FIRESTORE
  // ============================================================

  const saveStaff =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        isSaving
      ) {

        return;

      }


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      // ========================================================
      // VALIDATE FORM
      // ========================================================

      const formIsValid =
        validateStaffForm();


      if (
        !formIsValid
      ) {

        setErrorMessage(
          "Please correct the highlighted fields before saving the staff record."
        );


        formTopRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "start"
          }
        );


        return;

      }


      setIsSaving(
        true
      );


      try {

        // ======================================================
        // CHECK DUPLICATE STAFF ID
        // ======================================================

        const staffIdAlreadyExists =
          await checkDuplicateStaffId();


        if (
          staffIdAlreadyExists
        ) {

          setFieldErrors(
            (
              previousErrors
            ) => ({

              ...previousErrors,

              staffId:
                "This Staff ID already exists."

            })
          );


          throw new Error(
            "DUPLICATE_STAFF_ID"
          );

        }


        // ======================================================
        // CHECK DUPLICATE MOBILE NUMBER
        // ======================================================

        const mobileNumberAlreadyExists =
          await checkDuplicateMobileNumber();


        if (
          mobileNumberAlreadyExists
        ) {

          setFieldErrors(
            (
              previousErrors
            ) => ({

              ...previousErrors,

              mobileNumber:
                "A staff member with this mobile number already exists."

            })
          );


          throw new Error(
            "DUPLICATE_MOBILE_NUMBER"
          );

        }


        // ======================================================
        // CHECK DUPLICATE AADHAAR NUMBER
        // ======================================================

        const aadhaarNumberAlreadyExists =
          await checkDuplicateAadhaarNumber();


        if (
          aadhaarNumberAlreadyExists
        ) {

          setFieldErrors(
            (
              previousErrors
            ) => ({

              ...previousErrors,

              aadhaarNumber:
                "A staff member with this Aadhaar number already exists."

            })
          );


          throw new Error(
            "DUPLICATE_AADHAAR_NUMBER"
          );

        }


        // ======================================================
        // CALCULATE STAFF AGE
        // ======================================================

        const staffAge =
          calculateAge(
            dateOfBirth
          );


        // ======================================================
        // CREATE COMPLETE STAFF DOCUMENT
        // ======================================================

        const staffDocument = {

          // ====================================================
          // CORE IDENTIFICATION
          // ====================================================
madrasaId,

adminId:
  localStorage.getItem(
    "adminId"
  ),

adminName:
  localStorage.getItem(
    "adminName"
  ),
          staffId:
            staffId.trim(),

          staffName:
            staffName.trim(),

          gender:
            gender,

          dateOfBirth:
            dateOfBirth ||
            "",

          age:
            staffAge,

          bloodGroup:
            bloodGroup ||
            "",

          maritalStatus:
            maritalStatus ||
            "",

          nationality:
            nationality.trim() ||
            "Indian",


          // ====================================================
          // CONTACT INFORMATION
          // ====================================================

          mobileNumber:
            mobileNumber.trim(),

          alternateMobileNumber:
            alternateMobileNumber.trim(),

          emailAddress:
            emailAddress
              .trim()
              .toLowerCase(),


          // ====================================================
          // EMPLOYMENT INFORMATION
          // ====================================================

          position:
            position,

          department:
            department,

          employmentType:
            employmentType,

          joiningDate:
            joiningDate,

          staffStatus:
            staffStatus,

          workShift:
            workShift || "",


          // ====================================================
          // QUALIFICATION AND EXPERIENCE
          // ====================================================

          highestQualification:
            highestQualification.trim(),

          specialization:
            specialization.trim(),

          totalExperience:
            totalExperience
              ?
              Number(
                totalExperience
              )
              :
              0,

          previousInstitution:
            previousInstitution.trim(),


          // ====================================================
          // SALARY INFORMATION
          // ====================================================

          salary:
            Number(
              salary
            ),

          salaryType:
            salaryType,

          paymentMethod:
            paymentMethod || "",


          // ====================================================
          // BANK INFORMATION
          // ====================================================

          accountHolderName:
            accountHolderName.trim(),

          bankName:
            bankName.trim(),

          accountNumber:
            accountNumber.trim(),

          ifscCode:
            ifscCode
              .trim()
              .toUpperCase(),


          // ====================================================
          // IDENTITY INFORMATION
          // ====================================================

          aadhaarNumber:
            aadhaarNumber.trim(),

          panNumber:
            panNumber
              .trim()
              .toUpperCase(),


          // ====================================================
          // ADDRESS INFORMATION
          // ====================================================

          address:
            address.trim(),

          city:
            city.trim(),

          state:
            stateName.trim(),

          postalCode:
            postalCode.trim(),


          // ====================================================
          // EMERGENCY CONTACT INFORMATION
          // ====================================================

          emergencyContactName:
            emergencyContactName.trim(),

          emergencyContactRelation:
            emergencyContactRelation.trim(),

          emergencyContactNumber:
            emergencyContactNumber.trim(),


          // ====================================================
          // ADDITIONAL INFORMATION
          // ====================================================

          notes:
            notes.trim(),


          // ====================================================
          // FUTURE ATTENDANCE SUPPORT
          // ====================================================

          attendanceEnabled:
            true,

          attendanceStatus:
            "Not Marked",


          // ====================================================
          // FUTURE SALARY SUPPORT
          // ====================================================

          salaryEnabled:
            true,

          lastSalaryPaidDate:
            null,

          pendingSalary:
            0,


          // ====================================================
          // FUTURE LEAVE SUPPORT
          // ====================================================

          leaveEnabled:
            true,

          availableLeaveDays:
            0,


          // ====================================================
          // FUTURE STAFF ID CARD SUPPORT
          // ====================================================

          idCardGenerated:
            false,

          idCardNumber:
            "",


          // ====================================================
          // FUTURE ROLE SUPPORT
          // ====================================================

          systemRole:
            "Staff",

          permissions:
            [],


          // ====================================================
          // FUTURE NOTIFICATION SUPPORT
          // ====================================================

          notificationsEnabled:
            true,


          // ====================================================
          // RECORD STATUS
          // ====================================================

          isActive:
            staffStatus ===
            "Active",

          isDeleted:
            false,


          // ====================================================
          // FIRESTORE TIMESTAMPS
          // ====================================================

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        };


        // ======================================================
        // SAVE STAFF DOCUMENT
        // ======================================================

        await addDoc(
          collection(
            db,
            "staff"
          ),
          staffDocument
        );


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            `${staffName.trim()} was added successfully with Staff ID ${staffId.trim()}.`
          );


          await resetStaffForm();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving staff:",
          error
        );


        if (
          !isMountedRef.current
        ) {

          return;

        }


        if (
          error.message ===
          "DUPLICATE_STAFF_ID"
        ) {

          setErrorMessage(
            "The generated Staff ID already exists. Please generate a new Staff ID and try again."
          );

        }
        else if (
          error.message ===
          "DUPLICATE_MOBILE_NUMBER"
        ) {

          setErrorMessage(
            "A staff member with this mobile number already exists."
          );

        }
        else if (
          error.message ===
          "DUPLICATE_AADHAAR_NUMBER"
        ) {

          setErrorMessage(
            "A staff member with this Aadhaar number already exists."
          );

        }
        else {

          setErrorMessage(
            "Unable to save the staff record. Please check your connection and try again."
          );

        }


        formTopRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "start"
          }
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsSaving(
            false
          );

        }

      }

    };
      // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <Layout>

      <div
        className="accounts-page"
        ref={
          formTopRef
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
              ➕ Add Staff
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Create a complete staff profile for attendance, salary, leave, roles, ID cards and future staff management.
            </p>

          </div>


          <button
            type="button"
            onClick={
              resetStaffForm
            }
            disabled={
              isSaving
            }
          >
            🔄 Reset Form
          </button>

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
            STAFF FORM
        ====================================================== */}

        <form
          onSubmit={
            saveStaff
          }
        >

          {/* ====================================================
              STAFF ID SECTION
          ==================================================== */}

          <div className="section-card">

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
                  🪪 Staff Identification
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Every staff member receives a unique Staff ID.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  generateStaffId
                }
                disabled={
                  isSaving ||
                  isGeneratingStaffId
                }
              >
                {
                  isGeneratingStaffId
                    ?
                    "⏳ Generating..."
                    :
                    "🔄 Generate New ID"
                }
              </button>

            </div>


            <div>

              <label>
                Staff ID *
              </label>

              <input
                type="text"
                value={
                  staffId
                }
                onChange={
                  (
                    event
                  ) => {

                    setStaffId(
                      event.target.value
                        .toUpperCase()
                        .replace(
                          /\s/g,
                          ""
                        )
                    );

                    clearFieldError(
                      "staffId"
                    );

                  }
                }
                placeholder="Example: STF0001"
                disabled={
                  isSaving ||
                  isGeneratingStaffId
                }
              />

              {
                fieldErrors.staffId && (

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#dc2626",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                  >
                    ⚠️ {fieldErrors.staffId}
                  </p>

                )
              }

            </div>

          </div>


          {/* ====================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                👤 Personal Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Enter the basic personal details of the staff member.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  STAFF NAME
              ================================================== */}

              <div>

                <label>
                  Staff Name *
                </label>

                <input
                  type="text"
                  value={
                    staffName
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setStaffName(
                        event.target.value
                      );

                      clearFieldError(
                        "staffName"
                      );

                    }
                  }
                  placeholder="Enter full staff name"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.staffName && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.staffName}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  GENDER
              ================================================== */}

              <div>

                <label>
                  Gender *
                </label>

                <select
                  value={
                    gender
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setGender(
                        event.target.value
                      );

                      clearFieldError(
                        "gender"
                      );

                    }
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Gender
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

                {
                  fieldErrors.gender && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.gender}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  DATE OF BIRTH
              ================================================== */}

              <div>

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  value={
                    dateOfBirth
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setDateOfBirth(
                        event.target.value
                      );

                      clearFieldError(
                        "dateOfBirth"
                      );

                    }
                  }
                  max={
                    new Date()
                      .toISOString()
                      .split(
                        "T"
                      )[0]
                  }
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.dateOfBirth && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.dateOfBirth}
                    </p>

                  )
                }


                {
                  dateOfBirth &&
                  calculateAge(
                    dateOfBirth
                  ) !== null && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#64748b",
                        fontSize: "13px"
                      }}
                    >
                      Calculated Age:
                      {" "}
                      <strong>
                        {
                          calculateAge(
                            dateOfBirth
                          )
                        }
                        {" "}
                        Years
                      </strong>
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  BLOOD GROUP
              ================================================== */}

              <div>

                <label>
                  Blood Group
                </label>

                <select
                  value={
                    bloodGroup
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setBloodGroup(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Blood Group
                  </option>

                  {
                    bloodGroupOptions.map(
                      (
                        bloodGroupOption
                      ) => (

                        <option
                          key={
                            bloodGroupOption
                          }
                          value={
                            bloodGroupOption
                          }
                        >
                          {
                            bloodGroupOption
                          }
                        </option>

                      )
                    )
                  }

                </select>

              </div>


              {/* ==================================================
                  MARITAL STATUS
              ================================================== */}

              <div>

                <label>
                  Marital Status
                </label>

                <select
                  value={
                    maritalStatus
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setMaritalStatus(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Marital Status
                  </option>

                  <option value="Single">
                    Single
                  </option>

                  <option value="Married">
                    Married
                  </option>

                  <option value="Widowed">
                    Widowed
                  </option>

                  <option value="Divorced">
                    Divorced
                  </option>

                </select>

              </div>


              {/* ==================================================
                  NATIONALITY
              ================================================== */}

              <div>

                <label>
                  Nationality
                </label>

                <input
                  type="text"
                  value={
                    nationality
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setNationality(
                        event.target.value
                      )
                  }
                  placeholder="Enter nationality"
                  disabled={
                    isSaving
                  }
                />

              </div>

            </div>

          </div>


          {/* ====================================================
              CONTACT INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                📞 Contact Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Add primary and alternate contact information.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  PRIMARY MOBILE
              ================================================== */}

              <div>

                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={
                    mobileNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setMobileNumber(
                        cleanMobileNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "mobileNumber"
                      );

                    }
                  }
                  placeholder="10-digit mobile number"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.mobileNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.mobileNumber}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  ALTERNATE MOBILE
              ================================================== */}

              <div>

                <label>
                  Alternate Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={
                    alternateMobileNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setAlternateMobileNumber(
                        cleanMobileNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "alternateMobileNumber"
                      );

                    }
                  }
                  placeholder="Alternate mobile number"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.alternateMobileNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.alternateMobileNumber}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  EMAIL ADDRESS
              ================================================== */}

              <div>

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    emailAddress
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setEmailAddress(
                        event.target.value
                      );

                      clearFieldError(
                        "emailAddress"
                      );

                    }
                  }
                  placeholder="staff@example.com"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.emailAddress && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.emailAddress}
                    </p>

                  )
                }

              </div>

            </div>

          </div>


          {/* ====================================================
              EMPLOYMENT INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                💼 Employment Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Define the staff member's position, department and employment details.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  POSITION
              ================================================== */}

              <div>

                <label>
                  Position *
                </label>

                <select
                  value={
                    position
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setPosition(
                        event.target.value
                      );

                      clearFieldError(
                        "position"
                      );

                    }
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Position
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

                {
                  fieldErrors.position && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.position}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  DEPARTMENT
              ================================================== */}

              <div>

                <label>
                  Department *
                </label>

                <select
                  value={
                    department
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setDepartment(
                        event.target.value
                      );

                      clearFieldError(
                        "department"
                      );

                    }
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Department
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

                {
                  fieldErrors.department && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.department}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  EMPLOYMENT TYPE
              ================================================== */}

              <div>

                <label>
                  Employment Type
                </label>

                <select
                  value={
                    employmentType
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEmploymentType(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                  <option value="Temporary">
                    Temporary
                  </option>

                  <option value="Volunteer">
                    Volunteer
                  </option>

                </select>

              </div>


              {/* ==================================================
                  JOINING DATE
              ================================================== */}

              <div>

                <label>
                  Joining Date *
                </label>

                <input
                  type="date"
                  value={
                    joiningDate
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setJoiningDate(
                        event.target.value
                      );

                      clearFieldError(
                        "joiningDate"
                      );

                    }
                  }
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.joiningDate && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.joiningDate}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  STAFF STATUS
              ================================================== */}

              <div>

                <label>
                  Staff Status
                </label>

                <select
                  value={
                    staffStatus
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setStaffStatus(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

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
                  WORK SHIFT
              ================================================== */}

              <div>

                <label>
                  Work Shift
                </label>

                <select
                  value={
                    workShift
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setWorkShift(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Work Shift
                  </option>

                  <option value="Morning">
                    Morning
                  </option>

                  <option value="Afternoon">
                    Afternoon
                  </option>

                  <option value="Evening">
                    Evening
                  </option>

                  <option value="Night">
                    Night
                  </option>

                  <option value="Full Day">
                    Full Day
                  </option>

                  <option value="Flexible">
                    Flexible
                  </option>

                </select>

              </div>

            </div>

          </div>
                    {/* ====================================================
              QUALIFICATION AND EXPERIENCE
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                🎓 Qualification & Experience
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Add educational qualification, specialization and previous work experience.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  HIGHEST QUALIFICATION
              ================================================== */}

              <div>

                <label>
                  Highest Qualification
                </label>

                <input
                  type="text"
                  value={
                    highestQualification
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setHighestQualification(
                        event.target.value
                      )
                  }
                  placeholder="Example: Alim, Hafiz, B.Ed, Degree"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  SPECIALIZATION
              ================================================== */}

              <div>

                <label>
                  Specialization
                </label>

                <input
                  type="text"
                  value={
                    specialization
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSpecialization(
                        event.target.value
                      )
                  }
                  placeholder="Example: Hifz, Arabic, Islamic Studies"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  TOTAL EXPERIENCE
              ================================================== */}

              <div>

                <label>
                  Total Experience (Years)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={
                    totalExperience
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTotalExperience(
                        event.target.value
                      )
                  }
                  placeholder="Example: 5"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  PREVIOUS INSTITUTION
              ================================================== */}

              <div>

                <label>
                  Previous Institution
                </label>

                <input
                  type="text"
                  value={
                    previousInstitution
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPreviousInstitution(
                        event.target.value
                      )
                  }
                  placeholder="Previous Madrasa / School / Organization"
                  disabled={
                    isSaving
                  }
                />

              </div>

            </div>

          </div>


          {/* ====================================================
              SALARY INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                💰 Salary Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Enter salary and preferred payment information for future salary management.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  SALARY AMOUNT
              ================================================== */}

              <div>

                <label>
                  Salary Amount *
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    salary
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setSalary(
                        event.target.value
                      );

                      clearFieldError(
                        "salary"
                      );

                    }
                  }
                  placeholder="Enter salary amount"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.salary && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.salary}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  SALARY TYPE
              ================================================== */}

              <div>

                <label>
                  Salary Type
                </label>

                <select
                  value={
                    salaryType
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSalaryType(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="Monthly">
                    Monthly
                  </option>

                  <option value="Weekly">
                    Weekly
                  </option>

                  <option value="Daily">
                    Daily
                  </option>

                  <option value="Hourly">
                    Hourly
                  </option>

                  <option value="Honorarium">
                    Honorarium
                  </option>

                </select>

              </div>


              {/* ==================================================
                  PAYMENT METHOD
              ================================================== */}

              <div>

                <label>
                  Preferred Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPaymentMethod(
                        event.target.value
                      )
                  }
                  disabled={
                    isSaving
                  }
                >

                  <option value="">
                    Select Payment Method
                  </option>

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

            </div>

          </div>


          {/* ====================================================
              BANK INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                🏦 Bank Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Optional bank information for salary payments and financial records.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  ACCOUNT HOLDER NAME
              ================================================== */}

              <div>

                <label>
                  Account Holder Name
                </label>

                <input
                  type="text"
                  value={
                    accountHolderName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setAccountHolderName(
                        event.target.value
                      )
                  }
                  placeholder="Name as per bank account"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  BANK NAME
              ================================================== */}

              <div>

                <label>
                  Bank Name
                </label>

                <input
                  type="text"
                  value={
                    bankName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setBankName(
                        event.target.value
                      )
                  }
                  placeholder="Enter bank name"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  ACCOUNT NUMBER
              ================================================== */}

              <div>

                <label>
                  Account Number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    accountNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setAccountNumber(
                        normalizeAccountNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "accountNumber"
                      );

                    }
                  }
                  placeholder="Enter bank account number"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.accountNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.accountNumber}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  IFSC CODE
              ================================================== */}

              <div>

                <label>
                  IFSC Code
                </label>

                <input
                  type="text"
                  value={
                    ifscCode
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setIfscCode(
                        normalizeIfscCode(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "ifscCode"
                      );

                    }
                  }
                  placeholder="Example: SBIN0001234"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.ifscCode && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.ifscCode}
                    </p>

                  )
                }

              </div>

            </div>

          </div>


          {/* ====================================================
              IDENTITY INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                🪪 Identity Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Add optional government identification details for staff records.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  AADHAAR NUMBER
              ================================================== */}

              <div>

                <label>
                  Aadhaar Number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    aadhaarNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setAadhaarNumber(
                        cleanAadhaarNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "aadhaarNumber"
                      );

                    }
                  }
                  placeholder="12-digit Aadhaar number"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.aadhaarNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.aadhaarNumber}
                    </p>

                  )
                }

              </div>


              {/* ==================================================
                  PAN NUMBER
              ================================================== */}

              <div>

                <label>
                  PAN Number
                </label>

                <input
                  type="text"
                  value={
                    panNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setPanNumber(
                        normalizePanNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "panNumber"
                      );

                    }
                  }
                  placeholder="Example: ABCDE1234F"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.panNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.panNumber}
                    </p>

                  )
                }

              </div>

            </div>

          </div>


          {/* ====================================================
              ADDRESS INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                📍 Address Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Enter the current residential address of the staff member.
              </p>

            </div>


            {/* ==================================================
                FULL ADDRESS
            ================================================== */}

            <div
              style={{
                marginBottom: "18px"
              }}
            >

              <label>
                Full Address
              </label>

              <textarea
                value={
                  address
                }
                onChange={
                  (
                    event
                  ) =>
                    setAddress(
                      event.target.value
                    )
                }
                placeholder="House number, street, area, village or locality"
                rows="4"
                disabled={
                  isSaving
                }
                style={{
                  width: "100%",
                  resize: "vertical"
                }}
              />

            </div>


            <div className="form-grid">

              {/* ==================================================
                  CITY
              ================================================== */}

              <div>

                <label>
                  City / Town / Village
                </label>

                <input
                  type="text"
                  value={
                    city
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setCity(
                        event.target.value
                      )
                  }
                  placeholder="Enter city, town or village"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  STATE
              ================================================== */}

              <div>

                <label>
                  State
                </label>

                <input
                  type="text"
                  value={
                    stateName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setStateName(
                        event.target.value
                      )
                  }
                  placeholder="Enter state"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  POSTAL CODE
              ================================================== */}

              <div>

                <label>
                  Postal Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    postalCode
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setPostalCode(
                        cleanPostalCode(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "postalCode"
                      );

                    }
                  }
                  placeholder="6-digit postal code"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.postalCode && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.postalCode}
                    </p>

                  )
                }

              </div>

            </div>

          </div>
                    {/* ====================================================
              EMERGENCY CONTACT INFORMATION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                🚨 Emergency Contact
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Add a person who can be contacted in case of an emergency.
              </p>

            </div>


            <div className="form-grid">

              {/* ==================================================
                  EMERGENCY CONTACT NAME
              ================================================== */}

              <div>

                <label>
                  Contact Person Name
                </label>

                <input
                  type="text"
                  value={
                    emergencyContactName
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEmergencyContactName(
                        event.target.value
                      )
                  }
                  placeholder="Enter contact person name"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  EMERGENCY CONTACT RELATION
              ================================================== */}

              <div>

                <label>
                  Relationship
                </label>

                <input
                  type="text"
                  value={
                    emergencyContactRelation
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setEmergencyContactRelation(
                        event.target.value
                      )
                  }
                  placeholder="Example: Father, Mother, Brother, Spouse"
                  disabled={
                    isSaving
                  }
                />

              </div>


              {/* ==================================================
                  EMERGENCY CONTACT NUMBER
              ================================================== */}

              <div>

                <label>
                  Emergency Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={
                    emergencyContactNumber
                  }
                  onChange={
                    (
                      event
                    ) => {

                      setEmergencyContactNumber(
                        cleanMobileNumber(
                          event.target.value
                        )
                      );

                      clearFieldError(
                        "emergencyContactNumber"
                      );

                    }
                  }
                  placeholder="10-digit mobile number"
                  disabled={
                    isSaving
                  }
                />

                {
                  fieldErrors.emergencyContactNumber && (

                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#dc2626",
                        fontSize: "13px",
                        fontWeight: "600"
                      }}
                    >
                      ⚠️ {fieldErrors.emergencyContactNumber}
                    </p>

                  )
                }

              </div>

            </div>

          </div>


          {/* ====================================================
              ADDITIONAL NOTES
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                📝 Additional Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Add any additional information or internal notes about the staff member.
              </p>

            </div>


            <div>

              <label>
                Notes
              </label>

              <textarea
                value={
                  notes
                }
                onChange={
                  (
                    event
                  ) =>
                    setNotes(
                      event.target.value
                    )
                }
                placeholder="Enter additional staff information, responsibilities, remarks or notes..."
                rows="5"
                disabled={
                  isSaving
                }
                style={{
                  width: "100%",
                  resize: "vertical"
                }}
              />

            </div>

          </div>


          {/* ====================================================
              STAFF RECORD SUMMARY
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
            }}
          >

            <div
              style={{
                marginBottom: "20px"
              }}
            >

              <h2
                style={{
                  margin: "0 0 6px"
                }}
              >
                📋 Staff Record Summary
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Review the important staff information before saving the record.
              </p>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px"
              }}
            >

              {/* ==================================================
                  STAFF ID SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  STAFF ID
                </p>

                <strong>
                  {
                    staffId ||
                    "Not Generated"
                  }
                </strong>

              </div>


              {/* ==================================================
                  STAFF NAME SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  STAFF NAME
                </p>

                <strong>
                  {
                    staffName.trim() ||
                    "Not Entered"
                  }
                </strong>

              </div>


              {/* ==================================================
                  POSITION SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  POSITION
                </p>

                <strong>
                  {
                    position ||
                    "Not Selected"
                  }
                </strong>

              </div>


              {/* ==================================================
                  DEPARTMENT SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  DEPARTMENT
                </p>

                <strong>
                  {
                    department ||
                    "Not Selected"
                  }
                </strong>

              </div>


              {/* ==================================================
                  MOBILE SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  MOBILE NUMBER
                </p>

                <strong>
                  {
                    mobileNumber ||
                    "Not Entered"
                  }
                </strong>

              </div>


              {/* ==================================================
                  EMPLOYMENT TYPE SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  EMPLOYMENT TYPE
                </p>

                <strong>
                  {
                    employmentType
                  }
                </strong>

              </div>


              {/* ==================================================
                  SALARY SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
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
                  SALARY
                </p>

                <strong>
                  {
                    salary
                      ?
                      `₹${Number(
                        salary
                      ).toLocaleString(
                        "en-IN"
                      )} / ${salaryType}`
                      :
                      "Not Entered"
                  }
                </strong>

              </div>


              {/* ==================================================
                  STATUS SUMMARY
              ================================================== */}

              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    staffStatus === "Active"
                      ?
                      "#ecfdf5"
                      :
                      "#f8fafc",
                  border:
                    staffStatus === "Active"
                      ?
                      "1px solid #86efac"
                      :
                      "1px solid #e2e8f0"
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
                  STAFF STATUS
                </p>

                <strong
                  style={{
                    color:
                      staffStatus === "Active"
                        ?
                        "#166534"
                        :
                        "#334155"
                  }}
                >
                  {
                    staffStatus
                  }
                </strong>

              </div>

            </div>

          </div>


          {/* ====================================================
              FORM ACTION SECTION
          ==================================================== */}

          <div
            className="section-card"
            style={{
              marginTop: "22px"
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
                  💾 Save Staff Record
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  Fields marked with * are required. Review the information before saving.
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
                    resetStaffForm
                  }
                  disabled={
                    isSaving
                  }
                >
                  🔄 Reset
                </button>


                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    isGeneratingStaffId
                  }
                  style={{
                    minWidth: "170px"
                  }}
                >
                  {
                    isSaving
                      ?
                      "⏳ Saving Staff..."
                      :
                      "💾 Save Staff"
                  }
                </button>

              </div>

            </div>

          </div>

        </form>


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

export default AddStaff;