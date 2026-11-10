import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function StudentList() {

  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    students,
    setStudents
  ] = useState([]);


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    classFilter,
    setClassFilter
  ] = useState("All");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState("newest");


  // ============================================================
  // PROCESS STATES
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
    deletingId,
    setDeletingId
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
  // NUMBER HELPER
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
          style:
            "currency",

          currency:
            "INR",

          maximumFractionDigits:
            0
        }
      ).format(
        getNumber(
          value
        )
      );

    };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "Not Available";

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

        return dateValue;

      }


      return convertedDate.toLocaleDateString(
        "en-IN",
        {
          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric"
        }
      );

    };


  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  const fetchStudents =
  async (
    showRefreshLoader = false
  ) => {

    if (showRefreshLoader) {
      setIsRefreshing(true);
    }
    else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {

      const madrasaId =
        localStorage.getItem(
          "madrasaId"
        );

      if (!madrasaId) {

        setStudents([]);

        setErrorMessage(
          "Madrasa account not found. Please login again."
        );

        return;
      }

      const studentsQuery =
        query(
          collection(
            db,
            "students"
          ),
          where(
            "madrasaId",
            "==",
            madrasaId
          )
        );

      const studentSnapshot =
        await getDocs(
          studentsQuery
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

      setStudents(
        studentList
      );

    }
    catch (error) {

      console.error(
        "Error loading students:",
        error
      );

      setErrorMessage(
        "Unable to load students. Please try again."
      );

    }
    finally {

      setIsLoading(false);

      setIsRefreshing(false);

    }

  };


  // ============================================================
  // LOAD STUDENTS
  // ============================================================

  useEffect(
    () => {

      fetchStudents();

    },
    []
  );


  // ============================================================
  // CLASS OPTIONS
  // ============================================================

  const classOptions =
    useMemo(
      () => {

        return [

          ...new Set(

            students

              .map(
                (
                  student
                ) =>

                  student.studentClass

              )

              .filter(
                Boolean
              )

          )

        ].sort(
          (
            firstClass,
            secondClass
          ) =>

            firstClass.localeCompare(
              secondClass
            )

        );

      },
      [
        students
      ]
    );


  // ============================================================
  // FILTER AND SORT STUDENTS
  // ============================================================

  const filteredStudents =
    useMemo(
      () => {

        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();


        const matchingStudents =
          students.filter(
            (
              student
            ) => {

              const searchableText =
                [

                  student.studentName,

                  student.studentId,

                  student.admissionNumber,

                  student.fatherName,

                  student.motherName,

                  student.mobileNumber,

                  student.studentClass,

                  student.aadhaarNumber

                ]
                  .map(
                    (
                      value
                    ) =>

                      String(
                        value ||
                        ""
                      ).toLowerCase()

                  )
                  .join(" ");


              const matchesSearch =

                !normalizedSearch ||

                searchableText.includes(
                  normalizedSearch
                );


              const matchesClass =

                classFilter === "All" ||

                student.studentClass ===
                classFilter;


              const matchesStatus =

                statusFilter === "All" ||

                (
                  student.status ||
                  "Active"
                ) ===
                statusFilter;


              return (

                matchesSearch &&

                matchesClass &&

                matchesStatus

              );

            }
          );


        return [
          ...matchingStudents
        ].sort(
          (
            firstStudent,
            secondStudent
          ) => {

            if (
              sortOption === "name"
            ) {

              return String(
                firstStudent.studentName ||
                ""
              ).localeCompare(
                String(
                  secondStudent.studentName ||
                  ""
                )
              );

            }


            if (
              sortOption === "class"
            ) {

              return String(
                firstStudent.studentClass ||
                ""
              ).localeCompare(
                String(
                  secondStudent.studentClass ||
                  ""
                )
              );

            }


            if (
              sortOption === "attendance"
            ) {

              return (

                getNumber(
                  secondStudent.attendancePercentage
                ) -

                getNumber(
                  firstStudent.attendancePercentage
                )

              );

            }


            if (
              sortOption === "pending-fees"
            ) {

              return (

                getNumber(
                  secondStudent.pendingFees
                ) -

                getNumber(
                  firstStudent.pendingFees
                )

              );

            }


            return String(
              secondStudent.joiningDate ||
              secondStudent.studentId ||
              ""
            ).localeCompare(
              String(
                firstStudent.joiningDate ||
                firstStudent.studentId ||
                ""
              )
            );

          }
        );

      },
      [
        students,
        searchTerm,
        classFilter,
        statusFilter,
        sortOption
      ]
    );


  // ============================================================
  // STUDENT STATISTICS
  // ============================================================

  const studentStatistics =
    useMemo(
      () => {

        const activeStudents =
          students.filter(
            (
              student
            ) =>

              (
                student.status ||
                "Active"
              ) ===
              "Active"

          ).length;


        const inactiveStudents =
          students.length -
          activeStudents;


        const totalPendingFees =
          students.reduce(
            (
              total,
              student
            ) =>

              total +

              getNumber(
                student.pendingFees
              ),

            0
          );


        const totalAttendance =
          students.reduce(
            (
              total,
              student
            ) =>

              total +

              getNumber(
                student.attendancePercentage
              ),

            0
          );


        const averageAttendance =

          students.length > 0

            ?

            totalAttendance /
            students.length

            :

            0;


        return {

          totalStudents:
            students.length,

          activeStudents,

          inactiveStudents,

          totalPendingFees,

          averageAttendance

        };

      },
      [
        students
      ]
    );


  // ============================================================
  // DELETE STUDENT
  // ============================================================

  const deleteStudent =
  async (
    student
  ) => {

    const studentName =
      student.studentName ||
      "this student";


    const confirmDelete =
      window.confirm(
        `Are you sure you want to permanently delete "${studentName}"?`
      );


    if (!confirmDelete) {

      return;

    }


    setDeletingId(
      student.id
    );

    setErrorMessage("");

    setSuccessMessage("");


    try {

      const madrasaId =
        localStorage.getItem(
          "madrasaId"
        );


      if (!madrasaId) {

        setErrorMessage(
          "Madrasa account not found. Please login again."
        );

        return;

      }


      const studentBelongsToMadrasa =
        students.some(
          (
            currentStudent
          ) =>

            currentStudent.id ===
              student.id &&

            currentStudent.madrasaId ===
              madrasaId

        );


      if (!studentBelongsToMadrasa) {

        setErrorMessage(
          "You do not have permission to delete this student."
        );

        return;

      }


      await deleteDoc(
        doc(
          db,
          "students",
          student.id
        )
      );


      setStudents(
        (
          currentStudents
        ) =>

          currentStudents.filter(
            (
              currentStudent
            ) =>

              currentStudent.id !==
              student.id

          )
      );


      setSuccessMessage(
        `${studentName} was deleted successfully.`
      );

    }
    catch (error) {

      console.error(
        "Error deleting student:",
        error
      );


      setErrorMessage(
        "Unable to delete the student. Please try again."
      );

    }
    finally {

      setDeletingId("");

    }

  };


  // ============================================================
  // REFRESH STUDENTS
  // ============================================================

  const refreshStudents =
    async () => {

      setSuccessMessage("");

      await fetchStudents(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setClassFilter("All");

      setStatusFilter("All");

      setSortOption("newest");

    };


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    classFilter !== "All" ||

    statusFilter !== "All" ||

    sortOption !== "newest";
      return (

    <Layout>

      <div className="accounts-page">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >

          <div>

            <h1 style={{ margin: "0 0 6px" }}>
              📋 Student List
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Search, filter, view, edit, and manage registered students.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <Link
              to="/add-student"
              className="action-btn view-btn"
            >
              ➕ Add Student
            </Link>


            <button
              type="button"
              onClick={refreshStudents}
              disabled={isRefreshing}
            >
              {
                isRefreshing
                  ? "⏳ Refreshing..."
                  : "🔄 Refresh"
              }
            </button>

          </div>

        </div>


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


        {
          isLoading ? (

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
                  Loading Students...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while student records are loaded.
                </p>

              </div>

            </div>

          ) : (

            <>

              <div
                className="attendance-summary"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div className="summary-card">

                  <h2>
                    {studentStatistics.totalStudents}
                  </h2>

                  <p>
                    👨‍🎓 Total Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {studentStatistics.activeStudents}
                  </h2>

                  <p>
                    ✅ Active Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {studentStatistics.inactiveStudents}
                  </h2>

                  <p>
                    ⛔ Inactive Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      studentStatistics.averageAttendance
                        .toFixed(1)
                    }%
                  </h2>

                  <p>
                    📊 Average Attendance
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        studentStatistics.totalPendingFees
                      )
                    }
                  </h2>

                  <p>
                    💰 Pending Fees
                  </p>

                </div>

              </div>


              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}
                >

                  <div>

                    <h2 style={{ margin: "0 0 6px" }}>
                      🔍 Search & Filter Students
                    </h2>

                    <p style={{ margin: 0, color: "#64748b" }}>
                      Find students using their name, ID, admission number, parent name, mobile number, or class.
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

                  <div>

                    <label>
                      Search Student
                    </label>

                    <input
                      type="text"
                      placeholder="Name, ID, mobile, parent..."
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
                      Class
                    </label>

                    <select
                      value={classFilter}
                      onChange={(event) =>
                        setClassFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Classes
                      </option>

                      {
                        classOptions.map(
                          (
                            className
                          ) => (

                            <option
                              key={className}
                              value={className}
                            >
                              {className}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Status
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
                        All Status
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
                      Sort Students
                    </label>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target.value
                        )
                      }
                    >

                      <option value="newest">
                        Newest First
                      </option>

                      <option value="name">
                        Student Name
                      </option>

                      <option value="class">
                        Class
                      </option>

                      <option value="attendance">
                        Highest Attendance
                      </option>

                      <option value="pending-fees">
                        Highest Pending Fees
                      </option>

                    </select>

                  </div>

                </div>


                <div
                  style={{
                    marginTop: "18px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b"
                  }}
                >
                  Showing{" "}
                  <strong>
                    {filteredStudents.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {students.length}
                  </strong>{" "}
                  students.
                </div>

              </div>


              {
                students.length === 0 && (

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
                        👨‍🎓
                      </div>

                      <h2>
                        No Students Registered
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Student records will appear here after registration.
                      </p>


                      <Link
                        to="/add-student"
                        className="action-btn view-btn"
                      >
                        ➕ Register First Student
                      </Link>

                    </div>

                  </div>

                )
              }


              {
                students.length > 0 &&
                filteredStudents.length === 0 && (

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
                        🔍
                      </div>

                      <h2>
                        No Matching Students
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No students match your current search and filters.
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


              {
                filteredStudents.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gap: "18px"
                    }}
                  >

                    {
                      filteredStudents.map(
                        (
                          student
                        ) => (

                          <div
                            className="student-card"
                            key={student.id}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "20px",
                                flexWrap: "wrap"
                              }}
                            >

                              <div
                                className="student-header"
                                style={{
                                  flex: "1",
                                  minWidth: "260px"
                                }}
                              >

                                <div className="student-avatar">

                                  {
                                    student.profilePhoto ? (

                                      <img
                                        src={student.profilePhoto}
                                        alt={student.studentName}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          borderRadius: "50%"
                                        }}
                                      />

                                    ) : (

                                      "👨‍🎓"

                                    )
                                  }

                                </div>


                                <div style={{ flex: "1" }}>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      flexWrap: "wrap"
                                    }}
                                  >

                                    <h2
                                      className="student-name"
                                      style={{
                                        margin: 0
                                      }}
                                    >
                                      {
                                        student.studentName ||
                                        "Unnamed Student"
                                      }
                                    </h2>


                                    <span
                                      style={{
                                        padding: "4px 9px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        background:
                                          (
                                            student.status ||
                                            "Active"
                                          ) === "Active"
                                            ? "#dcfce7"
                                            : "#fee2e2",
                                        color:
                                          (
                                            student.status ||
                                            "Active"
                                          ) === "Active"
                                            ? "#15803d"
                                            : "#b91c1c"
                                      }}
                                    >
                                      {
                                        student.status ||
                                        "Active"
                                      }
                                    </span>

                                  </div>


                                  <p>
                                    🆔 Student ID:{" "}
                                    <strong>
                                      {
                                        student.studentId ||
                                        "Not Available"
                                      }
                                    </strong>
                                  </p>


                                  <p>
                                    📄 Admission No:{" "}
                                    <strong>
                                      {
                                        student.admissionNumber ||
                                        "Not Available"
                                      }
                                    </strong>
                                  </p>


                                  <p>
                                    👨 Father:{" "}
                                    {
                                      student.fatherName ||
                                      "Not Available"
                                    }
                                  </p>


                                  <p>
                                    📚 Class:{" "}
                                    {
                                      student.studentClass ||
                                      "Not Assigned"
                                    }
                                  </p>


                                  <p>
                                    📞 Mobile:{" "}
                                    {
                                      student.mobileNumber ||
                                      "Not Available"
                                    }
                                  </p>


                                  <p>
                                    📅 Joining Date:{" "}
                                    {
                                      formatDate(
                                        student.joiningDate
                                      )
                                    }
                                  </p>

                                </div>

                              </div>


                              <div
                                style={{
                                  minWidth: "240px",
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(2, minmax(100px, 1fr))",
                                  gap: "10px"
                                }}
                              >

                                <div
                                  style={{
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    textAlign: "center"
                                  }}
                                >

                                  <strong>
                                    {
                                      getNumber(
                                        student.attendancePercentage
                                      ).toFixed(1)
                                    }%
                                  </strong>

                                  <p
                                    style={{
                                      margin: "5px 0 0",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Attendance
                                  </p>

                                </div>


                                <div
                                  style={{
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    textAlign: "center"
                                  }}
                                >

                                  <strong>
                                    {
                                      formatCurrency(
                                        student.pendingFees
                                      )
                                    }
                                  </strong>

                                  <p
                                    style={{
                                      margin: "5px 0 0",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Pending Fees
                                  </p>

                                </div>


                                <div
                                  style={{
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    textAlign: "center"
                                  }}
                                >

                                  <strong>
                                    {
                                      getNumber(
                                        student.totalPresent
                                      )
                                    }
                                  </strong>

                                  <p
                                    style={{
                                      margin: "5px 0 0",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Present
                                  </p>

                                </div>


                                <div
                                  style={{
                                    padding: "12px",
                                    borderRadius: "10px",
                                    background: "#f8fafc",
                                    textAlign: "center"
                                  }}
                                >

                                  <strong>
                                    {
                                      getNumber(
                                        student.totalAbsent
                                      )
                                    }
                                  </strong>

                                  <p
                                    style={{
                                      margin: "5px 0 0",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    Absent
                                  </p>

                                </div>

                              </div>

                            </div>


                            <div
                              className="student-actions"
                              style={{
                                marginTop: "20px"
                              }}
                            >

                              <Link
                                to={`/student-profile/${student.id}`}
                                className="action-btn view-btn"
                              >
                                👁 View Profile
                              </Link>


                              <Link
                                to={`/edit-student/${student.id}`}
                                className="action-btn edit-btn"
                              >
                                ✏ Edit Student
                              </Link>


                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() =>
                                  deleteStudent(
                                    student
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  student.id
                                }
                              >
                                {
                                  deletingId ===
                                  student.id
                                    ? "⏳ Deleting..."
                                    : "🗑 Delete"
                                }
                              </button>

                            </div>

                          </div>

                        )
                      )
                    }

                  </div>

                )
              }


              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "24px"
                }}
              >

                <Link
                  to="/students"
                  className="action-btn view-btn"
                >
                  👨‍🎓 Students Module
                </Link>


                <Link
                  to="/add-student"
                  className="action-btn view-btn"
                >
                  ➕ Add Student
                </Link>


                <Link
                  to="/search-student"
                  className="action-btn view-btn"
                >
                  🔍 Search Student
                </Link>

              </div>

            </>

          )
        }


        <div style={{ height: "50px" }} />

      </div>

    </Layout>

  );

}

export default StudentList;