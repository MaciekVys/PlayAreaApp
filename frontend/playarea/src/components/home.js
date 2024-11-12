import React from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import "../styles/home.scss"; // Import pliku CSS do stylizacji
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faFileSignature } from "@fortawesome/free-solid-svg-icons";
import { ALL_CITIES } from "../queries/queries";

const Home = () => {
  const navigate = useNavigate();
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const {
    data: citiesData,
    loading: citiesLoading,
    error: citiesError,
  } = useQuery(ALL_CITIES);

  if (citiesLoading) return <p>Ładowanie danych...</p>;
  if (citiesError)
    return <p>Błąd podczas ładowania miast: {citiesError.message}</p>;

  const rankCities = citiesData.allCities;

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
              Załóż drużynę <FontAwesomeIcon icon={faFileSignature} />
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("/search")}
            >
              Dołącz do drużyny <FontAwesomeIcon icon={faUserPlus} />
            </button>
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
      <section className="rankings">
        <div>
          <h2>Ranking miast</h2>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Nazwa miasta</th>
                <th>Liga</th>
              </tr>
            </thead>
            <tbody>
              {citiesData?.allCities?.map((city, index) => (
                <tr key={index}>
                  <td style={{ maxWidth: "30px" }}>
                    {city.image && (
                      <img
                        src={`${MEDIA_URL}${city.image}`}
                        alt={`${city.image} logo`}
                        style={{
                          width: "50px",
                          height: "auto",
                        }}
                      />
                    )}
                  </td>
                  <td
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => navigate(`/city/${city.name}`)}
                  >
                    {city.name}
                  </td>
                  <td>{city.league?.name || "Brak ligi"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Home;
