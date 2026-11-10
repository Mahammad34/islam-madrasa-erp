import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function EditParent() {

  // ============================================================
  // ROUTER
  // ============================================================

  const {
    id
  } = useParams();


  const navigate =
    useNavigate();


  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // ORIGINAL RECORD
  // ============================================================

  const [
    originalParent,
    setOriginalParent
  ] = useState(null);


  // ============================================================
  // BASIC RECORD INFORMATION
  // ============================================================

  const [
    parentId,
    setParentId
  ] = useState("");


  const [
    status,
    setStatus
  ] = useState("Active");


  // ============================================================
  // PRIMARY GUARDIAN INFORMATION
  // ============================================================

  const [
    primaryGuardian,
    setPrimaryGuardian
  ] = useState("Father");


  const [
    primaryGuardianName,
    setPrimaryGuardianName
  ] = useState("");


  const [
    relationship,
    setRelationship
  ] = useState("Father");


  // ============================================================
  // FATHER INFORMATION
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
  // MOTHER INFORMATION
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
  // OTHER GUARDIAN INFORMATION
  // ============================================================

  const [
    guardianName,
    setGuardianName
  ] = useState("");


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
    emergencyContact,
    setEmergencyContact
  ] = useState("");


  const [
    email,
    setEmail
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
  // IDENTITY INFORMATION
  // ============================================================

  const [
    aadhaarNumber,
    setAadhaarNumber
  ] = useState("");


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
    parentNotFound,
    setParentNotFound
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  const [
    validationErrors,
    setValidationErrors
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
  // CLEAN TEXT VALUE
  // ============================================================

  const cleanText =
    (
      value
    ) => {

      return String(
        value || ""
      ).trim();

    };


  // ============================================================
  // CLEAN NUMBER VALUE
  // ============================================================

  const cleanNumber =
    (
      value
    ) => {

      return String(
        value || ""
      ).replace(
        /\D/g,
        ""
      );

    };


  // ============================================================
  // LOAD PARENT DATA INTO FORM
  // ============================================================

  const loadParentIntoForm =
    (
      data
    ) => {

      const resolvedPrimaryGuardian =
        data.primaryGuardian ||
        (
          data.fatherName
            ?
            "Father"
            :
            data.motherName
              ?
              "Mother"
              :
              "Other"
        );


      const resolvedRelationship =
        data.relationship ||
        resolvedPrimaryGuardian;


      const resolvedGuardianName =
        data.primaryGuardianName ||

        (
          resolvedPrimaryGuardian === "Father"
            ?
            data.fatherName
            :
            resolvedPrimaryGuardian === "Mother"
              ?
              data.motherName
              :
              data.guardianName
        ) ||

        "";


      setParentId(
        data.parentId || ""
      );


      setStatus(
        data.status || "Active"
      );


      setPrimaryGuardian(
        resolvedPrimaryGuardian
      );


      setPrimaryGuardianName(
        resolvedGuardianName
      );


      setRelationship(
        resolvedRelationship
      );


      setFatherName(
        data.fatherName || ""
      );


      setFatherOccupation(
        data.fatherOccupation ||
        data.occupation ||
        ""
      );


      setMotherName(
        data.motherName || ""
      );


      setMotherOccupation(
        data.motherOccupation || ""
      );


      setGuardianName(
        data.guardianName || ""
      );


      setMobileNumber(
        data.mobileNumber || ""
      );


      setAlternateMobileNumber(
        data.alternateMobileNumber || ""
      );


      setEmergencyContact(
        data.emergencyContact || ""
      );


      setEmail(
        data.email || ""
      );


      setAddress(
        data.address || ""
      );


      setCity(
        data.city || ""
      );


      setDistrict(
        data.district || ""
      );


      setState(
        data.state || ""
      );


      setPinCode(
        data.pinCode || ""
      );


      setAadhaarNumber(
        data.aadhaarNumber || ""
      );

    };


  // ============================================================
  // FETCH PARENT RECORD
  // ============================================================

  const fetchParent =
    async () => {

      if (
        !id
      ) {

        setParentNotFound(true);

        setIsLoading(false);

        return;

      }


      setIsLoading(true);

      setErrorMessage("");

      setParentNotFound(false);


      try {

        const parentReference =
          doc(
            db,
            "parents",
            id
          );


        const parentSnapshot =
          await getDoc(
            parentReference
          );


        if (
          !parentSnapshot.exists()
        ) {

          if (
            isMountedRef.current
          ) {

            setParentNotFound(true);

            setOriginalParent(null);

          }


          return;

        }


        const parentData =
          {

            id:
              parentSnapshot.id,

            ...parentSnapshot.data()

          };


        if (
          isMountedRef.current
        ) {

          setOriginalParent(
            parentData
          );


          loadParentIntoForm(
            parentData
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading parent:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load the parent record. Please check your connection and try again."
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
  // LOAD PARENT WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchParent();

    },
    [
      id
    ]
  );


  // ============================================================
  // KEEP PRIMARY GUARDIAN NAME SYNCHRONIZED
  // ============================================================

  useEffect(
    () => {

      if (
        primaryGuardian === "Father"
      ) {

        setPrimaryGuardianName(
          fatherName
        );

        setRelationship(
          "Father"
        );

      }
      else if (
        primaryGuardian === "Mother"
      ) {

        setPrimaryGuardianName(
          motherName
        );

        setRelationship(
          "Mother"
        );

      }
      else {

        setPrimaryGuardianName(
          guardianName
        );

      }

    },
    [
      primaryGuardian,
      fatherName,
      motherName,
      guardianName
    ]
  );


  // ============================================================
  // VALIDATE EDIT FORM
  // ============================================================

  const validateForm =
    () => {

      const errors = {};


      if (
        primaryGuardian === "Father" &&
        !cleanText(
          fatherName
        )
      ) {

        errors.fatherName =
          "Father name is required when Father is the primary guardian.";

      }


      if (
        primaryGuardian === "Mother" &&
        !cleanText(
          motherName
        )
      ) {

        errors.motherName =
          "Mother name is required when Mother is the primary guardian.";

      }


      if (
        primaryGuardian === "Other" &&
        !cleanText(
          guardianName
        )
      ) {

        errors.guardianName =
          "Guardian name is required.";

      }


      if (
        primaryGuardian === "Other" &&
        !cleanText(
          relationship
        )
      ) {

        errors.relationship =
          "Guardian relationship is required.";

      }


      const cleanedMobile =
        cleanNumber(
          mobileNumber
        );


      if (
        !cleanedMobile
      ) {

        errors.mobileNumber =
          "Primary mobile number is required.";

      }
      else if (
        cleanedMobile.length !== 10
      ) {

        errors.mobileNumber =
          "Enter a valid 10-digit mobile number.";

      }


      const cleanedAlternateMobile =
        cleanNumber(
          alternateMobileNumber
        );


      if (
        cleanedAlternateMobile &&
        cleanedAlternateMobile.length !== 10
      ) {

        errors.alternateMobileNumber =
          "Enter a valid 10-digit alternate mobile number.";

      }


      const cleanedEmergencyContact =
        cleanNumber(
          emergencyContact
        );


      if (
        cleanedEmergencyContact &&
        cleanedEmergencyContact.length !== 10
      ) {

        errors.emergencyContact =
          "Enter a valid 10-digit emergency contact number.";

      }


      const cleanedAadhaar =
        cleanNumber(
          aadhaarNumber
        );


      if (
        cleanedAadhaar &&
        cleanedAadhaar.length !== 12
      ) {

        errors.aadhaarNumber =
          "Aadhaar number must contain exactly 12 digits.";

      }


      const cleanedPinCode =
        cleanNumber(
          pinCode
        );


      if (
        cleanedPinCode &&
        cleanedPinCode.length !== 6
      ) {

        errors.pinCode =
          "PIN code must contain exactly 6 digits.";

      }


      if (
        cleanText(
          email
        ) &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanText(
            email
          )
        )
      ) {

        errors.email =
          "Enter a valid email address.";

      }


      setValidationErrors(
        errors
      );


      return Object.keys(
        errors
      ).length === 0;

    };
      // ============================================================
  // UPDATE PARENT RECORD
  // ============================================================

  const updateParent =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        isSaving
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");


      const isFormValid =
        validateForm();


      if (
        !isFormValid
      ) {

        setErrorMessage(
          "Please correct the highlighted form errors before updating the parent."
        );


        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });


        return;

      }


      setIsSaving(true);


      try {

        const parentReference =
          doc(
            db,
            "parents",
            id
          );


        const updatedParentData =
          {

            parentId:
              cleanText(
                parentId
              ),

            status:
              status,

            primaryGuardian:
              primaryGuardian,

            primaryGuardianName:
              cleanText(
                primaryGuardianName
              ),

            relationship:
              cleanText(
                relationship
              ),

            fatherName:
              cleanText(
                fatherName
              ),

            fatherOccupation:
              cleanText(
                fatherOccupation
              ),

            motherName:
              cleanText(
                motherName
              ),

            motherOccupation:
              cleanText(
                motherOccupation
              ),

            guardianName:
              cleanText(
                guardianName
              ),

            mobileNumber:
              cleanNumber(
                mobileNumber
              ),

            alternateMobileNumber:
              cleanNumber(
                alternateMobileNumber
              ),

            emergencyContact:
              cleanNumber(
                emergencyContact
              ),

            email:
              cleanText(
                email
              ).toLowerCase(),

            address:
              cleanText(
                address
              ),

            city:
              cleanText(
                city
              ),

            district:
              cleanText(
                district
              ),

            state:
              cleanText(
                state
              ),

            pinCode:
              cleanNumber(
                pinCode
              ),

            aadhaarNumber:
              cleanNumber(
                aadhaarNumber
              ),

            updatedAt:
              serverTimestamp()

          };


        await updateDoc(
          parentReference,
          updatedParentData
        );


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            "Parent record updated successfully."
          );


          setValidationErrors({});


          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });


          setTimeout(
            () => {

              navigate(
                `/parent-profile/${id}`
              );

            },
            1000
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error updating parent:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to update the parent record. Please try again."
          );


          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

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
  // RESET FORM TO ORIGINAL VALUES
  // ============================================================

  const resetForm =
    () => {

      if (
        !originalParent ||
        isSaving
      ) {

        return;

      }


      const confirmReset =
        window.confirm(
          "Discard all unsaved changes and restore the original parent information?"
        );


      if (
        !confirmReset
      ) {

        return;

      }


      loadParentIntoForm(
        originalParent
      );


      setValidationErrors({});

      setErrorMessage("");

      setSuccessMessage("");


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    };


  // ============================================================
  // CANCEL EDITING
  // ============================================================

  const cancelEditing =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      navigate(
        `/parent-profile/${id}`
      );

    };


  // ============================================================
  // FORM ERROR MESSAGE
  // ============================================================

  const FieldError =
    ({
      message
    }) => {

      if (
        !message
      ) {

        return null;

      }


      return (

        <p
          style={{
            margin: "7px 0 0",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "600"
          }}
        >
          ⚠️ {message}
        </p>

      );

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
              ✏ Edit Parent
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Update parent, guardian, contact, identity, and address information.
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
                cancelEditing
              }
              disabled={
                isSaving
              }
            >
              ← Back to Profile
            </button>


            <Link
              to="/parent-list"
              className="action-btn"
            >
              📋 Parent List
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
                  Loading Parent Record...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the parent information is loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            PARENT NOT FOUND
        ====================================================== */}

        {
          !isLoading &&
          parentNotFound && (

            <div className="section-card">

              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "58px",
                    marginBottom: "16px"
                  }}
                >
                  🔍
                </div>


                <h2>
                  Parent Record Not Found
                </h2>


                <p
                  style={{
                    margin: "0 0 22px",
                    color: "#64748b"
                  }}
                >
                  The parent record you are trying to edit does not exist.
                </p>


                <Link
                  to="/parent-list"
                  className="action-btn view-btn"
                >
                  📋 Return to Parent List
                </Link>

              </div>

            </div>

          )
        }


        {/* ======================================================
            EDIT PARENT FORM
        ====================================================== */}

        {
          !isLoading &&
          !parentNotFound &&
          originalParent && (

            <form
              onSubmit={
                updateParent
              }
            >

              {/* ==================================================
                  RECORD INFORMATION
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
                    🗂 Parent Record Information
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Manage the parent identification and record status.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Parent ID
                    </label>


                    <input
                      type="text"
                      placeholder="Parent ID"
                      value={
                        parentId
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setParentId(
                            event.target.value
                          )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Record Status
                    </label>


                    <select
                      value={
                        status
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setStatus(
                            event.target.value
                          )
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

              </div>


              {/* ==================================================
                  PRIMARY GUARDIAN INFORMATION
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
                    Select the main person responsible for the student.
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
                        (
                          event
                        ) =>
                          setPrimaryGuardian(
                            event.target.value
                          )
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


                  <div>

                    <label>
                      Primary Guardian Name
                    </label>


                    <input
                      type="text"
                      value={
                        primaryGuardianName
                      }
                      readOnly
                      placeholder="Automatically selected from guardian details"
                    />

                  </div>

                </div>


                {
                  primaryGuardian === "Other" && (

                    <div
                      className="form-grid"
                      style={{
                        marginTop: "16px"
                      }}
                    >

                      <div>

                        <label>
                          Guardian Name *
                        </label>


                        <input
                          type="text"
                          placeholder="Enter guardian name"
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
                        />


                        <FieldError
                          message={
                            validationErrors.guardianName
                          }
                        />

                      </div>


                      <div>

                        <label>
                          Relationship *
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
                        >

                          <option value="">
                            Select Relationship
                          </option>

                          <option value="Brother">
                            Brother
                          </option>

                          <option value="Sister">
                            Sister
                          </option>

                          <option value="Grandfather">
                            Grandfather
                          </option>

                          <option value="Grandmother">
                            Grandmother
                          </option>

                          <option value="Uncle">
                            Uncle
                          </option>

                          <option value="Aunt">
                            Aunt
                          </option>

                          <option value="Legal Guardian">
                            Legal Guardian
                          </option>

                          <option value="Other">
                            Other
                          </option>

                        </select>


                        <FieldError
                          message={
                            validationErrors.relationship
                          }
                        />

                      </div>

                    </div>

                  )
                }

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

                <h2>👨 Father Information</h2>

                <div className="form-grid">

                  <div>

                    <label>
                      Father Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter father name"
                      value={fatherName}
                      onChange={(event) =>
                        setFatherName(event.target.value)
                      }
                    />

                    <FieldError
                      message={validationErrors.fatherName}
                    />

                  </div>


                  <div>

                    <label>
                      Father Occupation
                    </label>

                    <input
                      type="text"
                      placeholder="Enter father occupation"
                      value={fatherOccupation}
                      onChange={(event) =>
                        setFatherOccupation(event.target.value)
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

                <h2>👩 Mother Information</h2>

                <div className="form-grid">

                  <div>

                    <label>
                      Mother Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter mother name"
                      value={motherName}
                      onChange={(event) =>
                        setMotherName(event.target.value)
                      }
                    />

                    <FieldError
                      message={validationErrors.motherName}
                    />

                  </div>


                  <div>

                    <label>
                      Mother Occupation
                    </label>

                    <input
                      type="text"
                      placeholder="Enter mother occupation"
                      value={motherOccupation}
                      onChange={(event) =>
                        setMotherOccupation(event.target.value)
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
                    Update the parent and guardian contact details.
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
                      maxLength="10"
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={(event) =>
                        setMobileNumber(
                          cleanNumber(event.target.value)
                            .slice(0, 10)
                        )
                      }
                    />

                    <FieldError
                      message={validationErrors.mobileNumber}
                    />

                  </div>


                  <div>

                    <label>
                      Alternate Mobile Number
                    </label>

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength="10"
                      placeholder="Enter alternate mobile number"
                      value={alternateMobileNumber}
                      onChange={(event) =>
                        setAlternateMobileNumber(
                          cleanNumber(event.target.value)
                            .slice(0, 10)
                        )
                      }
                    />

                    <FieldError
                      message={
                        validationErrors.alternateMobileNumber
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
                      maxLength="10"
                      placeholder="Enter emergency contact"
                      value={emergencyContact}
                      onChange={(event) =>
                        setEmergencyContact(
                          cleanNumber(event.target.value)
                            .slice(0, 10)
                        )
                      }
                    />

                    <FieldError
                      message={
                        validationErrors.emergencyContact
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                    />

                    <FieldError
                      message={validationErrors.email}
                    />

                  </div>

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
                    Update the residential and location details.
                  </p>

                </div>


                <div
                  style={{
                    marginBottom: "16px"
                  }}
                >

                  <label>
                    Full Address
                  </label>

                  <textarea
                    placeholder="Enter complete residential address"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    rows="4"
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
                      placeholder="Enter city, town, or village"
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                    />

                  </div>


                  <div>

                    <label>
                      District
                    </label>

                    <input
                      type="text"
                      placeholder="Enter district"
                      value={district}
                      onChange={(event) =>
                        setDistrict(event.target.value)
                      }
                    />

                  </div>


                  <div>

                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      placeholder="Enter state"
                      value={state}
                      onChange={(event) =>
                        setState(event.target.value)
                      }
                    />

                  </div>


                  <div>

                    <label>
                      PIN Code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="Enter 6-digit PIN code"
                      value={pinCode}
                      onChange={(event) =>
                        setPinCode(
                          cleanNumber(event.target.value)
                            .slice(0, 6)
                        )
                      }
                    />

                    <FieldError
                      message={validationErrors.pinCode}
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
                    Update identity details carefully.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Aadhaar Number
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="12"
                      placeholder="Enter 12-digit Aadhaar number"
                      value={aadhaarNumber}
                      onChange={(event) =>
                        setAadhaarNumber(
                          cleanNumber(event.target.value)
                            .slice(0, 12)
                        )
                      }
                    />

                    <FieldError
                      message={validationErrors.aadhaarNumber}
                    />

                  </div>

                </div>


                <div
                  style={{
                    padding: "14px 16px",
                    marginTop: "18px",
                    borderRadius: "10px",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    color: "#9a3412",
                    lineHeight: "1.7"
                  }}
                >
                  🔒 <strong>Privacy:</strong> Aadhaar is sensitive personal data. Keep access restricted and avoid displaying the complete number unnecessarily.
                </div>

              </div>
                            {/* ==================================================
                  UPDATE SUMMARY
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 6px"
                  }}
                >
                  📋 Update Summary
                </h2>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#64748b"
                  }}
                >
                  Review the important parent information before saving changes.
                </p>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
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
                        margin: "0 0 6px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      PARENT ID
                    </p>

                    <strong>
                      {parentId || "Not Available"}
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
                      PRIMARY GUARDIAN
                    </p>

                    <strong>
                      {primaryGuardianName || "Not Available"}
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
                      RELATIONSHIP
                    </p>

                    <strong>
                      {relationship || "Not Available"}
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
                      MOBILE NUMBER
                    </p>

                    <strong>
                      {mobileNumber || "Not Available"}
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
                      RECORD STATUS
                    </p>

                    <strong>
                      {status}
                    </strong>
                  </div>

                </div>

              </div>


              {/* ==================================================
                  SAVE INFORMATION
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
                💡 <strong>Before Saving:</strong> Check the parent name, primary guardian, mobile number, address, and identity information carefully. Existing student mappings and parent account information will remain unchanged.
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
                    gap: "16px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      💾 Save Parent Changes
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Save the updated information or discard your changes.
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
                      onClick={cancelEditing}
                      disabled={isSaving}
                    >
                      ← Cancel
                    </button>


                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isSaving}
                    >
                      🔄 Reset Changes
                    </button>


                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{
                        minWidth: "190px"
                      }}
                    >
                      {
                        isSaving
                          ?
                          "⏳ Saving Changes..."
                          :
                          "💾 Save Changes"
                      }
                    </button>

                  </div>

                </div>

              </div>

            </form>

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

export default EditParent;