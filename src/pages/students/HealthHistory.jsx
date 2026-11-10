import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function HealthHistory() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  // ======================
  // STATES
  // ======================

  const [
    healthRecords,
    setHealthRecords
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");

  // ======================
  // FETCH
  // ======================

  useEffect(() => {

  fetchHealthRecords();

}, [madrasaId]);

  const fetchHealthRecords =
    async () => {

      try {

        if (!madrasaId) {

  setHealthRecords([]);

  setLoading(false);

  return;

}


const healthRecordsQuery =
  query(
    collection(
      db,
      "healthRecords"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    )
  );


const snapshot =
  await getDocs(
    healthRecordsQuery
  );

        const list =
          snapshot.docs.map(
            (item) => ({
              id:
                item.id,

              ...item.data()
            })
          );

        setHealthRecords(
          list
        );

        setLoading(
          false
        );

      }
      catch (error) {

        console.log(
          error
        );

        setLoading(
          false
        );

      }

    };

  // ======================
  // FILTER
  // ======================

  const filteredRecords =
    useMemo(() => {

      return healthRecords.filter(
        (record) => {

          const searchText =
            search.toLowerCase();

          const matchesSearch =
            (
              record.studentName ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||

            (
              record.studentId ||
              ""
            )
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            record.healthStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      healthRecords,
      search,
      statusFilter
    ]);

  // ======================
  // SUMMARY
  // ======================

  const totalRecords =
    healthRecords.length;

  const healthyCount =
    healthRecords.filter(
      (item) =>
        item.healthStatus ===
        "Healthy"
    ).length;

  const observationCount =
    healthRecords.filter(
      (item) =>
        item.healthStatus ===
        "Under Observation"
    ).length;

  const criticalCount =
    healthRecords.filter(
      (item) =>
        item.healthStatus ===
        "Critical"
    ).length;

  // ======================
  // DELETE
  // ======================

  const deleteRecord =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this health record?"
        );

      if (
        !confirmDelete
      ) {
        return;
      }

      try {

        await deleteDoc(
          doc(
            db,
            "healthRecords",
            id
          )
        );

        setHealthRecords(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !== id
            )
        );

        alert(
          "Health Record Deleted"
        );

      }
      catch (error) {

        console.log(
          error
        );

        alert(
          "Error Deleting Record"
        );

      }

    };

  // ======================
  // UI
  // ======================

  return (
    <Layout>

      <div className="accounts-page">

        <h1>
          🏥 Health History
        </h1>

        {/* Summary */}

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              🏥
            </h2>

            <p>
              Total :
              {" "}
              {totalRecords}
            </p>

          </div>

          <div className="summary-card">

            <h2>
              🟢
            </h2>

            <p>
              Healthy :
              {" "}
              {healthyCount}
            </p>

          </div>

          <div className="summary-card">

            <h2>
              🟡
            </h2>

            <p>
              Observation :
              {" "}
              {observationCount}
            </p>

          </div>

          <div className="summary-card">

            <h2>
              🔴
            </h2>

            <p>
              Critical :
              {" "}
              {criticalCount}
            </p>

          </div>

        </div>

        {/* Search */}

        <div
          className="form-card"
        >

          <input
            type="text"
            className="attendance-search"
            placeholder="Search Student"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <br />
          <br />

          <select
            className="attendance-search"
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option>
              All
            </option>

            <option>
              Healthy
            </option>

            <option>
              Under Observation
            </option>

            <option>
              Critical
            </option>

            <option>
              Recovered
            </option>

          </select>

        </div>

        {/* Loading */}

        {
          loading && (

            <div
              className="module-card"
            >

              <h2>
                Loading...
              </h2>

            </div>

          )
        }

        {/* Empty */}

        {
          !loading &&
          filteredRecords.length ===
            0 && (

            <div
              className="module-card"
            >

              <h2>
                No Health Records Found
              </h2>

            </div>

          )
        }

        {/* Records */}

        {
          filteredRecords.map(
            (record) => (

              <div
                className="student-card"
                key={
                  record.id
                }
              >

                <div
                  className="student-info"
                >

                  <div
                    className="student-avatar"
                  >
                    🏥
                  </div>

                  <div>

                    <h2>
                      {
                        record.studentName
                      }
                    </h2>

                    <p>
                      🆔
                      {" "}
                      {
                        record.studentId
                      }
                    </p>

                    <p>
                      🩸
                      {" "}
                      {
                        record.bloodGroup
                      }
                    </p>

                    <p>
                      📏
                      {" "}
                      {
                        record.height
                      }
                      {" "}
                      cm
                    </p>

                    <p>
                      ⚖️
                      {" "}
                      {
                        record.weight
                      }
                      {" "}
                      kg
                    </p>

                    <p>
                      📊 BMI :
                      {" "}
                      {
                        record.bmi
                      }
                    </p>

                    <p>
                      🚫
                      {" "}
                      {
                        record.allergies ||
                        "None"
                      }
                    </p>

                    <p>
                      📝
                      {" "}
                      {
                        record.medicalNotes ||
                        "No Notes"
                      }
                    </p>

                    <p>
                      🏥
                      {" "}
                      {
                        record.healthStatus
                      }
                    </p>

                  </div>

                </div>

                <div
                  className="action-buttons"
                >

                  <button
                    className="action-btn view-btn"
                  >
                    👁 View
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() =>
                      deleteRecord(
                        record.id
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>

            )
          )
        }

      </div>

    </Layout>
  );

}

export default HealthHistory;