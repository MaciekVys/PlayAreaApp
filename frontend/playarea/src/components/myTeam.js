import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import "../styles/myTeam.scss";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUsers,
  faFutbol,
  faCircleRight,
} from "@fortawesome/free-solid-svg-icons";

const MY_TEAM_QUERY = gql`
  query team {
    teamByUser {
      id
      name
      logo
      league {
        name
        id
        level
        city {
          name
        }
      }
      matchesCount
      captain {
        username
        id
      }
      players {
        id
        username
        position
        height
        weight
      }
      matches {
        id
        matchDate
        scoreHome
        scoreAway
        status
        winner
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

// Define the leaveTeam mutation
const LEAVE_TEAM_MUTATION = gql`
  mutation leaveTeam($teamId: ID!) {
    leaveTeam(teamId: $teamId) {
      success
      message
    }
  }
`;

const Team = () => {
  const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
  const [tabs, setTabs] = useState("squad");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Query to get team data
  const {
    data: teamData,
    loading: loadingTeam,
    error: errorTeam,
  } = useQuery(MY_TEAM_QUERY);
  const team = teamData?.teamByUser;
  const teamId = team?.id;

  // Query to get team statistics
  const {
    data: statsData,
    loading: loadingStats,
    error: errorStats,
  } = useQuery(TEAM_STATISTICS_SUMMARY_QUERY, {
    variables: { teamId },
    skip: !teamId,
  });

  // Mutation hook for leaving the team
  const [leaveTeam, { loading: loadingLeave, data: leaveData }] = useMutation(
    LEAVE_TEAM_MUTATION,
    {
      variables: { teamId },
      onCompleted: (data) => {
        if (data.leaveTeam.success) {
          alert(data.leaveTeam.message);
          navigate("/search"); // Redirect the user after leaving the team
        } else {
          alert(`Error: ${data.leaveTeam.message}`);
        }
      },
    }
  );

  if (loadingTeam) return <p>Ładowanie danych...</p>;
  if (errorTeam) return <p>Błąd: {errorTeam.message}</p>;

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
          <button
            className="secondary-button"
            onClick={() => navigate("/search")}
          >
            Dołącz do drużyny
          </button>
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

  // Check if the current user is the captain of the team
  const isCaptain = team.captain.id === userId;

  return (
    <>
      <div className="container">
        <div className="team-info">
          {team.logo ? (
            <img src={`${MEDIA_URL}${team.logo}`} alt={`${team.name} logo`} />
          ) : (
            <div className="placeholder-logo">Brak logo</div>
          )}
          <div className="left-side">
            <h1>{team.name}</h1>
            <p>Liczba graczy: {team.players.length}</p>
            <p>Liczba meczów: {team.matchesCount}</p>
            <p>Miasto: {team.league.city.name}</p>
            <p>Liga: {team.league.name}</p>
            <p>Kapitan: {team?.captain?.username}</p>
          </div>
          <button
            className="leave-button"
            onClick={() => {
              if (window.confirm("Czy na pewno chcesz opuścić drużynę?")) {
                leaveTeam();
              }
            }}
            disabled={loadingLeave}
          >
            {loadingLeave ? "Opuszczanie drużyny..." : "Opuść drużynę"}{" "}
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>

          {isCaptain && (
            <button onClick={() => navigate("/editTeam")}>
              Edytuj drużynę
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={tabs === "squad" ? "active" : ""}
          onClick={() => setTabs("squad")}
        >
          Skład <FontAwesomeIcon icon={faUsers} />
        </button>
        <button
          className={tabs === "matches" ? "active" : ""}
          onClick={() => setTabs("matches")}
        >
          Mecze <FontAwesomeIcon icon={faFutbol} />
        </button>
      </div>
      <div className="second-container">
        {tabs === "squad" && (
          <>
            <h1>Gracze</h1>
            <table className="table">
              <thead>
                <tr>
                  <th>Zdjęcie</th>
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
                    const playerStats = playerStatsMap[player.username] || {};
                    return (
                      <tr key={player.id}>
                        <td>{player.im}</td>
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/profile/${player.id}`)}
                        >
                          {player.username}
                        </td>
                        <td>{player.position || "nieznana"}</td>
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
            <h1>Mecze</h1>
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
                {team.matches.map((match, index) => (
                  <tr key={index}>
                    <td>{match.matchDate}</td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                    >
                      <div style={{ padding: "5px", alignItems: "center" }}>
                        {match.homeTeam.name}
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
                      </div>
                    </td>
                    <td>
                      {match.scoreHome} : {match.scoreAway}
                    </td>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/team/${match.awayTeam.id}`)}
                    >
                      <div style={{ padding: "5px", alignItems: "center" }}>
                        {match.awayTeam.name}
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
                      </div>
                    </td>
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
          </>
        )}
      </div>
    </>
  );
};

export default Team;
