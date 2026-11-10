import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function ContactDetails() {

  // ============================================================
  // COMPONENT REFERENCE
  // ============================================================

  const isMountedRef =
    useRef(true);


  // ============================================================
  // DATABASE STATE
  // ============================================================

  const [
    parents,
    setParents
  ] = useState([]);


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    contactFilter,
    setContactFilter
  ] = useState("All");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  // ============================================================
  // PAGE PROCESS STATES
  // ============================================================

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
  // COMPONENT CLEANUP
  // ============================================================

  useEffect(
    () => {

      isMountedRef.current =
        true;


      return () => {

        isMountedRef.current =
          false;

      };

    },
    []
  );


  // ============================================================
  // NORMALIZE VALUE
  // ============================================================

  const normalizeValue =
    (
      value
    ) => {

      return String(
        value || ""
      )
        .trim()
        .toLowerCase();

    };


  // ============================================================
  // CLEAN PHONE NUMBER
  // ============================================================

  const cleanPhoneNumber =
    (
      value
    ) => {

      return String(
        value || ""
      ).replace(
        /\D/g,
        ""
      );

    };


  // ============================================================
  // DISPLAY VALUE
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "Not Available"
    ) => {

      const cleanedValue =
        String(
          value || ""
        ).trim();


      return cleanedValue ||
        fallback;

    };


  // ============================================================
  // GET PARENT NAME
  // ============================================================

  const getParentName =
    (
      parent
    ) => {

      return (

        parent.primaryGuardianName ||

        parent.fatherName ||

        parent.motherName ||

        parent.guardianName ||

        "Unknown Parent"

      );

    };


  // ============================================================
  // GET WHATSAPP NUMBER
  // ============================================================

  const getWhatsAppNumber =
    (
      parent
    ) => {

      return (

        parent.whatsAppNumber ||

        parent.whatsappNumber ||

        parent.mobileNumber ||

        ""

      );

    };


  // ============================================================
  // GET COMPLETE ADDRESS
  // ============================================================

  const getCompleteAddress =
    (
      parent
    ) => {

      const addressParts =
        [

          parent.address,

          parent.city,

          parent.district,

          parent.state,

          parent.pinCode

        ]
          .map(
            (
              value
            ) =>
              String(
                value || ""
              ).trim()
          )
          .filter(
            Boolean
          );


      return addressParts.join(
        ", "
      ) || "Not Available";

    };


  // ============================================================
  // GET CONTACT COMPLETENESS
  // ============================================================

  const getContactCompleteness =
    (
      parent
    ) => {

      const contactFields =
        [

          parent.mobileNumber,

          getWhatsAppNumber(
            parent
          ),

          parent.email,

          parent.address,

          parent.city,

          parent.district,

          parent.state,

          parent.pinCode

        ];


      const completedFields =
        contactFields.filter(
          (
            field
          ) =>
            String(
              field || ""
            ).trim()
        ).length;


      return Math.round(

        (
          completedFields /
          contactFields.length
        ) * 100

      );

    };


  // ============================================================
  // GET CONTACT STATUS
  // ============================================================

  const getContactStatus =
    (
      parent
    ) => {

      const completeness =
        getContactCompleteness(
          parent
        );


      if (
        completeness >= 75
      ) {

        return "Complete";

      }


      if (
        completeness >= 40
      ) {

        return "Partial";

      }


      return "Incomplete";

    };


  // ============================================================
  // FETCH PARENT CONTACTS
  // ============================================================

  const fetchParentContacts =
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

        const parentSnapshot =
          await getDocs(
            collection(
              db,
              "parents"
            )
          );


        const parentList =
          parentSnapshot.docs.map(
            (
              parentDocument
            ) => ({

              id:
                parentDocument.id,

              ...parentDocument.data()

            })
          );


        parentList.sort(
          (
            firstParent,
            secondParent
          ) =>
            getParentName(
              firstParent
            ).localeCompare(
              getParentName(
                secondParent
              )
            )
        );


        if (
          isMountedRef.current
        ) {

          setParents(
            parentList
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error loading parent contacts:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to load parent contact details. Please check your connection and try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsLoading(false);

          setIsRefreshing(false);

        }

      }

    };


  // ============================================================
  // LOAD CONTACT DATA
  // ============================================================

  useEffect(
    () => {

      fetchParentContacts();

    },
    []
  );


  // ============================================================
  // FILTER CONTACT RECORDS
  // ============================================================

  const filteredParents =
    useMemo(
      () => {

        const normalizedSearch =
          normalizeValue(
            searchTerm
          );


        return parents.filter(
          (
            parent
          ) => {

            const searchableValues =
              [

                parent.parentId,

                getParentName(
                  parent
                ),

                parent.fatherName,

                parent.motherName,

                parent.guardianName,

                parent.mobileNumber,

                parent.alternateMobileNumber,

                parent.emergencyContact,

                getWhatsAppNumber(
                  parent
                ),

                parent.email,

                getCompleteAddress(
                  parent
                )

              ]
                .map(
                  normalizeValue
                )
                .join(" ");


            const matchesSearch =
              !normalizedSearch ||

              searchableValues.includes(
                normalizedSearch
              );


            let matchesContactFilter =
              true;


            if (
              contactFilter === "Mobile Available"
            ) {

              matchesContactFilter =
                Boolean(
                  cleanPhoneNumber(
                    parent.mobileNumber
                  )
                );

            }


            if (
              contactFilter === "WhatsApp Available"
            ) {

              matchesContactFilter =
                Boolean(
                  cleanPhoneNumber(
                    getWhatsAppNumber(
                      parent
                    )
                  )
                );

            }


            if (
              contactFilter === "Email Available"
            ) {

              matchesContactFilter =
                Boolean(
                  String(
                    parent.email || ""
                  ).trim()
                );

            }


            if (
              contactFilter === "Emergency Contact"
            ) {

              matchesContactFilter =
                Boolean(
                  cleanPhoneNumber(
                    parent.emergencyContact
                  )
                );

            }


            const matchesStatus =
              statusFilter === "All" ||

              getContactStatus(
                parent
              ) ===
                statusFilter;


            return (

              matchesSearch &&

              matchesContactFilter &&

              matchesStatus

            );

          }
        );

      },
      [
        parents,
        searchTerm,
        contactFilter,
        statusFilter
      ]
    );


  // ============================================================
  // CONTACT STATISTICS
  // ============================================================

  const contactStatistics =
    useMemo(
      () => {

        const mobileAvailable =
          parents.filter(
            (
              parent
            ) =>
              Boolean(
                cleanPhoneNumber(
                  parent.mobileNumber
                )
              )
          ).length;


        const whatsAppAvailable =
          parents.filter(
            (
              parent
            ) =>
              Boolean(
                cleanPhoneNumber(
                  getWhatsAppNumber(
                    parent
                  )
                )
              )
          ).length;


        const emailAvailable =
          parents.filter(
            (
              parent
            ) =>
              Boolean(
                String(
                  parent.email || ""
                ).trim()
              )
          ).length;


        const completeContacts =
          parents.filter(
            (
              parent
            ) =>
              getContactStatus(
                parent
              ) ===
              "Complete"
          ).length;


        return {

          total:
            parents.length,

          mobileAvailable,

          whatsAppAvailable,

          emailAvailable,

          completeContacts

        };

      },
      [
        parents
      ]
    );


  // ============================================================
  // REFRESH CONTACT DATA
  // ============================================================

  const refreshContactData =
    async () => {

      await fetchParentContacts(
        true
      );

    };


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setContactFilter("All");

      setStatusFilter("All");

    };


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =

    Boolean(
      searchTerm
    ) ||

    contactFilter !== "All" ||

    statusFilter !== "All";
      // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <Layout>

      <div className="accounts-page">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >

          <div>

            <h1
              style={{
                margin: "0 0 6px"
              }}
            >
              📞 Contact Details
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              View and manage parent mobile numbers, WhatsApp contacts, email addresses, emergency contacts, and residential information.
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
              onClick={refreshContactData}
              disabled={
                isLoading ||
                isRefreshing
              }
            >
              {
                isRefreshing
                  ?
                  "⏳ Refreshing..."
                  :
                  "🔄 Refresh"
              }
            </button>


            <Link
              to="/parent-list"
              className="action-btn"
            >
              👨‍👩‍👧 Parent List
            </Link>


            <Link
              to="/add-parent"
              className="action-btn view-btn"
            >
              ➕ Add Parent
            </Link>

          </div>

        </div>


        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

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


        {/* ======================================================
            LOADING STATE
        ====================================================== */}

        {
          isLoading && (

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
                  Loading Contact Details...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while parent contact records are loaded from the database.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            MAIN PAGE CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  CONTACT STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "20px"
                }}
              >

                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    TOTAL PARENTS
                  </p>


                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    {contactStatistics.total}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    MOBILE AVAILABLE
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#2563eb"
                    }}
                  >
                    {contactStatistics.mobileAvailable}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    WHATSAPP AVAILABLE
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#15803d"
                    }}
                  >
                    {contactStatistics.whatsAppAvailable}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    EMAIL AVAILABLE
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#7c3aed"
                    }}
                  >
                    {contactStatistics.emailAvailable}
                  </h2>

                </div>


                <div className="section-card">

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}
                  >
                    COMPLETE CONTACTS
                  </p>


                  <h2
                    style={{
                      margin: 0,
                      color: "#0891b2"
                    }}
                  >
                    {contactStatistics.completeContacts}
                  </h2>

                </div>

              </div>


              {/* ==================================================
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "20px"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      🔍 Search Contact Records
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Find parent contacts using names, IDs, mobile numbers, email addresses, or locations.
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
                      Search Contact
                    </label>


                    <input
                      type="text"
                      placeholder="Search name, Parent ID, mobile, email, address..."
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
                      Contact Availability
                    </label>


                    <select
                      value={contactFilter}
                      onChange={(event) =>
                        setContactFilter(
                          event.target.value
                        )
                      }
                    >

                      <option value="All">
                        All Contacts
                      </option>

                      <option value="Mobile Available">
                        Mobile Available
                      </option>

                      <option value="WhatsApp Available">
                        WhatsApp Available
                      </option>

                      <option value="Email Available">
                        Email Available
                      </option>

                      <option value="Emergency Contact">
                        Emergency Contact Available
                      </option>

                    </select>

                  </div>


                  <div>

                    <label>
                      Contact Completeness
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
                        All Statuses
                      </option>

                      <option value="Complete">
                        Complete
                      </option>

                      <option value="Partial">
                        Partial
                      </option>

                      <option value="Incomplete">
                        Incomplete
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  CONTACT RESULTS HEADER
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                  marginBottom: "18px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin: "0 0 6px"
                    }}
                  >
                    📋 Parent Contact Records
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {filteredParents.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {parents.length}
                    </strong>
                    {" "}
                    parent contacts
                  </p>

                </div>

              </div>
                            {/* ==================================================
                  NO CONTACT RECORDS
              ================================================== */}

              {
                parents.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "55px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "56px",
                          marginBottom: "14px"
                        }}
                      >
                        📞
                      </div>


                      <h2>
                        No Parent Contact Records Yet
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          lineHeight: "1.7"
                        }}
                      >
                        Add a parent record to start managing parent and guardian contact information.
                      </p>


                      <Link
                        to="/add-parent"
                        className="action-btn view-btn"
                      >
                        ➕ Add Parent
                      </Link>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS
              ================================================== */}

              {
                parents.length > 0 &&
                filteredParents.length === 0 && (

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
                        No Matching Contact Records Found
                      </h2>


                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b"
                        }}
                      >
                        Try changing the search text or clearing the active filters.
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


              {/* ==================================================
                  CONTACT RECORD CARDS
              ================================================== */}

              {
                filteredParents.length > 0 &&

                filteredParents.map(
                  (
                    parent
                  ) => {

                    const parentName =
                      getParentName(
                        parent
                      );


                    const whatsAppNumber =
                      cleanPhoneNumber(
                        getWhatsAppNumber(
                          parent
                        )
                      );


                    const mobileNumber =
                      cleanPhoneNumber(
                        parent.mobileNumber
                      );


                    const alternateMobileNumber =
                      cleanPhoneNumber(
                        parent.alternateMobileNumber
                      );


                    const emergencyContact =
                      cleanPhoneNumber(
                        parent.emergencyContact
                      );


                    const contactCompleteness =
                      getContactCompleteness(
                        parent
                      );


                    const contactStatus =
                      getContactStatus(
                        parent
                      );


                    return (

                      <div
                        className="student-card"
                        key={parent.id}
                        style={{
                          marginBottom: "18px"
                        }}
                      >

                        {/* ========================================
                            CONTACT CARD HEADER
                        ======================================== */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "16px",
                            flexWrap: "wrap"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "14px"
                            }}
                          >

                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "12px",
                                background: "#eff6ff",
                                fontSize: "26px",
                                flexShrink: 0
                              }}
                            >
                              👨‍👩‍👧
                            </div>


                            <div>

                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#64748b",
                                  fontSize: "11px",
                                  fontWeight: "800"
                                }}
                              >
                                PARENT CONTACT RECORD
                              </p>


                              <h2
                                style={{
                                  margin: "0 0 6px"
                                }}
                              >
                                {parentName}
                              </h2>


                              <p
                                style={{
                                  margin: 0,
                                  color: "#64748b"
                                }}
                              >
                                Parent ID:
                                {" "}
                                <strong>
                                  {
                                    displayValue(
                                      parent.parentId,
                                      "Legacy Record"
                                    )
                                  }
                                </strong>
                              </p>

                            </div>

                          </div>


                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap"
                            }}
                          >

                            <span
                              style={{
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background:
                                  contactStatus === "Complete"
                                    ?
                                    "#dcfce7"
                                    :
                                    contactStatus === "Partial"
                                      ?
                                      "#fef3c7"
                                      :
                                      "#fee2e2",
                                color:
                                  contactStatus === "Complete"
                                    ?
                                    "#15803d"
                                    :
                                    contactStatus === "Partial"
                                      ?
                                      "#b45309"
                                      :
                                      "#b91c1c",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              {
                                contactStatus === "Complete"
                                  ?
                                  "✅"
                                  :
                                  contactStatus === "Partial"
                                    ?
                                    "🟡"
                                    :
                                    "⚠️"
                              }
                              {" "}
                              {contactStatus}
                            </span>


                            <span
                              style={{
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background: "#f1f5f9",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: "700"
                              }}
                            >
                              {contactCompleteness}% Complete
                            </span>

                          </div>

                        </div>


                        {/* ========================================
                            PRIMARY CONTACT INFORMATION
                        ======================================== */}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "14px",
                            marginTop: "20px"
                          }}
                        >

                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#1d4ed8",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              📱 PRIMARY MOBILE
                            </p>


                            <h3
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  parent.mobileNumber
                                )
                              }
                            </h3>

                          </div>


                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#15803d",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              💬 WHATSAPP NUMBER
                            </p>


                            <h3
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  getWhatsAppNumber(
                                    parent
                                  )
                                )
                              }
                            </h3>

                          </div>


                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#fff7ed",
                              border: "1px solid #fed7aa"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#c2410c",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              🚨 EMERGENCY CONTACT
                            </p>


                            <h3
                              style={{
                                margin: 0
                              }}
                            >
                              {
                                displayValue(
                                  parent.emergencyContact
                                )
                              }
                            </h3>

                          </div>


                          <div
                            style={{
                              padding: "16px",
                              borderRadius: "10px",
                              background: "#faf5ff",
                              border: "1px solid #e9d5ff"
                            }}
                          >

                            <p
                              style={{
                                margin: "0 0 8px",
                                color: "#7e22ce",
                                fontSize: "11px",
                                fontWeight: "800"
                              }}
                            >
                              ✉️ EMAIL ADDRESS
                            </p>


                            <h3
                              style={{
                                margin: 0,
                                wordBreak: "break-word"
                              }}
                            >
                              {
                                displayValue(
                                  parent.email
                                )
                              }
                            </h3>

                          </div>

                        </div>


                        {/* ========================================
                            ADDITIONAL CONTACT DETAILS
                        ======================================== */}

                        <div
                          className="section-card"
                          style={{
                            marginTop: "18px",
                            marginBottom: 0
                          }}
                        >

                          <h3
                            style={{
                              margin: "0 0 14px"
                            }}
                          >
                            📋 Additional Contact Information
                          </h3>


                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "12px"
                            }}
                          >

                            <div>

                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                  fontWeight: "700"
                                }}
                              >
                                ALTERNATE MOBILE
                              </p>


                              <strong>
                                {
                                  displayValue(
                                    parent.alternateMobileNumber
                                  )
                                }
                              </strong>

                            </div>


                            <div>

                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                  fontWeight: "700"
                                }}
                              >
                                PRIMARY GUARDIAN
                              </p>


                              <strong>
                                {
                                  displayValue(
                                    parent.primaryGuardian ||
                                    parent.relationship
                                  )
                                }
                              </strong>

                            </div>


                            <div>

                              <p
                                style={{
                                  margin: "0 0 5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                  fontWeight: "700"
                                }}
                              >
                                RECORD STATUS
                              </p>


                              <strong>
                                {
                                  displayValue(
                                    parent.status,
                                    "Active"
                                  )
                                }
                              </strong>

                            </div>

                          </div>

                        </div>


                        {/* ========================================
                            ADDRESS INFORMATION
                        ======================================== */}

                        <div
                          style={{
                            padding: "16px",
                            marginTop: "18px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                          }}
                        >

                          <p
                            style={{
                              margin: "0 0 8px",
                              color: "#64748b",
                              fontSize: "11px",
                              fontWeight: "800"
                            }}
                          >
                            📍 RESIDENTIAL ADDRESS
                          </p>


                          <p
                            style={{
                              margin: 0,
                              lineHeight: "1.8"
                            }}
                          >
                            {
                              getCompleteAddress(
                                parent
                              )
                            }
                          </p>

                        </div>


                        {/* ========================================
                            QUICK CONTACT ACTIONS
                        ======================================== */}

                        <div
                          style={{
                            marginTop: "20px"
                          }}
                        >

                          <p
                            style={{
                              margin: "0 0 10px",
                              color: "#64748b",
                              fontSize: "12px",
                              fontWeight: "800"
                            }}
                          >
                            ⚡ QUICK CONTACT ACTIONS
                          </p>


                          <div
                            className="student-actions"
                          >

                            {
                              mobileNumber && (

                                <a
                                  href={`tel:${mobileNumber}`}
                                  className="action-btn view-btn"
                                >
                                  📞 Call
                                </a>

                              )
                            }


                            {
                              whatsAppNumber && (

                                <a
                                  href={
                                    `https://wa.me/91${whatsAppNumber}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-btn"
                                >
                                  💬 WhatsApp
                                </a>

                              )
                            }


                            {
                              parent.email && (

                                <a
                                  href={`mailto:${parent.email}`}
                                  className="action-btn"
                                >
                                  ✉️ Email
                                </a>

                              )
                            }


                            {
                              alternateMobileNumber && (

                                <a
                                  href={
                                    `tel:${alternateMobileNumber}`
                                  }
                                  className="action-btn"
                                >
                                  📱 Alternate Call
                                </a>

                              )
                            }


                            {
                              emergencyContact && (

                                <a
                                  href={
                                    `tel:${emergencyContact}`
                                  }
                                  className="action-btn"
                                >
                                  🚨 Emergency Call
                                </a>

                              )
                            }

                          </div>

                        </div>


                        {/* ========================================
                            RECORD ACTIONS
                        ======================================== */}

                        <div
                          className="student-actions"
                          style={{
                            marginTop: "18px"
                          }}
                        >

                          <Link
                            to={
                              `/parent-profile/${parent.id}`
                            }
                            className="action-btn view-btn"
                          >
                            👁 View Profile
                          </Link>


                          <Link
                            to={
                              `/edit-parent/${parent.id}`
                            }
                            className="action-btn edit-btn"
                          >
                            ✏ Edit Contact Details
                          </Link>

                        </div>

                      </div>

                    );

                  }
                )
              }


              {/* ==================================================
                  PAGE INFORMATION
              ================================================== */}

              <div
                style={{
                  padding: "14px 16px",
                  marginTop: "20px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                  color: "#64748b",
                  lineHeight: "1.7"
                }}
              >
                🕌 Parent contact information is managed directly from the main parent records in the Madrasa ERP system.
              </div>

            </>

          )
        }


        {/* ======================================================
            BOTTOM SPACING
        ====================================================== */}

        <div
          style={{
            height: "50px"
          }}
        />

      </div>

    </Layout>

  );

}

export default ContactDetails;