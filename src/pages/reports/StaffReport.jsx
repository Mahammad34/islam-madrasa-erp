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

function StaffReport() {

  const [
    staff,
    setStaff
  ] = useState([]);

  const [
    attendance,
    setAttendance
  ] = useState([]);

  const [
    salary,
    setSalary
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter
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
  // FORMAT CURRENCY
  // ============================================================

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
        staffSnapshot,
        attendanceSnapshot,
        salarySnapshot
      ] = await Promise.all([

        getDocs(
          collection(
            db,
            "staff"
          )
        ),

        getDocs(
          collection(
            db,
            "staffAttendance"
          )
        ),

        getDocs(
          collection(
            db,
            "staffSalary"
          )
        )

      ]);


      const staffList =
        staffSnapshot.docs.map(
          (staffDocument) => ({

            id:
              staffDocument.id,

            ...staffDocument.data()

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


      const salaryList =
        salarySnapshot.docs.map(
          (salaryDocument) => ({

            id:
              salaryDocument.id,

            ...salaryDocument.data()

          })
        );


      setStaff(
        staffList
      );

      setAttendance(
        attendanceList
      );

      setSalary(
        salaryList
      );

    }
    catch (error) {

      console.error(
        "Error loading staff report:",
        error
      );

      setErrorMessage(
        "Unable to load staff report. Please try again."
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
  // AVAILABLE ROLES
  // ============================================================

  const availableRoles =
    useMemo(() => {

      return [
        ...new Set(
          staff
            .map(
              (staffMember) =>
                staffMember.role ||
                staffMember.position
            )
            .filter(Boolean)
        )
      ].sort();

    }, [staff]);


  // ============================================================
  // FILTER & SORT STAFF
  // ============================================================

  const filteredStaff =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();


      const matchingStaff =
        staff.filter(
          (staffMember) => {

            const searchableText =
              [

                staffMember.staffName,

                staffMember.staffId,

                staffMember.role,

                staffMember.position,

                staffMember.phone,

                staffMember.mobileNumber,

                staffMember.email,

                staffMember.aadhaarNumber,

                staffMember.address

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


            const staffRole =
              staffMember.role ||
              staffMember.position ||
              "Not Assigned";


            const matchesRole =
              roleFilter === "All" ||
              staffRole ===
                roleFilter;


            const staffStatus =
              staffMember.status ||
              "Active";


            const matchesStatus =
              statusFilter === "All" ||
              staffStatus ===
                statusFilter;


            const joiningDate =
              getDateInputValue(
                staffMember.joiningDate
              );


            const matchesStartDate =
              !startDate ||
              (
                joiningDate &&
                joiningDate >= startDate
              );


            const matchesEndDate =
              !endDate ||
              (
                joiningDate &&
                joiningDate <= endDate
              );


            return (
              matchesSearch &&
              matchesRole &&
              matchesStatus &&
              matchesStartDate &&
              matchesEndDate
            );

          }
        );


      return [
        ...matchingStaff
      ].sort(
        (
          firstStaff,
          secondStaff
        ) => {

          if (
            sortOption === "oldest"
          ) {

            return (
              (
                convertToDate(
                  firstStaff.joiningDate
                )?.getTime() || 0
              ) -
              (
                convertToDate(
                  secondStaff.joiningDate
                )?.getTime() || 0
              )
            );

          }


          if (
            sortOption === "name"
          ) {

            return String(
              firstStaff.staffName ||
              ""
            ).localeCompare(
              String(
                secondStaff.staffName ||
                ""
              )
            );

          }


          if (
            sortOption === "role"
          ) {

            return String(
              firstStaff.role ||
              firstStaff.position ||
              ""
            ).localeCompare(
              String(
                secondStaff.role ||
                secondStaff.position ||
                ""
              )
            );

          }


          if (
            sortOption === "salary-high"
          ) {

            return (
              getNumber(
                secondStaff.salary
              ) -
              getNumber(
                firstStaff.salary
              )
            );

          }


          if (
            sortOption === "salary-low"
          ) {

            return (
              getNumber(
                firstStaff.salary
              ) -
              getNumber(
                secondStaff.salary
              )
            );

          }


          return (
            (
              convertToDate(
                secondStaff.joiningDate
              )?.getTime() || 0
            ) -
            (
              convertToDate(
                firstStaff.joiningDate
              )?.getTime() || 0
            )
          );

        }
      );

    }, [
      staff,
      searchTerm,
      roleFilter,
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


      const totalStaff =
        staff.length;


      const activeStaff =
        staff.filter(
          (staffMember) =>
            (
              staffMember.status ||
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


      const newStaff =
        staff.filter(
          (staffMember) => {

            const joiningDate =
              convertToDate(
                staffMember.joiningDate
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


      const salaryPaid =
        salary.filter(
          (salaryRecord) =>
            salaryRecord.status ===
            "Paid"
        ).length;


      const salaryPending =
        salary.filter(
          (salaryRecord) =>
            salaryRecord.status ===
            "Pending"
        ).length;


      const totalSalaryPaid =
        salary
          .filter(
            (salaryRecord) =>
              salaryRecord.status ===
              "Paid"
          )
          .reduce(
            (total, salaryRecord) =>
              total +
              getNumber(
                salaryRecord.amount ??
                salaryRecord.salaryAmount ??
                salaryRecord.salary
              ),
            0
          );


      return {

        totalStaff,

        activeStaff,

        presentToday,

        absentToday,

        newStaff,

        salaryPaid,

        salaryPending,

        totalSalaryPaid

      };

    }, [
      staff,
      attendance,
      salary
    ]);


  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    roleFilter !== "All" ||
    statusFilter !== "All" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    sortOption !== "newest";


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {

    setSearchTerm("");

    setRoleFilter("All");

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
      filteredStaff.length === 0
    ) {

      alert(
        "There are no staff records to export."
      );

      return;

    }


    const excelData =
      filteredStaff.map(
        (staffMember) => ({

          "Staff ID":
            staffMember.staffId ||
            "N/A",

          "Staff Name":
            staffMember.staffName ||
            "N/A",

          Role:
            staffMember.role ||
            staffMember.position ||
            "N/A",

          Phone:
            staffMember.phone ||
            staffMember.mobileNumber ||
            "N/A",

          Email:
            staffMember.email ||
            "N/A",

          Salary:
            getNumber(
              staffMember.salary
            ),

          Status:
            staffMember.status ||
            "Active",

          "Joining Date":
            formatDate(
              staffMember.joiningDate
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
      "Staff Report"
    );


    XLSX.writeFile(
      workbook,
      "Staff_Report.xlsx"
    );

  };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF = () => {

    if (
      filteredStaff.length === 0
    ) {

      alert(
        "There are no staff records to export."
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
      "Staff Report",
      14,
      18
    );


    pdfDocument.setFontSize(
      10
    );


    pdfDocument.text(
      `Total Staff: ${filteredStaff.length}`,
      14,
      26
    );


    const tableData =
      filteredStaff.map(
        (staffMember) => [

          staffMember.staffId ||
            "N/A",

          staffMember.staffName ||
            "N/A",

          staffMember.role ||
            staffMember.position ||
            "N/A",

          staffMember.phone ||
            staffMember.mobileNumber ||
            "N/A",

          getNumber(
            staffMember.salary
          ),

          staffMember.status ||
            "Active",

          formatDate(
            staffMember.joiningDate
          )

        ]
      );


    autoTable(
      pdfDocument,
      {

        head: [[

          "Staff ID",

          "Staff Name",

          "Role",

          "Phone",

          "Salary",

          "Status",

          "Joining Date"

        ]],

        body:
          tableData,

        startY:
          32

      }
    );


    pdfDocument.save(
      "Staff_Report.pdf"
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
              👳 Staff Report
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Review staff records, attendance, salaries, and employment information.
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
                  Loading Staff Report...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff records are loaded.
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
                    {reportStatistics.totalStaff}
                  </h2>

                  <p>
                    👳 Total Staff
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.activeStaff}
                  </h2>

                  <p>
                    ✅ Active Staff
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
                    {reportStatistics.newStaff}
                  </h2>

                  <p>
                    🆕 New Staff
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.salaryPaid}
                  </h2>

                  <p>
                    💰 Salaries Paid
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {reportStatistics.salaryPending}
                  </h2>

                  <p>
                    ⏳ Salaries Pending
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        reportStatistics.totalSalaryPaid
                      )
                    }
                  </h2>

                  <p>
                    💵 Total Salary Paid
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
                      🔍 Search & Filter Staff
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search staff and filter records by role, status, and joining date.
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
                      Search Staff
                    </label>

                    <input
                      type="text"
                      placeholder="Name, ID, role, phone..."
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
                      Staff Role
                    </label>

                    <select
                      value={roleFilter}
                      onChange={(event) =>
                        setRoleFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Roles
                      </option>

                      {
                        availableRoles.map(
                          (staffRole) => (

                            <option
                              key={staffRole}
                              value={staffRole}
                            >
                              {staffRole}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Staff Status
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
                      Sort Staff
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
                        Newest Staff
                      </option>

                      <option value="oldest">
                        Oldest Staff
                      </option>

                      <option value="name">
                        Staff Name
                      </option>

                      <option value="role">
                        Staff Role
                      </option>

                      <option value="salary-high">
                        Highest Salary
                      </option>

                      <option value="salary-low">
                        Lowest Salary
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
                    {filteredStaff.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {staff.length}
                  </strong>{" "}
                  staff records.
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
                      📤 Export Staff Report
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Export or print the currently filtered staff records.
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
                filteredStaff.length === 0 ? (

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
                        👳
                      </div>

                      <h2>
                        No Staff Records Found
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        {
                          staff.length === 0
                            ? "No staff members have been registered yet."
                            : "No staff records match the selected filters."
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
                          📋 Staff Records
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Complete staff employment and salary information.
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
                        Showing {filteredStaff.length} Records
                      </div>

                    </div>


                    <table className="attendance-table">

                      <thead>

                        <tr>

                          <th>
                            Staff
                          </th>

                          <th>
                            Staff ID
                          </th>

                          <th>
                            Role
                          </th>

                          <th>
                            Phone
                          </th>

                          <th>
                            Salary
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
                          filteredStaff.map(
                            (staffMember) => (

                              <tr key={staffMember.id}>

                                <td>

                                  <strong>
                                    {
                                      staffMember.staffName ||
                                      "N/A"
                                    }
                                  </strong>

                                  {
                                    staffMember.email && (

                                      <div
                                        style={{
                                          marginTop: "4px",
                                          fontSize: "12px",
                                          color: "#64748b"
                                        }}
                                      >
                                        {staffMember.email}
                                      </div>

                                    )
                                  }

                                </td>


                                <td>
                                  {
                                    staffMember.staffId ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    staffMember.role ||
                                    staffMember.position ||
                                    "N/A"
                                  }
                                </td>


                                <td>
                                  {
                                    staffMember.phone ||
                                    staffMember.mobileNumber ||
                                    "N/A"
                                  }
                                </td>


                                <td>

                                  <strong>
                                    {
                                      formatCurrency(
                                        staffMember.salary
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
                                          staffMember.status ||
                                          "Active"
                                        ) === "Active"
                                          ? "#dcfce7"
                                          : "#fee2e2",
                                      color:
                                        (
                                          staffMember.status ||
                                          "Active"
                                        ) === "Active"
                                          ? "#166534"
                                          : "#991b1b"
                                    }}
                                  >
                                    {
                                      staffMember.status ||
                                      "Active"
                                    }
                                  </span>

                                </td>


                                <td>
                                  {
                                    formatDate(
                                      staffMember.joiningDate
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
                  to="/staff"
                  className="action-btn view-btn"
                >
                  👳 Staff Module
                </Link>


                <Link
                  to="/add-staff"
                  className="action-btn view-btn"
                >
                  ➕ Add Staff
                </Link>


                <Link
                  to="/staff-attendance"
                  className="action-btn view-btn"
                >
                  📅 Staff Attendance
                </Link>


                <Link
                  to="/staff-salary"
                  className="action-btn view-btn"
                >
                  💰 Staff Salary
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

export default StaffReport;