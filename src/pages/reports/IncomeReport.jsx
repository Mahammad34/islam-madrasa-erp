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

function IncomeReport() {

  const [
    incomes,
    setIncomes
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter
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
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    ).format(
      getNumber(value)
    );

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
  // FETCH INCOME
  // ============================================================

  const fetchIncome = async (
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

      const incomeSnapshot =
        await getDocs(
          collection(
            db,
            "income"
          )
        );

      const incomeList =
        incomeSnapshot.docs.map(
          (incomeDocument) => ({
            id: incomeDocument.id,
            ...incomeDocument.data()
          })
        );

      setIncomes(
        incomeList
      );

    }
    catch (error) {

      console.error(
        "Error loading income report:",
        error
      );

      setErrorMessage(
        "Unable to load income records. Please try again."
      );

    }
    finally {

      setIsLoading(false);
      setIsRefreshing(false);

    }

  };


  // ============================================================
  // LOAD INCOME
  // ============================================================

  useEffect(() => {

    fetchIncome();

  }, []);


  // ============================================================
  // AVAILABLE CATEGORIES
  // ============================================================

  const incomeCategories =
    useMemo(() => {

      return [
        ...new Set(
          incomes
            .map(
              (income) =>
                income.category ||
                income.source
            )
            .filter(Boolean)
        )
      ].sort();

    }, [incomes]);


  // ============================================================
  // FILTER & SORT INCOME
  // ============================================================

  const filteredIncome =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const matchingIncome =
        incomes.filter(
          (income) => {

            const searchableText =
              [
                income.category,
                income.source,
                income.description,
                income.donorName,
                income.amount,
                income.date
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

            const incomeCategory =
              income.category ||
              income.source ||
              "Uncategorized";

            const matchesCategory =
              categoryFilter === "All" ||
              incomeCategory ===
                categoryFilter;

            const incomeDate =
              getDateInputValue(
                income.date
              );

            const matchesStartDate =
              !startDate ||
              (
                incomeDate &&
                incomeDate >= startDate
              );

            const matchesEndDate =
              !endDate ||
              (
                incomeDate &&
                incomeDate <= endDate
              );

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStartDate &&
              matchesEndDate
            );

          }
        );

      return [
        ...matchingIncome
      ].sort(
        (
          firstIncome,
          secondIncome
        ) => {

          if (
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  firstIncome.date
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  secondIncome.date
                )?.getTime() || 0
              )
            );

          }

          if (
            sortOption === "highest"
          ) {

            return (
              getNumber(
                secondIncome.amount
              ) -
              getNumber(
                firstIncome.amount
              )
            );

          }

          if (
            sortOption === "lowest"
          ) {

            return (
              getNumber(
                firstIncome.amount
              ) -
              getNumber(
                secondIncome.amount
              )
            );

          }

          if (
            sortOption === "category"
          ) {

            return String(
              firstIncome.category ||
              firstIncome.source ||
              ""
            ).localeCompare(
              String(
                secondIncome.category ||
                secondIncome.source ||
                ""
              )
            );

          }

          return (
            (
              convertToDate(
                secondIncome.date
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                firstIncome.date
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      incomes,
      searchTerm,
      categoryFilter,
      startDate,
      endDate,
      sortOption
    ]);


  // ============================================================
  // REPORT STATISTICS
  // ============================================================

  const reportStatistics =
    useMemo(() => {

      const totalIncome =
        filteredIncome.reduce(
          (total, income) =>
            total +
            getNumber(
              income.amount
            ),
          0
        );

      const today =
        getDateInputValue(
          new Date()
        );

      const todayIncome =
        incomes
          .filter(
            (income) =>
              getDateInputValue(
                income.date
              ) === today
          )
          .reduce(
            (total, income) =>
              total +
              getNumber(
                income.amount
              ),
            0
          );

      const currentDate =
        new Date();

      const currentMonth =
        currentDate.getMonth();

      const currentYear =
        currentDate.getFullYear();

      const monthIncome =
        incomes
          .filter(
            (income) => {

              const incomeDate =
                convertToDate(
                  income.date
                );

              if (!incomeDate) {
                return false;
              }

              return (
                incomeDate.getMonth() ===
                  currentMonth &&
                incomeDate.getFullYear() ===
                  currentYear
              );

            }
          )
          .reduce(
            (total, income) =>
              total +
              getNumber(
                income.amount
              ),
            0
          );

      const totalCategories =
        new Set(
          filteredIncome
            .map(
              (income) =>
                income.category ||
                income.source
            )
            .filter(Boolean)
        ).size;

      const averageIncome =
        filteredIncome.length > 0
          ? totalIncome /
            filteredIncome.length
          : 0;

      const highestIncome =
        filteredIncome.length > 0
          ? Math.max(
              ...filteredIncome.map(
                (income) =>
                  getNumber(
                    income.amount
                  )
              )
            )
          : 0;

      return {
        totalIncome,
        todayIncome,
        monthIncome,
        totalCategories,
        averageIncome,
        highestIncome
      };

    }, [
      incomes,
      filteredIncome
    ]);


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    categoryFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {

    setSearchTerm("");
    setCategoryFilter("All");
    setStartDate("");
    setEndDate("");
    setSortOption("newest");

  };


  // ============================================================
  // REFRESH REPORT
  // ============================================================

  const refreshReport = async () => {

    await fetchIncome(true);

  };


  // ============================================================
  // EXPORT EXCEL
  // ============================================================

  const exportExcel = () => {

    if (
      filteredIncome.length === 0
    ) {

      alert(
        "There are no income records to export."
      );

      return;

    }

    const excelData =
      filteredIncome.map(
        (income) => ({

          Category:
            income.category ||
            income.source ||
            "N/A",

          Description:
            income.description ||
            "N/A",

          "Donor Name":
            income.donorName ||
            "N/A",

          Amount:
            getNumber(
              income.amount
            ),

          Date:
            formatDate(
              income.date
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
      "Income Report"
    );

    XLSX.writeFile(
      workbook,
      "Income_Report.xlsx"
    );

  };


  // ============================================================
  // EXPORT PDF
  // ============================================================

  const downloadPDF = () => {

    if (
      filteredIncome.length === 0
    ) {

      alert(
        "There are no income records to export."
      );

      return;

    }

    const pdfDocument =
      new jsPDF({
        orientation: "landscape"
      });

    pdfDocument.setFontSize(18);

    pdfDocument.text(
      "Income Report",
      14,
      18
    );

    pdfDocument.setFontSize(10);

    pdfDocument.text(
      `Total Income: Rs. ${reportStatistics.totalIncome}`,
      14,
      26
    );

    const tableData =
      filteredIncome.map(
        (income) => [

          income.category ||
            income.source ||
            "N/A",

          income.description ||
            "N/A",

          income.donorName ||
            "N/A",

          getNumber(
            income.amount
          ),

          formatDate(
            income.date
          )

        ]
      );

    autoTable(
      pdfDocument,
      {

        head: [[
          "Category",
          "Description",
          "Donor",
          "Amount",
          "Date"
        ]],

        body:
          tableData,

        startY:
          32

      }
    );

    pdfDocument.save(
      "Income_Report.pdf"
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
              📈 Income Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review, filter, analyze, and export Madrasa income records.
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
                  Loading Income Report...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while income records are loaded.
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
                    {
                      formatCurrency(
                        reportStatistics.totalIncome
                      )
                    }
                  </h2>

                  <p>
                    💰 Filtered Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.todayIncome
                      )
                    }
                  </h2>

                  <p>
                    📅 Today's Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.monthIncome
                      )
                    }
                  </h2>

                  <p>
                    🗓 This Month
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      reportStatistics.totalCategories
                    }
                  </h2>

                  <p>
                    📂 Categories
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.averageIncome
                      )
                    }
                  </h2>

                  <p>
                    📊 Average Income
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.highestIncome
                      )
                    }
                  </h2>

                  <p>
                    🏆 Highest Income
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
                      🔍 Search & Filter Income
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find income records using category, source, description, donor, amount, or date.
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
                      Search Income
                    </label>

                    <input
                      type="text"
                      placeholder="Category, source, donor, description..."
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
                      Income Category
                    </label>

                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Categories
                      </option>

                      {
                        incomeCategories.map(
                          (category) => (

                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Start Date
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
                      End Date
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
                      Sort Records
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

                      <option value="oldest">
                        Oldest First
                      </option>

                      <option value="highest">
                        Highest Amount
                      </option>

                      <option value="lowest">
                        Lowest Amount
                      </option>

                      <option value="category">
                        Category Name
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
                    {filteredIncome.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {incomes.length}
                  </strong>{" "}
                  income records.
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
                      📤 Export Income Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the currently filtered income records.
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
                filteredIncome.length === 0 ? (

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
                        📈
                      </div>

                      <h2>
                        No Income Records Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          incomes.length === 0
                            ? "No income records have been added yet."
                            : "No income records match the selected filters."
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
                          📋 Income Records
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete income transaction details.
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
                        Showing {filteredIncome.length} Records
                      </div>

                    </div>


                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Category
                          </th>

                          <th>
                            Description
                          </th>

                          <th>
                            Donor / Source
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
                          filteredIncome.map(
                            (income) => (

                              <tr key={income.id}>

                                <td>

                                  <strong>
                                    {
                                      income.category ||
                                      income.source ||
                                      "Uncategorized"
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    income.description ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    income.donorName ||
                                    income.source ||
                                    "N/A"
                                  }
                                </td>


                                <td>

                                  <strong>
                                    {
                                      formatCurrency(
                                        income.amount
                                      )
                                    }
                                  </strong>

                                </td>


                                <td>
                                  {
                                    formatDate(
                                      income.date
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
                  to="/accounts"
                  className="action-btn view-btn"
                >
                  💰 Accounts Dashboard
                </Link>


                <Link
                  to="/quick-income"
                  className="action-btn view-btn"
                >
                  💵 Add Income
                </Link>


                <Link
                  to="/income-history"
                  className="action-btn view-btn"
                >
                  📈 Income History
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

export default IncomeReport;