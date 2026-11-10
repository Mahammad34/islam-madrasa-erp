import {
  useEffect,
  useState
} from "react";

import {
  doc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import "../../App.css";

import Layout from "../../components/Layout";

import {
  db
} from "../../firebase";

import {
  getMadrasaDocuments
} from "../../services/madrasaService";


function EditStudent() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  const [studentName,
    setStudentName] =
    useState("");

  const [fatherName,
    setFatherName] =
    useState("");

  const [motherName,
    setMotherName] =
    useState("");

  const [mobileNumber,
    setMobileNumber] =
    useState("");

  const [studentClass,
    setStudentClass] =
    useState("");

  const [address,
    setAddress] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [studentFound,
    setStudentFound] =
    useState(false);


  useEffect(() => {

    const fetchStudent =
      async () => {

        try {

          setLoading(true);


          const students =
            await getMadrasaDocuments(
              "students"
            );


          const selectedStudent =
            students.find(
              (student) =>
                student.id === id
            );


          if (!selectedStudent) {

            setStudentFound(false);

            return;

          }


          setStudentFound(true);


          setStudentName(
            selectedStudent.studentName ||
            ""
          );


          setFatherName(
            selectedStudent.fatherName ||
            ""
          );


          setMotherName(
            selectedStudent.motherName ||
            ""
          );


          setMobileNumber(
            selectedStudent.mobileNumber ||
            ""
          );


          setStudentClass(
            selectedStudent.studentClass ||
            ""
          );


          setAddress(
            selectedStudent.address ||
            ""
          );

        }
        catch (error) {

          console.log(
            error
          );

          setStudentFound(false);

        }
        finally {

          setLoading(false);

        }

      };


    fetchStudent();

  }, [id]);


  const updateStudent =
    async () => {

      if (
        !studentName.trim() ||
        !fatherName.trim() ||
        !mobileNumber.trim() ||
        !studentClass.trim()
      ) {

        alert(
          "Please fill all required fields."
        );

        return;

      }


      if (
        mobileNumber.trim().length !== 10
      ) {

        alert(
          "Please enter a valid 10 digit mobile number."
        );

        return;

      }


      try {

        setSaving(true);


        const students =
          await getMadrasaDocuments(
            "students"
          );


        const selectedStudent =
          students.find(
            (student) =>
              student.id === id
          );


        if (!selectedStudent) {

          alert(
            "Student not found or you do not have permission to edit this student."
          );

          return;

        }


        const studentRef =
          doc(
            db,
            "students",
            id
          );


        await updateDoc(
          studentRef,
          {

            studentName:
              studentName.trim(),

            fatherName:
              fatherName.trim(),

            motherName:
              motherName.trim(),

            mobileNumber:
              mobileNumber.trim(),

            studentClass:
              studentClass.trim(),

            address:
              address.trim(),

            updatedAt:
              serverTimestamp()

          }
        );


        alert(
          "Student updated successfully."
        );


        navigate(
          "/student-list"
        );

      }
      catch (error) {

        console.log(
          error
        );


        alert(
          "Error updating student."
        );

      }
      finally {

        setSaving(false);

      }

    };


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


  if (!studentFound) {

    return (

      <Layout>

        <div className="accounts-page">

          <div className="section-card">

            <h1>
              ⚠️ Student Not Found
            </h1>

            <p>
              This student does not exist or does not belong to your Madrasa.
            </p>

          </div>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">

        <h1>
          ✏ Edit Student
        </h1>


        <div className="section-card">


          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) =>
              setStudentName(
                e.target.value
              )
            }
          />


          <br />
          <br />


          <input
            type="text"
            placeholder="Father Name"
            value={fatherName}
            onChange={(e) =>
              setFatherName(
                e.target.value
              )
            }
          />


          <br />
          <br />


          <input
            type="text"
            placeholder="Mother Name"
            value={motherName}
            onChange={(e) =>
              setMotherName(
                e.target.value
              )
            }
          />


          <br />
          <br />


          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobileNumber}
            maxLength="10"
            onChange={(e) =>
              setMobileNumber(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
          />


          <br />
          <br />


          <input
            type="text"
            placeholder="Class"
            value={studentClass}
            onChange={(e) =>
              setStudentClass(
                e.target.value
              )
            }
          />


          <br />
          <br />


          <textarea
            placeholder="Address"
            value={address}
            rows="4"
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />


          <br />
          <br />


          <button
            onClick={updateStudent}
            disabled={saving}
          >

            {
              saving
                ? "Updating Student..."
                : "💾 Update Student"
            }

          </button>


        </div>

      </div>

    </Layout>

  );

}


export default EditStudent;