import {
  Navigate,
  Outlet
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  useEffect,
  useState
} from "react";

import {
  auth
} from "../../firebase";


function ProtectedRoute() {

  const [user,
    setUser] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(
            currentUser
          );

          setLoading(
            false
          );

        }
      );


    return () =>
      unsubscribe();

  }, []);


  if (loading) {

    return (

      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          justifyContent:
            "center",

          alignItems:
            "center"
        }}
      >

        <h2>
          🕌 Loading Madrasa ERP...
        </h2>

      </div>

    );

  }


  if (!user) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  return <Outlet />;

}


export default ProtectedRoute;