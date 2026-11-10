import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch
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

function StudentMapping() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATES
  // ============================================================

  const [
    parents,
    setParents
  ] = useState([]);


  const [
    students,
    setStudents
  ] = useState([]);


  // ============================================================
  // MAPPING FORM STATES
  // ============================================================

  const [
    selectedParentId,
    setSelectedParentId
  ] = useState("");


  const [
    selectedStudentId,
    setSelectedStudentId
  ] = useState("");


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    mappingFilter,
    setMappingFilter
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
    isMapping,
    setIsMapping
  ] = useState(false);


  const [
    removingStudentId,
    setRemovingStudentId
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
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
  // GET PARENT NAME
  // ============================================================

  const getParentName =
    (
      parent
    ) => {

      return (

        parent.primaryGuardianName ||

        parent.fatherName ||

        parent.motherName ||

        parent.guardianName ||

        "Unknown Parent"

      );

    };


  // ============================================================
  // GET STUDENT NAME
  // ============================================================

  const getStudentName =
    (
      student
    ) => {

      return (

        student.studentName ||

        student.fullName ||

        student.name ||

        "Unknown Student"

      );

    };


  // ============================================================
  // GET STUDENT CLASS
  // ============================================================

  const getStudentClass =
    (
      student
    ) => {

      return (

        student.className ||

        student.studentClass ||

        student.class ||

        student.course ||

        "Not Available"

      );

    };


  // ============================================================
  // GET STUDENT DISPLAY ID
  // ============================================================

  const getStudentDisplayId =
    (
      student
    ) => {

      return (

        student.studentId ||

        student.admissionNumber ||

        student.rollNumber ||

        student.id

      );

    };


  // ============================================================
  // GET LINKED STUDENT IDS
  // ============================================================

  const getLinkedStudentIds =
    (
      parent
    ) => {

      if (
        Array.isArray(
          parent?.linkedStudentIds
        )
      ) {

        return parent.linkedStudentIds;

      }


      return [];

    };


  // ============================================================
  // CHECK IF STUDENT IS MAPPED
  // ============================================================

  const isStudentMapped =
    (
      student
    ) => {

      if (
        student.parentDocumentId ||
        student.parentId
      ) {

        return true;

      }


      return parents.some(
        (
          parent
        ) =>
          getLinkedStudentIds(
            parent
          ).includes(
            student.id
          )
      );

    };


  // ============================================================
  // FETCH PARENTS AND STUDENTS
  // ============================================================

  const fetchMappingData =
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
          parentSnapshot,
          studentSnapshot
        ] =
          await Promise.all([

            getDocs(
              collection(
                db,
                "parents"
              )
            ),

            getDocs(
              collection(
                db,
                "students"
              )
            )

          ]);


        const parentList =
          parentSnapshot.docs.map(
            (
              parentDocument
            ) => ({

              id:
                parentDocument.id,

              ...parentDocument.data()

            })
          );


        const studentList =
          studentSnapshot.docs.map(
            (
              studentDocument
            ) => ({

              id:
                studentDocument.id,

              ...studentDocument.data()

            })
          );


        if (
          isMountedRef.current
        ) {

          setParents(
            parentList
          );

          setStudents(
            studentList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading mapping data:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load parents and students. Please check your connection and try again."
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
  // LOAD DATABASE DATA
  // ============================================================

  useEffect(
    () => {

      fetchMappingData();

    },
    []
  );


  // ============================================================
  // SELECTED PARENT
  // ============================================================

  const selectedParent =
    useMemo(
      () => {

        return parents.find(
          (
            parent
          ) =>
            parent.id ===
            selectedParentId
        ) || null;

      },
      [
        parents,
        selectedParentId
      ]
    );


  // ============================================================
  // SELECTED STUDENT
  // ============================================================

  const selectedStudent =
    useMemo(
      () => {

        return students.find(
          (
            student
          ) =>
            student.id ===
            selectedStudentId
        ) || null;

      },
      [
        students,
        selectedStudentId
      ]
    );


  // ============================================================
  // AVAILABLE STUDENTS
  // ============================================================

  const availableStudents =
    useMemo(
      () => {

        return students
          .filter(
            (
              student
            ) =>
              !isStudentMapped(
                student
              )
          )
          .sort(
            (
              firstStudent,
              secondStudent
            ) =>
              getStudentName(
                firstStudent
              ).localeCompare(
                getStudentName(
                  secondStudent
                )
              )
          );

      },
      [
        students,
        parents
      ]
    );


  // ============================================================
  // CREATE COMPLETE MAPPING LIST
  // ============================================================

  const mappings =
    useMemo(
      () => {

        const mappingList = [];


        parents.forEach(
          (
            parent
          ) => {

            const linkedStudentIds =
              getLinkedStudentIds(
                parent
              );


            linkedStudentIds.forEach(
              (
                studentDocumentId
              ) => {

                const student =
                  students.find(
                    (
                      currentStudent
                    ) =>
                      currentStudent.id ===
                      studentDocumentId
                  );


                if (
                  student
                ) {

                  mappingList.push({

                    parent,

                    student

                  });

                }

              }
            );

          }
        );


        return mappingList;

      },
      [
        parents,
        students
      ]
    );


  // ============================================================
  // FILTER MAPPINGS
  // ============================================================

  const filteredMappings =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return mappings.filter(
          (
            mapping
          ) => {

            const searchableValues =
              [

                mapping.parent.parentId,

                getParentName(
                  mapping.parent
                ),

                mapping.parent.mobileNumber,

                getStudentDisplayId(
                  mapping.student
                ),

                getStudentName(
                  mapping.student
                ),

                getStudentClass(
                  mapping.student
                )

              ]
                .map(
                  normalizeValue
                )
                .join(" ");


            return (

              !normalizedSearch ||

              searchableValues.includes(
                normalizedSearch
              )

            );

          }
        );

      },
      [
        mappings,
        searchTerm
      ]
    );


  // ============================================================
  // MAPPING STATISTICS
  // ============================================================

  const mappingStatistics =
    useMemo(
      () => {

        const mappedStudentIds =
          new Set(
            mappings.map(
              (
                mapping
              ) =>
                mapping.student.id
            )
          );


        const parentsWithStudents =
          parents.filter(
            (
              parent
            ) =>
              getLinkedStudentIds(
                parent
              ).length > 0
          ).length;


        return {

          totalParents:
            parents.length,

          totalStudents:
            students.length,

          mappedStudents:
            mappedStudentIds.size,

          unmappedStudents:
            students.length -
            mappedStudentIds.size,

          parentsWithStudents

        };

      },
      [
        parents,
        students,
        mappings
      ]
    );
      // ============================================================
  // CREATE STUDENT MAPPING
  // ============================================================

  const createMapping =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        isMapping
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");


      if (
        !selectedParent
      ) {

        setErrorMessage(
          "Please select a parent before creating the student mapping."
        );

        return;

      }


      if (
        !selectedStudent
      ) {

        setErrorMessage(
          "Please select a student before creating the mapping."
        );

        return;

      }


      if (
        isStudentMapped(
          selectedStudent
        )
      ) {

        setErrorMessage(
          "This student is already mapped to a parent."
        );

        return;

      }


      setIsMapping(true);


      try {

        const parentReference =
          doc(
            db,
            "parents",
            selectedParent.id
          );


        const studentReference =
          doc(
            db,
            "students",
            selectedStudent.id
          );


        const currentLinkedStudentIds =
          getLinkedStudentIds(
            selectedParent
          );


        const updatedLinkedStudentIds =
          [

            ...new Set([

              ...currentLinkedStudentIds,

              selectedStudent.id

            ])

          ];


        const batch =
          writeBatch(
            db
          );


        batch.update(
          parentReference,
          {

            linkedStudentIds:
              updatedLinkedStudentIds,

            studentCount:
              updatedLinkedStudentIds.length,

            updatedAt:
              serverTimestamp()

          }
        );


        batch.update(
          studentReference,
          {

            parentDocumentId:
              selectedParent.id,

            parentId:
              selectedParent.parentId ||
              "",

            parentName:
              getParentName(
                selectedParent
              ),

            parentMobileNumber:
              selectedParent.mobileNumber ||
              "",

            mappingStatus:
              "Mapped",

            mappedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        await batch.commit();


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            `${getStudentName(
              selectedStudent
            )} was successfully mapped to ${getParentName(
              selectedParent
            )}.`
          );


          setSelectedStudentId("");


          await fetchMappingData();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error creating student mapping:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to create the student mapping. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsMapping(false);

        }

      }

    };


  // ============================================================
  // REMOVE STUDENT MAPPING
  // ============================================================

  const removeMapping =
    async (
      parent,
      student
    ) => {

      if (
        removingStudentId
      ) {

        return;

      }


      const confirmRemoval =
        window.confirm(
          `Remove ${getStudentName(
            student
          )} from ${getParentName(
            parent
          )}?`
        );


      if (
        !confirmRemoval
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setRemovingStudentId(
        student.id
      );


      try {

        const parentReference =
          doc(
            db,
            "parents",
            parent.id
          );


        const studentReference =
          doc(
            db,
            "students",
            student.id
          );


        const currentLinkedStudentIds =
          getLinkedStudentIds(
            parent
          );


        const updatedLinkedStudentIds =
          currentLinkedStudentIds.filter(
            (
              studentDocumentId
            ) =>
              studentDocumentId !==
              student.id
          );


        const batch =
          writeBatch(
            db
          );


        batch.update(
          parentReference,
          {

            linkedStudentIds:
              updatedLinkedStudentIds,

            studentCount:
              updatedLinkedStudentIds.length,

            updatedAt:
              serverTimestamp()

          }
        );


        batch.update(
          studentReference,
          {

            parentDocumentId:
              "",

            parentId:
              "",

            parentName:
              "",

            parentMobileNumber:
              "",

            mappingStatus:
              "Not Mapped",

            unmappedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        await batch.commit();


        if (
          isMountedRef.current
        ) {

          setSuccessMessage(
            `${getStudentName(
              student
            )} was successfully removed from ${getParentName(
              parent
            )}.`
          );


          await fetchMappingData();

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error removing student mapping:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to remove the student mapping. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setRemovingStudentId("");

        }

      }

    };


  // ============================================================
  // REFRESH MAPPING DATA
  // ============================================================

  const refreshMappingData =
    async () => {

      setSuccessMessage("");

      await fetchMappingData(
        true
      );

    };


  // ============================================================
  // RESET MAPPING FORM
  // ============================================================

  const resetMappingForm =
    () => {

      if (
        isMapping
      ) {

        return;

      }


      setSelectedParentId("");

      setSelectedStudentId("");

      setErrorMessage("");

      setSuccessMessage("");

    };


  // ============================================================
  // RESET SEARCH AND FILTER
  // ============================================================

  const resetSearch =
    () => {

      setSearchTerm("");

      setMappingFilter("All");

    };


  // ============================================================
  // FILTERED STUDENTS FOR MAPPING FILTER
  // ============================================================

  const displayedMappings =
    useMemo(
      () => {

        if (
          mappingFilter === "Mapped"
        ) {

          return filteredMappings;

        }


        if (
          mappingFilter === "All"
        ) {

          return filteredMappings;

        }


        return [];

      },
      [
        filteredMappings,
        mappingFilter
      ]
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
              👨‍🎓 Student Mapping
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Connect registered students with their parents and guardians.
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
                refreshMappingData
              }
              disabled={
                isLoading ||
                isRefreshing ||
                isMapping
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
              👨‍👩‍👧 Parent List
            </Link>


            <Link
              to="/students"
              className="action-btn view-btn"
            >
              👨‍🎓 Students
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
                  Loading Mapping Data...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while parents and students are loaded from the database.
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
                  MAPPING STATISTICS
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
                    TOTAL PARENTS
                  </p>

                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    {mappingStatistics.totalParents}
                  </h2>

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
                    TOTAL STUDENTS
                  </p>

                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    {mappingStatistics.totalStudents}
                  </h2>

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
                    MAPPED STUDENTS
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#15803d"
                    }}
                  >
                    {mappingStatistics.mappedStudents}
                  </h2>

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
                    UNMAPPED STUDENTS
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#b45309"
                    }}
                  >
                    {mappingStatistics.unmappedStudents}
                  </h2>

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
                    PARENTS WITH STUDENTS
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#2563eb"
                    }}
                  >
                    {mappingStatistics.parentsWithStudents}
                  </h2>

                </div>

              </div>
                            {/* ==================================================
                  CREATE STUDENT MAPPING
              ================================================== */}

              <form
                onSubmit={createMapping}
              >

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
                      gap: "16px",
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
                        🔗 Create Student Mapping
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Select a registered parent and an available student to connect their records.
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={resetMappingForm}
                      disabled={isMapping}
                    >
                      🔄 Reset Selection
                    </button>

                  </div>


                  {/* ==============================================
                      DATABASE AVAILABILITY WARNING
                  ============================================== */}

                  {
                    parents.length === 0 && (

                      <div
                        style={{
                          padding: "14px 16px",
                          marginBottom: "18px",
                          borderRadius: "10px",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          color: "#9a3412",
                          lineHeight: "1.7"
                        }}
                      >
                        ⚠️ No parent records are available. Add a parent before creating a student mapping.
                      </div>

                    )
                  }


                  {
                    students.length === 0 && (

                      <div
                        style={{
                          padding: "14px 16px",
                          marginBottom: "18px",
                          borderRadius: "10px",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          color: "#9a3412",
                          lineHeight: "1.7"
                        }}
                      >
                        ⚠️ No student records are available. Add a student before creating a mapping.
                      </div>

                    )
                  }


                  {
                    students.length > 0 &&
                    availableStudents.length === 0 && (

                      <div
                        style={{
                          padding: "14px 16px",
                          marginBottom: "18px",
                          borderRadius: "10px",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1e40af",
                          lineHeight: "1.7"
                        }}
                      >
                        ℹ️ All registered students are currently mapped to parent records.
                      </div>

                    )
                  }


                  {/* ==============================================
                      PARENT AND STUDENT SELECTORS
                  ============================================== */}

                  <div className="form-grid">

                    <div>

                      <label>
                        Select Parent *
                      </label>


                      <select
                        value={selectedParentId}
                        onChange={(event) =>
                          setSelectedParentId(
                            event.target.value
                          )
                        }
                        disabled={
                          isMapping ||
                          parents.length === 0
                        }
                      >

                        <option value="">
                          Select Parent
                        </option>


                        {
                          parents.map((parent) => (

                            <option
                              key={parent.id}
                              value={parent.id}
                            >
                              {
                                `${getParentName(parent)} - ${
                                  parent.parentId ||
                                  parent.mobileNumber ||
                                  "Parent Record"
                                }`
                              }
                            </option>

                          ))
                        }

                      </select>

                    </div>


                    <div>

                      <label>
                        Select Student *
                      </label>


                      <select
                        value={selectedStudentId}
                        onChange={(event) =>
                          setSelectedStudentId(
                            event.target.value
                          )
                        }
                        disabled={
                          isMapping ||
                          availableStudents.length === 0
                        }
                      >

                        <option value="">
                          Select Available Student
                        </option>


                        {
                          availableStudents.map((student) => (

                            <option
                              key={student.id}
                              value={student.id}
                            >
                              {
                                `${getStudentName(student)} - ${
                                  getStudentDisplayId(student)
                                }`
                              }
                            </option>

                          ))
                        }

                      </select>

                    </div>

                  </div>


                  {/* ==============================================
                      SELECTED RECORD PREVIEW
                  ============================================== */}

                  {
                    (
                      selectedParent ||
                      selectedStudent
                    ) && (

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "14px",
                          marginTop: "20px"
                        }}
                      >

                        {/* ==========================================
                            SELECTED PARENT PREVIEW
                        ========================================== */}

                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: selectedParent
                              ? "#eff6ff"
                              : "#f8fafc",
                            border: selectedParent
                              ? "1px solid #bfdbfe"
                              : "1px solid #e2e8f0"
                          }}
                        >

                          <p
                            style={{
                              margin: "0 0 10px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            👨‍👩‍👧 SELECTED PARENT
                          </p>


                          {
                            selectedParent
                              ?
                              (
                                <>

                                  <h3
                                    style={{
                                      margin: "0 0 8px"
                                    }}
                                  >
                                    {getParentName(selectedParent)}
                                  </h3>


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
                                        selectedParent.parentId,
                                        "Legacy Record"
                                      )
                                    }
                                  </p>


                                  <p
                                    style={{
                                      margin: "0 0 5px"
                                    }}
                                  >
                                    <strong>
                                      Mobile:
                                    </strong>
                                    {" "}
                                    {
                                      displayValue(
                                        selectedParent.mobileNumber
                                      )
                                    }
                                  </p>


                                  <p
                                    style={{
                                      margin: 0
                                    }}
                                  >
                                    <strong>
                                      Linked Students:
                                    </strong>
                                    {" "}
                                    {
                                      getLinkedStudentIds(
                                        selectedParent
                                      ).length
                                    }
                                  </p>

                                </>
                              )
                              :
                              (
                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b"
                                  }}
                                >
                                  No parent selected.
                                </p>
                              )
                          }

                        </div>


                        {/* ==========================================
                            SELECTED STUDENT PREVIEW
                        ========================================== */}

                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: selectedStudent
                              ? "#f0fdf4"
                              : "#f8fafc",
                            border: selectedStudent
                              ? "1px solid #bbf7d0"
                              : "1px solid #e2e8f0"
                          }}
                        >

                          <p
                            style={{
                              margin: "0 0 10px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "700"
                            }}
                          >
                            👨‍🎓 SELECTED STUDENT
                          </p>


                          {
                            selectedStudent
                              ?
                              (
                                <>

                                  <h3
                                    style={{
                                      margin: "0 0 8px"
                                    }}
                                  >
                                    {getStudentName(selectedStudent)}
                                  </h3>


                                  <p
                                    style={{
                                      margin: "0 0 5px"
                                    }}
                                  >
                                    <strong>
                                      Student ID:
                                    </strong>
                                    {" "}
                                    {
                                      displayValue(
                                        getStudentDisplayId(
                                          selectedStudent
                                        )
                                      )
                                    }
                                  </p>


                                  <p
                                    style={{
                                      margin: "0 0 5px"
                                    }}
                                  >
                                    <strong>
                                      Class:
                                    </strong>
                                    {" "}
                                    {
                                      displayValue(
                                        getStudentClass(
                                          selectedStudent
                                        )
                                      )
                                    }
                                  </p>


                                  <p
                                    style={{
                                      margin: 0
                                    }}
                                  >
                                    <strong>
                                      Mapping Status:
                                    </strong>
                                    {" "}
                                    Not Mapped
                                  </p>

                                </>
                              )
                              :
                              (
                                <p
                                  style={{
                                    margin: 0,
                                    color: "#64748b"
                                  }}
                                >
                                  No student selected.
                                </p>
                              )
                          }

                        </div>

                      </div>

                    )
                  }


                  {/* ==============================================
                      MAPPING EXPLANATION
                  ============================================== */}

                  <div
                    style={{
                      padding: "14px 16px",
                      marginTop: "20px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#475569",
                      lineHeight: "1.7"
                    }}
                  >
                    💡 When you create the mapping, the student will be added to the parent record and the parent information will also be stored in the student record.
                  </div>


                  {/* ==============================================
                      MAPPING ACTIONS
                  ============================================== */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "20px"
                    }}
                  >

                    <button
                      type="button"
                      onClick={resetMappingForm}
                      disabled={isMapping}
                    >
                      ✖ Clear
                    </button>


                    <button
                      type="submit"
                      disabled={
                        isMapping ||
                        !selectedParent ||
                        !selectedStudent
                      }
                      style={{
                        minWidth: "190px"
                      }}
                    >
                      {
                        isMapping
                          ?
                          "⏳ Creating Mapping..."
                          :
                          "🔗 Map Student"
                      }
                    </button>

                  </div>

                </div>

              </form>


              {/* ==================================================
                  SEARCH EXISTING MAPPINGS
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
                      🔍 Search Student Mappings
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find existing mappings using parent or student information.
                    </p>

                  </div>


                  {
                    (
                      searchTerm ||
                      mappingFilter !== "All"
                    ) && (

                      <button
                        type="button"
                        onClick={resetSearch}
                      >
                        ✖ Clear Search
                      </button>

                    )
                  }

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Search Mapping
                    </label>

                    <input
                      type="text"
                      placeholder="Search parent, mobile, student, ID, or class..."
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Mapping Filter
                    </label>

                    <select
                      value={mappingFilter}
                      onChange={(event) =>
                        setMappingFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Mappings
                      </option>

                      <option value="Mapped">
                        Mapped Students
                      </option>

                    </select>

                  </div>

                </div>

              </div>
                            {/* ==================================================
                  EXISTING MAPPINGS HEADER
              ================================================== */}

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
                      margin: "0 0 6px"
                    }}
                  >
                    📋 Existing Student Mappings
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {displayedMappings.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {mappings.length}
                    </strong>
                    {" "}
                    mappings
                  </p>

                </div>

              </div>


              {/* ==================================================
                  NO MAPPINGS AVAILABLE
              ================================================== */}

              {
                mappings.length === 0 && (

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
                        🔗
                      </div>


                      <h2>
                        No Student Mappings Yet
                      </h2>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Select a parent and an available student above to create the first mapping.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO SEARCH RESULTS
              ================================================== */}

              {
                mappings.length > 0 &&
                displayedMappings.length === 0 && (

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
                        No Matching Mappings Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Try changing the search text or clearing the active filters.
                      </p>


                      <button
                        type="button"
                        onClick={resetSearch}
                      >
                        ✖ Clear Search
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  MAPPING RESULT CARDS
              ================================================== */}

              {
                displayedMappings.length > 0 && (

                  displayedMappings.map(
                    (
                      mapping
                    ) => {

                      const {
                        parent,
                        student
                      } = mapping;


                      return (

                        <div
                          className="student-card"
                          key={
                            `${parent.id}-${student.id}`
                          }
                          style={{
                            marginBottom: "18px"
                          }}
                        >

                          {/* ========================================
                              MAPPING CARD HEADER
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

                            <div>

                              <p
                                style={{
                                  margin: "0 0 6px",
                                  color: "#16a34a",
                                  fontSize: "12px",
                                  fontWeight: "800"
                                }}
                              >
                                🔗 ACTIVE STUDENT MAPPING
                              </p>


                              <h2
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                {getStudentName(student)}
                              </h2>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                Linked to
                                {" "}
                                <strong>
                                  {getParentName(parent)}
                                </strong>
                              </p>

                            </div>


                            <span
                              style={{
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background: "#dcfce7",
                                color: "#15803d",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              ✅ Mapped
                            </span>

                          </div>


                          {/* ========================================
                              PARENT AND STUDENT DETAILS
                          ======================================== */}

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(250px, 1fr))",
                              gap: "14px",
                              marginTop: "20px"
                            }}
                          >

                            {/* ======================================
                                PARENT DETAILS
                            ====================================== */}

                            <div
                              style={{
                                padding: "16px",
                                borderRadius: "10px",
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe"
                              }}
                            >

                              <p
                                style={{
                                  margin: "0 0 10px",
                                  color: "#1d4ed8",
                                  fontSize: "11px",
                                  fontWeight: "800"
                                }}
                              >
                                👨‍👩‍👧 PARENT INFORMATION
                              </p>


                              <h3
                                style={{
                                  margin: "0 0 10px"
                                }}
                              >
                                {getParentName(parent)}
                              </h3>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Parent ID:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.parentId,
                                    "Legacy Record"
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Relationship:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    parent.relationship ||
                                    parent.primaryGuardian
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Mobile:
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
                                  margin: 0
                                }}
                              >
                                <strong>
                                  Total Linked Students:
                                </strong>
                                {" "}
                                {
                                  getLinkedStudentIds(
                                    parent
                                  ).length
                                }
                              </p>

                            </div>


                            {/* ======================================
                                STUDENT DETAILS
                            ====================================== */}

                            <div
                              style={{
                                padding: "16px",
                                borderRadius: "10px",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0"
                              }}
                            >

                              <p
                                style={{
                                  margin: "0 0 10px",
                                  color: "#15803d",
                                  fontSize: "11px",
                                  fontWeight: "800"
                                }}
                              >
                                👨‍🎓 STUDENT INFORMATION
                              </p>


                              <h3
                                style={{
                                  margin: "0 0 10px"
                                }}
                              >
                                {getStudentName(student)}
                              </h3>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Student ID:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    getStudentDisplayId(
                                      student
                                    )
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Class:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    getStudentClass(
                                      student
                                    )
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                <strong>
                                  Mapping Status:
                                </strong>
                                {" "}
                                {
                                  displayValue(
                                    student.mappingStatus,
                                    "Mapped"
                                  )
                                }
                              </p>


                              <p
                                style={{
                                  margin: 0
                                }}
                              >
                                <strong>
                                  Parent:
                                </strong>
                                {" "}
                                {getParentName(parent)}
                              </p>

                            </div>

                          </div>


                          {/* ========================================
                              MAPPING ACTIONS
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
                              👁 View Parent
                            </Link>


                            <Link
                              to={
                                `/student-profile/${student.id}`
                              }
                              className="action-btn"
                            >
                              👨‍🎓 View Student
                            </Link>


                            <button
                              type="button"
                              className="action-btn delete-btn"
                              disabled={
                                Boolean(
                                  removingStudentId
                                )
                              }
                              onClick={
                                () =>
                                  removeMapping(
                                    parent,
                                    student
                                  )
                              }
                            >
                              {
                                removingStudentId === student.id
                                  ?
                                  "⏳ Removing..."
                                  :
                                  "🔗 Remove Mapping"
                              }
                            </button>

                          </div>

                        </div>

                      );

                    }
                  )

                )
              }


              {/* ==================================================
                  PAGE INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginTop: "20px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                🕌 Student mappings connect parent and student records across the Madrasa ERP system.
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

export default StudentMapping;