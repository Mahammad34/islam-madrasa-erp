import { useEffect, useState } from "react";

import "../../App.css";

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

function EditDonation() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [donorName, setDonorName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [purpose, setPurpose] = useState("");
  const [donationDate, setDonationDate] = useState("");

  useEffect(() => {

    const fetchDonation = async () => {

      try {

        const donationRef = doc(
          db,
          "donations",
          id
        );

        const donationSnap = await getDoc(
          donationRef
        );

        if (donationSnap.exists()) {

          const data = donationSnap.data();

          setDonorName(data.donorName || "");
          setMobileNumber(data.mobileNumber || "");
          setDonationAmount(data.donationAmount || "");
          setPaymentMethod(data.paymentMethod || "");
          setPurpose(data.purpose || "");
          setDonationDate(data.donationDate || "");

        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchDonation();

  }, [id]);

  const updateDonation = async () => {

    try {

      const donationRef = doc(
        db,
        "donations",
        id
      );

      await updateDoc(
        donationRef,
        {
          donorName,
          mobileNumber,
          donationAmount,
          paymentMethod,
          purpose,
          donationDate
        }
      );

      alert(
        "Donation updated successfully"
      );

      navigate("/donation-list");

    } catch (error) {

      console.log(error);

      alert(
        "Error updating donation"
      );

    }

  };

  return (

    <div className="accounts-page">

      <h1>✏ Edit Donation</h1>

      <div className="section-card">

        <input
          type="text"
          placeholder="Donor Name"
          value={donorName}
          onChange={(e) =>
            setDonorName(e.target.value)
          }
        />

        <br /><br />

        <input
          type="number"
          placeholder="Mobile Number"
          value={mobileNumber}
          onChange={(e) =>
            setMobileNumber(e.target.value)
          }
        />

        <br /><br />

        <input
          type="number"
          placeholder="Donation Amount"
          value={donationAmount}
          onChange={(e) =>
            setDonationAmount(e.target.value)
          }
        />

        <br /><br />

        <input
          type="text"
          placeholder="Payment Method"
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
        />

        <br /><br />

        <input
          type="text"
          placeholder="Purpose"
          value={purpose}
          onChange={(e) =>
            setPurpose(e.target.value)
          }
        />

        <br /><br />

        <input
          type="date"
          value={donationDate}
          onChange={(e) =>
            setDonationDate(e.target.value)
          }
        />

        <br /><br />

        <button
          onClick={updateDonation}
        >
          Update Donation
        </button>

      </div>

    </div>

  );
}

export default EditDonation;