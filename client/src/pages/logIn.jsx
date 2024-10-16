import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authProvider";

function Login() {
  const { AuthUrl, logIn: isLoggedIn } = useContext(AuthContext);
  const [animate, setAnimate] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      setAnimate(true);

      const timeout = setTimeout(() => {
        setShowContent(true);
        navigate("/home");
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="w-screen h-screen bg-[#191414] flex items-center justify-center relative overflow-hidden">
      {showContent ? (
        <div className="absolute inset-0 bg-[#1DB954] w-full h-full rounded-full animate-expand"></div>
      ) : (
        <div
          className={`flex-col items-center justify-center w-[40%] h-[40%] bg-[#1DB954] rounded-lg z-10 ${
            animate ? "hidden" : "flex"
          }`}
        >
          <h1 className="text-white text-4xl mb-6">Login to Spotify</h1>
          <a
            href={AuthUrl}
            className="bg-white text-green-500 px-6 py-3 rounded-full text-lg font-bold transition duration-300 ease-in-out hover:bg-green-400"
          >
            Login with Spotify
          </a>
        </div>
      )}
    </div>
  );
}

export default Login;
