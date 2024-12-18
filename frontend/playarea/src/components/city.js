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
import { CITY_QUERY, ME_QUERY } from "../queries/queries";
import noImage from "../images/noImage.png";

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

  const [table, setTable] = useState("rankings");

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
  const league = city?.league;
  const matches = city?.matches;
  const userId = localStorage.getItem("userId");
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

  // Declare filtered match arrays
  const pendingMatches =
    matches?.filter((match) => match.status === "PENDING") || [];
  const scheduledMatches =
    matches?.filter((match) => match.status === "SCHEDULED") || [];
  const completedMatches =
    matches?.filter((match) => match.status === "COMPLETED") || [];
  const canceledMatches =
    matches?.filter((match) => match.status === "CANCELED") || [];

  return (
    <div>
      <div className="city-info">
        <div className="city-info-body">
          <div className="city-logo">
            {city.image ? (
              <img
                src={`${MEDIA_URL}${city.image}`}
                alt={`${city.image} logo`}
              />
            ) : (
              <img src={noImage} />
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
              <p>Brak przypisania do ligi</p>
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
                      <td>{ranking.goalDifference}</td>{" "}
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
                {pendingMatches.length > 0 ? (
                  pendingMatches.map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          match.homeTeam &&
                          navigate(`/team/${match.homeTeam.id}`)
                        }
                      >
                        <div style={{ padding: "5px", alignItems: "center" }}>
                          {match.homeTeam?.name}
                          {match.homeTeam.logo ? (
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
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
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
                        <div style={{ padding: "5px", alignItems: "center" }}>
                          {match.awayTeam.logo ? (
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
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                            />
                          )}
                          {match.awayTeam?.name}
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
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
                          {match?.homeTeam?.name}
                          {match.homeTeam.logo ? (
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
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "right",
                              }}
                              src={noImage}
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
                          {match.awayTeam.logo ? (
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
                          ) : (
                            <img
                              style={{
                                width: "20px",
                                height: "auto",
                                marginLeft: "0",
                                float: "left",
                              }}
                              src={noImage}
                            />
                          )}
                          {match.awayTeam.name}
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
                    <td colSpan={5} style={{ textAlign: "center" }}>
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
                              alt={`${match.homeTeam.logo} logo`}
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
                              alt={`${match.awayTeam.logo} logo`}
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
                            />
                          )}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
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
                              alt={`${match.homeTeam.logo} logo`}
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
                              alt={`${match.awayTeam.logo} logo`}
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
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
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

export default City;
