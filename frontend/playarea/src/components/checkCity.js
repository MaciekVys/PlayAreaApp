import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/city.scss";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleRight,
  faFutbol,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import { CITY_QUERY } from "../queries/queries";
import noImage from "../images/noImage.png";

const CheckCity = () => {
  const { name: cityName } = useParams();
  const navigate = useNavigate();
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const userId = localStorage.getItem("userId");

  const { data, loading, error } = useQuery(CITY_QUERY, {
    variables: { name: cityName },
  });

  const [table, setTable] = useState("rankings");

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p>Wystąpił błąd podczas pobierania danych.</p>;

  const city = data.cityName;

  // Sprawdzanie, czy miasto i liga istnieją
  if (!city) {
    return (
      <div className="cta-section">
        <h1>Brak miasta</h1>
        <p>Nie znaleziono miasta o nazwie {cityName}.</p>
      </div>
    );
  }

  const league = city.league; // league might be null
  const matches = city.matches || [];

  // Deklaracja przefiltrowanych tablic meczów
  const pendingMatches = matches.filter((match) => match.status === "PENDING");
  const scheduledMatches = matches.filter(
    (match) => match.status === "SCHEDULED"
  );
  const completedMatches = matches.filter(
    (match) => match.status === "COMPLETED"
  );
  const canceledMatches = matches.filter(
    (match) => match.status === "CANCELED"
  );

  let rankings = league ? [...league.rankings] : []; // Utworzenie kopii tablicy rankings za pomocą spread operatora

  // Sortowanie rankings według punktów, a następnie po goalDifference
  rankings = rankings.sort((a, b) => {
    if (b.points === a.points) {
      // Sortowanie po goalDifference jeśli punkty są równe
      return b.goalDifference - a.goalDifference;
    }
    // Sortowanie po punktach
    return b.points - a.points;
  });

  return (
    <div>
      <div className="city-info">
        <div className="city-info-body">
          <div className="city-logo">
            {city.image ? (
              <img
                src={`${MEDIA_URL}${city.image}`}
                alt={`${city.name} logo`}
              />
            ) : (
              <img src={noImage} alt="No image" />
            )}
          </div>
          <div className="left-side">
            <h1>Miasto: {city.name}</h1>
            <p>Województwo: {city.voivodeship}</p>
            {league ? (
              <p>
                Liga: {league.name}, Poziom: {league.level}
              </p>
            ) : (
              <p>Brak przypisania do ligi.</p>
            )}
          </div>
        </div>
      </div>
      {league ? (
        <>
          <div className="tabs">
            <button
              className={table === "rankings" ? "active" : ""}
              onClick={() => setTable("rankings")}
            >
              Tabela <FontAwesomeIcon icon={faTable} />
            </button>
            <button
              className={table === "matches" ? "active" : ""}
              onClick={() => setTable("matches")}
            >
              Mecze <FontAwesomeIcon icon={faFutbol} />
            </button>
          </div>
          {table === "rankings" && (
            <div className="city-container section">
              <h2>Rankingi Sezonu</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Miejsce</th> {/* Kolumna "Miejsce" */}
                    <th>Drużyna</th>
                    <th>Zwycięstwa</th>
                    <th>Remisy</th>
                    <th>Porażki</th>
                    <th>Bramki strzelone</th>
                    <th>Bramki stracone</th>
                    <th>Bilans +/-</th>
                    <th>Punkty</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${ranking.team.id}`)}
                      >
                        <div style={{ padding: "5px", alignItems: "center" }}>
                          {ranking.team.name}
                          <img
                            style={{
                              width: "20px",
                              height: "auto",
                              marginLeft: "0",
                              float: "right",
                            }}
                            src={
                              ranking.team.logo
                                ? `${MEDIA_URL}${ranking.team.logo}`
                                : noImage
                            }
                            alt={`${ranking.team.name} logo`}
                          />
                        </div>
                      </td>
                      <td>{ranking.wins}</td>
                      <td>{ranking.draws}</td>
                      <td>{ranking.losses}</td>
                      <td>{ranking.goalsFor}</td>
                      <td>{ranking.goalsAgainst}</td>
                      <td>{ranking.goalDifference}</td>
                      <td>{ranking.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ height: "100px" }}></div>
            </div>
          )}
        </>
      ) : (
        <div></div>
      )}
      {table === "matches" && (
        <div className="city-container section">
          <section>
            <h2>Zaplanowane</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gospodarze</th>
                  <th></th>
                  <th>Goście</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pendingMatches.length > 0 ? (
                  pendingMatches.map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.homeTeam.name}
                          {match.homeTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={`${MEDIA_URL}${match.homeTeam.logo}`}
                              alt={`${match.homeTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      <td>-</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.awayTeam.name}
                          {match.awayTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={`${MEDIA_URL}${match.awayTeam.logo}`}
                              alt={`${match.awayTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      {match?.homeTeam?.captain?.id === userId ||
                      match?.awayTeam?.captain?.id === userId ? (
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/notification")}
                        >
                          <FontAwesomeIcon icon={faCircleRight} />
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Brak meczy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <section>
            <h2>Najbliższe mecze</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gospodarze</th>
                  <th></th>
                  <th>Goście</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scheduledMatches.length > 0 ? (
                  scheduledMatches.map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.homeTeam.name}
                          {match.homeTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={`${MEDIA_URL}${match.homeTeam.logo}`}
                              alt={`${match.homeTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      <td>-</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.awayTeam.name}
                          {match.awayTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={`${MEDIA_URL}${match.awayTeam.logo}`}
                              alt={`${match.awayTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      {match?.homeTeam?.captain?.id === userId ||
                      match?.awayTeam?.captain?.id === userId ? (
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/confirmMatch/${match.id}`)}
                        >
                          <FontAwesomeIcon icon={faCircleRight} />
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Brak meczy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Ostatnie mecze</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gospodarze</th>
                  <th>Wynik</th>
                  <th>Goście</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {completedMatches.length > 0 ? (
                  completedMatches.map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.homeTeam.name}
                          {match.homeTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={`${MEDIA_URL}${match.homeTeam.logo}`}
                              alt={`${match.homeTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        {match.scoreHome} : {match.scoreAway}
                      </td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.awayTeam.name}
                          {match.awayTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={`${MEDIA_URL}${match.awayTeam.logo}`}
                              alt={`${match.awayTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>

                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/checkMatch/${match.id}`)}
                      >
                        <FontAwesomeIcon icon={faCircleRight} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      Brak meczy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Nieodbyte mecze</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Gospodarze</th>
                  <th></th>
                  <th>Goście</th>
                </tr>
              </thead>
              <tbody>
                {canceledMatches.length > 0 ? (
                  canceledMatches.map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.homeTeam.name}
                          {match.homeTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={`${MEDIA_URL}${match.homeTeam.logo}`}
                              alt={`${match.homeTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                      <td>-</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                      >
                        <div
                          style={{
                            padding: "5px",
                            alignItems: "center",
                          }}
                        >
                          {match.awayTeam.name}
                          {match.awayTeam.logo ? (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={`${MEDIA_URL}${match.awayTeam.logo}`}
                              alt={`${match.awayTeam.name} logo`}
                            />
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                              alt="No logo"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      Brak meczy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <div style={{ height: "100px" }}></div>
        </div>
      )}
    </div>
  );
};

export default CheckCity;
