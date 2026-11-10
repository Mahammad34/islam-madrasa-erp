import { useEffect, useState } from "react";
import "../../App.css";

import {
  collection,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

import { db } from "../../firebase";

import { Link } from "react-router-dom";

function DonationList() {

  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {

    try {

      const querySnapshot = await getDocs(
        collection(db, "donations")
      );

      const donationList = [];

      querySnapshot.forEach((document) => {

        donationList.push({
          id: document.id,
          ...document.data()
        });

      });

      setDonations(donationList);

    } catch (error) {

      console.log(error);

    }

  };

  const deleteDonation = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this donation?"
    );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "donations", id)
      );

      alert("Donation deleted successfully");

      fetchDonations();

    } catch (error) {

      console.log(error);

      alert("Error deleting donation");

    }

  };

  return (

    <div className="accounts-page">

      <h1>💰 Donation List</h1>

      {

        donations.map((donation) => (

          <div
            className="section-card"
            key={donation.id}
          >

            <h3>
              {donation.donorName}
            </h3>

            <p>
              📞 Mobile : {donation.mobileNumber}
            </p>

            <p>
              💵 Amount : ₹{donation.donationAmount}
            </p>

            <p>
              💳 Payment : {donation.paymentMethod}
            </p>

            <br />

            <Link
              to={`/donation-profile/${donation.id}`}
              className="link"
            >
              <button>
                👁 View
              </button>
            </Link>

            {" "}

            <Link
              to={`/edit-donation/${donation.id}`}
              className="link"
            >
              <button>
                ✏ Edit
              </button>
            </Link>

            {" "}

            <button
              onClick={() =>
                deleteDonation(donation.id)
              }
            >
              🗑 Delete
            </button>

          </div>

        ))

      }

    </div>

  );
}

export default DonationList;