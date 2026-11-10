import {
  useEffect,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";

import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../../firebase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


function AttendanceReports() {

  const [reports, setReports] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );


  useEffect(() => {

    fetchReports();

  }, [madrasaId]);


  const fetchReports =
    async () => {

      try {

        setLoading(true);


        if (!madrasaId) {

          console.log(
            "Madrasa ID not found"
          );

          setReports([]);

          return;

        }


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
            )

          );


        const querySnapshot =
          await getDocs(
            attendanceQuery
          );


        const reportList =
          querySnapshot.docs.map(
            (attendanceDoc) => ({

              id:
                attendanceDoc.id,

              ...attendanceDoc.data()

            })
          );


        setReports(
          reportList
        );


      }
      catch (error) {

        console.log(
          "Error fetching attendance reports:",
          error
        );

      }
      finally {

        setLoading(false);

      }

    };


  const filteredReports =
    reports.filter(
      (item) => {

        const searchValue =
          search
            .toLowerCase()
            .trim();


        const matchesSearch =

          item.studentName
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          item.fatherName
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          item.mobileNumber
            ?.toString()
            .includes(
              searchValue
            );


        const matchesDate =
          selectedDate === ""
            ? true
            : item.selectedDate ===
              selectedDate;


        return (
          matchesSearch &&
          matchesDate
        );

      }
    );


  const totalStudents =
    filteredReports.length;


  const presentCount =
    filteredReports.filter(
      (item) =>
        item.status ===
        "Present"
    ).length;


  const absentCount =
    filteredReports.filter(
      (item) =>
        item.status ===
        "Absent"
    ).length;


  const leaveCount =
    filteredReports.filter(
      (item) =>
        item.status ===
        "Leave"
    ).length;


  const attendancePercent =
    totalStudents === 0
      ? 0
      : Math.round(
          (
            presentCount /
            totalStudents
          ) *
          100
        );


  const clearFilters =
    () => {

      setSearch("");

      setSelectedDate("");

    };


  const exportExcel =
    () => {

      if (
        filteredReports.length ===
        0
      ) {

        alert(
          "No attendance records to export."
        );

        return;

      }


      const excelData =
        filteredReports.map(
          (item) => ({

            Student:
              item.studentName ||
              "N/A",

            Father:
              item.fatherName ||
              "N/A",

            Phone:
              item.mobileNumber ||
              "N/A",

            Class:
              item.studentClass ||
              "N/A",

            Date:
              item.date ||
              "N/A",

            Status:
              item.status ||
              "N/A"

          })
        );


      const worksheet =
        XLSX.utils
          .json_to_sheet(
            excelData
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
        selectedDate
          ? `Attendance_Report_${selectedDate}.xlsx`
          : "Attendance_Report.xlsx"
      );

    };


  const exportPDF =
    () => {

      if (
        filteredReports.length ===
        0
      ) {

        alert(
          "No attendance records to export."
        );

        return;

      }


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
        selectedDate
          ? `Attendance Report - ${selectedDate}`
          : "Attendance Report",
        14,
        30
      );


      const tableData =
        filteredReports.map(
          (item) => [

            item.studentName ||
              "N/A",

            item.fatherName ||
              "N/A",

            item.mobileNumber ||
              "N/A",

            item.studentClass ||
              "N/A",

            item.date ||
              "N/A",

            item.status ||
              "N/A"

          ]
        );


      autoTable(
        pdfDocument,
        {

          head: [[

            "Student",
            "Father",
            "Phone",
            "Class",
            "Date",
            "Status"

          ]],

          body:
            tableData,

          startY:
            40

        }
      );


      pdfDocument.save(
        selectedDate
          ? `Attendance_Report_${selectedDate}.pdf`
          : "Attendance_Report.pdf"
      );

    };


  if (loading) {

    return (

      <Layout>

        <div className="accounts-page">

          <h1>
            Loading Attendance Reports...
          </h1>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">


        <h1>
          📊 Attendance Reports
        </h1>


        <div className="attendance-summary">


          <div className="summary-card">

            <h2>
              {totalStudents}
            </h2>

            <p>
              Total Records
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

          placeholder="🔍 Search Student, Father or Phone..."

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


        <div className="action-buttons">


          <button
            className="save-all-btn"
            onClick={
              fetchReports
            }
          >

            🔄 Refresh Reports

          </button>


          <button
            className="save-all-btn"
            onClick={
              clearFilters
            }
          >

            ❌ Clear Filters

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
              exportPDF
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
                  Date
                </th>

                <th>
                  Status
                </th>

              </tr>


            </thead>


            <tbody>


              {

                filteredReports.length ===
                0

                  ? (

                    <tr>

                      <td

                        colSpan="6"

                        style={{
                          textAlign:
                            "center"
                        }}

                      >

                        No Attendance Reports Found

                      </td>

                    </tr>

                  )

                  : (

                    filteredReports.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >


                          <td>

                            {
                              item.studentName ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {
                              item.fatherName ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {
                              item.mobileNumber ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {
                              item.studentClass ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {
                              item.date ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {

                              item.status ===
                              "Present"

                                ? "✅ Present"

                                : item.status ===
                                  "Absent"

                                ? "❌ Absent"

                                : "🟡 Leave"

                            }

                          </td>


                        </tr>

                      )
                    )

                  )

              }


            </tbody>


          </table>


        </div>


      </div>

    </Layout>

  );

}


export default AttendanceReports;