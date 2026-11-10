import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Roles() {

  // ============================================================
  // COMPONENT REFERENCES
  // ============================================================

  const isMountedRef =
    useRef(true);


  const searchInputRef =
    useRef(null);


  // ============================================================
  // STAFF DATABASE STATES
  // ============================================================

  const [
    staff,
    setStaff
  ] = useState([]);


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    roleFilter,
    setRoleFilter
  ] = useState("All");


  const [
    permissionFilter,
    setPermissionFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState("name-ascending");


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
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // ROLE EDITOR STATES
  // ============================================================

  const [
    selectedStaff,
    setSelectedStaff
  ] = useState(null);


  const [
    selectedRole,
    setSelectedRole
  ] = useState("");


  const [
    selectedPermissions,
    setSelectedPermissions
  ] = useState([]);


  const [
    showRoleEditor,
    setShowRoleEditor
  ] = useState(false);


  // ============================================================
  // SAVE CONFIRMATION STATE
  // ============================================================

  const [
    showSaveConfirmation,
    setShowSaveConfirmation
  ] = useState(false);


  // ============================================================
  // ROLE DEFINITIONS
  // ============================================================

  const roleDefinitions =
    useMemo(
      () => ({

        "Super Admin": {

          icon: "👑",

          description:
            "Complete access to all Madrasa ERP modules and settings.",

          permissions: [

            "Dashboard Access",

            "Student Management",

            "Staff Management",

            "Parent Management",

            "Attendance Management",

            "Fees Management",

            "Accounts Management",

            "Donation Management",

            "Salary Management",

            "Health Records",

            "Reports Access",

            "Notification Management",

            "User Management",

            "Role Management",

            "Settings Management"

          ]

        },


        "Principal": {

          icon: "🏫",

          description:
            "Manage academic activities, students, staff and reports.",

          permissions: [

            "Dashboard Access",

            "Student Management",

            "Staff Management",

            "Parent Management",

            "Attendance Management",

            "Fees Management",

            "Health Records",

            "Reports Access",

            "Notification Management"

          ]

        },


        "Imam": {

          icon: "🕌",

          description:
            "Manage religious activities and access relevant student information.",

          permissions: [

            "Dashboard Access",

            "Student View",

            "Attendance View",

            "Notification Management"

          ]

        },


        "Teacher": {

          icon: "👨‍🏫",

          description:
            "Manage students, attendance and academic information.",

          permissions: [

            "Dashboard Access",

            "Student View",

            "Attendance Management",

            "Health Records",

            "Notification Management"

          ]

        },


        "Accountant": {

          icon: "🧾",

          description:
            "Manage accounts, fees, donations and staff salary records.",

          permissions: [

            "Dashboard Access",

            "Fees Management",

            "Accounts Management",

            "Donation Management",

            "Salary Management",

            "Reports Access"

          ]

        },


        "Data Entry Operator": {

          icon: "⌨️",

          description:
            "Enter and update Madrasa operational records.",

          permissions: [

            "Dashboard Access",

            "Student Management",

            "Staff View",

            "Parent Management",

            "Attendance Management",

            "Fees Management"

          ]

        },


        "Viewer": {

          icon: "👁",

          description:
            "Read-only access to approved Madrasa information.",

          permissions: [

            "Dashboard Access",

            "Student View",

            "Staff View",

            "Attendance View",

            "Reports Access"

          ]

        }

      }),
      []
    );


  // ============================================================
  // ALL AVAILABLE PERMISSIONS
  // ============================================================

  const availablePermissions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            Object.values(
              roleDefinitions
            ).flatMap(
              (
                role
              ) =>
                role.permissions
            )
          )
        ).sort();

      },
      [
        roleDefinitions
      ]
    );


  // ============================================================
  // ROLE OPTIONS
  // ============================================================

  const roleOptions =
    useMemo(
      () => {

        return Object.keys(
          roleDefinitions
        );

      },
      [
        roleDefinitions
      ]
    );


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
  // DISPLAY FALLBACK VALUE
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "Not Available"
    ) => {

      if (
        value === undefined ||
        value === null ||
        String(
          value
        ).trim() === ""
      ) {

        return fallback;

      }


      return value;

    };


  // ============================================================
  // NORMALIZE SEARCH VALUE
  // ============================================================

  const normalizeSearchValue =
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
  // GET STAFF STATUS
  // ============================================================

  const getStaffStatus =
    (
      member
    ) => {

      if (
        member.staffStatus
      ) {

        return member.staffStatus;

      }


      if (
        member.isActive === false
      ) {

        return "Inactive";

      }


      return "Active";

    };


  // ============================================================
  // GET STAFF ROLE
  // ============================================================

  const getStaffRole =
    (
      member
    ) => {

      return (
        member.systemRole ||
        member.role ||
        "Not Assigned"
      );

    };


  // ============================================================
  // GET STAFF PERMISSIONS
  // ============================================================

  const getStaffPermissions =
    (
      member
    ) => {

      if (
        Array.isArray(
          member.permissions
        )
      ) {

        return member.permissions;

      }


      return [];

    };


  // ============================================================
  // GET ROLE ICON
  // ============================================================

  const getRoleIcon =
    (
      role
    ) => {

      return (
        roleDefinitions[role]?.icon ||
        "🛡"
      );

    };


  // ============================================================
  // GET ROLE DESCRIPTION
  // ============================================================

  const getRoleDescription =
    (
      role
    ) => {

      return (
        roleDefinitions[role]?.description ||
        "No system role has been assigned to this staff member."
      );

    };


  // ============================================================
  // FETCH STAFF
  // ============================================================

  const fetchStaff =
    useCallback(
      async (
        showRefreshState = false
      ) => {

        if (
          showRefreshState
        ) {

          setIsRefreshing(true);

        }
        else {

          setIsLoading(true);

        }


        setErrorMessage("");


        try {

          const staffSnapshot =
            await getDocs(
              collection(
                db,
                "staff"
              )
            );


          const staffList =
            staffSnapshot.docs
              .map(
                (
                  staffDocument
                ) => ({

                  id:
                    staffDocument.id,

                  ...staffDocument.data()

                })
              )
              .filter(
                (
                  member
                ) =>
                  member.isDeleted !== true
              );


          if (
            isMountedRef.current
          ) {

            setStaff(
              staffList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error loading staff roles:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load staff roles. Please check your connection and try again."
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

      },
      []
    );


  // ============================================================
  // LOAD STAFF
  // ============================================================

  useEffect(
    () => {

      fetchStaff();

    },
    [
      fetchStaff
    ]
  );


  // ============================================================
  // FILTERED AND SORTED STAFF
  // ============================================================

  const filteredStaff =
    useMemo(
      () => {

        const normalizedSearchTerm =
          normalizeSearchValue(
            searchTerm
          );


        const filteredMembers =
          staff.filter(
            (
              member
            ) => {

              const memberRole =
                getStaffRole(
                  member
                );


              const memberPermissions =
                getStaffPermissions(
                  member
                );


              const matchesSearch =
                !normalizedSearchTerm ||
                [

                  member.staffName,

                  member.staffId,

                  member.mobileNumber,

                  member.position,

                  member.department,

                  memberRole,

                  ...memberPermissions

                ].some(
                  (
                    value
                  ) =>
                    normalizeSearchValue(
                      value
                    ).includes(
                      normalizedSearchTerm
                    )
                );


              const matchesRole =
                roleFilter === "All" ||

                (
                  roleFilter === "Not Assigned"
                    ?
                    memberRole === "Not Assigned"
                    :
                    memberRole === roleFilter
                );


              const matchesPermission =
                permissionFilter === "All" ||
                memberPermissions.includes(
                  permissionFilter
                );


              return (

                matchesSearch &&

                matchesRole &&

                matchesPermission

              );

            }
          );


        return filteredMembers.sort(
          (
            firstStaff,
            secondStaff
          ) => {

            if (
              sortOption === "name-descending"
            ) {

              return normalizeSearchValue(
                secondStaff.staffName
              ).localeCompare(
                normalizeSearchValue(
                  firstStaff.staffName
                )
              );

            }


            if (
              sortOption === "role-ascending"
            ) {

              return normalizeSearchValue(
                getStaffRole(
                  firstStaff
                )
              ).localeCompare(
                normalizeSearchValue(
                  getStaffRole(
                    secondStaff
                  )
                )
              );

            }


            if (
              sortOption === "role-descending"
            ) {

              return normalizeSearchValue(
                getStaffRole(
                  secondStaff
                )
              ).localeCompare(
                normalizeSearchValue(
                  getStaffRole(
                    firstStaff
                  )
                )
              );

            }


            return normalizeSearchValue(
              firstStaff.staffName
            ).localeCompare(
              normalizeSearchValue(
                secondStaff.staffName
              )
            );

          }
        );

      },
      [
        staff,
        searchTerm,
        roleFilter,
        permissionFilter,
        sortOption
      ]
    );


  // ============================================================
  // ROLE STATISTICS
  // ============================================================

  const roleStatistics =
    useMemo(
      () => {

        const activeStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffStatus(
                member
              ) === "Active"
          );


        const assignedStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffRole(
                member
              ) !== "Not Assigned"
          );


        const unassignedStaff =
          staff.filter(
            (
              member
            ) =>
              getStaffRole(
                member
              ) === "Not Assigned"
          );


        const administrators =
          staff.filter(
            (
              member
            ) =>
              getStaffRole(
                member
              ) === "Super Admin"
          );


        return {

          totalStaff:
            staff.length,

          activeStaff:
            activeStaff.length,

          assignedStaff:
            assignedStaff.length,

          unassignedStaff:
            unassignedStaff.length,

          administrators:
            administrators.length

        };

      },
      [
        staff
      ]
    );


  // ============================================================
  // CHECK ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters =
    useMemo(
      () => {

        return (

          searchTerm.trim() !== "" ||

          roleFilter !== "All" ||

          permissionFilter !== "All" ||

          sortOption !== "name-ascending"

        );

      },
      [
        searchTerm,
        roleFilter,
        permissionFilter,
        sortOption
      ]
    );


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {

      setSearchTerm("");

      setRoleFilter("All");

      setPermissionFilter("All");

      setSortOption(
        "name-ascending"
      );


      setTimeout(
        () => {

          searchInputRef.current?.focus();

        },
        0
      );

    };


  // ============================================================
  // OPEN ROLE EDITOR
  // ============================================================

  const openRoleEditor =
    (
      member
    ) => {

      const currentRole =
        getStaffRole(
          member
        );


      setSelectedStaff(
        member
      );


      setSelectedRole(
        currentRole === "Not Assigned"
          ?
          ""
          :
          currentRole
      );


      setSelectedPermissions(
        getStaffPermissions(
          member
        )
      );


      setErrorMessage("");

      setSuccessMessage("");

      setShowRoleEditor(true);

    };


  // ============================================================
  // CLOSE ROLE EDITOR
  // ============================================================

  const closeRoleEditor =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setSelectedStaff(null);

      setSelectedRole("");

      setSelectedPermissions([]);

      setShowRoleEditor(false);

      setShowSaveConfirmation(false);

    };


  // ============================================================
  // CHANGE SELECTED ROLE
  // ============================================================

  const changeSelectedRole =
    (
      role
    ) => {

      setSelectedRole(
        role
      );


      setSelectedPermissions(
        roleDefinitions[role]?.permissions ||
        []
      );


      setErrorMessage("");

    };


  // ============================================================
  // TOGGLE PERMISSION
  // ============================================================

  const togglePermission =
    (
      permission
    ) => {

      setSelectedPermissions(
        (
          previousPermissions
        ) => {

          if (
            previousPermissions.includes(
              permission
            )
          ) {

            return previousPermissions.filter(
              (
                currentPermission
              ) =>
                currentPermission !==
                permission
            );

          }


          return [

            ...previousPermissions,

            permission

          ];

        }
      );

    };


  // ============================================================
  // VALIDATE ROLE FORM
  // ============================================================

  const validateRoleForm =
    () => {

      if (
        !selectedStaff
      ) {

        setErrorMessage(
          "Please select a staff member."
        );

        return false;

      }


      if (
        !selectedRole
      ) {

        setErrorMessage(
          "Please select a system role."
        );

        return false;

      }


      if (
        selectedPermissions.length === 0
      ) {

        setErrorMessage(
          "Please select at least one permission."
        );

        return false;

      }


      setErrorMessage("");

      return true;

    };


  // ============================================================
  // REQUEST SAVE ROLE
  // ============================================================

  const requestSaveRole =
    () => {

      if (
        !validateRoleForm()
      ) {

        return;

      }


      setShowSaveConfirmation(true);

    };


  // ============================================================
  // CANCEL SAVE ROLE
  // ============================================================

  const cancelSaveRole =
    () => {

      if (
        isSaving
      ) {

        return;

      }


      setShowSaveConfirmation(false);

    };


  // ============================================================
  // REFRESH STAFF ROLES
  // ============================================================

  const refreshStaffRoles =
    async () => {

      await fetchStaff(true);

    };
      // ============================================================
  // SAVE ROLE TO FIREBASE
  // ============================================================

  const confirmSaveRole =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      if (
        !validateRoleForm()
      ) {

        setShowSaveConfirmation(false);

        return;

      }


      setIsSaving(true);

      setErrorMessage("");

      setSuccessMessage("");


      try {

        const staffDocumentReference =
          doc(
            db,
            "staff",
            selectedStaff.id
          );


        await updateDoc(
          staffDocumentReference,
          {

            systemRole:
              selectedRole,

            permissions:
              selectedPermissions,

            roleUpdatedAt:
              serverTimestamp()

          }
        );


        if (
          isMountedRef.current
        ) {

          setStaff(
            (
              previousStaff
            ) =>
              previousStaff.map(
                (
                  member
                ) => {

                  if (
                    member.id ===
                    selectedStaff.id
                  ) {

                    return {

                      ...member,

                      systemRole:
                        selectedRole,

                      permissions:
                        selectedPermissions

                    };

                  }


                  return member;

                }
              )
          );


          setSuccessMessage(
            `${selectedRole} role assigned to ${selectedStaff.staffName} successfully.`
          );


          setShowSaveConfirmation(false);

          setShowRoleEditor(false);

          setSelectedStaff(null);

          setSelectedRole("");

          setSelectedPermissions([]);

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error saving staff role:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            "Unable to save the staff role. Please check your connection and try again."
          );


          setShowSaveConfirmation(false);

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsSaving(false);

        }

      }

    };


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
            alignItems: "center",
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
              🛡 Staff Roles & Permissions
            </h1>


            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Assign system roles and manage access permissions for Madrasa staff.
            </p>

          </div>


          <button
            type="button"
            onClick={
              refreshStaffRoles
            }
            disabled={
              isLoading ||
              isRefreshing ||
              isSaving
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
            SUCCESS MESSAGE
        ====================================================== */}

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


        {/* ======================================================
            LOADING STATE
        ====================================================== */}

        {
          isLoading && (

            <div className="section-card">

              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center"
                }}
              >

                <div
                  style={{
                    fontSize: "48px",
                    marginBottom: "14px"
                  }}
                >
                  ⏳
                </div>


                <h2>
                  Loading Staff Roles...
                </h2>


                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Please wait while staff and role information is being loaded.
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            STAFF ROLES CONTENT
        ====================================================== */}

        {
          !isLoading && (

            <>

              {/* ==================================================
                  ROLE STATISTICS
              ================================================== */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "22px"
                }}
              >

                {
                  [

                    [
                      "👥",
                      "Total Staff",
                      roleStatistics.totalStaff,
                      "#475569"
                    ],

                    [
                      "✅",
                      "Active Staff",
                      roleStatistics.activeStaff,
                      "#15803d"
                    ],

                    [
                      "🛡",
                      "Roles Assigned",
                      roleStatistics.assignedStaff,
                      "#2563eb"
                    ],

                    [
                      "⚠️",
                      "Not Assigned",
                      roleStatistics.unassignedStaff,
                      "#b45309"
                    ],

                    [
                      "👑",
                      "Super Admins",
                      roleStatistics.administrators,
                      "#7c3aed"
                    ]

                  ].map(
                    (
                      [
                        icon,
                        label,
                        value,
                        textColor
                      ]
                    ) => (

                      <div
                        className="section-card"
                        key={
                          label
                        }
                      >

                        <p
                          style={{
                            margin: "0 0 8px",
                            color: textColor,
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          {icon} {label.toUpperCase()}
                        </p>


                        <h2
                          style={{
                            margin: 0,
                            fontSize: "30px",
                            color: textColor
                          }}
                        >
                          {value}
                        </h2>

                      </div>

                    )
                  )
                }

              </div>


              {/* ==================================================
                  ROLE INFORMATION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 6px"
                  }}
                >
                  🛡 Available System Roles
                </h2>


                <p
                  style={{
                    margin: "0 0 20px",
                    color: "#64748b"
                  }}
                >
                  Each role includes default permissions that can be customized for individual staff members.
                </p>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "14px"
                  }}
                >

                  {
                    roleOptions.map(
                      (
                        role
                      ) => (

                        <div
                          key={
                            role
                          }
                          style={{
                            padding: "16px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0"
                          }}
                        >

                          <div
                            style={{
                              fontSize: "30px",
                              marginBottom: "10px"
                            }}
                          >
                            {
                              getRoleIcon(
                                role
                              )
                            }
                          </div>


                          <h3
                            style={{
                              margin: "0 0 7px"
                            }}
                          >
                            {role}
                          </h3>


                          <p
                            style={{
                              margin: "0 0 10px",
                              color: "#64748b",
                              lineHeight: "1.6"
                            }}
                          >
                            {
                              getRoleDescription(
                                role
                              )
                            }
                          </p>


                          <strong
                            style={{
                              color: "#2563eb",
                              fontSize: "12px"
                            }}
                          >
                            {
                              roleDefinitions[role]
                                .permissions
                                .length
                            }
                            {" "}
                            DEFAULT PERMISSIONS
                          </strong>

                        </div>

                      )
                    )
                  }

                </div>

              </div>


              {/* ==================================================
                  SEARCH AND FILTER SECTION
              ================================================== */}

              <div
                className="section-card"
                style={{
                  marginBottom: "22px"
                }}
              >

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
                        margin: "0 0 5px"
                      }}
                    >
                      🔍 Search Staff Roles
                    </h2>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Search staff and filter records by role or permission.
                    </p>

                  </div>


                  {
                    hasActiveFilters && (

                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                        disabled={
                          isSaving
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    )
                  }

                </div>


                {/* ================================================
                    SEARCH INPUT
                ================================================ */}

                <div
                  style={{
                    marginBottom: "18px"
                  }}
                >

                  <label>
                    Search Staff
                  </label>


                  <input
                    ref={
                      searchInputRef
                    }
                    type="text"
                    placeholder="Search name, Staff ID, mobile, position, department, role or permission..."
                    value={
                      searchTerm
                    }
                    onChange={
                      (
                        event
                      ) =>
                        setSearchTerm(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving
                    }
                  />

                </div>


                {/* ================================================
                    FILTER GRID
                ================================================ */}

                <div className="form-grid">

                  <div>

                    <label>
                      System Role
                    </label>


                    <select
                      value={
                        roleFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setRoleFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="All">
                        All Roles
                      </option>


                      <option value="Not Assigned">
                        Not Assigned
                      </option>


                      {
                        roleOptions.map(
                          (
                            role
                          ) => (

                            <option
                              key={
                                role
                              }
                              value={
                                role
                              }
                            >
                              {role}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Permission
                    </label>


                    <select
                      value={
                        permissionFilter
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setPermissionFilter(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="All">
                        All Permissions
                      </option>


                      {
                        availablePermissions.map(
                          (
                            permission
                          ) => (

                            <option
                              key={
                                permission
                              }
                              value={
                                permission
                              }
                            >
                              {permission}
                            </option>

                          )
                        )
                      }

                    </select>

                  </div>


                  <div>

                    <label>
                      Sort Staff
                    </label>


                    <select
                      value={
                        sortOption
                      }
                      onChange={
                        (
                          event
                        ) =>
                          setSortOption(
                            event.target.value
                          )
                      }
                      disabled={
                        isSaving
                      }
                    >

                      <option value="name-ascending">
                        Staff Name A → Z
                      </option>

                      <option value="name-descending">
                        Staff Name Z → A
                      </option>

                      <option value="role-ascending">
                        Role A → Z
                      </option>

                      <option value="role-descending">
                        Role Z → A
                      </option>

                    </select>

                  </div>

                </div>


                {/* ================================================
                    RESULT SUMMARY
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                    paddingTop: "18px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    Showing
                    {" "}
                    <strong>
                      {filteredStaff.length}
                    </strong>
                    {" "}
                    of
                    {" "}
                    <strong>
                      {staff.length}
                    </strong>
                    {" "}
                    staff members
                  </p>


                  {
                    hasActiveFilters && (

                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        FILTERS ACTIVE
                      </span>

                    )
                  }

                </div>

              </div>
                            {/* ==================================================
                  EMPTY STAFF DATABASE STATE
              ================================================== */}

              {
                staff.length === 0 &&
                !errorMessage && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "52px",
                          marginBottom: "16px"
                        }}
                      >
                        👥
                      </div>

                      <h2>
                        No Staff Members Available
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Add staff members before assigning system roles and permissions.
                      </p>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  NO FILTER RESULTS STATE
              ================================================== */}

              {
                staff.length > 0 &&
                filteredStaff.length === 0 && (

                  <div className="section-card">

                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center"
                      }}
                    >

                      <div
                        style={{
                          fontSize: "52px",
                          marginBottom: "16px"
                        }}
                      >
                        🔍
                      </div>

                      <h2>
                        No Matching Staff Members
                      </h2>

                      <p
                        style={{
                          margin: "0 0 22px",
                          color: "#64748b"
                        }}
                      >
                        No staff members match your current search and filters.
                      </p>

                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                      >
                        ✖ Reset Filters
                      </button>

                    </div>

                  </div>

                )
              }


              {/* ==================================================
                  STAFF ROLE LIST
              ================================================== */}

              {
                filteredStaff.length > 0 && (

                  <div>

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
                            margin: "0 0 5px"
                          }}
                        >
                          👥 Staff Access Management
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b"
                          }}
                        >
                          Review and manage system access for every staff member.
                        </p>

                      </div>

                      <span
                        style={{
                          padding: "7px 13px",
                          borderRadius: "999px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: "800"
                        }}
                      >
                        {filteredStaff.length} STAFF
                      </span>

                    </div>


                    {/* ==============================================
                        STAFF ROLE CARDS
                    ============================================== */}

                    {
                      filteredStaff.map(
                        (
                          member
                        ) => {

                          const memberRole =
                            getStaffRole(
                              member
                            );


                          const memberPermissions =
                            getStaffPermissions(
                              member
                            );


                          const memberStatus =
                            getStaffStatus(
                              member
                            );


                          return (

                            <div
                              className="student-card"
                              key={
                                member.id
                              }
                              style={{
                                marginBottom: "16px"
                              }}
                            >

                              {/* ====================================
                                  STAFF HEADER
                              ==================================== */}

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
                                    gap: "16px",
                                    flex: 1,
                                    minWidth: 0
                                  }}
                                >

                                  <div
                                    className="student-avatar"
                                    style={{
                                      width: "68px",
                                      height: "68px",
                                      minWidth: "68px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "50%",
                                      background: "#f1f5f9",
                                      fontSize: "32px"
                                    }}
                                  >
                                    {
                                      getRoleIcon(
                                        memberRole
                                      )
                                    }
                                  </div>

                                  <div
                                    style={{
                                      flex: 1,
                                      minWidth: 0
                                    }}
                                  >

                                    <h2
                                      className="student-name"
                                      style={{
                                        margin: "0 0 7px"
                                      }}
                                    >
                                      {
                                        displayValue(
                                          member.staffName,
                                          "Unnamed Staff"
                                        )
                                      }
                                    </h2>

                                    <p
                                      style={{
                                        margin: "0 0 5px",
                                        color: "#475569"
                                      }}
                                    >
                                      🪪 Staff ID:
                                      {" "}
                                      <strong>
                                        {
                                          displayValue(
                                            member.staffId
                                          )
                                        }
                                      </strong>
                                    </p>

                                    <p
                                      style={{
                                        margin: "0 0 5px",
                                        color: "#475569"
                                      }}
                                    >
                                      💼
                                      {" "}
                                      {
                                        displayValue(
                                          member.position
                                        )
                                      }
                                      {" • "}
                                      {
                                        displayValue(
                                          member.department
                                        )
                                      }
                                    </p>

                                    <p
                                      style={{
                                        margin: 0,
                                        color: "#64748b"
                                      }}
                                    >
                                      📞
                                      {" "}
                                      {
                                        displayValue(
                                          member.mobileNumber
                                        )
                                      }
                                    </p>

                                  </div>

                                </div>


                                {/* ==================================
                                    STAFF STATUS
                                ================================== */}

                                <span
                                  style={{
                                    padding: "7px 13px",
                                    borderRadius: "999px",
                                    background:
                                      memberStatus === "Active"
                                        ?
                                        "#dcfce7"
                                        :
                                        "#f1f5f9",
                                    color:
                                      memberStatus === "Active"
                                        ?
                                        "#15803d"
                                        :
                                        "#475569",
                                    fontSize: "12px",
                                    fontWeight: "800"
                                  }}
                                >
                                  {
                                    memberStatus === "Active"
                                      ?
                                      "✅ ACTIVE"
                                      :
                                      "⚪ INACTIVE"
                                  }
                                </span>

                              </div>


                              {/* ====================================
                                  ROLE INFORMATION
                              ==================================== */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "16px",
                                  flexWrap: "wrap",
                                  marginTop: "18px",
                                  padding: "16px",
                                  borderRadius: "10px",
                                  background:
                                    memberRole === "Not Assigned"
                                      ?
                                      "#fffbeb"
                                      :
                                      "#eff6ff",
                                  border:
                                    memberRole === "Not Assigned"
                                      ?
                                      "1px solid #fde68a"
                                      :
                                      "1px solid #bfdbfe"
                                }}
                              >

                                <div>

                                  <p
                                    style={{
                                      margin: "0 0 6px",
                                      color: "#64748b",
                                      fontSize: "11px",
                                      fontWeight: "700"
                                    }}
                                  >
                                    SYSTEM ROLE
                                  </p>

                                  <h3
                                    style={{
                                      margin: "0 0 6px",
                                      color:
                                        memberRole === "Not Assigned"
                                          ?
                                          "#b45309"
                                          :
                                          "#1d4ed8"
                                    }}
                                  >
                                    {
                                      getRoleIcon(
                                        memberRole
                                      )
                                    }
                                    {" "}
                                    {memberRole}
                                  </h3>

                                  <p
                                    style={{
                                      margin: 0,
                                      color: "#64748b",
                                      lineHeight: "1.6"
                                    }}
                                  >
                                    {
                                      getRoleDescription(
                                        memberRole
                                      )
                                    }
                                  </p>

                                </div>

                                <div
                                  style={{
                                    textAlign: "right"
                                  }}
                                >

                                  <p
                                    style={{
                                      margin: "0 0 6px",
                                      color: "#64748b",
                                      fontSize: "11px",
                                      fontWeight: "700"
                                    }}
                                  >
                                    PERMISSIONS
                                  </p>

                                  <strong
                                    style={{
                                      color: "#2563eb",
                                      fontSize: "22px"
                                    }}
                                  >
                                    {
                                      memberPermissions.length
                                    }
                                  </strong>

                                </div>

                              </div>


                              {/* ====================================
                                  PERMISSIONS
                              ==================================== */}

                              <div
                                style={{
                                  marginTop: "18px"
                                }}
                              >

                                <p
                                  style={{
                                    margin: "0 0 10px",
                                    color: "#64748b",
                                    fontSize: "11px",
                                    fontWeight: "700"
                                  }}
                                >
                                  ASSIGNED PERMISSIONS
                                </p>

                                {
                                  memberPermissions.length > 0
                                    ?
                                    (

                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          flexWrap: "wrap"
                                        }}
                                      >

                                        {
                                          memberPermissions.map(
                                            (
                                              permission
                                            ) => (

                                              <span
                                                key={
                                                  permission
                                                }
                                                style={{
                                                  padding: "6px 10px",
                                                  borderRadius: "999px",
                                                  background: "#f1f5f9",
                                                  color: "#475569",
                                                  fontSize: "11px",
                                                  fontWeight: "700"
                                                }}
                                              >
                                                ✓ {permission}
                                              </span>

                                            )
                                          )
                                        }

                                      </div>

                                    )
                                    :
                                    (

                                      <p
                                        style={{
                                          margin: 0,
                                          color: "#b45309"
                                        }}
                                      >
                                        ⚠️ No permissions have been assigned.
                                      </p>

                                    )
                                }

                              </div>


                              {/* ====================================
                                  CARD ACTION
                              ==================================== */}

                              <div
                                className="student-actions"
                                style={{
                                  marginTop: "18px"
                                }}
                              >

                                <button
                                  type="button"
                                  className="action-btn view-btn"
                                  onClick={
                                    () =>
                                      openRoleEditor(
                                        member
                                      )
                                  }
                                  disabled={
                                    isSaving
                                  }
                                >
                                  {
                                    memberRole === "Not Assigned"
                                      ?
                                      "➕ Assign Role"
                                      :
                                      "✏ Edit Role & Permissions"
                                  }
                                </button>

                              </div>

                            </div>

                          );

                        }
                      )
                    }

                  </div>

                )
              }

            </>

          )
        }


        {/* ======================================================
            ROLE EDITOR POPUP
        ====================================================== */}

        {
          showRoleEditor &&
          selectedStaff && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.65)"
              }}
            >

              <div
                className="section-card"
                style={{
                  width: "100%",
                  maxWidth: "760px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                {/* ================================================
                    EDITOR HEADER
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "22px"
                  }}
                >

                  <div>

                    <h2
                      style={{
                        margin: "0 0 6px"
                      }}
                    >
                      🛡 Assign Role & Permissions
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      Configure system access for the selected staff member.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeRoleEditor
                    }
                    disabled={
                      isSaving
                    }
                  >
                    ✖ Close
                  </button>

                </div>


                {/* ================================================
                    SELECTED STAFF INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "22px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px"
                    }}
                  >

                    <div
                      style={{
                        width: "58px",
                        height: "58px",
                        minWidth: "58px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        fontSize: "28px"
                      }}
                    >
                      👳
                    </div>

                    <div>

                      <h3
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        {
                          displayValue(
                            selectedStaff.staffName,
                            "Unnamed Staff"
                          )
                        }
                      </h3>

                      <p
                        style={{
                          margin: "0 0 4px",
                          color: "#64748b"
                        }}
                      >
                        🪪
                        {" "}
                        {
                          displayValue(
                            selectedStaff.staffId
                          )
                        }
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        💼
                        {" "}
                        {
                          displayValue(
                            selectedStaff.position
                          )
                        }
                        {" • "}
                        {
                          displayValue(
                            selectedStaff.department
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ================================================
                    ROLE SELECTION
                ================================================ */}

                <div
                  style={{
                    marginBottom: "22px"
                  }}
                >

                  <label>
                    Select System Role *
                  </label>

                  <select
                    value={
                      selectedRole
                    }
                    onChange={
                      (
                        event
                      ) =>
                        changeSelectedRole(
                          event.target.value
                        )
                    }
                    disabled={
                      isSaving
                    }
                  >

                    <option value="">
                      Select Role
                    </option>

                    {
                      roleOptions.map(
                        (
                          role
                        ) => (

                          <option
                            key={
                              role
                            }
                            value={
                              role
                            }
                          >
                            {
                              getRoleIcon(
                                role
                              )
                            }
                            {" "}
                            {role}
                          </option>

                        )
                      )
                    }

                  </select>

                </div>


                {/* ================================================
                    SELECTED ROLE INFORMATION
                ================================================ */}

                {
                  selectedRole && (

                    <div
                      style={{
                        padding: "16px",
                        marginBottom: "22px",
                        borderRadius: "10px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe"
                      }}
                    >

                      <h3
                        style={{
                          margin: "0 0 7px",
                          color: "#1d4ed8"
                        }}
                      >
                        {
                          getRoleIcon(
                            selectedRole
                          )
                        }
                        {" "}
                        {selectedRole}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: "1.6"
                        }}
                      >
                        {
                          getRoleDescription(
                            selectedRole
                          )
                        }
                      </p>

                    </div>

                  )
                }


                {/* ================================================
                    PERMISSION SELECTION
                ================================================ */}

                <div
                  style={{
                    marginBottom: "22px"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "14px"
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin: "0 0 5px"
                        }}
                      >
                        🔐 Access Permissions
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        Customize the permissions for this staff member.
                      </p>

                    </div>

                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                    >
                      {selectedPermissions.length} SELECTED
                    </span>

                  </div>


                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px"
                    }}
                  >

                    {
                      availablePermissions.map(
                        (
                          permission
                        ) => {

                          const isPermissionSelected =
                            selectedPermissions.includes(
                              permission
                            );


                          return (

                            <label
                              key={
                                permission
                              }
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px",
                                margin: 0,
                                borderRadius: "10px",
                                cursor: "pointer",
                                background:
                                  isPermissionSelected
                                    ?
                                    "#eff6ff"
                                    :
                                    "#f8fafc",
                                border:
                                  isPermissionSelected
                                    ?
                                    "1px solid #93c5fd"
                                    :
                                    "1px solid #e2e8f0"
                              }}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  isPermissionSelected
                                }
                                onChange={
                                  () =>
                                    togglePermission(
                                      permission
                                    )
                                }
                                disabled={
                                  isSaving
                                }
                                style={{
                                  width: "auto"
                                }}
                              />

                              <span>
                                {permission}
                              </span>

                            </label>

                          );

                        }
                      )
                    }

                  </div>

                </div>


                {/* ================================================
                    ROLE EDITOR ACTIONS
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    paddingTop: "20px",
                    borderTop: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    {
                      selectedRole
                        ?
                        `${selectedPermissions.length} permissions will be assigned.`
                        :
                        "Select a role to continue."
                    }
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}
                  >

                    <button
                      type="button"
                      onClick={
                        closeRoleEditor
                      }
                      disabled={
                        isSaving
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="action-btn view-btn"
                      onClick={
                        requestSaveRole
                      }
                      disabled={
                        isSaving ||
                        !selectedRole
                      }
                    >
                      💾 Review & Save Role
                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        }
                {/* ======================================================
            SAVE CONFIRMATION POPUP
        ====================================================== */}

        {
          showSaveConfirmation &&
          selectedStaff &&
          selectedRole && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.72)"
              }}
            >

              <div
                className="section-card"
                style={{
                  width: "100%",
                  maxWidth: "650px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}
              >

                {/* ================================================
                    CONFIRMATION HEADER
                ================================================ */}

                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "22px"
                  }}
                >

                  <div
                    style={{
                      fontSize: "54px",
                      marginBottom: "12px"
                    }}
                  >
                    🛡️
                  </div>


                  <h2
                    style={{
                      margin: "0 0 8px"
                    }}
                  >
                    Confirm Role Assignment
                  </h2>


                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      lineHeight: "1.6"
                    }}
                  >
                    Review the staff role and permissions before saving changes.
                  </p>

                </div>


                {/* ================================================
                    SELECTED STAFF INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "16px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px"
                    }}
                  >

                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        minWidth: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        fontSize: "30px"
                      }}
                    >
                      👳
                    </div>


                    <div>

                      <h3
                        style={{
                          margin: "0 0 6px"
                        }}
                      >
                        {
                          displayValue(
                            selectedStaff.staffName,
                            "Unnamed Staff"
                          )
                        }
                      </h3>


                      <p
                        style={{
                          margin: "0 0 4px",
                          color: "#64748b"
                        }}
                      >
                        🪪 Staff ID:
                        {" "}
                        {
                          displayValue(
                            selectedStaff.staffId
                          )
                        }
                      </p>


                      <p
                        style={{
                          margin: 0,
                          color: "#64748b"
                        }}
                      >
                        💼
                        {" "}
                        {
                          displayValue(
                            selectedStaff.position
                          )
                        }
                        {" • "}
                        {
                          displayValue(
                            selectedStaff.department
                          )
                        }
                      </p>

                    </div>

                  </div>

                </div>


                {/* ================================================
                    OLD ROLE VS NEW ROLE
                ================================================ */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                    marginBottom: "18px"
                  }}
                >

                  {/* ==============================================
                      CURRENT ROLE
                  ============================================== */}

                  <div
                    style={{
                      padding: "16px",
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
                        fontWeight: "700"
                      }}
                    >
                      CURRENT SYSTEM ROLE
                    </p>


                    <h3
                      style={{
                        margin: "0 0 7px"
                      }}
                    >
                      {
                        getRoleIcon(
                          getStaffRole(
                            selectedStaff
                          )
                        )
                      }
                      {" "}
                      {
                        getStaffRole(
                          selectedStaff
                        )
                      }
                    </h3>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      {
                        getRoleDescription(
                          getStaffRole(
                            selectedStaff
                          )
                        )
                      }
                    </p>

                  </div>


                  {/* ==============================================
                      NEW ROLE
                  ============================================== */}

                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      border: "1px solid #93c5fd"
                    }}
                  >

                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#1d4ed8",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      NEW SYSTEM ROLE
                    </p>


                    <h3
                      style={{
                        margin: "0 0 7px",
                        color: "#1d4ed8"
                      }}
                    >
                      {
                        getRoleIcon(
                          selectedRole
                        )
                      }
                      {" "}
                      {selectedRole}
                    </h3>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b",
                        lineHeight: "1.6"
                      }}
                    >
                      {
                        getRoleDescription(
                          selectedRole
                        )
                      }
                    </p>

                  </div>

                </div>


                {/* ================================================
                    ROLE CHANGE INFORMATION
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    padding: "14px",
                    marginBottom: "18px",
                    borderRadius: "10px",
                    background: "#f8fafc"
                  }}
                >

                  <strong>
                    {
                      getRoleIcon(
                        getStaffRole(
                          selectedStaff
                        )
                      )
                    }
                    {" "}
                    {
                      getStaffRole(
                        selectedStaff
                      )
                    }
                  </strong>


                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "20px"
                    }}
                  >
                    →
                  </span>


                  <strong
                    style={{
                      color: "#2563eb"
                    }}
                  >
                    {
                      getRoleIcon(
                        selectedRole
                      )
                    }
                    {" "}
                    {selectedRole}
                  </strong>

                </div>


                {/* ================================================
                    SELECTED PERMISSIONS HEADER
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "12px"
                  }}
                >

                  <div>

                    <h3
                      style={{
                        margin: "0 0 5px"
                      }}
                    >
                      🔐 Assigned Permissions
                    </h3>


                    <p
                      style={{
                        margin: 0,
                        color: "#64748b"
                      }}
                    >
                      These permissions will be saved for this staff member.
                    </p>

                  </div>


                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: "12px",
                      fontWeight: "800"
                    }}
                  >
                    {
                      selectedPermissions.length
                    }
                    {" "}
                    PERMISSIONS
                  </span>

                </div>


                {/* ================================================
                    SELECTED PERMISSIONS LIST
                ================================================ */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                    marginBottom: "20px"
                  }}
                >

                  {
                    selectedPermissions.map(
                      (
                        permission
                      ) => (

                        <div
                          key={
                            permission
                          }
                          style={{
                            padding: "11px 13px",
                            borderRadius: "10px",
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            color: "#15803d",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          ✓ {permission}
                        </div>

                      )
                    )
                  }

                </div>


                {/* ================================================
                    SECURITY INFORMATION
                ================================================ */}

                <div
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                    lineHeight: "1.6"
                  }}
                >
                  ⚠️
                  {" "}
                  <strong>
                    Access Control Notice:
                  </strong>
                  {" "}
                  Saving these changes will update the role and permissions stored for
                  {" "}
                  <strong>
                    {
                      displayValue(
                        selectedStaff.staffName
                      )
                    }
                  </strong>
                  {" "}
                  in the staff database.
                </div>


                {/* ================================================
                    SAVE ACTION BUTTONS
                ================================================ */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      cancelSaveRole
                    }
                    disabled={
                      isSaving
                    }
                  >
                    ← Back to Edit
                  </button>


                  <button
                    type="button"
                    className="action-btn view-btn"
                    onClick={
                      confirmSaveRole
                    }
                    disabled={
                      isSaving
                    }
                    style={{
                      minWidth: "220px"
                    }}
                  >
                    {
                      isSaving
                        ?
                        "⏳ Saving Role..."
                        :
                        "💾 Confirm & Save Role"
                    }
                  </button>

                </div>

              </div>

            </div>

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

export default Roles;