import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function StudentReport() {

  const [
    students,
    setStudents
  ] = useState([]);

  const [
    attendance,
    setAttendance
  ] = useState([]);

  const [
    fees,
    setFees
  ] = useState([]);

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
    startDate,
    setStartDate
  ] = useState("");

  const [
    endDate,
    setEndDate
  ] = useState("");

  const [
    sortOption,
    setSortOption
  ] = useState("newest");

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

  const getNumber = (value) => {

    const convertedValue =
      Number(value);

    return Number.isFinite(
      convertedValue
    )
      ? convertedValue
      : 0;

  };


  // ============================================================
  // DATE HELPERS
  // ============================================================

  const convertToDate = (dateValue) => {

    if (!dateValue) {
      return null;
    }

    if (
      typeof dateValue === "object" &&
      typeof dateValue.toDate === "function"
    ) {
      return dateValue.toDate();
    }

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        String(dateValue)
      )
    ) {
      return new Date(
        `${dateValue}T00:00:00`
      );
    }

    const convertedDate =
      new Date(dateValue);

    return Number.isNaN(
      convertedDate.getTime()
    )
      ? null
      : convertedDate;

  };


  const getDateInputValue = (dateValue) => {

    const convertedDate =
      convertToDate(dateValue);

    if (!convertedDate) {
      return "";
    }

    const year =
      convertedDate.getFullYear();

    const month =
      String(
        convertedDate.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        convertedDate.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;

  };


  const formatDate = (dateValue) => {

    const convertedDate =
      convertToDate(dateValue);

    if (!convertedDate) {
      return "Not Available";
    }

    return convertedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  // ============================================================
  // STUDENT JOINING DATE HELPER
  // ============================================================

  const getStudentJoiningDate = (student) => {

    return (
      student.joiningDate ||
      student.admissionDate ||
      ""
    );

  };


  // ============================================================
  // FETCH REPORT DATA
  // ============================================================

  const fetchReportData = async (
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

      const [
        studentSnapshot,
        attendanceSnapshot,
        feeSnapshot
      ] = await Promise.all([

        getDocs(
          collection(
            db,
            "students"
          )
        ),

        getDocs(
          collection(
            db,
            "studentAttendance"
          )
        ),

        getDocs(
          collection(
            db,
            "fees"
          )
        )

      ]);


      const studentList =
        studentSnapshot.docs.map(
          (studentDocument) => ({

            id:
              studentDocument.id,

            ...studentDocument.data()

          })
        );


      const attendanceList =
        attendanceSnapshot.docs.map(
          (attendanceDocument) => ({

            id:
              attendanceDocument.id,

            ...attendanceDocument.data()

          })
        );


      const feeList =
        feeSnapshot.docs.map(
          (feeDocument) => ({

            id:
              feeDocument.id,

            ...feeDocument.data()

          })
        );


      setStudents(
        studentList
      );

      setAttendance(
        attendanceList
      );

      setFees(
        feeList
      );

    }
    catch (error) {

      console.error(
        "Error loading student report:",
        error
      );

      setErrorMessage(
        "Unable to load student report. Please try again."
      );

    }
    finally {

      setIsLoading(false);
      setIsRefreshing(false);

    }

  };


  // ============================================================
  // LOAD REPORT
  // ============================================================

  useEffect(() => {

    fetchReportData();

  }, []);


  // ============================================================
  // AVAILABLE CLASSES
  // ============================================================

  const availableClasses =
    useMemo(() => {

      return [
        ...new Set(
          students
            .map(
              (student) =>
                student.studentClass ||
                student.className
            )
            .filter(Boolean)
        )
      ].sort();

    }, [students]);


  // ============================================================
  // FILTER STUDENTS
  // ============================================================

  const filteredStudents =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();


      const matchingStudents =
        students.filter(
          (student) => {

            const searchableText =
              [

                student.studentName,

                student.studentId,

                student.admissionNumber,

                student.admissionNo,

                student.fatherName,

                student.motherName,

                student.mobileNumber,

                student.studentClass,

                student.className,

                student.aadhaarNumber

              ]
                .map(
                  (value) =>
                    String(
                      value || ""
                    ).toLowerCase()
                )
                .join(" ");


            const matchesSearch =
              !normalizedSearch ||
              searchableText.includes(
                normalizedSearch
              );


            const studentClass =
              student.studentClass ||
              student.className ||
              "Not Assigned";


            const matchesClass =
              classFilter === "All" ||
              studentClass ===
                classFilter;


            const studentStatus =
              student.status ||
              "Active";


            const matchesStatus =
              statusFilter === "All" ||
              studentStatus ===
                statusFilter;


            const joiningDate =
              getDateInputValue(
                getStudentJoiningDate(
                  student
                )
              );


            const matchesStartDate =
              !startDate ||
              (
                joiningDate &&
                joiningDate >=
                  startDate
              );


            const matchesEndDate =
              !endDate ||
              (
                joiningDate &&
                joiningDate <=
                  endDate
              );


            return (
              matchesSearch &&
              matchesClass &&
              matchesStatus &&
              matchesStartDate &&
              matchesEndDate
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
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  getStudentJoiningDate(
                    firstStudent
                  )
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  getStudentJoiningDate(
                    secondStudent
                  )
                )?.getTime() || 0
              )
            );

          }


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
            sortOption === "attendance-high"
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
            sortOption === "attendance-low"
          ) {

            return (
              getNumber(
                firstStudent.attendancePercentage
              ) -
              getNumber(
                secondStudent.attendancePercentage
              )
            );

          }


          if (
            sortOption === "fees-high"
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


          return (
            (
              convertToDate(
                getStudentJoiningDate(
                  secondStudent
                )
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                getStudentJoiningDate(
                  firstStudent
                )
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      students,
      searchTerm,
      classFilter,
      statusFilter,
      startDate,
      endDate,
      sortOption
    ]);


  // ============================================================
  // REPORT STATISTICS
  // ============================================================

  const reportStatistics =
    useMemo(() => {

      const today =
        getDateInputValue(
          new Date()
        );


      const totalStudents =
        students.length;


      const activeStudents =
        students.filter(
          (student) =>
            (
              student.status ||
              "Active"
            ) === "Active"
        ).length;


      const presentToday =
        attendance.filter(
          (attendanceRecord) =>

            getDateInputValue(
              attendanceRecord.date
            ) === today &&

            attendanceRecord.status ===
              "Present"

        ).length;


      const absentToday =
        attendance.filter(
          (attendanceRecord) =>

            getDateInputValue(
              attendanceRecord.date
            ) === today &&

            attendanceRecord.status ===
              "Absent"

        ).length;


      const currentDate =
        new Date();


      const currentMonth =
        currentDate.getMonth();


      const currentYear =
        currentDate.getFullYear();


      const newAdmissions =
        students.filter(
          (student) => {

            const joiningDate =
              convertToDate(
                getStudentJoiningDate(
                  student
                )
              );


            if (!joiningDate) {
              return false;
            }


            return (
              joiningDate.getMonth() ===
                currentMonth &&
              joiningDate.getFullYear() ===
                currentYear
            );

          }
        ).length;


      const totalFeeCollection =
        fees.reduce(
          (total, fee) =>
            total +
            getNumber(
              fee.amount
            ),
          0
        );


      const totalPendingFees =
        students.reduce(
          (total, student) =>
            total +
            getNumber(
              student.pendingFees
            ),
          0
        );


      return {

        totalStudents,

        activeStudents,

        presentToday,

        absentToday,

        newAdmissions,

        totalFeeCollection,

        totalPendingFees

      };

    }, [
      students,
      attendance,
      fees
    ]);


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    classFilter !== "All" ||
    statusFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {

    setSearchTerm("");

    setClassFilter("All");

    setStatusFilter("All");

    setStartDate("");

    setEndDate("");

    setSortOption("newest");

  };


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport = async () => {

    await fetchReportData(
      true
    );

  };


  // ============================================================
  // EXPORT EXCEL
  // ============================================================

  const exportExcel = () => {

    if (
      filteredStudents.length === 0
    ) {

      alert(
        "There are no student records to export."
      );

      return;

    }


    const excelData =
      filteredStudents.map(
        (student) => ({

          "Student ID":
            student.studentId ||
            "N/A",

          "Admission Number":
            student.admissionNumber ||
            student.admissionNo ||
            "N/A",

          "Student Name":
            student.studentName ||
            "N/A",

          "Father Name":
            student.fatherName ||
            "N/A",

          "Mother Name":
            student.motherName ||
            "N/A",

          Class:
            student.studentClass ||
            student.className ||
            "N/A",

          Mobile:
            student.mobileNumber ||
            "N/A",

          Status:
            student.status ||
            "Active",

          "Attendance Percentage":
            getNumber(
              student.attendancePercentage
            ),

          "Pending Fees":
            getNumber(
              student.pendingFees
            ),

          "Joining Date":
            formatDate(
              getStudentJoiningDate(
                student
              )
            )

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Student Report"
    );


    XLSX.writeFile(
      workbook,
      "Student_Report.xlsx"
    );

  };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    if (
      filteredStudents.length === 0
    ) {

      alert(
        "There are no student records to export."
      );

      return;

    }


    const pdfDocument =
      new jsPDF({
        orientation: "landscape"
      });


    pdfDocument.setFontSize(
      18
    );


    pdfDocument.text(
      "Student Report",
      14,
      18
    );


    pdfDocument.setFontSize(
      10
    );


    pdfDocument.text(
      `Total Students: ${filteredStudents.length}`,
      14,
      26
    );


    const tableData =
      filteredStudents.map(
        (student) => [

          student.studentId ||
            "N/A",

          student.studentName ||
            "N/A",

          student.fatherName ||
            "N/A",

          student.studentClass ||
            student.className ||
            "N/A",

          getNumber(
            student.attendancePercentage
          ),

          getNumber(
            student.pendingFees
          ),

          formatDate(
            getStudentJoiningDate(
              student
            )
          )

        ]
      );


    autoTable(
      pdfDocument,
      {

        head: [[

          "Student ID",

          "Student Name",

          "Father",

          "Class",

          "Attendance %",

          "Pending Fees",

          "Joining Date"

        ]],

        body:
          tableData,

        startY:
          32

      }
    );


    pdfDocument.save(
      "Student_Report.pdf"
    );

  };


  // ============================================================
  // PRINT REPORT
  // ============================================================

  const printReport = () => {

    window.print();

  };
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
              👨‍🎓 Student Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review student admissions, attendance, fees, and academic records.
            </p>

          </div>

          <button
            type="button"
            onClick={refreshReport}
            disabled={isRefreshing}
          >
            {
              isRefreshing
                ? "⏳ Refreshing..."
                : "🔄 Refresh Report"
            }
          </button>

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
                  Loading Student Report...
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
                    {reportStatistics.totalStudents}
                  </h2>

                  <p>
                    👨‍🎓 Total Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.activeStudents}
                  </h2>

                  <p>
                    ✅ Active Students
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.presentToday}
                  </h2>

                  <p>
                    🟢 Present Today
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.absentToday}
                  </h2>

                  <p>
                    🔴 Absent Today
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.newAdmissions}
                  </h2>

                  <p>
                    🆕 New Admissions
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    ₹
                    {
                      reportStatistics
                        .totalFeeCollection
                        .toLocaleString("en-IN")
                    }
                  </h2>

                  <p>
                    💰 Fee Collection
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    ₹
                    {
                      reportStatistics
                        .totalPendingFees
                        .toLocaleString("en-IN")
                    }
                  </h2>

                  <p>
                    ⏳ Pending Fees
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

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search students and filter records by class, status, and joining date.
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
                      placeholder="Name, ID, parent, mobile..."
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
                      Student Class
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
                        availableClasses.map(
                          (studentClass) => (

                            <option
                              key={studentClass}
                              value={studentClass}
                            >
                              {studentClass}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Student Status
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
                      Joining Date From
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                    />

                  </div>


                  <div>

                    <label>
                      Joining Date To
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                    />

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
                        Newest Admissions
                      </option>

                      <option value="oldest">
                        Oldest Admissions
                      </option>

                      <option value="name">
                        Student Name
                      </option>

                      <option value="attendance-high">
                        Highest Attendance
                      </option>

                      <option value="attendance-low">
                        Lowest Attendance
                      </option>

                      <option value="fees-high">
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
                  student records.
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
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >

                  <div>

                    <h2 style={{ margin: "0 0 6px" }}>
                      📤 Export Student Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the currently filtered student records.
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
                      onClick={exportExcel}
                    >
                      📥 Export Excel
                    </button>


                    <button
                      type="button"
                      onClick={downloadPDF}
                    >
                      📄 Download PDF
                    </button>


                    <button
                      type="button"
                      onClick={printReport}
                    >
                      🖨 Print Report
                    </button>

                  </div>

                </div>

              </div>


              {
                filteredStudents.length === 0 ? (

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
                        No Student Records Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          students.length === 0
                            ? "No students have been registered yet."
                            : "No students match the selected filters."
                        }
                      </p>


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

                  </div>

                ) : (

                  <div className="attendance-table-container">

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                      }}
                    >

                      <div>

                        <h2 style={{ margin: "0 0 6px" }}>
                          📋 Student Records
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete student admission and performance information.
                        </p>

                      </div>


                      <div
                        style={{
                          padding: "7px 12px",
                          borderRadius: "20px",
                          background: "#f1f5f9",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#475569"
                        }}
                      >
                        Showing {filteredStudents.length} Records
                      </div>

                    </div>


                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Student
                          </th>

                          <th>
                            Student ID
                          </th>

                          <th>
                            Admission No.
                          </th>

                          <th>
                            Class
                          </th>

                          <th>
                            Mobile
                          </th>

                          <th>
                            Attendance
                          </th>

                          <th>
                            Pending Fees
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Joining Date
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          filteredStudents.map(
                            (student) => (

                              <tr key={student.id}>

                                <td>

                                  <strong>
                                    {
                                      student.studentName ||
                                      "N/A"
                                    }
                                  </strong>

                                  <div
                                    style={{
                                      marginTop: "4px",
                                      fontSize: "12px",
                                      color: "#64748b"
                                    }}
                                  >
                                    Father:{" "}
                                    {
                                      student.fatherName ||
                                      "N/A"
                                    }
                                  </div>

                                </td>


                                <td>
                                  {
                                    student.studentId ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    student.admissionNumber ||
                                    student.admissionNo ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    student.studentClass ||
                                    student.className ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    student.mobileNumber ||
                                    "N/A"
                                  }
                                </td>


                                <td>

                                  <strong>
                                    {
                                      getNumber(
                                        student.attendancePercentage
                                      )
                                    }
                                    %
                                  </strong>

                                </td>


                                <td>

                                  <strong>
                                    ₹
                                    {
                                      getNumber(
                                        student.pendingFees
                                      ).toLocaleString(
                                        "en-IN"
                                      )
                                    }
                                  </strong>

                                </td>


                                <td>

                                  <span
                                    style={{
                                      padding: "6px 10px",
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
                                          ? "#166534"
                                          : "#991b1b"
                                    }}
                                  >
                                    {
                                      student.status ||
                                      "Active"
                                    }
                                  </span>

                                </td>


                                <td>
                                  {
                                    formatDate(
                                      getStudentJoiningDate(
                                        student
                                      )
                                    )
                                  }
                                </td>

                              </tr>

                            )
                          )
                        }

                      </tbody>

                    </table>

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
                  to="/reports"
                  className="action-btn view-btn"
                >
                  📊 Reports Module
                </Link>


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
                  to="/attendance"
                  className="action-btn view-btn"
                >
                  📅 Attendance
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

export default StudentReport;