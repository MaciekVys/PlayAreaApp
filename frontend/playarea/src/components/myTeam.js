import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/myTeam.scss";
import { useNavigate } from "react-router-dom";

const MY_TEAM_QUERY = gql`
  query team {
    teamByUser {
      id
      name
      logo
      captain {
        username
        id
      }
      league {
        name
        level
        city {
          name
        }
      }
      players {
        user {
          username
          id
        }
        id
        position
      }
      playersCount
      matchesCount
      matches {
        homeTeam {
          logo
          name
          id
        }
        awayTeam {
          logo
          name
          id
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

const TEAM_STATISTICS_SUMMARY_QUERY = gql`
  query teamStatisticsSummary($teamId: ID!) {
    teamStatisticsSummary(teamId: $teamId) {
      totalMvps
      totalGoals
      totalAssists
      user {
        username
      }
    }
  }
`;

const Team = () => {
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

  const [tabs, setTabs] = useState("squad");
  const navigate = useNavigate();

  const {
    data: teamData,
    loading: loadingTeam,
    error: errorTeam,
  } = useQuery(MY_TEAM_QUERY);

  const team = teamData?.teamByUser;

  const teamId = team?.id; // Ensure teamId is defined after team is retrieved
  console.log("Team ID:", teamId); // Debugging: Check if teamId is being fetched correctly

  const {
    data: statsData,
    loading: loadingStats,
    error: errorStats,
  } = useQuery(TEAM_STATISTICS_SUMMARY_QUERY, {
    variables: { teamId: teamId },
    skip: !teamId,
  });

  if (loadingTeam) return <p>Ładowanie danych...</p>;
  if (errorTeam) return <p>Błąd: {errorTeam.message}</p>;
  console.log(teamId);

  if (!team)
    return (
      <div className="no-team-container">
        <h1>Nie należysz do żadnej drużyny!</h1>
        <div>
          <button
            className="primary-button"
            onClick={() => navigate("/createTeam")}
          >
            Załóż drużynę
          </button>
          <button className="secondary-button">Dołącz do drużyny</button>
        </div>
      </div>
    );

  const playerStatsMap = {};
  if (statsData && statsData.teamStatisticsSummary) {
    statsData.teamStatisticsSummary.forEach((stat) => {
      playerStatsMap[stat.user.username] = {
        totalGoals: stat.totalGoals || 0,
        totalAssists: stat.totalAssists || 0,
        totalMvps: stat.totalMvps || 0,
      };
    });
  }

  return (
    <div className="container">
      <div className="team-info">
        {team.logo ? (
          <img src={`${MEDIA_URL}${team.logo}`} alt={`${team.name} logo`} />
        ) : (
          <div className="placeholder-logo">Brak logo</div>
        )}
        <div className="left-side">
          <h1>{team.name}</h1>
          <p>Liczba graczy: {team.playersCount}</p>
          <p>Liczba meczów: {team.matchesCount}</p>
          <p>Miasto: {team.league.city.name}</p>
          <p>Liga: {team.league.name}</p>
          <p>Kapitan: {team.captain.username}</p>
        </div>
      </div>
      <div className="tabs">
        <button
          className={tabs === "squad" ? "active" : ""}
          onClick={() => setTabs("squad")}
        >
          Skład
        </button>
        <button
          className={tabs === "matches" ? "active" : ""}
          onClick={() => setTabs("matches")}
        >
          Mecze
        </button>
      </div>
      {tabs === "squad" && (
        <>
          <h1>Gracze:</h1>
          <table className="players-table">
            <thead>
              <tr>
                <th>Imię Użytkownika</th>
                <th>Pozycja</th>
                <th>Gole</th>
                <th>Asysty</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {loadingStats ? (
                <tr>
                  <td colSpan="5">Ładowanie statystyk...</td>
                </tr>
              ) : errorStats ? (
                <tr>
                  <td colSpan="5">
                    Błąd w ładowaniu statystyk: {errorStats.message}
                  </td>
                </tr>
              ) : (
                team.players.map((player) => {
                  const playerStats =
                    playerStatsMap[player.user.username] || {};
                  return (
                    <tr key={player.id}>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${player.user.id}`)}
                      >
                        {player.user.username}
                      </td>
                      <td>{player.position}</td>
                      <td>{playerStats.totalGoals || 0}</td>
                      <td>{playerStats.totalAssists || 0}</td>
                      <td>{playerStats.totalMvps || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </>
      )}

      {tabs === "matches" && (
        <>
          <h1>Mecze:</h1>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Gospodarze</th>
                <th>Wynik</th>
                <th>Goście</th>
                <th>Wygrana</th>
              </tr>
            </thead>
            <tbody>
              {team.matches.map((match, index) => (
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
                    onClick={() => navigate(`/team/${match.awayTeam.id}`)}
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
        </>
      )}
    </div>
  );
};

export default Team;
