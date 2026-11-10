import { useEffect, useState } from "react";
import "../../App.css";
import Layout from "../../components/Layout";

import { db } from "../../firebase";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import {
  useNavigate,
  useParams
} from "react-router-dom";

function EditStaff() {

  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [staffName, setStaffName] =
    useState("");

  const [mobileNumber, setMobileNumber] =
    useState("");

  const [position, setPosition] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [joiningDate, setJoiningDate] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [aadhaarNumber, setAadhaarNumber] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchStaff =
      async () => {

        try {

          const staffRef =
            doc(
              db,
              "staff",
              id
            );

          const staffSnap =
            await getDoc(
              staffRef
            );

          if (
            staffSnap.exists()
          ) {

            const data =
              staffSnap.data();

            if (
              data.madrasaId !==
              madrasaId
            ) {

              alert(
                "Access Denied"
              );

              navigate(
                "/staff-list"
              );

              return;

            }

            setStaffName(
              data.staffName || ""
            );

            setMobileNumber(
              data.mobileNumber || ""
            );

            setPosition(
              data.position || ""
            );

            setSalary(
              data.salary || ""
            );

            setJoiningDate(
              data.joiningDate || ""
            );

            setAddress(
              data.address || ""
            );

            setAadhaarNumber(
              data.aadhaarNumber || ""
            );

          }

        }
        catch (error) {

          console.log(
            error
          );

        }
        finally {

          setLoading(
            false
          );

        }

      };

    fetchStaff();

  }, [
    id,
    madrasaId,
    navigate
  ]);


  const updateStaff =
    async () => {

      try {

        const staffRef =
          doc(
            db,
            "staff",
            id
          );

        await updateDoc(
          staffRef,
          {
            staffName,
            mobileNumber,
            position,
            salary,
            joiningDate,
            address,
            aadhaarNumber
          }
        );

        alert(
          "Staff updated successfully"
        );

        navigate(
          "/staff-list"
        );

      }
      catch (error) {

        console.log(
          error
        );

        alert(
          "Error updating staff"
        );

      }

    };


  if (loading) {

    return (

      <Layout>

        <div className="accounts-page">

          <h1>
            Loading Staff...
          </h1>

        </div>

      </Layout>

    );

  }


  return (

    <Layout>

      <div className="accounts-page">

        <h1>
          ✏ Edit Staff
        </h1>

        <div className="section-card">

          <input
            type="text"
            placeholder="Staff Name"
            value={staffName}
            onChange={(e) =>
              setStaffName(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) =>
              setMobileNumber(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="text"
            placeholder="Position"
            value={position}
            onChange={(e) =>
              setPosition(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Salary"
            value={salary}
            onChange={(e) =>
              setSalary(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="date"
            value={joiningDate}
            onChange={(e) =>
              setJoiningDate(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />

          <br /><br />

          <input
            type="text"
            placeholder="Aadhaar Number"
            value={aadhaarNumber}
            onChange={(e) =>
              setAadhaarNumber(
                e.target.value
              )
            }
          />

          <br /><br />

          <button
            onClick={
              updateStaff
            }
          >
            Update Staff
          </button>

        </div>

      </div>

    </Layout>

  );

}

export default EditStaff;