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

import {
  getMadrasaDocuments
} from "../../services/madrasaService";

function SearchStudent() {

  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    students,
    setStudents
  ] = useState([]);


  // ============================================================
  // SEARCH STATE
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


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
    errorMessage,
    setErrorMessage
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

      if (
        showRefreshLoader
      ) {

        setIsRefreshing(
          true
        );

      }
      else {

        setIsLoading(
          true
        );

      }


      setErrorMessage("");


      try {

        const studentList =
  await getMadrasaDocuments(
    "students"
  );


        studentList.sort(
          (
            firstStudent,
            secondStudent
          ) =>

            String(
              firstStudent.studentName ||
              ""
            ).localeCompare(
              String(
                secondStudent.studentName ||
                ""
              )
            )
        );


        setStudents(
          studentList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading students:",
          error
        );


        setErrorMessage(
          "Unable to load student records. Please try again."
        );

      }
      finally {

        setIsLoading(
          false
        );

        setIsRefreshing(
          false
        );

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
  // FILTER STUDENTS
  // ============================================================

  const filteredStudents =
    useMemo(
      () => {

        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();


        if (
          !normalizedSearch
        ) {

          return [];

        }


        return students.filter(
          (
            student
          ) => {

            const searchableValues =
              [

                student.studentName,

                student.studentId,

                student.admissionNumber,

                student.fatherName,

                student.motherName,

                student.mobileNumber,

                student.studentClass,

                student.aadhaarNumber

              ];


            return searchableValues.some(
              (
                value
              ) =>

                String(
                  value ||
                  ""
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )

            );

          }
        );

      },
      [
        students,
        searchTerm
      ]
    );


  // ============================================================
  // SEARCH STATISTICS
  // ============================================================

  const searchStatistics =
    useMemo(
      () => {

        const activeResults =
          filteredStudents.filter(
            (
              student
            ) =>

              (
                student.status ||
                "Active"
              ) ===
              "Active"

          ).length;


        const totalPendingFees =
          filteredStudents.reduce(
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


        return {

          results:
            filteredStudents.length,

          activeResults,

          totalPendingFees

        };

      },
      [
        filteredStudents
      ]
    );


  // ============================================================
  // REFRESH STUDENTS
  // ============================================================

  const refreshStudents =
    async () => {

      await fetchStudents(
        true
      );

    };


  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const clearSearch =
    () => {

      setSearchTerm("");

    };


  // ============================================================
  // SEARCH STATUS
  // ============================================================

  const hasSearch =
    Boolean(
      searchTerm.trim()
    );
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
              🔍 Search Student
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Quickly find students using their name, ID, admission number, parent details, mobile number, Aadhaar, or class.
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
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div
                  style={{
                    marginBottom: "20px"
                  }}
                >

                  <h2 style={{ margin: "0 0 6px" }}>
                    🔎 Find Student
                  </h2>

                  <p style={{ margin: 0, color: "#64748b" }}>
                    Enter any available student information to search.
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

                  <input
                    type="text"
                    placeholder="Search name, Student ID, admission number, mobile, parent, Aadhaar, class..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    autoFocus
                    style={{
                      flex: "1",
                      minWidth: "250px"
                    }}
                  />


                  {
                    hasSearch && (

                      <button
                        type="button"
                        onClick={clearSearch}
                      >
                        ✖ Clear
                      </button>

                    )
                  }

                </div>


                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  💡 You can search using Student Name, Student ID, Admission Number, Father Name, Mother Name, Mobile Number, Aadhaar Number, or Class.
                </div>

              </div>


              {
                hasSearch && (

                  <div
                    className="attendance-summary"
                    style={{
                      marginBottom: "24px"
                    }}
                  >

                    <div className="summary-card">

                      <h2>
                        {searchStatistics.results}
                      </h2>

                      <p>
                        🔍 Results Found
                      </p>

                    </div>


                    <div className="summary-card">

                      <h2>
                        {searchStatistics.activeResults}
                      </h2>

                      <p>
                        ✅ Active Students
                      </p>

                    </div>


                    <div className="summary-card">

                      <h2>
                        {
                          formatCurrency(
                            searchStatistics.totalPendingFees
                          )
                        }
                      </h2>

                      <p>
                        💰 Pending Fees
                      </p>

                    </div>

                  </div>

                )
              }


              {
                !hasSearch && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "60px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "60px",
                          marginBottom: "16px"
                        }}
                      >
                        🔍
                      </div>

                      <h2>
                        Search for a Student
                      </h2>

                      <p
                        style={{
                          maxWidth: "550px",
                          margin: "0 auto",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Start typing in the search box above to quickly find a registered student.
                      </p>

                    </div>

                  </div>

                )
              }


              {
                hasSearch &&
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
                          fontSize: "60px",
                          marginBottom: "16px"
                        }}
                      >
                        😕
                      </div>

                      <h2>
                        No Student Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No student matches your search for "{searchTerm}".
                      </p>


                      <button
                        type="button"
                        onClick={clearSearch}
                      >
                        ✖ Clear Search
                      </button>

                    </div>

                  </div>

                )
              }


              {
                hasSearch &&
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
                                      flexWrap: "wrap",
                                      marginBottom: "10px"
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
                                    📄 Admission Number:{" "}
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
                                    👩 Mother:{" "}
                                    {
                                      student.motherName ||
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
                  to="/student-list"
                  className="action-btn view-btn"
                >
                  📋 Student List
                </Link>


                <Link
                  to="/add-student"
                  className="action-btn view-btn"
                >
                  ➕ Add Student
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

export default SearchStudent;