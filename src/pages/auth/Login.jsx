import {
  useState
} from "react";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  useNavigate
} from "react-router-dom";

import "../../App.css";

import {
  auth,
  db
} from "../../firebase";


function Login() {

  const navigate =
    useNavigate();


  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [rememberMe,
    setRememberMe] =
    useState(false);

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  const [resetLoading,
    setResetLoading] =
    useState(false);


  const login =
    async () => {

      if (
        !email.trim() ||
        !password.trim()
      ) {

        alert(
          "Please fill all fields."
        );

        return;
      }


      try {

        setLoading(
          true
        );


        await setPersistence(
          auth,

          rememberMe
            ? browserLocalPersistence
            : browserSessionPersistence
        );


        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );


        const user =
          userCredential.user;


        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        const userSnap =
          await getDoc(
            userRef
          );


        if (
          !userSnap.exists()
        ) {

          alert(
            "User profile not found."
          );

          return;
        }


        const userData =
          userSnap.data();


        if (
          userData.status !==
          "Active"
        ) {

          alert(
            "Your account is not active."
          );

          return;
        }


        if (
          !userData.madrasaId
        ) {

          alert(
            "Madrasa account not found."
          );

          return;
        }


        localStorage.setItem(
          "isAdminLoggedIn",
          "true"
        );


        localStorage.setItem(
          "adminId",
          user.uid
        );


        localStorage.setItem(
          "adminName",
          userData.fullName || ""
        );


        localStorage.setItem(
          "adminRole",
          userData.role || ""
        );


        localStorage.setItem(
          "adminEmail",
          userData.email || ""
        );


        localStorage.setItem(
          "madrasaId",
          userData.madrasaId
        );


        localStorage.setItem(
          "userPermissions",
          JSON.stringify(
            userData.permissions || {}
          )
        );


        if (
          rememberMe
        ) {

          localStorage.setItem(
            "rememberAdmin",
            "true"
          );

        }
        else {

          localStorage.removeItem(
            "rememberAdmin"
          );

        }


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
            "auth/invalid-credential" ||
          error.code ===
            "auth/wrong-password" ||
          error.code ===
            "auth/user-not-found"
        ) {

          alert(
            "Invalid email or password."
          );

        }
        else if (
          error.code ===
          "auth/too-many-requests"
        ) {

          alert(
            "Too many failed login attempts. Please try again later."
          );

        }
        else if (
          error.code ===
          "auth/network-request-failed"
        ) {

          alert(
            "Network error. Please check your internet connection."
          );

        }
        else {

          alert(
            "Login Failed."
          );

        }

      }
      finally {

        setLoading(
          false
        );

      }

    };


  const forgotPassword =
    async () => {

      if (
        !email.trim()
      ) {

        alert(
          "Please enter your email address first."
        );

        return;
      }


      try {

        setResetLoading(
          true
        );


        await sendPasswordResetEmail(
          auth,
          email.trim()
        );


        alert(
          "Password reset email sent successfully. Please check your email inbox."
        );

      }
      catch (error) {

        console.log(
          error
        );


        if (
          error.code ===
          "auth/invalid-email"
        ) {

          alert(
            "Please enter a valid email address."
          );

        }
        else if (
          error.code ===
          "auth/user-not-found"
        ) {

          alert(
            "No account was found with this email address."
          );

        }
        else if (
          error.code ===
          "auth/network-request-failed"
        ) {

          alert(
            "Network error. Please check your internet connection."
          );

        }
        else {

          alert(
            "Unable to send password reset email. Please try again."
          );

        }

      }
      finally {

        setResetLoading(
          false
        );

      }

    };


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🕌
        </div>


        <h1 className="login-title">
          MA - MADRASA ERP
        </h1>


        <p className="login-subtitle">
          Welcome Back
        </p>


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
          onKeyDown={(e) => {

            if (
              e.key ===
              "Enter"
            ) {

              login();

            }

          }}
        />


        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Password"
          value={
            password
          }
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key ===
              "Enter"
            ) {

              login();

            }

          }}
        />


        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            marginTop:
              "10px",

            marginBottom:
              "20px"
          }}
        >

          <label>

            <input
              type="checkbox"
              checked={
                rememberMe
              }
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
            />

            {" "}

            Remember Me

          </label>


          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
          >

            {
              showPassword
                ? "🙈 Hide"
                : "👁 Show"
            }

          </button>

        </div>


        <button
          type="button"
          onClick={
            login
          }
          disabled={
            loading ||
            resetLoading
          }
        >

          {
            loading
              ? "Logging In..."
              : "Login"
          }

        </button>


        <p
          className="forgot"
          onClick={
            forgotPassword
          }
          style={{
            cursor:
              resetLoading
                ? "default"
                : "pointer",

            opacity:
              resetLoading
                ? 0.6
                : 1
          }}
        >

          {
            resetLoading
              ? "Sending Reset Email..."
              : "Forgot Password?"
          }

        </p>


        <p className="signup">

          Don't have a Madrasa account?{" "}

          <span
            style={{
              cursor:
                "pointer",

              fontWeight:
                "700"
            }}
            onClick={() =>
              navigate(
                "/create-madrasa"
              )
            }
          >

            Create Madrasa

          </span>

        </p>


      </div>

    </div>

  );

}


export default Login;