import {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function ExpenseReport() {

  const [expenses,
    setExpenses] =
    useState([]);

  const [searchDate,
    setSearchDate] =
    useState("");

  useEffect(() => {

    fetchExpenses();

  }, []);

  const fetchExpenses =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "expenses"
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

        setExpenses(
          list
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const totalExpenses =
    expenses.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.amount || 0
        ),
      0
    );

  const todayExpenses =
    expenses
      .filter(
        (item) =>
          item.date ===
          today
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.amount || 0
          ),
        0
      );

  const currentMonth =
    new Date()
      .getMonth();

  const currentYear =
    new Date()
      .getFullYear();

  const monthExpenses =
    expenses
      .filter(
        (item) => {

          if (
            !item.date
          )
            return false;

          const d =
            new Date(
              item.date
            );

          return (
            d.getMonth() ===
              currentMonth &&
            d.getFullYear() ===
              currentYear
          );

        }
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.amount || 0
          ),
        0
      );

  const totalCategories =
    new Set(
      expenses.map(
        (item) =>
          item.category
      )
    ).size;

  const averageExpense =
    expenses.length === 0
      ? 0
      : Math.round(
          totalExpenses /
          expenses.length
        );

  const highestExpense =
    expenses.length === 0
      ? 0
      : Math.max(
          ...expenses.map(
            (item) =>
              Number(
                item.amount || 0
              )
          )
        );

  const filteredExpenses =
    searchDate
      ? expenses.filter(
          (item) =>
            item.date ===
            searchDate
        )
      : expenses;

  const exportExcel =
    () => {

      const data =
        filteredExpenses.map(
          (item) => ({
            Category:
              item.category ||
              "N/A",

            Description:
              item.description ||
              "N/A",

            Amount:
              item.amount || 0,

            Date:
              item.date ||
              "N/A"
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
          "Expenses"
        );

      XLSX.writeFile(
        workbook,
        "Expense_Report.xlsx"
      );

    };

  const downloadPDF =
    () => {

      const pdf =
        new jsPDF();

      pdf.text(
        "Expense Report",
        14,
        20
      );

      pdf.autoTable({

        startY: 35,

        head: [[
          "Category",
          "Description",
          "Amount",
          "Date"
        ]],

        body:
          filteredExpenses.map(
            (item) => [

              item.category ||
              "N/A",

              item.description ||
              "N/A",

              `₹${item.amount}`,

              item.date ||
              "N/A"
            ]
          )
      });

      pdf.save(
        "Expense_Report.pdf"
      );

    };

  const printReport =
    () => {

      window.print();

    };

  const refreshReport =
    () => {

      fetchExpenses();

    };

  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          📉 Expense Report
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap:
              "wrap",
            marginBottom:
              "20px"
          }}
        >

          <button
            className="save-all-btn"
            onClick={
              exportExcel
            }
          >
            📥 Export Excel
          </button>

          <button
            className="save-all-btn"
            onClick={
              downloadPDF
            }
          >
            📄 Download PDF
          </button>

          <button
            className="save-all-btn"
            onClick={
              printReport
            }
          >
            🖨 Print
          </button>

          <button
            className="save-all-btn"
            onClick={
              refreshReport
            }
          >
            🔄 Refresh
          </button>

        </div>

        <div className="attendance-summary">

          <div className="summary-card">
            <h2>
              ₹{totalExpenses}
            </h2>
            <p>
              Total Expenses
            </p>
          </div>

          <div className="summary-card">
            <h2>
              ₹{todayExpenses}
            </h2>
            <p>
              Today's Expenses
            </p>
          </div>

          <div className="summary-card">
            <h2>
              ₹{monthExpenses}
            </h2>
            <p>
              This Month
            </p>
          </div>

          <div className="summary-card">
            <h2>
              {totalCategories}
            </h2>
            <p>
              Categories
            </p>
          </div>

          <div className="summary-card">
            <h2>
              ₹{averageExpense}
            </h2>
            <p>
              Average Expense
            </p>
          </div>

          <div className="summary-card">
            <h2>
              ₹{highestExpense}
            </h2>
            <p>
              Highest Expense
            </p>
          </div>

        </div>

        <div className="module-card">

          <h2>
            Search By Date
          </h2>

          <input
            type="date"
            className="attendance-search"
            value={
              searchDate
            }
            onChange={(e) =>
              setSearchDate(
                e.target.value
              )
            }
          />

        </div>

        <div
          className="attendance-table-container"
        >

          <h2
            style={{
              marginBottom:
                "20px"
            }}
          >
            Recent Expenses
          </h2>

          <table
            className="attendance-table"
          >

            <thead>

              <tr>

                <th>
                  Category
                </th>

                <th>
                  Description
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {
                filteredExpenses.length ===
                0
                  ? (
                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign:
                            "center"
                        }}
                      >
                        No Expenses Found
                      </td>

                    </tr>
                  )
                  : (
                    filteredExpenses.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            {
                              item.category ||
                              "N/A"
                            }
                          </td>

                          <td>
                            {
                              item.description ||
                              "N/A"
                            }
                          </td>

                          <td>
                            ₹
                            {
                              item.amount
                            }
                          </td>

                          <td>
                            {
                              item.date ||
                              "N/A"
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

export default ExpenseReport;