import { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/authProvider.jsx";
import Login from "./pages/logIn";
import Experience from "./pages/experience";

function App() {
  const [logIn, setLogIn] = useState(false);
  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      setLogIn(true);
    } else {
      setLogIn(false);
    }
  }, [token]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Login
              logIn={logIn}
              setLogIn={setLogIn}
            />
          }
        />
        <Route
          path="/home"
          element={
            logIn ? (
              <Experience
                logIn={logIn}
                setLogIn={setLogIn}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
