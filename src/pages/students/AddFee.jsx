import { useState } from "react";
import "../../App.css";
import Layout from "../../components/Layout";

function AddFee() {

  const [studentName, setStudentName] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const saveFee = () => {

    alert("Fee saved successfully");

    setStudentName("");
    setMonthlyFee("");
    setPaidAmount("");

  };

  return (
    <Layout>

      <div className="accounts-page">

        <h1>💰 Add Fee</h1>

        <div className="section-card">

          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) =>
              setStudentName(e.target.value)
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Monthly Fee"
            value={monthlyFee}
            onChange={(e) =>
              setMonthlyFee(e.target.value)
            }
          />

          <br /><br />

          <input
            type="number"
            placeholder="Paid Amount"
            value={paidAmount}
            onChange={(e) =>
              setPaidAmount(e.target.value)
            }
          />

          <br /><br />

          <button onClick={saveFee}>
            Save Fee
          </button>

        </div>

      </div>

    </Layout>
  );
}

export default AddFee;