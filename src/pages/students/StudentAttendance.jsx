import {
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import {
  useEffect,
  useState
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function StudentAttendance() {

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [students, setStudents] =
    useState([]);

  const [attendance, setAttendance] =
    useState({});

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );


  const today =
    new Date(
      selectedDate
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );


  useEffect(() => {

    fetchStudents();

  }, [madrasaId]);


  const fetchStudents =
    async () => {

      try {

        setLoading(true);

        if (!madrasaId) {

          console.log(
            "Madrasa ID not found"
          );

          setStudents([]);

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


        const querySnapshot =
          await getDocs(
            studentsQuery
          );


        const studentList =
          querySnapshot.docs.map(
            (studentDoc) => ({
              id:
                studentDoc.id,

              ...studentDoc.data()
            })
          );


        setStudents(
          studentList
        );


        const defaultAttendance =
          {};

        studentList.forEach(
          (student) => {

            defaultAttendance[
              student.id
            ] =
              "Present";

          }
        );


        setAttendance(
          defaultAttendance
        );

      }
      catch (error) {

        console.log(
          "Error fetching students:",
          error
        );

      }
      finally {

        setLoading(false);

      }

    };


  const handleAttendance =
    (
      studentId,
      value
    ) => {

      setAttendance(
        (previousAttendance) => ({
          ...previousAttendance,

          [studentId]:
            value
        })
      );

    };


  const markAllPresent =
    () => {

      const data = {};

      students.forEach(
        (student) => {

          data[
            student.id
          ] =
            "Present";

        }
      );

      setAttendance(
        data
      );

    };


  const markAllAbsent =
    () => {

      const data = {};

      students.forEach(
        (student) => {

          data[
            student.id
          ] =
            "Absent";

        }
      );

      setAttendance(
        data
      );

    };


  const resetAttendance =
    () => {

      const data = {};

      students.forEach(
        (student) => {

          data[
            student.id
          ] =
            "Present";

        }
      );

      setAttendance(
        data
      );

    };


  const saveAllAttendance =
    async () => {

      try {

        if (!madrasaId) {

          alert(
            "Madrasa account not found."
          );

          return;

        }


        if (
          students.length ===
          0
        ) {

          alert(
            "No students found."
          );

          return;

        }


        for (
          const student
          of students
        ) {

          const status =
            attendance[
              student.id
            ] ||
            "Present";


          const attendanceQuery =
            query(
              collection(
                db,
                "attendance"
              ),

              where(
                "madrasaId",
                "==",
                madrasaId
              ),

              where(
                "studentId",
                "==",
                student.id
              ),

              where(
                "selectedDate",
                "==",
                selectedDate
              )
            );


          const existingAttendance =
            await getDocs(
              attendanceQuery
            );


          if (
            !existingAttendance.empty
          ) {

            continue;

          }


          await addDoc(
            collection(
              db,
              "attendance"
            ),
            {

              madrasaId:
                madrasaId,

              studentId:
                student.id,

              studentName:
                student.studentName ||
                "",

              fatherName:
                student.fatherName ||
                "",

              mobileNumber:
                student.mobileNumber ||
                "",

              studentClass:
                student.studentClass ||
                "",

              status:
                status,

              selectedDate:
                selectedDate,

              date:
                today,

              month:
                new Date(
                  selectedDate
                ).getMonth() + 1,

              year:
                new Date(
                  selectedDate
                ).getFullYear(),

              createdAt:
                new Date()

            }
          );

        }


        alert(
          "Attendance Saved Successfully ✅"
        );

      }
      catch (error) {

        console.log(
          "Error saving attendance:",
          error
        );

        alert(
          "Error Saving Attendance"
        );

      }

    };


  const filteredStudents =
    students.filter(
      (student) => {

        const searchValue =
          search
            .toLowerCase()
            .trim();


        const matchesSearch =

          student.studentName
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          student.fatherName
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          student.mobileNumber
            ?.toString()
            .includes(
              searchValue
            );


        const status =
          attendance[
            student.id
          ] ||
          "Present";


        const matchesFilter =
          filter === "All"
            ? true
            : status ===
              filter;


        return (
          matchesSearch &&
          matchesFilter
        );

      }
    );


  const presentCount =
    students.filter(
      (student) =>

        (
          attendance[
            student.id
          ] ||
          "Present"
        ) ===
        "Present"

    ).length;


  const absentCount =
    students.filter(
      (student) =>

        attendance[
          student.id
        ] ===
        "Absent"

    ).length;


  const leaveCount =
    students.filter(
      (student) =>

        attendance[
          student.id
        ] ===
        "Leave"

    ).length;


  const attendancePercent =
    students.length === 0
      ? 0
      : Math.round(
          (
            presentCount /
            students.length
          ) *
          100
        );


  const exportExcel =
    () => {

      const data =
        filteredStudents.map(
          (student) => ({

            Student:
              student.studentName ||
              "N/A",

            Father:
              student.fatherName ||
              "N/A",

            Phone:
              student.mobileNumber ||
              "N/A",

            Class:
              student.studentClass ||
              "N/A",

            Status:
              attendance[
                student.id
              ] ||
              "Present"

          })
        );


      const worksheet =
        XLSX.utils
          .json_to_sheet(
            data
          );


      const workbook =
        XLSX.utils
          .book_new();


      XLSX.utils
        .book_append_sheet(
          workbook,
          worksheet,
          "Attendance"
        );


      XLSX.writeFile(
        workbook,
        `Attendance_Report_${selectedDate}.xlsx`
      );

    };


  const exportPdf =
    () => {

      const pdfDocument =
        new jsPDF();


      pdfDocument.setFontSize(
        18
      );


      pdfDocument.text(
        "MA MADRASA ERP",
        14,
        20
      );


      pdfDocument.setFontSize(
        12
      );


      pdfDocument.text(
        `Attendance Report - ${today}`,
        14,
        30
      );


      const tableData =
        filteredStudents.map(
          (student) => [

            student.studentName ||
              "N/A",

            student.fatherName ||
              "N/A",

            student.mobileNumber ||
              "N/A",

            student.studentClass ||
              "N/A",

            attendance[
              student.id
            ] ||
              "Present"

          ]
        );


      autoTable(
        pdfDocument,
        {

          startY:
            40,

          head: [[

            "Student",
            "Father",
            "Phone",
            "Class",
            "Status"

          ]],

          body:
            tableData

        }
      );


      pdfDocument.save(
        `Attendance_Report_${selectedDate}.pdf`
      );

    };


  if (loading) {

    return (

      <Layout>

        <div className="accounts-page">

          <h1>
            Loading Students...
          </h1>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">


        <h1>
          📋 Student Attendance
        </h1>


        <div className="attendance-summary">


          <div className="summary-card">

            <h2>
              {students.length}
            </h2>

            <p>
              Students
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {presentCount}
            </h2>

            <p>
              Present
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {absentCount}
            </h2>

            <p>
              Absent
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {leaveCount}
            </h2>

            <p>
              Leave
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {attendancePercent}%
            </h2>

            <p>
              Attendance %
            </p>

          </div>


        </div>


        <input

          type="date"

          className="attendance-date-picker"

          value={
            selectedDate
          }

          onChange={(event) =>
            setSelectedDate(
              event.target.value
            )
          }

        />


        <input

          type="text"

          placeholder="Search by Name, Father or Phone..."

          className="attendance-search"

          value={
            search
          }

          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }

        />


        <div className="attendance-filters">


          <button
            onClick={() =>
              setFilter(
                "All"
              )
            }
          >
            All
          </button>


          <button
            onClick={() =>
              setFilter(
                "Present"
              )
            }
          >
            Present
          </button>


          <button
            onClick={() =>
              setFilter(
                "Absent"
              )
            }
          >
            Absent
          </button>


          <button
            onClick={() =>
              setFilter(
                "Leave"
              )
            }
          >
            Leave
          </button>


        </div>


        <div className="action-buttons">


          <button
            className="mark-all-btn"
            onClick={
              markAllPresent
            }
          >
            Mark All Present
          </button>


          <button
            className="mark-all-btn"
            onClick={
              markAllAbsent
            }
          >
            Mark All Absent
          </button>


          <button
            className="save-all-btn"
            onClick={
              resetAttendance
            }
          >
            Reset
          </button>


          <button
            className="save-all-btn"
            onClick={
              saveAllAttendance
            }
          >
            Save Attendance
          </button>


        </div>


        <div className="export-buttons">


          <button
            onClick={
              exportExcel
            }
          >
            📥 Export Excel
          </button>


          <button
            onClick={
              exportPdf
            }
          >
            🖨 Export PDF
          </button>


        </div>


        <div className="attendance-table-container">


          <table className="attendance-table">


            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Father
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Class
                </th>

                <th>
                  Attendance
                </th>

              </tr>

            </thead>


            <tbody>


              {

                filteredStudents.length ===
                0

                  ? (

                    <tr>

                      <td
                        colSpan="5"

                        style={{
                          textAlign:
                            "center"
                        }}
                      >

                        No Students Found

                      </td>

                    </tr>

                  )

                  : (

                    filteredStudents.map(
                      (student) => (

                        <tr
                          key={
                            student.id
                          }
                        >


                          <td>

                            <button

                              className="student-link"

                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }

                            >

                              {
                                student.studentName
                              }

                            </button>

                          </td>


                          <td>

                            {
                              student.fatherName ||
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

                            {
                              student.studentClass ||
                              "N/A"
                            }

                          </td>


                          <td>


                            <select

                              className="attendance-select"

                              value={
                                attendance[
                                  student.id
                                ] ||
                                "Present"
                              }

                              onChange={(event) =>
                                handleAttendance(
                                  student.id,
                                  event.target.value
                                )
                              }

                            >


                              <option>
                                Present
                              </option>


                              <option>
                                Absent
                              </option>


                              <option>
                                Leave
                              </option>


                            </select>


                          </td>


                        </tr>

                      )
                    )

                  )

              }


            </tbody>


          </table>


        </div>


        {

          selectedStudent && (

            <div className="modal-overlay">


              <div className="modal-card">


                <h2>
                  Student Profile
                </h2>


                <p>

                  Name:{" "}

                  {
                    selectedStudent
                      .studentName ||
                    "N/A"
                  }

                </p>


                <p>

                  Father:{" "}

                  {
                    selectedStudent
                      .fatherName ||
                    "N/A"
                  }

                </p>


                <p>

                  Phone:{" "}

                  {
                    selectedStudent
                      .mobileNumber ||
                    "N/A"
                  }

                </p>


                <p>

                  Class:{" "}

                  {
                    selectedStudent
                      .studentClass ||
                    "N/A"
                  }

                </p>


                <p>

                  Status:{" "}

                  {
                    attendance[
                      selectedStudent.id
                    ] ||
                    "Present"
                  }

                </p>


                <button
                  onClick={() =>
                    setSelectedStudent(
                      null
                    )
                  }
                >

                  Close

                </button>


              </div>


            </div>

          )

        }


      </div>


    </Layout>

  );

}


export default StudentAttendance;