import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function DemoDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

  const modules = [
    {
      id: "students",
      icon: "👨‍🎓",
      title: "Students",
      description:
        "Manage student profiles, fees, attendance and important student information.",
    },
    {
      id: "staff",
      icon: "👨‍🏫",
      title: "Staff",
      description:
        "Manage staff profiles, attendance, salaries, roles and leave information.",
    },
    {
      id: "accounts",
      icon: "💰",
      title: "Accounts",
      description:
        "Track income, expenses, categories, balances and financial history.",
    },
    {
      id: "donations",
      icon: "🤝",
      title: "Donations",
      description:
        "Manage donors, donations, receipts and donation records in one place.",
    },
    {
      id: "reports",
      icon: "📊",
      title: "Reports",
      description:
        "Generate useful reports for students, staff, donations and accounts.",
    },
    {
      id: "notifications",
      icon: "🔔",
      title: "Notifications",
      description:
        "Keep track of important madrasa notices, tasks and updates.",
    },
  ];

  const stats = [
    {
      title: "Total Students",
      value: "250",
      change: "+12 this month",
      icon: "👨‍🎓",
    },
    {
      title: "Staff Members",
      value: "18",
      change: "+2 this month",
      icon: "👨‍🏫",
    },
    {
      title: "Today's Income",
      value: "₹12,500",
      change: "+8.4% from yesterday",
      icon: "↗",
    },
    {
      title: "Today's Expenses",
      value: "₹7,850",
      change: "-4.2% from yesterday",
      icon: "↘",
    },
  ];

  const transactions = [
    {
      title: "Monthly Donation",
      category: "Donation",
      amount: "+ ₹10,000",
      type: "income",
    },
    {
      title: "Staff Salary",
      category: "Salary",
      amount: "- ₹5,000",
      type: "expense",
    },
    {
      title: "Student Fees",
      category: "Fees",
      amount: "+ ₹2,500",
      type: "income",
    },
    {
      title: "Electricity Bill",
      category: "Utilities",
      amount: "- ₹1,850",
      type: "expense",
    },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* Automatically detect which section is currently visible */
  useEffect(() => {
    const sectionIds = [
      "overview",
      "students",
      "staff",
      "accounts",
      "donations",
      "reports",
      "notifications",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      let current = "overview";

      sectionIds.forEach((id) => {
        const element = document.getElementById(id);

        if (element && element.offsetTop <= scrollPosition) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="demo-app">

      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f3f6fa;
        }

        /* ==========================================
           MAIN APP
        ========================================== */

        .demo-app {
          min-height: 100vh;

          background:
            #f3f6fa;

          color: #172033;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;
        }

        /* ==========================================
           SIDEBAR
        ========================================== */

        .sidebar {
          position: fixed;

          left: 0;
          top: 0;
          bottom: 0;

          width: 260px;

          background:
            linear-gradient(
              180deg,
              #0b1427 0%,
              #111c32 55%,
              #0b1427 100%
            );

          color: white;

          padding: 30px 20px;

          display: flex;

          flex-direction: column;

          z-index: 100;

          border-right:
            1px solid rgba(255,255,255,0.05);
        }

        /* BRAND */

        .brand {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 0 10px;

          margin-bottom: 43px;
        }

        .brand-logo {
          width: 48px;
          height: 48px;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #22c55e,
              #14b8a6
            );

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          font-size: 23px;

          font-weight: 900;

          box-shadow:
            0 10px 30px rgba(20,184,166,0.25);
        }

        .brand-title {
          color: white;

          font-size: 18px;

          font-weight: 850;

          letter-spacing: -0.4px;
        }

        .brand-subtitle {
          color: #94a3b8;

          font-size: 12px;

          margin-top: 4px;
        }

        /* NAV */

        .nav-title {
          color: #64748b;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1.5px;

          text-transform: uppercase;

          padding: 0 14px;

          margin-bottom: 12px;
        }

        .nav-item {
          display: flex;

          align-items: center;

          gap: 14px;

          padding: 14px 15px;

          margin-bottom: 6px;

          border-radius: 10px;

          color: #cbd5e1;

          text-decoration: none;

          font-size: 14px;

          font-weight: 650;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .nav-item:hover {
          background:
            rgba(255,255,255,0.07);

          color: white;

          transform:
            translateX(2px);
        }

        .nav-item.active {
          background:
            rgba(34,197,94,0.11);

          color: #4ade80;

          border-left:
            3px solid #22c55e;

          padding-left: 12px;

          box-shadow:
            inset 0 0 25px rgba(34,197,94,0.03);
        }

        .nav-icon {
          width: 24px;

          text-align: center;

          font-size: 18px;

          flex-shrink: 0;
        }

        /* SIDEBAR BOTTOM */

        .sidebar-bottom {
          margin-top: auto;

          padding: 17px;

          border:
            1px solid rgba(255,255,255,0.08);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.035);
        }

        .demo-label {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #86efac;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .demo-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 10px rgba(34,197,94,0.8);
        }

        .sidebar-bottom p {
          margin: 10px 0 0;

          color: #718096;

          font-size: 12px;

          line-height: 1.65;
        }

        /* ==========================================
           MAIN AREA
        ========================================== */

        .main {
          margin-left: 260px;

          min-height: 100vh;
        }

        /* ==========================================
           TOP BAR
        ========================================== */

        .topbar {
          height: 78px;

          position: sticky;

          top: 0;

          z-index: 50;

          background:
            rgba(255,255,255,0.96);

          border-bottom:
            1px solid #e6ebf2;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 0 42px;

          backdrop-filter:
            blur(12px);
        }

        .breadcrumb {
          color: #64748b;

          font-size: 14px;
        }

        .breadcrumb strong {
          color: #172033;

          font-weight: 850;
        }

        .top-actions {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .live-badge {
          display: flex;

          align-items: center;

          gap: 8px;

          padding: 9px 14px;

          border:
            1px solid #bbf7d0;

          border-radius: 30px;

          background:
            #ecfdf5;

          color: #15803d;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 0.5px;
        }

        .live-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;
        }

        .login-btn {
          padding: 12px 19px;

          border-radius: 9px;

          background: #172033;

          color: white;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          transition: 0.2s;
        }

        .login-btn:hover {
          background: #0f172a;

          transform:
            translateY(-1px);

          box-shadow:
            0 8px 20px rgba(15,23,42,0.15);
        }

        /* ==========================================
           CONTENT
        ========================================== */

        .content {
          max-width: 1650px;

          margin: auto;

          padding:
            38px 42px 60px;
        }

        /* ==========================================
           HERO
        ========================================== */

        .hero {
          position: relative;

          overflow: hidden;

          min-height: 275px;

          padding: 40px 45px;

          border-radius: 20px;

          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(34,197,94,0.20),
              transparent 30%
            ),
            radial-gradient(
              circle at 72% 100%,
              rgba(20,184,166,0.17),
              transparent 35%
            ),
            linear-gradient(
              120deg,
              #0d172c 0%,
              #14243d 55%,
              #103d39 100%
            );

          color: white;

          box-shadow:
            0 20px 55px rgba(15,23,42,0.13);
        }

        .hero::before {
          content: "";

          position: absolute;

          width: 360px;
          height: 360px;

          right: -150px;
          top: -180px;

          border:
            1px solid rgba(255,255,255,0.08);

          border-radius: 50%;
        }

        .hero::after {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          right: 100px;
          bottom: -130px;

          border:
            1px solid rgba(255,255,255,0.05);

          border-radius: 50%;
        }

        .hero-content {
          position: relative;

          z-index: 2;

          max-width: 850px;
        }

        .hero-tag {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 8px 13px;

          border:
            1px solid rgba(134,239,172,0.25);

          border-radius: 30px;

          background:
            rgba(34,197,94,0.12);

          color: #86efac;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .hero h1 {
          margin: 20px 0 13px;

          color: white;

          font-size: 38px;

          line-height: 1.13;

          letter-spacing: -1.2px;

          font-weight: 900;
        }

        .hero h1 span {
          color: #86efac;
        }

        .hero p {
          max-width: 760px;

          margin: 0;

          color: #cbd5e1;

          font-size: 15px;

          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;

          gap: 12px;

          margin-top: 25px;
        }

        .primary-btn {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 13px 20px;

          border-radius: 9px;

          background: #22c55e;

          color: white;

          text-decoration: none;

          font-size: 13px;

          font-weight: 850;

          box-shadow:
            0 8px 20px rgba(34,197,94,0.18);

          transition: 0.2s;
        }

        .primary-btn:hover {
          background: #16a34a;

          transform:
            translateY(-2px);
        }

        .secondary-btn {
          display: inline-flex;

          align-items: center;

          padding: 13px 20px;

          border:
            1px solid rgba(255,255,255,0.13);

          border-radius: 9px;

          background:
            rgba(255,255,255,0.08);

          color: #e2e8f0;

          text-decoration: none;

          font-size: 13px;

          font-weight: 750;

          transition: 0.2s;
        }

        .secondary-btn:hover {
          background:
            rgba(255,255,255,0.13);
        }

        /* ==========================================
           SECTIONS
        ========================================== */

        .section {
          margin-top: 38px;

          scroll-margin-top: 105px;
        }

        .section-header {
          display: flex;

          align-items: end;

          justify-content: space-between;

          margin-bottom: 18px;
        }

        .section-title {
          margin: 0;

          color: #172033;

          font-size: 22px;

          font-weight: 900;

          letter-spacing: -0.5px;
        }

        .section-subtitle {
          margin-top: 6px;

          color: #718096;

          font-size: 13px;
        }

        /* ==========================================
           STATS
        ========================================== */

        .stats {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 17px;
        }

        .stat-card {
          padding: 25px;

          border:
            1px solid #e5eaf1;

          border-radius: 15px;

          background: white;

          box-shadow:
            0 6px 25px rgba(15,23,42,0.035);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 14px 35px rgba(15,23,42,0.08);
        }

        .stat-top {
          display: flex;

          align-items: center;

          justify-content: space-between;
        }

        .stat-label {
          color: #64748b;

          font-size: 13px;

          font-weight: 650;
        }

        .stat-icon {
          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 12px;

          background: #ecfdf5;

          color: #16a34a;

          font-size: 18px;
        }

        .stat-value {
          margin-top: 17px;

          color: #172033;

          font-size: 29px;

          font-weight: 900;

          letter-spacing: -1px;
        }

        .stat-change {
          margin-top: 7px;

          color: #16a34a;

          font-size: 12px;

          font-weight: 750;
        }

        /* ==========================================
           ANALYTICS
        ========================================== */

        .dashboard-grid {
          display: grid;

          grid-template-columns:
            1.35fr 0.65fr;

          gap: 17px;
        }

        .panel {
          padding: 27px;

          border:
            1px solid #e5eaf1;

          border-radius: 15px;

          background: white;

          box-shadow:
            0 6px 25px rgba(15,23,42,0.035);
        }

        .panel-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 25px;
        }

        .panel-title {
          color: #172033;

          font-size: 16px;

          font-weight: 900;
        }

        .panel-small {
          margin-top: 5px;

          color: #718096;

          font-size: 12px;
        }

        /* CHART */

        .chart {
          height: 220px;

          display: flex;

          align-items: end;

          gap: 17px;

          padding:
            10px 10px 0;

          border-bottom:
            1px solid #eef2f7;
        }

        .bar-group {
          flex: 1;

          height: 100%;

          display: flex;

          align-items: end;

          justify-content: center;

          gap: 6px;
        }

        .bar {
          width: 13px;

          border-radius:
            7px 7px 0 0;
        }

        .income-bar {
          background:
            linear-gradient(
              180deg,
              #22c55e,
              #86efac
            );
        }

        .expense-bar {
          background:
            linear-gradient(
              180deg,
              #14b8a6,
              #99f6e4
            );
        }

        .chart-legend {
          display: flex;

          gap: 25px;

          margin-top: 15px;
        }

        .legend {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #64748b;

          font-size: 12px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #22c55e;
        }

        .legend-dot.expense {
          background: #14b8a6;
        }

        /* BALANCE */

        .balance {
          padding: 12px 0 20px;

          text-align: center;
        }

        .balance-circle {
          width: 155px;
          height: 155px;

          margin:
            5px auto 20px;

          border-radius: 50%;

          background:
            conic-gradient(
              #22c55e 0 68%,
              #e8edf4 68% 100%
            );

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .balance-inner {
          width: 128px;
          height: 128px;

          border-radius: 50%;

          background: white;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;
        }

        .balance-inner span {
          color: #94a3b8;

          font-size: 11px;
        }

        .balance-inner strong {
          margin-top: 5px;

          color: #172033;

          font-size: 23px;
        }

        .balance-note {
          color: #16a34a;

          font-size: 12px;

          font-weight: 850;
        }

        /* ==========================================
           MODULES
        ========================================== */

        .modules {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 17px;
        }

        .module {
          min-height: 175px;

          padding: 24px;

          border:
            1px solid #e5eaf1;

          border-radius: 15px;

          background: white;

          cursor: pointer;

          scroll-margin-top: 105px;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .module:hover {
          transform:
            translateY(-4px);

          border-color:
            #cbd5e1;

          box-shadow:
            0 15px 35px rgba(15,23,42,0.08);
        }

        .module-icon {
          width: 46px;
          height: 46px;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 17px;

          border-radius: 13px;

          background: #f0fdf4;

          font-size: 20px;
        }

        .module h3 {
          margin: 0 0 9px;

          color: #172033;

          font-size: 16px;

          font-weight: 900;
        }

        .module p {
          margin: 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.7;
        }

        /* ==========================================
           TRANSACTIONS
        ========================================== */

        .transactions {
          width: 100%;

          border-collapse: collapse;
        }

        .transactions th {
          padding:
            0 0 14px;

          border-bottom:
            1px solid #eef2f7;

          color: #94a3b8;

          font-size: 10px;

          text-align: left;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .transactions td {
          padding: 17px 0;

          border-bottom:
            1px solid #f1f5f9;

          font-size: 13px;
        }

        .transaction-name {
          color: #172033;

          font-weight: 800;
        }

        .category {
          color: #64748b;
        }

        .income {
          color: #16a34a;

          font-weight: 900;
        }

        .expense {
          color: #ef4444;

          font-weight: 900;
        }

        /* ==========================================
           CTA
        ========================================== */

        .final-cta {
          margin-top: 38px;
        }

        .final-cta .hero {
          min-height: 190px;

          padding: 32px 38px;
        }

        .final-cta h2 {
          margin:
            15px 0 0;

          color: white;

          font-size: 25px;

          font-weight: 900;
        }

        /* ==========================================
           FOOTER
        ========================================== */

        .footer {
          padding:
            30px 0 5px;

          color: #94a3b8;

          font-size: 11px;

          text-align: center;
        }

        /* ==========================================
           TABLET
        ========================================== */

        @media (max-width: 1200px) {

          .stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .modules {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 850px) {

          .sidebar {
            position: relative;

            width: 100%;

            height: auto;

            padding: 20px;
          }

          .brand {
            margin-bottom: 20px;
          }

          .nav-item {
            display: none;
          }

          .sidebar-bottom {
            display: none;
          }

          .main {
            margin-left: 0;
          }

          .topbar {
            padding:
              0 20px;
          }

          .content {
            padding:
              25px 20px 45px;
          }

          .hero {
            padding: 30px;
          }

          .hero h1 {
            font-size: 29px;
          }

          .hero p {
            font-size: 14px;
          }

          .stats,
          .modules {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 600px) {

          .topbar {
            height: 68px;
          }

          .breadcrumb {
            font-size: 12px;
          }

          .live-badge {
            display: none;
          }

          .login-btn {
            padding:
              10px 13px;

            font-size: 11px;
          }

          .content {
            padding:
              20px 15px 40px;
          }

          .hero {
            min-height: auto;

            padding:
              27px 24px;

            border-radius: 16px;
          }

          .hero h1 {
            font-size: 25px;
          }

          .hero p {
            font-size: 13px;
          }

          .hero-buttons {
            flex-direction: column;

            align-items: flex-start;
          }

          .stat-card {
            padding: 21px;
          }

          .section-title {
            font-size: 19px;
          }

          .panel {
            padding: 20px;

            overflow-x: auto;
          }

          .chart {
            min-width: 450px;

            height: 180px;

            gap: 8px;
          }

          .bar {
            width: 9px;
          }

          .transactions {
            min-width: 520px;
          }

        }

      `}</style>

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            M
          </div>

          <div>

            <div className="brand-title">
              Madrasa ERP
            </div>

            <div className="brand-subtitle">
              Management System
            </div>

          </div>

        </div>

        <div className="nav-title">
          Workspace
        </div>

        {/* DASHBOARD */}

        <a
          href="#overview"
          className={
            activeSection === "overview"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={(e) => {
            e.preventDefault();

            scrollToSection("overview");
          }}
        >

          <span className="nav-icon">
            ⌂
          </span>

          Dashboard

        </a>

        {/* MODULE NAVIGATION */}

        {modules.map((module) => (

          <a
            key={module.id}
            href={`#${module.id}`}
            className={
              activeSection === module.id
                ? "nav-item active"
                : "nav-item"
            }
            onClick={(e) => {
              e.preventDefault();

              scrollToSection(module.id);
            }}
          >

            <span className="nav-icon">
              {module.icon}
            </span>

            {module.title}

          </a>

        ))}

        {/* SIDEBAR DEMO INFO */}

        <div className="sidebar-bottom">

          <div className="demo-label">

            <span className="demo-dot"></span>

            Live Demo

          </div>

          <p>
            This public dashboard uses sample data.
            Full ERP data is protected behind authentication.
          </p>

        </div>

      </aside>

      {/* ==========================================
          MAIN
      ========================================== */}

      <div className="main">

        {/* TOPBAR */}

        <div className="topbar">

          <div className="breadcrumb">

            Home / <strong>Dashboard</strong>

          </div>

          <div className="top-actions">

            <div className="live-badge">

              <span className="live-dot"></span>

              LIVE DEMO

            </div>

            <Link
              to="/login"
              className="login-btn"
            >
              Login to Full ERP →
            </Link>

          </div>

        </div>

        {/* PAGE CONTENT */}

        <main className="content">

          {/* ======================================
              HERO
          ====================================== */}

          <section
            id="overview"
            className="hero"
          >

            <div className="hero-content">

              <div className="hero-tag">
                ✦ Madrasa Management Platform
              </div>

              <h1>

                Everything your madrasa needs,

                <br />

                <span>
                  in one simple system.
                </span>

              </h1>

              <p>
                A modern ERP platform for managing students,
                staff, accounts, donations, attendance and reports —
                designed to make everyday madrasa administration
                faster and easier.
              </p>

              <div className="hero-buttons">

                <Link
                  to="/login"
                  className="primary-btn"
                >
                  Explore Full ERP →
                </Link>

                <a
                  href="#students"
                  className="secondary-btn"
                  onClick={(e) => {
                    e.preventDefault();

                    scrollToSection("students");
                  }}
                >
                  Explore Modules
                </a>

              </div>

            </div>

          </section>

          {/* ======================================
              OVERVIEW STATS
          ====================================== */}

          <section className="section">

            <div className="section-header">

              <div>

                <h2 className="section-title">
                  Overview
                </h2>

                <div className="section-subtitle">
                  Sample operational metrics
                </div>

              </div>

            </div>

            <div className="stats">

              {stats.map((stat) => (

                <div
                  className="stat-card"
                  key={stat.title}
                >

                  <div className="stat-top">

                    <div className="stat-label">
                      {stat.title}
                    </div>

                    <div className="stat-icon">
                      {stat.icon}
                    </div>

                  </div>

                  <div className="stat-value">
                    {stat.value}
                  </div>

                  <div className="stat-change">
                    {stat.change}
                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* ======================================
              ANALYTICS
          ====================================== */}

          <section className="section">

            <div className="dashboard-grid">

              {/* CHART */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Income & Expense Overview
                    </div>

                    <div className="panel-small">
                      Sample monthly financial activity
                    </div>

                  </div>

                </div>

                <div className="chart">

                  {[
                    [70, 45],
                    [85, 55],
                    [60, 40],
                    [95, 48],
                    [72, 35],
                    [88, 52],
                    [76, 43],
                  ].map((item, index) => (

                    <div
                      className="bar-group"
                      key={index}
                    >

                      <div
                        className="bar income-bar"
                        style={{
                          height: `${item[0]}%`,
                        }}
                      />

                      <div
                        className="bar expense-bar"
                        style={{
                          height: `${item[1]}%`,
                        }}
                      />

                    </div>

                  ))}

                </div>

                <div className="chart-legend">

                  <div className="legend">

                    <span className="legend-dot"></span>

                    Income

                  </div>

                  <div className="legend">

                    <span className="legend-dot expense"></span>

                    Expenses

                  </div>

                </div>

              </div>

              {/* BALANCE */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-title">
                      Current Balance
                    </div>

                    <div className="panel-small">
                      Sample financial position
                    </div>

                  </div>

                </div>

                <div className="balance">

                  <div className="balance-circle">

                    <div className="balance-inner">

                      <span>
                        Available
                      </span>

                      <strong>
                        ₹4,650
                      </strong>

                    </div>

                  </div>

                  <div className="balance-note">
                    Healthy balance position
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ======================================
              MODULES
          ====================================== */}

          <section
            id="modules"
            className="section"
          >

            <div className="section-header">

              <div>

                <h2 className="section-title">
                  Powerful Modules
                </h2>

                <div className="section-subtitle">
                  Everything organized in one place
                </div>

              </div>

            </div>

            <div className="modules">

              {modules.map((module) => (

                <div
                  key={module.id}
                  id={module.id}
                  className="module"
                  onClick={() =>
                    scrollToSection(module.id)
                  }
                >

                  <div className="module-icon">
                    {module.icon}
                  </div>

                  <h3>
                    {module.title}
                  </h3>

                  <p>
                    {module.description}
                  </p>

                </div>

              ))}

            </div>

          </section>

          {/* ======================================
              TRANSACTIONS
          ====================================== */}

          <section
            className="section"
          >

            <div className="panel">

              <div className="panel-header">

                <div>

                  <div className="panel-title">
                    Recent Transactions
                  </div>

                  <div className="panel-small">
                    Example activity from the accounting module
                  </div>

                </div>

              </div>

              <table className="transactions">

                <thead>

                  <tr>

                    <th>
                      Transaction
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions.map((item) => (

                    <tr key={item.title}>

                      <td className="transaction-name">
                        {item.title}
                      </td>

                      <td className="category">
                        {item.category}
                      </td>

                      <td
                        className={
                          item.type === "income"
                            ? "income"
                            : "expense"
                        }
                      >
                        {item.amount}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

          {/* ======================================
              FINAL CTA
          ====================================== */}

          <section className="final-cta">

            <div className="hero">

              <div className="hero-content">

                <div className="hero-tag">
                  Ready to explore?
                </div>

                <h2>
                  Experience the complete Madrasa ERP.
                </h2>

                <div className="hero-buttons">

                  <Link
                    to="/login"
                    className="primary-btn"
                  >
                    Open Full Application →
                  </Link>

                </div>

              </div>

            </div>

          </section>

          <div className="footer">
            Madrasa ERP • Management & Accounting Platform • Public Demo
          </div>

        </main>

      </div>

    </div>
  );
}

export default DemoDashboard;
