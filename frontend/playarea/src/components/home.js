import React from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import "../styles/home.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faFileSignature } from "@fortawesome/free-solid-svg-icons";
import { GET_TOP_TEAMS, GET_TOP_PLAYERS } from "../queries/queries";
import noImage from "../images/noImage.png";

const Home = () => {
  const navigate = useNavigate();
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useQuery(GET_TOP_TEAMS);

  const {
    data: playersData,
    loading: playersLoading,
    error: playersError,
  } = useQuery(GET_TOP_PLAYERS);

  if (teamsLoading || playersLoading) return <p>Ładowanie danych...</p>;
  if (teamsError)
    return <p>Błąd podczas ładowania drużyn: {teamsError.message}</p>;
  if (playersError)
    return <p>Błąd podczas ładowania graczy: {playersError.message}</p>;

  const topPlayers = playersData.topPlayers;

  let teams = [...teamsData.topTeams];

  // Sortujemy drużyny według liczby rozegranych meczów i wygranych
  teams.sort((a, b) => {
    if (b.matchesPlayed !== a.matchesPlayed) {
      return b.matchesPlayed - a.matchesPlayed;
    } else {
      return b.wins - a.wins;
    }
  });

  // Pobieramy top 10 drużyn
  const topTeams = teams.slice(0, 10);

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

      {/* Sekcja z rankingiem drużyn */}
      <section className="rankings">
        <div>
          <h2>Top 10 drużyn w Polsce</h2>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Nazwa drużyny</th>
                <th>Liga</th>
                <th>Mecze</th>
                <th>Wygrane</th>
              </tr>
            </thead>
            <tbody>
              {topTeams.map((team, index) => (
                <tr key={index}>
                  <td style={{ maxWidth: "30px" }}>
                    {team.logo ? (
                      <img
                        src={`${MEDIA_URL}${team.logo}`}
                        alt={`${team.name} logo`}
                        style={{
                          width: "50px",
                          height: "auto",
                        }}
                      />
                    ) : (
                      <img
                        style={{
                          width: "50px",
                          height: "auto",
                        }}
                        src={noImage}
                        alt="No logo"
                      />
                    )}
                  </td>
                  <td
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => navigate(`/team/${team.id}`)}
                  >
                    {team.name}
                  </td>
                  <td
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={() =>
                      navigate(`/city/${team?.league?.city?.name}`)
                    }
                  >
                    {team.league?.name || "Brak ligi"}
                  </td>
                  <td>{team.matchesPlayed}</td>
                  <td>{team.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />

          {/* Sekcja z top graczami */}
          <h2>Top 20 Graczy</h2>
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Użytkownik</th>
                <th>Drużyna</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player, index) => (
                <tr key={index}>
                  <td>
                    {player.photo ? (
                      <img
                        src={`${MEDIA_URL}${player.photo}`}
                        alt={`${player.username}`}
                        className="player-photo"
                        style={{
                          width: "50px",
                          height: "auto",
                        }}
                      />
                    ) : (
                      <img
                        style={{
                          width: "50px",
                          height: "auto",
                        }}
                        src={noImage}
                        alt="Brak zdjęcia"
                        className="player-photo"
                      />
                    )}
                  </td>
                  <td
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => navigate(`/profile/${player.id}`)}
                  >
                    {player.username}
                  </td>
                  <td
                    style={{ cursor: player.team ? "pointer" : "default" }}
                    onClick={() =>
                      player.team && navigate(`/team/${player.team.id}`)
                    }
                  >
                    {player.team ? (
                      <>
                        {player.team.name}

                        {player.team.logo ? (
                          <img
                            src={`${MEDIA_URL}${player.team.logo}`}
                            alt={`${player.team.name} logo`}
                            style={{
                              width: "30px",
                              height: "auto",
                              marginLeft: "5px",
                              verticalAlign: "middle",
                            }}
                          />
                        ) : (
                          <img
                            style={{
                              width: "30px",
                              height: "auto",
                              marginLeft: "5px",
                              verticalAlign: "middle",
                            }}
                            src={noImage}
                            alt="No logo"
                          />
                        )}
                      </>
                    ) : (
                      "Brak drużyny"
                    )}
                  </td>

                  <td>{player.goals}</td>
                  <td>{player.assists}</td>
                  <td>{player.mvp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ height: "50px" }}></div>
    </div>
  );
};

export default Home;
