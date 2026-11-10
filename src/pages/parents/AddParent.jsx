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

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function AddParent() {

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const firstInputRef =
    useRef(null);


  // ============================================================
  // PARENT ID STATE
  // ============================================================

  const [
    parentId,
    setParentId
  ] = useState("");


  // ============================================================
  // PRIMARY GUARDIAN STATES
  // ============================================================

  const [
    primaryGuardian,
    setPrimaryGuardian
  ] = useState("Father");


  const [
    guardianName,
    setGuardianName
  ] = useState("");


  const [
    relationship,
    setRelationship
  ] = useState("Father");


  // ============================================================
  // FATHER INFORMATION STATES
  // ============================================================

  const [
    fatherName,
    setFatherName
  ] = useState("");


  const [
    fatherOccupation,
    setFatherOccupation
  ] = useState("");


  // ============================================================
  // MOTHER INFORMATION STATES
  // ============================================================

  const [
    motherName,
    setMotherName
  ] = useState("");


  const [
    motherOccupation,
    setMotherOccupation
  ] = useState("");


  // ============================================================
  // CONTACT INFORMATION STATES
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
    email,
    setEmail
  ] = useState("");


  const [
    emergencyContact,
    setEmergencyContact
  ] = useState("");


  // ============================================================
  // PERSONAL INFORMATION STATES
  // ============================================================

  const [
    aadhaarNumber,
    setAadhaarNumber
  ] = useState("");


  const [
    address,
    setAddress
  ] = useState("");


  const [
    city,
    setCity
  ] = useState("");


  const [
    district,
    setDistrict
  ] = useState("");


  const [
    state,
    setState
  ] = useState("");


  const [
    pinCode,
    setPinCode
  ] = useState("");


  // ============================================================
  // ACCOUNT STATUS STATE
  // ============================================================

  const [
    parentStatus,
    setParentStatus
  ] = useState("Active");


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    existingParents,
    setExistingParents
  ] = useState([]);


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
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // SAVE CONFIRMATION STATE
  // ============================================================

  const [
    showSaveConfirmation,
    setShowSaveConfirmation
  ] = useState(false);


  // ============================================================
  // RELATIONSHIP OPTIONS
  // ============================================================

  const relationshipOptions =
    useMemo(
      () => [

        "Father",

        "Mother",

        "Brother",

        "Sister",

        "Grandfather",

        "Grandmother",

        "Uncle",

        "Aunt",

        "Legal Guardian",

        "Other"

      ],
      []
    );


  // ============================================================
  // INDIAN STATES
  // ============================================================

  const indianStates =
    useMemo(
      () => [

        "Andhra Pradesh",

        "Arunachal Pradesh",

        "Assam",

        "Bihar",

        "Chhattisgarh",

        "Goa",

        "Gujarat",

        "Haryana",

        "Himachal Pradesh",

        "Jharkhand",

        "Karnataka",

        "Kerala",

        "Madhya Pradesh",

        "Maharashtra",

        "Manipur",

        "Meghalaya",

        "Mizoram",

        "Nagaland",

        "Odisha",

        "Punjab",

        "Rajasthan",

        "Sikkim",

        "Tamil Nadu",

        "Telangana",

        "Tripura",

        "Uttar Pradesh",

        "Uttarakhand",

        "West Bengal",

        "Andaman and Nicobar Islands",

        "Chandigarh",

        "Dadra and Nagar Haveli and Daman and Diu",

        "Delhi",

        "Jammu and Kashmir",

        "Ladakh",

        "Lakshadweep",

        "Puducherry"

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
  // CLEAN MOBILE NUMBER
  // ============================================================

  const cleanMobileNumber =
    (
      value
    ) => {

      return String(
        value || ""
      )
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

      return String(
        value || ""
      )
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
  // CLEAN PIN CODE
  // ============================================================

  const cleanPinCode =
    (
      value
    ) => {

      return String(
        value || ""
      )
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
  // MOBILE NUMBER VALIDATION
  // ============================================================

  const isValidMobileNumber =
    (
      value
    ) => {

      return /^[6-9]\d{9}$/.test(
        value
      );

    };


  // ============================================================
  // AADHAAR VALIDATION
  // ============================================================

  const isValidAadhaarNumber =
    (
      value
    ) => {

      if (
        !value
      ) {

        return true;

      }


      return /^\d{12}$/.test(
        value
      );

    };


  // ============================================================
  // EMAIL VALIDATION
  // ============================================================

  const isValidEmail =
    (
      value
    ) => {

      if (
        !value
      ) {

        return true;

      }


      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
      );

    };


  // ============================================================
  // PIN CODE VALIDATION
  // ============================================================

  const isValidPinCode =
    (
      value
    ) => {

      if (
        !value
      ) {

        return true;

      }


      return /^[1-9][0-9]{5}$/.test(
        value
      );

    };


  // ============================================================
  // GENERATE NEXT PARENT ID
  // ============================================================

  const generateNextParentId =
    (
      parentList
    ) => {

      let highestParentNumber = 0;


      parentList.forEach(
        (
          parent
        ) => {

          const currentParentId =
            String(
              parent.parentId || ""
            )
              .trim()
              .toUpperCase();


          const match =
            currentParentId.match(
              /^PAR(\d+)$/
            );


          if (
            match
          ) {

            const currentNumber =
              Number(
                match[1]
              );


            if (
              currentNumber >
              highestParentNumber
            ) {

              highestParentNumber =
                currentNumber;

            }

          }

        }
      );


      const nextParentNumber =
        highestParentNumber + 1;


      return `PAR${String(
        nextParentNumber
      ).padStart(
        4,
        "0"
      )}`;

    };


  // ============================================================
  // LOAD EXISTING PARENTS
  // ============================================================

  const loadExistingParents =
    async () => {

      setIsLoading(true);

      setErrorMessage("");


      try {

        const querySnapshot =
          await getDocs(
            collection(
              db,
              "parents"
            )
          );


        const parentList =
          querySnapshot.docs.map(
            (
              parentDocument
            ) => ({

              id:
                parentDocument.id,

              ...parentDocument.data()

            })
          );


        if (
          isMountedRef.current
        ) {

          setExistingParents(
            parentList
          );


          setParentId(
            generateNextParentId(
              parentList
            )
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading parents:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to prepare the parent registration form. Please check your connection and try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsLoading(false);

        }

      }

    };


  // ============================================================
  // LOAD PARENTS WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      loadExistingParents();

    },
    []
  );


  // ============================================================
  // DUPLICATE MOBILE CHECK
  // ============================================================

  const mobileNumberAlreadyExists =
    (
      value
    ) => {

      const cleanedValue =
        cleanMobileNumber(
          value
        );


      if (
        !cleanedValue
      ) {

        return false;

      }


      return existingParents.some(
        (
          parent
        ) =>

          cleanMobileNumber(
            parent.mobileNumber
          ) === cleanedValue ||

          cleanMobileNumber(
            parent.alternateMobileNumber
          ) === cleanedValue

      );

    };


  // ============================================================
  // DUPLICATE AADHAAR CHECK
  // ============================================================

  const aadhaarNumberAlreadyExists =
    (
      value
    ) => {

      const cleanedValue =
        cleanAadhaarNumber(
          value
        );


      if (
        !cleanedValue
      ) {

        return false;

      }


      return existingParents.some(
        (
          parent
        ) =>

          cleanAadhaarNumber(
            parent.aadhaarNumber
          ) === cleanedValue

      );

    };


  // ============================================================
  // PRIMARY GUARDIAN DISPLAY NAME
  // ============================================================

  const primaryGuardianDisplayName =
    useMemo(
      () => {

        if (
          primaryGuardian === "Father"
        ) {

          return fatherName.trim();

        }


        if (
          primaryGuardian === "Mother"
        ) {

          return motherName.trim();

        }


        return guardianName.trim();

      },
      [
        primaryGuardian,
        fatherName,
        motherName,
        guardianName
      ]
    );


  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const validateParentForm =
    () => {

      if (
        !parentId.trim()
      ) {

        return "Parent ID could not be generated.";

      }


      if (
        primaryGuardian === "Father" &&
        !fatherName.trim()
      ) {

        return "Please enter the father name.";

      }


      if (
        primaryGuardian === "Mother" &&
        !motherName.trim()
      ) {

        return "Please enter the mother name.";

      }


      if (
        primaryGuardian === "Other" &&
        !guardianName.trim()
      ) {

        return "Please enter the guardian name.";

      }


      if (
        primaryGuardian === "Other" &&
        !relationship
      ) {

        return "Please select the guardian relationship.";

      }


      if (
        !mobileNumber.trim()
      ) {

        return "Please enter the primary mobile number.";

      }


      if (
        !isValidMobileNumber(
          mobileNumber
        )
      ) {

        return "Please enter a valid 10-digit Indian mobile number.";

      }


      if (
        alternateMobileNumber &&
        !isValidMobileNumber(
          alternateMobileNumber
        )
      ) {

        return "Please enter a valid alternate mobile number.";

      }


      if (
        alternateMobileNumber &&
        mobileNumber ===
          alternateMobileNumber
      ) {

        return "Primary and alternate mobile numbers cannot be the same.";

      }


      if (
        emergencyContact &&
        !isValidMobileNumber(
          emergencyContact
        )
      ) {

        return "Please enter a valid emergency contact number.";

      }


      if (
        !isValidEmail(
          email
        )
      ) {

        return "Please enter a valid email address.";

      }


      if (
        !isValidAadhaarNumber(
          aadhaarNumber
        )
      ) {

        return "Aadhaar number must contain exactly 12 digits.";

      }


      if (
        !isValidPinCode(
          pinCode
        )
      ) {

        return "Please enter a valid 6-digit PIN code.";

      }


      if (
        mobileNumberAlreadyExists(
          mobileNumber
        )
      ) {

        return "This mobile number is already registered with another parent.";

      }


      if (
        aadhaarNumberAlreadyExists(
          aadhaarNumber
        )
      ) {

        return "This Aadhaar number is already registered with another parent.";

      }


      return "";

    };


  // ============================================================
  // PREPARE PARENT DATABASE DATA
  // ============================================================

  const prepareParentData =
    () => {

      return {

        parentId:
          parentId.trim(),

        primaryGuardian,

        primaryGuardianName:
          primaryGuardianDisplayName,

        relationship:
          primaryGuardian === "Other"
            ?
            relationship
            :
            primaryGuardian,

        fatherName:
          fatherName.trim(),

        fatherOccupation:
          fatherOccupation.trim(),

        motherName:
          motherName.trim(),

        motherOccupation:
          motherOccupation.trim(),

        guardianName:
          guardianName.trim(),

        mobileNumber:
          cleanMobileNumber(
            mobileNumber
          ),

        alternateMobileNumber:
          cleanMobileNumber(
            alternateMobileNumber
          ),

        email:
          email.trim().toLowerCase(),

        emergencyContact:
          cleanMobileNumber(
            emergencyContact
          ),

        aadhaarNumber:
          cleanAadhaarNumber(
            aadhaarNumber
          ),

        address:
          address.trim(),

        city:
          city.trim(),

        district:
          district.trim(),

        state:
          state.trim(),

        pinCode:
          cleanPinCode(
            pinCode
          ),

        status:
          parentStatus,

        linkedStudentIds: [],

        studentCount: 0,

        accountCreated: false,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      };

    };
      // ============================================================
  // REQUEST SAVE PARENT
  // ============================================================

  const requestSaveParent =
    () => {

      setErrorMessage("");

      setSuccessMessage("");


      const validationError =
        validateParentForm();


      if (
        validationError
      ) {

        setErrorMessage(
          validationError
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        return;

      }


      setShowSaveConfirmation(true);

    };


  // ============================================================
  // CANCEL SAVE CONFIRMATION
  // ============================================================

  const cancelSaveParent =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setShowSaveConfirmation(false);

    };


  // ============================================================
  // RESET PARENT FORM
  // ============================================================

  const resetParentForm =
    (
      nextParentId = parentId
    ) => {

      setParentId(
        nextParentId
      );


      setPrimaryGuardian(
        "Father"
      );


      setGuardianName("");


      setRelationship(
        "Father"
      );


      setFatherName("");


      setFatherOccupation("");


      setMotherName("");


      setMotherOccupation("");


      setMobileNumber("");


      setAlternateMobileNumber("");


      setEmail("");


      setEmergencyContact("");


      setAadhaarNumber("");


      setAddress("");


      setCity("");


      setDistrict("");


      setState("");


      setPinCode("");


      setParentStatus(
        "Active"
      );


      setShowSaveConfirmation(
        false
      );


      setTimeout(
        () => {

          firstInputRef.current?.focus();

        },
        100
      );

    };


  // ============================================================
  // CONFIRM AND SAVE PARENT
  // ============================================================

  const confirmSaveParent =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const validationError =
        validateParentForm();


      if (
        validationError
      ) {

        setShowSaveConfirmation(false);

        setErrorMessage(
          validationError
        );

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const parentData =
          prepareParentData();


        const parentDocument =
          await addDoc(
            collection(
              db,
              "parents"
            ),
            parentData
          );


        const savedParent =
          {

            id:
              parentDocument.id,

            ...parentData,

            createdAt:
              new Date(),

            updatedAt:
              new Date()

          };


        const updatedParentList =
          [

            ...existingParents,

            savedParent

          ];


        const nextParentId =
          generateNextParentId(
            updatedParentList
          );


        if (
          isMountedRef.current
        ) {

          setExistingParents(
            updatedParentList
          );


          resetParentForm(
            nextParentId
          );


          setSuccessMessage(
            `Parent ${parentId} registered successfully.`
          );


          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving parent:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the parent record. Please check your connection and try again."
          );

          setShowSaveConfirmation(
            false
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
  // HANDLE PRIMARY GUARDIAN CHANGE
  // ============================================================

  const handlePrimaryGuardianChange =
    (
      event
    ) => {

      const selectedGuardian =
        event.target.value;


      setPrimaryGuardian(
        selectedGuardian
      );


      if (
        selectedGuardian === "Father"
      ) {

        setRelationship(
          "Father"
        );

      }
      else if (
        selectedGuardian === "Mother"
      ) {

        setRelationship(
          "Mother"
        );

      }
      else {

        setRelationship(
          "Legal Guardian"
        );

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
              ➕ Add Parent
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Register parent and guardian information for student management.
            </p>

          </div>


          <div
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe"
            }}
          >

            <p
              style={{
                margin: "0 0 4px",
                color: "#64748b",
                fontSize: "11px",
                fontWeight: "700"
              }}
            >
              PARENT ID
            </p>


            <strong
              style={{
                color: "#2563eb",
                fontSize: "18px"
              }}
            >
              {
                parentId ||
                "Generating..."
              }
            </strong>

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
                  padding: "55px 20px",
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
                  Preparing Parent Registration...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Loading existing parent records and generating the next Parent ID.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            PARENT REGISTRATION FORM
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  PRIMARY GUARDIAN SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    👤 Primary Guardian
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Select the person who will be the main contact for the student.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Primary Guardian *
                    </label>


                    <select
                      value={
                        primaryGuardian
                      }
                      onChange={
                        handlePrimaryGuardianChange
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="Father">
                        Father
                      </option>

                      <option value="Mother">
                        Mother
                      </option>

                      <option value="Other">
                        Other Guardian
                      </option>

                    </select>

                  </div>


                  {
                    primaryGuardian === "Other" && (

                      <div>

                        <label>
                          Guardian Relationship *
                        </label>


                        <select
                          value={
                            relationship
                          }
                          onChange={
                            (
                              event
                            ) =>
                              setRelationship(
                                event.target.value
                              )
                          }
                          disabled={
                            isSaving
                          }
                        >

                          {
                            relationshipOptions
                              .filter(
                                (
                                  currentRelationship
                                ) =>
                                  currentRelationship !==
                                    "Father" &&
                                  currentRelationship !==
                                    "Mother"
                              )
                              .map(
                                (
                                  currentRelationship
                                ) => (

                                  <option
                                    key={
                                      currentRelationship
                                    }
                                    value={
                                      currentRelationship
                                    }
                                  >
                                    {currentRelationship}
                                  </option>

                                )
                              )
                          }

                        </select>

                      </div>

                    )
                  }


                  {
                    primaryGuardian === "Other" && (

                      <div>

                        <label>
                          Guardian Name *
                        </label>


                        <input
                          ref={
                            firstInputRef
                          }
                          type="text"
                          placeholder="Enter Guardian Name"
                          value={
                            guardianName
                          }
                          onChange={
                            (
                              event
                            ) =>
                              setGuardianName(
                                event.target.value
                              )
                          }
                          disabled={
                            isSaving
                          }
                        />

                      </div>

                    )
                  }

                </div>

              </div>


              {/* ==================================================
                  FATHER INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    👨 Father Information
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Enter available father details.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Father Name
                      {
                        primaryGuardian === "Father"
                          ?
                          " *"
                          :
                          ""
                      }
                    </label>


                    <input
                      ref={
                        primaryGuardian === "Father"
                          ?
                          firstInputRef
                          :
                          null
                      }
                      type="text"
                      placeholder="Enter Father Name"
                      value={
                        fatherName
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setFatherName(
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
                      Father Occupation
                    </label>


                    <input
                      type="text"
                      placeholder="Enter Father Occupation"
                      value={
                        fatherOccupation
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setFatherOccupation(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  MOTHER INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    👩 Mother Information
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Enter available mother details.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Mother Name
                      {
                        primaryGuardian === "Mother"
                          ?
                          " *"
                          :
                          ""
                      }
                    </label>


                    <input
                      ref={
                        primaryGuardian === "Mother"
                          ?
                          firstInputRef
                          :
                          null
                      }
                      type="text"
                      placeholder="Enter Mother Name"
                      value={
                        motherName
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setMotherName(
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
                      Mother Occupation
                    </label>


                    <input
                      type="text"
                      placeholder="Enter Mother Occupation"
                      value={
                        motherOccupation
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setMotherOccupation(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  CONTACT INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    Enter the primary contact details for the parent or guardian.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Primary Mobile Number *
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter 10-digit Mobile Number"
                      value={
                        mobileNumber
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setMobileNumber(
                            cleanMobileNumber(
                              event.target.value
                            )
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                    {
                      mobileNumber &&
                      mobileNumber.length === 10 &&
                      mobileNumberAlreadyExists(
                        mobileNumber
                      ) && (

                        <p
                          style={{
                            margin: "6px 0 0",
                            color: "#b91c1c",
                            fontSize: "12px"
                          }}
                        >
                          ⚠️ This mobile number is already registered.
                        </p>

                      )
                    }

                  </div>


                  <div>

                    <label>
                      Alternate Mobile Number
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter Alternate Mobile Number"
                      value={
                        alternateMobileNumber
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setAlternateMobileNumber(
                            cleanMobileNumber(
                              event.target.value
                            )
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter Email Address"
                      value={
                        email
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setEmail(
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
                      Emergency Contact
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter Emergency Contact"
                      value={
                        emergencyContact
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setEmergencyContact(
                            cleanMobileNumber(
                              event.target.value
                            )
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  IDENTITY INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    Add optional identity information for the parent record.
                  </p>

                </div>


                <div>

                  <label>
                    Aadhaar Number
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 12-digit Aadhaar Number"
                    value={
                      aadhaarNumber
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setAadhaarNumber(
                          cleanAadhaarNumber(
                            event.target.value
                          )
                        )
                    }
                    disabled={
                      isSaving
                    }
                  />


                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b",
                      fontSize: "12px"
                    }}
                  >
                    {aadhaarNumber.length}/12 digits
                  </p>


                  {
                    aadhaarNumber &&
                    aadhaarNumber.length === 12 &&
                    aadhaarNumberAlreadyExists(
                      aadhaarNumber
                    ) && (

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#b91c1c",
                          fontSize: "12px"
                        }}
                      >
                        ⚠️ This Aadhaar number is already registered.
                      </p>

                    )
                  }

                </div>

              </div>


              {/* ==================================================
                  ADDRESS INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    Enter the current residential address of the family.
                  </p>

                </div>


                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <label>
                    Full Address
                  </label>

                  <textarea
                    rows="4"
                    placeholder="House Number, Street, Area, Village or Locality..."
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

                  <div>

                    <label>
                      City / Town / Village
                    </label>

                    <input
                      type="text"
                      placeholder="Enter City, Town or Village"
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
                      disabled={
                        isSaving
                      }
                    />

                  </div>


                  <div>

                    <label>
                      District
                    </label>

                    <input
                      type="text"
                      placeholder="Enter District"
                      value={
                        district
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setDistrict(
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
                      State / Union Territory
                    </label>

                    <select
                      value={
                        state
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setState(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="">
                        Select State
                      </option>

                      {
                        indianStates.map(
                          (
                            currentState
                          ) => (

                            <option
                              key={
                                currentState
                              }
                              value={
                                currentState
                              }
                            >
                              {currentState}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      PIN Code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 6-digit PIN Code"
                      value={
                        pinCode
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setPinCode(
                            cleanPinCode(
                              event.target.value
                            )
                          )
                      }
                      disabled={
                        isSaving
                      }
                    />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  PARENT RECORD STATUS
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    ⚙️ Parent Record Status
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Control whether this parent record is currently active.
                  </p>

                </div>


                <div>

                  <label>
                    Status
                  </label>

                  <select
                    value={
                      parentStatus
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setParentStatus(
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

                  </select>

                </div>

              </div>


              {/* ==================================================
                  REGISTRATION SUMMARY
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
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
                    📋 Registration Summary
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Review the main parent information before continuing.
                  </p>

                </div>


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
                      PARENT ID
                    </p>

                    <strong>
                      {
                        parentId ||
                        "Not Generated"
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
                      PRIMARY GUARDIAN
                    </p>

                    <strong>
                      {
                        primaryGuardianDisplayName ||
                        "Not Entered"
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
                      RELATIONSHIP
                    </p>

                    <strong>
                      {
                        primaryGuardian === "Other"
                          ?
                          relationship
                          :
                          primaryGuardian
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
                      MOBILE NUMBER
                    </p>

                    <strong>
                      {
                        mobileNumber ||
                        "Not Entered"
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
                      LOCATION
                    </p>

                    <strong>
                      {
                        [
                          city,
                          district,
                          state
                        ]
                          .filter(
                            Boolean
                          )
                          .join(", ") ||
                        "Not Entered"
                      }
                    </strong>

                  </div>


                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background:
                        parentStatus === "Active"
                          ?
                          "#f0fdf4"
                          :
                          "#f8fafc"
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
                      STATUS
                    </p>

                    <strong
                      style={{
                        color:
                          parentStatus === "Active"
                            ?
                            "#15803d"
                            :
                            "#64748b"
                      }}
                    >
                      {
                        parentStatus === "Active"
                          ?
                          "✅ Active"
                          :
                          "⚪ Inactive"
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  IMPORTANT INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  lineHeight: "1.7"
                }}
              >
                ℹ️
                {" "}
                After registration, this parent can be linked to one or more students through the
                {" "}
                <strong>
                  Student Mapping
                </strong>
                {" "}
                module. A parent login account can also be created later from the
                {" "}
                <strong>
                  Parent Accounts
                </strong>
                {" "}
                module.
              </div>


              {/* ==================================================
                  FORM ACTIONS
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
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h3
                      style={{
                        margin: "0 0 5px"
                      }}
                    >
                      Ready to Register?
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Validate and review the parent information before saving.
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
                        () =>
                          resetParentForm(
                            parentId
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >
                      ↻ Reset Form
                    </button>


                    <button
                      type="button"
                      className="action-btn view-btn"
                      onClick={
                        requestSaveParent
                      }
                      disabled={
                        isSaving
                      }
                    >
                      💾 Review Parent
                    </button>

                  </div>

                </div>

              </div>
                          </>

          )
        }


        {/* ======================================================
            SAVE CONFIRMATION POPUP
        ====================================================== */}

        {
          showSaveConfirmation && (

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
                  maxWidth: "700px",
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
                    👨‍👩‍👧
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    Confirm Parent Registration
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the parent and guardian information carefully before saving it to the database.
                  </p>

                </div>


                {/* ================================================
                    PARENT ID AND STATUS
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
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
                      PARENT ID
                    </p>

                    <h2
                      style={{
                        margin: 0,
                        color: "#2563eb"
                      }}
                    >
                      {parentId}
                    </h2>

                  </div>


                  <span
                    style={{
                      padding: "7px 13px",
                      borderRadius: "999px",
                      background:
                        parentStatus === "Active"
                          ?
                          "#dcfce7"
                          :
                          "#f1f5f9",
                      color:
                        parentStatus === "Active"
                          ?
                          "#15803d"
                          :
                          "#475569",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      parentStatus === "Active"
                        ?
                        "✅ Active"
                        :
                        "⚪ Inactive"
                    }
                  </span>

                </div>


                {/* ================================================
                    PRIMARY GUARDIAN
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "18px",
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
                    PRIMARY GUARDIAN
                  </p>


                  <h2
                    style={{
                      margin: "0 0 7px"
                    }}
                  >
                    👤
                    {" "}
                    {
                      primaryGuardianDisplayName ||
                      "Not Available"
                    }
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Relationship:
                    {" "}
                    <strong>
                      {
                        primaryGuardian === "Other"
                          ?
                          relationship
                          :
                          primaryGuardian
                      }
                    </strong>
                  </p>

                </div>


                {/* ================================================
                    FAMILY INFORMATION
                ================================================ */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
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
                        margin: "0 0 6px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      👨 FATHER INFORMATION
                    </p>


                    <strong>
                      {
                        fatherName ||
                        "Not Entered"
                      }
                    </strong>


                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#64748b"
                      }}
                    >
                      {
                        fatherOccupation ||
                        "Occupation not entered"
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

                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      👩 MOTHER INFORMATION
                    </p>


                    <strong>
                      {
                        motherName ||
                        "Not Entered"
                      }
                    </strong>


                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#64748b"
                      }}
                    >
                      {
                        motherOccupation ||
                        "Occupation not entered"
                      }
                    </p>

                  </div>

                </div>


                {/* ================================================
                    CONTACT INFORMATION
                ================================================ */}

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
                        "PRIMARY MOBILE",
                        mobileNumber
                      ],

                      [
                        "ALTERNATE MOBILE",
                        alternateMobileNumber ||
                        "Not Entered"
                      ],

                      [
                        "EMAIL ADDRESS",
                        email ||
                        "Not Entered"
                      ],

                      [
                        "EMERGENCY CONTACT",
                        emergencyContact ||
                        "Not Entered"
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
                            {value}
                          </strong>

                        </div>

                      )
                    )
                  }

                </div>


                {/* ================================================
                    IDENTITY INFORMATION
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
                      margin: "0 0 6px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    🪪 AADHAAR NUMBER
                  </p>


                  <strong>
                    {
                      aadhaarNumber
                        ?
                        `XXXX XXXX ${aadhaarNumber.slice(-4)}`
                        :
                        "Not Entered"
                    }
                  </strong>

                </div>


                {/* ================================================
                    ADDRESS INFORMATION
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
                      margin: "0 0 8px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    📍 ADDRESS INFORMATION
                  </p>


                  <p
                    style={{
                      margin: "0 0 8px",
                      lineHeight: "1.7"
                    }}
                  >
                    {
                      address ||
                      "Full address not entered"
                    }
                  </p>


                  <strong>
                    {
                      [

                        city,

                        district,

                        state,

                        pinCode

                      ]
                        .filter(
                          Boolean
                        )
                        .join(", ") ||
                      "Location not entered"
                    }
                  </strong>

                </div>


                {/* ================================================
                    DATABASE INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    lineHeight: "1.7"
                  }}
                >
                  🔥
                  {" "}
                  <strong>
                    Firebase Registration:
                  </strong>
                  {" "}
                  A new parent document will be created in the
                  {" "}
                  <strong>
                    parents
                  </strong>
                  {" "}
                  collection. The record can later be connected to students and parent login accounts.
                </div>


                {/* ================================================
                    PRIVACY INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "22px",
                    borderRadius: "10px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    lineHeight: "1.7"
                  }}
                >
                  🔐
                  {" "}
                  <strong>
                    Sensitive Information:
                  </strong>
                  {" "}
                  Parent contact and identity information should only be accessible to authorized Madrasa users.
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
                      cancelSaveParent
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
                      confirmSaveParent
                    }
                    disabled={
                      isSaving
                    }
                    style={{
                      minWidth: "230px"
                    }}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Registering Parent..."
                        :
                        "💾 Confirm & Register"
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

export default AddParent;