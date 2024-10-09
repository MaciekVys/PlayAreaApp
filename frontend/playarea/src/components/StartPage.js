import React from "react";
import "../styles/startPage.scss";
import { useNavigate } from "react-router-dom";

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-page">
      <div className="hero2">
        <div className="hero-content2">
          <h1>Dołącz do Gry!</h1>
          <p>Zaloguj się lub zarejestruj, aby zacząć rywalizację na boisku.</p>
          <div className="hero-buttons2">
            <button
              className="primary-button2"
              onClick={() => navigate("/login")}
            >
              Zaloguj się
            </button>
            <button
              className="secondary-button2"
              onClick={() => navigate("/register")}
            >
              Zarejestruj się
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
