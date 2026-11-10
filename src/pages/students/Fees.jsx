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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


function Fees() {

  const [students,
    setStudents] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [filter,
    setFilter] =
    useState("All");

  const [payAmount,
    setPayAmount] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("Cash");

  const [selectedStudent,
    setSelectedStudent] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);


  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );


  useEffect(() => {

    fetchStudentsAndFees();

  }, [madrasaId]);


  const fetchStudentsAndFees =
    async () => {

      try {

        setLoading(true);


        if (!madrasaId) {

          alert(
            "Madrasa account not found."
          );

          setStudents([]);

          return;

        }


        // ==========================
        // FETCH CURRENT MADRASA
        // STUDENTS ONLY
        // ==========================

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


        const studentsSnapshot =
          await getDocs(
            studentsQuery
          );


        // ==========================
        // FETCH CURRENT MADRASA
        // FEE PAYMENTS ONLY
        // ==========================

        const feesQuery =
          query(
            collection(
              db,
              "fees"
            ),
            where(
              "madrasaId",
              "==",
              madrasaId
            )
          );


        const feesSnapshot =
          await getDocs(
            feesQuery
          );


        const feePayments =
          feesSnapshot.docs.map(
            (feeDocument) => ({

              id:
                feeDocument.id,

              ...feeDocument.data()

            })
          );


        // ==========================
        // CREATE STUDENT LIST
        // WITH PAID AMOUNT
        // ==========================

        const studentList =
          studentsSnapshot.docs.map(
            (studentDocument) => {

              const studentData =
                studentDocument.data();


              const studentPayments =
                feePayments.filter(
                  (payment) =>

                    payment.studentId ===
                    studentDocument.id

                );


              const paidAmount =
                studentPayments.reduce(
                  (
                    total,
                    payment
                  ) =>

                    total +
                    Number(
                      payment.amount ||
                      0
                    ),

                  0
                );


              return {

                id:
                  studentDocument.id,

                ...studentData,

                totalFee:
                  Number(
                    studentData.monthlyFee ||
                    1000
                  ),

                paidAmount:
                  paidAmount

              };

            }
          );


        setStudents(
          studentList
        );

      }
      catch (error) {

        console.log(
          "Error loading fees:",
          error
        );


        alert(
          "Error loading fee information."
        );

      }
      finally {

        setLoading(false);

      }

    };


  const savePayment =
    async () => {

      if (
        !selectedStudent
      ) {

        alert(
          "Please select a student."
        );

        return;

      }


      if (
        !payAmount
      ) {

        alert(
          "Enter Amount."
        );

        return;

      }


      const amount =
        Number(
          payAmount
        );


      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {

        alert(
          "Please enter a valid amount."
        );

        return;

      }


      const pending =
        selectedStudent.totalFee -
        selectedStudent.paidAmount;


      if (
        amount >
        pending
      ) {

        alert(
          "Amount exceeds pending fee."
        );

        return;

      }


      if (!madrasaId) {

        alert(
          "Madrasa account not found."
        );

        return;

      }


      try {

        setSaving(true);


        // ==========================
        // SECURITY CHECK
        // ==========================

        const currentStudent =
          students.find(
            (student) =>

              student.id ===
              selectedStudent.id

          );


        if (
          !currentStudent ||
          currentStudent.madrasaId !==
            madrasaId
        ) {

          alert(
            "You do not have permission to collect fees for this student."
          );

          return;

        }


        const receiptNumber =
          "REC-" +
          Date.now();


        await addDoc(
          collection(
            db,
            "fees"
          ),
          {

            madrasaId:
              madrasaId,

            studentId:
              selectedStudent.id,

            studentName:
              selectedStudent.studentName ||
              "",

            fatherName:
              selectedStudent.fatherName ||
              "",

            mobileNumber:
              selectedStudent.mobileNumber ||
              "",

            studentClass:
              selectedStudent.studentClass ||
              "",

            amount:
              amount,

            paymentMethod:
              paymentMethod,

            receiptNumber:
              receiptNumber,

            month:
              new Date()
                .getMonth() + 1,

            year:
              new Date()
                .getFullYear(),

            paymentDate:
              new Date()
                .toLocaleDateString(
                  "en-IN"
                ),

            paymentDateISO:
              new Date()
                .toISOString()
                .split("T")[0],

            createdAt:
              new Date()

          }
        );


        // ==========================
        // UPDATE SCREEN
        // ==========================

        setStudents(
          (currentStudents) =>

            currentStudents.map(
              (student) =>

                student.id ===
                selectedStudent.id

                  ? {

                      ...student,

                      paidAmount:

                        student.paidAmount +
                        amount

                    }

                  : student

            )

        );


        setPayAmount(
          ""
        );


        setPaymentMethod(
          "Cash"
        );


        setSelectedStudent(
          null
        );


        alert(
          "Payment Saved Successfully ✅"
        );

      }
      catch (error) {

        console.log(
          "Payment error:",
          error
        );


        alert(
          "Payment Failed."
        );

      }
      finally {

        setSaving(false);

      }

    };


  const filteredStudents =
    students.filter(
      (student) => {

        const value =
          search
            .toLowerCase()
            .trim();


        const matchesSearch =

          student.studentName
            ?.toLowerCase()
            .includes(
              value
            ) ||

          student.fatherName
            ?.toLowerCase()
            .includes(
              value
            ) ||

          student.mobileNumber
            ?.toString()
            .includes(
              value
            );


        const matchesFilter =

          filter ===
          "All"

            ? true

            : filter ===
              "Paid"

            ? student.paidAmount >=
              student.totalFee

            : student.paidAmount <
              student.totalFee;


        return (
          matchesSearch &&
          matchesFilter
        );

      }
    );


  const totalStudents =
    students.length;


  const totalCollection =
    students.reduce(
      (
        total,
        student
      ) =>

        total +
        student.paidAmount,

      0
    );


  const totalPending =
    students.reduce(
      (
        total,
        student
      ) =>

        total +
        Math.max(
          student.totalFee -
          student.paidAmount,
          0
        ),

      0
    );


  const paidStudents =
    students.filter(
      (student) =>

        student.paidAmount >=
        student.totalFee

    ).length;


  const pendingStudents =
    students.filter(
      (student) =>

        student.paidAmount <
        student.totalFee

    ).length;


  const exportExcel =
    () => {

      if (
        filteredStudents.length ===
        0
      ) {

        alert(
          "No fee records to export."
        );

        return;

      }


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

            TotalFee:
              student.totalFee,

            Paid:
              student.paidAmount,

            Pending:
              Math.max(
                student.totalFee -
                student.paidAmount,
                0
              )

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
          "Fees Report"
        );


      XLSX.writeFile(
        workbook,
        "Fees_Report.xlsx"
      );

    };


  const exportPdf =
    () => {

      if (
        filteredStudents.length ===
        0
      ) {

        alert(
          "No fee records to export."
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
        "Fees Report",
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

            student.totalFee,

            student.paidAmount,

            Math.max(
              student.totalFee -
              student.paidAmount,
              0
            )

          ]
        );


      autoTable(
        pdfDocument,
        {

          head: [[

            "Student",
            "Father",
            "Total",
            "Paid",
            "Pending"

          ]],

          body:
            tableData,

          startY:
            40

        }
      );


      pdfDocument.save(
        "Fees_Report.pdf"
      );

    };


  if (loading) {

    return (

      <Layout>

        <div className="accounts-page">

          <h1>
            Loading Fees...
          </h1>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">


        <h1>
          💰 Fees & Payments
        </h1>


        <div className="attendance-summary">


          <div className="summary-card">

            <h2>
              {totalStudents}
            </h2>

            <p>
              👨‍🎓 Students
            </p>

          </div>


          <div className="summary-card">

            <h2>
              ₹{totalCollection}
            </h2>

            <p>
              💰 Collection
            </p>

          </div>


          <div className="summary-card">

            <h2>
              ₹{totalPending}
            </h2>

            <p>
              ⏳ Pending
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {paidStudents}
            </h2>

            <p>
              🟢 Paid
            </p>

          </div>


          <div className="summary-card">

            <h2>
              {pendingStudents}
            </h2>

            <p>
              🔴 Unpaid
            </p>

          </div>


        </div>


        <input

          type="text"

          placeholder="🔍 Search by Name, Father or Phone..."

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
                "Paid"
              )
            }
          >

            Paid

          </button>


          <button
            onClick={() =>
              setFilter(
                "Pending"
              )
            }
          >

            Pending

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
                  Total Fee
                </th>

                <th>
                  Paid
                </th>

                <th>
                  Pending
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

                filteredStudents.length ===
                0

                  ? (

                    <tr>

                      <td

                        colSpan="7"

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

                            {
                              student.studentName ||
                              "N/A"
                            }

                          </td>


                          <td>

                            {
                              student.fatherName ||
                              "N/A"
                            }

                          </td>


                          <td>

                            ₹{
                              student.totalFee
                            }

                          </td>


                          <td>

                            ₹{
                              student.paidAmount
                            }

                          </td>


                          <td>

                            ₹{
                              Math.max(
                                student.totalFee -
                                student.paidAmount,
                                0
                              )
                            }

                          </td>


                          <td>


                            {

                              student.paidAmount <=
                              0

                                ? "🔴 Pending"

                                : student.paidAmount <
                                  student.totalFee

                                ? "🟡 Partial"

                                : "🟢 Paid"

                            }


                          </td>


                          <td>


                            <button

                              disabled={
                                student.paidAmount >=
                                student.totalFee
                              }

                              onClick={() =>
                                setSelectedStudent(
                                  student
                                )
                              }

                            >


                              {

                                student.paidAmount >=
                                student.totalFee

                                  ? "✅ Paid"

                                  : "💳 Collect Fee"

                              }


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


        {

          selectedStudent && (

            <div className="payment-modal">


              <div className="payment-box">


                <h2>
                  💰 Collect Fee
                </h2>


                <p>

                  Student:{" "}

                  {
                    selectedStudent.studentName
                  }

                </p>


                <p>

                  Father:{" "}

                  {
                    selectedStudent.fatherName ||
                    "N/A"
                  }

                </p>


                <p>

                  Pending: ₹

                  {
                    Math.max(
                      selectedStudent.totalFee -
                      selectedStudent.paidAmount,
                      0
                    )
                  }

                </p>


                <div className="payment-methods">


                  <button

                    className="payment-option-btn"

                    onClick={() =>
                      setPaymentMethod(
                        "UPI"
                      )
                    }

                  >

                    📱 UPI

                  </button>


                  <button

                    className="payment-option-btn"

                    onClick={() =>
                      setPaymentMethod(
                        "Cash"
                      )
                    }

                  >

                    💵 Cash

                  </button>


                  <button

                    className="payment-option-btn"

                    onClick={() =>
                      setPaymentMethod(
                        "Bank"
                      )
                    }

                  >

                    🏦 Bank

                  </button>


                </div>


                <p>

                  Method:{" "}

                  <b>
                    {paymentMethod}
                  </b>

                </p>


                <input

                  type="number"

                  min="1"

                  placeholder="Enter Amount"

                  className="attendance-search"

                  value={
                    payAmount
                  }

                  onChange={(event) =>
                    setPayAmount(
                      event.target.value
                    )
                  }

                />


                <div className="payment-buttons">


                  <button

                    className="save-all-btn"

                    onClick={
                      savePayment
                    }

                    disabled={
                      saving
                    }

                  >


                    {

                      saving

                        ? "Saving Payment..."

                        : "Save Payment"

                    }


                  </button>


                  <button

                    className="mark-all-btn"

                    disabled={
                      saving
                    }

                    onClick={() => {

                      setSelectedStudent(
                        null
                      );

                      setPayAmount(
                        ""
                      );

                      setPaymentMethod(
                        "Cash"
                      );

                    }}

                  >

                    Cancel

                  </button>


                </div>


              </div>


            </div>

          )

        }


      </div>

    </Layout>

  );

}


export default Fees;