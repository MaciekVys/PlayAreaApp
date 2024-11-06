import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useEffect, useState } from "react";
import "../styles/city.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleRight,
  faFutbol,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

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
          captain {
            id
            username
          }
          id
          name
          logo
        }
        awayTeam {
          captain {
            id
            username
          }
          name
          id
          logo
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
const ME_QUERY = gql`
  query MeQuery {
    me {
      city {
        name
      }
    }
  }
`;
const City = () => {
  const [cityName, setCityName] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const { data, loading, error } = useQuery(CITY_QUERY, {
    variables: { name: cityName },
    skip: !cityName,
  });

  const { data: meData } = useQuery(ME_QUERY);

  useEffect(() => {
    if (meData && meData.me) {
      if (meData.me.city) {
        setCityName(meData.me.city.name);
      } else {
        setMessage("Please set your city in your settings to view rankings.");
      }
    }
  }, [meData]);

  const [table, setTable] = useState("matches");

  if (loading) return <p>Ładowanie danych...</p>;
  if (error || (!data && !message))
    return (
      <div className="cta-section">
        <h1>Problem z pobraniem danych</h1>
        <div>{message || "An error occurred while loading the city data."}</div>
        <button
          className="secondary-button"
          onClick={() => navigate("/settings")}
        >
          Ustawienia
        </button>
      </div>
    );

  if (message) {
    return (
      <div className="cta-section">
        <h1>Brak miasta</h1>
        <div>{message}</div>
        <button
          className="secondary-button"
          onClick={() => navigate("/settings")}
        >
          Ustawienia
        </button>
      </div>
    );
  }

  const city = data?.cityName;
  const league = city?.league; // league might be null
  const matches = city?.matches; // Ensure matches is assigned
  const rankings = league ? league.rankings : [];
  const userId = localStorage.getItem("userId");

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
              <p>Brak przypisania do ligi</p>
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
              Mecze <FontAwesomeIcon icon={faFutbol} />
            </button>
            <button
              className={table === "rankings" ? "active" : ""}
              onClick={() => setTable("rankings")}
            >
              Tabela <FontAwesomeIcon icon={faTable} />
            </button>
          </div>

          {table === "matches" && (
            <div className="city-container section">
              <section>
                <h2>Mecze oczekujące</h2>
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
                      .filter((match) => match.status === "PENDING")
                      .map((match, index) => (
                        <tr key={index}>
                          <td>{match.matchDate}</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              match.homeTeam &&
                              navigate(`/team/${match.homeTeam.id}`)
                            }
                          >
                            <div
                              style={{ padding: "5px", alignItems: "center" }}
                            >
                              {match.homeTeam?.name}
                              {match.homeTeam?.logo && (
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
                              )}
                            </div>
                          </td>
                          <td>-</td>
                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              match.awayTeam &&
                              navigate(`/team/${match.awayTeam.id}`)
                            }
                          >
                            <div
                              style={{ padding: "5px", alignItems: "center" }}
                            >
                              {match.awayTeam?.logo && (
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
                              )}
                              {match.awayTeam?.name}
                            </div>
                          </td>
                          <td></td>
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
                      <th></th>
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
                              {match?.homeTeam?.name}
                              <img
                                style={{
                                  width: "20px",
                                  height: "auto",
                                  marginLeft: "0",
                                  float: "right",
                                }}
                                src={`${MEDIA_URL}${match?.homeTeam?.logo}`}
                                alt={`${match?.homeTeam?.logo} logo`}
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
                              {match.awayTeam.name}
                            </div>
                          </td>
                          {match?.homeTeam?.captain?.id === userId ||
                          match?.awayTeam?.captain?.id === userId ? (
                            <td
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                navigate(`/confirmMatch/${match.id}`)
                              }
                            >
                              <FontAwesomeIcon icon={faCircleRight} />
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
                      <th>Wynik</th>
                      <th>Goście</th>
                      <th></th>
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
                          <td></td>

                          <td
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/checkMatch/${match.id}`)}
                          >
                            <FontAwesomeIcon icon={faCircleRight} />
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
                    .slice()
                    .sort((a, b) => b.points - a.points)
                    .map((ranking, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            ranking.team && navigate(`/team/${ranking.team.id}`)
                          }
                        >
                          <div style={{ padding: "5px", alignItems: "center" }}>
                            {ranking.team?.name}
                            {ranking.team?.logo && (
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
                            )}
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

export default City;
