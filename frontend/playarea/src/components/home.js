import React from "react";
import "../styles/home.scss"; // Import pliku CSS do stylizacji
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Sekcja hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>PlayArea - Zgłoś swoją drużynę na orlik!</h1>
          <p>
            Zgłoś swoją drużynę już teraz do rozgrywek 6vs6 w Twoim mieście.
            Sprawdź swoje umiejętności i rywalizuj o mistrzostwo!
          </p>
          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => navigate("/createTeam")}
            >
              Załóż drużynę
            </button>
            <button className="secondary-button">Dołącz do drużyny</button>
          </div>
        </div>
      </section>

      {/* Sekcja z funkcjami */}
      <section className="features">
        <h2>Dlaczego warto grać na PlayArea?</h2>
        <div className="features-cards">
          <div className="card">
            <h3>Rozgrywki 6vs6</h3>
            <p>
              Graj na orlikach z drużynami z całego miasta i walcz o mistrzostwo
              w swojej lidze.
            </p>
          </div>
          <div className="card">
            <h3>Statystyki na żywo</h3>
            <p>
              Śledź swoje wyniki i statystyki meczów na żywo. Każdy gol i każda
              asysta się liczy!
            </p>
          </div>
          <div className="card">
            <h3>Tabele i rankingi</h3>
            <p>
              Sprawdź tabele ligowe i rankingi zawodników. Zobacz, kto jest
              najlepszy!
            </p>
          </div>
        </div>
      </section>

      {/* Sekcja z rejestracją */}
      <section className="cta-section">
        <h2>Dołącz do największej społeczności piłkarskiej na orlikach!</h2>
        <p>
          Zgłoś swoją drużynę lub dołącz do istniejącej i zacznij grać już
          teraz. Na co czekasz?
        </p>
        <button
          className="primary-button"
          onClick={() => navigate("/createTeam")}
        >
          Załóż drużynę
        </button>
      </section>
    </div>
  );
};

export default Home;
