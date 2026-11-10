import {
  addDoc,
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";

import {
  addMadrasaId,
  getMadrasaCollection
} from "../../services/madrasaService";

import {
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function AddStudent() {

  // ============================================================
  // FORM STATES
  // ============================================================

  const [
    studentName,
    setStudentName
  ] = useState("");


  const [
    fatherName,
    setFatherName
  ] = useState("");


  const [
    motherName,
    setMotherName
  ] = useState("");


  const [
    mobileNumber,
    setMobileNumber
  ] = useState("");


  const [
    dob,
    setDob
  ] = useState("");


  const [
    gender,
    setGender
  ] = useState("");


  const [
    address,
    setAddress
  ] = useState("");


  const [
    studentClass,
    setStudentClass
  ] = useState("");


  const [
    bloodGroup,
    setBloodGroup
  ] = useState("");


  const [
    aadhaarNumber,
    setAadhaarNumber
  ] = useState("");


  const [
    joiningDate,
    setJoiningDate
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );


  // ============================================================
  // PROCESS STATES
  // ============================================================

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


  const [
    registeredStudent,
    setRegisteredStudent
  ] = useState(null);


  // ============================================================
  // CLEAN MOBILE NUMBER
  // ============================================================

  const cleanMobileNumber =
    mobileNumber.replace(
      /\D/g,
      ""
    );


  // ============================================================
  // CLEAN AADHAAR NUMBER
  // ============================================================

  const cleanAadhaarNumber =
    aadhaarNumber.replace(
      /\D/g,
      ""
    );


  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm =
    () => {

      setStudentName("");

      setFatherName("");

      setMotherName("");

      setMobileNumber("");

      setDob("");

      setGender("");

      setAddress("");

      setStudentClass("");

      setBloodGroup("");

      setAadhaarNumber("");

      setJoiningDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

    };


  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm =
    () => {

      if (
        !studentName.trim()
      ) {

        setErrorMessage(
          "Please enter the student name."
        );

        return false;

      }


      if (
        !fatherName.trim()
      ) {

        setErrorMessage(
          "Please enter the father name."
        );

        return false;

      }


      if (
        !cleanMobileNumber
      ) {

        setErrorMessage(
          "Please enter the mobile number."
        );

        return false;

      }


      if (
        cleanMobileNumber.length !== 10
      ) {

        setErrorMessage(
          "Please enter a valid 10-digit mobile number."
        );

        return false;

      }


      if (
        !studentClass.trim()
      ) {

        setErrorMessage(
          "Please enter or select the student class."
        );

        return false;

      }


      if (
        cleanAadhaarNumber &&
        cleanAadhaarNumber.length !== 12
      ) {

        setErrorMessage(
          "Aadhaar number must contain exactly 12 digits."
        );

        return false;

      }


      if (
        dob &&
        new Date(dob) >
        new Date()
      ) {

        setErrorMessage(
          "Date of birth cannot be in the future."
        );

        return false;

      }


      if (
        joiningDate &&
        new Date(joiningDate) >
        new Date()
      ) {

        setErrorMessage(
          "Joining date cannot be in the future."
        );

        return false;

      }


      return true;

    };


  // ============================================================
  // CHECK DUPLICATE AADHAAR
  // ============================================================

  const checkDuplicateAadhaar =
    async () => {

      if (
        !cleanAadhaarNumber
      ) {

        return false;

      }


      const studentSnapshot =
  await getDocs(
    getMadrasaCollection(
      "students"
    )
  );


      return studentSnapshot.docs.some(
        (
          studentDocument
        ) => {

          const existingAadhaar =
            String(
              studentDocument.data()
                .aadhaarNumber ||
              ""
            ).replace(
              /\D/g,
              ""
            );


          return (
            existingAadhaar ===
            cleanAadhaarNumber
          );

        }
      );

    };


  // ============================================================
  // GENERATE STUDENT NUMBER
  // ============================================================

  const generateStudentNumber =
    async () => {

      const counterRef =
        doc(
          db,
          "counters",
          "students"
        );


      return runTransaction(
        db,
        async (
          transaction
        ) => {

          const counterDocument =
            await transaction.get(
              counterRef
            );


          if (
            !counterDocument.exists()
          ) {

            transaction.set(
              counterRef,
              {
                currentNumber:
                  1,

                updatedAt:
                  serverTimestamp()
              }
            );


            return 1;

          }


          const currentNumber =
            Number(
              counterDocument.data()
                .currentNumber ||
              0
            );


          const nextNumber =
            currentNumber + 1;


          transaction.update(
            counterRef,
            {
              currentNumber:
                nextNumber,

              updatedAt:
                serverTimestamp()
            }
          );


          return nextNumber;

        }
      );

    };


  // ============================================================
  // SAVE STUDENT
  // ============================================================

  const saveStudent =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      setErrorMessage("");

      setSuccessMessage("");

      setRegisteredStudent(null);


      if (
        !validateForm()
      ) {

        return;

      }


      setIsSaving(true);


      try {

        const aadhaarExists =
          await checkDuplicateAadhaar();


        if (
          aadhaarExists
        ) {

          setErrorMessage(
            "A student with this Aadhaar number already exists."
          );

          return;

        }


        const newNumber =
          await generateStudentNumber();


        const year =
          new Date()
            .getFullYear();


        const sequence =
          String(
            newNumber
          ).padStart(
            4,
            "0"
          );


        const studentId =
          `MA-${year}-${sequence}`;


        const admissionNumber =
          `ADM-${year}-${sequence}`;


const studentData =
  addMadrasaId({
          studentId,

          admissionNumber,

          studentName:
            studentName.trim(),

          fatherName:
            fatherName.trim(),

          motherName:
            motherName.trim(),

          mobileNumber:
            cleanMobileNumber,

          dob,

          gender,

          address:
            address.trim(),

          studentClass:
            studentClass.trim(),

          bloodGroup,

          aadhaarNumber:
            cleanAadhaarNumber,

          status:
            "Active",

          parentAccountCreated:
            false,

          parentAccountId:
            "",

          attendancePercentage:
            0,

          totalPresent:
            0,

          totalAbsent:
            0,

          totalFees:
            0,

          paidFees:
            0,

          pendingFees:
            0,

          feeStatus:
            "Pending",

          healthStatus:
            "Normal",

          medicalNotes:
            "",

          profilePhoto:
            "",

          qrCode:
            "",

          joiningDate,

          createdAt:
            serverTimestamp(),

          updatedAt:
  serverTimestamp()

});


        const studentDocument =
          await addDoc(
            collection(
              db,
              "students"
            ),
            studentData
          );


        setRegisteredStudent({

          documentId:
            studentDocument.id,

          studentId,

          admissionNumber,

          studentName:
            studentName.trim(),

          studentClass:
            studentClass.trim()

        });


        setSuccessMessage(
          "Student registered successfully."
        );


        resetForm();

      }
      catch (
        error
      ) {

        console.error(
          "Error saving student:",
          error
        );


        setErrorMessage(
          "Unable to save the student. Please try again."
        );

      }
      finally {

        setIsSaving(false);

      }

    };


  // ============================================================
  // CLEAR FORM
  // ============================================================

  const clearForm =
    () => {

      resetForm();

      setErrorMessage("");

      setSuccessMessage("");

      setRegisteredStudent(null);

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
              ➕ Student Registration
            </h1>

            <p style={{ margin: 0, color: "#64748b" }}>
              Register a new student and automatically generate Student ID and Admission Number.
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
          registeredStudent && (

            <div
              className="section-card"
              style={{
                marginBottom: "24px",
                border: "1px solid #bbf7d0"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap"
                }}
              >

                <div
                  style={{
                    width: "65px",
                    height: "65px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "16px",
                    background: "#dcfce7",
                    fontSize: "32px"
                  }}
                >
                  ✅
                </div>


                <div style={{ flex: "1" }}>

                  <h2 style={{ margin: "0 0 6px" }}>
                    Registration Successful
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b"
                    }}
                  >
                    The student record has been successfully saved.
                  </p>

                </div>

              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
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
                    Student Name
                  </p>

                  <strong>
                    {registeredStudent.studentName}
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
                    Student ID
                  </p>

                  <strong>
                    {registeredStudent.studentId}
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
                    Admission Number
                  </p>

                  <strong>
                    {registeredStudent.admissionNumber}
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
                    Class
                  </p>

                  <strong>
                    {registeredStudent.studentClass}
                  </strong>

                </div>

              </div>


              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px"
                }}
              >

                <Link
                  to={`/student-profile/${registeredStudent.documentId}`}
                  className="action-btn view-btn"
                >
                  👁 View Student Profile
                </Link>


                <Link
                  to="/student-list"
                  className="action-btn edit-btn"
                >
                  📋 View Student List
                </Link>

              </div>

            </div>

          )
        }


        <div
          className="section-card"
          style={{
            marginBottom: "24px"
          }}
        >

          <div style={{ marginBottom: "22px" }}>

            <h2 style={{ margin: "0 0 6px" }}>
              👨‍🎓 Student Information
            </h2>

            <p style={{ margin: 0, color: "#64748b" }}>
              Enter the student's personal information.
            </p>

          </div>


          <div className="form-grid">

            <div>

              <label>
                Student Name *
              </label>

              <input
                type="text"
                placeholder="Enter student name"
                value={studentName}
                onChange={(event) =>
                  setStudentName(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>


            <div>

              <label>
                Date of Birth
              </label>

              <input
                type="date"
                value={dob}
                onChange={(event) =>
                  setDob(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>


            <div>

              <label>
                Gender
              </label>

              <select
                value={gender}
                onChange={(event) =>
                  setGender(
                    event.target.value
                  )
                }
                disabled={isSaving}
              >

                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            <div>

              <label>
                Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(event) =>
                  setBloodGroup(
                    event.target.value
                  )
                }
                disabled={isSaving}
              >

                <option value="">
                  Select Blood Group
                </option>

                <option value="A+">A+</option>

                <option value="A-">A-</option>

                <option value="B+">B+</option>

                <option value="B-">B-</option>

                <option value="AB+">AB+</option>

                <option value="AB-">AB-</option>

                <option value="O+">O+</option>

                <option value="O-">O-</option>

                <option value="Unknown">
                  Unknown
                </option>

              </select>

            </div>


            <div>

              <label>
                Aadhaar Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength="12"
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaarNumber}
                onChange={(event) =>
                  setAadhaarNumber(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 12)
                  )
                }
                disabled={isSaving}
              />

            </div>

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
              👨‍👩‍👧 Parent & Contact Information
            </h2>

            <p style={{ margin: 0, color: "#64748b" }}>
              Enter parent and contact details for the student.
            </p>

          </div>


          <div className="form-grid">

            <div>

              <label>
                Father Name *
              </label>

              <input
                type="text"
                placeholder="Enter father name"
                value={fatherName}
                onChange={(event) =>
                  setFatherName(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>


            <div>

              <label>
                Mother Name
              </label>

              <input
                type="text"
                placeholder="Enter mother name"
                value={motherName}
                onChange={(event) =>
                  setMotherName(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>


            <div>

              <label>
                Mobile Number *
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength="10"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(event) =>
                  setMobileNumber(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                disabled={isSaving}
              />

            </div>

          </div>


          <div style={{ marginTop: "18px" }}>

            <label>
              Student Address
            </label>

            <textarea
              rows="4"
              placeholder="Enter complete student address..."
              value={address}
              onChange={(event) =>
                setAddress(
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

        </div>


        <div
          className="section-card"
          style={{
            marginBottom: "24px"
          }}
        >

          <div style={{ marginBottom: "22px" }}>

            <h2 style={{ margin: "0 0 6px" }}>
              📚 Admission Information
            </h2>

            <p style={{ margin: 0, color: "#64748b" }}>
              Enter the student's class and Madrasa joining information.
            </p>

          </div>


          <div className="form-grid">

            <div>

              <label>
                Student Class *
              </label>

              <input
                type="text"
                placeholder="Example: Hifz, Nazira, Class 5"
                value={studentClass}
                onChange={(event) =>
                  setStudentClass(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>


            <div>

              <label>
                Joining Date
              </label>

              <input
                type="date"
                value={joiningDate}
                onChange={(event) =>
                  setJoiningDate(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

            </div>

          </div>


          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#64748b"
            }}
          >
            ℹ️ Student ID and Admission Number will be generated automatically after registration.
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
              gap: "16px",
              flexWrap: "wrap"
            }}
          >

            <div>

              <h2 style={{ margin: "0 0 5px" }}>
                💾 Complete Registration
              </h2>

              <p style={{ margin: 0, color: "#64748b" }}>
                Check the entered information before saving the student record.
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
                onClick={clearForm}
                disabled={isSaving}
              >
                ↻ Clear Form
              </button>


              <button
                type="button"
                className="save-all-btn"
                onClick={saveStudent}
                disabled={isSaving}
              >
                {
                  isSaving
                    ? "⏳ Registering Student..."
                    : "💾 Register Student"
                }
              </button>

            </div>

          </div>

        </div>


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
            to="/search-student"
            className="action-btn view-btn"
          >
            🔍 Search Student
          </Link>

        </div>


        <div style={{ height: "50px" }} />

      </div>

    </Layout>

  );

}

export default AddStudent;