import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
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

function ParentProfile() {

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
  // DATABASE STATE
  // ============================================================

  const [
    parent,
    setParent
  ] = useState(null);


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
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    parentNotFound,
    setParentNotFound
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
  // GET PRIMARY GUARDIAN NAME
  // ============================================================

  const getPrimaryGuardianName =
    (
      parentRecord
    ) => {

      if (
        parentRecord?.primaryGuardianName
      ) {

        return parentRecord.primaryGuardianName;

      }


      if (
        parentRecord?.primaryGuardian === "Mother" &&
        parentRecord?.motherName
      ) {

        return parentRecord.motherName;

      }


      if (
        parentRecord?.primaryGuardian === "Other" &&
        parentRecord?.guardianName
      ) {

        return parentRecord.guardianName;

      }


      return (

        parentRecord?.fatherName ||

        parentRecord?.motherName ||

        parentRecord?.guardianName ||

        "Unknown Parent"

      );

    };


  // ============================================================
  // GET GUARDIAN RELATIONSHIP
  // ============================================================

  const getGuardianRelationship =
    (
      parentRecord
    ) => {

      return (

        parentRecord?.relationship ||

        parentRecord?.primaryGuardian ||

        (
          parentRecord?.fatherName
            ?
            "Father"
            :
            parentRecord?.motherName
              ?
              "Mother"
              :
              "Guardian"
        )

      );

    };


  // ============================================================
  // GET PARENT STATUS
  // ============================================================

  const getParentStatus =
    (
      parentRecord
    ) => {

      return parentRecord?.status ||
        "Active";

    };


  // ============================================================
  // GET STUDENT COUNT
  // ============================================================

  const getStudentCount =
    (
      parentRecord
    ) => {

      const storedStudentCount =
        Number(
          parentRecord?.studentCount
        );


      if (
        Number.isFinite(
          storedStudentCount
        )
      ) {

        return storedStudentCount;

      }


      if (
        Array.isArray(
          parentRecord?.linkedStudentIds
        )
      ) {

        return parentRecord.linkedStudentIds.length;

      }


      return 0;

    };


  // ============================================================
  // MASK AADHAAR NUMBER
  // ============================================================

  const maskAadhaarNumber =
    (
      aadhaarNumber
    ) => {

      const cleanedAadhaar =
        String(
          aadhaarNumber || ""
        ).replace(
          /\D/g,
          ""
        );


      if (
        cleanedAadhaar.length !== 12
      ) {

        return "Not Available";

      }


      return `XXXX XXXX ${cleanedAadhaar.slice(-4)}`;

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
  // FORMAT DATE
  // ============================================================

  const formatDate =
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


      return convertedDate.toLocaleDateString(
        "en-IN",
        {

          day: "2-digit",

          month: "long",

          year: "numeric"

        }
      );

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
  // FETCH PARENT PROFILE
  // ============================================================

  const fetchParent =
    async (
      showRefreshLoader = false
    ) => {

      if (
        !id
      ) {

        setParentNotFound(true);

        setIsLoading(false);

        return;

      }


      if (
        showRefreshLoader
      ) {

        setIsRefreshing(true);

      }
      else {

        setIsLoading(true);

      }


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

            setParent(null);

            setParentNotFound(true);

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

          setParent(
            parentData
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading parent profile:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load the parent profile. Please check your connection and try again."
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
  // LOAD PROFILE
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
  // PROFILE VALUES
  // ============================================================

  const guardianName =
    useMemo(
      () => {

        return getPrimaryGuardianName(
          parent
        );

      },
      [
        parent
      ]
    );


  const guardianRelationship =
    useMemo(
      () => {

        return getGuardianRelationship(
          parent
        );

      },
      [
        parent
      ]
    );


  const parentStatus =
    useMemo(
      () => {

        return getParentStatus(
          parent
        );

      },
      [
        parent
      ]
    );


  const studentCount =
    useMemo(
      () => {

        return getStudentCount(
          parent
        );

      },
      [
        parent
      ]
    );


  const fullLocation =
    useMemo(
      () => {

        if (
          !parent
        ) {

          return "";

        }


        return [

          parent.city,

          parent.district,

          parent.state,

          parent.pinCode

        ]
          .filter(
            Boolean
          )
          .join(", ");

      },
      [
        parent
      ]
    );


  // ============================================================
  // REFRESH PROFILE
  // ============================================================

  const refreshProfile =
    async () => {

      await fetchParent(
        true
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
              👤 Parent Profile
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View complete parent, guardian, contact, and student mapping information.
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
                  navigate(
                    "/parent-list"
                  )
              }
            >
              ← Back
            </button>


            <button
              type="button"
              onClick={
                refreshProfile
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


            {
              parent && (

                <Link
                  to={
                    `/edit-parent/${parent.id}`
                  }
                  className="action-btn edit-btn"
                >
                  ✏ Edit Parent
                </Link>

              )
            }

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
                  Loading Parent Profile...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while the parent information is loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            PARENT NOT FOUND STATE
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
                    color: "#64748b",
                    lineHeight: "1.7"
                  }}
                >
                  The requested parent record does not exist or may have been deleted.
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
            PARENT PROFILE CONTENT
        ====================================================== */}

        {
          !isLoading &&
          !parentNotFound &&
          parent && (

            <>

              {/* ==================================================
                  PROFILE HERO SECTION
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
                    gap: "20px",
                    flexWrap: "wrap"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "18px",
                      flex: 1,
                      minWidth: "260px"
                    }}
                  >

                    <div
                      style={{
                        width: "78px",
                        height: "78px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        background: "#eff6ff",
                        fontSize: "38px"
                      }}
                    >
                      👨‍👩‍👧
                    </div>


                    <div>

                      <p
                        style={{
                          margin: "0 0 5px",
                          color: "#2563eb",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {
                          displayValue(
                            parent.parentId,
                            "LEGACY PARENT RECORD"
                          )
                        }
                      </p>


                      <h2
                        style={{
                          margin: "0 0 7px",
                          fontSize: "28px"
                        }}
                      >
                        {guardianName}
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Primary Guardian
                        {" • "}
                        <strong>
                          {guardianRelationship}
                        </strong>
                      </p>

                    </div>

                  </div>


                  {/* ==============================================
                      PROFILE BADGES
                  ============================================== */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}
                  >

                    <span
                      style={{
                        padding: "7px 12px",
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
                        fontWeight: "700"
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


                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background:
                          studentCount > 0
                            ?
                            "#dbeafe"
                            :
                            "#fef3c7",
                        color:
                          studentCount > 0
                            ?
                            "#1d4ed8"
                            :
                            "#92400e",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      {
                        studentCount > 0
                          ?
                          `👨‍🎓 ${studentCount} Student${
                            studentCount === 1
                              ?
                              ""
                              :
                              "s"
                          }`
                          :
                          "🔗 No Students Linked"
                      }
                    </span>


                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background:
                          parent.accountCreated === true
                            ?
                            "#ede9fe"
                            :
                            "#f1f5f9",
                        color:
                          parent.accountCreated === true
                            ?
                            "#6d28d9"
                            :
                            "#64748b",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      {
                        parent.accountCreated === true
                          ?
                          "🔐 Account Created"
                          :
                          "🔓 No Parent Account"
                      }
                    </span>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  QUICK PROFILE STATISTICS
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
                    PARENT ID
                  </p>


                  <h3
                    style={{
                      margin: 0,
                      color: "#2563eb"
                    }}
                  >
                    {
                      displayValue(
                        parent.parentId,
                        "Legacy Record"
                      )
                    }
                  </h3>

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
                    PRIMARY GUARDIAN
                  </p>


                  <h3
                    style={{
                      margin: 0
                    }}
                  >
                    {guardianRelationship}
                  </h3>

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
                    LINKED STUDENTS
                  </p>


                  <h3
                    style={{
                      margin: 0
                    }}
                  >
                    {studentCount}
                  </h3>

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
                    REGISTRATION DATE
                  </p>


                  <h3
                    style={{
                      margin: 0
                    }}
                  >
                    {
                      formatDate(
                        parent.createdAt
                      )
                    }
                  </h3>

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
                    👤 Primary Guardian Information
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Main contact person responsible for the student.
                  </p>

                </div>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
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
                      GUARDIAN NAME
                    </p>


                    <strong>
                      {guardianName}
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
                      {guardianRelationship}
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
                      PRIMARY MOBILE
                    </p>


                    <strong>
                      {
                        displayValue(
                          parent.mobileNumber
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
                      EMAIL ADDRESS
                    </p>


                    <strong>
                      {
                        displayValue(
                          parent.email
                        )
                      }
                    </strong>

                  </div>

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

                <h2>
                  👨 Father Information
                </h2>

                <div className="form-grid">

                  <div>
                    <p>Father Name</p>
                    <strong>
                      {displayValue(parent.fatherName)}
                    </strong>
                  </div>

                  <div>
                    <p>Father Occupation</p>
                    <strong>
                      {displayValue(
                        parent.fatherOccupation ||
                        parent.occupation
                      )}
                    </strong>
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

                <h2>
                  👩 Mother Information
                </h2>

                <div className="form-grid">

                  <div>
                    <p>Mother Name</p>
                    <strong>
                      {displayValue(parent.motherName)}
                    </strong>
                  </div>

                  <div>
                    <p>Mother Occupation</p>
                    <strong>
                      {displayValue(parent.motherOccupation)}
                    </strong>
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

                <h2>
                  📞 Contact Information
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: "12px"
                  }}
                >

                  <div>
                    <p>Primary Mobile</p>
                    <strong>
                      {displayValue(parent.mobileNumber)}
                    </strong>
                  </div>

                  <div>
                    <p>Alternate Mobile</p>
                    <strong>
                      {displayValue(parent.alternateMobileNumber)}
                    </strong>
                  </div>

                  <div>
                    <p>Emergency Contact</p>
                    <strong>
                      {displayValue(parent.emergencyContact)}
                    </strong>
                  </div>

                  <div>
                    <p>Email Address</p>
                    <strong>
                      {displayValue(parent.email)}
                    </strong>
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

                <h2>
                  🪪 Identity Information
                </h2>

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
                      color: "#64748b"
                    }}
                  >
                    Aadhaar Number
                  </p>

                  <strong>
                    {maskAadhaarNumber(parent.aadhaarNumber)}
                  </strong>

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

                <h2>
                  📍 Address Information
                </h2>

                <div
                  style={{
                    padding: "14px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#64748b"
                    }}
                  >
                    Full Address
                  </p>

                  <strong>
                    {displayValue(parent.address)}
                  </strong>

                </div>


                <div className="form-grid">

                  <div>
                    <p>City / Town / Village</p>
                    <strong>
                      {displayValue(parent.city)}
                    </strong>
                  </div>

                  <div>
                    <p>District</p>
                    <strong>
                      {displayValue(parent.district)}
                    </strong>
                  </div>

                  <div>
                    <p>State</p>
                    <strong>
                      {displayValue(parent.state)}
                    </strong>
                  </div>

                  <div>
                    <p>PIN Code</p>
                    <strong>
                      {displayValue(parent.pinCode)}
                    </strong>
                  </div>

                </div>


                <div
                  style={{
                    marginTop: "14px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#eff6ff"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#64748b"
                    }}
                  >
                    Complete Location
                  </p>

                  <strong>
                    {displayValue(fullLocation)}
                  </strong>

                </div>

              </div>


              {/* ==================================================
                  LINKED STUDENTS
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      👨‍🎓 Linked Students
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Students currently connected to this parent record.
                    </p>

                  </div>


                  <Link
                    to="/student-mapping"
                    className="action-btn view-btn"
                  >
                    🔗 Manage Student Mapping
                  </Link>

                </div>


                <div
                  style={{
                    marginTop: "20px"
                  }}
                >

                  {
                    studentCount === 0
                      ?
                      (

                        <div
                          style={{
                            padding: "35px 20px",
                            textAlign: "center",
                            borderRadius: "10px",
                            background: "#f8fafc"
                          }}
                        >

                          <div
                            style={{
                              fontSize: "42px",
                              marginBottom: "10px"
                            }}
                          >
                            🔗
                          </div>

                          <h3>
                            No Students Linked
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            This parent has not yet been mapped to any student.
                          </p>

                        </div>

                      )
                      :
                      (

                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe"
                          }}
                        >

                          <h3
                            style={{
                              margin: "0 0 8px",
                              color: "#1d4ed8"
                            }}
                          >
                            👨‍🎓 {studentCount} Linked Student{
                              studentCount === 1 ? "" : "s"
                            }
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b"
                            }}
                          >
                            Detailed student information will be available through the Student Mapping module.
                          </p>

                        </div>

                      )
                  }

                </div>

              </div>


              {/* ==================================================
                  PARENT ACCOUNT INFORMATION
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      🔐 Parent Account
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Parent portal login and account information.
                    </p>

                  </div>


                  <Link
                    to="/parent-accounts"
                    className="action-btn"
                  >
                    👤 Manage Parent Account
                  </Link>

                </div>


                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "10px",
                    background:
                      parent.accountCreated === true
                        ? "#f0fdf4"
                        : "#f8fafc",
                    border:
                      parent.accountCreated === true
                        ? "1px solid #bbf7d0"
                        : "1px solid #e2e8f0"
                  }}
                >

                  <strong>
                    {
                      parent.accountCreated === true
                        ? "✅ Parent Login Account Created"
                        : "🔓 Parent Login Account Not Created"
                    }
                  </strong>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      parent.accountCreated === true
                        ? "This parent has access to the parent portal."
                        : "A login account can be created from the Parent Accounts module."
                    }
                  </p>

                </div>

              </div>


              {/* ==================================================
                  RECORD METADATA
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
                }}
              >

                <h2>
                  🗂 Record Information
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: "12px"
                  }}
                >

                  <div>

                    <p>Firestore Document ID</p>

                    <strong
                      style={{
                        wordBreak: "break-all"
                      }}
                    >
                      {parent.id}
                    </strong>

                  </div>


                  <div>

                    <p>Created At</p>

                    <strong>
                      {formatDateTime(parent.createdAt)}
                    </strong>

                  </div>


                  <div>

                    <p>Last Updated</p>

                    <strong>
                      {formatDateTime(parent.updatedAt)}
                    </strong>

                  </div>


                  <div>

                    <p>Record Status</p>

                    <strong>
                      {parentStatus}
                    </strong>

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  QUICK ACTIONS
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
                }}
              >

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <h2
                    style={{
                      margin: "0 0 6px"
                    }}
                  >
                    ⚡ Quick Actions
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Manage this parent record and related information.
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
                    to={
                      `/edit-parent/${parent.id}`
                    }
                    className="action-btn edit-btn"
                  >
                    ✏ Edit Parent
                  </Link>


                  <Link
                    to="/student-mapping"
                    className="action-btn view-btn"
                  >
                    👨‍🎓 Student Mapping
                  </Link>


                  <Link
                    to="/parent-accounts"
                    className="action-btn"
                  >
                    🔐 Parent Account
                  </Link>


                  <Link
                    to="/search-parent"
                    className="action-btn"
                  >
                    🔍 Search Parents
                  </Link>


                  <Link
                    to="/parent-list"
                    className="action-btn"
                  >
                    📋 Parent List
                  </Link>

                </div>

              </div>


              {/* ==================================================
                  PROFILE FOOTER INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                🕌
                {" "}
                Parent information is securely maintained as part of the Madrasa ERP management system.
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

export default ParentProfile;