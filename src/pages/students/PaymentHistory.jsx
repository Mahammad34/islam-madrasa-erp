import {
  collection,
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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function PaymentHistory() {

  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  const [
    payments,
    setPayments
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const [
    paymentFilter,
    setPaymentFilter
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
    selectedPayment,
    setSelectedPayment
  ] = useState(null);

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

  const getNumber = (value) => {

    const convertedValue =
      Number(value);

const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

    return Number.isFinite(
      convertedValue
    )
      ? convertedValue
      : 0;

  };

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }
    ).format(
      getNumber(value)
    );

  };

  const getPaymentDate = (payment) => {

    return (
      payment.paymentDate ||
      payment.date ||
      ""
    );

  };

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

    const indianDateMatch =
      String(dateValue).match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (indianDateMatch) {

      const [
        ,
        day,
        month,
        year
      ] = indianDateMatch;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
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

  const fetchPayments = async (
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

      if (!madrasaId) {

  setPayments([]);

  setErrorMessage(
    "Madrasa account not found."
  );

  return;

}


const paymentsQuery =
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


const paymentSnapshot =
  await getDocs(
    paymentsQuery
  );

      const paymentList =
        paymentSnapshot.docs.map(
          (paymentDocument) => ({
            id: paymentDocument.id,
            ...paymentDocument.data()
          })
        );

      setPayments(paymentList);

    }
    catch (error) {

      console.error(
        "Error loading payment history:",
        error
      );

      setErrorMessage(
        "Unable to load payment history. Please try again."
      );

    }
    finally {

      setIsLoading(false);
      setIsRefreshing(false);

    }

  };

  useEffect(() => {

  fetchPayments();

}, [madrasaId]);

  const paymentMethods =
    useMemo(() => {

      return [
        ...new Set(
          payments
            .map(
              (payment) =>
                payment.paymentMethod
            )
            .filter(Boolean)
        )
      ].sort();

    }, [payments]);

  const filteredPayments =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const matchingPayments =
        payments.filter(
          (payment) => {

            const searchableText =
              [
                payment.receiptNumber,
                payment.studentName,
                payment.studentId,
                payment.admissionNumber,
                payment.fatherName,
                payment.mobileNumber,
                payment.paymentMethod,
                payment.amount
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

            const matchesPaymentMethod =
              paymentFilter === "All" ||
              payment.paymentMethod ===
                paymentFilter;

            const paymentDate =
              getDateInputValue(
                getPaymentDate(payment)
              );

            const matchesStartDate =
              !startDate ||
              (
                paymentDate &&
                paymentDate >= startDate
              );

            const matchesEndDate =
              !endDate ||
              (
                paymentDate &&
                paymentDate <= endDate
              );

            return (
              matchesSearch &&
              matchesPaymentMethod &&
              matchesStartDate &&
              matchesEndDate
            );

          }
        );

      return [
        ...matchingPayments
      ].sort(
        (
          firstPayment,
          secondPayment
        ) => {

          if (
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  getPaymentDate(
                    firstPayment
                  )
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  getPaymentDate(
                    secondPayment
                  )
                )?.getTime() || 0
              )
            );

          }

          if (
            sortOption === "highest"
          ) {

            return (
              getNumber(
                secondPayment.amount
              ) -
              getNumber(
                firstPayment.amount
              )
            );

          }

          if (
            sortOption === "lowest"
          ) {

            return (
              getNumber(
                firstPayment.amount
              ) -
              getNumber(
                secondPayment.amount
              )
            );

          }

          if (
            sortOption === "student"
          ) {

            return String(
              firstPayment.studentName ||
              ""
            ).localeCompare(
              String(
                secondPayment.studentName ||
                ""
              )
            );

          }

          return (
            (
              convertToDate(
                getPaymentDate(
                  secondPayment
                )
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                getPaymentDate(
                  firstPayment
                )
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      payments,
      searchTerm,
      paymentFilter,
      startDate,
      endDate,
      sortOption
    ]);

  const paymentStatistics =
    useMemo(() => {

      const totalCollection =
        filteredPayments.reduce(
          (total, payment) =>
            total +
            getNumber(
              payment.amount
            ),
          0
        );

      const today =
        new Date();

      const todayValue =
        `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(
          today.getDate()
        ).padStart(2, "0")}`;

      const todayCollection =
        payments
          .filter(
            (payment) =>
              getDateInputValue(
                getPaymentDate(payment)
              ) === todayValue
          )
          .reduce(
            (total, payment) =>
              total +
              getNumber(
                payment.amount
              ),
            0
          );

      const studentsPaid =
        new Set(
          filteredPayments
            .map(
              (payment) =>
                payment.studentId ||
                payment.studentName
            )
            .filter(Boolean)
        ).size;

      const averagePayment =
        filteredPayments.length > 0
          ? totalCollection /
            filteredPayments.length
          : 0;

      return {
        totalCollection,
        totalTransactions:
          filteredPayments.length,
        todayCollection,
        studentsPaid,
        averagePayment
      };

    }, [
      payments,
      filteredPayments
    ]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    paymentFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";

  const resetFilters = () => {

    setSearchTerm("");
    setPaymentFilter("All");
    setStartDate("");
    setEndDate("");
    setSortOption("newest");

  };

  const refreshPayments = async () => {

    await fetchPayments(true);

  };

  const exportExcel = () => {

    if (
      filteredPayments.length === 0
    ) {

      alert(
        "There are no payment records to export."
      );

      return;

    }

    const excelData =
      filteredPayments.map(
        (payment) => ({

          "Receipt Number":
            payment.receiptNumber ||
            "",

          "Student ID":
            payment.studentId ||
            "",

          "Student Name":
            payment.studentName ||
            "",

          "Father Name":
            payment.fatherName ||
            "",

          "Amount":
            getNumber(
              payment.amount
            ),

          "Payment Method":
            payment.paymentMethod ||
            "",

          "Payment Date":
            formatDate(
              getPaymentDate(payment)
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
      "Payments"
    );

    XLSX.writeFile(
      workbook,
      "Payment_History.xlsx"
    );

  };

  const exportPdf = () => {

    if (
      filteredPayments.length === 0
    ) {

      alert(
        "There are no payment records to export."
      );

      return;

    }

    const pdfDocument =
      new jsPDF({
        orientation: "landscape"
      });

    pdfDocument.setFontSize(18);

    pdfDocument.text(
      "Payment History Report",
      14,
      18
    );

    pdfDocument.setFontSize(10);

    pdfDocument.text(
      `Total Collection: Rs. ${paymentStatistics.totalCollection}`,
      14,
      26
    );

    const tableData =
      filteredPayments.map(
        (payment) => [

          payment.receiptNumber ||
            "N/A",

          payment.studentName ||
            "N/A",

          payment.fatherName ||
            "N/A",

          getNumber(
            payment.amount
          ),

          payment.paymentMethod ||
            "N/A",

          formatDate(
            getPaymentDate(payment)
          )

        ]
      );

    autoTable(
      pdfDocument,
      {
        head: [[
          "Receipt",
          "Student",
          "Father",
          "Amount",
          "Method",
          "Date"
        ]],

        body: tableData,

        startY: 32
      }
    );

    pdfDocument.save(
      "Payment_History.pdf"
    );

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
              💳 Payment History
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Search, filter, review, and export student fee payment records.
            </p>

          </div>


          <button
            type="button"
            onClick={refreshPayments}
            disabled={isRefreshing}
          >
            {
              isRefreshing
                ? "⏳ Refreshing..."
                : "🔄 Refresh"
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
                  Loading Payment History...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while payment records are loaded.
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
                        paymentStatistics.totalCollection
                      )
                    }
                  </h2>

                  <p>
                    💰 Filtered Collection
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      paymentStatistics.totalTransactions
                    }
                  </h2>

                  <p>
                    🧾 Transactions
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        paymentStatistics.todayCollection
                      )
                    }
                  </h2>

                  <p>
                    📅 Today's Collection
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      paymentStatistics.studentsPaid
                    }
                  </h2>

                  <p>
                    👨‍🎓 Students Paid
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        paymentStatistics.averagePayment
                      )
                    }
                  </h2>

                  <p>
                    📊 Average Payment
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
                      🔍 Search & Filter Payments
                    </h2>

                    <p style={{ margin: 0, color: "#64748b" }}>
                      Find transactions using receipt number, student details, payment method, or date.
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
                      Search Payment
                    </label>

                    <input
                      type="text"
                      placeholder="Receipt, student, ID, father, mobile..."
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
                      Payment Method
                    </label>

                    <select
                      value={paymentFilter}
                      onChange={(event) =>
                        setPaymentFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Methods
                      </option>

                      {
                        paymentMethods.map(
                          (method) => (

                            <option
                              key={method}
                              value={method}
                            >
                              {method}
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
                      Sort Payments
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

                      <option value="student">
                        Student Name
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
                    {filteredPayments.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {payments.length}
                  </strong>{" "}
                  payment records.
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
                      📤 Export Payment Records
                    </h2>

                    <p style={{ margin: 0, color: "#64748b" }}>
                      Export the currently filtered payment records.
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
                      onClick={exportPdf}
                    >
                      🖨 Export PDF
                    </button>

                  </div>

                </div>

              </div>


              {
                filteredPayments.length === 0 ? (

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
                        🧾
                      </div>

                      <h2>
                        No Payments Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          payments.length === 0
                            ? "No payment records have been added yet."
                            : "No payment records match the selected filters."
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

                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Receipt
                          </th>

                          <th>
                            Student
                          </th>

                          <th>
                            Student ID
                          </th>

                          <th>
                            Father
                          </th>

                          <th>
                            Amount
                          </th>

                          <th>
                            Method
                          </th>

                          <th>
                            Date
                          </th>

                          <th>
                            Action
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          filteredPayments.map(
                            (payment) => (

                              <tr key={payment.id}>

                                <td>

                                  <button
                                    type="button"
                                    className="student-link"
                                    onClick={() =>
                                      setSelectedPayment(
                                        payment
                                      )
                                    }
                                  >
                                    {
                                      payment.receiptNumber ||
                                      "View Receipt"
                                    }
                                  </button>

                                </td>


                                <td>
                                  {
                                    payment.studentName ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    payment.studentId ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    payment.fatherName ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  <strong>
                                    {
                                      formatCurrency(
                                        payment.amount
                                      )
                                    }
                                  </strong>
                                </td>


                                <td>
                                  {
                                    payment.paymentMethod ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    formatDate(
                                      getPaymentDate(
                                        payment
                                      )
                                    )
                                  }
                                </td>


                                <td>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedPayment(
                                        payment
                                      )
                                    }
                                  >
                                    👁 View
                                  </button>

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
                  to="/fees"
                  className="action-btn view-btn"
                >
                  💰 Fees Module
                </Link>

              </div>

            </>

          )
        }


        {
          selectedPayment && (

            <div
              className="modal-overlay"
              onClick={() =>
                setSelectedPayment(null)
              }
            >

              <div
                className="modal-card"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    marginBottom: "20px"
                  }}
                >

                  <div>

                    <h2 style={{ margin: "0 0 6px" }}>
                      🧾 Payment Receipt
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Student fee payment details
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPayment(null)
                    }
                  >
                    ✖
                  </button>

                </div>


                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    marginBottom: "16px"
                  }}
                >

                  <p>
                    <strong>
                      Receipt Number:
                    </strong>{" "}
                    {
                      selectedPayment.receiptNumber ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Student:
                    </strong>{" "}
                    {
                      selectedPayment.studentName ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Student ID:
                    </strong>{" "}
                    {
                      selectedPayment.studentId ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Admission Number:
                    </strong>{" "}
                    {
                      selectedPayment.admissionNumber ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Father:
                    </strong>{" "}
                    {
                      selectedPayment.fatherName ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Amount:
                    </strong>{" "}
                    {
                      formatCurrency(
                        selectedPayment.amount
                      )
                    }
                  </p>


                  <p>
                    <strong>
                      Payment Method:
                    </strong>{" "}
                    {
                      selectedPayment.paymentMethod ||
                      "N/A"
                    }
                  </p>


                  <p>
                    <strong>
                      Payment Date:
                    </strong>{" "}
                    {
                      formatDate(
                        getPaymentDate(
                          selectedPayment
                        )
                      )
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedPayment(null)
                  }
                  style={{
                    width: "100%"
                  }}
                >
                  Close Receipt
                </button>

              </div>

            </div>

          )
        }


        <div style={{ height: "50px" }} />

      </div>

    </Layout>

  );

}

export default PaymentHistory;