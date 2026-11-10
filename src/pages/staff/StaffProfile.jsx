import { useEffect, useState } from "react";
import "../../App.css";
import Layout from "../../components/Layout";

import { db } from "../../firebase";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  useParams
} from "react-router-dom";

function StaffProfile() {

  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  const { id } =
    useParams();

  const [staff,
    setStaff] =
    useState(null);

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

            const staffData =
              staffSnap.data();

            if (
              staffData.madrasaId !==
              madrasaId
            ) {

              alert(
                "Access Denied"
              );

              return;

            }

            setStaff(
              staffData
            );

          }

        }
        catch (error) {

          console.log(
            error
          );

        }

      };

    fetchStaff();

  }, [
    id,
    madrasaId
  ]);


  if (!staff) {

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
          👳 Staff Profile
        </h1>

        <div className="section-card">

          <h3>
            Staff Name
          </h3>

          <p>
            {staff.staffName}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Mobile Number
          </h3>

          <p>
            {staff.mobileNumber}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Position
          </h3>

          <p>
            {staff.position}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Salary
          </h3>

          <p>
            ₹ {staff.salary}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Joining Date
          </h3>

          <p>
            {staff.joiningDate}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Address
          </h3>

          <p>
            {staff.address}
          </p>

        </div>

        <div className="section-card">

          <h3>
            Aadhaar Number
          </h3>

          <p>
            {staff.aadhaarNumber}
          </p>

        </div>

      </div>

    </Layout>

  );

}

export default StaffProfile;