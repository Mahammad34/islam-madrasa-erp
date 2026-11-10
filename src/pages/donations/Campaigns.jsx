import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Campaigns() {

  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    campaigns,
    setCampaigns
  ] = useState([]);


  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    campaignName,
    setCampaignName
  ] = useState("");


  const [
    targetAmount,
    setTargetAmount
  ] = useState("");


  const [
    collectedAmount,
    setCollectedAmount
  ] = useState("");


  const [
    startDate,
    setStartDate
  ] = useState("");


  const [
    endDate,
    setEndDate
  ] = useState("");


  const [
    description,
    setDescription
  ] = useState("");


  // ============================================================
  // FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  // ============================================================
  // PROCESS STATES
  // ============================================================

  const [
    isLoading,
    setIsLoading
  ] = useState(true);


  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);


  const [
    deletingId,
    setDeletingId
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // CONVERT VALUE TO NUMBER
  // ============================================================

  const getNumber =
    (
      value
    ) => {

      const convertedValue =
        Number(
          value
        );


      return Number.isFinite(
        convertedValue
      )
        ?
        convertedValue
        :
        0;

    };


  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency =
    (
      value
    ) => {

      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        }
      ).format(
        getNumber(
          value
        )
      );

    };


  // ============================================================
  // GET TODAY DATE
  // ============================================================

  const getTodayDate =
    () => {

      const currentDate =
        new Date();


      const timezoneOffset =
        currentDate.getTimezoneOffset() *
        60000;


      return new Date(
        currentDate.getTime() -
        timezoneOffset
      )
        .toISOString()
        .split("T")[0];

    };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "Not Available";

      }


      const convertedDate =
        new Date(
          `${dateValue}T00:00:00`
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return dateValue;

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
  // GET CAMPAIGN STATUS
  // ============================================================

  const getCampaignStatus =
    (
      campaign
    ) => {

      const today =
        getTodayDate();


      const target =
        getNumber(
          campaign.targetAmount ??
          campaign.target
        );


      const collected =
        getNumber(
          campaign.collectedAmount ??
          campaign.collected
        );


      if (
        target > 0 &&
        collected >= target
      ) {

        return "Completed";

      }


      if (
        campaign.endDate &&
        campaign.endDate < today
      ) {

        return "Expired";

      }


      if (
        campaign.startDate &&
        campaign.startDate > today
      ) {

        return "Upcoming";

      }


      return "Active";

    };


  // ============================================================
  // GET CAMPAIGN PROGRESS
  // ============================================================

  const getCampaignProgress =
    (
      campaign
    ) => {

      const target =
        getNumber(
          campaign.targetAmount ??
          campaign.target
        );


      const collected =
        getNumber(
          campaign.collectedAmount ??
          campaign.collected
        );


      if (
        target <= 0
      ) {

        return 0;

      }


      return Math.min(
        (
          collected /
          target
        ) *
        100,
        100
      );

    };


  // ============================================================
  // FETCH CAMPAIGNS
  // ============================================================

  const fetchCampaigns =
    async (
      showRefreshLoader = false
    ) => {

      if (
        showRefreshLoader
      ) {

        setIsRefreshing(true);

      }
      else {

        setIsLoading(true);

      }


      setErrorMessage("");


      try {

        const campaignSnapshot =
          await getDocs(
            collection(
              db,
              "campaigns"
            )
          );


        const campaignList =
          campaignSnapshot.docs.map(
            (
              campaignDocument
            ) => ({

              id:
                campaignDocument.id,

              ...campaignDocument.data()

            })
          );


        campaignList.sort(
          (
            firstCampaign,
            secondCampaign
          ) =>

            String(
              secondCampaign.startDate ||
              ""
            ).localeCompare(
              String(
                firstCampaign.startDate ||
                ""
              )
            )

        );


        setCampaigns(
          campaignList
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error loading campaigns:",
          error
        );


        setErrorMessage(
          "Unable to load fundraising campaigns. Please try again."
        );

      }
      finally {

        setIsLoading(false);

        setIsRefreshing(false);

      }

    };


  // ============================================================
  // LOAD CAMPAIGNS
  // ============================================================

  useEffect(
    () => {

      fetchCampaigns();

    },
    []
  );


  // ============================================================
  // RESET CAMPAIGN FORM
  // ============================================================

  const resetCampaignForm =
    () => {

      setCampaignName("");

      setTargetAmount("");

      setCollectedAmount("");

      setStartDate("");

      setEndDate("");

      setDescription("");

    };


  // ============================================================
  // SAVE CAMPAIGN
  // ============================================================

  const saveCampaign =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const cleanCampaignName =
        campaignName.trim();


      const convertedTarget =
        getNumber(
          targetAmount
        );


      const convertedCollected =
        getNumber(
          collectedAmount
        );


      if (
        !cleanCampaignName
      ) {

        setErrorMessage(
          "Please enter the campaign name."
        );

        return;

      }


      if (
        convertedTarget <= 0
      ) {

        setErrorMessage(
          "Please enter a valid target amount greater than zero."
        );

        return;

      }


      if (
        convertedCollected < 0
      ) {

        setErrorMessage(
          "Collected amount cannot be negative."
        );

        return;

      }


      if (
        startDate &&
        endDate &&
        endDate < startDate
      ) {

        setErrorMessage(
          "Campaign end date cannot be before the start date."
        );

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await addDoc(
          collection(
            db,
            "campaigns"
          ),
          {

            name:
              cleanCampaignName,

            targetAmount:
              convertedTarget,

            collectedAmount:
              convertedCollected,

            startDate,

            endDate,

            description:
              description.trim(),

            createdAt:
              serverTimestamp()

          }
        );


        resetCampaignForm();


        setSuccessMessage(
          "Fundraising campaign created successfully."
        );


        await fetchCampaigns();

      }
      catch (
        error
      ) {

        console.error(
          "Error saving campaign:",
          error
        );


        setErrorMessage(
          "Unable to save the campaign. Please try again."
        );

      }
      finally {

        setIsSaving(false);

      }

    };


  // ============================================================
  // DELETE CAMPAIGN
  // ============================================================

  const deleteCampaign =
    async (
      campaign
    ) => {

      const confirmDelete =
        window.confirm(
          `Are you sure you want to delete "${campaign.name}"?`
        );


      if (
        !confirmDelete
      ) {

        return;

      }


      setDeletingId(
        campaign.id
      );

      setErrorMessage("");

      setSuccessMessage("");


      try {

        await deleteDoc(
          doc(
            db,
            "campaigns",
            campaign.id
          )
        );


        setCampaigns(
          (
            currentCampaigns
          ) =>

            currentCampaigns.filter(
              (
                currentCampaign
              ) =>

                currentCampaign.id !==
                campaign.id

            )
        );


        setSuccessMessage(
          "Campaign deleted successfully."
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting campaign:",
          error
        );


        setErrorMessage(
          "Unable to delete the campaign. Please try again."
        );

      }
      finally {

        setDeletingId("");

      }

    };


  // ============================================================
  // FILTER CAMPAIGNS
  // ============================================================

  const filteredCampaigns =
    useMemo(
      () => {

        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();


        return campaigns.filter(
          (
            campaign
          ) => {

            const searchableText =
              [

                campaign.name,

                campaign.description,

                campaign.targetAmount,

                campaign.collectedAmount

              ]
                .map(
                  (
                    value
                  ) =>

                    String(
                      value ||
                      ""
                    ).toLowerCase()

                )
                .join(" ");


            const matchesSearch =

              !normalizedSearch ||

              searchableText.includes(
                normalizedSearch
              );


            const matchesStatus =

              statusFilter === "All" ||

              getCampaignStatus(
                campaign
              ) ===
              statusFilter;


            return (

              matchesSearch &&

              matchesStatus

            );

          }
        );

      },
      [
        campaigns,
        searchTerm,
        statusFilter
      ]
    );


  // ============================================================
  // CAMPAIGN STATISTICS
  // ============================================================

  const campaignStatistics =
    useMemo(
      () => {

        const totalTarget =
          campaigns.reduce(
            (
              total,
              campaign
            ) =>

              total +

              getNumber(
                campaign.targetAmount ??
                campaign.target
              ),

            0
          );


        const totalCollected =
          campaigns.reduce(
            (
              total,
              campaign
            ) =>

              total +

              getNumber(
                campaign.collectedAmount ??
                campaign.collected
              ),

            0
          );


        const activeCampaigns =
          campaigns.filter(
            (
              campaign
            ) =>

              getCampaignStatus(
                campaign
              ) ===
              "Active"

          ).length;


        const completedCampaigns =
          campaigns.filter(
            (
              campaign
            ) =>

              getCampaignStatus(
                campaign
              ) ===
              "Completed"

          ).length;


        return {

          totalCampaigns:
            campaigns.length,

          activeCampaigns,

          completedCampaigns,

          totalTarget,

          totalCollected,

          remainingAmount:
            Math.max(
              totalTarget -
              totalCollected,
              0
            )

        };

      },
      [
        campaigns
      ]
    );


  // ============================================================
  // REFRESH CAMPAIGNS
  // ============================================================

  const refreshCampaigns =
    async () => {

      setSuccessMessage("");

      await fetchCampaigns(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setStatusFilter("All");

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
              🎯 Fundraising Campaigns
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Create and manage Madrasa fundraising campaigns.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <Link
              to="/donations"
              className="action-btn view-btn"
            >
              ❤️ Donations Module
            </Link>

            <button
              type="button"
              onClick={refreshCampaigns}
              disabled={isRefreshing}
            >
              {
                isRefreshing
                  ? "⏳ Refreshing..."
                  : "🔄 Refresh"
              }
            </button>

          </div>

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
          successMessage && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                fontWeight: "600"
              }}
            >
              ✅ {successMessage}
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
                  Loading Campaigns...
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while campaign information is loaded.
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
                    {campaignStatistics.totalCampaigns}
                  </h2>

                  <p>
                    🎯 Total Campaigns
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {campaignStatistics.activeCampaigns}
                  </h2>

                  <p>
                    🟢 Active Campaigns
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        campaignStatistics.totalCollected
                      )
                    }
                  </h2>

                  <p>
                    💰 Total Collected
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      formatCurrency(
                        campaignStatistics.remainingAmount
                      )
                    }
                  </h2>

                  <p>
                    📈 Remaining Target
                  </p>

                </div>

              </div>


              <div
                className="section-card"
                style={{
                  marginBottom: "24px"
                }}
              >

                <div style={{ marginBottom: "22px" }}>

                  <h2 style={{ margin: "0 0 6px" }}>
                    ➕ Create Campaign
                  </h2>

                  <p style={{ margin: 0, color: "#64748b" }}>
                    Create a new fundraising campaign for your Madrasa.
                  </p>

                </div>


                <div className="form-grid">

                  <div>

                    <label>
                      Campaign Name *
                    </label>

                    <input
                      type="text"
                      placeholder="Example: Ramadan Food Program"
                      value={campaignName}
                      onChange={(event) =>
                        setCampaignName(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>


                  <div>

                    <label>
                      Target Amount *
                    </label>

                    <input
                      type="number"
                      min="1"
                      placeholder="Enter target amount"
                      value={targetAmount}
                      onChange={(event) =>
                        setTargetAmount(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

                  </div>


                  <div>

                    <label>
                      Initial Collected Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter collected amount"
                      value={collectedAmount}
                      onChange={(event) =>
                        setCollectedAmount(
                          event.target.value
                        )
                      }
                      disabled={isSaving}
                    />

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
                      disabled={isSaving}
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
                      disabled={isSaving}
                    />

                  </div>

                </div>


                <div style={{ marginTop: "18px" }}>

                  <label>
                    Campaign Description
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Enter campaign purpose and details..."
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                    style={{
                      width: "100%",
                      resize: "vertical"
                    }}
                  />

                </div>


                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px"
                  }}
                >

                  <button
                    type="button"
                    className="save-all-btn"
                    onClick={saveCampaign}
                    disabled={isSaving}
                  >
                    {
                      isSaving
                        ? "⏳ Creating Campaign..."
                        : "💾 Create Campaign"
                    }
                  </button>


                  <button
                    type="button"
                    onClick={resetCampaignForm}
                    disabled={isSaving}
                  >
                    ↻ Reset Form
                  </button>

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
                      🔍 Search & Filter Campaigns
                    </h2>

                    <p style={{ margin: 0, color: "#64748b" }}>
                      Search campaigns and filter them by current status.
                    </p>

                  </div>


                  {
                    (
                      searchTerm ||
                      statusFilter !== "All"
                    ) && (

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
                      Search Campaigns
                    </label>

                    <input
                      type="text"
                      placeholder="Search name or description..."
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
                      Campaign Status
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
                        All Campaigns
                      </option>

                      <option value="Active">
                        Active
                      </option>

                      <option value="Upcoming">
                        Upcoming
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Expired">
                        Expired
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
                    {filteredCampaigns.length}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {campaigns.length}
                  </strong>{" "}
                  campaigns.
                </div>

              </div>


              {
                campaigns.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "54px",
                          marginBottom: "14px"
                        }}
                      >
                        🎯
                      </div>

                      <h2>
                        No Campaigns Yet
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Create your first Madrasa fundraising campaign using the form above.
                      </p>

                    </div>

                  </div>

                )
              }


              {
                campaigns.length > 0 &&
                filteredCampaigns.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "54px",
                          marginBottom: "14px"
                        }}
                      >
                        🔍
                      </div>

                      <h2>
                        No Matching Campaigns
                      </h2>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        No campaigns match your current search or status filter.
                      </p>

                      <button
                        type="button"
                        onClick={resetFilters}
                      >
                        ✖ Clear Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {
                filteredCampaigns.length > 0 && (

                  <div
                    style={{
                      display: "grid",
                      gap: "18px"
                    }}
                  >

                    {
                      filteredCampaigns.map(
                        (campaign) => {

                          const target =
                            getNumber(
                              campaign.targetAmount ??
                              campaign.target
                            );


                          const collected =
                            getNumber(
                              campaign.collectedAmount ??
                              campaign.collected
                            );


                          const remaining =
                            Math.max(
                              target - collected,
                              0
                            );


                          const progress =
                            getCampaignProgress(
                              campaign
                            );


                          const status =
                            getCampaignStatus(
                              campaign
                            );


                          return (

                            <div
                              className="section-card"
                              key={campaign.id}
                            >

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "18px",
                                  flexWrap: "wrap"
                                }}
                              >

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "14px",
                                    alignItems: "flex-start",
                                    flex: "1",
                                    minWidth: "260px"
                                  }}
                                >

                                  <div
                                    style={{
                                      width: "56px",
                                      height: "56px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      borderRadius: "14px",
                                      background: "#f3e8ff",
                                      fontSize: "28px"
                                    }}
                                  >
                                    🎯
                                  </div>


                                  <div>

                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                        marginBottom: "8px"
                                      }}
                                    >

                                      <h2 style={{ margin: 0 }}>
                                        {campaign.name}
                                      </h2>


                                      <span
                                        style={{
                                          padding: "4px 9px",
                                          borderRadius: "999px",
                                          background:
                                            status === "Completed"
                                              ? "#dcfce7"
                                              : status === "Active"
                                              ? "#dbeafe"
                                              : status === "Upcoming"
                                              ? "#fef3c7"
                                              : "#fee2e2",
                                          color:
                                            status === "Completed"
                                              ? "#15803d"
                                              : status === "Active"
                                              ? "#1d4ed8"
                                              : status === "Upcoming"
                                              ? "#b45309"
                                              : "#b91c1c",
                                          fontSize: "11px",
                                          fontWeight: "800"
                                        }}
                                      >
                                        {status}
                                      </span>

                                    </div>


                                    {
                                      campaign.description && (

                                        <p
                                          style={{
                                            margin: "0 0 12px",
                                            color: "#64748b",
                                            lineHeight: "1.6"
                                          }}
                                        >
                                          {campaign.description}
                                        </p>

                                      )
                                    }


                                    <div
                                      style={{
                                        display: "grid",
                                        gap: "7px",
                                        color: "#64748b",
                                        fontSize: "14px"
                                      }}
                                    >

                                      <span>
                                        📅 Start:{" "}
                                        {
                                          formatDate(
                                            campaign.startDate
                                          )
                                        }
                                      </span>

                                      <span>
                                        🏁 End:{" "}
                                        {
                                          formatDate(
                                            campaign.endDate
                                          )
                                        }
                                      </span>

                                    </div>

                                  </div>

                                </div>


                                <button
                                  type="button"
                                  className="action-btn delete-btn"
                                  onClick={() =>
                                    deleteCampaign(
                                      campaign
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    campaign.id
                                  }
                                >
                                  {
                                    deletingId === campaign.id
                                      ? "⏳ Deleting..."
                                      : "🗑 Delete"
                                  }
                                </button>

                              </div>


                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(160px, 1fr))",
                                  gap: "12px",
                                  marginTop: "22px"
                                }}
                              >

                                <div
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    🎯 Target
                                  </p>

                                  <strong>
                                    {formatCurrency(target)}
                                  </strong>
                                </div>


                                <div
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    💰 Collected
                                  </p>

                                  <strong>
                                    {formatCurrency(collected)}
                                  </strong>
                                </div>


                                <div
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    📈 Remaining
                                  </p>

                                  <strong>
                                    {formatCurrency(remaining)}
                                  </strong>
                                </div>


                                <div
                                  style={{
                                    padding: "14px",
                                    borderRadius: "10px",
                                    background: "#f8fafc"
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 5px",
                                      color: "#64748b",
                                      fontSize: "12px"
                                    }}
                                  >
                                    📊 Progress
                                  </p>

                                  <strong>
                                    {progress.toFixed(1)}%
                                  </strong>
                                </div>

                              </div>


                              <div
                                style={{
                                  marginTop: "20px"
                                }}
                              >

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                    marginBottom: "7px",
                                    color: "#64748b",
                                    fontSize: "12px"
                                  }}
                                >
                                  <span>
                                    Campaign Progress
                                  </span>

                                  <strong>
                                    {progress.toFixed(1)}%
                                  </strong>
                                </div>


                                <div
                                  style={{
                                    width: "100%",
                                    height: "12px",
                                    overflow: "hidden",
                                    borderRadius: "999px",
                                    background: "#e2e8f0"
                                  }}
                                >

                                  <div
                                    style={{
                                      width: `${progress}%`,
                                      height: "100%",
                                      borderRadius: "999px",
                                      background: "#8b5cf6",
                                      transition: "width 0.3s ease"
                                    }}
                                  />

                                </div>

                              </div>

                            </div>

                          );

                        }
                      )
                    }

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
                  to="/donations"
                  className="action-btn view-btn"
                >
                  ❤️ Donations Module
                </Link>

                <Link
                  to="/add-donation"
                  className="action-btn view-btn"
                >
                  ➕ Add Donation
                </Link>

                <Link
                  to="/donation-history"
                  className="action-btn view-btn"
                >
                  📜 Donation History
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

export default Campaigns;