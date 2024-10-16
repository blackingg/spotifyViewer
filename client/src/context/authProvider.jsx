import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_URI = "https://spotify-viewer-delta.vercel.app";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-currently-playing";

  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPE)}`;

  const validateToken = useCallback(async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error validating token:", error);
      logout();
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = localStorage.getItem("spotify_token");

    if (!storedToken && hash) {
      storedToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1];

      if (storedToken) {
        localStorage.setItem("spotify_token", storedToken);
        window.location.hash = "";
      }
    }

    if (storedToken) {
      setToken(storedToken);
      validateToken(storedToken);
    }
  }, [validateToken]);

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("spotify_token");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, logout, authUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
