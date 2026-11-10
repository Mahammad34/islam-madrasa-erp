import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import "../../App.css";

import Layout from "../../components/Layout";

import {
  getMadrasaDocuments
} from "../../services/madrasaService";


function StudentProfile() {

  const { id } =
    useParams();


  const [student,
    setStudent] =
    useState(null);


  const [loading,
    setLoading] =
    useState(true);


  const [errorMessage,
    setErrorMessage] =
    useState("");


  useEffect(() => {

    const fetchStudent =
      async () => {

        try {

          setLoading(
            true
          );

          setErrorMessage(
            ""
          );


          const students =
            await getMadrasaDocuments(
              "students"
            );


          const selectedStudent =
            students.find(
              (
                studentItem
              ) =>

                studentItem.id ===
                id

            );


          if (
            !selectedStudent
          ) {

            setErrorMessage(
              "Student not found or you do not have permission to view this student."
            );

            setStudent(
              null
            );

            return;

          }


          setStudent(
            selectedStudent
          );

        }
        catch (error) {

          console.log(
            error
          );


          setErrorMessage(
            "Unable to load student information."
          );

        }
        finally {

          setLoading(
            false
          );

        }

      };


    fetchStudent();

  }, [id]);


  if (loading) {

    return (

      <Layout>

        <div className="accounts-page">

          <h1>
            Loading Student...
          </h1>

        </div>

      </Layout>

    );

  }


  if (
    errorMessage ||
    !student
  ) {

    return (

      <Layout>

        <div className="accounts-page">

          <div className="section-card">

            <h1>
              ⚠️ Student Not Found
            </h1>

            <p>
              {
                errorMessage ||
                "Unable to find student."
              }
            </p>

          </div>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">

        <div className="profile-card">

          <div className="profile-header">

            <div className="profile-avatar">

              {
                student.profilePhoto
                  ? (

                    <img
                      src={
                        student.profilePhoto
                      }
                      alt={
                        student.studentName
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "cover",

                        borderRadius:
                          "50%"
                      }}
                    />

                  )
                  : "👨‍🎓"
              }

            </div>


            <div>

              <h1 className="profile-name">

                {
                  student.studentName ||
                  "Not Available"
                }

              </h1>


              <p>

                🆔 Student ID :{" "}

                {
                  student.studentId ||
                  "Not Available"
                }

              </p>


              <p>

                📄 Admission Number :{" "}

                {
                  student.admissionNumber ||
                  "Not Available"
                }

              </p>


              <p>

                📚 Class :{" "}

                {
                  student.studentClass ||
                  "Not Available"
                }

              </p>

            </div>

          </div>


          <div className="profile-grid">


            <div className="profile-item">

              <strong>
                👨 Father Name
              </strong>

              <p>
                {
                  student.fatherName ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                👩 Mother Name
              </strong>

              <p>
                {
                  student.motherName ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                📞 Mobile
              </strong>

              <p>
                {
                  student.mobileNumber ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                🎂 Date of Birth
              </strong>

              <p>
                {
                  student.dob ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                🏠 Address
              </strong>

              <p>
                {
                  student.address ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                🩸 Blood Group
              </strong>

              <p>
                {
                  student.bloodGroup ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                🆔 Aadhaar Number
              </strong>

              <p>
                {
                  student.aadhaarNumber ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                📅 Joining Date
              </strong>

              <p>
                {
                  student.joiningDate ||
                  "Not Available"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                📊 Attendance
              </strong>

              <p>
                {
                  student.attendancePercentage ||
                  0
                }%
              </p>

            </div>


            <div className="profile-item">

              <strong>
                💰 Pending Fees
              </strong>

              <p>
                ₹{
                  student.pendingFees ||
                  0
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                ❤️ Health Status
              </strong>

              <p>
                {
                  student.healthStatus ||
                  "Normal"
                }
              </p>

            </div>


            <div className="profile-item">

              <strong>
                🔵 Student Status
              </strong>

              <p>
                {
                  student.status ||
                  "Active"
                }
              </p>

            </div>


          </div>

        </div>

      </div>

    </Layout>

  );

}


export default StudentProfile;