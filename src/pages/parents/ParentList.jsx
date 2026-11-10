import {
  collection,
  deleteDoc,
  doc,
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

function ParentList() {

  // ============================================================
  // COMPONENT REFERENCES
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
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    guardianFilter,
    setGuardianFilter
  ] = useState("All");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    stateFilter,
    setStateFilter
  ] = useState("All");


  const [
    mappingFilter,
    setMappingFilter
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
  // DELETE CONFIRMATION STATES
  // ============================================================

  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


  const [
    parentToDelete,
    setParentToDelete
  ] = useState(null);


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
  // GET PRIMARY GUARDIAN RELATIONSHIP
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

      return (
        parent.status ||
        "Active"
      );

    };


  // ============================================================
  // GET STUDENT COUNT
  // ============================================================

  const getStudentCount =
    (
      parent
    ) => {

      if (
        Number.isFinite(
          Number(
            parent.studentCount
          )
        )
      ) {

        return Number(
          parent.studentCount
        );

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
  // GET PARENT DATE
  // ============================================================

  const getParentDate =
    (
      parent
    ) => {

      const dateValue =
        parent.createdAt;


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
      parent
    ) => {

      const parentDate =
        getParentDate(
          parent
        );


      if (
        !parentDate
      ) {

        return "Date Not Available";

      }


      return parentDate.toLocaleDateString(
        "en-IN",
        {

          day: "2-digit",

          month: "short",

          year: "numeric"

        }
      );

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
        )
          .replace(
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
  // LOAD PARENTS FROM FIREBASE
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
  // LOAD PARENTS WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchParents();

    },
    []
  );


  // ============================================================
  // AVAILABLE STATES
  // ============================================================

  const availableStates =
    useMemo(
      () => {

        return [

          ...new Set(

            parents
              .map(
                (
                  parent
                ) =>
                  String(
                    parent.state || ""
                  ).trim()
              )
              .filter(
                Boolean
              )

          )

        ].sort(
          (
            firstState,
            secondState
          ) =>
            firstState.localeCompare(
              secondState
            )
        );

      },
      [
        parents
      ]
    );


  // ============================================================
  // FILTER ACTIVE CHECK
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !== "" ||

          guardianFilter !== "All" ||

          statusFilter !== "All" ||

          stateFilter !== "All" ||

          mappingFilter !== "All" ||

          sortOption !== "newest"

        );

      },
      [
        searchTerm,
        guardianFilter,
        statusFilter,
        stateFilter,
        mappingFilter,
        sortOption
      ]
    );


  // ============================================================
  // FILTER AND SORT PARENTS
  // ============================================================

  const filteredParents =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeValue(
            searchTerm
          );


        const filteredList =
          parents.filter(
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

                  parent.motherName,

                  parent.guardianName,

                  parent.mobileNumber,

                  parent.alternateMobileNumber,

                  parent.email,

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
                !normalizedSearchTerm ||
                searchableValues.includes(
                  normalizedSearchTerm
                );


              const matchesGuardian =
                guardianFilter === "All" ||
                guardianRelationship ===
                  guardianFilter;


              const matchesStatus =
                statusFilter === "All" ||
                parentStatus ===
                  statusFilter;


              const matchesState =
                stateFilter === "All" ||
                parent.state ===
                  stateFilter;


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


              return (

                matchesSearch &&

                matchesGuardian &&

                matchesStatus &&

                matchesState &&

                matchesMapping

              );

            }
          );


        return [
          ...filteredList
        ].sort(
          (
            firstParent,
            secondParent
          ) => {

            if (
              sortOption === "oldest"
            ) {

              return (

                (
                  getParentDate(
                    firstParent
                  )?.getTime() ||
                  0
                ) -

                (
                  getParentDate(
                    secondParent
                  )?.getTime() ||
                  0
                )

              );

            }


            if (
              sortOption === "guardian-ascending"
            ) {

              return getPrimaryGuardianName(
                firstParent
              ).localeCompare(
                getPrimaryGuardianName(
                  secondParent
                )
              );

            }


            if (
              sortOption === "guardian-descending"
            ) {

              return getPrimaryGuardianName(
                secondParent
              ).localeCompare(
                getPrimaryGuardianName(
                  firstParent
                )
              );

            }


            if (
              sortOption === "students-high"
            ) {

              return (

                getStudentCount(
                  secondParent
                ) -

                getStudentCount(
                  firstParent
                )

              );

            }


            return (

              (
                getParentDate(
                  secondParent
                )?.getTime() ||
                0
              ) -

              (
                getParentDate(
                  firstParent
                )?.getTime() ||
                0
              )

            );

          }
        );

      },
      [
        parents,
        searchTerm,
        guardianFilter,
        statusFilter,
        stateFilter,
        mappingFilter,
        sortOption
      ]
    );
      // ============================================================
  // PARENT STATISTICS
  // ============================================================

  const parentStatistics =
    useMemo(
      () => {

        const total =
          parents.length;


        const active =
          parents.filter(
            (
              parent
            ) =>
              getParentStatus(
                parent
              ) === "Active"
          ).length;


        const inactive =
          parents.filter(
            (
              parent
            ) =>
              getParentStatus(
                parent
              ) === "Inactive"
          ).length;


        const mapped =
          parents.filter(
            (
              parent
            ) =>
              getStudentCount(
                parent
              ) > 0
          ).length;


        const notMapped =
          parents.filter(
            (
              parent
            ) =>
              getStudentCount(
                parent
              ) === 0
          ).length;


        const accountsCreated =
          parents.filter(
            (
              parent
            ) =>
              parent.accountCreated ===
              true
          ).length;


        return {

          total,

          active,

          inactive,

          mapped,

          notMapped,

          accountsCreated

        };

      },
      [
        parents
      ]
    );


  // ============================================================
  // REFRESH PARENT LIST
  // ============================================================

  const refreshParents =
    async () => {

      setSuccessMessage("");

      await fetchParents(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setGuardianFilter(
        "All"
      );

      setStatusFilter(
        "All"
      );

      setStateFilter(
        "All"
      );

      setMappingFilter(
        "All"
      );

      setSortOption(
        "newest"
      );


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        100
      );

    };


  // ============================================================
  // REQUEST DELETE PARENT
  // ============================================================

  const requestDeleteParent =
    (
      parent
    ) => {

      setParentToDelete(
        parent
      );

      setErrorMessage("");

      setSuccessMessage("");

      setShowDeleteConfirmation(
        true
      );

    };


  // ============================================================
  // CANCEL DELETE PARENT
  // ============================================================

  const cancelDeleteParent =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setParentToDelete(
        null
      );

      setShowDeleteConfirmation(
        false
      );

    };


  // ============================================================
  // CONFIRM DELETE PARENT
  // ============================================================

  const confirmDeleteParent =
    async () => {

      if (
        isDeleting ||
        !parentToDelete
      ) {

        return;

      }


      setIsDeleting(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await deleteDoc(
          doc(
            db,
            "parents",
            parentToDelete.id
          )
        );


        if (
          isMountedRef.current
        ) {

          setParents(
            (
              previousParents
            ) =>
              previousParents.filter(
                (
                  parent
                ) =>
                  parent.id !==
                  parentToDelete.id
              )
          );


          setSuccessMessage(
            `Parent ${
              parentToDelete.parentId ||
              getPrimaryGuardianName(
                parentToDelete
              )
            } deleted successfully.`
          );


          setParentToDelete(
            null
          );


          setShowDeleteConfirmation(
            false
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
          "Error deleting parent:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to delete the parent record. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDeleting(
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
              👨‍👩‍👧 Parent List
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View and manage all registered parents and guardians.
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
                    fontSize: "50px",
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
                  Please wait while parent information is being loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            PARENT LIST CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  STATISTICS DASHBOARD
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                {
                  [

                    [
                      "👨‍👩‍👧",
                      "Total Parents",
                      parentStatistics.total,
                      "#475569"
                    ],

                    [
                      "✅",
                      "Active",
                      parentStatistics.active,
                      "#15803d"
                    ],

                    [
                      "⚪",
                      "Inactive",
                      parentStatistics.inactive,
                      "#64748b"
                    ],

                    [
                      "👨‍🎓",
                      "Mapped",
                      parentStatistics.mapped,
                      "#2563eb"
                    ],

                    [
                      "🔗",
                      "Not Mapped",
                      parentStatistics.notMapped,
                      "#b45309"
                    ],

                    [
                      "🔐",
                      "Accounts",
                      parentStatistics.accountsCreated,
                      "#7c3aed"
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
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                      🔍 Search & Filter Parents
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search parent records and narrow the results using filters.
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
                        ✖ Reset Filters
                      </button>

                    )
                  }

                </div>


                <input
                  ref={
                    searchInputRef
                  }
                  type="text"
                  placeholder="Search Parent ID, Guardian Name, Mobile, Email, Location..."
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


                <br />
                <br />


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


                  <div>

                    <label>
                      State
                    </label>


                    <select
                      value={
                        stateFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setStateFilter(
                            event.target.value
                          )
                      }
                    >

                      <option value="All">
                        All States
                      </option>

                      {
                        availableStates.map(
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
                      Sort Parents
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

                      <option value="newest">
                        Newest First
                      </option>

                      <option value="oldest">
                        Oldest First
                      </option>

                      <option value="guardian-ascending">
                        Guardian A → Z
                      </option>

                      <option value="guardian-descending">
                        Guardian Z → A
                      </option>

                      <option value="students-high">
                        Most Students
                      </option>

                    </select>

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  RESULT COUNT
              ================================================== */}

              {
                parents.length > 0 && (

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

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Showing
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

                )
              }


              {/* ==================================================
                  EMPTY DATABASE STATE
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
                          fontSize: "55px",
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
                        Start by registering the first parent or guardian.
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
                  NO FILTER RESULTS
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
                          fontSize: "52px",
                          marginBottom: "16px"
                        }}
                      >
                        🔍
                      </div>


                      <h2>
                        No Matching Parents
                      </h2>


                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        No parent records match the current search and filters.
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
                  PARENT CARDS
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
                              PARENT CARD HEADER
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
                                STATUS BADGES
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
                                👨 FATHER
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
                                👩 MOTHER
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
                              CONTACT AND LOCATION INFORMATION
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
                                📞 CONTACT INFORMATION
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
                                  margin: 0
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
                                  margin: "0 0 7px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "700"
                                }}
                              >
                                🪪 RECORD INFORMATION
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
                                  margin: 0
                                }}
                              >
                                <strong>
                                  Registered:
                                </strong>
                                {" "}
                                {
                                  formatDate(
                                    parent
                                  )
                                }
                              </p>

                            </div>

                          </div>


                          {/* ========================================
                              PARENT ACTIONS
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
                              👁 View
                            </Link>


                            <Link
                              to={
                                `/edit-parent/${parent.id}`
                              }
                              className="action-btn edit-btn"
                            >
                              ✏ Edit
                            </Link>


                            <Link
                              to="/student-mapping"
                              className="action-btn"
                            >
                              👨‍🎓 Map Student
                            </Link>


                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={
                                () =>
                                  requestDeleteParent(
                                    parent
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

                      );

                    }
                  )

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
          parentToDelete && (

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
                  maxWidth: "620px",
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
                      fontSize: "56px",
                      marginBottom: "10px"
                    }}
                  >
                    🗑
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    Delete Parent Record?
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.7"
                    }}
                  >
                    Review the parent information before permanently deleting this record.
                  </p>

                </div>


                {/* ================================================
                    PARENT INFORMATION
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

                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    PARENT RECORD
                  </p>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    👨‍👩‍👧
                    {" "}
                    {
                      getPrimaryGuardianName(
                        parentToDelete
                      )
                    }
                  </h2>


                  <p
                    style={{
                      margin: "0 0 5px"
                    }}
                  >
                    <strong>
                      Parent ID:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        parentToDelete.parentId,
                        "Legacy Parent Record"
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px"
                    }}
                  >
                    <strong>
                      Relationship:
                    </strong>
                    {" "}
                    {
                      getGuardianRelationship(
                        parentToDelete
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
                      displayValue(
                        parentToDelete.mobileNumber
                      )
                    }
                  </p>

                </div>


                {/* ================================================
                    LINKED STUDENT WARNING
                ================================================ */}

                {
                  getStudentCount(
                    parentToDelete
                  ) > 0 && (

                    <div
                      style={{
                        padding: "14px 16px",
                        marginBottom: "16px",
                        borderRadius: "10px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        color: "#9a3412",
                        lineHeight: "1.7"
                      }}
                    >
                      ⚠️
                      {" "}
                      <strong>
                        Linked Students Detected:
                      </strong>
                      {" "}
                      This parent record is currently linked to
                      {" "}
                      <strong>
                        {
                          getStudentCount(
                            parentToDelete
                          )
                        }
                      </strong>
                      {" "}
                      student(s). Deleting the parent may leave student mapping records without a valid parent.
                    </div>

                  )
                }


                {/* ================================================
                    PARENT ACCOUNT WARNING
                ================================================ */}

                {
                  parentToDelete.accountCreated ===
                    true && (

                    <div
                      style={{
                        padding: "14px 16px",
                        marginBottom: "16px",
                        borderRadius: "10px",
                        background: "#faf5ff",
                        border: "1px solid #e9d5ff",
                        color: "#6b21a8",
                        lineHeight: "1.7"
                      }}
                    >
                      🔐
                      {" "}
                      <strong>
                        Parent Account Exists:
                      </strong>
                      {" "}
                      This parent has a login account. Deleting this parent document does not automatically delete the related Firebase Authentication account.
                    </div>

                  )
                }


                {/* ================================================
                    PERMANENT DELETE WARNING
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "22px",
                    borderRadius: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    lineHeight: "1.7"
                  }}
                >
                  🚨
                  {" "}
                  <strong>
                    Permanent Action:
                  </strong>
                  {" "}
                  This parent document will be permanently removed from the
                  {" "}
                  <strong>
                    parents
                  </strong>
                  {" "}
                  Firebase collection. This action cannot be undone.
                </div>


                {/* ================================================
                    DELETE ACTIONS
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
                      cancelDeleteParent
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    ← Cancel
                  </button>


                  <button
                    type="button"
                    className="action-btn delete-btn"
                    onClick={
                      confirmDeleteParent
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      minWidth: "210px"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting Parent..."
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

export default ParentList;