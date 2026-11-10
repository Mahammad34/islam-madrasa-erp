import {
  collection,
  getDocs
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

function SearchParent() {

  // ============================================================
  // REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const searchInputRef =
    useRef(null);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    parents,
    setParents
  ] = useState([]);


  // ============================================================
  // SEARCH STATES
  // ============================================================

  const [
    search,
    setSearch
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    mappingFilter,
    setMappingFilter
  ] = useState("All");


  const [
    guardianFilter,
    setGuardianFilter
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
    errorMessage,
    setErrorMessage
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
  // GET PRIMARY GUARDIAN NAME
  // ============================================================

  const getPrimaryGuardianName =
    (
      parent
    ) => {

      if (
        parent.primaryGuardianName
      ) {

        return parent.primaryGuardianName;

      }


      if (
        parent.primaryGuardian === "Mother" &&
        parent.motherName
      ) {

        return parent.motherName;

      }


      if (
        parent.primaryGuardian === "Other" &&
        parent.guardianName
      ) {

        return parent.guardianName;

      }


      return (

        parent.fatherName ||

        parent.motherName ||

        parent.guardianName ||

        "Unknown Parent"

      );

    };


  // ============================================================
  // GET GUARDIAN RELATIONSHIP
  // ============================================================

  const getGuardianRelationship =
    (
      parent
    ) => {

      return (

        parent.relationship ||

        parent.primaryGuardian ||

        (
          parent.fatherName
            ?
            "Father"
            :
            parent.motherName
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
      parent
    ) => {

      return parent.status ||
        "Active";

    };


  // ============================================================
  // GET STUDENT COUNT
  // ============================================================

  const getStudentCount =
    (
      parent
    ) => {

      const storedStudentCount =
        Number(
          parent.studentCount
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
          parent.linkedStudentIds
        )
      ) {

        return parent.linkedStudentIds.length;

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
  // FETCH PARENTS
  // ============================================================

  const fetchParents =
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

          setParents(
            parentList
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
            "Unable to load parent records. Please check your connection and try again."
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
  // LOAD PARENTS
  // ============================================================

  useEffect(
    () => {

      fetchParents();

    },
    []
  );


  // ============================================================
  // ACTIVE SEARCH CHECK
  // ============================================================

  const hasActiveSearch =
    useMemo(
      () => {

        return (

          search.trim() !== "" ||

          statusFilter !== "All" ||

          mappingFilter !== "All" ||

          guardianFilter !== "All"

        );

      },
      [
        search,
        statusFilter,
        mappingFilter,
        guardianFilter
      ]
    );


  // ============================================================
  // FILTER PARENTS
  // ============================================================

  const filteredParents =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            search
          );


        return parents.filter(
          (
            parent
          ) => {

            const guardianName =
              getPrimaryGuardianName(
                parent
              );


            const guardianRelationship =
              getGuardianRelationship(
                parent
              );


            const parentStatus =
              getParentStatus(
                parent
              );


            const studentCount =
              getStudentCount(
                parent
              );


            const searchableValues =
              [

                parent.parentId,

                guardianName,

                guardianRelationship,

                parent.fatherName,

                parent.fatherOccupation,

                parent.motherName,

                parent.motherOccupation,

                parent.guardianName,

                parent.mobileNumber,

                parent.alternateMobileNumber,

                parent.email,

                parent.emergencyContact,

                parent.aadhaarNumber,

                parent.address,

                parent.city,

                parent.district,

                parent.state,

                parent.pinCode

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


            const matchesStatus =
              statusFilter === "All" ||

              parentStatus ===
                statusFilter;


            const matchesMapping =
              mappingFilter === "All" ||

              (
                mappingFilter === "Mapped" &&
                studentCount > 0
              ) ||

              (
                mappingFilter === "Not Mapped" &&
                studentCount === 0
              );


            const matchesGuardian =
              guardianFilter === "All" ||

              guardianRelationship ===
                guardianFilter;


            return (

              matchesSearch &&

              matchesStatus &&

              matchesMapping &&

              matchesGuardian

            );

          }
        );

      },
      [
        parents,
        search,
        statusFilter,
        mappingFilter,
        guardianFilter
      ]
    );


  // ============================================================
  // RESET SEARCH
  // ============================================================

  const resetSearch =
    () => {

      setSearch("");

      setStatusFilter(
        "All"
      );

      setMappingFilter(
        "All"
      );

      setGuardianFilter(
        "All"
      );


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        100
      );

    };


  // ============================================================
  // REFRESH SEARCH DATA
  // ============================================================

  const refreshParents =
    async () => {

      await fetchParents(
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
              🔍 Search Parent
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Quickly find registered parents and guardians using multiple search options.
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
                refreshParents
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
              📋 Parent List
            </Link>


            <Link
              to="/add-parent"
              className="action-btn view-btn"
            >
              ➕ Add Parent
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
            SEARCH SECTION
        ====================================================== */}

        <div
          className="section-card"
          style={{
            marginBottom: "22px"
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
                🔎 Find Parent Records
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b"
                }}
              >
                Search using parent information, contact details, identity details, or location.
              </p>

            </div>


            {
              hasActiveSearch && (

                <button
                  type="button"
                  onClick={
                    resetSearch
                  }
                >
                  ✖ Clear Search
                </button>

              )
            }

          </div>


          {/* ====================================================
              MAIN SEARCH INPUT
          ==================================================== */}

          <div
            style={{
              marginBottom: "18px"
            }}
          >

            <label>
              Search Parent
            </label>


            <input
              ref={
                searchInputRef
              }
              type="text"
              placeholder="Search Parent ID, Name, Mobile, Email, Aadhaar, City, District..."
              value={
                search
              }
              onChange={
                (
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
              }
              autoFocus
            />

          </div>


          {/* ====================================================
              SEARCH FILTERS
          ==================================================== */}

          <div className="form-grid">

            <div>

              <label>
                Guardian Relationship
              </label>


              <select
                value={
                  guardianFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setGuardianFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Guardians
                </option>

                <option value="Father">
                  Father
                </option>

                <option value="Mother">
                  Mother
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

            </div>


            <div>

              <label>
                Parent Status
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

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>


            <div>

              <label>
                Student Mapping
              </label>


              <select
                value={
                  mappingFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setMappingFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Records
                </option>

                <option value="Mapped">
                  Mapped to Students
                </option>

                <option value="Not Mapped">
                  Not Mapped
                </option>

              </select>

            </div>

          </div>


          {/* ====================================================
              SEARCH TIPS
          ==================================================== */}

          <div
            style={{
              padding: "14px 16px",
              marginTop: "18px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              lineHeight: "1.7"
            }}
          >
            💡
            {" "}
            <strong>
              Search Tip:
            </strong>
            {" "}
            You can search using Parent ID, guardian name, father or mother name, mobile number, email, Aadhaar number, address, city, district, state, or PIN code.
          </div>

        </div>


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
                    fontSize: "52px",
                    marginBottom: "14px"
                  }}
                >
                  ⏳
                </div>


                <h2>
                  Loading Parent Records...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while parent information is loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            SEARCH RESULTS CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  RESULT COUNT
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
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
                    Search Results
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Found
                    {" "}
                    <strong>
                      {filteredParents.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {parents.length}
                    </strong>
                    {" "}
                    parent records
                  </p>

                </div>


                {
                  hasActiveSearch && (

                    <span
                      style={{
                        padding: "7px 12px",
                        borderRadius: "999px",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: "700"
                      }}
                    >
                      🔍 Search Active
                    </span>

                  )
                }

              </div>


              {/* ==================================================
                  EMPTY DATABASE
              ================================================== */}

              {
                parents.length === 0 && (

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
                          marginBottom: "16px"
                        }}
                      >
                        👨‍👩‍👧
                      </div>


                      <h2>
                        No Parents Registered
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        There are currently no parent records available to search.
                      </p>


                      <Link
                        to="/add-parent"
                        className="action-btn view-btn"
                      >
                        ➕ Add First Parent
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO MATCHING RESULTS
              ================================================== */}

              {
                parents.length > 0 &&
                filteredParents.length === 0 && (

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
                        🔍
                      </div>


                      <h2>
                        No Matching Parents Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Try changing your search text or removing one of the active filters.
                      </p>


                      <button
                        type="button"
                        onClick={
                          resetSearch
                        }
                      >
                        ✖ Clear Search & Filters
                      </button>

                    </div>

                  </div>

                )
              }
                            {/* ==================================================
                  SEARCH RESULT CARDS
              ================================================== */}

              {
                filteredParents.length > 0 && (

                  filteredParents.map(
                    (
                      parent
                    ) => {

                      const guardianName =
                        getPrimaryGuardianName(
                          parent
                        );


                      const guardianRelationship =
                        getGuardianRelationship(
                          parent
                        );


                      const parentStatus =
                        getParentStatus(
                          parent
                        );


                      const studentCount =
                        getStudentCount(
                          parent
                        );


                      const hasParentAccount =
                        parent.accountCreated ===
                        true;


                      const location =
                        [

                          parent.city,

                          parent.district,

                          parent.state

                        ]
                          .filter(
                            Boolean
                          )
                          .join(", ");


                      return (

                        <div
                          className="student-card"
                          key={
                            parent.id
                          }
                          style={{
                            marginBottom: "18px"
                          }}
                        >

                          {/* ========================================
                              RESULT CARD HEADER
                          ======================================== */}

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "18px",
                              flexWrap: "wrap"
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "16px",
                                flex: 1,
                                minWidth: "250px"
                              }}
                            >

                              <div className="student-avatar">
                                👨‍👩‍👧
                              </div>


                              <div>

                                <h2
                                  className="student-name"
                                  style={{
                                    margin: "0 0 5px"
                                  }}
                                >
                                  {guardianName}
                                </h2>


                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#2563eb",
                                    fontWeight: "700"
                                  }}
                                >
                                  🪪
                                  {" "}
                                  {
                                    displayValue(
                                      parent.parentId,
                                      "Legacy Parent Record"
                                    )
                                  }
                                </p>


                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b"
                                  }}
                                >
                                  👤 Primary Guardian:
                                  {" "}
                                  <strong>
                                    {guardianRelationship}
                                  </strong>
                                </p>

                              </div>

                            </div>


                            {/* ======================================
                                RESULT BADGES
                            ====================================== */}

                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                justifyContent: "flex-end"
                              }}
                            >

                              <span
                                style={{
                                  padding: "6px 11px",
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
                                  padding: "6px 11px",
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
                                    "🔗 Not Mapped"
                                }
                              </span>


                              <span
                                style={{
                                  padding: "6px 11px",
                                  borderRadius: "999px",
                                  background:
                                    hasParentAccount
                                      ?
                                      "#ede9fe"
                                      :
                                      "#f1f5f9",
                                  color:
                                    hasParentAccount
                                      ?
                                      "#6d28d9"
                                      :
                                      "#64748b",
                                  fontSize: "12px",
                                  fontWeight: "700"
                                }}
                              >
                                {
                                  hasParentAccount
                                    ?
                                    "🔐 Account Created"
                                    :
                                    "🔓 No Account"
                                }
                              </span>

                            </div>

                          </div>


                          {/* ========================================
                              FAMILY INFORMATION
                          ======================================== */}

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(210px, 1fr))",
                              gap: "12px",
                              marginTop: "20px"
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
                                  displayValue(
                                    parent.fatherName
                                  )
                                }
                              </strong>


                              <p
                                style={{
                                  margin: "6px 0 0",
                                  color: "#64748b"
                                }}
                              >
                                {
                                  displayValue(
                                    parent.fatherOccupation ||
                                    parent.occupation,
                                    "Occupation Not Available"
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
                                  displayValue(
                                    parent.motherName
                                  )
                                }
                              </strong>


                              <p
                                style={{
                                  margin: "6px 0 0",
                                  color: "#64748b"
                                }}
                              >
                                {
                                  displayValue(
                                    parent.motherOccupation,
                                    "Occupation Not Available"
                                  )
                                }
                              </p>

                            </div>

                          </div>


                          {/* ========================================
                              CONTACT INFORMATION
                          ======================================== */}

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(210px, 1fr))",
                              gap: "12px",
                              marginTop: "12px"
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
                                  margin: "0 0 7px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                📞 CONTACT DETAILS
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  Primary:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.mobileNumber
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  Alternate:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.alternateMobileNumber
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  Emergency:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.emergencyContact
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: 0
                                }}
                              >
                                <strong>
                                  Email:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.email
                                  )
                                }
                              </p>

                            </div>


                            {/* ======================================
                                LOCATION INFORMATION
                            ====================================== */}

                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "10px",
                                background: "#f8fafc"
                              }}
                            >

                              <p
                                style={{
                                  margin: "0 0 7px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                📍 LOCATION
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                {
                                  displayValue(
                                    location
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  PIN:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.pinCode
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b",
                                  lineHeight: "1.6"
                                }}
                              >
                                {
                                  displayValue(
                                    parent.address,
                                    "Full Address Not Available"
                                  )
                                }
                              </p>

                            </div>


                            {/* ======================================
                                IDENTITY INFORMATION
                            ====================================== */}

                            <div
                              style={{
                                padding: "14px",
                                borderRadius: "10px",
                                background: "#f8fafc"
                              }}
                            >

                              <p
                                style={{
                                  margin: "0 0 7px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                🪪 IDENTITY & RECORD
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  Aadhaar:
                                </strong>
                                {" "}
                                {
                                  maskAadhaarNumber(
                                    parent.aadhaarNumber
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 5px"
                                }}
                              >
                                <strong>
                                  Students:
                                </strong>
                                {" "}
                                {studentCount}
                              </p>


                              <p
                                style={{
                                  margin: 0
                                }}
                              >
                                <strong>
                                  Account:
                                </strong>
                                {" "}
                                {
                                  hasParentAccount
                                    ?
                                    "Created"
                                    :
                                    "Not Created"
                                }
                              </p>

                            </div>

                          </div>


                          {/* ========================================
                              SEARCH RESULT ACTIONS
                          ======================================== */}

                          <div
                            className="student-actions"
                            style={{
                              marginTop: "20px"
                            }}
                          >

                            <Link
                              to={
                                `/parent-profile/${parent.id}`
                              }
                              className="action-btn view-btn"
                            >
                              👁 View Profile
                            </Link>


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
                              className="action-btn"
                            >
                              👨‍🎓 Map Student
                            </Link>

                          </div>

                        </div>

                      );

                    }
                  )

                )
              }

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

export default SearchParent;