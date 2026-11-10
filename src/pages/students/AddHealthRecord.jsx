import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

import {
  useEffect,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";
function AddHealthRecord() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

    // ======================
  // STUDENTS
  // ======================

  const [students,
    setStudents] =
    useState([]);

  const [selectedStudent,
    setSelectedStudent] =
    useState("");

  const [studentId,
    setStudentId] =
    useState("");

  const [studentName,
    setStudentName] =
    useState("");

  // ======================
  // HEALTH FIELDS
  // ======================

  const [bloodGroup,
    setBloodGroup] =
    useState("");

  const [height,
    setHeight] =
    useState("");

  const [weight,
    setWeight] =
    useState("");

  const [bmi,
    setBmi] =
    useState("");

  const [allergies,
    setAllergies] =
    useState("");

  const [medicalConditions,
    setMedicalConditions] =
    useState("");

  const [emergencyContact,
    setEmergencyContact] =
    useState("");

  const [doctorName,
    setDoctorName] =
    useState("");

  const [lastCheckupDate,
    setLastCheckupDate] =
    useState("");

  const [medicalNotes,
    setMedicalNotes] =
    useState("");

  const [healthStatus,
    setHealthStatus] =
    useState(
      "Healthy"
    );

  const [loading,
    setLoading] =
    useState(false);
      useEffect(() => {

  fetchStudents();

}, [madrasaId]);

    const fetchStudents =
    async () => {

      try {

        if (!madrasaId) {

  setStudents([]);

  return;

}


const studentsQuery =
  query(
    collection(
      db,
      "students"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    )
  );


const snapshot =
  await getDocs(
    studentsQuery
  );

        const list =
          snapshot.docs.map(
            (doc) => ({

              id:
                doc.id,

              ...doc.data()

            })
          );

        setStudents(
          list
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      // ======================
  // SELECT STUDENT
  // ======================

  const selectStudent =
    (studentDocId) => {

      setSelectedStudent(
        studentDocId
      );

      const student =
        students.find(
          (item) =>
            item.id ===
            studentDocId
        );

      if (!student) {
        return;
      }

      setStudentId(
        student.studentId || ""
      );

      setStudentName(
        student.studentName || ""
      );

      setBloodGroup(
        student.bloodGroup || ""
      );

    };

  // ======================
  // BMI CALCULATION
  // ======================

  useEffect(() => {

    if (
      !height ||
      !weight
    ) {

      setBmi("");
      return;

    }

    const heightInMeters =
      Number(height) / 100;

    if (
      heightInMeters <= 0
    ) {

      setBmi("");
      return;

    }

    const bmiValue =
      (
        Number(weight) /
        (
          heightInMeters *
          heightInMeters
        )
      ).toFixed(1);

    setBmi(
      bmiValue
    );

  }, [
    height,
    weight
  ]);

  // ======================
  // SAVE HEALTH RECORD
  // ======================

  const saveHealthRecord =
    async () => {

      try {

        if (
          !selectedStudent
        ) {

          alert(
            "Please select a student."
          );

          return;

        }

        if (
          !height ||
          !weight
        ) {

          alert(
            "Please enter height and weight."
          );

          return;

        }

        setLoading(
          true
        );

        await addDoc(
          collection(
            db,
            "healthRecords"
          ),
          {

              madrasaId,

            // Student
            studentDocId:
              selectedStudent,

            studentId,

            studentName,

            // Health
            bloodGroup,

            height:
              Number(height),

            weight:
              Number(weight),

            bmi:
              Number(bmi),

            allergies:
              allergies.trim(),

            medicalConditions:
              medicalConditions.trim(),

            emergencyContact:
              emergencyContact.trim(),

            doctorName:
              doctorName.trim(),

            lastCheckupDate,

            medicalNotes:
              medicalNotes.trim(),

            healthStatus,

            // Future Ready
            attachments:
              [],

            medications:
              [],

            diagnosis:
              "",

            nextCheckupDate:
              "",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );

        alert(
          "Health Record Saved Successfully"
        );

        // ======================
        // RESET
        // ======================

        setSelectedStudent(
          ""
        );

        setStudentId(
          ""
        );

        setStudentName(
          ""
        );

        setBloodGroup(
          ""
        );

        setHeight(
          ""
        );

        setWeight(
          ""
        );

        setBmi(
          ""
        );

        setAllergies(
          ""
        );

        setMedicalConditions(
          ""
        );

        setEmergencyContact(
          ""
        );

        setDoctorName(
          ""
        );

        setLastCheckupDate(
          ""
        );

        setMedicalNotes(
          ""
        );

        setHealthStatus(
          "Healthy"
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

        alert(
          "Error Saving Health Record"
        );

      }

    };
    return (
  <Layout>

    <div className="accounts-page">

      <h1>
        🏥 Add Health Record
      </h1>

      {/* Summary Cards */}

      <div className="attendance-summary">

        <div className="summary-card">

          <h2>
            {
              studentId
                ? "👨‍🎓"
                : "❌"
            }
          </h2>

          <p>
            {
              studentId
                ? studentId
                : "No Student"
            }
          </p>

        </div>

        <div className="summary-card">

          <h2>
            🩸
          </h2>

          <p>
            {
              bloodGroup ||
              "Not Selected"
            }
          </p>

        </div>

        <div className="summary-card">

          <h2>
            📊
          </h2>

          <p>
            BMI :
            {" "}
            {
              bmi || "--"
            }
          </p>

        </div>

        <div className="summary-card">

          <h2>
            🏥
          </h2>

          <p>
            {
              healthStatus
            }
          </p>

        </div>

      </div>

      {/* Health Form */}

      <div className="form-card">

        <div className="form-grid">

          {/* Student */}

          <select
            value={
              selectedStudent
            }
            onChange={(e) =>
              selectStudent(
                e.target.value
              )
            }
          >

            <option value="">
              Select Student
            </option>

            {
              students.map(
                (
                  student
                ) => (

                  <option
                    key={
                      student.id
                    }
                    value={
                      student.id
                    }
                  >

                    {
                      student.studentId
                    }

                    {" - "}

                    {
                      student.studentName
                    }

                  </option>

                )
              )
            }

          </select>

          <input
            type="text"
            placeholder="Student ID"
            value={
              studentId
            }
            readOnly
          />

          <input
            type="text"
            placeholder="Student Name"
            value={
              studentName
            }
            readOnly
          />

          <input
            type="text"
            placeholder="Blood Group"
            value={
              bloodGroup
            }
            onChange={(e) =>
              setBloodGroup(
                e.target.value
              )
            }
          />

          <input
            type="number"
            placeholder="Height (cm)"
            value={
              height
            }
            onChange={(e) =>
              setHeight(
                e.target.value
              )
            }
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={
              weight
            }
            onChange={(e) =>
              setWeight(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="BMI"
            value={
              bmi
            }
            readOnly
          />

          <input
            type="text"
            placeholder="Allergies"
            value={
              allergies
            }
            onChange={(e) =>
              setAllergies(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Medical Conditions"
            value={
              medicalConditions
            }
            onChange={(e) =>
              setMedicalConditions(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Emergency Contact"
            value={
              emergencyContact
            }
            onChange={(e) =>
              setEmergencyContact(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Doctor Name"
            value={
              doctorName
            }
            onChange={(e) =>
              setDoctorName(
                e.target.value
              )
            }
          />

          <input
            type="date"
            value={
              lastCheckupDate
            }
            onChange={(e) =>
              setLastCheckupDate(
                e.target.value
              )
            }
          />

          <select
            value={
              healthStatus
            }
            onChange={(e) =>
              setHealthStatus(
                e.target.value
              )
            }
          >

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

        <br />

        <textarea
          placeholder="Medical Notes"
          value={
            medicalNotes
          }
          onChange={(e) =>
            setMedicalNotes(
              e.target.value
            )
          }
          rows="5"
        />

        <br />
        <br />

        <button
          className="save-all-btn"
          onClick={
            saveHealthRecord
          }
        >

          {
            loading
              ? "Saving..."
              : "💾 Save Health Record"
          }

        </button>

      </div>

    </div>

  </Layout>
);
}

export default AddHealthRecord;