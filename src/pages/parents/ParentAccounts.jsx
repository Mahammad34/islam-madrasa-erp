import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

import {
  useEffect,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function ParentAccounts() {

  // ======================
  // STATES
  // ======================

  const [students,
    setStudents] =
    useState([]);

  const [accounts,
    setAccounts] =
    useState([]);

  const [selectedStudent,
    setSelectedStudent] =
    useState("");

  const [parentName,
    setParentName] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [studentId,
    setStudentId] =
    useState("");

  const [studentName,
    setStudentName] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [status,
    setStatus] =
    useState("Active");

  const [search,
    setSearch] =
    useState("");

  // ======================
  // LOAD DATA
  // ======================

  useEffect(() => {

    fetchStudents();
    fetchAccounts();

  }, []);

  // ======================
  // FETCH STUDENTS
  // ======================

  const fetchStudents =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "students"
            )
          );

        const list = [];

        snapshot.forEach(
          (doc) => {

            list.push({
              id:
                doc.id,
              ...doc.data()
            });

          }
        );

        setStudents(
          list
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };

  // ======================
  // FETCH PARENT ACCOUNTS
  // ======================

  const fetchAccounts =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "parentAccounts"
            )
          );

        const list = [];

        snapshot.forEach(
          (doc) => {

            list.push({
              id:
                doc.id,
              ...doc.data()
            });

          }
        );

        setAccounts(
          list.reverse()
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      // ======================
  // SELECT STUDENT
  // ======================

  const selectStudent =
    (id) => {

      setSelectedStudent(
        id
      );

      const student =
        students.find(
          (item) =>
            item.id === id
        );

      if (!student) {
        return;
      }

      // Professional Student ID
      setStudentId(
        student.studentId || ""
      );

      // Student Name
      setStudentName(
        student.studentName || ""
      );

      // Parent Name
      setParentName(
        student.fatherName || ""
      );

      // Mobile Number
      setPhone(
        student.mobileNumber || ""
      );

      // Temporary Password
      const tempPassword =
        Math.random()
          .toString(36)
          .slice(-8);

      setPassword(
        tempPassword
      );

    };

  // ======================
  // CREATE PARENT ACCOUNT
  // ======================

  const createAccount =
    async () => {

      if (
        !selectedStudent
      ) {

        alert(
          "Please select a student."
        );

        return;

      }

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "parentAccounts"
            )
          );

        // Prevent Duplicate Accounts
        const alreadyExists =
          snapshot.docs.find(
            (item) =>
              item.data()
                .studentId ===
              studentId
          );

        if (
          alreadyExists
        ) {

          alert(
            "Parent account already created."
          );

          return;

        }

        await addDoc(
          collection(
            db,
            "parentAccounts"
          ),
          {

            // Student Information
            studentDocId:
              selectedStudent,

            studentId,

            studentName,

            parentName,

            phone,

            // Login
            password,

            status,

            accountType:
              "Parent",

            // Dashboard
            loginCount:
              0,

            lastLogin:
              null,

            notificationCount:
              0,

            profilePhoto:
              "",

            deviceToken:
              "",

            // Permissions
            attendanceAccess:
              true,

            feesAccess:
              true,

            reportAccess:
              true,

            healthAccess:
              true,

            noticeBoardAccess:
              true,

            taskAccess:
              true,

            // Dates
            createdAt:
              Date.now(),

            updatedAt:
              Date.now()

          }
        );

        alert(
          "Parent Account Created Successfully"
        );

        // Reset
        setSelectedStudent(
          ""
        );

        setParentName(
          ""
        );

        setPhone(
          ""
        );

        setStudentId(
          ""
        );

        setStudentName(
          ""
        );

        setPassword(
          ""
        );

        setStatus(
          "Active"
        );

        fetchAccounts();

      }
      catch (error) {

        console.log(
          error
        );

        alert(
          "Error Creating Parent Account"
        );

      }

    };

  // ======================
  // DELETE ACCOUNT
  // ======================

  const deleteAccount =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this account?"
        );

      if (
        !confirmDelete
      ) {
        return;
      }

      try {

        await deleteDoc(
          doc(
            db,
            "parentAccounts",
            id
          )
        );

        fetchAccounts();

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      // ======================
  // SEARCH
  // ======================

  const filteredAccounts =
    accounts.filter(
      (item) =>
        `
          ${item.studentId}
          ${item.studentName}
          ${item.parentName}
          ${item.phone}
          ${item.status}
        `
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // ======================
  // SUMMARY CARDS
  // ======================

  const totalAccounts =
    accounts.length;

  const activeAccounts =
    accounts.filter(
      (item) =>
        item.status ===
        "Active"
    ).length;

  const inactiveAccounts =
    accounts.filter(
      (item) =>
        item.status ===
        "Inactive"
    ).length;

  const todayAccounts =
    accounts.filter(
      (item) => {

        if (
          !item.createdAt
        ) {
          return false;
        }

        return (
          new Date(
            item.createdAt
          ).toDateString() ===
          new Date().toDateString()
        );

      }
    ).length;

  // ======================
  // AVAILABLE STUDENTS
  // ======================

  const availableStudents =
    students.filter(
      (student) =>
        !accounts.some(
          (account) =>
            account.studentId ===
            student.studentId
        )
    );

  // ======================
  // RETURN
  // ======================

  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          👨‍👩‍👧 Parent Accounts
        </h1>

        {/* Summary */}

        <div
          className="attendance-summary"
        >

          <div
            className="summary-card"
          >
            <h2>
              {
                totalAccounts
              }
            </h2>

            <p>
              Total Accounts
            </p>
          </div>

          <div
            className="summary-card"
          >
            <h2>
              {
                activeAccounts
              }
            </h2>

            <p>
              Active
            </p>
          </div>

          <div
            className="summary-card"
          >
            <h2>
              {
                inactiveAccounts
              }
            </h2>

            <p>
              Inactive
            </p>
          </div>

          <div
            className="summary-card"
          >
            <h2>
              {
                todayAccounts
              }
            </h2>

            <p>
              Created Today
            </p>
          </div>

        </div>

        {/* Create Account */}

        <div
          className="module-card"
        >

          <h2>
            Create Parent Account
          </h2>

          <select
            className="attendance-search"
            value={
              selectedStudent
            }
            onChange={(e) =>
              selectStudent(
                e.target.value
              )
            }
          >

            <option value="">
  {
    availableStudents.length === 0
      ? "All students already have parent accounts"
      : "Select Student"
  }
</option>

            {
              availableStudents.map(
                (
                  student
                ) => (

                  <option
                    key={
                      student.id
                    }
                    value={
                      student.id
                    }
                  >

                    {
                      student.studentId
                    }

                    {" - "}

                    {
                      student.studentName
                    }

                  </option>

                )
              )
            }

          </select>

          <input
            type="text"
            className="attendance-search"
            placeholder="Parent Name"
            value={
              parentName
            }
            readOnly
          />

          <input
            type="text"
            className="attendance-search"
            placeholder="Phone Number"
            value={
              phone
            }
            readOnly
          />

          <input
            type="text"
            className="attendance-search"
            placeholder="Student ID"
            value={
              studentId
            }
            readOnly
          />

          <input
            type="text"
            className="attendance-search"
            placeholder="Temporary Password"
            value={
              password
            }
            readOnly
          />

          <select
            className="attendance-search"
            value={
              status
            }
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >

            <option>
              Active
            </option>

            <option>
              Inactive
            </option>

          </select>

          <button
            className="save-all-btn"
            onClick={
              createAccount
            }
          >
            ➕ Create Account
          </button>

        </div>

        {/* Search */}

        <input
          type="text"
          className="attendance-search"
          placeholder="Search Parent Accounts..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        {/* Table */}

        <div
          className="attendance-table-container"
        >

          <table
            className="attendance-table"
          >

            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Parent
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Password
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {
                filteredAccounts.length ===
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
                        No Parent Accounts Found
                      </td>

                    </tr>

                  )
                  : (

                    filteredAccounts.map(
                      (
                        item
                      ) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>

                            <strong>
                              {
                                item.studentId
                              }
                            </strong>

                            <br />

                            {
                              item.studentName
                            }

                          </td>

                          <td>
                            {
                              item.parentName
                            }
                          </td>

                          <td>
                            {
                              item.phone
                            }
                          </td>

                          <td>
                            {
                              item.password
                            }
                          </td>

                          <td>
                            {
                              item.status
                            }
                          </td>

                          <td>

                            <button
                              onClick={() =>
                                deleteAccount(
                                  item.id
                                )
                              }
                            >
                              🗑 Delete
                            </button>

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

export default ParentAccounts;