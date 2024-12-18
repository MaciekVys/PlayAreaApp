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
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import {
  MY_TEAM_QUERY,
  TEAM_STATISTICS_SUMMARY_QUERY,
} from "../queries/queries";
import { LEAVE_TEAM_MUTATION } from "../queries/mutations";
import noImage from "../images/noImage.png";

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

  // Compute the number of completed matches
  const completedMatchesCount = team?.matches?.filter(
    (match) => match?.status === "COMPLETED"
  ).length;

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
          navigate("/search");
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
  const isCaptain = team?.captain?.id === userId;

  return (
    <>
      <div className="container">
        <div className="team-info">
          {team.logo ? (
            <img src={`${MEDIA_URL}${team.logo}`} alt={`${team.name} logo`} />
          ) : (
            <div className="placeholder-photo">
              {" "}
              <img src={noImage} alt="No logo" />
            </div>
          )}
          <div className="left-side">
            <h1>{team.name}</h1>
            <p>Liczba graczy: {team.players.length}</p>
            <p>Liczba meczów: {completedMatchesCount}</p>
            <p>Miasto: {team.league.city.name}</p>
            <p>Liga: {team.league.name}</p>
            <p>Kapitan: {team?.captain?.username}</p>
          </div>

          {/* Button group for alignment */}
          <div className="button-group">
            <button
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
                Edytuj drużynę <FontAwesomeIcon icon={faGear} />
              </button>
            )}
          </div>
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
                  <th>MVP ⭐</th>
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan="6">Ładowanie statystyk...</td>
                  </tr>
                ) : errorStats ? (
                  <tr>
                    <td colSpan="6">
                      Błąd w ładowaniu statystyk: {errorStats.message}
                    </td>
                  </tr>
                ) : (
                  team.players.map((player) => {
                    const playerStats = playerStatsMap[player.username] || {};
                    return (
                      <tr key={player.id}>
                        <td>
                          {player.photo ? (
                            <img
                              style={{ height: "35px", width: "auto" }}
                              src={`${MEDIA_URL}${player.photo}`}
                              alt={`${player.username} photo`}
                            />
                          ) : (
                            <img
                              style={{ height: "35px", width: "auto" }}
                              src={noImage}
                              alt="No photo"
                            />
                          )}
                        </td>
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/profile/${player.id}`)}
                        >
                          {player.username}
                        </td>
                        <td>{player.position || "nieznana"}</td>
                        <td>{player.goals || 0}</td>
                        <td>{player.assists || 0}</td>
                        <td>{player.mvp || 0} </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div style={{ height: "50px" }}></div>
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
                {team.matches
                  .filter((match) => match.status === "COMPLETED") // Filtracja meczów
                  .map((match, index) => (
                    <tr key={index}>
                      <td>{match.matchDate}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/team/${match.homeTeam.id}`)}
                      >
                        <div style={{ padding: "5px", alignItems: "center" }}>
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
                        <div style={{ padding: "5px", alignItems: "center" }}>
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
                  ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ height: "50px" }}></div>
      </div>
    </>
  );
};

export default Team;
