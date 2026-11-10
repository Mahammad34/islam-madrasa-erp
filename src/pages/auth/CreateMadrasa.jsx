import {
  useState
} from "react";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  collection,
  doc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import {
  useNavigate
} from "react-router-dom";

import "../../App.css";

import {
  auth,
  db
} from "../../firebase";


function CreateMadrasa() {

  const navigate =
    useNavigate();


  const [madrasaName,
    setMadrasaName] =
    useState("");

  const [headName,
    setHeadName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [state,
    setState] =
    useState("");

  const [district,
    setDistrict] =
    useState("");

  const [city,
    setCity] =
    useState("");

  const [address,
    setAddress] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);


  const createMadrasa =
    async () => {

      if (
        !madrasaName.trim() ||
        !headName.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !password ||
        !confirmPassword ||
        !state.trim() ||
        !district.trim() ||
        !city.trim() ||
        !address.trim()
      ) {

        alert(
          "Please fill all required fields."
        );

        return;
      }


      if (
        phone.trim().length !== 10
      ) {

        alert(
          "Please enter a valid 10 digit phone number."
        );

        return;
      }


      if (
        password.length < 6
      ) {

        alert(
          "Password must contain at least 6 characters."
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {

        alert(
          "Passwords do not match."
        );

        return;
      }


      try {

        setLoading(
          true
        );


        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );


        const user =
          userCredential.user;


        const madrasaRef =
          doc(
            collection(
              db,
              "madrasas"
            )
          );


        const madrasaId =
          madrasaRef.id;


        await setDoc(
          madrasaRef,
          {

            madrasaId,

            madrasaName:
              madrasaName.trim(),

            headName:
              headName.trim(),

            email:
              email.trim(),

            phone:
              phone.trim(),

            state:
              state.trim(),

            district:
              district.trim(),

            city:
              city.trim(),

            address:
              address.trim(),

            ownerUid:
              user.uid,

            status:
              "Active",

            verificationStatus:
              "Unverified",

            plan:
              "Free",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            uid:
              user.uid,

            madrasaId,

            fullName:
              headName.trim(),

            email:
              email.trim(),

            phone:
              phone.trim(),

            role:
              "Owner",

            status:
              "Active",

            permissions: {
              dashboard:
                true,

              students:
                true,

              staff:
                true,

              parents:
                true,

              accounts:
                true,

              donations:
                true,

              reports:
                true,

              settings:
                true
            },

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        localStorage.setItem(
          "madrasaId",
          madrasaId
        );

        localStorage.setItem(
          "adminId",
          user.uid
        );

        localStorage.setItem(
          "adminName",
          headName.trim()
        );

        localStorage.setItem(
          "adminRole",
          "Owner"
        );

        localStorage.setItem(
          "adminEmail",
          email.trim()
        );


        alert(
          "Madrasa Account Created Successfully"
        );


        navigate(
          "/dashboard"
        );

      }
      catch (error) {

        console.log(
          error
        );


        if (
          error.code ===
          "auth/email-already-in-use"
        ) {

          alert(
            "This email address is already registered."
          );

        }
        else if (
          error.code ===
          "auth/invalid-email"
        ) {

          alert(
            "Please enter a valid email address."
          );

        }
        else if (
          error.code ===
          "auth/weak-password"
        ) {

          alert(
            "Please use a stronger password."
          );

        }
        else {

          alert(
            "Unable to create Madrasa account."
          );

        }

      }
      finally {

        setLoading(
          false
        );

      }

    };


  return (

    <div className="login-page">

      <div
        className="login-card"
        style={{
          maxWidth:
            "700px"
        }}
      >

        <div className="login-logo">
          🕌
        </div>


        <h1 className="login-title">

          Create Your Madrasa

        </h1>


        <p className="login-subtitle">

          Register your Madrasa and create the owner account

        </p>


        <div className="form-grid">


          <input
            type="text"
            placeholder="Madrasa Name"
            value={
              madrasaName
            }
            onChange={(e) =>
              setMadrasaName(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="Madrasa Head / Owner Name"
            value={
              headName
            }
            onChange={(e) =>
              setHeadName(
                e.target.value
              )
            }
          />


          <input
            type="email"
            placeholder="Email Address"
            value={
              email
            }
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />


          <input
            type="tel"
            placeholder="10 Digit Phone Number"
            value={
              phone
            }
            maxLength="10"
            onChange={(e) =>
              setPhone(
                e.target.value
                  .replace(
                    /\D/g,
                    ""
                  )
              )
            }
          />


          <input
            type="password"
            placeholder="Password"
            value={
              password
            }
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />


          <input
            type="password"
            placeholder="Confirm Password"
            value={
              confirmPassword
            }
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="State"
            value={
              state
            }
            onChange={(e) =>
              setState(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="District"
            value={
              district
            }
            onChange={(e) =>
              setDistrict(
                e.target.value
              )
            }
          />


          <input
            type="text"
            placeholder="City"
            value={
              city
            }
            onChange={(e) =>
              setCity(
                e.target.value
              )
            }
          />


        </div>


        <textarea
          placeholder="Full Madrasa Address"
          value={
            address
          }
          onChange={(e) =>
            setAddress(
              e.target.value
            )
          }
          rows="4"
        />


        <button
          type="button"
          onClick={
            createMadrasa
          }
          disabled={
            loading
          }
        >

          {
            loading
              ? "Creating Madrasa..."
              : "🕌 Create Madrasa"
          }

        </button>


        <p className="signup">

          Already registered?{" "}

          <span
            style={{
              cursor:
                "pointer",
              fontWeight:
                "700"
            }}
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >

            Login

          </span>

        </p>

      </div>

    </div>

  );

}


export default CreateMadrasa;