import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/city.scss";
import { useNavigate, useParams } from "react-router-dom";

const CITY_QUERY = gql`
  query GetCityData($name: String!) {
    cityName(name: $name) {
      image
      id
      name
      voivodeship
      league {
        name
        level
        rankings {
          points
          wins
          draws
          losses
          goalsFor
          goalsAgainst
          team {
            logo
            name
            id
          }
        }
      }
      matches {
        homeTeam {
          logo
          id
          name
          captain {
            id
            username
          }
        }
        awayTeam {
          logo
          name
          id
          captain {
            id
            username
          }
        }
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
      }
    }
  }
`;

const CheckCity = () => {
  const { name: cityName } = useParams();
  const navigate = useNavigate();
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const userId = localStorage.getItem("userId");

  const { data, loading, error } = useQuery(CITY_QUERY, {
    variables: { name: cityName },
  });

  const [table, setTable] = useState("matches");

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
  const matches = city.matches;
  const rankings = league ? league.rankings : [];

  return (
    <div>
      <div className="city-info">
        <div className="city-info-body">
          <div className="city-logo">
            {city.image && (
              <img
                src={`${MEDIA_URL}${city.image}`}
                alt={`${city.image} logo`}
              />
            )}
          </div>
          <div>
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
              className={table === "matches" ? "active" : ""}
              onClick={() => setTable("matches")}
            >
              Mecze
            </button>
            <button
              className={table === "rankings" ? "active" : ""}
              onClick={() => setTable("rankings")}
            >
              Tabela
            </button>
          </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {matches
                      .filter((match) => match.status === "PENDING")
                      .map((match, index) => (
                        <tr key={index}>
                          <td>{match.matchDate}</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.homeTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.homeTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "right",
                                }}
                                src={`${MEDIA_URL}${match.homeTeam.logo}`}
                                alt={`${match.homeTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          <td>-</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.awayTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.awayTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "left",
                                }}
                                src={`${MEDIA_URL}${match.awayTeam.logo}`}
                                alt={`${match.awayTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          {match?.homeTeam?.captain?.id === userId ||
                          match?.awayTeam?.captain?.id === userId ? (
                            <td
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate("/notification")}
                            >
                              GO{" "}
                            </td>
                          ) : (
                            <td></td>
                          )}
                        </tr>
                      ))}
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
                      <th>Wynik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches
                      .filter((match) => match.status === "SCHEDULED")
                      .map((match, index) => (
                        <tr key={index}>
                          <td>{match.matchDate}</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.homeTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.homeTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "right",
                                }}
                                src={`${MEDIA_URL}${match.homeTeam.logo}`}
                                alt={`${match.homeTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          <td>-</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.awayTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.awayTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "left",
                                }}
                                src={`${MEDIA_URL}${match.awayTeam.logo}`}
                                alt={`${match.awayTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          {match?.homeTeam?.captain?.id === userId ||
                          match?.awayTeam?.captain?.id === userId ? (
                            <td
                              style={{ cursor: "pointer" }}
                              onClick={() => navigate("/notification")}
                            >
                              GO{" "}
                            </td>
                          ) : (
                            <td></td>
                          )}
                        </tr>
                      ))}
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
                      <th></th>
                      <th>Goście</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches
                      .filter((match) => match.status === "COMPLETED")
                      .map((match, index) => (
                        <tr key={index}>
                          <td>{match.matchDate}</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.homeTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.homeTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "right",
                                }}
                                src={`${MEDIA_URL}${match.homeTeam.logo}`}
                                alt={`${match.homeTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          <td>
                            {match.scoreHome} : {match.scoreAway}
                          </td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.awayTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.awayTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "left",
                                }}
                                src={`${MEDIA_URL}${match.awayTeam.logo}`}
                                alt={`${match.awayTeam.logo} logo`}
                              />
                            </div>
                          </td>

                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/checkMatch/${match.id}`)}
                          >
                            GO{" "}
                          </td>
                        </tr>
                      ))}
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
                    {matches
                      .filter((match) => match.status === "CANCELED")
                      .map((match, index) => (
                        <tr key={index}>
                          <td>{match.matchDate}</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.homeTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.homeTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "right",
                                }}
                                src={`${MEDIA_URL}${match.homeTeam.logo}`}
                                alt={`${match.homeTeam.logo} logo`}
                              />
                            </div>
                          </td>
                          <td>-</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/team/${match.awayTeam.id}`)
                            }
                          >
                            <div
                              style={{
                                padding: "5px",
                                alignItems: "center",
                              }}
                            >
                              {match.awayTeam.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "left",
                                }}
                                src={`${MEDIA_URL}${match.awayTeam.logo}`}
                                alt={`${match.awayTeam.logo} logo`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {table === "rankings" && (
            <div className="city-container section">
              <h2>Rankingi Sezonu</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Miejsce</th> {/* Dodanie kolumny "Miejsce" */}
                    <th>Drużyna</th>
                    <th>Zwycięstwa</th>
                    <th>Remisy</th>
                    <th>Porażki</th>
                    <th>Bramki strzelone</th>
                    <th>Bramki stracone</th>
                    <th>Punkty</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings
                    .slice() // Tworzy kopię danych, żeby nie modyfikować oryginału
                    .sort((a, b) => b.points - a.points) // Sortowanie od największej ilości punktów
                    .map((ranking, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: "bold" }}>{index + 1}</td>{" "}
                        {/* Numer miejsca */}
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
                              src={`${MEDIA_URL}${ranking.team.logo}`}
                              alt={`${ranking.team.logo} logo`}
                            />
                          </div>
                        </td>
                        <td>{ranking.wins}</td>
                        <td>{ranking.draws}</td>
                        <td>{ranking.losses}</td>
                        <td>{ranking.goalsFor}</td>
                        <td>{ranking.goalsAgainst}</td>
                        <td>{ranking.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div>
          <h1>Brak ligi</h1>
          <div>
            <p>
              Wygląda na to, że twoje miasto nie jest przypisane do ligi. Zgłoś
              swoje miasto do rozgrywek.
            </p>
            <button>Zgłoś</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCity;
