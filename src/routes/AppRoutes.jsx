import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";

// ======================
// AUTH PAGES
// ======================

import CreateMadrasa from "../pages/auth/CreateMadrasa";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../pages/auth/ProtectedRoute";
import Signup from "../pages/auth/Signup";

// ======================
// DASHBOARD
// ======================

import Dashboard from "../pages/dashboard/Dashboard";
import DemoDashboard from "../pages/public/DemoDashboard";

// ======================
// ACCOUNTS PAGES
// ======================

import Accounts from "../pages/accounts/Accounts";
import AccountsStaffSalary from "../pages/accounts/AccountsStaffSalary";
import Donors from "../pages/accounts/Donors";
import ExpenseHistory from "../pages/accounts/ExpenseHistory";
import IncomeHistory from "../pages/accounts/IncomeHistory";
import ManageCategories from "../pages/accounts/ManageCategories";
import MonthlyReport from "../pages/accounts/MonthlyReport";
import QuickExpense from "../pages/accounts/QuickExpense";
import QuickIncome from "../pages/accounts/QuickIncome";

// ======================
// STUDENTS PAGES
// ======================

import AddFee from "../pages/students/AddFee";
import AddHealthRecord from "../pages/students/AddHealthRecord";
import AddStudent from "../pages/students/AddStudent";
import AttendanceReports from "../pages/students/AttendanceReports";
import EditStudent from "../pages/students/EditStudent";
import FeeHistory from "../pages/students/FeeHistory";
import Fees from "../pages/students/Fees";
import GenerateIDCard from "../pages/students/GenerateIDCard";
import HealthHistory from "../pages/students/HealthHistory";
import HealthRecord from "../pages/students/HealthRecord";
import IDCard from "../pages/students/IDCard";
import Notifications from "../pages/students/Notifications";
import PaymentHistory from "../pages/students/PaymentHistory";
import SearchStudent from "../pages/students/SearchStudent";
import StudentAttendance from "../pages/students/StudentAttendance";
import StudentList from "../pages/students/StudentList";
import StudentProfile from "../pages/students/StudentProfile";
import Students from "../pages/students/Students";
import ViewIDCards from "../pages/students/ViewIDCards";

// ======================
// STAFF PAGES
// ======================

import AddSalary from "../pages/staff/AddSalary";
import AddStaff from "../pages/staff/AddStaff";
import EditStaff from "../pages/staff/EditStaff";
import LeaveManagement from "../pages/staff/LeaveManagement";
import MarkStaffAttendance from "../pages/staff/MarkStaffAttendance";
import Roles from "../pages/staff/Roles";
import SalaryHistory from "../pages/staff/SalaryHistory";
import SearchStaff from "../pages/staff/SearchStaff";
import Staff from "../pages/staff/Staff";
import StaffAttendance from "../pages/staff/StaffAttendance";
import StaffAttendanceHistory from "../pages/staff/StaffAttendanceHistory";
import StaffList from "../pages/staff/StaffList";
import StaffNotifications from "../pages/staff/StaffNotifications";
import StaffProfile from "../pages/staff/StaffProfile";
import StaffSalary from "../pages/staff/StaffSalary";

// ======================
// PARENTS
// ======================

import AddParent from "../pages/parents/AddParent";
import ContactDetails from "../pages/parents/ContactDetails";
import EditParent from "../pages/parents/EditParent";
import ParentAccounts from "../pages/parents/ParentAccounts";
import ParentList from "../pages/parents/ParentList";
import ParentNotifications from "../pages/parents/ParentNotifications";
import ParentProfile from "../pages/parents/ParentProfile";
import Parents from "../pages/parents/Parents";
import SearchParent from "../pages/parents/SearchParent";
import StudentMapping from "../pages/parents/StudentMapping";

// ======================
// DONATIONS
// ======================

import AddDonation from "../pages/donations/AddDonation";
import Campaigns from "../pages/donations/Campaigns";
import DonationHistory from "../pages/donations/DonationHistory";
import DonationList from "../pages/donations/DonationList";
import DonationProfile from "../pages/donations/DonationProfile";
import Donations from "../pages/donations/Donations";
import DonorsList from "../pages/donations/DonorsList";
import EditDonation from "../pages/donations/EditDonation";
import MonthlyDonationReport from "../pages/donations/MonthlyDonationReport";
import Receipts from "../pages/donations/Receipts";

// ======================
// REPORTS
// ======================

import AccountsReport from "../pages/reports/AccountsReport";
import DailyClosingReport from "../pages/reports/DailyClosingReport";
import DonationReport from "../pages/reports/DonationReport";
import ExpenseReport from "../pages/reports/ExpenseReport";
import IncomeReport from "../pages/reports/IncomeReport";
import Reports from "../pages/reports/Reports";
import StaffReport from "../pages/reports/StaffReport";
import StudentReport from "../pages/reports/StudentReport";

// ======================
// SETTINGS
// ======================

import AdminProfile from "../pages/settings/AdminProfile";
import BackupRestore from "../pages/settings/BackupRestore";
import MadrasaProfile from "../pages/settings/MadrasaProfile";
import Settings from "../pages/settings/Settings";

// ======================
// NOTIFICATIONS
// ======================

import NoticeBoard from "../pages/notifications/NoticeBoard";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import Tasks from "../pages/notifications/Tasks";

// ======================
// PROFILE
// ======================

import ProfilePage from "../pages/profile/ProfilePage";

// ======================
// SEARCH
// ======================

import GlobalSearch from "../pages/search/GlobalSearch";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ======================
            PUBLIC ROUTES
        ====================== */}

        <Route
  path="/"
  element={<DemoDashboard />}
/>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/create-madrasa"
          element={<CreateMadrasa />}
        />

        {/* ======================
            ALL PRIVATE ROUTES
        ====================== */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Accounts */}

          <Route
            path="/accounts"
            element={<Accounts />}
          />

          <Route
            path="/quick-income"
            element={<QuickIncome />}
          />

          <Route
            path="/quick-expense"
            element={<QuickExpense />}
          />

          <Route
            path="/income-history"
            element={<IncomeHistory />}
          />

          <Route
            path="/expense-history"
            element={<ExpenseHistory />}
          />

          <Route
            path="/monthly-report"
            element={<MonthlyReport />}
          />

          <Route
            path="/donors"
            element={<Donors />}
          />

          <Route
            path="/staff-salary"
            element={
              <AccountsStaffSalary />
            }
          />

          <Route
            path="/manage-categories"
            element={
              <ManageCategories />
            }
          />

          {/* Students routes continue in Part 2 */}
                    {/* ======================
              STUDENTS
          ====================== */}

          <Route
            path="/students"
            element={<Students />}
          />

          <Route
            path="/add-student"
            element={<AddStudent />}
          />

          <Route
            path="/student-list"
            element={<StudentList />}
          />

          <Route
            path="/search-student"
            element={<SearchStudent />}
          />

          <Route
            path="/edit-student/:id"
            element={<EditStudent />}
          />

          <Route
            path="/student-profile/:id"
            element={<StudentProfile />}
          />

          {/* Fees */}

          <Route
            path="/fees"
            element={<Fees />}
          />

          <Route
            path="/add-fee"
            element={<AddFee />}
          />

          <Route
            path="/fee-history"
            element={<FeeHistory />}
          />

          <Route
            path="/payment-history"
            element={<PaymentHistory />}
          />

          {/* Health */}

          <Route
            path="/health-record"
            element={<HealthRecord />}
          />

          <Route
            path="/add-health-record"
            element={
              <AddHealthRecord />
            }
          />

          <Route
            path="/health-history"
            element={<HealthHistory />}
          />

          {/* ID Cards */}

          <Route
            path="/id-card"
            element={<IDCard />}
          />

          <Route
            path="/generate-id-card"
            element={
              <GenerateIDCard />
            }
          />

          <Route
            path="/view-id-cards"
            element={<ViewIDCards />}
          />

          {/* Attendance */}

          <Route
            path="/student-attendance"
            element={
              <StudentAttendance />
            }
          />

          <Route
            path="/attendance-reports"
            element={
              <AttendanceReports />
            }
          />

          {/* Notifications */}

          <Route
            path="/student-notifications"
            element={<Notifications />}
          />

          {/* Staff routes continue in Part 3 */}
                    {/* ======================
              STAFF
          ====================== */}

          <Route
            path="/staff"
            element={<Staff />}
          />

          <Route
            path="/add-staff"
            element={<AddStaff />}
          />

          <Route
            path="/staff-list"
            element={<StaffList />}
          />

          <Route
            path="/search-staff"
            element={<SearchStaff />}
          />

          <Route
            path="/edit-staff/:id"
            element={<EditStaff />}
          />

          <Route
            path="/staff-profile/:id"
            element={<StaffProfile />}
          />

          {/* Attendance */}

          <Route
            path="/staff-attendance"
            element={<StaffAttendance />}
          />

          <Route
            path="/mark-staff-attendance"
            element={
              <MarkStaffAttendance />
            }
          />

          <Route
            path="/staff-attendance-history"
            element={
              <StaffAttendanceHistory />
            }
          />

          {/* Salary */}

          <Route
            path="/staff-salary-page"
            element={<StaffSalary />}
          />

          <Route
            path="/add-salary"
            element={<AddSalary />}
          />

          <Route
            path="/salary-history"
            element={<SalaryHistory />}
          />

          {/* Others */}

          <Route
            path="/roles"
            element={<Roles />}
          />

          <Route
            path="/leave-management"
            element={
              <LeaveManagement />
            }
          />

          <Route
            path="/staff-notifications"
            element={
              <StaffNotifications />
            }
          />

          {/* ======================
              PARENTS
          ====================== */}

          <Route
            path="/parents"
            element={<Parents />}
          />

          <Route
            path="/add-parent"
            element={<AddParent />}
          />

          <Route
            path="/parent-list"
            element={<ParentList />}
          />

          <Route
            path="/search-parent"
            element={<SearchParent />}
          />

          <Route
            path="/edit-parent/:id"
            element={<EditParent />}
          />

          <Route
            path="/parent-profile/:id"
            element={<ParentProfile />}
          />

          {/* Parent Features */}

          <Route
            path="/student-mapping"
            element={
              <StudentMapping />
            }
          />

          <Route
            path="/parent-notifications"
            element={
              <ParentNotifications />
            }
          />

          <Route
            path="/contact-details"
            element={
              <ContactDetails />
            }
          />

          <Route
            path="/parent-accounts"
            element={
              <ParentAccounts />
            }
          />

          {/* Donation routes continue in Part 4 */}
                    {/* ======================
              DONATIONS
          ====================== */}

          <Route
            path="/donations"
            element={<Donations />}
          />

          <Route
            path="/add-donation"
            element={<AddDonation />}
          />

          <Route
            path="/donation-history"
            element={
              <DonationHistory />
            }
          />

          <Route
            path="/campaigns"
            element={<Campaigns />}
          />

          <Route
            path="/receipts"
            element={<Receipts />}
          />

          <Route
            path="/donation-list"
            element={<DonationList />}
          />

          <Route
            path="/edit-donation/:id"
            element={<EditDonation />}
          />

          <Route
            path="/donation-profile/:id"
            element={
              <DonationProfile />
            }
          />

          <Route
            path="/monthly-donation-report"
            element={
              <MonthlyDonationReport />
            }
          />

          <Route
            path="/donors-list"
            element={<DonorsList />}
          />

          {/* ======================
              REPORTS
          ====================== */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/income-report"
            element={<IncomeReport />}
          />

          <Route
            path="/expense-report"
            element={<ExpenseReport />}
          />

          <Route
            path="/student-report"
            element={<StudentReport />}
          />

          <Route
            path="/staff-report"
            element={<StaffReport />}
          />

          <Route
            path="/donation-report"
            element={<DonationReport />}
          />

          <Route
            path="/accounts-report"
            element={<AccountsReport />}
          />

          <Route
            path="/daily-closing-report"
            element={
              <DailyClosingReport />
            }
          />

          {/* ======================
              SETTINGS
          ====================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/madrasa-profile"
            element={
              <MadrasaProfile />
            }
          />

          <Route
            path="/admin-profile"
            element={
              <AdminProfile />
            }
          />

          <Route
            path="/backup-restore"
            element={
              <BackupRestore />
            }
          />

          {/* ======================
              NOTIFICATIONS
          ====================== */}

          <Route
            path="/notifications-page"
            element={
              <NotificationsPage />
            }
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/notice-board"
            element={<NoticeBoard />}
          />

          {/* ======================
              PROFILE
          ====================== */}

          <Route
            path="/profile-page"
            element={<ProfilePage />}
          />

          {/* ======================
              SEARCH
          ====================== */}

          <Route
            path="/global-search"
            element={<GlobalSearch />}
          />

        </Route>

        {/* ======================
            FALLBACK
        ====================== */}

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;