import { useEffect, useState } from "react";

import "../../App.css";

import {
    doc,
    getDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import {
    useParams
} from "react-router-dom";

function DonationProfile() {

  const { id } = useParams();

  const [donation, setDonation] = useState(null);

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

          setDonation({
            id: donationSnap.id,
            ...donationSnap.data()
          });

        }

      } catch (error) {

        console.log(error);

      }

    };

    fetchDonation();

  }, [id]);

  if (!donation) {

    return (
      <div className="accounts-page">
        <h1>Loading...</h1>
      </div>
    );

  }

  return (

    <div className="accounts-page">

      <h1>💰 Donation Profile</h1>

      <div className="section-card">

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
          💳 Payment Method : {donation.paymentMethod}
        </p>

        <p>
          🎯 Purpose : {donation.purpose}
        </p>

        <p>
          📅 Donation Date : {donation.donationDate}
        </p>

      </div>

    </div>

  );
}

export default DonationProfile;