import {
  useEffect,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";

import {
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "../../firebase";

function Attendance() {

  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  const today =
    new Date(
      `${selectedDate}T00:00:00`
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

        if (!madrasaId) {

          alert(
            "Madrasa account not found."
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

        const querySnapshot =
          await getDocs(
            studentsQuery
          );

          console.log(
  "CURRENT MADRASA ID:",
  madrasaId
);

querySnapshot.docs.forEach(
  (studentDoc) => {

    console.log(
      "LOADED STUDENT:",
      studentDoc.data().studentName,
      "MADRASA ID:",
      studentDoc.data().madrasaId
    );

  }
);

        const studentList =
          [];

        querySnapshot.forEach(
          (studentDoc) => {

            studentList.push({
              id:
                studentDoc.id,

              ...studentDoc.data(),

              status:
                "Present"
            });

          }
        );

        setStudents(
          studentList
        );

      }
      catch (error) {

        console.log(
          error
        );

        alert(
          "Error loading students."
        );

      }

    };


  const updateStatus =
    (
      id,
      status
    ) => {

      const updatedStudents =
        students.map(
          (student) =>

            student.id === id

              ? {
                  ...student,
                  status
                }

              : student
        );

      setStudents(
        updatedStudents
      );

    };


  const markAllPresent =
    () => {

      const updatedStudents =
        students.map(
          (student) => ({
            ...student,
            status:
              "Present"
          })
        );

      setStudents(
        updatedStudents
      );

    };


  const filteredStudents =
    students.filter(
      (student) => {

        const matchesSearch =
          student.studentName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          filter === "All"

            ? true

            : student.status ===
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
        student.status ===
        "Present"
    ).length;


  const absentCount =
    students.filter(
      (student) =>
        student.status ===
        "Absent"
    ).length;


  const leaveCount =
    students.filter(
      (student) =>
        student.status ===
        "Leave"
    ).length;


  const attendancePercent =
    students.length === 0

      ? 0

      : Math.round(
          (
            presentCount /
            students.length
          ) * 100
        );


  const saveAttendance =
    async () => {

      try {

        if (!madrasaId) {

          alert(
            "Madrasa account not found."
          );

          return;

        }


        if (
          students.length === 0
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
                "attendanceDate",
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

              madrasaId,

              studentId:
                student.id,

              studentName:
                student.studentName,

              fatherName:
                student.fatherName ||
                "",

              status:
                student.status,

              attendanceDate:
                selectedDate,

              date:
                today,

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
          error
        );

        alert(
          "Error Saving Attendance"
        );

      }

    };


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
          onChange={(e) =>
            setSelectedDate(
              e.target.value
            )
          }
        />


        <input
          type="text"
          placeholder="Search Student..."
          className="attendance-search"
          value={
            search
          }
          onChange={(e) =>
            setSearch(
              e.target.value
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
            className="save-all-btn"
            onClick={
              saveAttendance
            }
          >
            Save Attendance
          </button>


        </div>


        <div
          className="
            attendance-table-container
          "
        >


          <table
            className="
              attendance-table
            "
          >


            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Father
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>


              {
                filteredStudents.map(
                  (student) => (

                    <tr
                      key={
                        student.id
                      }
                    >


                      <td>

                        {
                          student.studentName
                        }

                      </td>


                      <td>

                        {
                          student.fatherName ||
                          "N/A"
                        }

                      </td>


                      <td>


                        <select
                          className="
                            attendance-select
                          "
                          value={
                            student.status
                          }
                          onChange={
                            (e) =>
                              updateStatus(
                                student.id,
                                e.target.value
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
              }


            </tbody>


          </table>


        </div>


      </div>


    </Layout>

  );

}

export default Attendance;