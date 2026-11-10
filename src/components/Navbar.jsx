import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {

  const [search,
    setSearch] =
    useState("");

  const navigate =
    useNavigate();

  const handleSearch =
    () => {

      const keyword =
        search.trim();

      if (!keyword) {
        return;
      }

      navigate(
        `/global-search?q=${encodeURIComponent(
          keyword
        )}`
      );

    };

  const handleKeyDown =
    (e) => {

      if (
        e.key === "Enter"
      ) {

        handleSearch();

      }

    };

  return (
    <div className="navbar">

      <div>

        <h2
          className="navbar-title"
        >
          🕌 MA - MADRASA ERP
        </h2>

      </div>

      <div
        className="navbar-center"
      >

        <input
          type="text"
          placeholder="Search Students, Staff, Parents, Notices..."
          className="search-box"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
        />

        <button
          className="save-all-btn"
          onClick={
            handleSearch
          }
          style={{
            marginLeft:
              "10px",
            padding:
              "10px 16px"
          }}
        >
          🔍
        </button>

      </div>

      <div
        className="navbar-right"
      >

        <Link
          to="/notifications-page"
          className="link"
        >
          🔔 Notifications
        </Link>

        <Link
          to="/profile-page"
          className="link"
        >
          👤 Admin
        </Link>

      </div>

    </div>
  );

}

export default Navbar;