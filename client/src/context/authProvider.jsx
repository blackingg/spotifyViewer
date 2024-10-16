import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [logIn, setLogInToken] = useState(false);
  const navigate = useNavigate();

  const CLIENT_ID = import.meta.env.VITE_Client_ID;
  const REDIRECT_URI = "https://spotifyviewer-blackingg.netlify.app";
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const AuthUrl = `${TOKEN_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-currently-playing`;

  useEffect(() => {
    const hash = window.location.hash;
    let token_auth = window.localStorage.getItem("token_auth");

    if (!token_auth && hash) {
      token_auth = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token_auth", token_auth);
    }

    if (token_auth) {
      setToken(token_auth);
      validateToken(token_auth);
    }
  }, []);

  const validateToken = async (token_auth) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token_auth}`,
        },
      });

      if (response.ok) {
        setLogInToken(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error validating token:", error);
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setLogInToken(false);
    window.localStorage.removeItem("token_auth");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ token, logout, AuthUrl, logIn, setLogInToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
